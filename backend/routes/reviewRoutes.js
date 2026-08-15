const express = require('express');
const router = express.Router();
const { deleteReview } = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');

router.route('/:id')
  .delete(protect, deleteReview);

module.exports = router;
