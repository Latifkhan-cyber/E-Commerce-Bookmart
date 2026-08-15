const asyncHandler = require('express-async-handler');
const Wishlist = require('../models/Wishlist');
const Book = require('../models/Book');

// @desc    Get user's wishlist
// @route   GET /api/wishlist
// @access  Private
const getWishlist = asyncHandler(async (req, res) => {
  let wishlist = await Wishlist.findOne({ user: req.user._id }).populate({
    path: 'books',
    select: 'title slug price discountPrice coverImage stock rating reviewCount author category',
    populate: [
      { path: 'author', select: 'name' },
      { path: 'category', select: 'name' }
    ]
  });

  if (!wishlist) {
    wishlist = await Wishlist.create({ user: req.user._id, books: [] });
  }

  res.json(wishlist);
});

// @desc    Add or Remove (Toggle) item in wishlist
// @route   POST /api/wishlist
// @access  Private
const toggleWishlist = asyncHandler(async (req, res) => {
  const { bookId } = req.body;

  const book = await Book.findById(bookId);
  if (!book) {
    res.status(404);
    throw new Error('Book not found');
  }

  let wishlist = await Wishlist.findOne({ user: req.user._id });
  if (!wishlist) {
    wishlist = new Wishlist({ user: req.user._id, books: [] });
  }

  const index = wishlist.books.indexOf(bookId);
  if (index > -1) {
    wishlist.books.splice(index, 1);
  } else {
    wishlist.books.push(bookId);
  }

  await wishlist.save();

  const populatedWishlist = await Wishlist.findById(wishlist._id).populate({
    path: 'books',
    select: 'title slug price discountPrice coverImage stock rating reviewCount author category',
    populate: [
      { path: 'author', select: 'name' },
      { path: 'category', select: 'name' }
    ]
  });

  res.json(populatedWishlist);
});

// @desc    Remove single item from wishlist
// @route   DELETE /api/wishlist/:bookId
// @access  Private
const removeFromWishlist = asyncHandler(async (req, res) => {
  const { bookId } = req.params;

  const wishlist = await Wishlist.findOne({ user: req.user._id });
  if (wishlist) {
    wishlist.books = wishlist.books.filter(id => id.toString() !== bookId);
    await wishlist.save();

    const populatedWishlist = await Wishlist.findById(wishlist._id).populate({
      path: 'books',
      select: 'title slug price discountPrice coverImage stock rating reviewCount author category',
      populate: [
        { path: 'author', select: 'name' },
        { path: 'category', select: 'name' }
      ]
    });

    res.json(populatedWishlist);
  } else {
    res.status(404);
    throw new Error('Wishlist not found');
  }
});

module.exports = {
  getWishlist,
  toggleWishlist,
  removeFromWishlist,
};
