const Order = require('../models/Order');

const generateOrderId = async () => {
  const count = await Order.countDocuments();
  const nextNumber = 10001 + count;
  return `BK-${nextNumber}`;
};

module.exports = generateOrderId;
