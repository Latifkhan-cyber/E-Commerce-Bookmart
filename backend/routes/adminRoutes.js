const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getAllOrders,
  updateOrderStatus,
  getAllCustomers,
  toggleBlockCustomer,
  getInventory,
} = require('../controllers/adminController');
const { protect, admin } = require('../middleware/authMiddleware');

router.use(protect, admin);

router.get('/stats', getDashboardStats);
router.get('/orders', getAllOrders);
router.put('/orders/:id/status', updateOrderStatus);
router.get('/customers', getAllCustomers);
router.put('/customers/:id/block', toggleBlockCustomer);
router.get('/inventory', getInventory);

module.exports = router;
