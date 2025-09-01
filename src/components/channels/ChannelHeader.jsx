import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import './Channel.css';

const ChannelHeader = () => {
  const { channelId } = useParams();
  const { user } = useAuth();
  const [channel, setChannel] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchChannel = async () => {
      try {
        const response = await axios.get(`/api/channels/user/${channelId}`);
        setChannel(response.data.channel);
        
        // Check if current user is following this channel
        if (user && response.data.channel.subscribers) {
          const following = response.data.channel.subscribers.some(
            sub => sub._id === user._id
          );
          setIsFollowing(following);
        }
        
        // Check if current user is the owner
        if (user && response.data.channel.owner) {
          setIsOwner(response.data.channel.owner._id === user._id);
        }
      } catch (error) {
        console.error('Error fetching channel:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (channelId) {
      fetchChannel();
    }
  }, [channelId, user]);

  const handleFollow = async () => {
    try {
      if (!user) {
        // Redirect to login if not authenticated
        window.location.href = '/login';
        return;
      }

      if (isFollowing) {
        await axios.post(`/api/channels/unfollow/${channel.owner._id}`);
      } else {
        await axios.post(`/api/channels/follow/${channel.owner._id}`);
      }
      
      setIsFollowing(!isFollowing);
      
      // Update subscription count
      setChannel(prev => ({
        ...prev,
        subscriptionCount: isFollowing 
          ? prev.subscriptionCount - 1 
          : prev.subscriptionCount + 1
      }));
      
    } catch (error) {
      console.error('Error toggling follow:', error);
    }
  };

  if (isLoading) {
    return <div className="channel-header loading">Loading channel...</div>;
  }

  if (!channel) {
    return <div className="channel-header not-found">Channel not found</div>;
  }

  return (
    <div className="channel-header">
      <div className="channel-cover" 
           style={{ backgroundImage: `url(${channel.coverPhoto || '/default-cover.jpg'})` }}>
        {isOwner && (
          <button className="edit-cover-btn">
            <i className="fas fa-camera"></i> Edit Cover
          </button>
        )}
      </div>
      
      <div className="channel-info">
        <div className="channel-avatar">
          <img 
            src={channel.avatar || '/default-avatar.png'} 
            alt={channel.name} 
          />
          {isOwner && (
            <button className="edit-avatar-btn">
              <i className="fas fa-camera"></i>
            </button>
          )}
        </div>
        
        <div className="channel-details">
          <h1>{channel.name}</h1>
          <p className="channel-handle">@{channel.owner?.username}</p>
          
          <div className="channel-stats">
            <span>{channel.subscriptionCount} subscribers</span>
            <span>{channel.contentCount} videos</span>
          </div>
          
          <p className="channel-description">
            {channel.description || 'No description provided.'}
          </p>
          
          <div className="channel-actions">
            {!isOwner && (
              <button 
                className={`subscribe-btn ${isFollowing ? 'subscribed' : ''}`}
                onClick={handleFollow}
              >
                {isFollowing ? 'Subscribed' : 'Subscribe'}
              </button>
            )}
            
            {isOwner && (
              <Link to="/channel/edit" className="edit-channel-btn">
                <i className="fas fa-edit"></i> Edit Channel
              </Link>
            )}
            
            <button className="share-btn">
              <i className="fas fa-share-alt"></i> Share
            </button>
          </div>
        </div>
      </div>
      
      <nav className="channel-nav">
        <ul>
          <li className="active"><Link to={`/channel/${channelId}`}>Home</Link></li>
          <li><Link to={`/channel/${channelId}/videos`}>Videos</Link></li>
          <li><Link to={`/channel/${channelId}/playlists`}>Playlists</Link></li>
          <li><Link to={`/channel/${channelId}/about`}>About</Link></li>
        </ul>
      </nav>
    </div>
  );
};

export default ChannelHeader;
