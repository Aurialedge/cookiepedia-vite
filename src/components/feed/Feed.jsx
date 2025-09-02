import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiHeart, FiMessageCircle, FiSend, FiBookmark, FiMoreHorizontal } from 'react-icons/fi';
import Stories from './Stories';
import CreatePost from './CreatePost';
import Post from './Post';
import './Feed.css';

const Feed = () => {
  const [posts, setPosts] = useState([
    {
      id: 1,
      author: 'Chef John',
      username: '@chefjohn',
      avatar: 'https://i.pravatar.cc/150?u=chefjohn',
      image: '/images/Recipe1.webp',
      caption: 'Delicious homemade pizza! 🍕 Made with fresh ingredients from the local market. #homemade #pizza',
      likes: 124,
      comments: 28,
      timeAgo: '2h ago',
      isLiked: false,
      isBookmarked: false
    },
    {
      id: 2,
      author: 'Jane Doe',
      username: '@janedoe',
      avatar: 'https://i.pravatar.cc/150?u=janedoe',
      image: '/images/Recipe2.jpg',
      caption: 'My favorite pasta recipe from Italy! Perfectly al dente with homemade sauce. #pastalover #foodie',
      likes: 89,
      comments: 14,
      timeAgo: '4h ago',
      isLiked: true,
      isBookmarked: true
    },
  ]);

  const handlePost = (newPost) => {
    const postToAdd = {
      id: posts.length + 1,
      author: 'Current User',
      username: '@currentuser',
      avatar: 'https://i.pravatar.cc/150?u=currentuser',
      likes: 0,
      comments: 0,
      timeAgo: 'Just now',
      isLiked: false,
      isBookmarked: false,
      ...newPost,
    };
    setPosts([postToAdd, ...posts]);
  };

  const handleLike = (postId) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { 
            ...post, 
            isLiked: !post.isLiked,
            likes: post.isLiked ? post.likes - 1 : post.likes + 1
          } 
        : post
    ));
  };

  const handleBookmark = (postId) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { ...post, isBookmarked: !post.isBookmarked } 
        : post
    ));
  };

  // Auto-update time ago
  useEffect(() => {
    const timer = setInterval(() => {
      setPosts(currentPosts => 
        currentPosts.map(post => {
          // This is a simplified version - in a real app, you'd calculate actual time difference
          return post;
        })
      );
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="feed">
      <Stories />
      <CreatePost onPost={handlePost} />
      
      <AnimatePresence>
        {posts.map((post) => (
          <motion.div
            key={post.id}
            className="post-container"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Post 
              post={post} 
              onLike={handleLike} 
              onBookmark={handleBookmark} 
            />
          </motion.div>
        ))}
      </AnimatePresence>
      
      <style jsx global>{`
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }
        
        .like-animation {
          animation: pulse 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default Feed;
