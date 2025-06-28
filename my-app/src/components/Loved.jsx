import React from "react";
import l1 from "../assets/images/products/l1.jpg";
import l3 from "../assets/images/products/l3.jpg";
import l4 from "../assets/images/products/l4.jpg";
import "./NewArrivals.css";
import { useNavigate } from 'react-router-dom';

const products = [
  { name: "Red Coastal Breeze Maxi", price: "1195.00", image: l1, slug: "red-coastal-breeze-maxi" },
  { name: "Navy Island Swing Dress", price: "990.00", image: l3, slug: "navy-island-swing-dress" },
  { name: "Tropical Lily Mini Dress", price: "1045.00", image: l4, slug: "tropical-lily-mini-dress" },
];

const Loved = () => {
  const navigate = useNavigate();

  const handleProductClick = (product) => {
    navigate(`/product/${product.slug}`, { state: { product } });
  };

  return (
    <section className="na-loved-section">
      <div className="na-section-title">
        <span className="line"></span>
        <h2>Most Loved</h2>
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

export default Loved;
