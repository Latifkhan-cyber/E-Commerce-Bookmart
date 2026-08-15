const asyncHandler = require('express-async-handler');
const Publisher = require('../models/Publisher');
const Book = require('../models/Book');

const slugify = (text) => text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '');

// @desc    Get all publishers with book counts
// @route   GET /api/publishers
// @access  Public
const getPublishers = asyncHandler(async (req, res) => {
  const publishers = await Publisher.find({}).sort({ name: 1 });
  const publishersWithCounts = await Promise.all(
    publishers.map(async (pub) => {
      const bookCount = await Book.countDocuments({ publisher: pub._id });
      return {
        ...pub.toObject(),
        bookCount,
      };
    })
  );
  res.json(publishersWithCounts);
});

// @desc    Get publisher details with published books
// @route   GET /api/publishers/:idOrSlug
// @access  Public
const getPublisherByIdOrSlug = asyncHandler(async (req, res) => {
  const param = req.params.idOrSlug;
  const query = param.match(/^[0-9a-fA-F]{24}$/) ? { _id: param } : { slug: param };

  const publisher = await Publisher.findOne(query);
  if (publisher) {
    const books = await Book.find({ publisher: publisher._id })
      .populate('author', 'name slug')
      .populate('category', 'name slug');
    res.json({ publisher, books });
  } else {
    res.status(404);
    throw new Error('Publisher not found');
  }
});

// @desc    Create Publisher
// @route   POST /api/publishers
// @access  Private/Admin
const createPublisher = asyncHandler(async (req, res) => {
  const { name, description, logo } = req.body;
  const slug = slugify(name) + '-' + Date.now();

  const publisher = new Publisher({
    name,
    slug,
    description: description || '',
    logo: logo || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500&q=80',
  });

  const created = await publisher.save();
  res.status(201).json(created);
});

// @desc    Update Publisher
// @route   PUT /api/publishers/:id
// @access  Private/Admin
const updatePublisher = asyncHandler(async (req, res) => {
  const publisher = await Publisher.findById(req.params.id);
  if (publisher) {
    publisher.name = req.body.name || publisher.name;
    if (req.body.name && req.body.name !== publisher.name) {
      publisher.slug = slugify(req.body.name) + '-' + Date.now();
    }
    publisher.description = req.body.description !== undefined ? req.body.description : publisher.description;
    if (req.body.logo) publisher.logo = req.body.logo;

    const updated = await publisher.save();
    res.json(updated);
  } else {
    res.status(404);
    throw new Error('Publisher not found');
  }
});

// @desc    Delete Publisher
// @route   DELETE /api/publishers/:id
// @access  Private/Admin
const deletePublisher = asyncHandler(async (req, res) => {
  const publisher = await Publisher.findById(req.params.id);
  if (publisher) {
    await publisher.deleteOne();
    res.json({ message: 'Publisher deleted successfully' });
  } else {
    res.status(404);
    throw new Error('Publisher not found');
  }
});

module.exports = {
  getPublishers,
  getPublisherByIdOrSlug,
  createPublisher,
  updatePublisher,
  deletePublisher,
};
