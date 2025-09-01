import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import './UserProfile.css';

const UserProfile = () => {
  const { username } = useParams();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/users/username/${username}`);
        const { user, channel } = response.data;
        
        setProfile({
          ...user,
          channel
        });
        
        setIsFollowing(
          currentUser && 
          user.followers && 
          user.followers.includes(currentUser._id)
        );
        
        setIsOwner(currentUser && currentUser._id === user._id);
      } catch (error) {
        console.error('Error fetching profile:', error);
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    if (username) {
      fetchProfile();
    }
  }, [username, currentUser]);

  const handleFollow = async () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    try {
      if (isFollowing) {
        await axios.post(`/api/channels/unfollow/${profile._id}`);
      } else {
        await axios.post(`/api/channels/follow/${profile._id}`);
      }
      
      setIsFollowing(!isFollowing);
      
      // Update followers count optimistically
      setProfile(prev => ({
        ...prev,
        followersCount: isFollowing 
          ? prev.followersCount - 1 
          : prev.followersCount + 1
      }));
      
    } catch (error) {
      console.error('Error toggling follow:', error);
      setError('Failed to update follow status');
    }
  };

  if (loading) {
    return <div className="profile-loading">Loading profile...</div>;
  }

  if (error || !profile) {
    return <div className="profile-error">{error || 'Profile not found'}</div>;
  }

  return (
    <div className="user-profile">
      <div className="profile-header">
        <div className="profile-cover" 
             style={{ backgroundImage: `url(${profile.channel?.coverPhoto || '/default-cover.jpg'})` }}>
          {isOwner && (
            <Link to="/channel/edit" className="edit-profile-btn">
              <i className="fas fa-edit"></i> Edit Profile
            </Link>
          )}
        </div>
        
        <div className="profile-info">
          <div className="profile-avatar">
            <img 
              src={profile.avatar || '/default-avatar.png'} 
              alt={profile.username} 
            />
          </div>
          
          <div className="profile-details">
            <h1>{profile.name || `@${profile.username}`}</h1>
            <p className="profile-username">@{profile.username}</p>
            
            <div className="profile-stats">
              <Link to={`/${profile.username}/following`} className="stat-item">
                <strong>{profile.followingCount || 0}</strong> Following
              </Link>
              <Link to={`/${profile.username}/followers`} className="stat-item">
                <strong>{profile.followersCount || 0}</strong> Followers
              </Link>
              {profile.channel && (
                <Link to={`/channel/${profile._id}`} className="stat-item">
                  <strong>{profile.channel.subscriptionCount || 0}</strong> Subscribers
                </Link>
              )}
            </div>
            
            <p className="profile-bio">
              {profile.bio || 'No bio available.'}
            </p>
            
            {profile.website && (
              <a 
                href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="profile-website"
              >
                <i className="fas fa-link"></i> {profile.website}
              </a>
            )}
            
            {!isOwner && (
              <button 
                className={`follow-btn ${isFollowing ? 'following' : ''}`}
                onClick={handleFollow}
              >
                {isFollowing ? 'Following' : 'Follow'}
              </button>
            )}
          </div>
        </div>
      </div>
      
      <div className="profile-content">
        <nav className="profile-nav">
          <ul>
            <li className="active"><Link to={`/${username}`}>Posts</Link></li>
            <li><Link to={`/${username}/reels`}>Reels</Link></li>
            <li><Link to={`/${username}/saved`}>Saved</Link></li>
            <li><Link to={`/${username}/tagged`}>Tagged</Link></li>
          </ul>
        </nav>
        
        <div className="profile-posts">
          {/* Posts will be rendered here */}
          <div className="empty-posts">
            <div className="empty-icon">
              <i className="far fa-images"></i>
            </div>
            <h3>No Posts Yet</h3>
            <p>When you share photos and videos, they'll appear on your profile.</p>
            {isOwner && (
              <Link to="/create" className="create-post-btn">
                Share your first photo
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
