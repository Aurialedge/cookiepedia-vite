import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Reels from '../components/reels/Reels';
import '../components/reels/Reels.css';

const ReelsPage = () => {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // You can add any necessary data fetching or state management here
  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="reels-loading">
        <div className="spinner"></div>
        <p>Loading reels...</p>
      </div>
    );
  }

  return (
    <div className="reels-page">
      <div className="reels-header">
        <h1>Reels</h1>
        <button 
          className="create-reel-btn"
          onClick={() => navigate('/create-reel')}
        >
          Create Reel
        </button>
      </div>
      
      <div className="reels-content">
        <Reels />
      </div>
    </div>
  );
};

export default ReelsPage;
