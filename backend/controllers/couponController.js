const asyncHandler = require('express-async-handler');
const Coupon = require('../models/Coupon');

// @desc    Validate coupon code
// @route   POST /api/coupons/validate
// @access  Public
const validateCoupon = asyncHandler(async (req, res) => {
  const { code, cartSubtotal } = req.body;

  if (!code) {
    res.status(400);
    throw new Error('Coupon code is required');
  }

  const coupon = await Coupon.findOne({
    code: code.toUpperCase(),
    isActive: true,
  });

  if (!coupon) {
    res.status(404);
    throw new Error('Invalid or expired coupon code');
  }

  if (coupon.expiresAt < new Date()) {
    res.status(400);
    throw new Error('Coupon code has expired');
  }

  if (coupon.usedCount >= coupon.usageLimit) {
    res.status(400);
    throw new Error('Coupon usage limit reached');
  }

  const subtotal = Number(cartSubtotal) || 0;
  if (subtotal < coupon.minOrderAmount) {
    res.status(400);
    throw new Error(`Minimum order amount for this coupon is RS ${coupon.minOrderAmount}`);
  }

  let discount = 0;
  if (coupon.discountType === 'percentage') {
    discount = (subtotal * coupon.discountValue) / 100;
    if (coupon.maxDiscountAmount > 0 && discount > coupon.maxDiscountAmount) {
      discount = coupon.maxDiscountAmount;
    }
  } else {
    discount = coupon.discountValue;
  }

  res.json({
    code: coupon.code,
    discountType: coupon.discountType,
    discountValue: coupon.discountValue,
    discountAmount: Math.round(discount),
  });
});

// @desc    Get all coupons (Admin)
// @route   GET /api/coupons
// @access  Private/Admin
const getCoupons = asyncHandler(async (req, res) => {
  const coupons = await Coupon.find({}).sort({ createdAt: -1 });
  res.json(coupons);
});

// @desc    Create Coupon (Admin)
// @route   POST /api/coupons
// @access  Private/Admin
const createCoupon = asyncHandler(async (req, res) => {
  const { code, discountType, discountValue, minOrderAmount, maxDiscountAmount, expiresAt, usageLimit } = req.body;

  const exists = await Coupon.findOne({ code: code.toUpperCase() });
  if (exists) {
    res.status(400);
    throw new Error('Coupon with this code already exists');
  }

  const coupon = new Coupon({
    code: code.toUpperCase(),
    discountType: discountType || 'percentage',
    discountValue: Number(discountValue),
    minOrderAmount: Number(minOrderAmount) || 0,
    maxDiscountAmount: Number(maxDiscountAmount) || 0,
    expiresAt: new Date(expiresAt),
    usageLimit: Number(usageLimit) || 100,
  });

  const created = await coupon.save();
  res.status(201).json(created);
});

// @desc    Delete Coupon (Admin)
// @route   DELETE /api/coupons/:id
// @access  Private/Admin
const deleteCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findById(req.params.id);
  if (coupon) {
    await coupon.deleteOne();
    res.json({ message: 'Coupon removed' });
  } else {
    res.status(404);
    throw new Error('Coupon not found');
  }
});

module.exports = {
  validateCoupon,
  getCoupons,
  createCoupon,
  deleteCoupon,
};
