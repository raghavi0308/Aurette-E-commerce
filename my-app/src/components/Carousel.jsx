import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './Carousel.css';
// import TasselsNavbar from './TasselsNavbar';

import C1 from '../assets/images/C3.png';
import C3 from '../assets/images/C1.png';

// Import PNG icons
// import searchIcon from '../assets/images/icons/search.png';
// import userIcon from '../assets/images/icons/user.png';
// import wishlistIcon from '../assets/images/icons/wishlist.png';
// import cartIcon from '../assets/images/icons/cart.png';

const Carousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate();
  const intervalRef = useRef(null);
  
  const slides = [
    {
      image: C1,
      caption: "",
      button: "Shop Now"
    },
    {
      image: C3,
      caption: "",
      button: "→"
    }
  ];

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? slides.length - 1 : prevIndex - 1
    );
  };

  const handleSlideClick = () => {
    navigate('/shop');
  };

  const startAutoSlide = () => {
    intervalRef.current = setInterval(nextSlide, 5000);
  };

  const stopAutoSlide = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  useEffect(() => {
    startAutoSlide();
    return () => stopAutoSlide();
  }, []);

  return (
    <section 
      className="carousel-container"
      onMouseEnter={stopAutoSlide}
      onMouseLeave={startAutoSlide}
    >
      <div className="carousel">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`carousel-slide ${currentIndex === index ? 'active' : ''}`}
            style={{ 
              backgroundImage: `url(${slide.image})`,
              width: '100%',
              height: '100%',
              display: currentIndex === index ? 'flex' : 'none'
            }}
          >
            {/* 🔽 Navbar */}
            {/* <TasselsNavbar isInCarousel={true} /> */}

            <div className="carousel-caption">
              <h2>{slide.caption}</h2>
              <button 
                className={`slide-button ${index === 1 ? 'arrow-button' : 'shop-button'}`}
                onClick={handleSlideClick}
              >
                {slide.button}
              </button>
            </div>
          </div>
        ))}

        {currentIndex !== 0 && (
          <button
            className="carousel-prev"
            onClick={(e) => {
              e.stopPropagation();
              prevSlide();
            }}
          >
            &#10094;
          </button>
        )}

        {currentIndex !== slides.length - 1 && (
          <button
            className="carousel-next"
            onClick={(e) => {
              e.stopPropagation();
              nextSlide();
            }}
          >
            &#10095;
          </button>
        )}

      </div>
    </section>
  );
};

export default Carousel;
