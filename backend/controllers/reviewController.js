const asyncHandler = require('express-async-handler');
const Review = require('../models/Review');
const Book = require('../models/Book');
const Order = require('../models/Order');

// Helper to update Book rating statistics
const updateBookRating = async (bookId) => {
  const reviews = await Review.find({ book: bookId });
  const reviewCount = reviews.length;
  const rating = reviewCount > 0
    ? (reviews.reduce((acc, item) => item.rating + acc, 0) / reviewCount).toFixed(1)
    : 0;

  await Book.findByIdAndUpdate(bookId, {
    rating: Number(rating),
    reviewCount,
  });
};

// @desc    Get reviews for a book
// @route   GET /api/books/:bookId/reviews
// @access  Public
const getBookReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ book: req.params.bookId })
    .populate('user', 'name profileImage')
    .sort({ createdAt: -1 });

  res.json(reviews);
});

// @desc    Create a review (Verified buyers only)
// @route   POST /api/books/:bookId/reviews
// @access  Private
const createReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  const bookId = req.params.bookId;

  const book = await Book.findById(bookId);
  if (!book) {
    res.status(404);
    throw new Error('Book not found');
  }

  // Check if user already reviewed this book
  const alreadyReviewed = await Review.findOne({ book: bookId, user: req.user._id });
  if (alreadyReviewed) {
    res.status(400);
    throw new Error('You have already submitted a review for this book');
  }

  // Verify purchase: User must have an order with this book that is DELIVERED
  const hasDeliveredOrder = await Order.findOne({
    user: req.user._id,
    orderStatus: 'Delivered',
    'items.book': bookId,
  });

  if (!hasDeliveredOrder && req.user.role !== 'ADMIN') {
    res.status(403);
    throw new Error('Only customers who have purchased and received this book can submit a review');
  }

  const review = new Review({
    book: bookId,
    user: req.user._id,
    rating: Number(rating),
    comment,
    verifiedPurchase: !!hasDeliveredOrder,
  });

  await review.save();
  await updateBookRating(bookId);

  const populatedReview = await Review.findById(review._id).populate('user', 'name profileImage');
  res.status(201).json(populatedReview);
});

// @desc    Delete review (Admin or owner)
// @route   DELETE /api/reviews/:id
// @access  Private
const deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) {
    res.status(404);
    throw new Error('Review not found');
  }

  if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'ADMIN') {
    res.status(403);
    throw new Error('Not authorized to delete this review');
  }

  const bookId = review.book;
  await review.deleteOne();
  await updateBookRating(bookId);

  res.json({ message: 'Review removed successfully' });
});

module.exports = {
  getBookReviews,
  createReview,
  deleteReview,
};
