import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import productsFromJson from '../data/products.json'; // Import local JSON
import './ProductDescription.css';
import './ProductDescriptionMinime.css';
// import TasselsNavbar from '../components/TasselsNavbar';
import { useShop } from '../context/ShopContext';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { FaStar, FaTrash } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { getImageUrl } from '../utils/imageUtils';
import { isValidImagePath } from '../utils/validationUtils';
import { debounce } from 'lodash';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
// import '../styles/ImageLoader.css';

// Lazy load components
const ReviewForm = React.lazy(() => import('../components/ReviewForm'));
const ReviewList = React.lazy(() => import('../components/ReviewList'));

const ProductDescription = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart, addToWishlist, isInWishlist, removeFromWishlist } = useShop();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSize, setSelectedSize] = useState('');
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [mainImageHeight, setMainImageHeight] = useState(950);
  const [reviewRating, setReviewRating] = useState(0);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewName, setReviewName] = useState('');
  const [reviewEmail, setReviewEmail] = useState('');
  const [reviewMedia, setReviewMedia] = useState(null);
  const [reviewText, setReviewText] = useState('');
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [mainImage, setMainImage] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [showcaseProducts, setShowcaseProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [expandedSections, setExpandedSections] = useState({});

  // Memoize expensive computations
  const memoizedImageUrl = useCallback((imagePath) => {
    return getImageUrl(imagePath);
  }, []);

  // Optimize image loading with lazy loading
  const ImageWithFallback = useCallback(({ src, alt, className, onError }) => {
    return (
      <img
        loading="lazy"
        src={src}
        alt={alt}
        className={className}
        onError={onError}
      />
    );
  }, []);

  // Debounce expensive operations
  const debouncedFetchProduct = useCallback(
    debounce(async () => {
      try {
        setLoading(true);
        console.log('Looking for product with slug:', slug);
        
        // Try to fetch from API first
        let productFromApi = null;
        try {
          const response = await fetch(`http://localhost:5000/api/products`);
          if (response.ok) {
            const products = await response.json();
            productFromApi = products.find(p => p.slug === slug);
            console.log('Product from API:', productFromApi);
            
            // Process image paths for API products
            if (productFromApi) {
              // Process main image
              if (productFromApi.image) {
                const imagePath = productFromApi.image.replace(/"/g, '').trim();
                // If it's already a Cloudinary URL, keep it as is
                if (imagePath.includes('cloudinary.com')) {
                  productFromApi.image = imagePath;
                } else if (imagePath.startsWith('/images/products/')) {
                  // If it's already a local path, keep it as is
                  productFromApi.image = imagePath;
                } else {
                  // Otherwise, try to get the Cloudinary URL from imagesMapping
                  const cloudinaryUrl = productFromApi.imagesMapping?.[imagePath];
                  if (cloudinaryUrl) {
                    productFromApi.image = cloudinaryUrl;
                  } else {
                    // If no mapping found, convert to local path
                    const filename = imagePath.split(/[\\/]/).pop().replace(/\(1\)/, '');
                    productFromApi.image = `/images/products/${filename}`;
                  }
                }
              }
              
              // Process additional images
              if (productFromApi.images && Array.isArray(productFromApi.images)) {
                productFromApi.images = productFromApi.images.map(img => {
                  const imagePath = img.replace(/"/g, '').trim();
                  // If it's already a Cloudinary URL, keep it as is
                  if (imagePath.includes('cloudinary.com')) {
                    return imagePath;
                  } else if (imagePath.startsWith('/images/products/')) {
                    // If it's already a local path, keep it as is
                    return imagePath;
                  } else {
                    // Otherwise, try to get the Cloudinary URL from imagesMapping
                    const cloudinaryUrl = productFromApi.imagesMapping?.[imagePath];
                    if (cloudinaryUrl) {
                      return cloudinaryUrl;
                    } else {
                      // If no mapping found, convert to local path
                      const filename = imagePath.split(/[\\/]/).pop().replace(/\(1\)/, '');
                      return `/images/products/${filename}`;
                    }
                  }
                });
              }
            }
          }
        } catch (apiError) {
          console.warn('API request failed:', apiError);
        }
        
        // If not found in API, try JSON file
        if (!productFromApi) {
          console.log('Available products from JSON:', productsFromJson.map(p => ({ name: p.name, slug: p.slug })));
          const productFromJson = productsFromJson.find(p => p.slug === slug);
          console.log('Product from JSON:', productFromJson);
          
          if (!productFromJson) {
            throw new Error(`Product not found with slug: ${slug}`);
          }
          setProduct(productFromJson);
          setSelectedSize(productFromJson.sizes[0] || '');
          // Set the first image as main image if available
          if (productFromJson.images && productFromJson.images.length > 0) {
            setMainImage(productFromJson.images[0]);
          } else {
            setMainImage(productFromJson.image || '');
          }
        } else {
          setProduct(productFromApi);
          setSelectedSize(productFromApi.sizes[0] || '');
          // Set the first image as main image if available
          if (productFromApi.images && productFromApi.images.length > 0) {
            setMainImage(productFromApi.images[0]);
          } else {
            setMainImage(productFromApi.image || '');
          }
        }
        console.log('Product data:', product);
      } catch (err) {
        setError(err.message);
        console.error('Error loading product:', err);
      } finally {
        setLoading(false);
      }
    }, 300),
    []
  );

  // Memoize product sections
  const sections = useMemo(() => [
    {
      key: 'description',
      label: 'DESCRIPTION',
      content: product?.description || 'No description available.',
    },
    {
      key: 'shipping',
      label: 'SHIPPING & RETURNS',
      content: product?.shippingInfo || 'Free shipping on all orders.',
    },
    {
      key: 'returns',
      label: 'RETURNS',
      content: product?.returnPolicy || 'Returns are accepted within 30 days of purchase.',
    },
  ], [product]);

  // Optimize recently viewed products
  const fetchAndUpdateRecentlyViewed = useCallback(async () => {
    try {
      const stored = localStorage.getItem('recentlyViewed');
      if (stored) {
        const recentlyViewed = JSON.parse(stored);
        const validRecentlyViewed = recentlyViewed
          .filter(item => 
            item && 
            item.slug && 
            item.image && 
            isValidImagePath(item.image)
          )
          .slice(0, 3);
        
        localStorage.setItem('recentlyViewed', JSON.stringify(validRecentlyViewed));
        setRecentlyViewed(validRecentlyViewed);
      }
    } catch (error) {
      console.error('Error updating recently viewed:', error);
    }
  }, []);

  // Optimize showcase products
  const fetchShowcaseProducts = useCallback(async () => {
    try {
      // Get all products from the local data
      const allProducts = [...productsFromJson];
      
      // Filter out the current product
      const filteredProducts = allProducts.filter(p => p.slug !== slug);
      
      // Randomly select 4 products
      const randomProducts = filteredProducts
        .sort(() => 0.5 - Math.random())
        .slice(0, 4);
      
      setShowcaseProducts(randomProducts);
    } catch (error) {
      console.error('Error fetching showcase products:', error);
      setShowcaseProducts([]);
    }
  }, [slug]);

  // Use effect with cleanup
  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      if (mounted) {
        await Promise.all([
          debouncedFetchProduct(),
          fetchShowcaseProducts(),
          fetchAndUpdateRecentlyViewed()
        ]);
      }
    };

    loadData();

    return () => {
      mounted = false;
    };
  }, [debouncedFetchProduct, fetchShowcaseProducts, fetchAndUpdateRecentlyViewed]);

  // Optimize render methods
  const renderProductImage = useCallback(() => (
    <ImageWithFallback
      src={memoizedImageUrl(product?.image)}
      alt={product?.name}
      className={`main-image ${expandedSections['description'] ? 'expanded' : ''}`}
      onError={(e) => {
        console.error('Image failed to load:', product?.image);
        e.target.src = '/placeholder-image.jpg';
      }}
    />
  ), [product?.image, product?.name, expandedSections['description'], memoizedImageUrl]);

  const renderThumbnails = useCallback(() => (
    <div className="thumbnails">
      {product?.images?.map((img, idx) => (
        <ImageWithFallback
          key={idx}
          src={memoizedImageUrl(img)}
          alt={`${product.name} - View ${idx + 1}`}
          className={`thumbnail ${selectedImage === idx ? 'selected' : 'not-selected'}`}
          onClick={() => setSelectedImage(idx)}
        />
      ))}
    </div>
  ), [product?.images, product?.name, selectedImage, memoizedImageUrl]);

  const handleSectionToggle = (sectionKey) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionKey]: !prev[sectionKey]
    }));
    setMainImageHeight(expandedSections[sectionKey] ? 1400 : 950);
  };

  const renderWithLineBreaks = (text) => {
    if (!text) return null;
    
    // First decode HTML entities
    const decodedText = text
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&nbsp;/g, ' ')
      // Handle all types of newlines and remove literal backslashes
      .replace(/\\{1,3}n/g, '\n')  // Replace \n, \\n, \\\n with actual newlines
      .replace(/\/\/n/g, '\n')     // Replace //n with actual newlines
      .replace(/\\"/g, '"')        // Replace \" with "
      .replace(/\\'/g, "'")        // Replace \' with '
      .replace(/\\\\/g, '\\')      // Replace \\ with \
      .replace(/\\r/g, '')         // Remove \r
      .replace(/\\t/g, '    ');    // Replace \t with spaces

    // Split by newlines and filter out empty lines
    const lines = decodedText.split('\n').filter(line => line.trim() !== '');
    
    return lines.map((line, index) => (
      <React.Fragment key={index}>
        {line}
        {index < lines.length - 1 && <br />}
      </React.Fragment>
    ));
  };

  const handleWishlistClick = (e, product) => {
    e.stopPropagation(); // Prevent product click when clicking heart
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  const handleProductClick = (productSlug) => {
    // Force a page reload to ensure proper data loading
    window.location.href = `/product/${productSlug}`;
  };

  const handleAddToCart = () => {
    if (!selectedSize) {
      toast.error('Please select a size');
      return;
    }
    
    addToCart({
      ...product,
      quantity,
      selectedSize
    });

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

  const handleWishlistToggle = () => {
    // Check if user is logged in
    if (!user) {
      alert('Please login to add items to your wishlist');
      return;
    }

    // Use slug as identifier for JSON products
    const productId = product._id || product.slug;
    if (!productId) {
      console.error('Product missing both _id and slug:', product);
      alert('Unable to add product to wishlist: Missing product identifier');
      return;
    }

    // Check if product is from JSON or MongoDB
    const isJsonProduct = !product._id;
    console.log('Product type:', isJsonProduct ? 'JSON' : 'MongoDB', product);

    if (isInWishlist(productId)) {
      removeFromWishlist(productId);
    } else {
      addToWishlist(product);
    }
  };

  // Add new useEffect for fetching reviews
  useEffect(() => {
    const fetchReviews = async () => {
      if (!product) return;
      setLoadingReviews(true);
      try {
        console.log('Fetching reviews for product:', {
          name: product.name,
          slug: product.slug
        });
        const response = await axios.get(`http://localhost:5000/api/reviews/product/${product.slug}`);
        setReviews(response.data);
      } catch (error) {
        console.error('Error fetching reviews:', error);
      } finally {
        setLoadingReviews(false);
      }
    };
    fetchReviews();
  }, [product]);

  const handleDeleteReview = async (reviewId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please login to delete your review');
        return;
      }

      const confirmDelete = window.confirm('Are you sure you want to delete this review?');
      if (!confirmDelete) return;

      await axios.delete(`http://localhost:5000/api/reviews/${reviewId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      // Refresh the reviews list
      fetchReviews();
    } catch (error) {
      console.error('Error deleting review:', error);
      alert(error.response?.data?.message || 'Failed to delete review');
    }
  };

  // Add console logs to debug user and reviews
  useEffect(() => {
    console.log('Current user:', user);
  }, [user]);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!reviewName || !reviewEmail || !reviewRating || !reviewText) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Validate rating
    if (reviewRating < 1 || reviewRating > 5) {
      toast.error('Please select a rating between 1 and 5 stars');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('productName', product.name);
      formData.append('productSlug', product.slug);
      formData.append('rating', reviewRating);
      formData.append('title', reviewName);
      formData.append('content', reviewText);
      if (reviewMedia) {
        formData.append('images', reviewMedia);
      }

      // Get the token from localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please log in to submit a review');
        return;
      }

      // Log the data being sent
      console.log('Submitting review with data:', {
        productName: product.name,
        productSlug: product.slug,
        rating: reviewRating,
        title: reviewName,
        content: reviewText,
        hasMedia: !!reviewMedia
      });

      const response = await axios.post(
        'http://localhost:5000/api/reviews',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          },
        }
      );

      console.log('Review submission response:', response.data);

      // Add the new review to the reviews list
      setReviews(prevReviews => [response.data, ...prevReviews]);
      
      // Reset form
      setReviewName('');
      setReviewEmail('');
      setReviewRating(0);
      setReviewText('');
      setReviewMedia(null);
      setShowReviewModal(false);

      toast.success('Review submitted successfully!');
    } catch (error) {
      console.error('Error submitting review:', error);
      console.error('Server response:', error.response?.data);
      
      if (error.response?.status === 400) {
        if (error.response?.data?.message?.includes('already reviewed')) {
          toast.error('You have already reviewed this product');
          // Refresh the reviews list to show the existing review
          const response = await axios.get(`http://localhost:5000/api/reviews/product/${product.slug}`);
          setReviews(response.data);
        } else {
          toast.error(error.response?.data?.message || 'Invalid review data. Please check your input.');
        }
      } else if (error.response?.status === 401) {
        toast.error('Please log in to submit a review');
      } else {
        toast.error('Failed to submit review. Please try again later.');
      }
    }
  };

  // Update the renderReviews function
  const renderReviews = () => {
    if (loadingReviews) {
      return <div className="loading-reviews">Loading reviews...</div>;
    }

    if (!reviews || reviews.length === 0) {
      return <div className="no-reviews">No reviews yet. Be the first to review this product!</div>;
    }

    return (
      <div className="reviews-container">
        {reviews.map((review) => (
          <div key={review._id} className="review-card">
            <div className="review-header">
              <div className="review-rating">
                {[...Array(5)].map((_, index) => (
                  <FaStar
                    key={index}
                    className={index < review.rating ? 'star filled' : 'star'}
                  />
                ))}
              </div>
              <div className="review-meta">
                <span className="reviewer-name">{review.title}</span>
                <span className="review-date">
                  {new Date(review.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
            <div className="review-content">
              {review.content}
            </div>
            {review.images && review.images.length > 0 && (
              <div className="review-images">
                {review.images.map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`Review image ${index + 1}`}
                    className="review-image"
                  />
                ))}
              </div>
            )}
            {(user?.isAdmin || review.user === user?._id) && (
              <button
                className="delete-review-btn"
                onClick={() => handleDeleteReview(review._id)}
              >
                <FaTrash /> Delete
              </button>
            )}
          </div>
        ))}
      </div>
    );
  };

  // Update the section content rendering
  const renderSectionContent = (section) => {
    if (section.key === 'reviews') {
      return renderReviews();
    }
    return renderWithLineBreaks(section.content);
  };

  if (loading) return <div className="loading">Loading product...</div>;
  if (error) return <div className="error">Error: {error}</div>;
  if (!product) return <div className="error">Product not found</div>;

  return (
    <div 
      className={`product-page ${product?.category === 'minime' ? 'minime' : ''}`}
      data-slug={product?.slug}
    >
      <div className="product-navbar-container">
        {/* <TasselsNavbar /> */}
      </div>
      <div className="product-container">
        <nav className="breadcrumb">
          <Link to="/" style={{textDecoration: 'none'}}>Home</Link> <span className="breadcrumb-separator"> / </span> <span>{product.name}</span>
        </nav>
        <div className="product-images">
          {renderThumbnails()}
          {renderProductImage()}
        </div>
        <div className="product-details">
          <h2 className="product-title">{product.name}</h2>
          <p className="product-price">{product.price}</p>
          <div className="product-sizes">
            <span className="size" data-size={selectedSize}>Size: </span>
            {product.sizes.map(size => (
              <button
                key={size}
                className={`size-button ${selectedSize === size ? 'active' : ''}`}
                onClick={() => setSelectedSize(size)}
                data-size={size}
              >
                {size}
              </button>
            ))}
            <span className="size-guide" onClick={() => setShowSizeGuide(true)}>
              <i className="fa-solid fa-ruler" style={{marginRight: '10px', fontSize: '1.2rem'}}></i>SIZE GUIDE
            </span>
          </div>
          <p className="product-color">Color: {product.color || 'Light-Lavendar'}</p>
          <p className="model-info"><b>Model is Wearing Size M</b></p>
          <p className="product-ratings">
            {[1, 2, 3, 4, 5].map((star) => {
              const rating = product.ratings || 0;
              const starClass = rating >= star ? 'fas' : 
                               rating >= star - 0.5 ? 'fas fa-star-half-alt' : 'far';
              return (
                <i 
                  key={star}
                  className={`${starClass} fa-star`}
                  style={{ 
                    color: rating >= star - 0.5 ? '#FFD700' : '#ddd',
                    marginRight: '2px'
                  }}
                />
              );
            })}
          </p>
          <div className="product-quantity">
            <input 
              type="number" 
              min="1" 
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              className="quantity-input" 
            />
          </div>
          <button className="add-to-cart" onClick={handleAddToCart}>
            ADD TO CART - {product.price}
          </button>
          <button 
            className="wishlist"
            onClick={handleWishlistToggle}
          >
            <i className={`fa-${isInWishlist(product._id || product.id) ? 'solid' : 'regular'} fa-heart ${isInWishlist(product._id || product.id) ? 'active' : ''}`}></i>
          </button>
          {sections.map(section => (
            <div
              className={`expandable-section${section.key === 'description' ? ' description-section' : ''}`}
              key={section.key}
            >
              <button
                className="expand-btn"
                onClick={() => handleSectionToggle(section.key)}
              >
                {section.label}
                <i className={`fas fa-chevron-${expandedSections[section.key] ? 'up' : 'down'}`}></i>
              </button>
              <div className={`expand-content ${expandedSections[section.key] ? 'open' : ''}`}>
                {renderSectionContent(section)}
              </div>
            </div>
          ))}

          {/* Customer Reviews Section */}
          <div className="customer-reviews-section" style={{
            marginTop: '100px',
            padding: '32px 95px',
            width:'700px',
            borderBottom: '1px solid #eee',
            alignItems: 'center',
            justifyContent: 'center',
            transform: 'translateX(-520px)',
          }}>
            <h2
              style={{
                fontFamily: 'PT Sans, sans-serif',
                fontWeight: 400,
                fontSize: '1.5rem',
                marginBottom: '18px',
                color: '#444',
                textAlign: 'center',
              }}
            >
              Customer Reviews
            </h2>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '32px',
                maxWidth: '600px',
                margin: '0 auto',
              }}
            >
              <div style={{ flex: 1, textAlign: 'center' }}>
                <div style={{ marginBottom: '12px', fontSize: '1.3rem', color: '#b8a89a', cursor: 'pointer' }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      onClick={() => setReviewRating(star)}
                      style={{
                        color: star <= reviewRating ? '#b8a89a' : '#ffd700',
                        fontSize: '1.7rem',
                        transition: 'color 0.2s',
                        cursor: 'pointer',
                        marginRight: 2,
                      }}
                      title={`Rate ${star} star${star > 1 ? 's' : ''}`}
                    >
                      ★
                    </span>
                  ))}
                </div>
                <div style={{ color: '#222', fontSize: '1.1rem',marginTop:'-10px' }}>Be the first to write a review</div>
              </div>
              {/* Vertical Divider */}
              <div
                style={{
                  width: '1px',
                  height: '48px',
                  background: '#ccc',
                  margin: '0 16px',
                  color:'#5f5e5e',
                }}
              />
              <div style={{ flex: 1, textAlign: 'center' }}>
                <button
                  style={{
                    background: '#6b4c3b',
                    color: '#fff',
                    border: 'none',
                    padding: '12px 32px',
                    fontSize: '1.1rem',
                    borderRadius: '2px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    letterSpacing: '0.5px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                    marginTop:'15px',
                  }}
                  onClick={() => setShowReviewModal(true)}
                >
                  Write a review
                </button>
              </div>
            </div>
          </div>

          {/* Reviews List Section */}
          <div className="customer-reviews-section" style={{
            marginTop: '20px',
            padding: '32px 95px',
            width:'700px',
            borderBottom: '1px solid #eee',
            alignItems: 'center',
            justifyContent: 'center',
            transform: 'translateX(-520px)',
          }}>
            {loadingReviews ? (
              <div className="loading-reviews">Loading reviews...</div>
            ) : reviews.length > 0 ? (
              <div className="reviews-list">
                {reviews.map((review) => (
                  <div key={review._id} className="review-item">
                    <div className="review-header">
                      <div className="reviewer-info">
                        <span className="reviewer-name">{review.user.name}</span>
                        <span className="review-date">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="review-actions">
                        <div className="star-rating">
                          {[...Array(5)].map((_, index) => (
                            <FaStar
                              key={index}
                              className={index < review.rating ? 'star filled' : 'star'}
                            />
                          ))}
                        </div>
                        {user && review.user._id === user._id && (
                          <button 
                            className="delete-review-btn"
                            onClick={() => handleDeleteReview(review._id)}
                            title="Delete review"
                            aria-label="Delete review"
                            style={{ 
                              display: 'flex', 
                              alignItems: 'center',
                              visibility: 'visible',
                              opacity: 1
                            }}
                          >
                            <FaTrash size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                    <h4 className="review-title">{review.title}</h4>
                    <p className="review-content">{review.content}</p>
                    {review.images && review.images.length > 0 && (
                      <div className="review-images">
                        {review.images.map((image, index) => (
                          <img
                            key={index}
                            src={image}
                            alt={`Review image ${index + 1}`}
                            className="review-image"
                          />
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-reviews">
                <p>No reviews yet. Be the first to review this product!</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Size Guide Modal */}
      <div className={`size-guide-modal ${showSizeGuide ? 'active' : ''}`}>
        <div className="size-guide-content">
          <button className="size-guide-close" onClick={() => setShowSizeGuide(false)}>
            <i className="fa-solid fa-xmark"></i>
          </button>
          <img 
            src="/images/size.png" 
            alt="Size Guide"
            className="size-guide-image"
          />
        </div>
      </div>

      {/* Review Modal */}
      {showReviewModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000,
          }}
          onClick={() => setShowReviewModal(false)}
        >
          <div
            style={{
              background: '#fff',
              padding: '32px 24px',
              borderRadius: '8px',
              minWidth: '350px',
              maxWidth: '90vw',
              position: 'relative',
              boxShadow: '0 4px 24px rgba(0,0,0,0.15)',
            }}
            onClick={e => e.stopPropagation()}
          >
            <button
              style={{
                position: 'absolute',
                top: 10,
                right: 10,
                background: 'none',
                border: 'none',
                fontSize: '1.5rem',
                cursor: 'pointer',
                color: '#888',
              }}
              onClick={() => setShowReviewModal(false)}
              aria-label="Close"
            >
              ×
            </button>
            <h3 style={{ marginBottom: 16 }}>Write a Review</h3>
            <form onSubmit={handleSubmitReview}>
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontWeight: 600, display: 'block', marginBottom: 4 }}>
                  Public Name
                </label>
                <input
                  type="text"
                  value={reviewName}
                  onChange={e => setReviewName(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '8px',
                    borderRadius: '4px',
                    border: '1px solid #ccc',
                    marginBottom: 8,
                    fontSize: '1rem',
                  }}
                  placeholder="Your name (public)"
                />
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontWeight: 600, display: 'block', marginBottom: 4 }}>
                  Private Email
                </label>
                <input
                  type="email"
                  value={reviewEmail}
                  onChange={e => setReviewEmail(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '8px',
                    borderRadius: '4px',
                    border: '1px solid #ccc',
                    marginBottom: 8,
                    fontSize: '1rem',
                  }}
                  placeholder="Your email (not shown publicly)"
                />
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontWeight: 600, display: 'block', marginBottom: 4 }}>
                  Picture/Video (optional)
                </label>
                <input
                  type="file"
                  accept="image/*,video/*"
                  onChange={e => setReviewMedia(e.target.files[0])}
                  style={{
                    width: '100%',
                    marginBottom: 8,
                  }}
                />
              </div>
              <div style={{ marginBottom: 12 }}>
                <span style={{ fontWeight: 600 }}>Your Rating: </span>
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    onClick={() => setReviewRating(star)}
                    style={{
                      color: star <= reviewRating ? '#b8a89a' : '#ffd700',
                      fontSize: '1.7rem',
                      cursor: 'pointer',
                      marginRight: 2,
                    }}
                    title={`Rate ${star} star${star > 1 ? 's' : ''}`}
                  >
                    ★
                  </span>
                ))}
              </div>
              <textarea
                placeholder="Write your review here..."
                rows={5}
                value={reviewText}
                onChange={e => setReviewText(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '4px',
                  border: '1px solid #ccc',
                  marginBottom: 16,
                  fontSize: '1rem',
                }}
                required
              />
              <button
                type="submit"
                style={{
                  background: '#6b4c3b',
                  color: '#fff',
                  border: 'none',
                  padding: '10px 24px',
                  fontSize: '1rem',
                  borderRadius: '2px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  letterSpacing: '0.5px',
                }}
              >
                Submit Review
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="recently-viewed-container">
        <h2 className="recently-viewed-title">
          Recently Viewed Products
        </h2>
        <div className="recently-viewed-grid">
          {recentlyViewed && recentlyViewed.length > 0 ? (
            recentlyViewed.map((item, idx) => (
              <div key={idx} className="recently-viewed-item">
                <div 
                  className="recently-viewed-image-container"
                  onClick={() => handleProductClick(item.slug)}
                >
                  <img
                    src={getImageUrl(item.image)}
                    alt={item.name}
                    className="recently-viewed-img"
                    onError={(e) => {
                      console.error('Image failed to load:', {
                        image: item.image,
                        item: item
                      });
                      e.target.src = '/placeholder-image.jpg';
                    }}
                  />
                  <i 
                    className={`fa-${isInWishlist(item.id) ? 'solid' : 'regular'} fa-heart recently-viewed-heart ${isInWishlist(item.id) ? 'active' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (isInWishlist(item.id)) {
                        removeFromWishlist(item.id);
                      } else {
                        addToWishlist(item);
                      }
                    }}
                  ></i>
                </div>
                <div className="recently-viewed-details">
                  <div className="recently-viewed-name">{item.name}</div>
                  <div className="recently-viewed-price">{item.price}</div>
                  <button
                    onClick={() => handleProductClick(item.slug)}
                    className="recently-button"
                  >
                    Choose Options
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="no-recently-viewed">
              <p>No recently viewed products</p>
            </div>
          )}
        </div>
      </div>

      {/* Customers Also Viewed Section */}
      <div className="section-title">Customers Also Viewed</div>
      <hr className="section-divider" />

      <div className="showcase-container">
        <div className="showcase-grid">
          {showcaseProducts.map((item, idx) => (
            <div key={idx} className="showcase-item">
              <div
                className="showcase-image-container"
                onClick={() => handleProductClick(item.slug)}
              >
                <img
                  src={getImageUrl(item.image)}
                  alt={item.name}
                  className="showcase-img"
                  onError={(e) => {
                    console.error('Showcase image failed to load:', item.image);
                    e.target.src = '/placeholder-image.jpg';
                  }}
                />
                {/* <i 
                  className={`fa-${isInWishlist(item.id) ? 'solid' : 'regular'} fa-heart showcase-heart ${isInWishlist(item.id) ? 'active' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (isInWishlist(item.id)) {
                      removeFromWishlist(item.id);
                    } else {
                      addToWishlist(item);
                    }
                  }}
                ></i> */}
              </div>
              <div className="showcase-details">
                <div className="showcase-name">{item.name}</div>
                <div className="showcase-price">{item.price}</div>
                <button
                  onClick={() => handleProductClick(item.slug)}
                  className="showcase-button"
                >
                  Choose Options
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default React.memo(ProductDescription);
