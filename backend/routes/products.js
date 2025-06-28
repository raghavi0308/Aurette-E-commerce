const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Category = require('../models/Category');
const { upload, handleMulterError } = require('../middleware/upload');
const fs = require('fs').promises;
const path = require('path');
const cloudinary = require('../utils/cloudinary');

// Get all products
router.get('/', async (req, res) => {
  try {
    const products = await Product.find()
      .populate('category', 'name slug')
      .select('name slug description price category image images sizes color model careInstructions styleTips returnPolicy ratings stock features createdAt')
      .sort('-createdAt');
    
    res.json(products);
  } catch (error) {
    console.error('Error in GET /:', error);
    res.status(500).json({ message: error.message });
  }
});

// Create a new product with image upload to Cloudinary
router.post('/', 
  upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'images', maxCount: 5 }
  ]),
  handleMulterError,
  async (req, res) => {
    try {
      // Validate required fields
      if (!req.body.name || !req.body.slug || !req.body.price) {
        return res.status(400).json({ message: 'Missing required fields' });
      }

      // Validate image
      if (!req.files || !req.files.image || !req.files.image[0]) {
        return res.status(400).json({ message: 'Main image is required' });
      }

      // Find the category by slug
      const category = await Category.findOne({ slug: req.body.category });
      if (!category) {
        return res.status(400).json({ message: 'Invalid category' });
      }

      // Upload main image to Cloudinary
      let imageUrl = '';
      try {
        const result = await cloudinary.uploader.upload(req.files.image[0].path, { 
          folder: 'products',
          resource_type: 'auto'
        });
        imageUrl = result.secure_url;
        // Delete local file after upload
        await fs.unlink(req.files.image[0].path);
      } catch (error) {
        console.error('Error uploading main image:', error);
        return res.status(500).json({ message: 'Failed to upload main image' });
      }

      // Upload additional images to Cloudinary
      let additionalImages = [];
      if (req.files && req.files.images) {
        try {
          for (const file of req.files.images) {
            const result = await cloudinary.uploader.upload(file.path, { 
              folder: 'products',
              resource_type: 'auto'
            });
            additionalImages.push(result.secure_url);
            // Delete local file after upload
            await fs.unlink(file.path);
          }
        } catch (error) {
          console.error('Error uploading additional images:', error);
          return res.status(500).json({ message: 'Failed to upload additional images' });
        }
      }

      // Create new product with category reference and Cloudinary image URLs
      const product = new Product({
        ...req.body,
        category: category._id,
        image: imageUrl,
        images: additionalImages
      });

      const savedProduct = await product.save();
      
      // Populate category before sending response
      const populatedProduct = await Product.findById(savedProduct._id)
        .populate('category', 'name slug');

      res.status(201).json(populatedProduct);
    } catch (error) {
      console.error('Error creating product:', error);
      res.status(500).json({ message: error.message || 'Something went wrong!' });
    }
  }
);

// Delete a product
router.delete('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Delete associated images
    const deleteImage = async (imagePath) => {
      if (imagePath) {
        const fullPath = path.join(__dirname, '..', imagePath);
        try {
          await fs.unlink(fullPath);
        } catch (error) {
          console.error(`Error deleting image ${imagePath}:`, error);
        }
      }
    };

    // Delete main image
    await deleteImage(product.image);

    // Delete additional images
    for (const image of product.images) {
      await deleteImage(image);
    }

    // Delete the product
    await Product.findByIdAndDelete(req.params.id);

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get products by category
router.get('/category/:categorySlug', async (req, res) => {
  try {
    const category = await Category.findOne({ slug: req.params.categorySlug });
    
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    const products = await Product.find({ category: category._id })
      .populate('category', 'name slug')
      .sort('-createdAt');

    res.json(products);
  } catch (error) {
    console.error('Error fetching products by category:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get a single product
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('category', 'name slug');
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 