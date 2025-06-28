const express = require('express');
const router = express.Router();
const { client } = require('../config/paypal');
const checkoutNodeJssdk = require('@paypal/checkout-server-sdk');

// Create PayPal order
router.post('/create-order', async (req, res) => {
  try {
    const { amount, currency } = req.body;

    // Validate incoming data
    if (!amount || !currency) {
      return res.status(400).json({ message: 'Amount and currency are required' });
    }

    // Ensure amount is a string with 2 decimal places for PayPal API
    const amountString = parseFloat(amount).toFixed(2);
    if (isNaN(parseFloat(amountString)) || parseFloat(amountString) <= 0) {
      return res.status(400).json({ message: 'Invalid amount value' });
    }

    console.log(`Attempting to create PayPal order for ${amountString} ${currency}`);

    const request = new checkoutNodeJssdk.orders.OrdersCreateRequest();
    request.prefer("return=representation");
    request.requestBody({
      intent: 'CAPTURE',
      purchase_units: [{
        amount: {
          currency_code: currency,
          value: amountString,
          breakdown: {
            item_total: {
              currency_code: currency,
              value: amountString
            }
          }
        }
      }]
    });

    // Execute the request to PayPal API
    const order = await client().execute(request);

    // Respond with the PayPal order ID
    console.log('PayPal Order created successfully. ID:', order.result.id);
    res.status(201).json({ id: order.result.id });

  } catch (error) {
    console.error('Error creating PayPal order:', error);

    // More detailed error logging from PayPal API response if available
    if (error.statusCode && error.message) {
      console.error('PayPal API Error:', error.statusCode, error.message);
      if (error.details) console.error('PayPal API Error Details:', error.details);
      return res.status(error.statusCode).json({ message: error.message, details: error.details });
    }

    res.status(500).json({ message: 'Failed to create PayPal order', error: error.message });
  }
});

// Capture PayPal order
router.post('/capture-order', async (req, res) => {
  try {
    const { orderId } = req.body;

    // Validate incoming data
    if (!orderId) {
      return res.status(400).json({ message: 'Order ID is required' });
    }

    console.log(`Attempting to capture PayPal order with ID: ${orderId}`);

    const request = new checkoutNodeJssdk.orders.OrdersCaptureRequest(orderId);
    request.prefer("return=representation");
    request.requestBody({}); // Empty body for capture request

    // Execute the request to PayPal API
    const capture = await client().execute(request);

    // Respond with the capture details
    console.log('PayPal Order captured successfully. Status:', capture.result.status);

    res.status(200).json({
      id: capture.result.id,
      status: capture.result.status,
      orderId: orderId
    });

  } catch (error) {
    console.error('Error capturing PayPal order:', error);

    // More detailed error logging from PayPal API response if available
    if (error.statusCode && error.message) {
      console.error('PayPal API Error:', error.statusCode, error.message);
      if (error.details) console.error('PayPal API Error Details:', error.details);
      return res.status(error.statusCode).json({ message: error.message, details: error.details });
    }

    res.status(500).json({ message: 'Failed to capture PayPal order', error: error.message });
  }
});

// Basic payment route placeholder (if any)
// router.post('/process-payment', async (req, res) => { ... });

// POST /api/paypal/create-order
// This route is called by the frontend to create a PayPal order
router.post('/paypal/create-order', async (req, res) => {
  try {
    const { amount, currency } = req.body;

    // Validate incoming data (optional but recommended)
    if (!amount || !currency) {
      return res.status(400).json({ message: 'Amount and currency are required' });
    }

    // Ensure amount is a string with 2 decimal places for PayPal API
    const amountString = parseFloat(amount).toFixed(2);
    if (isNaN(parseFloat(amountString)) || parseFloat(amountString) <= 0) {
         return res.status(400).json({ message: 'Invalid amount value' });
    }


    console.log(`Attempting to create PayPal order for ${amountString} ${currency}`);

    const request = new checkoutNodeJssdk.orders.OrdersCreateRequest();
    request.prefer("return=representation");
    request.requestBody({
      intent: 'CAPTURE', // Or 'AUTHORIZE'
      purchase_units: [{
        amount: {
          currency_code: currency, // Use currency from frontend
          value: amountString, // Use amount from frontend
        }
        // You can add breakdown, description, items etc. here if needed
        // For now, just sending total amount and currency
      }],
      // Optional: Add application_context for redirect URLs etc.
      /*
      application_context: {
          return_url: 'YOUR_RETURN_URL', // e.g., success page
          cancel_url: 'YOUR_CANCEL_URL', // e.g., cart or payment page
      }
      */
    });

    // Execute the request to PayPal API
    const order = await client().execute(request);

    // Respond with the PayPal order ID
    console.log('PayPal Order created successfully. ID:', order.result.id);
    res.status(201).json({ id: order.result.id });

  } catch (error) {
    console.error('Error in backend /paypal/create-order:', error);

    // More detailed error logging from PayPal API response if available
    if (error.statusCode && error.message) {
        console.error('PayPal API Error:', error.statusCode, error.message);
        if (error.details) console.error('PayPal API Error Details:', error.details);
        return res.status(error.statusCode).json({ message: error.message, details: error.details });
    }

    res.status(500).json({ message: 'Failed to create PayPal order on the backend', error: error.message });
  }
});

// POST /api/paypal/capture-order/:orderId
// This route can be used by the frontend to capture a PayPal order after buyer approval
// This adds a layer of security by keeping capture server-side.
router.post('/paypal/capture-order/:orderId', async (req, res) => {
  try {
    const paypalOrderId = req.params.orderId;

    // Validate incoming data (optional)
    if (!paypalOrderId) {
        return res.status(400).json({ message: 'PayPal Order ID is required' });
    }

    console.log(`Attempting to capture PayPal order with ID: ${paypalOrderId}`);

    const request = new checkoutNodeJssdk.orders.OrdersCaptureRequest(paypalOrderId);
    request.prefer("return=representation");
    request.requestBody({}); // Empty body for capture request

    // Execute the request to PayPal API
    const capture = await client().execute(request);

    // Respond with the capture details
    console.log('PayPal Order captured successfully. Status:', capture.result.status);

    // **TODO: Update your database with the successful payment/order status**
    // You would typically find the order in your DB by the paypalOrderId
    // and update its status, paymentId, etc.

    res.status(200).json({ 
        id: capture.result.id, 
        status: capture.result.status, 
        paypalOrderId: paypalOrderId // Include PayPal order ID for frontend reference
    });

  } catch (error) {
    console.error('Error in backend /paypal/capture-order:', error);

    // More detailed error logging from PayPal API response if available
    if (error.statusCode && error.message) {
        console.error('PayPal API Error:', error.statusCode, error.message);
        if (error.details) console.error('PayPal API Error Details:', error.details);
        return res.status(error.statusCode).json({ message: error.message, details: error.details });
    }

    res.status(500).json({ message: 'Failed to capture PayPal order on the backend', error: error.message });
  }
});

module.exports = router; 