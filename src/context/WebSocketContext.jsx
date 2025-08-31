import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { toast } from 'react-toastify';

const WebSocketContext = createContext(null);

export const WebSocketProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [typingUsers, setTypingUsers] = useState({});
  const [activeConversation, setActiveConversation] = useState(null);

  // Initialize WebSocket connection
  useEffect(() => {
    if (!isAuthenticated || !user?._id) return;

    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${wsProtocol}//${window.location.host}/ws?token=${localStorage.getItem('token')}`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log('WebSocket connected');
      setIsConnected(true);
      // Notify server that user is online
      ws.send(JSON.stringify({ type: 'USER_ONLINE' }));
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('WebSocket message received:', data);
        
        switch (data.type) {
          case 'MESSAGE':
            handleNewMessage(data);
            break;
          case 'TYPING':
            handleTyping(data);
            break;
          case 'MESSAGE_READ':
            handleMessageRead(data);
            break;
          case 'NOTIFICATION':
            handleNotification(data);
            break;
          case 'USER_STATUS':
            handleUserStatus(data);
            break;
          default:
            console.warn('Unknown message type:', data.type);
        }
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
      }
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
      // Attempt to reconnect after a delay
      setTimeout(() => {
        setSocket(null);
      }, 5000);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      ws.close();
    };

    setSocket(ws);

    // Clean up on unmount
    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, [user?._id, isAuthenticated]);

  // Fetch initial unread count
  useEffect(() => {
    if (!isAuthenticated) return;
    
    const fetchUnreadCount = async () => {
      try {
        const response = await fetch('/api/notifications/unread-count', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setUnreadCount(data.count);
        }
      } catch (error) {
        console.error('Error fetching unread count:', error);
      }
    };
    
    fetchUnreadCount();
  }, [isAuthenticated]);

  const handleNewMessage = useCallback((data) => {
    const { message, conversationId } = data;
    
    // Only show notification if the message is not from the current conversation
    if (activeConversation !== conversationId) {
      // Show desktop notification if browser supports it
      if (Notification.permission === 'granted') {
        new Notification(`New message from ${message.sender?.username || 'Someone'}`, {
          body: message.content,
          icon: message.sender?.profilePicture
        });
      }
      
      // Update unread count
      setUnreadCount(prev => prev + 1);
      
      // Show toast notification
      toast.info(`New message from ${message.sender?.username || 'Someone'}`, {
        onClick: () => {
          // Navigate to the conversation
          window.location.href = `/messages/${conversationId}`;
        }
      });
    }
    
    // Emit custom event for message updates
    window.dispatchEvent(new CustomEvent('newMessage', { detail: data }));
  }, [activeConversation]);

  const handleTyping = useCallback((data) => {
    const { senderId, conversationId, isTyping } = data;
    
    setTypingUsers(prev => ({
      ...prev,
      [conversationId]: isTyping ? senderId : null
    }));
    
    // Clear typing indicator after 3 seconds
    if (isTyping) {
      setTimeout(() => {
        setTypingUsers(prev => ({
          ...prev,
          [conversationId]: null
        }));
      }, 3000);
    }
  }, []);

  const handleMessageRead = useCallback((data) => {
    // Emit custom event for message read updates
    window.dispatchEvent(new CustomEvent('messageRead', { detail: data }));
  }, []); 

  const handleNotification = useCallback((data) => {
    const { notification } = data;
    
    // Update unread count
    setUnreadCount(prev => prev + 1);
    
    // Show desktop notification if browser supports it
    if (Notification.permission === 'granted') {
      let notificationText = '';
      
      switch (notification.type) {
        case 'like':
          notificationText = `${notification.sender?.username} liked your post`;
          break;
        case 'comment':
          notificationText = `${notification.sender?.username} commented on your post`;
          break;
        case 'follow':
          notificationText = `${notification.sender?.username} started following you`;
          break;
        case 'mention':
          notificationText = `${notification.sender?.username} mentioned you`;
          break;
        default:
          notificationText = 'You have a new notification';
      }
      
      new Notification(notificationText, {
        icon: notification.sender?.profilePicture
      });
    }
    
    // Emit custom event for new notifications
    window.dispatchEvent(new CustomEvent('newNotification', { detail: notification }));
  }, []);

  const handleUserStatus = useCallback((data) => {
    // Update user status in the UI
    window.dispatchEvent(new CustomEvent('userStatus', { detail: data }));
  }, []);

  // Send typing indicator
  const sendTyping = useCallback((conversationId, isTyping) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({
        type: 'TYPING',
        conversationId,
        isTyping
      }));
    }
  }, [socket]);

  // Mark messages as read
  const markAsRead = useCallback(async (messageIds, conversationId) => {
    if (!Array.isArray(messageIds)) {
      messageIds = [messageIds];
    }
    
    try {
      const response = await fetch('/api/messages/mark-read', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ messageIds, conversationId })
      });
      
      if (response.ok) {
        // Update local state
        setUnreadCount(prev => Math.max(0, prev - messageIds.length));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error marking messages as read:', error);
      return false;
    }
  }, []);

  // Mark notification as read
  const markNotificationAsRead = useCallback(async (notificationId) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        setUnreadCount(prev => Math.max(0, prev - 1));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
  }, []);

  // Mark all notifications as read
  const markAllNotificationsAsRead = useCallback(async () => {
    try {
      const response = await fetch('/api/notifications/mark-all-read', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        setUnreadCount(0);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      return false;
    }
  }, []);

  return (
    <WebSocketContext.Provider
      value={{
        isConnected,
        unreadCount,
        typingUsers,
        sendTyping,
        markAsRead,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        setActiveConversation,
        setUnreadCount
      }}
    >
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};

// Request notification permission on page load
if (typeof window !== 'undefined' && 'Notification' in window) {
  if (Notification.permission !== 'denied') {
    Notification.requestPermission();
  }
}
