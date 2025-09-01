import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useAuth } from '../context/AuthContext';
import FollowButton from '../components/common/FollowButton';
import '../styles/ProfilePage.css';

const ProfilePage = () => {
  const { username } = useParams();
  const { user: currentUser } = useAuth();
  const { 
    user, 
    loading, 
    error, 
    fetchUser, 
    followers, 
    following, 
    fetchFollowers,
    fetchFollowing,
    toggleFollow
  } = useUser();
  
  const [activeTab, setActiveTab] = useState('posts');
  const [isCurrentUser, setIsCurrentUser] = useState(false);
  const navigate = useNavigate();

  // Fetch user data when username changes
  useEffect(() => {
    if (username) {
      fetchUser(username);
    }
  }, [username, fetchUser]);

  // Check if the profile belongs to the current user
  useEffect(() => {
    if (currentUser && user) {
      setIsCurrentUser(currentUser._id === user._id);
    } else {
      setIsCurrentUser(false);
    }
  }, [currentUser, user]);

  // Handle follow/unfollow
  const handleFollow = async () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    
    try {
      await toggleFollow(user._id);
    } catch (err) {
      console.error('Error toggling follow:', err);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="profile-loading">
        <div className="spinner"></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="profile-error">
        <h2>Error loading profile</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()} className="retry-button">
          Try Again
        </button>
      </div>
    );
  }

  // User not found
  if (!user) {
    return (
      <div className="profile-not-found">
        <h2>User not found</h2>
        <p>The user you're looking for doesn't exist or has been removed.</p>
        <Link to="/" className="home-link">Go to Home</Link>
      </div>
    );
  }

  return (
    <div className="profile-container">
      {/* Profile Header */}
      <div className="profile-header">
        <div className="profile-cover">
          <img 
            src={user.coverPhoto || '/default-cover.jpg'} 
            alt={`${user.username}'s cover`} 
            className="cover-photo"
          />
          
          {isCurrentUser && (
            <Link to="/settings" className="edit-profile-button">
              <i className="fas fa-cog"></i> Edit Profile
            </Link>
          )}
        </div>
        
        <div className="profile-info">
          <div className="profile-avatar">
            <img 
              src={user.profilePicture || '/default-avatar.png'} 
              alt={user.username} 
            />
          </div>
          
          <div className="profile-details">
            <div className="profile-name">
              <h1>{user.name || user.username}</h1>
              {!isCurrentUser && (
                <div className="profile-actions">
                  <FollowButton 
                    userId={user._id} 
                    isFollowing={user.isFollowing}
                    onToggleFollow={handleFollow}
                  />
                  <button className="message-button">
                    <i className="fas fa-paper-plane"></i> Message
                  </button>
                </div>
              )}
              {isCurrentUser && (
                <Link to="/settings" className="edit-profile-button-mobile">
                  <i className="fas fa-cog"></i> Edit Profile
                </Link>
              )}
            </div>
            
            <div className="profile-stats">
              <div className="stat">
                <strong>{user.postsCount || 0}</strong>
                <span>Posts</span>
              </div>
              <Link to={`/${user.username}/followers`} className="stat">
                <strong>{user.followersCount || 0}</strong>
                <span>Followers</span>
              </Link>
              <Link to={`/${user.username}/following`} className="stat">
                <strong>{user.followingCount || 0}</strong>
                <span>Following</span>
              </Link>
            </div>
            
            <div className="profile-bio">
              <h3>{user.name}</h3>
              {user.bio && <p>{user.bio}</p>}
              {user.website && (
                <a 
                  href={user.website.startsWith('http') ? user.website : `https://${user.website}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="website-link"
                >
                  {user.website}
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Profile Navigation */}
      <div className="profile-nav">
        <button 
          className={`nav-item ${activeTab === 'posts' ? 'active' : ''}`}
          onClick={() => setActiveTab('posts')}
        >
          <i className="fas fa-th"></i> Posts
        </button>
        <button 
          className={`nav-item ${activeTab === 'saved' ? 'active' : ''}`}
          onClick={() => setActiveTab('saved')}
        >
          <i className="far fa-bookmark"></i> Saved
        </button>
        <button 
          className={`nav-item ${activeTab === 'tagged' ? 'active' : ''}`}
          onClick={() => setActiveTab('tagged')}
        >
          <i className="far fa-user"></i> Tagged
        </button>
      </div>
      
      {/* Profile Content */}
      <div className="profile-content">
        {activeTab === 'posts' && (
          <div className="posts-grid">
            {user.posts && user.posts.length > 0 ? (
              user.posts.map(post => (
                <div key={post._id} className="post-thumbnail">
                  <img src={post.images[0]} alt={`Post by ${user.username}`} />
                  <div className="post-overlay">
                    <span><i className="fas fa-heart"></i> {post.likesCount || 0}</span>
                    <span><i className="fas fa-comment"></i> {post.commentsCount || 0}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-posts">
                <div className="no-posts-icon">
                  <i className="fas fa-camera"></i>
                </div>
                <h3>No Posts Yet</h3>
                {isCurrentUser ? (
                  <p>Share your first photo or video</p>
                ) : (
                  <p>When {user.username} shares photos and videos, they'll appear here.</p>
                )}
                {isCurrentUser && (
                  <Link to="/create/post" className="create-post-button">
                    Share Your First Photo
                  </Link>
                )}
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'saved' && (
          <div className="saved-posts">
            <h3>Saved Posts</h3>
            {/* Saved posts content */}
          </div>
        )}
        
        {activeTab === 'tagged' && (
          <div className="tagged-posts">
            <h3>Tagged Posts</h3>
            {/* Tagged posts content */}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
