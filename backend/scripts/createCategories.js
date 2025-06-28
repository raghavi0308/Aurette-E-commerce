require('dotenv').config();
const mongoose = require('mongoose');
const Category = require('../models/Category');


const categories = [
  {
    name: 'Shop',
    description: 'General shop products',
    slug: 'shop'
  },
  {
    name: 'Tassels',
    description: 'Products with tassel details',
    slug: 'tassels'
  },
  {
    name: 'Minime',
    description: 'Products with oversized pocket features',
    slug: 'minime'
  },
  {
    name: 'Teeva',
    description: 'Teeva collection products',
    slug: 'teeva'
  }
];

const createCategories = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/my-app', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB');

    // Clear existing categories
    await Category.deleteMany({});
    console.log('Cleared existing categories');

    // Create new categories
    const createdCategories = await Category.insertMany(categories);
    console.log('Created categories:', createdCategories);

    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

createCategories(); 