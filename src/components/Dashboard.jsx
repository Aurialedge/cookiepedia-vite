import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './feature/css/Dashboard.css';

function Dashboard() {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="dashboard-container">
      <nav className="dashboard-nav">
        <div className="nav-brand">
          <Link to="/dashboard">Cookiepedia</Link>
        </div>
        <div className="nav-links">
          <Link to="/dashboard/recipes">My Recipes</Link>
          <Link to="/dashboard/favorites">Favorites</Link>
          <Link to="/dashboard/profile">Profile</Link>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </nav>

      <main className="dashboard-main">
        <h1>Welcome back, {user?.username || 'Baker'}! 👋</h1>
        <div className="dashboard-stats">
          <div className="stat-card">
            <h3>My Recipes</h3>
            <p>12</p>
          </div>
          <div className="stat-card">
            <h3>Favorites</h3>
            <p>24</p>
          </div>
          <div className="stat-card">
            <h3>Baking Streak</h3>
            <p>3 days</p>
          </div>
        </div>

        <section className="recent-activity">
          <h2>Recent Activity</h2>
          <div className="activity-list">
            <div className="activity-item">
              <span className="activity-icon">👨‍🍳</span>
              <div className="activity-details">
                <p>You added a new recipe: <strong>Chocolate Chip Cookies</strong></p>
                <small>2 hours ago</small>
              </div>
            </div>
            <div className="activity-item">
              <span className="activity-icon">❤️</span>
              <div className="activity-details">
                <p>You liked <strong>Oatmeal Raisin Cookies</strong></p>
                <small>1 day ago</small>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Dashboard;
