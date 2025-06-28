import React, { useEffect } from 'react';
import './About.css';
import aboutImage from '../assets/images/about/a2.png'; // adjust the path if needed

const About = () => {
  useEffect(() => {
    // Check if we're navigating from the footer
    const isFromFooter = window.location.hash === '#about';
    if (isFromFooter) {
      // Scroll to the about section
      const aboutSection = document.getElementById('about-section');
      if (aboutSection) {
        aboutSection.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, []);

  return (
    <div id="about-section" className="about-container">
      {/* Image from assets */}
      <div className="about-image">
        <img src={aboutImage} alt="About Aurette" className="about-image" />
      </div>

      {/* About text */}
      <div className="about-text">
        <h2>About Aurette</h2>
        <p>
          Our tassel and oversized patches T-shirt collection is a creative fusion of comfort and style. Designed with high-quality 180-220 GSM cotton, these T-shirts redefine everyday wear with unique tassel embellishments on the pockets. Each piece is crafted to balance minimalism and boldness, making them perfect for casual outings or statement looks.This collection celebrates versatility and individuality, offering oversized silhouettes for a relaxed, modern fit. The tassel details add a playful yet sophisticated touch, making these T-shirts stand out while remaining easy to style. Perfect for those who value comfort without compromising on creativity, these designs are a fresh take on contemporary fashion essentials.
        </p>
      </div>
    </div>
  );
};

export default About;
