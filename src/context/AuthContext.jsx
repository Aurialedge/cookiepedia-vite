import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token') || null);

  // Set auth token for axios
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem('token', token);
    } else {
      delete axios.defaults.headers.common['Authorization'];
      localStorage.removeItem('token');
    }
  }, [token]);

  // Check if user is logged in on mount
  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        // Use the protected endpoint to verify token and get user data
        const response = await axios.get('http://localhost:5000/api/protected');
        setCurrentUser(response.data.user);
      } catch (error) {
        console.error('Token verification failed:', error);
        setToken(null);
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };

    verifyToken();
  }, [token]);

  const login = async (email, password) => {
    try {
      console.log('Attempting login for:', email);
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        email,
        password
      });
      
      console.log('Login response:', response.data);
      
      if (response.data.success && response.data.token) {
        const { token, user } = response.data;
        console.log('Login successful, setting token and user:', { 
          userId: user._id, 
          email: user.email,
          hasToken: !!token 
        });
        
        // Set the token first
        setToken(token);
        // Then set the current user
        setCurrentUser(user);
        
        // Ensure token is stored in localStorage
        localStorage.setItem('token', token);
        
        return { 
          success: true, 
          user 
        };
      } else {
        const errorMessage = response.data.message || 'Login failed. Please check your credentials.';
        console.error('Login failed:', errorMessage);
        return { 
          success: false, 
          message: errorMessage,
          error: response.data.error
        };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Login failed. Please try again.';
      const errorType = error.response?.data?.error || 'LOGIN_ERROR';
      
      console.error('Login error:', {
        message: errorMessage,
        type: errorType,
        status: error.response?.status,
        data: error.response?.data
      });
      
      return { 
        success: false, 
        message: errorMessage,
        error: errorType
      };
    }
  };

  const logout = () => {
    setToken(null);
    setCurrentUser(null);
  };

  const value = {
    currentUser,
    token,
    login,
    logout,
    isAuthenticated: !!currentUser
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
