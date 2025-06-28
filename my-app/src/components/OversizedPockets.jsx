import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import ProductCard from '../components/ProductCard';
import productsFromJson from '../data/products.json';
import './minime.css';
// import TasselsNavbar from './TasselsNavbar';

const OversizedPockets = () => {
  const navigate = useNavigate();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useShop();
  const [showAvail, setShowAvail] = useState(false);
  const [showPrice, setShowPrice] = useState(false);
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(10000);
  const [activeView, setActiveView] = useState('horizontal');
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortBy, setSortBy] = useState('featured');
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    inStock: false,
    outOfStock: false,
    priceRange: {
      min: 0,
      max: 10000
    }
  });
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Helper function to get image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return '/placeholder-image.jpg';
    
    // If it's already a full URL (Cloudinary or other external URL), return as is
    if (imagePath.startsWith('http')) return imagePath;
    if (imagePath.startsWith('data:')) return imagePath;
    
    // If it starts with a forward slash, it's already a relative path
    if (imagePath.startsWith('/')) {
      // Convert .jpg to .webp in the path
      return imagePath.replace(/\.(jpg|jpeg|png)$/, '.webp');
    }
    
    // Handle local file paths
    if (imagePath.includes('\\') || imagePath.includes('/')) {
      // Extract just the filename from the path
      const filename = imagePath.split(/[\\/]/).pop()
        .replace(/\(1\)/, '')
        .replace(/\.\.\./g, '')
        .replace(/twirl/g, 'twril')
        .replace(/\.(jpg|jpeg|png)$/, '.webp');
      return `/images/products/${filename}`;
    }
    
    // If it's just a filename, assume it's in the products directory
    const webpFilename = imagePath.replace(/\.(jpg|jpeg|png)$/, '.webp');
    return `/images/products/${webpFilename}`;
  };

  const handleProductClick = (slug) => {
    navigate(`/product/${slug}`);
  };

  const handleWishlistClick = (e, product) => {
    e.stopPropagation();
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Try to fetch from API first
        let productsFromApi = [];
        try {
          const response = await fetch('http://localhost:5000/api/products');
          if (response.ok) {
            productsFromApi = await response.json();
          } else {
            console.warn('API request failed, falling back to JSON file');
          }
        } catch (apiError) {
          console.warn('API request failed:', apiError);
        }
        
        // Merge products from both sources, removing duplicates by slug
        const allProducts = [
          ...productsFromApi,
          ...productsFromJson.filter(
            jsonProd => !productsFromApi.some(apiProd => apiProd.slug === jsonProd.slug)
          )
        ];

        setProducts(allProducts);
      } catch (err) {
        console.error('Error processing products:', err);
        // If all else fails, use JSON products
        setProducts(productsFromJson);
        setError('Error loading products from API. Using local data instead.');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Filter products by category
  const oversized = products.filter(p => {
    // Handle both API and JSON data formats
    if (p.category && typeof p.category === 'object') {
      // API data format (category is an object with slug)
      return p.category.slug === 'minime';
    } else if (p.category && typeof p.category === 'string') {
      // JSON data format (category is a string)
      return p.category.toLowerCase() === 'minime';
    }
    return false; // Return false if category is null or undefined
  });

  // Helper function to convert price string to number
  const getPriceAsNumber = (price) => {
    if (typeof price === 'string') {
      return parseInt(price.replace(/[^0-9]/g, ''));
    }
    return price;
  };

  // Apply filters
  const filteredProducts = oversized.filter(product => {
    // Price filter
    const productPrice = getPriceAsNumber(product.price);
    if (productPrice < filters.priceRange.min || productPrice > filters.priceRange.max) return false;

    return true;
  });

  // Sort products based on selected sort option
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'alphabetically-az':
        return a.name.localeCompare(b.name);
      case 'alphabetically-za':
        return b.name.localeCompare(a.name);
      case 'price-low-high':
        return getPriceAsNumber(a.price) - getPriceAsNumber(b.price);
      case 'price-high-low':
        return getPriceAsNumber(b.price) - getPriceAsNumber(a.price);
      case 'date-new-old':
        return b.id - a.id;
      case 'date-old-new':
        return a.id - b.id;
      default:
        return 0;
    }
  });

  // Calculate pagination
  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProducts = sortedProducts.slice(startIndex, endIndex);

  // Handle items per page change
  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  // Handle sort by change
  const handleSortByChange = (e) => {
    setSortBy(e.target.value);
    setCurrentPage(1); // Reset to first page when changing sort
  };

  // Handle availability filter change
  const handleAvailabilityChange = (type) => {
    setFilters(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
    setCurrentPage(1); // Reset to first page when changing filters
  };

  // Handle price filter change
  const handlePriceChange = () => {
    const min = Number(minPrice) || 0;
    const max = Number(maxPrice) || 10000;
    
    setFilters(prev => ({
      ...prev,
      priceRange: {
        min: Math.min(min, max),
        max: Math.max(min, max)
      }
    }));
    setCurrentPage(1); // Reset to first page when changing filters
  };

  // Handle price input change
  const handlePriceInputChange = (type, value) => {
    const numValue = Number(value) || 0;
    if (type === 'min') {
      setMinPrice(numValue);
    } else {
      setMaxPrice(numValue);
    }
  };

  // Count products by availability
  const inStockCount = oversized.length;
  const outOfStockCount = 0;

  const renderWithLineBreaks = (text) => {
    if (!text) return null;
    return text.split('\\n').map((line, idx) => (
      <React.Fragment key={idx}>
        {line}
        <br />
      </React.Fragment>
    ));
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="tassels-container">
      {/* <TasselsNavbar /> */}

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
            <div className={`dropdown-content price-range${showPrice ? ' show' : ''}`}>
              <div className="price-inputs">
                <div className="input-wrapper">
                  <span className="currency-inside"><i className="fa-solid fa-indian-rupee-sign"></i></span>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    className="min-price"
                    value={minPrice}
                    onChange={e => handlePriceInputChange('min', e.target.value)}
                  />
                </div>
                <div className="input-wrapper">
                  <span className="currency-inside"><i className="fa-solid fa-indian-rupee-sign"></i></span>
                  <input
                    type="number"
                    min="0"
                    placeholder="10000"
                    className="max-price"
                    value={maxPrice}
                    onChange={e => handlePriceInputChange('max', e.target.value)}
                  />
                </div>
              </div>
              <button className="apply-btn" onClick={handlePriceChange}>APPLY</button>
              <input
                type="range"
                min="0"
                max="10000"
                value={maxPrice}
                onChange={e => handlePriceInputChange('max', e.target.value)}
                className="price-slider"
              />
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
            <i className="fa-solid fa-bars fa-rotate-90"></i>
          </button>
          <button
            className={activeView === 'vertical' ? 'active' : ''}
            onClick={() => setActiveView('vertical')}
          >
            <i className="fa-solid fa-grip-lines-vertical"></i>
          </button>
          <button
            className={activeView === 'list' ? 'active' : ''}
            onClick={() => setActiveView('list')}
          >
            <i className="fa-solid fa-bars"></i>
          </button>
        </div>
        
        <div className="tassels-sort-controls">
          <span className='sort'>Items Per Page</span>
          <select 
            className='tasssels-dropdown'
            value={itemsPerPage}
            onChange={handleItemsPerPageChange}
          >
            <option value={10}>10</option>
            <option value={15}>15</option>
            <option value={20}>20</option>
            <option value={25}>25</option>
            <option value={30}>30</option>
            <option value={50}>50</option>
          </select>
          <span className='sort'>Sort By</span>
          <select 
            className='tasssels-dropdown'
            value={sortBy}
            onChange={handleSortByChange}
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
            <div className="tassel-item" key={product.slug || product.id}>
              <div className="product-card">
                <div className="product-image" onClick={() => handleProductClick(product.slug)}>
                  <img 
                    src={getImageUrl(product.image)} 
                    alt={product.name} 
                    className="tassel-img"
                    onError={(e) => {
                      console.error('Image failed to load:', product.image);
                      e.target.onerror = null; // Prevent infinite loop
                      
                      // Try to load the original filename if the fixed version fails
                      const originalSrc = e.target.src;
                      const filename = originalSrc.split('/').pop();
                      const originalFilename = filename.replace('twril', 'twirl');
                      
                      if (originalFilename !== filename) {
                        e.target.src = `/images/products/${originalFilename}`;
                      } else {
                        // If all attempts fail, use placeholder
                        e.target.src = '/placeholder-image.jpg';
                      }
                    }}
                  />
                  <i 
                    className={`fa-${isInWishlist(product.id) ? 'solid' : 'regular'} fa-heart heart-hover`}
                    onClick={(e) => handleWishlistClick(e, product)}
                    style={{ pointerEvents: 'auto', cursor: 'pointer' }}
                  ></i>
                </div>
                <div className="product-details">
                  <h3 className="product-name">{product.name}</h3>
                  {activeView === 'list' && (
                    <p className="product-description">{renderWithLineBreaks(product.description)}</p>
                  )}
                  <p className="product-price">{product.price}</p>
                  <button 
                    className="choose-options-btn"
                    onClick={() => handleProductClick(product.slug)}
                  >
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