import React from 'react';
import { Link } from 'react-router-dom';
// import TargetCursor from './feature/TargetCursor';
import './feature/css/Login.css';
import SplashCursor from './feature/SplashCursor';
import loginVideo from '../../videos/login_bg.mp4';

function Login() {

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
          <p>Log in to discover amazing cookie recipes.</p>
          <form className="login-form">
            <input type="email" placeholder="Email" required />
            <input type="password" placeholder="Password" required />
            <button type="submit">Login</button>
          </form>
          <p className="signup-link">
            Don't have an account? <Link to="/signup">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
