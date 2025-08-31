import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useWebSocket } from '../context/WebSocketContext';
import ChatList from '../components/messaging/ChatList';
import ChatWindow from '../components/messaging/ChatWindow';
import { toast } from 'react-toastify';
import { FiMessageSquare, FiArrowLeft } from 'react-icons/fi';
import '../components/messaging/Messaging.css';

const Messages = () => {
  const [selectedChat, setSelectedChat] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showSidebar, setShowSidebar] = useState(true);
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 768);
  
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { markAsRead, sendMessage, sendTypingStatus } = useWebSocket();

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobileView(mobile);
      if (!mobile) {
        setShowSidebar(true);
      } else if (selectedChat) {
        setShowSidebar(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [selectedChat]);

  // Fetch conversations
  const fetchConversations = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/messages/conversations', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to load conversations');
      }

      const data = await response.json();
      setConversations(data.conversations || []);

      // If URL has a conversationId, select that conversation
      if (conversationId) {
        const conversation = data.conversations?.find(c => c._id === conversationId);
        if (conversation) {
          setSelectedChat(conversation);
          if (isMobileView) setShowSidebar(false);
        }
      }
    } catch (err) {
      console.error('Error fetching conversations:', err);
      setError(err.message);
      toast.error('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  }, [conversationId, isMobileView]);

  // Initial fetch
  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Handle new message from WebSocket
  useEffect(() => {
    const handleNewMessage = (message) => {
      setConversations(prev => {
        const updated = [...prev];
        const convoIndex = updated.findIndex(c => c._id === message.conversationId);
        
        if (convoIndex > -1) {
          // Update last message and move to top
          const updatedConvo = {
            ...updated[convoIndex],
            lastMessage: message,
            updatedAt: new Date().toISOString(),
            unreadCount: message.sender !== currentUser?._id 
              ? (updated[convoIndex].unreadCount || 0) + 1 
              : 0
          };
          
          updated.splice(convoIndex, 1);
          return [updatedConvo, ...updated];
        }
        return prev;
      });
    };

    window.addEventListener('newMessage', (e) => handleNewMessage(e.detail));
    return () => window.removeEventListener('newMessage', (e) => handleNewMessage(e.detail));
  }, [currentUser?._id]);

  // Update conversation when new message is received
  const handleNewMessageReceived = (event) => {
    const { message, conversationId } = event.detail;
    
    setConversations(prev => 
      prev.map(conv => {
        if (conv._id === conversationId) {
          return {
            ...conv,
            lastMessage: message,
            updatedAt: new Date().toISOString(),
            unreadCount: selectedChat?._id === conversationId ? 0 : (conv.unreadCount || 0) + 1
          };
        }
        return conv;
      })
    );
  };

  useEffect(() => {
    window.addEventListener('newMessage', handleNewMessageReceived);
    return () => {
      window.removeEventListener('newMessage', handleNewMessageReceived);
    };
  }, [selectedChat]);

  const handleSelectChat = useCallback((conversation) => {
    setSelectedChat(conversation);
    navigate(`/messages/${conversation._id}`, { replace: true });
    
    // Mark messages as read if there are unread messages
    if (conversation.unreadCount > 0) {
      markAsRead(conversation._id);
      
      // Update local state to reflect read status
      setConversations(prev => 
        prev.map(c => 
          c._id === conversation._id 
            ? { ...c, unreadCount: 0 }
            : c
        )
      );
    }
    
    // On mobile, hide sidebar when chat is selected
    if (isMobileView) {
      setShowSidebar(false);
    }
  }, [navigate, markAsRead, isMobileView]);

  const handleBackToConversations = () => {
    setSelectedChat(null);
    navigate('/messages', { replace: true });
    if (isMobileView) {
      setShowSidebar(true);
    }
  };

  const handleNewMessage = async (content, conversationId) => {
    try {
      await sendMessage({
        conversationId,
        content,
        recipientId: selectedChat?.participants?.find(p => p._id !== currentUser?._id)?._id
      });
      
      // Update the conversation's last message in the list
      setConversations(prev => {
        const updated = [...prev];
        const convoIndex = updated.findIndex(c => c._id === conversationId);
        
        if (convoIndex > -1) {
          const updatedConvo = {
            ...updated[convoIndex],
            lastMessage: {
              content,
              sender: currentUser?._id,
              createdAt: new Date().toISOString()
            },
            updatedAt: new Date().toISOString()
          };
          
          updated.splice(convoIndex, 1);
          return [updatedConvo, ...updated];
        }
        return prev;
      });
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };

  // Toggle sidebar on mobile
  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };

  return (
    <div className={`messages-container ${isMobileView ? 'mobile' : ''}`}>
      {/* Mobile header */}
      {isMobileView && selectedChat && (
        <div className="mobile-chat-header">
          <button 
            className="back-button" 
            onClick={handleBackToConversations}
            aria-label="Back to conversations"
          >
            <FiArrowLeft size={24} />
          </button>
          <h3>
            {selectedChat.participants?.find(p => p._id !== currentUser?._id)?.fullName || 
             selectedChat.participants?.find(p => p._id !== currentUser?._id)?.username ||
             'Chat'}
          </h3>
        </div>
      )}
      
      {/* Mobile toggle button */}
      {isMobileView && !selectedChat && (
        <button 
          className="mobile-menu-button"
          onClick={toggleSidebar}
          aria-label="Toggle conversations"
        >
          <FiMessageSquare size={24} />
        </button>
      )}
      
      <div className={`chat-list-container ${showSidebar ? 'active' : ''}`}>
        <ChatList 
          conversations={conversations}
          onSelectChat={handleSelectChat}
          activeChat={selectedChat?._id}
          loading={loading}
          error={error}
        />
      </div>
      
      <div className={`chat-window-container ${selectedChat ? 'active' : ''}`}>
        {selectedChat ? (
          <ChatWindow 
            conversation={selectedChat}
            onBack={handleBackToConversations}
            onSendMessage={handleNewMessage}
            onTyping={sendTypingStatus}
          />
        ) : (
          <div className="no-chat-selected">
            <div className="icon">💬</div>
            <h3>Select a conversation</h3>
            <p>Choose an existing chat or start a new one</p>
            {isMobileView && (
              <button 
                className="show-conversations-button"
                onClick={toggleSidebar}
              >
                Show Conversations
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;
