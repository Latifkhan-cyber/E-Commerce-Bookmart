const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a book title'],
    trim: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Author',
    required: [true, 'Please select an author'],
  },
  publisher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Publisher',
    required: [true, 'Please select a publisher'],
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Please select a category'],
  },
  isbn: {
    type: String,
    required: [true, 'Please add ISBN'],
    unique: true,
    trim: true,
  },
  price: {
    type: Number,
    required: [true, 'Please add a regular price'],
    min: 0,
  },
  discountPrice: {
    type: Number,
    default: 0,
    min: 0,
  },
  coverImage: {
    type: String,
    required: [true, 'Please add a cover image URL'],
  },
  images: [{
    type: String
  }],
  pages: {
    type: Number,
    default: 200,
  },
  language: {
    type: String,
    default: 'English',
  },
  publicationYear: {
    type: Number,
    default: 2024,
  },
  stock: {
    type: Number,
    required: [true, 'Please specify available stock'],
    min: 0,
    default: 10,
  },
  soldCount: {
    type: Number,
    default: 0,
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },
  reviewCount: {
    type: Number,
    default: 0,
  },
  featured: {
    type: Boolean,
    default: false,
  },
  bestSeller: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

// Text index for fast multi-field search
bookSchema.index({ title: 'text', isbn: 'text', description: 'text' });

module.exports = mongoose.model('Book', bookSchema);
