const express = require('express');
const router = express.Router();
const {
  getBooks,
  getBookByIdOrSlug,
  createBook,
  updateBook,
  deleteBook,
} = require('../controllers/bookController');
const { getBookReviews, createReview } = require('../controllers/reviewController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
  .get(getBooks)
  .post(protect, admin, createBook);

router.route('/:idOrSlug')
  .get(getBookByIdOrSlug);

router.route('/:id')
  .put(protect, admin, updateBook)
  .delete(protect, admin, deleteBook);

router.route('/:bookId/reviews')
  .get(getBookReviews)
  .post(protect, createReview);

module.exports = router;
