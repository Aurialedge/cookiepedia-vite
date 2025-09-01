import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import './ChannelList.css';

const ChannelList = ({ type = 'following' }) => {
  const { userId } = useParams();
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const limit = 10;

  useEffect(() => {
    const fetchChannels = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/users/${userId}/${type}`, {
          params: { page, limit }
        });
        
        if (page === 1) {
          setChannels(response.data);
        } else {
          setChannels(prev => [...prev, ...response.data]);
        }
        
        setHasMore(response.data.length === limit);
      } catch (error) {
        console.error(`Error fetching ${type}:`, error);
        setError(`Failed to load ${type}`);
      } finally {
        setLoading(false);
      }
    };

    fetchChannels();
  }, [userId, type, page]);

  const loadMore = () => {
    setPage(prev => prev + 1);
  };

  if (loading && page === 1) {
    return <div className="channel-list loading">Loading {type}...</div>;
  }

  if (error) {
    return <div className="channel-list error">{error}</div>;
  }

  if (channels.length === 0) {
    return (
      <div className="channel-list empty">
        No {type} found.
      </div>
    );
  }

  return (
    <div className="channel-list">
      <div className="channel-grid">
        {channels.map(channel => (
          <Link 
            to={`/channel/${channel._id}`} 
            key={channel._id}
            className="channel-card"
          >
            <div className="channel-avatar">
              <img 
                src={channel.avatar || '/default-avatar.png'} 
                alt={channel.name} 
              />
            </div>
            <div className="channel-info">
              <h3>{channel.name}</h3>
              <p className="subscriber-count">
                {channel.subscriptionCount?.toLocaleString()} subscribers
              </p>
              {channel.description && (
                <p className="channel-description">
                  {channel.description.length > 100 
                    ? `${channel.description.substring(0, 100)}...` 
                    : channel.description}
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>
      
      {hasMore && (
        <div className="load-more">
          <button 
            onClick={loadMore} 
            disabled={loading}
            className="load-more-btn"
          >
            {loading ? 'Loading...' : 'Load More'}
          </button>
        </div>
      )}
    </div>
  );
};

export default ChannelList;
