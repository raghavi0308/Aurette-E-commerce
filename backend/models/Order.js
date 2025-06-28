const mongoose = require('mongoose');

const OrderItemSchema = mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product', // Reference to the Product model
    required: true
  },
  name: { type: String, required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true }, // Price at the time of order
  image: { type: String }, // Optional: Store image URL at the time of order
});

const OrderSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to the User model
    required: true
  },
  items: [OrderItemSchema], // Array of order items using the schema above
  shippingAddress: {
    fullName: { type: String, required: true },
    streetAddress: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pinCode: { type: String, required: true },
    phoneNumber: { type: String, required: true },
  },
  paymentMethod: {
    type: String,
    required: true,
    enum: ['cod', 'upi', 'card', 'paypal'] // Allowed payment methods
  },
  totalAmount: {
    type: Number,
    required: true
  },
  orderStatus: {
    type: String,
    required: true,
    default: 'Processing',
    enum: ['Processing', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'] // Allowed statuses
  },
  orderedAt: {
    type: Date,
    default: Date.now
  },
  userEmail: { type: String },
});

const Order = mongoose.model('Order', OrderSchema);

module.exports = Order; 