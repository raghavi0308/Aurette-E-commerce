import React from 'react';
import Carousel from '../components/Carousel';
import NewArrivals from '../components/NewArrivals';
import FeaturedCollections from '../components/FeaturedCollections';
import Loved from '../components/Loved';
import About from '../components/About';
import TrustBanner from '../components/TrustBanner';

const Home = () => {
  return (
    <div className="home">
      <Carousel />
      <NewArrivals />
      <FeaturedCollections />
      <Loved />
      <About />
      <TrustBanner />
    </div>
  );
};

export default Home; 