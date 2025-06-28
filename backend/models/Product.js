const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: String,
    required: true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  image: {
    type: String,
    required: true
  },
  images: [{
    type: String
  }],
  imagesMapping: {
    type: Map,
    of: String,
    default: new Map()
  },
  sizes: [{
    type: String
  }],
  color: {
    type: String,
    required: true
  },
  model: {
    type: String,
    required: true
  },
  careInstructions: {
    type: String
  },
  styleTips: {
    type: String
  },
  returnPolicy: {
    type: String
  },
  stock: {
    type: Number,
    min: 0,
    default: 0
  },
  features: [{
    type: String
  }],
  GSM: {
    type: String
  },
  ratings: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    set: function(slug) {
      if (slug) return slug;
      return this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    }
  }
}, {
  timestamps: true
});

// Remove the pre-save middleware since we're handling slug in the setter
// productSchema.pre('save', function(next) {
//   if (!this.slug) {
//     this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
//   }
//   next();
// });

module.exports = mongoose.model('Product', productSchema); 