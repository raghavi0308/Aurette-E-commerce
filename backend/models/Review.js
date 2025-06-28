const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: false
  },
  productName: {
    type: String,
    required: true
  },
  productId: {
    type: String,
    required: false
  },
  productSlug: {
    type: String,
    required: true
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  images: [{
    type: String
  }],
  isVerified: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Ensure one review per order per product (using any of the product identifiers)
reviewSchema.index({ order: 1, product: 1 }, { unique: true, sparse: true });
reviewSchema.index({ order: 1, productName: 1 }, { unique: true });
reviewSchema.index({ order: 1, productId: 1 }, { unique: true, sparse: true });
reviewSchema.index({ order: 1, productSlug: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema); 