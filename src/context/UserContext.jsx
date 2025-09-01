import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import axios from 'axios';

// Create context
const UserContext = createContext();

// Custom hook to use the user context
export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export const UserProvider = ({ children }) => {
  const { user: currentUser } = useAuth();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);

  // Fetch user data
  const fetchUser = async (username) => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/users/${username}`);
      setUser(response.data.user);
      setError(null);
      return response.data.user;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch user data');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Follow a user
  const followUser = async (userId) => {
    try {
      await axios.post(`/api/users/${userId}/follow`);
      
      // Optimistic update
      setUser(prev => ({
        ...prev,
        followersCount: prev.followersCount + 1,
        isFollowing: true
      }));
      
      // Add to current user's following list
      if (currentUser) {
        setFollowing(prev => [
          ...prev,
          { _id: userId, username: user.username, name: user.name, profilePicture: user.profilePicture }
        ]);
      }
      
      return true;
    } catch (err) {
      console.error('Error following user:', err);
      return false;
    }
  };

  // Unfollow a user
  const unfollowUser = async (userId) => {
    try {
      await axios.post(`/api/users/${userId}/unfollow`);
      
      // Optimistic update
      setUser(prev => ({
        ...prev,
        followersCount: Math.max(0, prev.followersCount - 1),
        isFollowing: false
      }));
      
      // Remove from current user's following list
      if (currentUser) {
        setFollowing(prev => prev.filter(u => u._id !== userId));
      }
      
      return true;
    } catch (err) {
      console.error('Error unfollowing user:', err);
      return false;
    }
  };

  // Toggle follow status
  const toggleFollow = async (userId) => {
    if (!currentUser) return false;
    
    try {
      const isFollowing = user?.isFollowing;
      
      if (isFollowing) {
        return await unfollowUser(userId);
      } else {
        return await followUser(userId);
      }
    } catch (err) {
      console.error('Error toggling follow status:', err);
      return false;
    }
  };

  // Fetch user's followers
  const fetchFollowers = async (userId, page = 1, limit = 10) => {
    try {
      const response = await axios.get(`/api/users/${userId}/followers`, {
        params: { page, limit }
      });
      
      if (page === 1) {
        setFollowers(response.data.followers);
      } else {
        setFollowers(prev => [...prev, ...response.data.followers]);
      }
      
      return response.data;
    } catch (err) {
      console.error('Error fetching followers:', err);
      throw err;
    }
  };

  // Fetch users that the user is following
  const fetchFollowing = async (userId, page = 1, limit = 10) => {
    try {
      const response = await axios.get(`/api/users/${userId}/following`, {
        params: { page, limit }
      });
      
      if (page === 1) {
        setFollowing(response.data.following);
      } else {
        setFollowing(prev => [...prev, ...response.data.following]);
      }
      
      return response.data;
    } catch (err) {
      console.error('Error fetching following:', err);
      throw err;
    }
  };

  // Search users
  const searchUsers = async (query, page = 1, limit = 10) => {
    try {
      const response = await axios.get('/api/users/search', {
        params: { query, page, limit }
      });
      return response.data;
    } catch (err) {
      console.error('Error searching users:', err);
      throw err;
    }
  };

  // Update user profile
  const updateProfile = async (profileData) => {
    try {
      const response = await axios.put('/api/users/profile', profileData);
      setUser(prev => ({ ...prev, ...response.data.user }));
      return response.data.user;
    } catch (err) {
      console.error('Error updating profile:', err);
      throw err;
    }
  };

  // Effect to set initial user data if currentUser is available
  useEffect(() => {
    if (currentUser) {
      setUser(currentUser);
      
      // Fetch initial followers and following
      fetchFollowers(currentUser._id).catch(console.error);
      fetchFollowing(currentUser._id).catch(console.error);
    } else {
      setUser(null);
      setFollowers([]);
      setFollowing([]);
    }
    setLoading(false);
  }, [currentUser]);

  const value = {
    user,
    loading,
    error,
    followers,
    following,
    fetchUser,
    followUser,
    unfollowUser,
    toggleFollow,
    fetchFollowers,
    fetchFollowing,
    searchUsers,
    updateProfile
  };

  return (
    <UserContext.Provider value={value}>
      {!loading && children}
    </UserContext.Provider>
  );
};

export default UserContext;
