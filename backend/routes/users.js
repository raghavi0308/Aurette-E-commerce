const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const User = require('../models/User');
const { auth: authMiddleware } = require('../middleware/auth');

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Set the destination to an 'uploads/avatars' directory
    cb(null, 'uploads/avatars/'); 
  },
  filename: function (req, file, cb) {
    // Use the user ID and the original file extension for the filename
    cb(null, req.user._id + '-' + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    // Accept images only
    if (!file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG|gif|GIF)$/)) {
      return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB max file size
  }
});

// @route GET /api/users/profile
// @desc Get user profile
// @access Private
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar
      }
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Error fetching user profile', error: error.message });
  }
});

// @route PATCH /api/users/avatar
// @desc Upload or update user avatar
// @access Private
router.patch('/avatar', authMiddleware, upload.single('avatar'), async (req, res) => {
  try {
    console.log('Avatar upload route: Request received.'); // Log start of route handler
    console.log('Avatar upload route: Authenticated user:', req.user.email); // Log authenticated user
    // req.file contains information about the uploaded file
    if (!req.file) {
      console.log('Avatar upload route: No file uploaded.'); // Log no file
      return res.status(400).json({ message: 'No file uploaded' });
    }

    console.log('Avatar upload route: File received:', req.file); // Log file details
    // Construct the URL/path to the saved avatar
    // Assuming your server is configured to serve static files from /uploads
    const avatarUrl = `/uploads/avatars/${req.file.filename}`;
    console.log('Avatar upload route: Generated avatar URL:', avatarUrl); // Log avatar URL

    // Update the user's avatar field in the database
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.avatar = avatarUrl;
    await user.save();
    console.log('Avatar upload route: User document updated.'); // Log user update

    res.json({ 
      message: 'Avatar updated successfully', 
      avatarUrl,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar
      }
    });
    console.log('Avatar upload route: Success response sent.'); // Log success response
  } catch (error) {
    console.error('Avatar upload route: Caught error:', error); // Log caught error
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router; 