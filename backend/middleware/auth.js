const jwt = require('jsonwebtoken');

/**
 * Middleware to protect routes with JWT authentication
 * Verifies Bearer token from Authorization header
 */
exports.protect = (req, res, next) => {
  let token;

  // Check for token in Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, error: 'Not authorized to access this route' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, error: 'Not authorized to access this route' });
  }
};
