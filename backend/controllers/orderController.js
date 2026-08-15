const asyncHandler = require('express-async-handler');
const Order = require('../models/Order');
const Book = require('../models/Book');
const Cart = require('../models/Cart');
const Coupon = require('../models/Coupon');
const generateOrderId = require('../utils/generateOrderId');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const createOrder = asyncHandler(async (req, res) => {
  const {
    items,
    shippingAddress,
    paymentMethod,
    couponCode,
  } = req.body;

  if (!items || items.length === 0) {
    res.status(400);
    throw new Error('No order items provided');
  }

  if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.street || !shippingAddress.city) {
    res.status(400);
    throw new Error('Please provide complete shipping address');
  }

  // Validate items & stock, calculate price snapshots
  let subtotal = 0;
  const processedItems = [];

  for (const item of items) {
    const book = await Book.findById(item.book);
    if (!book) {
      res.status(404);
      throw new Error(`Book not found: ${item.title || item.book}`);
    }

    if (book.stock < item.quantity) {
      res.status(400);
      throw new Error(`Insufficient stock for "${book.title}". Available: ${book.stock}, requested: ${item.quantity}`);
    }

    const itemPrice = book.discountPrice > 0 && book.discountPrice < book.price
      ? book.discountPrice
      : book.price;

    subtotal += itemPrice * item.quantity;

    processedItems.push({
      book: book._id,
      title: book.title,
      coverImage: book.coverImage,
      price: itemPrice,
      quantity: item.quantity,
    });
  }

  // Handle Coupon Discount
  let discount = 0;
  if (couponCode) {
    const coupon = await Coupon.findOne({
      code: couponCode.toUpperCase(),
      isActive: true,
    });

    if (coupon && coupon.expiresAt > new Date() && coupon.usedCount < coupon.usageLimit) {
      if (subtotal >= coupon.minOrderAmount) {
        if (coupon.discountType === 'percentage') {
          discount = (subtotal * coupon.discountValue) / 100;
          if (coupon.maxDiscountAmount > 0 && discount > coupon.maxDiscountAmount) {
            discount = coupon.maxDiscountAmount;
          }
        } else {
          discount = coupon.discountValue;
        }

        coupon.usedCount += 1;
        await coupon.save();
      }
    }
  }

  const shippingFee = subtotal > 2000 ? 0 : 150; // Free shipping over RS 2000
  const total = Math.max(0, subtotal + shippingFee - discount);

  const orderId = await generateOrderId();

  const order = new Order({
    orderId,
    user: req.user._id,
    items: processedItems,
    shippingAddress,
    subtotal,
    shippingFee,
    discount,
    total,
    couponCode: couponCode || '',
    paymentMethod: paymentMethod || 'Cash on Delivery',
    paymentStatus: paymentMethod === 'Cash on Delivery' ? 'Pending' : 'Paid',
    orderStatus: 'Pending',
  });

  const createdOrder = await order.save();

  // Deduct stock and increment sold count
  for (const item of processedItems) {
    await Book.findByIdAndUpdate(item.book, {
      $inc: { stock: -item.quantity, soldCount: item.quantity }
    });
  }

  // Clear customer cart
  await Cart.findOneAndUpdate(
    { user: req.user._id },
    { $set: { items: [] } }
  );

  res.status(201).json(createdOrder);
});

// @desc    Get logged in user orders
// @route   GET /api/orders/my-orders
// @access  Private
const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json(orders);
});

// @desc    Get order by ID or orderId
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = asyncHandler(async (req, res) => {
  const param = req.params.id;
  let order;

  if (param.match(/^[0-9a-fA-F]{24}$/)) {
    order = await Order.findById(param).populate('user', 'name email phone');
  } else {
    order = await Order.findOne({ orderId: param }).populate('user', 'name email phone');
  }

  if (order) {
    // Check if customer owns order or is admin
    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'ADMIN') {
      res.status(403);
      throw new Error('Not authorized to view this order');
    }
    res.json(order);
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

// @desc    Cancel order (Customer can cancel if Pending)
// @route   PUT /api/orders/:id/cancel
// @access  Private
const cancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'ADMIN') {
    res.status(403);
    throw new Error('Not authorized to cancel this order');
  }

  if (order.orderStatus !== 'Pending' && order.orderStatus !== 'Confirmed') {
    res.status(400);
    throw new Error(`Order cannot be cancelled once it is in ${order.orderStatus} status`);
  }

  order.orderStatus = 'Cancelled';
  await order.save();

  // Restore book stock
  for (const item of order.items) {
    await Book.findByIdAndUpdate(item.book, {
      $inc: { stock: item.quantity, soldCount: -item.quantity }
    });
  }

  res.json({ message: 'Order cancelled successfully and stock restored', order });
});

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
};
