import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { BsCheck2All, BsCheck2 } from 'react-icons/bs';
import { IoMdSend } from 'react-icons/io';
import './Messaging.css';

const ChatList = ({ conversations = [], onSelectChat, activeChat, loading, error }) => {
  const { currentUser } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  // Filter conversations based on search query
  const filteredConversations = conversations.filter(conversation => {
    if (!conversation.participants) return false;
    
    const otherUser = conversation.participants.find(
      p => p._id !== currentUser?._id
    );
    
    if (!otherUser) return false;
    
    const searchLower = searchQuery.toLowerCase();
    return (
      otherUser.username?.toLowerCase().includes(searchLower) ||
      otherUser.fullName?.toLowerCase().includes(searchLower) ||
      conversation.lastMessage?.content?.toLowerCase().includes(searchLower)
    );
  });

  // Format last message time
  const formatTime = (dateString) => {
    if (!dateString) return '';
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  };

  // Truncate long messages
  const truncate = (text, length = 30) => {
    if (!text) return '';
    return text.length > length ? `${text.substring(0, length)}...` : text;
  };

  // Handle new conversation
  const handleNewConversation = () => {
    navigate('/messages/new');
  };

  if (loading) {
    return (
      <div className="chat-list">
        <div className="chat-list-header">
          <h3>Messages</h3>
        </div>
        <div className="loading-conversations">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="conversation-skeleton">
              <div className="avatar-skeleton" />
              <div className="content-skeleton">
                <div className="header-skeleton" />
                <div className="message-skeleton" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="chat-list error">
        <div className="error-message">
          <p>Failed to load conversations. Please try again.</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-list">
      <div className="chat-list-header">
        <h3>Messages</h3>
        <button 
          className="new-chat-btn"
          onClick={handleNewConversation}
          aria-label="New message"
        >
          <IoMdSend size={20} />
        </button>
      </div>
      
      <div className="search-conversations">
        <input
          type="text"
          placeholder="Search messages"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      
      <div className="conversations">
        {filteredConversations.length === 0 ? (
          <div className="no-conversations">
            {searchQuery ? (
              <p>No conversations match your search.</p>
            ) : (
              <p>No conversations yet. Start a new one!</p>
            )}
          </div>
        ) : (
          filteredConversations.map((conversation) => {
            if (!conversation.participants) return null;
            
            const otherUser = conversation.participants.find(
              p => p._id !== currentUser?._id
            );
            
            if (!otherUser) return null;
            
            const isActive = activeChat === conversation._id;
            const isUnread = conversation.unreadCount > 0;
            const isLastMessageFromMe = conversation.lastMessage?.sender === currentUser?._id;
            
            return (
              <div 
                key={conversation._id}
                className={`conversation ${isActive ? 'active' : ''} ${isUnread ? 'unread' : ''}`}
                onClick={() => onSelectChat(conversation)}
              >
                <div className="avatar">
                  <img 
                    src={otherUser.profilePicture || '/default-avatar.png'} 
                    alt={otherUser.username} 
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/default-avatar.png';
                    }}
                  />
                  {otherUser.isOnline && <span className="online-indicator" />}
                </div>
                <div className="conversation-info">
                  <div className="conversation-header">
                    <h4>{otherUser.fullName || otherUser.username}</h4>
                    <span className="time-ago">
                      {formatTime(conversation.lastMessage?.createdAt || conversation.updatedAt)}
                    </span>
                  </div>
                  <div className="last-message">
                    {isLastMessageFromMe && (
                      <span className="message-status">
                        {conversation.lastMessage?.readBy?.length > 1 ? (
                          <BsCheck2All className="read" />
                        ) : (
                          <BsCheck2 className="sent" />
                        )}
                      </span>
                    )}
                    <p className={isUnread ? 'unread' : ''}>
                      {truncate(conversation.lastMessage?.content || 'No messages yet')}
                    </p>
                    {isUnread && conversation.unreadCount > 0 && (
                      <span className="unread-count">
                        {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ChatList;
