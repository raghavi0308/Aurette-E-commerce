const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const User = require('../models/User'); // Import User model to find user by email
// Assuming your authentication middleware runs before these routes
// const auth = require('../middleware/auth'); // Example: Your actual auth middleware
const { auth: authMiddleware } = require('../middleware/auth');
const mongoose = require('mongoose');

// **Simplified Authentication Check Middleware**
// We will now use the actual auth middleware instead of this placeholder
// const userAuth = (req, res, next) => {
//   // **TODO: Replace with your actual user authentication middleware**
//   // This placeholder simply checks if req.user is populated by preceding middleware.
//   // Your actual auth middleware should handle token verification, user lookup, etc.

//   if (!req.user || !req.user._id) {
//     console.warn('Authentication failed: User not authenticated.');
//     return res.status(401).json({ message: 'Authentication required' });
//   }
  
//   console.log('userAuth placeholder: User authenticated with ID:', req.user._id);
//   next(); 
// };

// POST create new order
// This will be mounted under /api/orders, so the full path will be /api/orders
// REMOVING auth middleware as requested - **SECURITY RISK**
router.post('/', async (req, res) => {
  try {
    // Get order details from the request body
    const { items, shippingAddress, totalAmount, paymentMethod, orderStatus, userEmail } = req.body;

    // Ensure required fields are present
    if (!items || !shippingAddress || !totalAmount || !orderStatus) {
      return res.status(400).json({ message: 'Missing required order details' });
    }

    // **WARNING: User ID will not be associated with the order without authentication**
    // If you need to link orders to users without authentication, you'll need another mechanism
    const newOrder = new Order({
      user: new mongoose.Types.ObjectId(), // Create a dummy ObjectId for now
      items: items.map(item => ({
        product: new mongoose.Types.ObjectId(item.id), // Convert item.id to ObjectId
        name: item.name,
        quantity: item.quantity,
        price: parseFloat(item.price), // Ensure price is a number
        image: item.image
      })),
      shippingAddress: shippingAddress,
      totalAmount: totalAmount,
      paymentMethod: paymentMethod, // Note: Payment method might be updated after payment is completed
      orderStatus: orderStatus,
      userEmail: userEmail, // Include user's email in the order data
      // orderedAt is automatically set by the schema default
    });

    // Save the order to the database
    const savedOrder = await newOrder.save();

    // Respond with the saved order details
    res.status(201).json(savedOrder);
  } catch (error) {
    console.error('Error saving order:', error);
    res.status(500).json({ message: 'Failed to save order', error: error.message });
  }
});

// GET user-specific orders by email
// This will be mounted under /api/orders, so the full path will be /api/orders/user/:email
// Keeping auth middleware as requested (only placing/deleting specified for removal)
router.get('/user/:email', authMiddleware, async (req, res) => {
  try {
    const userEmail = req.params.email;
    console.log('Fetching orders for email:', userEmail);

    // Find the user by email to get their ID for the security check
    const user = await User.findOne({ email: userEmail });
    console.log('Found user:', user ? 'Yes' : 'No');

    if (!user) {
      console.warn(`User not found for email ${userEmail}, attempting to fetch by userEmail field...`);
    }

    // **SECURITY CHECK:** Ensure the requested email matches the authenticated user's email
    if (!req.user || req.user.email !== userEmail) {
      console.error('Security check failed:', {
        reqUserEmail: req.user?.email,
        requestedEmail: userEmail
      });
      return res.status(403).json({ message: 'Unauthorized: You can only view your own orders.' });
    }

    // Find all orders for this user ID OR userEmail, sorted by creation date (newest first)
    const orders = await Order.find({
      $or: [
        { user: req.user._id },
        { userEmail: userEmail }
      ]
    })
    .populate({
      path: 'items.product',
      select: 'name images image price',
      model: 'Product'
    })
    .sort({ createdAt: -1 });

    console.log('Found orders:', orders.length);

    // Map the orders to include product details
    const ordersWithDetails = orders.map(order => {
      try {
        return {
          ...order.toObject(),
          items: order.items.map(item => {
            try {
              // Get the first image from either the product's images array or single image
              let productImage = null;
              
              // First try to get Cloudinary image
              if (item.product?.images?.length > 0) {
                const cloudinaryImage = item.product.images.find(img => img.includes('cloudinary.com'));
                if (cloudinaryImage) {
                  productImage = cloudinaryImage;
                } else {
                  productImage = item.product.images[0];
                }
              } else if (item.product?.image) {
                productImage = item.product.image;
              } else if (item.image) {
                productImage = item.image;
              }

              // If no image found, use a default placeholder
              if (!productImage) {
                productImage = 'https://placehold.co/100x100';
              }
              // If the image is not a Cloudinary URL and not a placeholder, make it absolute
              else if (!productImage.includes('cloudinary.com') && !productImage.includes('placehold.co')) {
                // Remove any leading slash to avoid double slashes
                const cleanPath = productImage.startsWith('/') ? productImage.slice(1) : productImage;
                // If the path already includes 'images/', don't add it again
                if (cleanPath.includes('images/')) {
                  productImage = `http://localhost:5000/${cleanPath}`;
                } else {
                  productImage = `http://localhost:5000/images/${cleanPath}`;
                }
              }

              console.log('Processed image URL:', productImage);
              
              return {
                ...item,
                product: {
                  name: item.product?.name || item.name,
                  image: productImage,
                  price: item.product?.price || item.price
                }
              };
            } catch (itemError) {
              console.error('Error processing item:', itemError);
              return item;
            }
          })
        };
      } catch (orderError) {
        console.error('Error processing order:', orderError);
        return order;
      }
    });

    res.status(200).json(ordersWithDetails);
  } catch (error) {
    console.error('Error in /user/:email route:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      message: 'Failed to fetch user orders', 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// DELETE an item from an order
// This will be mounted under /api/orders, so the full path will be /api/orders/:orderId/items/:itemId
// REMOVING auth middleware as requested - **SECURITY RISK**
router.delete('/:orderId/items/:itemId', async (req, res) => {
  try {
    const { orderId, itemId } = req.params;
    
    // Find the order by its ID
    const order = await Order.findById(orderId); // Removed user check

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Find the index of the item to be removed
    // Ensure itemId is treated as a string for comparison and item._id exists
    const itemIndex = order.items.findIndex(item => item._id && item._id.toString() === itemId);

    if (itemIndex === -1) {
      return res.status(404).json({ message: 'Item not found in order' });
    }

    // Store the item details before removing for potential rollback/logging
    const removedItem = order.items[itemIndex];

    // Remove the item from the items array
    order.items.splice(itemIndex, 1);

    // Recalculate totalAmount after removing item
    order.totalAmount = order.items.reduce((sum, item) => {
        // Ensure item.price is a number before adding
        const price = parseFloat(item.price);
        return sum + (isNaN(price) ? 0 : price * item.quantity);
    }, 0);

    // Save the updated order
    const updatedOrder = await order.save();

    // If all items are removed, delete the order entirely
    if (updatedOrder.items.length === 0) {
        await Order.deleteOne({ _id: orderId });
        // Return 204 No Content for successful deletion with no body
        return res.status(204).send(); // Use .send() for 204 status
    }

    // Respond with the updated order
    res.status(200).json(updatedOrder);
  } catch (error) {
    console.error('Error deleting item from order:', error);
    res.status(500).json({ message: 'Failed to delete item from order', error: error.message });
  }
});

// TODO: Add other user-specific order routes here if needed (e.g., GET /:orderId)

module.exports = router; 