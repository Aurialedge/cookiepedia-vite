import { useState, useEffect, useCallback } from 'react';
import { useWebSocket } from '../context/WebSocketContext';
import { toast } from 'react-toastify';

export const useMessaging = (conversationId) => {
  const { sendTyping, typingUsers } = useWebSocket();
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [error, setError] = useState(null);
  const [sending, setSending] = useState(false);
  const [typingUser, setTypingUser] = useState(null);

  // Load messages for the conversation
  const loadMessages = useCallback(async (pageNum = 1, append = false) => {
    if (!conversationId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(
        `/api/messages?conversationId=${conversationId}&page=${pageNum}&limit=20`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to load messages');
      }
      
      const data = await response.json();
      
      if (append) {
        setMessages(prev => [...data.messages, ...prev]);
      } else {
        setMessages(data.messages);
      }
      
      setHasMore(data.messages.length === 20);
      setPage(pageNum);
      
      // Mark messages as read
      const unreadMessages = data.messages
        .filter(msg => !msg.readBy?.includes(localStorage.getItem('userId')))
        .map(msg => msg._id);
        
      if (unreadMessages.length > 0) {
        markAsRead(unreadMessages);
      }
      
    } catch (err) {
      console.error('Error loading messages:', err);
      setError(err.message);
      toast.error('Failed to load messages');
    } finally {
      setIsLoading(false);
    }
  }, [conversationId]);

  // Load more messages for infinite scroll
  const loadMoreMessages = useCallback(() => {
    if (!isLoading && hasMore) {
      loadMessages(page + 1, true);
    }
  }, [isLoading, hasMore, page, loadMessages]);

  // Send a new message
  const sendMessage = useCallback(async (content) => {
    if (!conversationId || !content.trim()) return;
    
    setSending(true);
    
    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          conversationId,
          content
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to send message');
      }
      
      const newMessage = await response.json();
      
      // Optimistically update the UI
      setMessages(prev => [...prev, newMessage]);
      
      return newMessage;
    } catch (err) {
      console.error('Error sending message:', err);
      toast.error('Failed to send message');
      throw err;
    } finally {
      setSending(false);
      // Reset typing indicator
      sendTyping(conversationId, false);
    }
  }, [conversationId, sendTyping]);

  // Mark messages as read
  const markAsRead = useCallback(async (messageIds) => {
    if (!conversationId || !messageIds || messageIds.length === 0) return;
    
    try {
      await fetch('/api/messages/mark-read', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          messageIds: Array.isArray(messageIds) ? messageIds : [messageIds],
          conversationId
        })
      });
      
      // Update local state to mark messages as read
      setMessages(prev => 
        prev.map(msg => 
          messageIds.includes(msg._id) 
            ? { ...msg, readBy: [...(msg.readBy || []), localStorage.getItem('userId')] }
            : msg
        )
      );
      
      return true;
    } catch (err) {
      console.error('Error marking messages as read:', err);
      return false;
    }
  }, [conversationId]);

  // Handle typing indicator
  const handleTypingChange = useCallback((isTyping) => {
    if (isTyping !== isTyping) {
      setIsTyping(isTyping);
      sendTyping(conversationId, isTyping);
    }
  }, [conversationId, isTyping, sendTyping]);

  // Listen for new messages
  useEffect(() => {
    const handleNewMessage = (event) => {
      const { message, conversationId: msgConversationId } = event.detail;
      
      if (msgConversationId === conversationId) {
        setMessages(prev => {
          // Check if message already exists
          if (prev.some(m => m._id === message._id)) return prev;
          
          return [...prev, message];
        });
        
        // Mark as read if it's the active conversation
        markAsRead(message._id);
      }
    };
    
    window.addEventListener('newMessage', handleNewMessage);
    
    return () => {
      window.removeEventListener('newMessage', handleNewMessage);
    };
  }, [conversationId, markAsRead]);
  
  // Listen for typing indicators
  useEffect(() => {
    if (typingUsers[conversationId]) {
      setTypingUser(typingUsers[conversationId]);
      
      // Clear typing indicator after 3 seconds
      const timer = setTimeout(() => {
        setTypingUser(null);
      }, 3000);
      
      return () => clearTimeout(timer);
    } else {
      setTypingUser(null);
    }
  }, [typingUsers, conversationId]);
  
  // Load initial messages
  useEffect(() => {
    if (conversationId) {
      loadMessages(1, false);
    } else {
      setMessages([]);
    }
  }, [conversationId, loadMessages]);

  return {
    messages,
    isLoading,
    error,
    hasMore,
    sending,
    typingUser,
    sendMessage,
    loadMoreMessages,
    markAsRead,
    handleTypingChange
  };
};
