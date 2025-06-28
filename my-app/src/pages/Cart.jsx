import React, { useContext, useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import './Cart.css';
import { useAuth } from '../context/AuthContext';
import axios from 'axios'; // Import axios
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getImageUrl } from '../utils/imageUtils';

const Cart = () => {
  const { cartItems, getCartTotal, removeFromCart, updateCartItemQuantity } = useShop();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [address, setAddress] = useState({
    fullName: '',
    streetAddress: '',
    city: '',
    state: '',
    pinCode: '',
    phoneNumber: '',
  });
  const [addressError, setAddressError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [isAddressValid, setIsAddressValid] = useState(false);

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setAddress(prev => ({ ...prev, [name]: value }));
    if (addressError) setAddressError(''); // Clear error on change
  };

  // Validate address whenever it changes
  useEffect(() => {
    const { fullName, streetAddress, city, state, pinCode, phoneNumber } = address;
    const allFieldsFilled = fullName && streetAddress && city && state && pinCode && phoneNumber;
    const isValidPhone = /^[0-9]+$/.test(phoneNumber);
    const isValidPin = /^[0-9]+$/.test(pinCode);

    if (allFieldsFilled && isValidPhone && isValidPin) {
      setIsAddressValid(true);
      setAddressError('');
    } else {
      setIsAddressValid(false);
      if (phoneNumber && !isValidPhone) {
        setAddressError('Please enter a valid phone number.');
      } else if (pinCode && !isValidPin) {
        setAddressError('Please enter a valid PIN code.');
      }
    }
  }, [address]);

  const handleProceedToPay = () => {
    if (!isAddressValid) {
      return;
    }
    // Save address to localStorage for use in Payment page
    localStorage.setItem('shippingAddress', JSON.stringify(address));
    navigate('/payment');
  };

  const handleOrderPlacing = async () => {
    if (!isAddressValid) {
      toast.error('Please fill in all address fields correctly');
      return;
    }

    // We no longer explicitly check user.token here, relying on AuthContext to protect routes
    // and axios default headers. If user is not authenticated, backend should return 401.

    if (cartItems.length === 0) {
      setAddressError('Your cart is empty.'); // Or handle with a separate state/message
      return;
    }

    setIsProcessing(true);
    setAddressError(''); // Clear previous errors

    try {
      const orderData = {
        items: cartItems.map(item => {
          // Ensure price is a valid number
          const parsedPrice = parseInt(item.price.replace(/[^0-9.]/g, ''));
          const price = isNaN(parsedPrice) ? 0 : parsedPrice; // Use 0 if parsing fails

          // Get the product identifier (prefer slug over id)
          const productIdentifier = item.slug || item.id;
          if (!productIdentifier) {
            console.error('Item missing both slug and id:', item);
            throw new Error('Invalid product data');
          }

          return {
            product: item._id || item.id,
            name: item.name,
            quantity: item.quantity,
            price: price,
            image: item.image,
            slug: item.slug || ''
          };
        }),
        shippingAddress: address,
        totalAmount: getCartTotal(),
        paymentMethod: 'cod',
        orderStatus: 'Processing',
        userEmail: user.email
      };

      console.log('Attempting to save order using Axios:', orderData);

      const response = await axios.post('http://localhost:5000/api/orders', orderData);

      console.log('Order saved successfully:', response.data);
      setOrderPlaced(true);

    } catch (error) {
      console.error('Error placing order:', error);
      setAddressError(error.response?.data?.message || 'Error placing order. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleQuantityChange = (itemId, newQuantity) => {
    if (newQuantity < 1) {
      toast.error('Quantity cannot be less than 1');
      return;
    }
    updateCartItemQuantity(itemId, newQuantity);
    toast.success('Cart updated successfully');
  };

  const handleRemoveItem = (itemId) => {
    removeFromCart(itemId);
    toast.success('Item removed from cart');
  };

  const totalAmount = getCartTotal();

  const EmptyCart = () => (
    <div className="empty-cart-container">
      <h1>My Cart</h1>
      <div className="empty-cart-content">
      <i className="fa-solid fa-bag-shopping empty-cart-icon"></i>
        <h2>Your cart is empty</h2>
        <p>Add items to your cart to start shopping!</p>
        <Link to="/shop">
          <button className="continue-shopping-btn">CONTINUE SHOPPING</button>
        </Link>
      </div>
    </div>
  );

  return (
    <div className="cart">
      {cartItems.length === 0 ? (
        <EmptyCart />
      ) : (
        <>
          <div className="cart-items">
            <h2>Your Cart Items</h2>
            <table className="cart-table">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Name</th>
                  <th>Price</th>
                  <th>Size</th>
                  <th>Color</th>
                  <th>Quantity</th>
                  <th>Remove</th>
                </tr>
              </thead>
              <tbody>
                {cartItems.map((product) => {
                  const productIdentifier = product.slug || product.id;
                  return (
                    <tr key={productIdentifier} className="cart-item-row">
                      <td><Link to={`/product/${product.slug}`}>
                      <img 
                        src={getImageUrl(product.image)} 
                        alt={product.name} 
                        className="cart-item-image"
                        onError={(e) => {
                          console.error('Image failed to load:', product.image);
                          e.target.src = '/placeholder-image.jpg';
                        }}
                      />
                      </Link></td>
                      <td>{product.name}</td>
                      <td>{product.price}</td>
                      <td>{product.selectedSize || '-'}</td>
                      <td>{product.color || '-'}</td>
                      <td>
                        <div className="quantity-control">
                          <button onClick={() => handleQuantityChange(productIdentifier, product.quantity - 1)}>-</button>
                          <input type="text" value={product.quantity} readOnly />
                          <button onClick={() => handleQuantityChange(productIdentifier, product.quantity + 1)}>+</button>
                        </div>
                      </td>
                      <td>
                        <button onClick={() => handleRemoveItem(productIdentifier)} className="remove-button">Remove</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="checkout">
            <div className="order-summary">
              <h3>Order Summary</h3>
              <div className="summary-row">
                <span>Subtotal:</span>
                <span>Rs.{totalAmount.toLocaleString()}</span>
              </div>
            </div>

            {/* Address Input Section */}
            <div className="address-section">
              <h3>Delivery Address</h3>
              <div className="address-inputs">
                <input type="text" name="fullName" placeholder="Full Name" value={address.fullName} onChange={handleAddressChange} className="address-input" />
                <input type="text" name="streetAddress" placeholder="Street Address" value={address.streetAddress} onChange={handleAddressChange} className="address-input" />
                <div className="address-row">
                  <input type="text" name="city" placeholder="City" value={address.city} onChange={handleAddressChange} className="address-input city-input" />
                  <input type="text" name="state" placeholder="State" value={address.state} onChange={handleAddressChange} className="address-input state-input" />
                </div>
                <div className="address-row">
                  <input type="text" name="pinCode" placeholder="PIN Code" value={address.pinCode} onChange={handleAddressChange} className="address-input pin-code-input" />
                  <input type="text" name="phoneNumber" placeholder="Phone Number" value={address.phoneNumber} onChange={handleAddressChange} className="address-input phone-input" />
                </div>
              </div>
              {addressError && <p className="error-message">{addressError}</p>}
            </div>

            {/* Buttons: Proceed to Pay */}
            <button 
              className={`proceed-button ${!isAddressValid ? 'disabled' : ''}`}
              onClick={handleProceedToPay}
              disabled={!isAddressValid || isProcessing || cartItems.length === 0}
            >
              Proceed to Payment
            </button>

            <button onClick={() => navigate('/shop')} className="continue-shopping">
              Continue Shopping
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Cart; 