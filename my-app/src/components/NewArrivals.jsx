import React from "react";
import c1 from "../assets/images/products/c1.jpg";
import c2 from "../assets/images/products/c2.jpg";
import c3 from "../assets/images/products/c3.jpg";
import c4 from "../assets/images/products/c4.jpg";
import "./NewArrivals.css";
import { useNavigate } from 'react-router-dom';

const products = [
  { name: "Lavendar Tapestry", price: "899.00", image: c1, slug: "lavender-tapestry" },
  { name: "Dusty Drama", price: "1190.00", image: c2, slug: "dusty-drama" },
  { name: "Purple Glint", price: "1250.00", image: c3, slug: "purple-glint" },
  { name: "Mulberry Folk", price: "1290.00", image: c4, slug: "mulberry-folk" },
];

const NewArrivals = () => {
  const navigate = useNavigate();

  const handleProductClick = (product) => {
    navigate(`/product/${product.slug}`, { state: { product } });
  };

  return (
    <section className="na-loved-section">
      <div className="na-section-title">
        <span className="line"></span>
        <h2>New Arrivals</h2>
        <span className="line"></span>
      </div>

      <div className="na-products-container">
        {products.map((item, index) => (
          <div className="na-product-card" key={index} onClick={() => handleProductClick(item)}>
            <img 
              src={item.image} 
              alt={item.name}
              loading="lazy"
              width="300"
              height="400"
              style={{ objectFit: 'cover' }}
            />
            <p className="na-product-name">{item.name}</p>
            <p className="na-product-price">Rs. {item.price}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default NewArrivals;
