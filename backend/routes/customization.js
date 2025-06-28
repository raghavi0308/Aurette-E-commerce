const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { sendCustomizationConfirmation } = require('../utils/emailService');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/customization');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

// Submit customization request
router.post('/submit', upload.single('file'), async (req, res) => {
  try {
    const { name, phone, email, size, message } = req.body;
    const file = req.file ? `/uploads/customization/${req.file.filename}` : null;

    // Save to database (implement your database logic here)
    // const customization = await Customization.create({
    //   name,
    //   phone,
    //   email,
    //   size,
    //   message,
    //   file,
    //   status: 'pending'
    // });

    // Send confirmation email
    await sendCustomizationConfirmation(email, name);

    res.status(201).json({
      success: true,
      message: 'Customization request submitted successfully'
    });
  } catch (error) {
    console.error('Error submitting customization:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting customization request'
    });
  }
});

module.exports = router; 