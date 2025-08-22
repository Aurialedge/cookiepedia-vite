import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import '../styles/Chatbot.css';

const SYSTEM_PROMPT = `You are "Cooky", a friendly and helpful cooking assistant for the Cookiepedia website. Your role is to assist users with:

1. Recipe questions and suggestions
2. Cooking techniques and tips
3. Ingredient substitutions
4. Meal planning and preparation
5. Baking advice and troubleshooting

Guidelines:
- Keep responses focused on cooking and baking topics
- If asked about non-cooking topics, politely steer the conversation back to cooking
- Be concise but informative
- Use markdown for better formatting (e.g., **bold** for important tips)
- If you don't know something, say so and suggest alternatives
- Never provide medical, legal, or financial advice

Example responses:
"I'd be happy to help with that! Could you tell me what ingredients you have on hand?"
"I specialize in cooking-related questions. Would you like help with a recipe or cooking technique?"
"For food safety reasons, I recommend following USDA guidelines for proper food handling."`;

function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: '👋 Hello! I\'m Cooky, your cooking assistant. How can I help you in the kitchen today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await axios.post('/api/chat', {
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...messages.slice(-4), // Keep conversation context manageable
          userMessage
        ]
      });

      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: response.data.reply 
      }]);
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error. Please try again later.'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="chatbot-container">
      <button 
        className="chatbot-toggle" 
        onClick={toggleChat}
        aria-label={isOpen ? 'Close chat' : 'Open chat'}
      >
        <img 
          src="https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExdnBpdnRieGQ2NTJ1Z2N5dG10N3h6eHphaGVhaXlrcjBobzNjNHBmZSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/S6q7p6G70qH6YVupi3/giphy.gif" 
          alt="Cooky chatbot icon" 
          className="chatbot-icon"
        />
      </button>
      
      {isOpen && (
        <div className="chatbot-window">
          <div className="chatbot-header">
            <h3>Chat with Cooky</h3>
            <button onClick={toggleChat} className="close-button" aria-label="Close chat">
              &times;
            </button>
          </div>
          
          <div className="chatbot-body">
            {messages.map((message, index) => (
              <div 
                key={index} 
                className={`message ${message.role}`}
                role={message.role === 'user' ? 'user-message' : 'assistant-message'}
              >
                {message.content}
              </div>
            ))}
            {isLoading && (
              <div className="message assistant typing">
                <span className="typing-indicator">•••</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          
          <form onSubmit={handleSendMessage} className="chatbot-footer">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me about cooking..."
              disabled={isLoading}
              aria-label="Type your message"
            />
            <button 
              type="submit" 
              disabled={isLoading || !input.trim()}
              aria-label="Send message"
            >
              {isLoading ? 'Sending...' : 'Send'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default Chatbot;
