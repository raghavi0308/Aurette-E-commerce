const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Product = require('../models/Product');
const { auth: authMiddleware } = require('../middleware/auth');
const mongoose = require('mongoose');

// Get user's wishlist
router.get('/', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('wishlist');
    res.json(user.wishlist);
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    res.status(500).json({ message: 'Error fetching wishlist', error: error.message });
  }
});

// Add item to wishlist
router.post('/add/:productId', authMiddleware, async (req, res) => {
  try {
    const { productId } = req.params;
    
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Try to find product by MongoDB ID first
    let product = null;
    if (mongoose.Types.ObjectId.isValid(productId)) {
      product = await Product.findById(productId);
    }
    
    // If not found by ID, try to find by slug
    if (!product) {
      product = await Product.findOne({ slug: productId });
    }
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if product is already in wishlist
    if (user.wishlist.includes(product._id)) {
      return res.status(400).json({ message: 'Product already in wishlist' });
    }

    user.wishlist.push(product._id);
    await user.save();
    
    await user.populate('wishlist');
    res.json(user.wishlist);
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    res.status(500).json({ 
      message: 'Error adding to wishlist', 
      error: error.message,
      details: error.stack
    });
  }
});

// Remove item from wishlist
router.delete('/remove/:productId', authMiddleware, async (req, res) => {
  try {
    const { productId } = req.params;
    
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Try to find product by MongoDB ID first
    let product = null;
    if (mongoose.Types.ObjectId.isValid(productId)) {
      product = await Product.findById(productId);
    }
    
    // If not found by ID, try to find by slug
    if (!product) {
      product = await Product.findOne({ slug: productId });
    }
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    user.wishlist = user.wishlist.filter(
      id => id.toString() !== product._id.toString()
    );

    await user.save();
    
    await user.populate('wishlist');
    res.json(user.wishlist);
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    res.status(500).json({ 
      message: 'Error removing from wishlist', 
      error: error.message,
      details: error.stack
    });
  }
});

// Clear wishlist
router.delete('/clear', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    user.wishlist = [];
    await user.save();
    res.json({ message: 'Wishlist cleared successfully' });
  } catch (error) {
    console.error('Error clearing wishlist:', error);
    res.status(500).json({ 
      message: 'Error clearing wishlist', 
      error: error.message,
      details: error.stack
    });
  }
});

module.exports = router; 