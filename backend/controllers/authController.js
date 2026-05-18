const User = require('../models/User');
const jwt = require('jsonwebtoken');

/**
 * Generate JWT token for user
 */
const getSignedToken = (user) => {
  const token = jwt.sign(
    { id: user._id, email: user.email },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '7d' }
  );
  return token;
};

/**
 * Format user data for response (without password)
 */
const formatUserResponse = (user) => {
  return {
    id: user._id,
    name: user.name,
    email: user.email
  };
};

// @desc    Register user / Signup
// @route   POST /api/v1/auth/signup
// @access  Public
exports.signup = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, error: 'Please provide name, email, and password' });
    }

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ success: false, error: 'User already exists' });
    }

    // Create user
    user = await User.create({ name, email, password });

    // Generate token
    const token = getSignedToken(user);

    return res.status(201).json({
      success: true,
      data: {
        user: formatUserResponse(user),
        token
      }
    });
  } catch (err) {
    console.error('Signup error:', err);
    if (err.code === 11000) {
      return res.status(400).json({ success: false, error: 'Email already in use' });
    }
    next(err);
  }
};

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Please provide email and password' });
    }

    // Check for user (include password for comparison)
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(400).json({ success: false, error: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(400).json({ success: false, error: 'Invalid credentials' });
    }

    // Generate token
    const token = getSignedToken(user);

    return res.status(200).json({
      success: true,
      data: {
        user: formatUserResponse(user),
        token
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    next(err);
  }
};

// @desc    Get current logged in user
// @route   GET /api/v1/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    return res.status(200).json({
      success: true,
      data: formatUserResponse(user)
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update user profile
// @route   PUT /api/v1/auth/profile
// @access  Private
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, email, oldPassword, newPassword } = req.body;
    const userId = req.user.id;

    // Check if email is being changed and if it already exists
    if (email) {
      const existingUser = await User.findOne({ email, _id: { $ne: userId } });
      if (existingUser) {
        return res.status(400).json({ success: false, error: 'Email already in use' });
      }
    }

    // If user is trying to change password, verify old password first
    if (newPassword) {
      if (!oldPassword) {
        return res.status(400).json({ success: false, error: 'Current password is required to change password' });
      }

      // Get user with password field
      const user = await User.findById(userId).select('+password');
      if (!user) {
        return res.status(404).json({ success: false, error: 'User not found' });
      }

      // Verify old password
      const isMatch = await user.matchPassword(oldPassword);
      if (!isMatch) {
        return res.status(401).json({ success: false, error: 'Current password is incorrect' });
      }
    }

    // Build update object
    const user = await User.findById(userId).select('+password');
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    if (name) user.name = name;
    if (email) user.email = email;
    if (newPassword) user.password = newPassword;

    // Save through the document so password hashing runs
    await user.save();

    return res.status(200).json({
      success: true,
      data: formatUserResponse(user)
    });
  } catch (err) {
    console.error('Update profile error:', err);
    if (err.code === 11000) {
      return res.status(400).json({ success: false, error: 'Email already in use' });
    }
    next(err);
  }
};

// @desc    Verify old password
// @route   POST /api/v1/auth/verify-password
// @access  Private
exports.verifyPassword = async (req, res, next) => {
  try {
    const { password } = req.body;
    const userId = req.user.id;

    if (!password) {
      return res.status(400).json({ success: false, error: 'Password is required' });
    }

    // Get user with password field
    const user = await User.findById(userId).select('+password');
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Verify password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(200).json({
        success: true,
        isCorrect: false,
        error: 'Password is incorrect'
      });
    }

    return res.status(200).json({
      success: true,
      isCorrect: true,
      message: 'Password is correct'
    });
  } catch (err) {
    console.error('Verify password error:', err);
    next(err);
  }
};

// @desc    Logout user / clear token
// @route   GET /api/v1/auth/logout
// @access  Public
exports.logout = (req, res, next) => {
  return res.status(200).json({
    success: true,
    data: {}
  });
};
