import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from "../context/AuthContext";
import './feature/css/Login.css';
import SplashCursor from './feature/SplashCursor';

function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
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

    try {
      const result = await login(formData.email, formData.password);
      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.message || 'Login failed. Please try again.');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('An error occurred during login. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <SplashCursor excludeSelector="form, form *" />
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
          <form className="login-form" onSubmit={handleSubmit}>
            <input 
              type="email" 
              placeholder="Email" 
              required 
              value={formData.email} 
              onChange={(e) => setFormData({ ...formData, email: e.target.value })} 
            />
            <input 
              type="password" 
              placeholder="Password" 
              required 
              value={formData.password} 
              onChange={(e) => setFormData({ ...formData, password: e.target.value })} 
            />
            <button type="submit" disabled={loading}>Login</button>
            {error && <p style={{ color: 'red' }}>{error}</p>}
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
