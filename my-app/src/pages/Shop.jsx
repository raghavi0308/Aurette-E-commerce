import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './Shop.css';
import './ProductDescription.css';
import productsFromJson from '../data/products.json';
import ProductCard from '../components/ProductCard';

const Shop = () => {
  const navigate = useNavigate();
  const { addToWishlist, removeFromWishlist, wishlistItems } = useShop();
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
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortBy, setSortBy] = useState('featured');
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 12;

  // Create a simple gray placeholder image
  const placeholderImage = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjUwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjUwMCIgZmlsbD0iI2VlZSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjAiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5JbWFnZSBub3QgZm91bmQ8L3RleHQ+PC9zdmc+';

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
            console.log('Products from API:', productsFromApi);
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

        console.log('All products:', allProducts);
        setProducts(allProducts);
      } catch (err) {
        console.error('Error processing products:', err);
        setError('Error loading products. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const handleProductClick = (slug) => {
    navigate(`/product/${slug}`);
  };

  // Helper function to convert price string to number
  const getPriceAsNumber = (priceString) => {
    return parseInt(priceString.replace(/[^0-9]/g, ''));
  };

  // Apply filters and sorting
  const filteredAndSortedProducts = products
    .filter(product => {
      // Price filter
      const productPrice = getPriceAsNumber(product.price);
      if (productPrice < filters.minPrice || productPrice > filters.maxPrice) return false;

      return true;
    })
    .sort((a, b) => {
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
          return 0; // 'featured' or 'best-selling' - keep original order
      }
    });

  // Calculate pagination
  const totalPages = Math.ceil(filteredAndSortedProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProducts = filteredAndSortedProducts.slice(startIndex, endIndex);

  // Count products by availability (using total products count)
  const inStockCount = filteredAndSortedProducts.length; // Show total count of products
  const outOfStockCount = 0; // Always show 0 for out of stock

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  const handleSortByChange = (e) => {
    setSortBy(e.target.value);
    setCurrentPage(1); // Reset to first page when changing sort
  };

  const handleAvailabilityChange = (type) => {
    setFilters(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
    setCurrentPage(1); // Reset to first page when changing filters
  };

  const handlePriceChange = () => {
    setFilters(prev => ({
      ...prev,
      minPrice: Math.min(minPrice, maxPrice),
      maxPrice: Math.max(minPrice, maxPrice)
    }));
    setCurrentPage(1); // Reset to first page when changing filters
  };

  const handleWishlistClick = (e, product) => {
    e.stopPropagation();
    if (wishlistItems.some(item => item.id === product.id)) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  const renderWithLineBreaks = (text) => {
    if (!text) return null;
    return text.split('\\n').map((line, idx) => (
      <React.Fragment key={idx}>
        {line}
        <br />
      </React.Fragment>
    ));
  };

  // Helper function to get image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return placeholderImage;
    
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

  if (loading) return <div className="loading">Loading products...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="shop-container">
      <ToastContainer />
      <div className="shop-filters">
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
                      onChange={(e) => setMinPrice(Number(e.target.value))}
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
                      onChange={(e) => setMaxPrice(Number(e.target.value))}
                      min={minPrice}
                    />
                  </div>
                </div>
                <input
                  type="range"
                  min="0"
                  max="10000"
                  value={maxPrice}
                  onChange={handlePriceChange}
                  className="price-slider"
                />
                <button 
                  className="apply-btn"
                  onClick={handlePriceChange}
                >
                  Apply
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="shop-filter-bar">
        <div className="shop-view-toggle">
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

        <div className="shop-sort-controls">
        <span className='sort'>Items Per Page</span>
          <select 
            className='tasssels-dropdown'
            value={itemsPerPage}
            onChange={handleItemsPerPageChange}
          >
            <option key="10" value={10}>10</option>
            <option key="15" value={15}>15</option>
            <option key="20" value={20}>20</option>
            <option key="25" value={25}>25</option>
            <option key="30" value={30}>30</option>
            <option key="50" value={50}>50</option>
          </select>
          <span className="sort">Sort By</span>
          <select 
            className="shop-dropdown"
            value={sortBy}
            onChange={handleSortByChange}
          >
            <option key="featured" value="featured">Featured</option>
            <option key="best-selling" value="best-selling">Best Selling</option>
            <option key="alphabetically-az" value="alphabetically-az">Alphabetically, A-Z</option>
            <option key="alphabetically-za" value="alphabetically-za">Alphabetically, Z-A</option>
            <option key="price-low-high" value="price-low-high">Price: Low to High</option>
            <option key="price-high-low" value="price-high-low">Price: High to Low</option>
            <option key="date-new-old" value="date-new-old">Date: New to Old</option>
            <option key="date-old-new" value="date-old-new">Date: Old to New</option>
          </select>
        </div>
      </div>
      
      <div className="shop-divider"></div>
      <div className="shop-content">
        <div className={`shop-grid ${activeView}`}>
          {currentProducts.map(product => {
            console.log('Rendering product:', product.name, 'with image:', product.image);
            return (
              <div className="shop-item" key={product.id}>
                <div className="product-card">
                  <div className="product-image" onClick={() => handleProductClick(product.slug)}>
                    <img
                      src={getImageUrl(product.image)}
                      alt={product.name}
                      className="product-img"
                      onError={(e) => {
                        console.error('Image failed to load:', e.target.src);
                        e.target.onerror = null;
                        e.target.src = placeholderImage;
                      }}
                    />
                    <i 
                      className={`fa-${wishlistItems.some(item => item.id === product.id) ? 'solid' : 'regular'} fa-heart heart-hover`}
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
                    <button className="choose-options-btn" onClick={() => handleProductClick(product.slug)}>
                      Choose Options
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Shop; 