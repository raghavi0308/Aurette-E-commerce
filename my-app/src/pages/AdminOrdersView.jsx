import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import './AdminOrdersView.css'; // We will create this CSS file next
import axios from 'axios';

const AdminOrdersView = () => {
  const { user } = useAuth(); // Assuming user context is needed for auth token or checks
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [filterEmail, setFilterEmail] = useState(''); // State for email filter input

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user || user.role !== 'admin') {
        setLoading(false);
        setError('Unauthorized access');
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        let url = 'http://localhost:5000/api/admin/orders';
        if (filterEmail) {
          url = `http://localhost:5000/api/admin/orders?email=${encodeURIComponent(filterEmail)}`;
        }

        const response = await axios.get(url, {
          headers: {
            'Authorization': `Bearer ${user.token}`
          }
        });

        setOrders(response.data);
      } catch (error) {
        console.error('Error fetching orders:', error);
        setError(error.response?.data?.message || 'Failed to load orders.');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchOrders();
    }
  }, [user, filterEmail]);

  const handleFilterChange = (e) => {
    setFilterEmail(e.target.value);
  };

  const handleFilterSubmit = () => {
    // The useEffect hook will handle fetching when filterEmail changes
    // No need to explicitly call fetchOrders here, just ensure filterEmail state is updated
  };

  const fetchOrderDetails = async (orderId) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(`http://localhost:5000/api/admin/orders/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });

      setSelectedOrder(response.data);
      setShowDetails(true);
    } catch (error) {
      console.error('Error fetching order details:', error);
      setError(error.response?.data?.message || 'Failed to load order details.');
    } finally {
      setLoading(false);
    }
  };

  const closeDetails = () => {
    setSelectedOrder(null);
    setShowDetails(false);
    setError(null); // Clear error when closing modal
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      setUpdatingStatus(true);
      setError(null);

      const response = await axios.patch(
        `http://localhost:5000/api/admin/orders/${orderId}/status`,
        { orderStatus: newStatus },
        {
          headers: {
            'Authorization': `Bearer ${user.token}`
          }
        }
      );

      // Update both the selected order and the orders list
      const updatedOrder = response.data;
      setSelectedOrder(updatedOrder);
      setOrders(orders.map(order => 
        order._id === orderId ? updatedOrder : order
      ));
    } catch (error) {
      console.error('Error updating order status:', error);
      setError(error.response?.data?.message || 'Failed to update order status.');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (window.confirm('Are you sure you want to delete this order?')) {
      try {
        setOrders(orders.filter(order => order._id !== orderId));
        setError(null);

        await axios.delete(`http://localhost:5000/api/admin/orders/${orderId}`, {
          headers: {
            'Authorization': `Bearer ${user.token}`
          }
        });
      } catch (error) {
        console.error('Error deleting order:', error);
        setError(error.response?.data?.message || 'Failed to delete order.');
        // Refresh orders to restore the deleted item
        const response = await axios.get('http://localhost:5000/api/admin/orders', {
          headers: {
            'Authorization': `Bearer ${user.token}`
          }
        });
        setOrders(response.data);
      }
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'processing':
        return 'status-badge processing';
      case 'confirmed':
        return 'status-badge confirmed';
      case 'shipping':
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

  const formatDate = (dateString) => {
    try {
      // Check if dateString is valid
      if (!dateString) {
        console.error('No date provided');
        return 'N/A';
      }

      // Parse the date string
      const date = new Date(dateString);
      
      // Validate the date
      if (isNaN(date.getTime())) {
        console.error('Invalid date:', dateString);
        return 'Invalid Date';
      }

      // Format the date
      return date.toLocaleDateString('en-IN', {
        day: '2-digit',
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

  if (loading) {
    return <div className="admin-orders-container">Loading orders...</div>;
  }

  if (error) {
    return <div className="admin-orders-container error-message">{error}</div>;
  }

  return (
    <div className="admin-orders-container">
      <h2>All Client Orders</h2>

      <div className="filter-container">
        <input
          type="text"
          value={filterEmail}
          onChange={handleFilterChange}
          placeholder="Filter by email"
          className="filter-email-input"
        />
      </div>

      {orders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        <div className="orders-table-container">
          <table className="orders-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Date</th>
                <th>Customer</th>
                <th>Products</th>
                <th>Total</th>
                <th>Payment</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order._id}>
                  <td>{order._id.slice(-6)}</td>
                  <td>{formatDate(order.orderedAt || order.createdAt)}</td>
                  <td>{order.user?.email || 'Guest'}</td>
                  <td>
                    <div className="order-products">
                      {order.items.map((item, index) => (
                        <div key={index} className="product-item">
                          {item.productName}
                        </div>
                      ))}
                    </div>
                  </td>
                  <td>₹{order.totalAmount?.toFixed(2) || 'N/A'}</td>
                  <td>{formatPaymentInfo(order)}</td>
                  <td>
                    <span className={getStatusBadgeClass(order.orderStatus)}>
                      {order.orderStatus || 'Processing'}
                    </span>
                  </td>
                  <td>
                    <button 
                      onClick={() => fetchOrderDetails(order._id)} 
                      className="details-button"
                    >
                      View Details
                    </button>
                    <button 
                      onClick={() => handleDeleteOrder(order._id)}
                      className="delete-button"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showDetails && selectedOrder && (
        <div className="order-details-modal-overlay">
          <div className="order-details-modal">
            <div className="modal-header">
              <h3>Order Details</h3>
              <button onClick={closeDetails} className="close-button">&times;</button>
            </div>
            <div className="modal-body">
              <div className="order-info">
                <p><strong>Order ID:</strong> {selectedOrder._id}</p>
                <p><strong>Date:</strong> {new Date(selectedOrder.createdAt).toLocaleDateString()}</p>
                <p><strong>Customer:</strong> {selectedOrder.user?.email || 'Guest'}</p>
                <p><strong>Total Amount:</strong> ₹{selectedOrder.totalAmount?.toFixed(2) || 'N/A'}</p>
                <p><strong>Payment Method:</strong> {formatPaymentInfo(selectedOrder)}</p>
                <p><strong>Status:</strong> 
                  <span className={getStatusBadgeClass(selectedOrder.orderStatus)}>
                    {selectedOrder.orderStatus || 'Processing'}
                  </span>
                </p>
              </div>

              <div className="order-items">
                <h4>Order Items</h4>
                <ul>
                  {selectedOrder.items.map((item, index) => (
                    <li key={index}>
                      <p><strong>Product:</strong> {item.product?.name || 'Unknown Product'}</p>
                      <p><strong>Quantity:</strong> {item.quantity}</p>
                      <p><strong>Price:</strong> ₹{item.price?.toFixed(2) || 'N/A'}</p>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="status-update">
                <label>Update Status:</label>
                <select
                  value={selectedOrder.orderStatus || 'Processing'}
                  onChange={(e) => updateOrderStatus(selectedOrder._id, e.target.value)}
                  disabled={updatingStatus}
                  className="status-select"
                >
                  <option value="Processing">Processing</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
                {updatingStatus && <span className="updating-message">Updating...</span>}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrdersView; 