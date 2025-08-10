import React from 'react';
import { Link } from 'react-router-dom';
import ImageTrail from './feature/ImageTrail';
import AnimatedHeadline from './feature/AnimatedHeadline';
import InfiniteScroll from './feature/InfiniteScroll';
import AnimatedList from './feature/AnimatedList';
import InfoSection from './feature/InfoSection';


const trendingRecipes = [
  { content: 'Spicy Chocolate Chip Cookies' },
  { content: 'Lemon & Lavender Shortbread' },
  { content: 'Rosemary-Infused Snickerdoodles' },
  { content: 'Matcha White Chocolate Macarons' },
  { content: 'Cardamom & Pistachio Biscotti' },
  { content: 'Gingerbread People' },
  { content: 'Classic Oatmeal Raisin' },
  { content: 'Peanut Butter Blossoms' }
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
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundImage: 'url(images/Background.jpg)', backgroundSize: 'cover', backgroundPosition: 'center' }}>
      <nav className="navbar is-fixed-top">
        <div className="navbar-brand">
          <Link to="/" className="navbar-item">Cookiepedia</Link>
        </div>
        <div className="navbar-end">
          <div className="navbar-item">
            <div className="buttons">
              <Link to="/signup" className="button is-primary cursor-target">
                <strong>Sign up</strong>
              </Link>
              <Link to="/login" className="button is-light cursor-target">
                Log in
              </Link>
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
              <input id="search" className="input cursor-target" type="text" placeholder="Search for recipes...🔍︎" />
            </div>
          </div>
        </div>

        <hr className="section-divider" />
        <AnimatedHeadline />
          
        <div className="infinite-scroll-row">
          <div className="infinite-scroll-column">
            <InfiniteScroll
              items={mediaItems}
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
              items={[...mediaItems.slice(5, 10)].reverse()}
              isTilted={true}
              tiltDirection='left'
              autoplay={true}
              autoplaySpeed={1.5}
              pauseOnHover={true}
            />
          </div>
          <div className="infinite-scroll-column">
            <InfiniteScroll
              items={mediaItems}
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
        <h3>Trending Recipes</h3>
        <AnimatedList
          items={trendingRecipes}
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
