import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from "../context/AuthContext";
import axios from 'axios';
import './feature/css/Login.css';
import SplashCursor from './feature/SplashCursor';
import '../styles/splash-cursor.css';

function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetStatus, setResetStatus] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    console.log('🔑 Login attempt started', {
      email: formData.email,
      timestamp: new Date().toISOString()
    });

    try {
      console.log('🔑 Attempting to login with:', { 
        email: formData.email,
        passwordLength: formData.password ? formData.password.length : 0
      });
      
      const result = await login(formData.email, formData.password);
      
      console.log('🔑 Login API response:', { 
        success: result.success, 
        error: result.error,
        message: result.message,
        hasToken: !!(result.token || result.data?.token)
      });
      
      if (result.success) {
        console.log('✅ Login successful, navigating to /feed');
        navigate('/feed');
      } else {
        // Handle specific error cases
        let errorMessage = 'Login failed. Please try again.';
        
        if (result.error === 'EMAIL_NOT_VERIFIED') {
          errorMessage = 'Please verify your email before logging in.';
        } else if (result.error === 'INVALID_CREDENTIALS') {
          errorMessage = 'Invalid email or password. Please try again.';
        } else if (result.message) {
          errorMessage = result.message;
        }
        
        console.error('❌ Login failed:', {
          error: result.error,
          message: result.message,
          debug: result.debug
        });
        
        setError(errorMessage);
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formRef = useRef(null);
  const [excludeSelector, setExcludeSelector] = useState('');

  const handleResetPassword = async () => {
    if (!resetEmail) {
      setResetStatus('Please enter your email address');
      return;
    }

    setLoading(true);
    setResetStatus('');
    
    try {
      const response = await axios.post('http://localhost:5000/api/auth/forgot-password', {
        email: resetEmail
      });
      
      if (response.data.success) {
        setResetStatus('Password reset link has been sent to your email.');
        setResetEmail('');
      } else {
        setResetStatus(response.data.message || 'Failed to send reset link');
      }
    } catch (error) {
      console.error('Password reset error:', error);
      setResetStatus(error.response?.data?.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Set the exclude selector to target the form and all its children
    setExcludeSelector('.login-form, .login-form *');
  }, []);

  return (
    <div className="login-container">
      <SplashCursor 
        excludeSelector=".login-form-container, .login-form-container *" 
      />
      <Link to="/" className="back-button"><i className="fas fa-arrow-left"></i></Link>
      <div className="login-left">
        <video autoPlay loop muted playsInline className="login-video">
          <source src="/videos/login_bg.mp4" type="video/mp4" />
          {'Your browser does not support the video tag.'}
        </video>
      </div>
      <div className="login-right">
        <div className="login-form-container">
          <h2>Cookiepedia</h2>
          <p>Log in to discover amazing cookie recipes.</p>
          <form onSubmit={handleSubmit} className="login-form" ref={formRef}>
            <input 
              type="email" 
              placeholder="Email" 
              required 
              name="email"
              value={formData.email} 
              onChange={handleChange} 
            />
            <input 
              type="password" 
              placeholder="Password" 
              required 
              name="password"
              value={formData.password} 
              onChange={handleChange} 
            />
            <button type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
          {error && <p className="error-message">{error}</p>}
          
          <div className="forgot-password">
            <button 
              type="button" 
              className="text-button"
              onClick={() => setShowForgotPassword(!showForgotPassword)}
            >
              Forgot Password?
            </button>
          </div>
          
          {showForgotPassword && (
            <div className="forgot-password-form">
              <h3>Reset Password</h3>
              <p>Enter your email and we'll send you a link to reset your password.</p>
              <input
                type="email"
                placeholder="Enter your email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                disabled={loading}
              />
              <button 
                type="button" 
                className="reset-button"
                onClick={handleResetPassword}
                disabled={!resetEmail || loading}
              >
                Send Reset Link
              </button>
              {resetStatus && <p className={resetStatus.includes('success') ? 'success-message' : 'error-message'}>{resetStatus}</p>}
            </div>
          )}
          
          <p className="signup-link">
            Don't have an account? <Link to="/signup">Sign up</Link>
          </p>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;
