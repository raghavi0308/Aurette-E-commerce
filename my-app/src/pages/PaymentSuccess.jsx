import React from 'react';
import './PaymentSuccess.css'; // We'll create this CSS file next

const PaymentSuccess = () => {
  return (
    <div className="payment-success-container">
      <h2>Payment Successful!</h2>
      <p>Thank you for your purchase.</p>
      {/* You can add more details here if needed, like order ID */}
      {/* <p>Your Order ID is: [Order ID]</p> */}
      <button onClick={() => window.location.href = '/'} className="continue-shopping">
        Continue Shopping
      </button>
    </div>
  );
};

export default PaymentSuccess; 