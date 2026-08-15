const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: [true, 'Please provide coupon code'],
    unique: true,
    uppercase: true,
    trim: true,
  },
  discountType: {
    type: String,
    enum: ['percentage', 'fixed'],
    required: true,
    default: 'percentage',
  },
  discountValue: {
    type: Number,
    required: true,
    min: 0,
  },
  minOrderAmount: {
    type: Number,
    default: 0,
  },
  maxDiscountAmount: {
    type: Number,
    default: 0, // 0 means no limit
  },
  expiresAt: {
    type: Date,
    required: true,
  },
  usageLimit: {
    type: Number,
    default: 100,
  },
  usedCount: {
    type: Number,
    default: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Coupon', couponSchema);
