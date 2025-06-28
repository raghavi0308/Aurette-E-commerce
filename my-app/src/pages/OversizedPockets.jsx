import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import { getImageUrl } from '../utils/imageUtils';
import '../components/Tassels.css';
import productsFromJson from '../data/products.json';

const OversizedPockets = () => {
  const navigate = useNavigate();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    inStock: false,
    outOfStock: false,
    minPrice: 0,
    maxPrice: 10000,
  });
  const [showAvail, setShowAvail] = useState(false);
  const [showPrice, setShowPrice] = useState(false);
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(10000);
  const [activeView, setActiveView] = useState('horizontal');
  const [sortBy, setSortBy] = useState('featured');
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 12;

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/products');
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        const data = await response.json();
        // Merge API products with JSON products, removing duplicates
        const mergedProducts = [...data];
        productsFromJson.forEach(jsonProduct => {
          if (!mergedProducts.some(p => p.id === jsonProduct.id)) {
            mergedProducts.push(jsonProduct);
          }
        });
        // Filter for 'minime' category
        const minimeProducts = mergedProducts.filter(product => 
          product.category.toLowerCase() === 'minime'
        );
        setProducts(minimeProducts);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const getImageUrl = (imagePath) => {
    if (!imagePath) return '/placeholder-image.jpg';
    
    // If it's already a full URL (Cloudinary or other external URL), return as is
    if (imagePath.startsWith('http')) return imagePath;
    if (imagePath.startsWith('data:')) return imagePath;
    
    // If it starts with a forward slash, it's already a relative path
    if (imagePath.startsWith('/')) return imagePath;
    
    // Handle local file paths
    if (imagePath.includes('\\') || imagePath.includes('/')) {
      // Extract just the filename from the path
      const filename = imagePath.split(/[\\/]/).pop()
        .replace(/\(1\)/, '')
        .replace(/\.\.\./g, '')
        .replace(/twirl/g, 'twril');
      return `/images/products/${filename}`;
    }
    
    // If it's just a filename, assume it's in the products directory
    return `/images/products/${imagePath}`;
  };

  // ... existing code ...

  return (
    <div className="tassels-container">
      <div className="tassels-filters">
        {/* AVAILABILITY FILTER */}
        <div
          className="filter-dropdown"
          onMouseEnter={() => setShowAvail(true)}
          onMouseLeave={() => setShowAvail(false)}
        >
          <button className="filter-btn">
            AVAILABILITY <i className="fa-solid fa-chevron-down"></i>
          </button>
          {showAvail && (
            <div className="dropdown-content">
              <label>
                <input 
                  type="checkbox"
                  checked={filters.inStock}
                  onChange={() => handleAvailabilityChange('inStock')}
                /> 
                In Stock ({inStockCount})
              </label>
              <label style={{ opacity: 0.5, cursor: 'not-allowed' }}>
                <input 
                  type="checkbox"
                  checked={filters.outOfStock}
                  onChange={() => handleAvailabilityChange('outOfStock')}
                  disabled
                /> 
                Out of Stock ({outOfStockCount})
              </label>
            </div>
          )}
        </div>

        {/* PRICE FILTER */}
        <div
          className="filter-dropdown"
          onMouseEnter={() => setShowPrice(true)}
          onMouseLeave={() => setShowPrice(false)}
        >
          <button className="filter-btn">
            PRICE <i className="fa-solid fa-chevron-down"></i>
          </button>
          {showPrice && (
            <div className="dropdown-content">
              <div className="price-range">
                <div className="price-inputs">
                  <div className="input-wrapper">
                    <span className="currency-inside">₹</span>
                    <input
                      type="number"
                      value={minPrice}
                      onChange={(e) => handlePriceChange('min', e.target.value)}
                      min="0"
                      max={maxPrice}
                    />
                  </div>
                  <span className="separator">-</span>
                  <div className="input-wrapper">
                    <span className="currency-inside">₹</span>
                    <input
                      type="number"
                      value={maxPrice}
                      onChange={(e) => handlePriceChange('max', e.target.value)}
                      min={minPrice}
                    />
                  </div>
                </div>
                <input
                  type="range"
                  min="0"
                  max="10000"
                  value={maxPrice}
                  onChange={(e) => handlePriceChange('max', e.target.value)}
                  className="price-slider"
                />
                <button className="apply-btn" onClick={handleApplyPrice}>
                  Apply
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="tassels-filter-bar">
        <div className="tassels-view-toggle">
          <button
            className={activeView === 'horizontal' ? 'active' : ''}
            onClick={() => setActiveView('horizontal')}
          >
            <i className="fa-solid fa-grip"></i>
          </button>
          <button
            className={activeView === 'vertical' ? 'active' : ''}
            onClick={() => setActiveView('vertical')}
          >
            <i className="fa-solid fa-grip-vertical"></i>
          </button>
          <button
            className={activeView === 'list' ? 'active' : ''}
            onClick={() => setActiveView('list')}
          >
            <i className="fa-solid fa-list"></i>
          </button>
        </div>

        <div className="tassels-sort-controls">
          <span className="sort">Sort by:</span>
          <select
            className="tasssels-dropdown"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="featured">Featured</option>
            <option value="best-selling">Best Selling</option>
            <option value="alphabetically-az">Alphabetically, A-Z</option>
            <option value="alphabetically-za">Alphabetically, Z-A</option>
            <option value="price-low-high">Price: Low to High</option>
            <option value="price-high-low">Price: High to Low</option>
            <option value="date-new-old">Date: New to Old</option>
            <option value="date-old-new">Date: Old to New</option>
          </select>
        </div>
      </div>
      
      <div className="tassels-divider"></div>
      <div className="tassels-content">
        <div className={`tassels-grid ${activeView}`}>
          {currentProducts.map(product => (
            <div className="tassel-item" key={product.id}>
              <div className="product-card">
                <div className="product-image" onClick={() => handleProductClick(product.slug)}>
                  <img
                    src={getImageUrl(product.image)}
                    alt={product.name}
                    className="tassel-img"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://via.placeholder.com/400x500?text=Image+Not+Found';
                    }}
                  />
                  <i
                    className={`heart-hover ${isInWishlist(product.id) ? 'fa-solid active' : 'fa-regular'}`}
                    onClick={(e) => handleWishlistClick(e, product)}
                  ></i>
                </div>
                <div className="product-details">
                  <h3 className="product-name">{product.name}</h3>
                  <p className="product-price">{product.price}</p>
                  <button className="choose-options-btn" onClick={() => handleProductClick(product.slug)}>
                    Choose Options
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OversizedPockets;
// ... existing code ... 