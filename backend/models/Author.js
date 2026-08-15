const mongoose = require('mongoose');

const authorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add author name'],
    trim: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  bio: {
    type: String,
    default: '',
  },
  image: {
    type: String,
    default: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=500&q=80',
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Author', authorSchema);
