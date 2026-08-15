const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  book: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  rating: {
    type: Number,
    required: [true, 'Please give a rating between 1 and 5'],
    min: 1,
    max: 5,
  },
  comment: {
    type: String,
    required: [true, 'Please add a comment'],
    trim: true,
  },
  verifiedPurchase: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

// Enforce one review per user per book
reviewSchema.index({ book: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);
