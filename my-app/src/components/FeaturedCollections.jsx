import React from "react";
import f1 from "../assets/images/products/c5.jpg";
import f2 from "../assets/images/products/c8.jpg";
import "./FeaturedCollections.css";

const featured = [
  {
    image: f1,
    title: "TASSELS",
    subtitle: "Breezy Like That",
    link: "/tassels",
  },
  {
    image: f2,
    title: "CROPELLE",
    subtitle: "Violet State Of Mind",
    link: "/teeva",
  },
];

const FeaturedCollections = () => {
  return (
    <section className="featured-section">
      {featured.map((item, index) => (
        <div className="featured-card" key={index}>
          <img src={item.image} alt={item.title} />
          <div className="featured-overlay">
            <h3>{item.title}</h3>
            <p>{item.subtitle}</p>
            <a href={item.link} className="shop-btn">
              Shop Now
            </a>
          </div>
        </div>
      ))}
    </section>
  );
};

export default FeaturedCollections;
