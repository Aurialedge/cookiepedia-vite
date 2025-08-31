import { WebSocketServer } from 'ws';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from './config.js';
import Message from './models/Message.js';
import Conversation from './models/Conversation.js';
import Notification from './models/Notification.js';

const clients = new Map();

const initializeWebSocket = (server) => {
  const wss = new WebSocketServer({ server });

  wss.on('connection', (ws, req) => {
    // Extract token from query params
    const token = new URL(req.url, 'http://localhost').searchParams.get('token');
    
    try {
      // Verify JWT token
      const decoded = jwt.verify(token, JWT_SECRET);
      const userId = decoded.userId;
      
      // Store the WebSocket connection
      clients.set(userId, ws);
      
      // Handle incoming messages
      ws.on('message', (message) => {
        handleMessage(userId, JSON.parse(message));
      });
      
      // Handle disconnection
      ws.on('close', () => {
        clients.delete(userId);
      });
      
      console.log(`User ${userId} connected`);
    } catch (error) {
      console.error('WebSocket authentication failed:', error);
      ws.close(1008, 'Authentication failed');
    }
  });

  return wss;
};

const handleMessage = async (senderId, message) => {
  const { type, conversationId, recipientId, content, messageId } = message;
  
  try {
    switch (type) {
      case 'MESSAGE': {
        // Create and save the message
        const newMessage = new Message({
          conversation: conversationId,
          sender: senderId,
          content,
          readBy: [senderId]
        });
        
        const savedMessage = await newMessage.save();
        
        // Update conversation's last message and timestamp
        await Conversation.findByIdAndUpdate(conversationId, {
          lastMessage: savedMessage._id,
          updatedAt: new Date()
        });
        
        // Broadcast the message to the recipient if online
        broadcastMessage(senderId, recipientId, {
          type: 'MESSAGE',
          message: savedMessage,
          conversationId
        });
        
        // Create a notification for the recipient
        const notification = new Notification({
          user: recipientId,
          type: 'message',
          sender: senderId,
          message: savedMessage._id,
          conversation: conversationId
        });
        
        await notification.save();
        
        // Send notification to recipient if online
        notifyUser(recipientId, {
          type: 'NOTIFICATION',
          notification: {
            _id: notification._id,
            type: 'message',
            sender: notification.sender,
            read: notification.read,
            createdAt: notification.createdAt
          }
        });
        
        break;
      }
        
      case 'MESSAGE_READ': {
        // Mark message as read
        await Message.findByIdAndUpdate(messageId, {
          $addToSet: { readBy: senderId }
        });
        
        // Notify the sender that their message was read
        const msg = await Message.findById(messageId);
        if (msg) {
          notifyUser(msg.sender, {
            type: 'MESSAGE_READ',
            messageId,
            readBy: [...msg.readBy, senderId],
            conversationId
          });
        }
        break;
      }
        
      case 'TYPING':
        // Notify recipient that sender is typing
        notifyTyping(senderId, recipientId, conversationId);
        break;
        
      default:
        console.warn('Unknown message type:', type);
    }
  } catch (error) {
    console.error('Error handling message:', error);
  }
};

const broadcastMessage = (senderId, recipientId, data) => {
  // Add timestamp
  const message = {
    ...data,
    timestamp: new Date().toISOString()
  };

  // Send to recipient if online
  const recipientClient = clients.get(recipientId);
  if (recipientClient && recipientClient.readyState === 1) {
    recipientClient.send(JSON.stringify(message));
  }
  
  // Also send back to sender for their own UI update
  const senderClient = clients.get(senderId);
  if (senderClient && senderClient.readyState === 1) {
    senderClient.send(JSON.stringify({
      ...message,
      isOwnMessage: true
    }));
  }
};

// Helper to send a message to a specific user
const notifyUser = (userId, data) => {
  const client = clients.get(userId);
  if (client && client.readyState === 1) {
    client.send(JSON.stringify({
      ...data,
      timestamp: new Date().toISOString()
    }));
  }
};

const notifyTyping = (senderId, recipientId, conversationId) => {
  const typingMessage = {
    type: 'TYPING',
    senderId,
    conversationId,
    isTyping: true,
    timestamp: new Date().toISOString()
  };
  
  const recipientClient = clients.get(recipientId);
  if (recipientClient && recipientClient.readyState === 1) {
    recipientClient.send(JSON.stringify(typingMessage));
  }
};

// Handle user going online/offline
const updateUserStatus = (userId, isOnline) => {
  // Notify user's connections about status change
  const statusUpdate = {
    type: 'USER_STATUS',
    userId,
    isOnline,
    lastSeen: isOnline ? null : new Date().toISOString()
  };
  
  // In a real app, you would get the user's connections/friends
  // and notify them about the status change
  // For now, we'll just log it
  console.log(`User ${userId} is now ${isOnline ? 'online' : 'offline'}`);
};

// Clean up disconnected clients
const cleanupClients = () => {
  for (const [userId, client] of clients.entries()) {
    if (client.readyState === 3) { // CLOSED
      clients.delete(userId);
      updateUserStatus(userId, false);
    }
  }
};

// Run cleanup every 30 seconds
setInterval(cleanupClients, 30000);

export { 
  initializeWebSocket, 
  broadcastMessage, 
  notifyUser,
  updateUserStatus 
};
