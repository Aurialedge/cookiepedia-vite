import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useWebSocket } from '../../context/WebSocketContext';
import { formatDistanceToNow } from 'date-fns';
import { BsCheck2All, BsCheck2, BsEmojiSmile, BsPaperclip } from 'react-icons/bs';
import { IoSend } from 'react-icons/io5';
import './Messaging.css';

const ChatWindow = ({ conversation, onBack }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState({});
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState(null);
  
  const { currentUser } = useAuth();
  const { sendMessage, markAsRead, sendTypingStatus } = useWebSocket();
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const typingTimeout = useRef(null);
  
  // Get the other participant in the conversation
  const otherParticipant = conversation?.participants?.find(
    p => p._id !== currentUser?._id
  );

  // Fetch messages when conversation changes
  useEffect(() => {
    if (!conversation?._id) return;

    const fetchMessages = async () => {
      try {
        const response = await fetch(`/api/messages/${conversation._id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) throw new Error('Failed to fetch messages');
        
        const data = await response.json();
        setMessages(data);
        
        // Mark messages as read
        if (data.length > 0) {
          const unreadMessages = data.filter(
            msg => !msg.readBy?.includes(currentUser?._id) && msg.sender !== currentUser?._id
          );
          
          if (unreadMessages.length > 0) {
            markAsRead(conversation._id, unreadMessages.map(msg => msg._id));
          }
        }
      } catch (err) {
        console.error('Error fetching messages:', err);
        setError('Failed to load messages. Please try again.');
      }
    };

    fetchMessages();
  }, [conversation?._id, currentUser?._id, markAsRead]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typingUsers]);

  // Handle incoming WebSocket messages
  useEffect(() => {
    if (!conversation?._id) return;

    const handleNewMessage = (message) => {
      if (message.conversationId === conversation._id) {
        setMessages(prev => [...prev, message]);
        if (message.sender !== currentUser?._id) {
          markAsRead(conversation._id, [message._id]);
        }
      }
    };

    const handleTyping = ({ userId, isTyping: typing, conversationId }) => {
      if (conversationId === conversation._id && userId !== currentUser?._id) {
        setTypingUsers(prev => ({
          ...prev,
          [userId]: typing
        }));

        if (typing) {
          clearTimeout(typingTimeout.current);
          typingTimeout.current = setTimeout(() => {
            setTypingUsers(prev => ({
              ...prev,
              [userId]: false
            }));
          }, 3000);
        }
      }
    };

    window.addEventListener('newMessage', (e) => handleNewMessage(e.detail));
    window.addEventListener('typingStatus', (e) => handleTyping(e.detail));

    return () => {
      window.removeEventListener('newMessage', (e) => handleNewMessage(e.detail));
      window.removeEventListener('typingStatus', (e) => handleTyping(e.detail));
      clearTimeout(typingTimeout.current);
    };
  }, [conversation?._id, currentUser?._id, markAsRead]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    const messageContent = newMessage.trim();
    
    if (!messageContent || !conversation?._id || isSending) return;
    
    setIsSending(true);
    setError(null);
    
    try {
      const message = {
        conversationId: conversation._id,
        content: messageContent,
        recipientId: otherParticipant?._id
      };
      
      await sendMessage(message);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  const handleTyping = () => {
    if (!isTyping) {
      setIsTyping(true);
      sendTypingStatus(conversation._id, true);
    }
    
    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      if (isTyping) {
        setIsTyping(false);
        sendTypingStatus(conversation._id, false);
      }
    }, 2000);
  };

  const renderMessageStatus = (message) => {
    if (message.sender !== currentUser?._id) return null;
    
    if (message.readBy?.length > 1) {
      return <BsCheck2All className="message-status read" />;
    } else if (message.delivered) {
      return <BsCheck2All className="message-status delivered" />;
    } else {
      return <BsCheck2 className="message-status sent" />;
    }
  };

  const formatMessageTime = (dateString) => {
    if (!dateString) return '';
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  };

  if (!conversation) {
    return (
      <div className="chat-window empty">
        <div className="empty-state">
          <div className="icon">💬</div>
          <h3>No conversation selected</h3>
          <p>Select a conversation or start a new one</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-window">
      <div className="chat-header">
        <button className="back-button" onClick={onBack} aria-label="Back to conversations">
          <span>←</span>
        </button>
        <div className="user-info">
          <div className="user-info">
            <div className="avatar">
              <img 
                src={otherParticipant?.profilePicture || '/default-avatar.png'} 
                alt={otherParticipant?.username}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/default-avatar.png';
                }}
              />
              {otherParticipant?.isOnline && <span className="online-indicator" />}
            </div>
            <div>
              <h3>{otherParticipant?.fullName || otherParticipant?.username}</h3>
              {typingUsers[otherParticipant?._id] ? (
                <span className="typing-indicator">typing...</span>
              ) : otherParticipant?.isOnline ? (
                <span className="status-text">Online</span>
              ) : (
                <span className="status-text">
                  Last seen {formatMessageTime(otherParticipant?.lastSeen)}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <div className="messages">
        {messages.length === 0 ? (
          <div className="empty-conversation">
            <p>No messages yet. Say hello! 👋</p>
          </div>
        ) : (
          messages.map((message) => (
            <div 
              key={message._id} 
              className={`message ${message.sender === currentUser?._id ? 'sent' : 'received'}`}
            >
              <div className="message-content">
                <p>{message.content}</p>
                <div className="message-footer">
                  <span className="timestamp">
                    {formatMessageTime(message.createdAt)}
                  </span>
                  {renderMessageStatus(message)}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <form onSubmit={handleSendMessage} className="message-form">
        <div className="message-input-container">
          <button 
            type="button" 
            className="emoji-button" 
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            aria-label="Add emoji"
          >
            <BsEmojiSmile />
          </button>
          
          <input
            type="text"
            ref={inputRef}
            value={newMessage}
            onChange={(e) => {
              setNewMessage(e.target.value);
              handleTyping();
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            disabled={isSending}
          />
          
          <button 
            type="button" 
            className="attach-button"
            onClick={() => fileInputRef.current?.click()}
            aria-label="Attach file"
          >
            <BsPaperclip />
          </button>
          
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: 'none' }}
            onChange={handleFileUpload}
          />
          
          <button 
            type="submit" 
            className="send-button"
            disabled={!newMessage.trim() || isSending}
            aria-label="Send message"
          >
            <IoSend />
          </button>
        </div>
        
        {showEmojiPicker && (
          <div className="emoji-picker">
            <Picker 
              onEmojiClick={onEmojiClick}
              disableSearchBar
              disableSkinTonePicker
              native
            />
          </div>
        )}
        
        {error && <div className="error-message">{error}</div>}
      </form>
    </div>
  );
};

export default ChatWindow;
