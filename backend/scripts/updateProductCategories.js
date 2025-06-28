const mongoose = require('mongoose');
const Product = require('../models/Product');
const Category = require('../models/Category');
require('dotenv').config();

const updateProductCategories = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/iris', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB');

    // Get categories
    const tasselsCategory = await Category.findOne({ name: 'Tassels' });
    const minimeCategory = await Category.findOne({ name: 'Minime' });

    if (!tasselsCategory || !minimeCategory) {
      throw new Error('Required categories not found');
    }

    console.log('Found categories:', {
      tassels: tasselsCategory._id,
      minime: minimeCategory._id
    });

    // Get all products
    const products = await Product.find();
    console.log('Found products:', products.length);

    // Update each product's category
    for (const product of products) {
      // Check if the product name or description contains keywords
      const name = product.name.toLowerCase();
      const description = (product.description || '').toLowerCase();
      const slug = product.slug?.toLowerCase() || '';

      console.log('Processing product:', {
        name: product.name,
        slug: product.slug,
        currentCategory: product.category
      });

      if (name.includes('pocket') || description.includes('pocket') || slug.includes('pocket')) {
        product.category = minimeCategory._id;
        console.log('Assigned to Minime');
      } else if (name.includes('tassel') || description.includes('tassel') || slug.includes('tassel')) {
        product.category = tasselsCategory._id;
        console.log('Assigned to Tassels');
      } else {
        // Default to Tassels if no clear category
        product.category = tasselsCategory._id;
        console.log('Defaulted to Tassels');
      }

      await product.save();
      console.log(`Updated product: ${product.name} with category: ${product.category}`);
    }

    console.log('Finished updating product categories');
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

updateProductCategories(); 