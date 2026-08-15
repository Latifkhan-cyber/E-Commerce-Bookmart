const asyncHandler = require('express-async-handler');
const Book = require('../models/Book');
const Order = require('../models/Order');
const User = require('../models/User');
const Category = require('../models/Category');

// @desc    Get Admin Dashboard Analytics & Summary Statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
const getDashboardStats = asyncHandler(async (req, res) => {
  const totalBooks = await Book.countDocuments();
  const totalCustomers = await User.countDocuments({ role: 'CUSTOMER' });
  const totalOrders = await Order.countDocuments();
  const pendingOrders = await Order.countDocuments({ orderStatus: 'Pending' });
  const deliveredOrders = await Order.countDocuments({ orderStatus: 'Delivered' });
  const lowStockBooks = await Book.countDocuments({ stock: { $lte: 5 } });

  // Calculate Total Revenue from non-cancelled orders
  const revenueAgg = await Order.aggregate([
    { $match: { orderStatus: { $ne: 'Cancelled' } } },
    { $group: { _id: null, totalRevenue: { $sum: '$total' } } }
  ]);
  const totalRevenue = revenueAgg.length > 0 ? revenueAgg[0].totalRevenue : 0;

  // Monthly Revenue breakdown (Last 6 months)
  const monthlyRevenue = await Order.aggregate([
    { $match: { orderStatus: { $ne: 'Cancelled' } } },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        },
        revenue: { $sum: '$total' },
        orders: { $sum: 1 }
      }
    },
    { $sort: { '_id.year': -1, '_id.month': -1 } },
    { $limit: 6 }
  ]);

  // Top 5 Best Selling Books
  const bestSellers = await Book.find({})
    .sort({ soldCount: -1 })
    .limit(5)
    .select('title coverImage soldCount price rating stock');

  res.json({
    totalBooks,
    totalCustomers,
    totalOrders,
    totalRevenue,
    pendingOrders,
    deliveredOrders,
    lowStockBooks,
    monthlyRevenue,
    bestSellers,
  });
});

// @desc    Get all orders (Admin)
// @route   GET /api/admin/orders
// @access  Private/Admin
const getAllOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({})
    .populate('user', 'name email phone')
    .sort({ createdAt: -1 });

  res.json(orders);
});

// @desc    Update order status & payment status (Admin)
// @route   PUT /api/admin/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { orderStatus, paymentStatus } = req.body;
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  const oldStatus = order.orderStatus;
  if (orderStatus) order.orderStatus = orderStatus;
  if (paymentStatus) order.paymentStatus = paymentStatus;

  if (orderStatus === 'Delivered') {
    order.deliveredAt = Date.now();
    order.paymentStatus = 'Paid'; // Cash on Delivery collected
  }

  // Restore stock if admin cancels an order
  if (orderStatus === 'Cancelled' && oldStatus !== 'Cancelled') {
    for (const item of order.items) {
      await Book.findByIdAndUpdate(item.book, {
        $inc: { stock: item.quantity, soldCount: -item.quantity }
      });
    }
  }

  const updatedOrder = await order.save();
  res.json(updatedOrder);
});

// @desc    Get all customers with spending & order count (Admin)
// @route   GET /api/admin/customers
// @access  Private/Admin
const getAllCustomers = asyncHandler(async (req, res) => {
  const customers = await User.find({ role: 'CUSTOMER' }).sort({ createdAt: -1 });

  const customerList = await Promise.all(
    customers.map(async (cust) => {
      const orders = await Order.find({ user: cust._id, orderStatus: { $ne: 'Cancelled' } });
      const totalSpent = orders.reduce((acc, o) => acc + o.total, 0);
      return {
        _id: cust._id,
        name: cust.name,
        email: cust.email,
        phone: cust.phone,
        profileImage: cust.profileImage,
        isBlocked: cust.isBlocked,
        orderCount: orders.length,
        totalSpent,
        createdAt: cust.createdAt,
      };
    })
  );

  res.json(customerList);
});

// @desc    Block or Unblock customer (Admin)
// @route   PUT /api/admin/customers/:id/block
// @access  Private/Admin
const toggleBlockCustomer = asyncHandler(async (req, res) => {
  const customer = await User.findById(req.params.id);
  if (!customer) {
    res.status(404);
    throw new Error('Customer not found');
  }

  customer.isBlocked = !customer.isBlocked;
  await customer.save();

  res.json({
    _id: customer._id,
    name: customer.name,
    isBlocked: customer.isBlocked,
    message: `Customer account ${customer.isBlocked ? 'blocked' : 'unblocked'} successfully`,
  });
});

// @desc    Get low stock inventory items
// @route   GET /api/admin/inventory
// @access  Private/Admin
const getInventory = asyncHandler(async (req, res) => {
  const books = await Book.find({})
    .populate('category', 'name')
    .populate('author', 'name')
    .sort({ stock: 1 });

  res.json(books);
});

module.exports = {
  getDashboardStats,
  getAllOrders,
  updateOrderStatus,
  getAllCustomers,
  toggleBlockCustomer,
  getInventory,
};
