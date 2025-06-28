import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import products from '../data/products.json';
import './TasselsNavbar.css';

const TasselsNavbar = ({ isInCarousel }) => {
  const navigate = useNavigate();
  const { wishlistItems, cartItems, getCartItemCount } = useShop();
  const [showCartDropdown, setShowCartDropdown] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const searchRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCartClick = () => {
    navigate('/cart');
  };

  const handleWishlistClick = () => {
    navigate('/wishlist');
  };

  const handleProfileClick = () => {
    navigate('/login');
  };

  const handleHomeClick = () => {
    navigate('/');
  };

  const handleCartItemClick = (productId) => {
    navigate(`/product/${productId}`);
    setShowCartDropdown(false);
  };

  const handleSearchClick = () => {
    setShowSearchDropdown(!showSearchDropdown);
  };

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    // Filter products based on search query
    if (query.trim()) {
      const filteredProducts = products.filter(product => 
        product.name.toLowerCase().includes(query.toLowerCase()) ||
        product.description?.toLowerCase().includes(query.toLowerCase()) ||
        product.category?.toLowerCase().includes(query.toLowerCase())
      );
      setSearchResults(filteredProducts);
    } else {
      setSearchResults([]);
    }
  };

  const handleSearchItemClick = (slug) => {
    navigate(`/product/${slug}`);
    setShowSearchDropdown(false);
    setSearchQuery('');
  };

  return (
    <nav className={`tassels-navbar ${isInCarousel ? 'carousel-navbar' : ''}`}>
      <div className="tassels-navbar-links">
        <ul>
          <li><Link to="/shop">All</Link></li>
          <li><Link to="/tassels">Tassels</Link></li>
          <li><Link to="/minime">Minime</Link></li>
          <li><Link to="/teeva">Teeva</Link></li>
        </ul>
      </div>
      <div 
        className="tassels-navbar-logo"
        onClick={handleHomeClick}
        style={{ cursor: 'pointer' }}
      >
        TAESTHETE
      </div>
      <div className="tassels-navbar-icons">
        <div className="search-container" ref={searchRef}>
          <i 
            className="fa-solid fa-magnifying-glass"
            onClick={handleSearchClick}
            style={{ cursor: 'pointer' }}
          ></i>
          {showSearchDropdown && (
            <div className="search-dropdown">
              <div className="search-input-container">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  autoFocus
                />
              </div>
              <div className="search-results">
                {searchResults.length > 0 ? (
                  searchResults.map(item => (
                    <div
                      key={item.id}
                      className="search-result-item"
                      onClick={() => handleSearchItemClick(item.slug)}
                    >
                      <img src={item.image} alt={item.name} />
                      <div className="search-result-details">
                        <h4>{item.name}</h4>
                        <p>{item.price}</p>
                      </div>
                    </div>
                  ))
                ) : searchQuery ? (
                  <div className="no-results">No products found</div>
                ) : (
                  <div className="search-placeholder">Start typing to search...</div>
                )}
              </div>
            </div>
          )}
        </div>
        <i 
          className="fa-regular fa-user"
          onClick={handleProfileClick}
          style={{ cursor: 'pointer' }}
        ></i>
        <i 
          className="fa-regular fa-heart"
          onClick={handleWishlistClick}
          style={{ cursor: 'pointer' }}
        >
          <span className="badge">{wishlistItems.length}</span>
        </i>
        <div className="cart-container">
          <i 
            className="fa-solid fa-bag-shopping navbar-cart-icon"
            onClick={handleCartClick}
          >
            <span className="badge">{getCartItemCount()}</span>
          </i>
          {showCartDropdown && (
            <div className="cart-dropdown">
              {cartItems.length === 0 ? (
                <div className="empty-cart">Your cart is empty</div>
              ) : (
                <>
                  <div className="cart-items">
                    {cartItems.map(item => (
                      <div 
                        key={item.id} 
                        className="cart-item"
                        onClick={() => handleCartItemClick(item.slug)}
                      >
                        <img src={item.image} alt={item.name} />
                        <div className="cart-item-details">
                          <h4>{item.name}</h4>
                          <p>{item.price} x {item.quantity}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="cart-footer">
                    <div className="cart-total">
                      Total: ₹{cartItems.reduce((total, item) => total + (parseInt(item.price.replace(/[^0-9]/g, '')) * item.quantity), 0).toLocaleString()}
                    </div>
                    <button 
                      className="checkout-btn"
                      onClick={() => {
                        navigate('/checkout');
                        setShowCartDropdown(false);
                      }}
                    >
                      Checkout
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default TasselsNavbar; 