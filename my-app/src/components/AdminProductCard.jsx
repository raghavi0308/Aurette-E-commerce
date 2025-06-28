import React from 'react';
import './AdminProductCard.css';

const AdminProductCard = ({ product, onEdit, onDelete }) => {
  // Function to handle image path
  const getImageUrl = (imagePath) => {
    if (!imagePath) return '/placeholder-image.jpg';
    
    // If it's already a full URL (Cloudinary or other external URL), return as is
    if (imagePath.startsWith('http')) return imagePath;
    if (imagePath.startsWith('data:')) return imagePath;
    
    // If it starts with a forward slash, it's already a relative path
    if (imagePath.startsWith('/')) return imagePath;
    
    // Handle Windows-style paths
    if (imagePath.includes('\\') || imagePath.includes('/')) {
      const parts = imagePath.split(/[\\/]/);
      const filename = parts[parts.length - 1]
        .replace(/\(1\)/, '')
        .replace(/\.\.\./g, '')
        .replace(/twirl/g, 'twril');
      return `/images/products/${filename}`;
    }
    
    // If it's just a filename, assume it's in the products directory
    return `/images/products/${imagePath}`;
  };

  return (
    <div className="admin-product-card">
      <div className="admin-product-image">
        <img
          src={getImageUrl(product.image)}
          alt={product.name}
          onError={(e) => {
            console.error('Product image failed to load:', product.image);
            e.target.src = '/placeholder-image.jpg';
          }}
        />
      </div>
      <div className="admin-product-details">
        <h3 className="admin-product-name">{product.name}</h3>
        <p className="admin-product-price">{product.price}</p>
        <p className="category">
          {typeof product.category === 'object' ? product.category.name : product.category}
        </p>
        <p className="color">Color: {product.color}</p>
        <p className="sizes">Sizes: {product.sizes.join(', ')}</p>
        <div className="stock-info">
          <span className={`stock-status ${product.stock > 0 ? 'in-stock' : 'out-of-stock'}`}>
            {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
          </span>
          {product.stock > 0 && <span className="stock-count">({product.stock} available)</span>}
        </div>
      </div>
      <div className="product-actions">
        <button 
          className="edit-button"
          onClick={() => onEdit(product)}
        >
          <i className="fas fa-edit"></i> Edit
        </button>
        <button 
          className="delete-button"
          onClick={() => onDelete(product._id)}
        >
          <i className="fas fa-trash"></i> Delete
        </button>
      </div>
    </div>
  );
};

export default AdminProductCard; 