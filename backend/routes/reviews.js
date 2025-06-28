const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const Order = require('../models/Order');
const Product = require('../models/Product');
const { auth: authMiddleware } = require('../middleware/auth');
const { upload, handleMulterError } = require('../middleware/upload');
const JsonProductRating = require('../models/JsonProductRating');
const mongoose = require('mongoose');

// Create a review
router.post('/', authMiddleware, upload.array('images', 5), async (req, res) => {
  try {
    const { orderId, productName, productSlug, rating, title, content } = req.body;
    
    console.log('Review submission attempt:', {
      orderId,
      productName,
      productSlug,
      userId: req.user._id,
      rating,
      title,
      content
    });

    // Check if order exists and is delivered
    const order = await Order.findOne({
      _id: orderId,
      $or: [
        { user: req.user._id },
        { userEmail: req.user.email }
      ],
      orderStatus: 'Delivered' // Exact match for status
    });

    console.log('Order lookup:', {
      orderId,
      userId: req.user._id,
      userEmail: req.user.email,
      found: !!order,
      orderStatus: order?.orderStatus,
      requestedStatus: 'Delivered'
    });

    if (!order) {
      return res.status(400).json({ 
        message: 'Order not found or not delivered',
        details: {
          orderId,
          userEmail: req.user.email,
          requiredStatus: 'Delivered'
        }
      });
    }

    // Check if product was in the order
    const productInOrder = order.items.find(item => 
      item.name === productName || 
      item.slug === productSlug
    );

    console.log('Product in order check:', {
      productName,
      productSlug,
      found: !!productInOrder,
      orderItems: order.items.map(item => ({
        name: item.name,
        slug: item.slug
      }))
    });

    if (!productInOrder) {
      return res.status(400).json({ message: 'Product was not in this order' });
    }

    // Check if review already exists
    const existingReview = await Review.findOne({
      order: orderId,
      $or: [
        { productName },
        { productSlug }
      ]
    });

    if (existingReview) {
      return res.status(400).json({ message: 'Review already exists for this product in this order' });
    }

    // Create review object
    const reviewData = {
      user: req.user._id,
      order: orderId,
      productName,
      productSlug,
      rating,
      title,
      content,
      images: req.files ? req.files.map(file => file.path) : [],
      isVerified: true
    };

    // Create and save review
    const review = new Review(reviewData);
    await review.save();
    console.log('Saved review with data:', reviewData);

    // Update product rating in JsonProductRating
    try {
      const jsonRating = await JsonProductRating.findOne({ 
        $or: [
          { productName },
          { productSlug }
        ]
      });
      
      if (jsonRating) {
        jsonRating.ratings.push(Number(rating));
        jsonRating.average = jsonRating.ratings.reduce((a, b) => a + b, 0) / jsonRating.ratings.length;
        await jsonRating.save();
      } else {
        await JsonProductRating.create({
          productName,
          productSlug,
          ratings: [Number(rating)],
          average: Number(rating)
        });
      }
      console.log('Product rating updated:', { productName, rating });
    } catch (err) {
      console.error('Error updating product rating:', err);
    }

    res.status(201).json(review);
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({ message: 'Error creating review', error: error.message });
  }
});

// Get reviews for a product
router.get('/product/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    console.log('Fetching reviews for product:', productId);

    // Find reviews by product name or slug
    const reviews = await Review.find({
      $or: [
        { productName: productId },
        { productSlug: productId }
      ]
    })
    .populate('user', 'name')
    .sort('-createdAt');

    console.log('Found reviews:', {
      count: reviews.length,
      productId,
      reviews: reviews.map(r => ({
        id: r._id,
        productName: r.productName,
        productSlug: r.productSlug,
        rating: r.rating
      }))
    });

    // Get average rating
    const jsonRating = await JsonProductRating.findOne({
      $or: [
        { productName: productId },
        { productSlug: productId }
      ]
    });

    if (jsonRating) {
      console.log('Found product rating:', {
        productId,
        average: jsonRating.average,
        totalRatings: jsonRating.ratings.length
      });
    }

    res.json(reviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ message: 'Error fetching reviews', error: error.message });
  }
});

// Get user's reviews
router.get('/user', authMiddleware, async (req, res) => {
  try {
    const reviews = await Review.find({ user: req.user._id })
      .populate('product', 'name image')
      .populate('order', 'orderStatus')
      .sort('-createdAt');
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user reviews', error: error.message });
  }
});

// Delete a review
router.delete('/:reviewId', authMiddleware, async (req, res) => {
  try {
    const review = await Review.findOne({
      _id: req.params.reviewId,
      user: req.user._id
    });

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    await review.remove();

    // Update product average rating
    const product = await Product.findById(review.product);
    const reviews = await Review.find({ product: review.product });
    const avgRating = reviews.length > 0 
      ? reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length 
      : 0;
    product.ratings = avgRating;
    await product.save();

    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting review', error: error.message });
  }
});

module.exports = router; 