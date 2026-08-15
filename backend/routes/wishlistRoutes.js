const express = require('express');
const router = express.Router();
const {
  getWishlist,
  toggleWishlist,
  removeFromWishlist,
} = require('../controllers/wishlistController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
  .get(getWishlist)
  .post(toggleWishlist);

router.route('/:bookId')
  .delete(removeFromWishlist);

module.exports = router;
