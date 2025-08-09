import React from 'react';
import './feature/css/Footer.css';

function Footer() {
  return (
    <footer className="footer-container">
      <div className="social-links">
        <a href="#" aria-label="Facebook"><i className="fab fa-facebook-f"></i></a>
        <a href="#" aria-label="Twitter"><i className="fab fa-twitter"></i></a>
        <a href="#" aria-label="Instagram"><i className="fab fa-instagram"></i></a>
        <a href="#" aria-label="LinkedIn"><i className="fab fa-linkedin-in"></i></a>
      </div>
      <p>&copy; 2024 Cookiepedia. All rights reserved.</p>
    </footer>
  );
}

export default Footer;
