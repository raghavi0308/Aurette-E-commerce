import React, { useEffect, useState } from 'react';
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import axios from 'axios';
import './Payment.css';

const CardPaymentForm = ({ onSubmit, isProcessing }) => {
  const [cardData, setCardData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardHolderName: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(cardData);
  };

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  const formatExpiryDate = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 3) {
      return `${v.substring(0, 2)}/${v.substring(2, 4)}`;
    }
    return v;
  };

  return (
    <form onSubmit={handleSubmit} className="card-payment-form">
      <div className="form-group">
        <label htmlFor="cardHolderName">Card Holder Name</label>
        <input
          type="text"
          id="cardHolderName"
          value={cardData.cardHolderName}
          onChange={(e) => setCardData({...cardData, cardHolderName: e.target.value})}
          placeholder="John Doe"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="cardNumber">Card Number</label>
        <input
          type="text"
          id="cardNumber"
          value={cardData.cardNumber}
          onChange={(e) => setCardData({...cardData, cardNumber: formatCardNumber(e.target.value)})}
          placeholder="1234 5678 9012 3456"
          maxLength="19"
          required
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="expiryDate">Expiry Date</label>
          <input
            type="text"
            id="expiryDate"
            value={cardData.expiryDate}
            onChange={(e) => setCardData({...cardData, expiryDate: formatExpiryDate(e.target.value)})}
            placeholder="MM/YY"
            maxLength="5"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="cvv">CVV</label>
          <input
            type="password"
            id="cvv"
            value={cardData.cvv}
            onChange={(e) => setCardData({...cardData, cvv: e.target.value.replace(/[^0-9]/g, '')})}
            placeholder="123"
            maxLength="3"
            required
          />
        </div>
      </div>

      <button type="submit" className="proceed-button" disabled={isProcessing}>
        {isProcessing ? 'Processing...' : 'Pay Now'}
      </button>
    </form>
  );
};

const Payment = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { cartItems, getCartTotal } = useShop();
  const [totalInr, setTotalInr] = useState(0);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState('');
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [paymentInfo, setPaymentInfo] = useState(null);
  // Simulate address entry (in real app, get from previous step or context)
  const [shippingAddress, setShippingAddress] = useState(() => {
    return JSON.parse(localStorage.getItem('shippingAddress')) || {
      fullName: 'Guest User',
      streetAddress: 'Default Address',
      city: 'Default City',
      state: 'Default State',
      pinCode: '000000',
      phoneNumber: '0000000000'
    };
  });

  useEffect(() => {
    const total = getCartTotal();
    setTotalInr(total);
  }, [cartItems, getCartTotal]);

  const handlePayment = (method) => {
    setSelectedPayment(method);
    setError('');
    setIsProcessing(false);
    setPaymentStatus(null);
    setPaymentInfo(null);
  };

  // Payment success handlers for each method
  const handlePaymentSuccess = (paymentDetails) => {
    setPaymentStatus('success');
    setPaymentInfo(paymentDetails);
  };

  const handleCOD = () => {
    setSelectedPayment('cod');
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      handlePaymentSuccess({ method: 'cod' });
    }, 800);
  };

  const handleCardPayment = async (cardData) => {
    try {
      setIsProcessing(true);
      setError('');
      await new Promise(resolve => setTimeout(resolve, 1500));
      handlePaymentSuccess({ method: 'card', cardHolder: cardData.cardHolderName });
    } catch (err) {
      setError('Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUPIPayment = async () => {
    try {
      setIsProcessing(true);
      setError('');
      await new Promise(resolve => setTimeout(resolve, 1500));
      handlePaymentSuccess({ method: 'upi' });
    } catch (err) {
      setError('Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const paypalOptions = {
    'client-id': import.meta.env.VITE_PAYPAL_CLIENT_ID,
    currency: 'USD',
    intent: 'capture',
    components: 'buttons',
    'disable-funding': 'credit,card',
    'enable-funding': 'paylater,venmo'
  };

  const createOrder = async (data, actions) => {
    try {
      const totalAmountINR = parseFloat(localStorage.getItem('cartTotal') || '0');
      if (isNaN(totalAmountINR) || totalAmountINR <= 0) {
        setError('Invalid cart total amount.');
        throw new Error('Invalid cart total amount.');
      }
      const amountInUSD = (totalAmountINR * 0.012).toFixed(2);
      const currencyCode = 'USD';
      const response = await axios.post('http://localhost:5000/api/payment/create-order', {
        amount: amountInUSD,
        currency: currencyCode
      });
      const orderPayPalId = response.data.id;
      if (!orderPayPalId) {
        throw new Error('Backend did not return PayPal order ID');
      }
      return orderPayPalId;
    } catch (err) {
      setError(err.response?.data?.message || 'Could not create PayPal order.');
      throw err;
    }
  };

  const onApprove = async (data, actions) => {
    try {
      setIsProcessing(true);
      const captureResponse = await axios.post('http://localhost:5000/api/payment/capture-order', {
        orderId: data.orderID
      });
      if (captureResponse.data.status !== 'COMPLETED') {
        throw new Error('Payment capture failed');
      }
      handlePaymentSuccess({ method: 'paypal', paypalOrderId: data.orderID });
    } catch (err) {
      setError('Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const onError = (err) => {
    setError('Payment failed. Please try again.');
    setIsProcessing(false);
  };

  // Place order only after payment is successful
  const handlePlaceOrder = async () => {
    setIsPlacingOrder(true);
    try {
      const orderData = {
        items: cartItems.map(item => ({
          product: item.id || item._id,
          name: item.name,
          quantity: item.quantity,
          price: parseFloat(item.price.toString().replace(/[^0-9.]/g, '')),
          image: item.image
        })),
        shippingAddress: shippingAddress,
        totalAmount: totalInr,
        paymentMethod: paymentInfo.method,
        paymentId: paymentInfo.paypalOrderId || null,
        orderStatus: paymentInfo.method === 'cod' ? 'Processing' : 'Confirmed',
        userEmail: (user && user.email) || localStorage.getItem('userEmail') || 'guest@example.com'
      };
      console.log('Order data being sent:', orderData);
      await axios.post('http://localhost:5000/api/orders', orderData);
      setIsPlacingOrder(false);
      navigate('/success');
    } catch (error) {
      setIsPlacingOrder(false);
      setError('Failed to place order. Please try again.');
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="payment-container">
        <div className="payment-empty">
          <h2>Your cart is empty</h2>
          <button onClick={() => navigate('/shop')} className="continue-shopping">
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-container">
      <div className="payment-content">
        <h2>Select Payment Method</h2>
        <div className="payment-methods">
          <button
            className={`payment-method ${selectedPayment === 'cod' ? 'selected' : ''}`}
            onClick={handleCOD}
            disabled={isProcessing || paymentStatus === 'success'}
          >
            <span className="method-icon">💵</span>
            Cash on Delivery
          </button>
          <button
            className={`payment-method ${selectedPayment === 'upi' ? 'selected' : ''}`}
            onClick={() => handlePayment('upi')}
            disabled={isProcessing || paymentStatus === 'success'}
          >
            <span className="method-icon">📱</span>
            UPI Payment
          </button>
          <button
            className={`payment-method ${selectedPayment === 'card' ? 'selected' : ''}`}
            onClick={() => handlePayment('card')}
            disabled={isProcessing || paymentStatus === 'success'}
          >
            <span className="method-icon">💳</span>
            Credit/Debit Card
          </button>
          <button
            className={`payment-method ${selectedPayment === 'paypal' ? 'selected' : ''}`}
            onClick={() => handlePayment('paypal')}
            disabled={isProcessing || paymentStatus === 'success'}
          >
            <span className="method-icon"><i className="fa-brands fa-paypal"></i></span>
            PayPal
          </button>
        </div>
        {selectedPayment && (
          <div className="payment-details">
            <h3>Order Summary</h3>
            <div className="order-summary">
              <div className="summary-row">
                <span>Total Amount:</span>
                <span>₹{totalInr.toFixed(2)}</span>
              </div>
            </div>
            {selectedPayment === 'paypal' && paymentStatus !== 'success' && (
              <div className="paypal-container">
                <PayPalScriptProvider options={paypalOptions}>
                  <PayPalButtons
                    style={{ layout: "vertical" }}
                    createOrder={createOrder}
                    onApprove={onApprove}
                    onError={onError}
                  />
                </PayPalScriptProvider>
              </div>
            )}
            {selectedPayment === 'card' && paymentStatus !== 'success' && (
              <CardPaymentForm
                onSubmit={handleCardPayment}
                isProcessing={isProcessing}
              />
            )}
            {selectedPayment === 'upi' && paymentStatus !== 'success' && (
              <button
                className="proceed-button"
                onClick={handleUPIPayment}
                disabled={isProcessing}
              >
                {isProcessing ? 'Processing...' : 'Pay with UPI'}
              </button>
            )}
            {selectedPayment === 'cod' && paymentStatus !== 'success' && (
              <div className="cod-info">Click again to confirm Cash on Delivery.</div>
            )}
          </div>
        )}
        {error && <div className="error-message">{error}</div>}
        {paymentStatus === 'success' && (
          <button
            className="proceed-button"
            onClick={handlePlaceOrder}
            disabled={isPlacingOrder}
          >
            {isPlacingOrder ? 'Placing Order...' : 'Place Order'}
          </button>
        )}
      </div>
    </div>
  );
};

export default Payment; 