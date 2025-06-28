const mongoose = require('mongoose');

const customisationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  size: {
    type: String,
    required: true
  },
  message: {
    type: String
  },
  file: {
    type: String // Store the file path
  },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'completed'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Customisation', customisationSchema); 