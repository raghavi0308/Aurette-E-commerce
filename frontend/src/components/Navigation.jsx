import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/global.css';

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="nav">
      <div className="container">
        <div className="nav-content">
          <Link to="/" className="nav-logo">
            Aurette
          </Link>
          
          <button 
            className="nav-toggle" 
            onClick={toggleMenu}
            aria-label="Toggle navigation"
          >
            <span className={`hamburger ${isMenuOpen ? 'active' : ''}`}></span>
          </button>

          <ul className={`nav-list ${isMenuOpen ? 'active' : ''}`}>
            <li><Link to="/" onClick={() => setIsMenuOpen(false)}>Home</Link></li>
            <li><Link to="/products" onClick={() => setIsMenuOpen(false)}>Products</Link></li>
            <li><Link to="/customize" onClick={() => setIsMenuOpen(false)}>Customize</Link></li>
            <li><Link to="/about" onClick={() => setIsMenuOpen(false)}>About</Link></li>
            <li><Link to="/contact" onClick={() => setIsMenuOpen(false)}>Contact</Link></li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navigation; 