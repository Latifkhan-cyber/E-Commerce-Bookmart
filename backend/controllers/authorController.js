const asyncHandler = require('express-async-handler');
const Author = require('../models/Author');
const Book = require('../models/Book');

const slugify = (text) => text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '');

// @desc    Get all authors with book counts
// @route   GET /api/authors
// @access  Public
const getAuthors = asyncHandler(async (req, res) => {
  const authors = await Author.find({}).sort({ name: 1 });
  const authorsWithCounts = await Promise.all(
    authors.map(async (author) => {
      const bookCount = await Book.countDocuments({ author: author._id });
      return {
        ...author.toObject(),
        bookCount,
      };
    })
  );
  res.json(authorsWithCounts);
});

// @desc    Get single author details with books written
// @route   GET /api/authors/:idOrSlug
// @access  Public
const getAuthorByIdOrSlug = asyncHandler(async (req, res) => {
  const param = req.params.idOrSlug;
  const query = param.match(/^[0-9a-fA-F]{24}$/) ? { _id: param } : { slug: param };

  const author = await Author.findOne(query);
  if (author) {
    const books = await Book.find({ author: author._id })
      .populate('category', 'name slug')
      .populate('publisher', 'name slug');
    res.json({ author, books });
  } else {
    res.status(404);
    throw new Error('Author not found');
  }
});

// @desc    Create Author
// @route   POST /api/authors
// @access  Private/Admin
const createAuthor = asyncHandler(async (req, res) => {
  const { name, bio, image } = req.body;
  const slug = slugify(name) + '-' + Date.now();

  const author = new Author({
    name,
    slug,
    bio: bio || '',
    image: image || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=500&q=80',
  });

  const created = await author.save();
  res.status(201).json(created);
});

// @desc    Update Author
// @route   PUT /api/authors/:id
// @access  Private/Admin
const updateAuthor = asyncHandler(async (req, res) => {
  const author = await Author.findById(req.params.id);
  if (author) {
    author.name = req.body.name || author.name;
    if (req.body.name && req.body.name !== author.name) {
      author.slug = slugify(req.body.name) + '-' + Date.now();
    }
    author.bio = req.body.bio !== undefined ? req.body.bio : author.bio;
    if (req.body.image) author.image = req.body.image;

    const updated = await author.save();
    res.json(updated);
  } else {
    res.status(404);
    throw new Error('Author not found');
  }
});

// @desc    Delete Author
// @route   DELETE /api/authors/:id
// @access  Private/Admin
const deleteAuthor = asyncHandler(async (req, res) => {
  const author = await Author.findById(req.params.id);
  if (author) {
    await author.deleteOne();
    res.json({ message: 'Author deleted successfully' });
  } else {
    res.status(404);
    throw new Error('Author not found');
  }
});

module.exports = {
  getAuthors,
  getAuthorByIdOrSlug,
  createAuthor,
  updateAuthor,
  deleteAuthor,
};
