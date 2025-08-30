import React from 'react';
import Story from './Story';
import './Stories.css';

const Stories = () => {
  // Dummy data for now
  const stories = [
    { id: 1, author: 'Chef John', avatar: 'https://i.pravatar.cc/150?u=chefjohn' },
    { id: 2, author: 'Jane Doe', avatar: 'https://i.pravatar.cc/150?u=janedoe' },
    { id: 3, author: 'Peter Pan', avatar: 'https://i.pravatar.cc/150?u=peterpan' },
    { id: 4, author: 'Mary Poppins', avatar: 'https://i.pravatar.cc/150?u=marypoppins' },
    { id: 5, author: 'Chris Hemsworth', avatar: 'https://i.pravatar.cc/150?u=chrishemsworth' },
    { id: 6, author: 'John Wick', avatar: 'https://i.pravatar.cc/150?u=johnwick' },
  ];

  return (
    <div className="stories">
      {stories.map((story) => (
        <Story key={story.id} story={story} />
      ))}
    </div>
  );
};

export default Stories;
