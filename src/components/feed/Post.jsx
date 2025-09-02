import React, { useState, useEffect } from 'react';
import { FiHeart, FiMessageCircle, FiSend, FiBookmark, FiMoreHorizontal } from 'react-icons/fi';
import { motion } from 'framer-motion';

const Post = ({ post, onLike, onBookmark }) => {
  const [isLiked, setIsLiked] = useState(post.isLiked);
  const [isBookmarked, setIsBookmarked] = useState(post.isBookmarked);
  const [likeAnimation, setLikeAnimation] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState([]);

  // Handle like with animation
  const handleLike = () => {
    const newLikeState = !isLiked;
    setIsLiked(newLikeState);
    setLikeAnimation(true);
    onLike(post.id);
    
    // Reset animation
    setTimeout(() => setLikeAnimation(false), 1000);
  };

  // Handle bookmark toggle
  const handleBookmark = () => {
    const newBookmarkState = !isBookmarked;
    setIsBookmarked(newBookmarkState);
    onBookmark(post.id);
  };

  // Handle adding a new comment
  const handleAddComment = (e) => {
    e.preventDefault();
    if (comment.trim()) {
      const newComment = {
        id: Date.now(),
        author: 'You',
        text: comment,
        timeAgo: 'Just now'
      };
      setComments([...comments, newComment]);
      setComment('');
    }
  };

  // Format number to K or M if over 1000 or 1,000,000
  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  // Double tap to like
  const handleDoubleTap = () => {
    if (!isLiked) {
      handleLike();
    }
  };

  return (
    <div className="post">
      {/* Post Header */}
      <div className="post-header">
        <div className="flex items-center">
          <img 
            src={post.avatar} 
            alt={`${post.author}'s avatar`} 
            className="avatar" 
          />
          <div className="user-info">
            <h3 className="username">{post.author}</h3>
            <p className="time-ago">{post.timeAgo}</p>
          </div>
        </div>
        <button className="more-options">
          <FiMoreHorizontal />
        </button>
      </div>

      {/* Post Image with Double Tap to Like */}
      <div className="relative" onDoubleClick={handleDoubleTap}>
        <img 
          src={post.image} 
          alt="Post" 
          className="post-image cursor-pointer" 
          draggable="false"
        />
        {likeAnimation && (
          <motion.div 
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1.5, opacity: 0.8 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <FiHeart className="text-white text-6xl fill-current" />
          </motion.div>
        )}
      </div>

      {/* Post Actions */}
      <div className="post-actions">
        <button 
          className={`action-btn ${isLiked ? 'like' : ''}`}
          onClick={handleLike}
          aria-label={isLiked ? 'Unlike' : 'Like'}
        >
          <FiHeart className={isLiked ? 'fill-current' : ''} />
        </button>
        <button 
          className="action-btn"
          onClick={() => setShowComments(!showComments)}
          aria-label="Comments"
        >
          <FiMessageCircle />
        </button>
        <button className="action-btn" aria-label="Share">
          <FiSend />
        </button>
        <button 
          className={`action-btn bookmark ${isBookmarked ? 'bookmarked' : ''}`}
          onClick={handleBookmark}
          aria-label={isBookmarked ? 'Remove bookmark' : 'Save'}
        >
          <FiBookmark className={isBookmarked ? 'fill-current' : ''} />
        </button>
      </div>

      {/* Likes Count */}
      <p className="likes-count">{formatNumber(post.likes)} likes</p>

      {/* Caption */}
      <div className="post-caption">
        <span className="caption-username">{post.author}</span>
        <span>{post.caption}</span>
      </div>

      {/* Comments Preview */}
      {post.comments > 0 && (
        <button 
          className="post-comments"
          onClick={() => setShowComments(!showComments)}
        >
          View all {post.comments} comments
        </button>
      )}

      {/* Time Posted */}
      <p className="post-time">{post.timeAgo}</p>

      {/* Comments Section */}
      {showComments && (
        <div className="border-t border-gray-200 p-4">
          <div className="mb-4 max-h-48 overflow-y-auto">
            {comments.length === 0 ? (
              <p className="text-gray-500 text-sm">No comments yet. Be the first to comment!</p>
            ) : (
              comments.map(comment => (
                <div key={comment.id} className="mb-2">
                  <span className="font-semibold text-sm">{comment.author}</span>{' '}
                  <span className="text-sm">{comment.text}</span>
                </div>
              ))
            )}
          </div>
          <form onSubmit={handleAddComment} className="flex items-center">
            <input
              type="text"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1 text-sm border-0 focus:ring-0 focus:outline-none bg-transparent"
            />
            <button 
              type="submit" 
              className={`text-sm font-semibold ${comment.trim() ? 'text-blue-500' : 'text-blue-300'}`}
              disabled={!comment.trim()}
            >
              Post
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Post;
