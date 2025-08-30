import React from 'react';
import Post from './Post';
import './Feed.css';

const Feed = () => {
  // Dummy data for now
  const posts = [
    {
      id: 1,
      author: 'Chef John',
      avatar: 'https://i.pravatar.cc/150?u=chefjohn',
      image: '/images/Recipe1.webp',
      caption: 'Delicious homemade pizza!',
    },
    {
      id: 2,
      author: 'Jane Doe',
      avatar: 'https://i.pravatar.cc/150?u=janedoe',
      image: '/images/Recipe2.webp',
      caption: 'My favorite pasta recipe',
    },
  ];

  return (
    <div className="feed">
      {posts.map((post) => (
        <Post key={post.id} post={post} />
      ))}
    </div>
  );
};

export default Feed;
