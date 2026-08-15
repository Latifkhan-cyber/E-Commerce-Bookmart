const asyncHandler = require('express-async-handler');
const Cart = require('../models/Cart');
const Book = require('../models/Book');

// @desc    Get logged in user's cart
// @route   GET /api/cart
// @access  Private
const getCart = asyncHandler(async (req, res) => {
  let cart = await Cart.findOne({ user: req.user._id }).populate({
    path: 'items.book',
    select: 'title slug price discountPrice coverImage stock author category',
    populate: [
      { path: 'author', select: 'name' },
      { path: 'category', select: 'name' }
    ]
  });

  if (!cart) {
    cart = await Cart.create({ user: req.user._id, items: [] });
  }

  res.json(cart);
});

// @desc    Add item to cart or update quantity
// @route   POST /api/cart
// @access  Private
const addToCart = asyncHandler(async (req, res) => {
  const { bookId, quantity } = req.body;
  const qty = Number(quantity) || 1;

  const book = await Book.findById(bookId);
  if (!book) {
    res.status(404);
    throw new Error('Book not found');
  }

  if (book.stock < 1) {
    res.status(400);
    throw new Error('Sorry, this book is currently out of stock');
  }

  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    cart = new Cart({ user: req.user._id, items: [] });
  }

  const existingItemIndex = cart.items.findIndex(
    (item) => item.book.toString() === bookId
  );

  if (existingItemIndex > -1) {
    const newQty = cart.items[existingItemIndex].quantity + qty;
    if (newQty > book.stock) {
      res.status(400);
      throw new Error(`Cannot add more than available stock (${book.stock} available)`);
    }
    cart.items[existingItemIndex].quantity = newQty;
  } else {
    if (qty > book.stock) {
      res.status(400);
      throw new Error(`Cannot add more than available stock (${book.stock} available)`);
    }
    cart.items.push({ book: bookId, quantity: qty });
  }

  await cart.save();

  const populatedCart = await Cart.findById(cart._id).populate({
    path: 'items.book',
    select: 'title slug price discountPrice coverImage stock author category',
    populate: [
      { path: 'author', select: 'name' },
      { path: 'category', select: 'name' }
    ]
  });

  res.status(200).json(populatedCart);
});

// @desc    Update cart item quantity
// @route   PUT /api/cart/:bookId
// @access  Private
const updateCartItem = asyncHandler(async (req, res) => {
  const { quantity } = req.body;
  const { bookId } = req.params;
  const qty = Number(quantity);

  if (qty < 1) {
    res.status(400);
    throw new Error('Quantity must be at least 1');
  }

  const book = await Book.findById(bookId);
  if (!book) {
    res.status(404);
    throw new Error('Book not found');
  }

  if (qty > book.stock) {
    res.status(400);
    throw new Error(`Only ${book.stock} units available in stock`);
  }

  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    res.status(404);
    throw new Error('Cart not found');
  }

  const itemIndex = cart.items.findIndex(
    (item) => item.book.toString() === bookId
  );

  if (itemIndex > -1) {
    cart.items[itemIndex].quantity = qty;
    await cart.save();

    const populatedCart = await Cart.findById(cart._id).populate({
      path: 'items.book',
      select: 'title slug price discountPrice coverImage stock author category',
      populate: [
        { path: 'author', select: 'name' },
        { path: 'category', select: 'name' }
      ]
    });

    res.json(populatedCart);
  } else {
    res.status(404);
    throw new Error('Item not found in cart');
  }
});

// @desc    Remove item from cart
// @route   DELETE /api/cart/:bookId
// @access  Private
const removeFromCart = asyncHandler(async (req, res) => {
  const { bookId } = req.params;

  const cart = await Cart.findOne({ user: req.user._id });
  if (cart) {
    cart.items = cart.items.filter((item) => item.book.toString() !== bookId);
    await cart.save();

    const populatedCart = await Cart.findById(cart._id).populate({
      path: 'items.book',
      select: 'title slug price discountPrice coverImage stock author category',
      populate: [
        { path: 'author', select: 'name' },
        { path: 'category', select: 'name' }
      ]
    });

    res.json(populatedCart);
  } else {
    res.status(404);
    throw new Error('Cart not found');
  }
});

// @desc    Clear entire cart
// @route   DELETE /api/cart
// @access  Private
const clearCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });
  if (cart) {
    cart.items = [];
    await cart.save();
    res.json(cart);
  } else {
    res.json({ user: req.user._id, items: [] });
  }
});

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
};
