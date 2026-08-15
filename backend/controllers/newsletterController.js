const asyncHandler = require('express-async-handler');
const Newsletter = require('../models/Newsletter');

// @desc    Subscribe to newsletter
// @route   POST /api/newsletter/subscribe
// @access  Public
const subscribeNewsletter = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    res.status(400);
    throw new Error('Email address is required');
  }

  const existing = await Newsletter.findOne({ email });
  if (existing) {
    res.status(400);
    throw new Error('This email address is already subscribed to our newsletter');
  }

  await Newsletter.create({ email });
  res.status(201).json({ message: 'Thank you for subscribing to BookMart newsletter!' });
});

module.exports = { subscribeNewsletter };
