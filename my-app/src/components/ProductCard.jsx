import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './ProductCard.css';

const ProductCard = ({ product }) => {
  const { addToWishlist, removeFromWishlist, isInWishlist, addToCart, wishlistItems } = useShop();
  const navigate = useNavigate();
  const [isWishlisted, setIsWishlisted] = useState(false);

  useEffect(() => {
    const productId = product._id || product.id;
    setIsWishlisted(isInWishlist(productId) || isInWishlist(product.slug));
  }, [product, isInWishlist]);

  const handleWishlistClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const productId = product._id || product.id;
    
    if (isWishlisted) {
      removeFromWishlist(productId);
      removeFromWishlist(product.slug);
      setIsWishlisted(false);
    } else {
      addToWishlist({
        ...product,
        id: productId,
        slug: product.slug
      });
      setIsWishlisted(true);
    }
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!product || !product.slug) {
      console.error('Invalid product data:', product);
      return;
    }

    // Add to cart
    addToCart({
      ...product,
      id: product._id || product.id,
      slug: product.slug
    });

    // Show toast every time
    toast.success('Product added to cart!', {
      position: "bottom-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      theme: "light",
      onClick: () => navigate('/cart')
    });
  };

  // Ensure image URL is absolute
  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return '';
    if (imageUrl.startsWith('http')) return imageUrl;
    
    // Extract filename and convert to .webp if needed
    const filename = imageUrl.split('/').pop();
    const webpFilename = filename.replace(/\.(jpg|jpeg|png)$/, '.webp');
    return `/images/products/${webpFilename}`;
  };

  return (
    <div className="product-card">
      <div className="product-image">
        <Link to={`/product/${product.slug}`}>
          <img 
            src={getImageUrl(product.image)} 
            alt={product.name} 
            className="tassel-img"
            onError={(e) => {
              console.error('Image failed to load:', product.image);
              e.target.src = '/placeholder-image.jpg';
            }}
          />
        </Link>
        <i 
          className={`fa-${isWishlisted ? 'solid' : 'regular'} fa-heart heart-hover ${isWishlisted ? 'active' : ''}`}
          onClick={handleWishlistClick}
          style={{ color: isWishlisted ? '#ff4444' : '#000000' }}
        ></i>
      </div>
      <div className="product-details">
        <h4 className="product-name">{product.name}</h4>
        <p className="product-price">{product.price}</p>
        <button 
          className="add-to-cart-btn"
          onClick={handleAddToCart}
          type="button"
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
