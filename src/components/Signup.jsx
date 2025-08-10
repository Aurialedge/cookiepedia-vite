import React from 'react';
import { Link } from 'react-router-dom';
import './feature/css/Login.css';
import SplashCursor from './feature/SplashCursor';
import loginVideo from '../../videos/login_bg.mp4';

function Signup() {
  return (
    <div className="login-container">
      <SplashCursor />
      <Link to="/" className="back-button"><i className="fas fa-arrow-left"></i></Link>
      <div className="login-left">
        <video autoPlay loop muted playsInline className="login-video">
          <source src={loginVideo} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
      <div className="login-right">
        <div className="login-form-container">
          <h2>Cookiepedia</h2>
          <p>Create your account to start your cookie journey.</p>
          <form className="login-form">
            <input type="text" placeholder="Username" required />
            <input type="email" placeholder="Email" required />
            <input type="password" placeholder="Password" required />
            <button type="submit">Sign Up</button>
          </form>
          <p className="signup-link">
            Already have an account? <Link to="/login">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Signup;
