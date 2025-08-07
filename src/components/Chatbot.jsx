import React, { useState } from 'react';

function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="chatbot-container">
      <button className="chatbot-toggle" onClick={toggleChat}>
        <img src="https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExdnBpdnRieGQ2NTJ1Z2N5dG10N3h6eHphaGVhaXlrcjBobzNjNHBmZSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/S6q7p6G70qH6YVupi3/giphy.gif" alt="Cooky chatbot icon" style={{ width: '100%', height: '100%', borderRadius: '50%' }} />
      </button>
      {isOpen && (
        <div className="chatbot-window">
          <div className="chatbot-header">
            <p>Chat with Cooky</p>
            <button onClick={toggleChat}>X</button>
          </div>
          <div className="chatbot-body">
            <p>Hello! How can I help you with your cookie cravings today?</p>
          </div>
          <div className="chatbot-footer">
            <input type="text" placeholder="Type a message..." />
            <button>Send</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Chatbot;
