import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/global.css';

const ProductCard = ({ product }) => {
  return (
    <div className="card product-card">
      <div className="product-image">
        <img src={product.image} alt={product.name} />
      </div>
      <div className="product-info">
        <h3 className="product-name">{product.name}</h3>
        <p className="product-price">${product.price}</p>
        <p className="product-description">{product.description}</p>
        <div className="product-actions">
          <Link to={`/products/${product._id}`} className="btn btn-primary">
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProductCard; 