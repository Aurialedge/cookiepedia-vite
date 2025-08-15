import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './feature/css/Signup.css';
import SplashCursor from './feature/SplashCursor';

function Signup() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    verificationCode: ''
  });
  const [step, setStep] = useState('signup'); // 'signup' or 'verify'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    // Basic validation
    if (!formData.username.trim() || !formData.email.trim() || !formData.password) {
      setError('All fields are required');
      return;
    }

    if (!validateEmail(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post('http://localhost:5000/api/auth/signup', {
        username: formData.username,
        email: formData.email,
        password: formData.password
      });
      
      setMessage(response.data.message || 'Verification code sent to your email');
      setStep('verify');
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerification = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!formData.verificationCode) {
      setError('Please enter the verification code');
      return;
    }

    try {
      setLoading(true);
      // First verify the email
      await axios.post('http://localhost:5000/api/auth/verify-email', {
        email: formData.email,
        code: formData.verificationCode
      });
      
      // Then automatically log the user in
      const loginResult = await login(formData.email, formData.password);
      
      if (loginResult.success) {
        setMessage('Email verified successfully! Redirecting to dashboard...');
        setTimeout(() => {
          navigate('/dashboard');
        }, 1000);
      } else {
        // If auto-login fails, redirect to login page
        setMessage('Email verified! Please log in with your credentials.');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    } catch (err) {
      console.error('Verification error:', err);
      setError(err.response?.data?.message || 'Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderSignupForm = () => (
    <form className="signup-form" onSubmit={handleSignup}>
      <input
        type="text"
        name="username"
        placeholder="Username"
        value={formData.username}
        onChange={handleChange}
        required
      />
      <input
        type="email"
        name="email"
        placeholder="Email"
        value={formData.email}
        onChange={handleChange}
        required
      />
      <input
        type="password"
        name="password"
        placeholder="Password (min 8 characters)"
        value={formData.password}
        onChange={handleChange}
        required
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Signing Up...' : 'Sign Up'}
      </button>
    </form>
  );

  const renderVerificationForm = () => (
    <form className="signup-form" onSubmit={handleVerification}>
      <div className="verification-message">
        <p>We've sent a verification code to {formData.email}</p>
        <p>Please check your inbox and enter the code below:</p>
      </div>
      <input
        type="text"
        name="verificationCode"
        placeholder="Enter 6-digit code"
        value={formData.verificationCode}
        onChange={handleChange}
        maxLength={6}
        required
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Verifying...' : 'Verify Email'}
      </button>
      <button 
        type="button" 
        className="resend-code"
        onClick={handleSignup}
        disabled={loading}
      >
        Resend Code
      </button>
    </form>
  );

  return (
    <div className="signup-container">
      <SplashCursor excludeSelector="form, form *" />
      <Link to="/" className="back-button">
        <i className="fas fa-arrow-left"></i>
      </Link>
      <div className="signup-left">
        <video autoPlay loop muted playsInline className="signup-video">
          <source src="/videos/login_bg.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
      <div className="signup-right">
        <div className="signup-form-container">
          <h2>Cookiepedia</h2>
          <p>{step === 'signup' ? 'Create your account to start your cookie journey.' : 'Verify your email address'}</p>
          
          {error && <div className="alert alert-error">{error}</div>}
          {message && <div className="alert alert-success">{message}</div>}
          
          {step === 'signup' ? renderSignupForm() : renderVerificationForm()}
          
          <p className="login-link">
            Already have an account? <Link to="/login">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Signup;
