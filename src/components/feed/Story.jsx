import React from 'react';

const Story = ({ story }) => {
  return (
    <div className="story">
      <div className="story-avatar-wrapper">
        <img src={story.avatar} alt={`${story.author}'s story`} className="story-avatar" />
      </div>
      <span className="story-author">{story.author}</span>
    </div>
  );
};

export default Story;
