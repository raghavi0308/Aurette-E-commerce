const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Customisation = require('../models/Customisation');
const { auth: authMiddleware } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const { sendCustomizationConfirmation } = require('../utils/emailService');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/customisation')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname)
  }
});

const upload = multer({ storage: storage });

// Get customisation options for a product
router.get('/:productId', async (req, res) => {
  try {
    const product = await Product.findById(req.params.productId);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (!product.customisation.available) {
      return res.status(400).json({ message: 'Product does not support customisation' });
    }

    res.json(product.customisation);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching customisation options', error: error.message });
  }
});

// Update customisation options (admin only)
router.put('/:productId', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const product = await Product.findById(req.params.productId);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    product.customisation = req.body;
    await product.save();

    res.json(product.customisation);
  } catch (error) {
    res.status(500).json({ message: 'Error updating customisation options', error: error.message });
  }
});

// Validate customisation options
router.post('/validate/:productId', async (req, res) => {
  try {
    const product = await Product.findById(req.params.productId);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (!product.customisation.available) {
      return res.status(400).json({ message: 'Product does not support customisation' });
    }

    const { options } = req.body;
    const validationErrors = [];

    // Validate each customisation option
    product.customisation.options.forEach(option => {
      const userOption = options[option.name];
      
      if (option.required && !userOption) {
        validationErrors.push(`${option.name} is required`);
      }

      if (userOption && option.options && !option.options.includes(userOption)) {
        validationErrors.push(`${userOption} is not a valid option for ${option.name}`);
      }
    });

    if (validationErrors.length > 0) {
      return res.status(400).json({ errors: validationErrors });
    }

    res.json({ message: 'Customisation options are valid' });
  } catch (error) {
    res.status(500).json({ message: 'Error validating customisation options', error: error.message });
  }
});

// Submit customisation request
router.post('/submit', upload.single('file'), async (req, res) => {
  try {
    const { name, phone, email, size, message } = req.body;
    const file = req.file ? req.file.path : null;

    const customisation = new Customisation({
      name,
      phone,
      email,
      size,
      message,
      file
    });

    await customisation.save();

    // Send confirmation email
    try {
      await sendCustomizationConfirmation(email, name);
      console.log('Confirmation email sent successfully');
    } catch (emailError) {
      console.error('Error sending confirmation email:', emailError);
      // Don't fail the request if email fails
    }

    res.status(201).json({
      message: 'Your customisation request has been submitted successfully!',
      customisation
    });
  } catch (error) {
    console.error('Error submitting customisation:', error);
    res.status(500).json({
      message: 'Error submitting customisation request',
      error: error.message
    });
  }
});

// Get all customisation requests (admin only)
router.get('/requests', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const requests = await Customisation.find().sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching customisation requests', error: error.message });
  }
});

// Update customisation request status (admin only)
router.put('/requests/:id', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { status } = req.body;
    const request = await Customisation.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!request) {
      return res.status(404).json({ message: 'Customisation request not found' });
    }

    res.json(request);
  } catch (error) {
    res.status(500).json({ message: 'Error updating customisation request', error: error.message });
  }
});

// Get all customisations
router.get('/', async (req, res) => {
  try {
    const customisations = await Customisation.find();
    res.json(customisations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get customisation by ID
router.get('/:id', async (req, res) => {
  try {
    const customisation = await Customisation.findById(req.params.id);
    if (!customisation) {
      return res.status(404).json({ message: 'Customisation not found' });
    }
    res.json(customisation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new customisation
router.post('/', authMiddleware, async (req, res) => {
  try {
    const customisation = new Customisation({
      ...req.body,
      user: req.user._id
    });
    const newCustomisation = await customisation.save();
    res.status(201).json(newCustomisation);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update customisation
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const customisation = await Customisation.findById(req.params.id);
    if (!customisation) {
      return res.status(404).json({ message: 'Customisation not found' });
    }

    // Check if user owns the customisation
    if (customisation.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this customisation' });
    }

    Object.assign(customisation, req.body);
    const updatedCustomisation = await customisation.save();
    res.json(updatedCustomisation);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete customisation
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const customisation = await Customisation.findById(req.params.id);
    if (!customisation) {
      return res.status(404).json({ message: 'Customisation not found' });
    }

    // Check if user owns the customisation
    if (customisation.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this customisation' });
    }

    await customisation.remove();
    res.json({ message: 'Customisation deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 