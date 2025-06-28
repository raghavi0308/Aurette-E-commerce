import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
// import TasselsNavbar from '../components/TasselsNavbar';
import './Wishlist.css';

const Wishlist = () => {
  const { wishlistItems, addToCart, removeFromWishlist, shopLoading, shopError } = useShop();
  const navigate = useNavigate();

  useEffect(() => {
    console.log('Wishlist component mounted');
    console.log('shopLoading:', shopLoading);
    console.log('shopError:', shopError);
    console.log('wishlistItems:', wishlistItems);
  }, [shopLoading, shopError, wishlistItems]);

  const handleAddToCart = (item) => {
    try {
    addToCart({
      ...item,
      quantity: 1,
      selectedSize: item.sizes ? item.sizes[0] : null
    });
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  const handleProductClick = (slug) => {
    try {
    navigate(`/product/${slug}`);
    } catch (error) {
      console.error('Error navigating to product:', error);
    }
  };

  try {
    if (shopLoading) {
      console.log('Rendering loading state');
      return (
        <div className="wishlist-page">
          <div className="wishlist-container">
            <h1>My Wishlist</h1>
            <div className="loading">Loading wishlist...</div>
          </div>
        </div>
      );
    }

    if (shopError) {
      console.log('Rendering error state:', shopError);
      return (
        <div className="wishlist-page">
          <div className="wishlist-container">
            <h1>My Wishlist</h1>
            <div className="error-message">{shopError}</div>
          </div>
        </div>
      );
    }

    console.log('Rendering wishlist content');
  return (
    <div className="wishlist-page">
      {/* <TasselsNavbar /> */}
      <div className="wishlist-container">
        <h1>My Wishlist</h1>
        
          {!wishlistItems || wishlistItems.length === 0 ? (
          <div className="empty-wishlist">
              <i className="fa-solid fa-heart-circle-plus"></i>
            <h2>Your wishlist is empty</h2>
            <p>Add items to your wishlist to keep track of your favorite products</p>
            <button 
              className="continue-shopping-btn"
              onClick={() => navigate('/tassels')}
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <div className="wishlist-content">
            <div className="wishlist-items">
              {wishlistItems.map((item) => {
                  console.log('Rendering wishlist item:', item);
                const imageUrl = item.image?.startsWith('http') 
                  ? item.image 
                  : `/images/products/${item.image.split('/').pop()}`;
                
                return (
                <div key={item.slug} className="wishlist-item">
                  <div 
                    className="wishlist-item-image"
                    onClick={() => handleProductClick(item.slug)}
                  >
                    <img 
                      src={imageUrl}
                      alt={item.name}
                      onError={(e) => {
                        console.error('Failed to load image:', imageUrl);
                        e.target.src = '/placeholder-image.jpg';
                      }}
                    />
                  </div>
                  
                  <div className="wishlist-item-details">
                    <h3 onClick={() => handleProductClick(item.slug)}>
                      {item.name}
                    </h3>
                    <p className="item-price">{item.price}</p>
                    {item.description && (
                      <p className="item-description">{item.description}</p>
                    )}
                    <div className="wishlist-item-actions">
                      <button 
                        className="add-to-cart-btn"
                        onClick={() => handleAddToCart(item)}
                      >
                        Add to Cart
                      </button>
                      <button 
                        className="remove-item"
                        onClick={() => removeFromWishlist(item.slug)}
                      >
                          <i className="fas fa-trash"></i> Remove
                      </button>
                    </div>
                  </div>
                </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
  } catch (error) {
    console.error('Error rendering Wishlist component:', error);
    return (
      <div className="wishlist-page">
        <div className="wishlist-container">
          <h1>My Wishlist</h1>
          <div className="error-message">
            An error occurred while loading the wishlist. Please try refreshing the page.
          </div>
        </div>
      </div>
    );
  }
};

export default Wishlist; 