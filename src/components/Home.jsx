import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ImageTrail from './feature/ImageTrail';
import AnimatedHeadline from './feature/AnimatedHeadline';
import InfiniteScroll from './feature/InfiniteScroll';
import AnimatedList from './feature/AnimatedList';
import InfoSection from './feature/InfoSection';
import SearchBar from './SearchBar';
import './feature/css/Filters.css';


const trendingRecipes = [
  { content: 'Spicy Chocolate Chip Cookies' },
  { content: 'Lemon & Lavender Shortbread' },
  { content: 'Rosemary-Infused Snickerdoodles' },
  { content: 'Matcha White Chocolate Macarons' },
  { content: 'Cardamom & Pistachio Biscotti' },
  { content: 'Gingerbread People' },
  { content: 'Classic Oatmeal Raisin' },
  { content: 'Peanut Butter Blossoms' },
  { content: 'Salted Caramel Cookies' },
  { content: 'Double Chocolate Brownies' },
  { content: 'Vanilla Bean Macaroons' },
  { content: 'Cinnamon Sugar Snaps' }
];

const mediaItems = [
  { type: 'image', src: 'images/Recipe1.avif' },
  { type: 'video', src: 'videos/reel1.mp4' },
  { type: 'image', src: 'images/Recipe3.avif' },
  { type: 'video', src: 'videos/reel2.mp4' },
  { type: 'image', src: 'images/Recipe5.avif' },
  { type: 'video', src: 'videos/reel3.mp4' },
  { type: 'image', src: 'images/Recipe7.avif' },
  { type: 'image', src: 'images/Recipe8.avif' },
];

function Home() {
  const { user } = useAuth();
  const [activeFilters, setActiveFilters] = useState({
    cookie: true,
    cake: true,
    bread: true,
    dessert: true,
    snack: true,
    breakfast: true,
    drink: true,
    other: true,
    vegetarian: false,
    vegan: false,
    glutenFree: false,
    dairyFree: false,
    nutFree: false,
  });
  const [vegFilter, setVegFilter] = useState('all'); // 'all', 'veg', 'non-veg'
  const [contentFilter, setContentFilter] = useState('all'); // 'all', 'recipe', 'video'
  const [aiSuggest, setAiSuggest] = useState(false);

  // AI Random Suggest function
  const handleAiSuggest = () => {
    setAiSuggest(!aiSuggest);
    // Simulate AI suggestion by randomizing filters
    if (!aiSuggest) {
      const randomVeg = ['all', 'veg', 'non-veg'][Math.floor(Math.random() * 3)];
      const randomContent = ['all', 'recipe', 'video'][Math.floor(Math.random() * 3)];
      setVegFilter(randomVeg);
      setContentFilter(randomContent);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundImage: 'url(images/Background.jpg)', backgroundSize: 'cover', backgroundPosition: 'center' }}>
      <nav className="navbar is-fixed-top">
        <div className="navbar-brand">
          <Link to="/" className="navbar-item">Cookiepedia</Link>
        </div>
        <div className="navbar-end">
          <div className="navbar-item">
            <div className="buttons">
              {user ? (
                <Link to="/dashboard" className="button is-primary cursor-target">
                  <strong>Go to Dashboard</strong>
                </Link>
              ) : (
                <>
                  <Link to="/signup" className="button is-primary cursor-target">
                    <strong>Sign up</strong>
                  </Link>
                  <Link to="/login" className="button is-light cursor-target">
                    Log in
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>
      <div className="main-layout">
        <div className="main-content-area">
          <div className="image-trail-background">
            <ImageTrail
              items={[
                'images/Recipe1.webp',
                'images/Recipe2.webp',
                'images/Recipe3.webp',
                'images/Recipe4.jpg',
                'images/Recipe5.jpg',
                'images/Recipe6.jpg',
                'images/Recipe7.webp',
                'images/Recipe8.avif',
                // ...
              ]}
              variant={1}
            />
          </div>
          <div className="content-overlay">
            <div className="welcome-content">
              <h1>Cookiepedia !!</h1>
            </div>
            <div className="search-container">
              <SearchBar placeholder="Search for recipes...🔍︎" />
            </div>
            
            {/* Filter Section */}
            <div className="filter-section">
              {/* Veg/Non-Veg Filter */}
              <div className="filter-group">
                <label className="filter-label">🍽️ Diet:</label>
                <select 
                  className="filter-select"
                  value={vegFilter} 
                  onChange={(e) => setVegFilter(e.target.value)}
                >
                  <option value="all">All Recipes</option>
                  <option value="veg">🥬 Vegetarian</option>
                  <option value="non-veg">🍖 Non-Vegetarian</option>
                </select>
              </div>

              {/* Recipe Post or Video Filter */}
              <div className="filter-group">
                <label className="filter-label">📱 Content:</label>
                <select 
                  className="filter-select"
                  value={contentFilter} 
                  onChange={(e) => setContentFilter(e.target.value)}
                >
                  <option value="all">All Content</option>
                  <option value="recipe">📝 Recipe Posts</option>
                  <option value="video">🎥 Video Tutorials</option>
                </select>
              </div>

              {/* AI Random Suggest Button */}
              <div className="filter-group">
                <label className="filter-label">🤖 AI Suggest:</label>
                <button 
                  className={`ai-suggest-btn ${aiSuggest ? 'active' : ''}`}
                  onClick={handleAiSuggest}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '10px',
                    border: '2px solid transparent',
                    background: aiSuggest 
                      ? 'linear-gradient(135deg, #ec407a, #f06292)' 
                      : 'linear-gradient(135deg, #ffffff, #f8f9ff)',
                    color: aiSuggest ? '#ffffff' : '#4a148c',
                    fontWeight: '500',
                    fontSize: '13px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    outline: 'none',
                    boxShadow: '0 2px 8px rgba(74, 20, 140, 0.1)',
                    whiteSpace: 'nowrap',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                  onMouseEnter={(e) => {
                    if (!aiSuggest) {
                      e.target.style.borderColor = '#ec407a';
                      e.target.style.background = 'linear-gradient(135deg, #ffffff, #fff0f5)';
                      e.target.style.transform = 'translateY(-1px)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!aiSuggest) {
                      e.target.style.borderColor = 'transparent';
                      e.target.style.background = 'linear-gradient(135deg, #ffffff, #f8f9ff)';
                      e.target.style.transform = 'translateY(0)';
                    }
                  }}
                >
                  <span style={{ fontSize: '14px' }}>🎲</span>
                  {aiSuggest ? 'AI Active' : 'Surprise Me'}
                </button>
              </div>
            </div>
          </div>
        </div>

        <hr className="section-divider" />
        <AnimatedHeadline />
          
        <div className="infinite-scroll-row">
          <div className="infinite-scroll-column">
            <InfiniteScroll
              items={mediaItems.filter(item => {
                if (contentFilter === 'recipe') return item.type === 'image';
                if (contentFilter === 'video') return item.type === 'video';
                return true;
              })}
              isTilted={true}
              tiltDirection='left'
              autoplay={true}
              autoplaySpeed={1.5}
              autoplayDirection="down"
              pauseOnHover={true}
            />
          </div>
          <div className="infinite-scroll-column">
            <InfiniteScroll
              items={[...mediaItems.slice(5, 10)].reverse().filter(item => {
                if (contentFilter === 'recipe') return item.type === 'image';
                if (contentFilter === 'video') return item.type === 'video';
                return true;
              })}
              isTilted={true}
              tiltDirection='left'
              autoplay={true}
              autoplaySpeed={1.5}
              pauseOnHover={true}
            />
          </div>
          <div className="infinite-scroll-column">
            <InfiniteScroll
              items={mediaItems.filter(item => {
                if (contentFilter === 'recipe') return item.type === 'image';
                if (contentFilter === 'video') return item.type === 'video';
                return true;
              })}
              isTilted={true}
              tiltDirection='left'
              autoplay={true}
              autoplaySpeed={3}
              autoplayDirection="down"
              pauseOnHover={true}
            />
          </div>
        </div>
        <InfoSection />
      </div>
      <div className="trending-list-container">
        <h3>Trending Recipes {aiSuggest && '(AI Curated)'}</h3>
        <AnimatedList
          items={trendingRecipes.filter(recipe => {
            // Apply filters to trending recipes
            let shouldShow = true;
            
            // AI suggest filter - show random selection when active
            if (aiSuggest) {
              // Show a random subset of recipes when AI suggest is active
              const randomSelection = Math.random() > 0.4; // 60% chance to show each recipe
              shouldShow = randomSelection;
            }
            
            // Veg/Non-veg filter (basic implementation)
            if (vegFilter === 'veg') {
              const vegKeywords = ['chocolate', 'lemon', 'lavender', 'matcha', 'cardamom', 'pistachio', 'gingerbread', 'oatmeal', 'raisin'];
              shouldShow = shouldShow && vegKeywords.some(keyword => 
                recipe.content.toLowerCase().includes(keyword)
              );
            } else if (vegFilter === 'non-veg') {
              const nonVegKeywords = ['butter', 'cream'];
              shouldShow = shouldShow && nonVegKeywords.some(keyword => 
                recipe.content.toLowerCase().includes(keyword)
              );
            }
            
            return shouldShow;
          })}
          onItemSelect={(item, index) => console.log(item, index)}
          showGradients={true}
          enableArrowNavigation={true}
          displayScrollbar={true}
        />
      </div>

    </div>
  );
}

export default Home;
