const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a category name'],
    unique: true,
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
    default: '',
  },
  image: {
    type: String,
    default: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=500&q=80',
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Category', categorySchema);
