const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Product = require('../models/Product');
const Category = require('../models/Category');
require('dotenv').config();

const importProductsFromJson = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/iris', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB');

    // Read products.json
    const productsJsonPath = path.join(__dirname, '../../my-app/src/data/products.json');
    const productsJson = JSON.parse(fs.readFileSync(productsJsonPath, 'utf8'));
    console.log('Read products from JSON:', productsJson.length);

    // Get categories from the database
    const categories = await Category.find();
    const categoryMap = {};
    categories.forEach(category => {
      categoryMap[category.slug] = category._id;
    });
    console.log('Category map:', categoryMap);

    // Insert or update each product
    for (const productJson of productsJson) {
      const categoryId = categoryMap[productJson.category];
      if (!categoryId) {
        console.warn(`Category not found for product ${productJson.name} with category ${productJson.category}`);
        continue;
      }

      // Check if product already exists (by slug or name)
      const existingProduct = await Product.findOne({ slug: productJson.slug });
      if (existingProduct) {
        // Update existing product
        existingProduct.name = productJson.name;
        existingProduct.description = productJson.description;
        existingProduct.price = productJson.price;
        existingProduct.category = categoryId;
        existingProduct.image = productJson.image;
        existingProduct.images = productJson.images || [];
        existingProduct.sizes = productJson.sizes || [];
        existingProduct.color = productJson.color;
        existingProduct.model = productJson.model;
        existingProduct.careInstructions = productJson.careInstructions;
        existingProduct.styleTips = productJson.styleTips;
        existingProduct.returnPolicy = productJson.returnPolicy;
        existingProduct.ratings = productJson.ratings || 0;
        await existingProduct.save();
        console.log(`Updated product: ${productJson.name}`);
      } else {
        // Insert new product
        const newProduct = new Product({
          name: productJson.name,
          slug: productJson.slug,
          description: productJson.description,
          price: productJson.price,
          category: categoryId,
          image: productJson.image,
          images: productJson.images || [],
          sizes: productJson.sizes || [],
          color: productJson.color,
          model: productJson.model,
          careInstructions: productJson.careInstructions,
          styleTips: productJson.styleTips,
          returnPolicy: productJson.returnPolicy,
          ratings: productJson.ratings || 0
        });
        await newProduct.save();
        console.log(`Inserted product: ${productJson.name}`);
      }
    }

    console.log('Finished importing products from JSON');
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

importProductsFromJson(); 