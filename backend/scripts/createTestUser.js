const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const createTestUser = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/iris', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB');

    // Create user with specific email
    const testUser = new User({
      name: 'Raghavi JK',
      email: 'raghavijk3@gmail.com',
      password: 'password123',
      role: 'user'
    });

    await testUser.save();
    console.log('User created successfully');
    console.log('Email: raghavijk3@gmail.com');
    console.log('Password: password123');

  } catch (error) {
    if (error.code === 11000) {
      console.log('User already exists');
    } else {
      console.error('Error creating user:', error);
    }
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

createTestUser(); 