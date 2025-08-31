import express from 'express';
import Message from '../models/Message.js';
import Conversation from '../models/Conversation.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Get all conversations for a user
router.get('/conversations/:userId', authenticate, async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.params.userId
    })
    .populate('participants', 'username avatar')
    .populate('lastMessage')
    .sort({ updatedAt: -1 });
    
    res.json(conversations);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get messages in a conversation
router.get('/:conversationId', authenticate, async (req, res) => {
  try {
    const messages = await Message.find({
      conversationId: req.params.conversationId
    }).sort({ createdAt: 1 });
    
    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Send a new message
router.post('/', authenticate, async (req, res) => {
  try {
    const { conversationId, content } = req.body;
    const senderId = req.user.userId;
    
    // Create new message
    const message = new Message({
      conversationId,
      sender: senderId,
      content,
      type: 'text'
    });
    
    await message.save();
    
    // Update conversation's last message and timestamp
    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: message._id,
      $addToSet: { participants: senderId } // Add sender to participants if not already
    }, { new: true });
    
    // Populate sender info before sending response
    await message.populate('sender', 'username avatar');
    
    res.status(201).json(message);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Start a new conversation
router.post('/conversations', authenticate, async (req, res) => {
  try {
    const { participantId } = req.body;
    const userId = req.user.userId;
    
    // Check if conversation already exists between these users
    let conversation = await Conversation.findOne({
      participants: { $all: [userId, participantId], $size: 2 }
    });
    
    if (!conversation) {
      // Create new conversation
      conversation = new Conversation({
        participants: [userId, participantId]
      });
      await conversation.save();
    }
    
    // Populate participants
    await conversation.populate('participants', 'username avatar');
    
    res.status(201).json(conversation);
  } catch (error) {
    console.error('Error creating conversation:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
