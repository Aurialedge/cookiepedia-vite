import React from 'react';
import { Link } from 'react-router-dom';
import ImageTrail from './feature/ImageTrail';

function Home() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundImage: 'url(images/Background.jpg)', backgroundSize: 'cover', backgroundPosition: 'center' }}>
      <nav className="navbar is-fixed-top">
        <div className="navbar-brand">
          <Link to="/" className="navbar-item">Cookiepedia</Link>
        </div>
        <div className="navbar-menu">
          <div className="navbar-start">
            <div className="navbar-item">
              <input className="input" type="text" placeholder="Search for recipes..." style={{ width: '400px' }}/>
            </div>
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
        </div>
      </nav>
      <div style={{ display: 'flex', padding: '3rem', paddingTop: '1.5rem' }}>
        <div className="background-container" style={{ flex: 1, backgroundPosition: 'center', backgroundRepeat: 'no-repeat', backgroundSize: 'cover', padding: '1rem' }}>
          
            <h1>Welcome to Cookiepedia!</h1>
          
        </div>
        <div style={{ flex: 2, position: 'relative', overflow: 'hidden' }}>
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
      </div>
    </div>
  );
}

export default Home;
