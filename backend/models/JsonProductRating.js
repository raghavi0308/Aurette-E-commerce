const mongoose = require('mongoose');

const JsonProductRatingSchema = new mongoose.Schema({
  productId: { type: String, required: true, unique: true }, // Use slug or id from JSON
  ratings: [Number], // Store all ratings for averaging
  average: { type: Number, default: 0 }
});

module.exports = mongoose.model('JsonProductRating', JsonProductRatingSchema); 