import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useUser } from '../../context/UserContext';
import axios from 'axios';
import './FollowButton.css';

const FollowButton = ({ 
  userId, 
  isFollowing: isFollowingProp = false,
  onFollowChange,
  size = 'medium', 
  variant = 'default',
  className = ''
}) => {
  const { user: currentUser } = useAuth();
  const { toggleFollow } = useUser();
  const navigate = useNavigate();
  const [isFollowingState, setIsFollowingState] = useState(isFollowingProp);
  const [isLoading, setIsLoading] = useState(false);

  // Sync with prop changes
  useEffect(() => {
    setIsFollowingState(isFollowingProp);
  }, [isFollowingProp]);

  const handleClick = async () => {
    if (!currentUser) {
      navigate('/login', { state: { from: window.location.pathname } });
      return;
    }

    if (userId === currentUser._id) {
      return; // Can't follow yourself
    }

    setIsLoading(true);

    try {
      const success = await toggleFollow(userId);
      
      if (success !== undefined) {
        setIsFollowingState(success);
        if (onFollowChange) onFollowChange(success);
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
      // Revert state on error
      setIsFollowingState(!isFollowingState);
    } finally {
      setIsLoading(false);
    }
  };

  // Don't show the button if it's the current user's profile
  if (currentUser?._id === userId) {
    return null;
  }

  const buttonClass = `follow-button ${size} ${variant} ${
    isFollowingState ? 'following' : ''
  } ${isLoading ? 'loading' : ''} ${className}`.trim();

  return (
    <button
      className={buttonClass}
      onClick={handleClick}
      disabled={isLoading}
      aria-label={isFollowingState ? 'Unfollow' : 'Follow'}
    >
      {isLoading ? (
        <span className="spinner"></span>
      ) : isFollowingState ? (
        <>
          <span className="following-text">Following</span>
          <span className="unfollow-text">Unfollow</span>
        </>
      ) : (
        'Follow'
      )}
    </button>
  );
};

export default FollowButton;
