import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import './Channel.css';

const EditChannel = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [channel, setChannel] = useState({
    name: '',
    description: '',
    avatar: '',
    coverPhoto: '',
    socialLinks: {
      youtube: '',
      instagram: '',
      twitter: '',
      tiktok: ''
    },
    preferences: {
      privacy: 'public',
      commentModeration: false
    }
  });

  useEffect(() => {
    const fetchChannel = async () => {
      try {
        const response = await axios.get(`/api/channels/user/${user._id}`);
        setChannel(prev => ({
          ...prev,
          ...response.data.channel,
          socialLinks: {
            ...prev.socialLinks,
            ...(response.data.channel.socialLinks || {})
          },
          preferences: {
            ...prev.preferences,
            ...(response.data.channel.preferences || {})
          }
        }));
      } catch (error) {
        console.error('Error fetching channel:', error);
        setError('Failed to load channel data');
      } finally {
        setLoading(false);
      }
    };

    if (user?._id) {
      fetchChannel();
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setChannel(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === 'checkbox' ? checked : value
        }
      }));
    } else {
      setChannel(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleImageUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await axios.post('/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setChannel(prev => ({
        ...prev,
        [type]: response.data.url
      }));
    } catch (error) {
      console.error('Error uploading image:', error);
      setError('Failed to upload image');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      await axios.put('/api/channels', channel);
      navigate(`/channel/${user._id}`);
    } catch (error) {
      console.error('Error updating channel:', error);
      setError('Failed to update channel. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="edit-channel loading">Loading...</div>;
  }

  return (
    <div className="edit-channel">
      <h1>Edit Channel</h1>
      
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-section">
          <h2>Basic Info</h2>
          
          <div className="form-group">
            <label>Channel Name</label>
            <input
              type="text"
              name="name"
              value={channel.name}
              onChange={handleChange}
              placeholder="Enter channel name"
              required
            />
          </div>
          
          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              value={channel.description}
              onChange={handleChange}
              placeholder="Tell viewers about your channel"
              rows="4"
            />
          </div>
        </div>
        
        <div className="form-section">
          <h2>Images</h2>
          
          <div className="form-group">
            <label>Profile Picture</label>
            <div className="image-upload">
              <img 
                src={channel.avatar || '/default-avatar.png'} 
                alt="Profile" 
                className="preview-image"
              />
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload(e, 'avatar')}
                className="file-input"
              />
              <button type="button" className="upload-btn">
                Change
              </button>
            </div>
          </div>
          
          <div className="form-group">
            <label>Banner Image</label>
            <div className="image-upload">
              <div 
                className="banner-preview"
                style={{ backgroundImage: `url(${channel.coverPhoto || '/default-banner.jpg'})` }}
              ></div>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload(e, 'coverPhoto')}
                className="file-input"
              />
              <button type="button" className="upload-btn">
                Change
              </button>
            </div>
          </div>
        </div>
        
        <div className="form-section">
          <h2>Social Links</h2>
          
          <div className="form-group">
            <label>YouTube</label>
            <div className="input-with-icon">
              <i className="fab fa-youtube"></i>
              <input
                type="url"
                name="socialLinks.youtube"
                value={channel.socialLinks.youtube}
                onChange={handleChange}
                placeholder="https://youtube.com/yourchannel"
              />
            </div>
          </div>
          
          <div className="form-group">
            <label>Instagram</label>
            <div className="input-with-icon">
              <i className="fab fa-instagram"></i>
              <input
                type="url"
                name="socialLinks.instagram"
                value={channel.socialLinks.instagram}
                onChange={handleChange}
                placeholder="https://instagram.com/yourusername"
              />
            </div>
          </div>
          
          <div className="form-group">
            <label>Twitter</label>
            <div className="input-with-icon">
              <i className="fab fa-twitter"></i>
              <input
                type="url"
                name="socialLinks.twitter"
                value={channel.socialLinks.twitter}
                onChange={handleChange}
                placeholder="https://twitter.com/yourusername"
              />
            </div>
          </div>
          
          <div className="form-group">
            <label>TikTok</label>
            <div className="input-with-icon">
              <i className="fab fa-tiktok"></i>
              <input
                type="url"
                name="socialLinks.tiktok"
                value={channel.socialLinks.tiktok}
                onChange={handleChange}
                placeholder="https://tiktok.com/@yourusername"
              />
            </div>
          </div>
        </div>
        
        <div className="form-section">
          <h2>Channel Settings</h2>
          
          <div className="form-group">
            <label>Privacy</label>
            <select 
              name="preferences.privacy" 
              value={channel.preferences.privacy}
              onChange={handleChange}
            >
              <option value="public">Public</option>
              <option value="private">Private</option>
              <option value="restricted">Restricted</option>
            </select>
          </div>
          
          <div className="form-group checkbox-group">
            <input
              type="checkbox"
              id="commentModeration"
              name="preferences.commentModeration"
              checked={channel.preferences.commentModeration}
              onChange={handleChange}
            />
            <label htmlFor="commentModeration">
              Hold potentially inappropriate comments for review
            </label>
          </div>
        </div>
        
        <div className="form-actions">
          <button 
            type="button" 
            className="cancel-btn"
            onClick={() => navigate(-1)}
            disabled={saving}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="save-btn"
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditChannel;
