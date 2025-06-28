import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FaTrash } from 'react-icons/fa';
import './Orders.css';
import { toast } from 'react-toastify';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [reviewForm, setReviewForm] = useState({
    rating: 0,
    title: '',
    content: '',
    images: []
  });

  // Add function to create slug from name
  const createSlug = (name) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const fetchOrders = async () => {
    if (!user || !user.email) {
      setError('Please login to view your orders');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`http://localhost:5000/api/orders/user/${user.email}`, {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });
      
      console.log('Raw orders data:', response.data);
      
      // Sort orders by createdAt date in descending order (most recent first)
      const sortedOrders = response.data.sort((a, b) => {
        const dateA = new Date(a.orderedAt || a.createdAt);
        const dateB = new Date(b.orderedAt || b.createdAt);
        return dateB - dateA;
      });
      
      console.log('Sorted orders:', sortedOrders);
      setOrders(sortedOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError(error.response?.data?.message || 'Failed to load orders. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [user]);

  const getStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'processing':
        return 'status-badge processing';
      case 'confirmed':
        return 'status-badge confirmed';
      case 'shipped':
        return 'status-badge shipping';
      case 'delivered':
        return 'status-badge delivered';
      case 'cancelled':
        return 'status-badge cancelled';
      default:
        return 'status-badge';
    }
  };

  const formatPaymentInfo = (order) => {
    if (!order.paymentMethod) return 'N/A';
    
    let paymentInfo = order.paymentMethod.toUpperCase();
    if (order.paymentId) {
      paymentInfo += ` (ID: ${order.paymentId.slice(0, 8)}...)`;
    }
    return paymentInfo;
  };

  const handleRemoveItem = async (orderId, itemId) => {
    if (window.confirm('Are you sure you want to cancel this order?')) {
      try {
        const response = await axios.delete(`http://localhost:5000/api/orders/${orderId}/items/${itemId}`, {
          headers: {
            'Authorization': `Bearer ${user.token}`
          }
        });
        if (response.status === 200) {
          // Update the orders list by removing the item
          setOrders(orders.map(order => {
            if (order._id === orderId) {
              return {
                ...order,
                items: order.items.filter(item => item._id !== itemId)
              };
            }
            return order;
          }));
          toast.success('Item removed successfully');
        }
      } catch (error) {
        console.error('Error removing item:', error);
        toast.error('Failed to remove item');
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        console.error('Invalid date:', dateString);
        return 'Invalid Date';
      }
      return date.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid Date';
    }
  };

  const formatPrice = (price) => {
    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice)) return 'N/A';
    return `₹${parsedPrice.toFixed(2)}`;
  };

  const handleReviewClick = (item, order) => {
    if (order.orderStatus !== 'Delivered') {
      toast.error('You can only review products from delivered orders');
      return;
    }
    setSelectedProduct(item);
    setSelectedOrder(order);
    setShowReviewModal(true);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    try {
      // Validate required fields
      if (!reviewForm.rating || !reviewForm.title || !reviewForm.content) {
        toast.error('Please fill in all required fields');
        return;
      }

      // Validate rating
      if (reviewForm.rating < 1 || reviewForm.rating > 5) {
        toast.error('Please select a rating between 1 and 5 stars');
        return;
      }

      // Validate selected product and order
      if (!selectedProduct) {
        toast.error('No product selected for review');
        return;
      }

      if (!selectedOrder || !selectedOrder._id) {
        toast.error('Invalid order selected for review');
        return;
      }

      // Validate order status
      if (selectedOrder.orderStatus !== 'Delivered') {
        toast.error('You can only review products from delivered orders');
        return;
      }

      const formData = new FormData();
      // Get product data from the selected item
      const productName = selectedProduct.product?.name || selectedProduct.name;
      const productSlug = selectedProduct.product?.slug || selectedProduct.slug || (productName ? createSlug(productName) : 'unknown-product');
      
      // Log the selected product data for debugging
      console.log('Selected product data:', {
        product: selectedProduct.product,
        name: selectedProduct.name,
        slug: selectedProduct.slug
      });
      
      formData.append('orderId', selectedOrder._id);
      formData.append('productName', productName);
      formData.append('productSlug', productSlug);
      formData.append('rating', reviewForm.rating);
      formData.append('title', reviewForm.title);
      formData.append('content', reviewForm.content);
      
      // Append images if any
      if (reviewForm.images && reviewForm.images.length > 0) {
        reviewForm.images.forEach(image => {
          formData.append('images', image);
        });
      }

      // Get the token from localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please log in to submit a review');
        return;
      }

      // Log the form data for debugging
      console.log('Submitting review with data:', {
        orderId: selectedOrder._id,
        orderStatus: selectedOrder.orderStatus,
        productName,
        productSlug,
        orderItemDetails: {
          name: productName,
          slug: productSlug
        },
        rating: reviewForm.rating,
        title: reviewForm.title,
        content: reviewForm.content,
      });

      const response = await axios.post('http://localhost:5000/api/reviews', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data) {
        toast.success('Review submitted successfully!');
        setShowReviewModal(false);
        setReviewForm({
          rating: 0,
          title: '',
          content: '',
          images: []
        });
        // Refresh orders to show the updated review status
        await fetchOrders();
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      if (error.response?.status === 400) {
        if (error.response?.data?.message?.includes('already reviewed')) {
          toast.error('You have already reviewed this product');
        } else if (error.response?.data?.message?.includes('not found or not delivered')) {
          toast.error('This order is not delivered yet');
        } else if (error.response?.data?.message?.includes('not in this order')) {
          toast.error('This product was not in this order');
        } else {
          toast.error(error.response?.data?.message || 'Invalid review data. Please check your input.');
        }
      } else {
        toast.error('Failed to submit review. Please try again.');
      }
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setReviewForm(prev => ({
      ...prev,
      images: files
    }));
  };

  const handleDeleteReview = async (reviewId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please log in to delete a review');
        return;
      }

      const response = await axios.delete(`http://localhost:5000/api/reviews/${reviewId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data) {
        toast.success('Review deleted successfully!');
        // Refresh orders to show the updated review status
        await fetchOrders();
      }
    } catch (error) {
      console.error('Error deleting review:', error);
      toast.error(error.response?.data?.message || 'Failed to delete review. Please try again.');
    }
  };

  if (loading) {
    return <div className="orders-container">Loading orders...</div>;
  }

  if (error) {
    return <div className="orders-container error-message">{error}</div>;
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="orders-container">
        <div className="no-orders">
          <h2>No Orders Found</h2>
          <p>You haven't placed any orders yet.</p>
          <button onClick={() => navigate('/')} className="continue-shopping-btn">
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="orders-container">
      <h1>My Orders</h1>
      <div className="orders-list">
        {orders.map((order) => (
          <div key={order._id} className="order-card">
            <div className="order-header">
              <div className="order-info">
                <h3>Order #{order._id.slice(-6)}</h3>
                <p className="order-date">Placed on {formatDate(order.orderedAt || order.createdAt)}</p>
              </div>
              <div className="order-status">
                <span className={getStatusBadgeClass(order.orderStatus)}>
                  {order.orderStatus || 'Processing'}
                </span>
              </div>
            </div>

            <div className="order-items">
              {order.items.map((item, index) => {
                console.log('Item data:', item);
                
                return (
                  <div key={index} className="flex items-center justify-between gap-4 p-4 border-b">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-800">{item.product?.name || item.name}</h4>
                      <p className="text-gray-600">{item.price}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      {order.orderStatus === 'Delivered' && (
                        <button
                          onClick={() => handleReviewClick(item, order)}
                          className=" order-review "
                        >
                          <span>Write Review</span>
                        </button>
                      )}
                      {order.orderStatus === 'Processing' && (
                        <button
                          onClick={() => handleRemoveItem(order._id, item._id)}
                          className="order-remove"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="order-summary">
              <div className="total-amount">
                <span>Total Amount:</span>
                <span>₹{order.totalAmount?.toFixed(2) || '0.00'}</span>
              </div>
              <div className="payment-method">
                <span>Payment Method:</span>
                <span>{order.paymentMethod?.toUpperCase() || 'N/A'}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showReviewModal && (
        <div className="modal-overlay">
          <div className="review-modal">
            <h2>Write a Review</h2>
            <form onSubmit={handleReviewSubmit}>
              <div className="form-group">
                <label>Rating:</label>
                <div className="rating-input">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      className={`star-btn ${star <= reviewForm.rating ? 'active' : ''}`}
                      onClick={() => setReviewForm(prev => ({ ...prev, rating: star }))}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label>Title:</label>
                <input
                  type="text"
                  value={reviewForm.title}
                  onChange={(e) => setReviewForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Give your review a title"
                  required
                />
              </div>
              <div className="form-group">
                <label>Review:</label>
                <textarea
                  value={reviewForm.content}
                  onChange={(e) => setReviewForm(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Write your review here"
                  required
                />
              </div>
              <div className="form-group">
                <label>Images (optional):</label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </div>
              <div className="modal-actions">
                <button type="submit" className="submit-review-btn">Submit Review</button>
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => {
                    setShowReviewModal(false);
                    setReviewForm({
                      rating: 0,
                      title: '',
                      content: '',
                      images: []
                    });
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders; 