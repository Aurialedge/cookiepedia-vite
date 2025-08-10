import React from 'react';
import './css/InfoSection.css';

const InfoSection = () => {
  return (
    <div className="info-section">
      <h2 className="info-title">What is Cookiepedia?</h2>
      <p className="info-text">
        Cookiepedia is an AI-powered social cooking platform designed for discovery and creation. Create your profile, upload and share your favorite recipes, and discover new dishes based on ingredients, chefs, or our smart recommendations. Our AI-driven assistant is here to guide you every step of the way.
      </p>
      <div className="problem-solver-section">
        <h3 className="problem-solver-title">Empowering Creators, Inspiring Cooks</h3>
        <div className="problems-container">
          <div className="problem-card">
            <h4>Cure for Recipe Chaos</h4>
            <p>Tired of scattered platforms? We bring everything together with powerful personalization and AI assistance, so you find what you need, when you need it.</p>
          </div>
          <div className="problem-card">
            <h4>A Home for Creators</h4>
            <p>We provide a unified platform for cooking creators to build their brand, share their content, and engage with a passionate community.</p>
          </div>
          <div className="problem-card">
            <h4>Guidance for Every Cook</h4>
            <p>Whether you're a beginner or a pro, find recipes perfectly matched to your available ingredients and skill level. No more guesswork.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InfoSection;
