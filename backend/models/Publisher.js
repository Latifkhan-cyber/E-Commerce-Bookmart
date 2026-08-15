const mongoose = require('mongoose');

const publisherSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add publisher name'],
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
  logo: {
    type: String,
    default: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500&q=80',
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Publisher', publisherSchema);
