const express = require('express');
const router = express.Router();
const { signup, login, getMe, updateProfile, verifyPassword, logout } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// Public routes
router.post('/signup', signup);
router.post('/login', login);
router.get('/logout', logout);

// Protected routes
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.post('/verify-password', protect, verifyPassword);

module.exports = router;
