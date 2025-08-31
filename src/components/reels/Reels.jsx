import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaHeart, FaComment, FaShare, FaMusic, FaPause, FaPlay } from 'react-icons/fa';
import axios from 'axios';
import './Reels.css';

const Reels = () => {
  const [reels, setReels] = useState([]);
  const [currentReelIndex, setCurrentReelIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [liked, setLiked] = useState({});
  const [showComments, setShowComments] = useState(false);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState({});
  const videoRefs = useRef([]);
  const containerRef = useRef(null);
  const navigate = useNavigate();

  // Fetch reels data
  useEffect(() => {
    const fetchReels = async () => {
      try {
        const response = await axios.get('/api/reels');
        setReels(response.data);
        
        // Initialize liked state for each reel
        const initialLikedState = {};
        response.data.forEach(reel => {
          initialLikedState[reel._id] = false; // You might want to check against user's liked reels
        });
        setLiked(initialLikedState);
      } catch (error) {
        console.error('Error fetching reels:', error);
      }
    };

    fetchReels();
  }, []);

  // Handle scroll for reels
  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      
      const container = containerRef.current;
      const scrollPosition = container.scrollTop + container.clientHeight / 2;
      
      // Find which reel is currently in view
      for (let i = 0; i < videoRefs.current.length; i++) {
        const videoElement = videoRefs.current[i];
        if (!videoElement) continue;
        
        const rect = videoElement.getBoundingClientRect();
        const videoTop = rect.top + window.pageYOffset - container.offsetTop;
        const videoBottom = videoTop + rect.height;
        
        if (scrollPosition >= videoTop && scrollPosition <= videoBottom) {
          if (currentReelIndex !== i) {
            // Pause previous video
            if (videoRefs.current[currentReelIndex]) {
              videoRefs.current[currentReelIndex].pause();
            }
            
            // Play new video
            setCurrentReelIndex(i);
            videoRefs.current[i].play().catch(e => console.error('Error playing video:', e));
            setIsPlaying(true);
          }
          break;
        }
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      
      // Initial check
      handleScroll();
      
      return () => {
        container.removeEventListener('scroll', handleScroll);
      };
    }
  }, [reels.length, currentReelIndex]);

  // Fetch comments for a reel
  const fetchComments = async (reelId) => {
    if (comments[reelId]) return; // Already fetched
    
    try {
      const response = await axios.get(`/api/reels/${reelId}/comments`);
      setComments(prev => ({
        ...prev,
        [reelId]: response.data
      }));
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const togglePlayPause = () => {
    if (!videoRefs.current[currentReelIndex]) return;
    
    if (isPlaying) {
      videoRefs.current[currentReelIndex].pause();
    } else {
      videoRefs.current[currentReelIndex].play().catch(e => console.error('Error playing video:', e));
    }
    setIsPlaying(!isPlaying);
  };

  const handleLike = async (reelId) => {
    try {
      // Optimistic update
      setLiked(prev => ({
        ...prev,
        [reelId]: !prev[reelId]
      }));
      
      // Update in database
      await axios.post(`/api/reels/${reelId}/like`);
      
      // Update local state with new like count
      setReels(prev => 
        prev.map(reel => 
          reel._id === reelId 
            ? { 
                ...reel, 
                likes: liked[reelId] ? reel.likes - 1 : reel.likes + 1 
              } 
            : reel
        )
      );
    } catch (error) {
      console.error('Error toggling like:', error);
      // Revert optimistic update on error
      setLiked(prev => ({
        ...prev,
        [reelId]: !prev[reelId]
      }));
    }
  };

  const handleCommentSubmit = async (e, reelId) => {
    e.preventDefault();
    if (!comment.trim()) return;
    
    try {
      const response = await axios.post(`/api/reels/${reelId}/comments`, { text: comment });
      
      // Update local state with new comment
      setComments(prev => ({
        ...prev,
        [reelId]: [response.data, ...(prev[reelId] || [])]
      }));
      
      // Update comment count
      setReels(prev => 
        prev.map(reel => 
          reel._id === reelId 
            ? { ...reel, commentCount: reel.commentCount + 1 } 
            : reel
        )
      );
      
      setComment('');
    } catch (error) {
      console.error('Error posting comment:', error);
    }
  };

  const toggleComments = (reelId) => {
    if (!showComments) {
      fetchComments(reelId);
    }
    setShowComments(!showComments);
  };

  return (
    <div className="reels-container" ref={containerRef}>
      {reels.map((reel, index) => (
        <div 
          key={reel._id} 
          className="reel"
          ref={el => videoRefs.current[index] = el?.querySelector('video')}
        >
          <div className="video-container">
            <video
              src={reel.videoUrl}
              loop
              muted
              playsInline
              onClick={togglePlayPause}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            />
            
            {!isPlaying && currentReelIndex === index && (
              <div className="play-pause-overlay" onClick={togglePlayPause}>
                <FaPlay size={48} color="white" />
              </div>
            )}
            
            <div className="video-info">
              <div className="user-info">
                <img 
                  src={reel.user.avatar} 
                  alt={reel.user.username} 
                  className="user-avatar"
                  onClick={() => navigate(`/profile/${reel.user._id}`)}
                />
                <span className="username">@{reel.user.username}</span>
                <button className="follow-btn">Follow</button>
              </div>
              
              <div className="caption">
                <p>{reel.caption}</p>
              </div>
              
              <div className="music-info">
                <FaMusic />
                <span>{reel.music || 'Original Audio'}</span>
              </div>
            </div>
            
            <div className="action-buttons">
              <div className="action" onClick={() => handleLike(reel._id)}>
                <FaHeart size={28} color={liked[reel._id] ? '#ff3040' : 'white'} />
                <span>{reel.likes || 0}</span>
              </div>
              
              <div className="action" onClick={() => toggleComments(reel._id)}>
                <FaComment size={28} color="white" />
                <span>{reel.commentCount || 0}</span>
              </div>
              
              <div className="action">
                <FaShare size={28} color="white" />
                <span>Share</span>
              </div>
              
              <div className="action">
                <div className="reel-avatar">
                  <img src={reel.user.avatar} alt={reel.user.username} />
                </div>
              </div>
            </div>
          </div>
          
          {showComments && currentReelIndex === index && (
            <div className="comments-panel">
              <div className="comments-header">
                <h4>Comments ({reel.commentCount || 0})</h4>
                <button onClick={() => setShowComments(false)}>×</button>
              </div>
              
              <div className="comments-list">
                {comments[reel._id]?.map(comment => (
                  <div key={comment._id} className="comment">
                    <img 
                      src={comment.user.avatar} 
                      alt={comment.user.username} 
                      className="comment-avatar"
                      onClick={() => navigate(`/profile/${comment.user._id}`)}
                    />
                    <div className="comment-content">
                      <span className="comment-username">{comment.user.username}</span>
                      <p>{comment.text}</p>
                      <div className="comment-actions">
                        <span>{new Date(comment.createdAt).toLocaleDateString()}</span>
                        <button>Reply</button>
                        <button>Like</button>
                      </div>
                    </div>
                  </div>
                )) || <div className="loading-comments">Loading comments...</div>}
              </div>
              
              <form onSubmit={(e) => handleCommentSubmit(e, reel._id)} className="comment-form">
                <input
                  type="text"
                  placeholder="Add a comment..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
                <button type="submit" disabled={!comment.trim()}>Post</button>
              </form>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default Reels;
