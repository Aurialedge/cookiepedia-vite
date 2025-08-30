import React, { useState } from 'react';
import Stories from './Stories';
import CreatePost from './CreatePost';
import Post from './Post';
import './Feed.css';

const Feed = () => {
  const [posts, setPosts] = useState([
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
  ]);

  const handlePost = (newPost) => {
    const postToAdd = {
      id: posts.length + 1,
      author: 'Current User', // This would be dynamic in a real app
      avatar: 'https://i.pravatar.cc/150?u=currentuser',
      ...newPost,
    };
    setPosts([postToAdd, ...posts]);
  };

  return (
            <div className="feed">
      <Stories />
      <CreatePost onPost={handlePost} />
      {posts.map((post) => (
        <Post key={post.id} post={post} />
      ))}
    </div>
  );
};

export default Feed;
