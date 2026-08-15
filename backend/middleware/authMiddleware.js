const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');

const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'bookmart_super_secret_jwt_key_2026_safe');

      const user = await User.findById(decoded.id).select('-password');
      if (!user) {
        res.status(401);
        throw new Error('User not found, token authorization failed');
      }

      if (user.isBlocked) {
        res.status(403);
        throw new Error('Your account has been blocked. Please contact customer support.');
      }

      req.user = user;
      next();
    } catch (error) {
      res.status(401);
      throw new Error(error.message || 'Not authorized, token failed');
    }
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token provided');
  }
});

const admin = (req, res, next) => {
  if (req.user && req.user.role === 'ADMIN') {
    next();
  } else {
    res.status(403);
    throw new Error('Not authorized as an admin');
  }
};

module.exports = { protect, admin };
