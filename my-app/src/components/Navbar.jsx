import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useShop } from '../context/ShopContext';
import products from '../data/products.json';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { cartItems, wishlistItems } = useShop();
  const navigate = useNavigate();
  const location = useLocation();
  const path = location.pathname;

  // List of routes that should have a black navbar
  const blackNavbarRoutes = [
    '/shop',
    '/tassels',
    '/oversized-pockets',
    '/teeva',
    '/customisation',
    '/wishlist',
    '/cart',
    '/profile',
    '/orders',
    '/product',
    '/admin/dashboard',
    '/admin/orders',
    '/payment',
    '/success'
  ];

  // If path is exactly '/', it's home
  const isHome = path === '/';
  // If path matches any of the blackNavbarRoutes, use black
  const isBlack = blackNavbarRoutes.includes(path) || path.startsWith('/product');

  const [showDropdown, setShowDropdown] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const searchRef = useRef(null);
  const messages = [
    "New collection available now",
    "Made In India"
  ];
  const [current, setCurrent] = useState(0);

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

  const handleLogout = () => {
    logout();
    setShowDropdown(false);
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

  const cartCount = cartItems.length;
  const wishlistCount = wishlistItems.length;

  return (
    <>
      <div className="top-message">
        <div className="message-slider">
          {messages.map((message, index) => (
            <div key={index} className="message">{message}</div>
          ))}
        </div>
      </div>
      <nav className={`navbar${isHome ? ' navbar-home' : ''}${isBlack ? ' navbar-black' : ''}`}>
        <div className="navbar-brand">
          <Link to="/">Aurette</Link>
        </div>
        <div className="navbar-menu">
          <Link to="/tassels" className={path === '/tassels' ? 'active' : ''}>Tassels</Link>
          <Link to="/oversized-pockets" className={path === '/oversized-pockets' ? 'active' : ''}>Minime</Link>
          <Link to="/teeva" className={path === '/teeva' ? 'active' : ''}>Teeva</Link>
          <Link to="/shop" className={path === '/shop' ? 'active' : ''}>Shop</Link>
          <Link to="/customisation" className={path === '/customisation' ? 'active' : ''}>Customisation</Link>
        </div>
        <div className="navbar-end">
          <div className="navbar-icons">
            <div className="search-container" ref={searchRef}>
              <button className="profile-button" onClick={handleSearchClick}>
                <i className="fas fa-search"></i>
              </button>
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
            {user && (
              <>
                <Link to="/wishlist" className={`profile-button ${path === '/wishlist' ? 'active' : ''}`}>
                  <i className="fa-solid fa-heart" style={{ color: 'white' }}></i>
                  {wishlistCount > 0 && (
                    <span className="icon-badge">{wishlistCount}</span>
                  )}
                </Link>
                <Link to="/cart" className={`profile-button ${path === '/cart' ? 'active' : ''}`}>
                  <i className="fas fa-shopping-cart"></i>
                  {cartCount > 0 && (
                    <span className="icon-badge">{cartCount}</span>
                  )}
                </Link>
              </>
            )}
            {user ? (
              <div className="profile-button-container">
                <button className={`profile-button ${path === '/profile' ? 'active' : ''}`} onClick={() => setShowDropdown(!showDropdown)}>
                  {user.role === 'admin' ? (
                    <i className="fas fa-user-shield"></i>
                  ) : (
                    user.avatar ? (
                      <img 
                        src={user.avatar.startsWith('http') 
                          ? user.avatar 
                          : `http://localhost:5000/${user.avatar.replace(/^\/+/, '')}?t=${Date.now()}`} 
                        alt="Profile" 
                        className="profile-avatar"
                        crossOrigin="anonymous"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/placeholder-avatar.png';
                        }}
                      />
                    ) : (
                      <i className="fas fa-user"></i>
                    )
                  )}
                </button>
                {showDropdown && (
                  <div className="dropdown-menu">
                    {user.role === 'admin' ? (
                      <>
                        <Link to="/admin/dashboard" className="dropdown-item">
                          <i className="fas fa-tachometer-alt"></i> Dashboard
                        </Link>
                        <Link to="/admin/orders" className="dropdown-item">
                          <i className="fas fa-shopping-bag"></i> Orders
                        </Link>
                        <button onClick={handleLogout} className="dropdown-item">
                          <i className="fas fa-sign-out-alt"></i> Logout
                        </button>
                      </>
                    ) : (
                      <>
                        <Link to="/profile" className="dropdown-item">
                          <i className="fas fa-user"></i> Profile
                        </Link>
                        <Link to="/orders" className="dropdown-item">
                          <i className="fas fa-shopping-bag"></i> Orders
                        </Link>
                        <button onClick={handleLogout} className="dropdown-item">
                          <i className="fas fa-sign-out-alt"></i> Logout
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="login-button">Login</Link>
            )}
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
