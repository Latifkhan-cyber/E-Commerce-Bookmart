const asyncHandler = require('express-async-handler');
const Book = require('../models/Book');
const Category = require('../models/Category');
const Author = require('../models/Author');
const Publisher = require('../models/Publisher');

// Helper to generate slug
const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
};

// @desc    Fetch all books with filters, search, pagination, and sorting
// @route   GET /api/books
// @access  Public
const getBooks = asyncHandler(async (req, res) => {
  const pageSize = Number(req.query.limit) || 12;
  const page = Number(req.query.page) || 1;

  let query = {};

  // Keyword / Search filter (Title, ISBN, Description)
  if (req.query.search) {
    const searchRegex = new RegExp(req.query.search, 'i');
    
    // Find matching authors/categories/publishers first to allow search by author/category name
    const matchingAuthors = await Author.find({ name: searchRegex }).select('_id');
    const matchingCategories = await Category.find({ name: searchRegex }).select('_id');
    const matchingPublishers = await Publisher.find({ name: searchRegex }).select('_id');

    query.$or = [
      { title: searchRegex },
      { isbn: searchRegex },
      { description: searchRegex },
      { author: { $in: matchingAuthors.map(a => a._id) } },
      { category: { $in: matchingCategories.map(c => c._id) } },
      { publisher: { $in: matchingPublishers.map(p => p._id) } },
    ];
  }

  // Category filter
  if (req.query.category) {
    if (req.query.category.match(/^[0-9a-fA-F]{24}$/)) {
      query.category = req.query.category;
    } else {
      const cat = await Category.findOne({ slug: req.query.category });
      if (cat) query.category = cat._id;
    }
  }

  // Author filter
  if (req.query.author) {
    if (req.query.author.match(/^[0-9a-fA-F]{24}$/)) {
      query.author = req.query.author;
    } else {
      const aut = await Author.findOne({ slug: req.query.author });
      if (aut) query.author = aut._id;
    }
  }

  // Publisher filter
  if (req.query.publisher) {
    if (req.query.publisher.match(/^[0-9a-fA-F]{24}$/)) {
      query.publisher = req.query.publisher;
    } else {
      const pub = await Publisher.findOne({ slug: req.query.publisher });
      if (pub) query.publisher = pub._id;
    }
  }

  // Price filter
  if (req.query.minPrice || req.query.maxPrice) {
    query.price = {};
    if (req.query.minPrice) query.price.$gte = Number(req.query.minPrice);
    if (req.query.maxPrice) query.price.$lte = Number(req.query.maxPrice);
  }

  // Minimum Rating filter
  if (req.query.rating) {
    query.rating = { $gte: Number(req.query.rating) };
  }

  // Availability filter
  if (req.query.inStock === 'true') {
    query.stock = { $gt: 0 };
  }

  // Featured or Bestseller filters
  if (req.query.featured === 'true') query.featured = true;
  if (req.query.bestSeller === 'true') query.bestSeller = true;

  // Sorting
  let sortOption = { createdAt: -1 }; // Default newest
  if (req.query.sort) {
    switch (req.query.sort) {
      case 'oldest':
        sortOption = { createdAt: 1 };
        break;
      case 'priceLow':
      case 'priceAsc':
        sortOption = { price: 1 };
        break;
      case 'priceHigh':
      case 'priceDesc':
        sortOption = { price: -1 };
        break;
      case 'rating':
        sortOption = { rating: -1 };
        break;
      case 'popular':
        sortOption = { soldCount: -1 };
        break;
      default:
        sortOption = { createdAt: -1 };
    }
  }

  const count = await Book.countDocuments(query);
  const books = await Book.find(query)
    .populate('author', 'name slug image')
    .populate('category', 'name slug')
    .populate('publisher', 'name slug logo')
    .sort(sortOption)
    .limit(pageSize)
    .skip(pageSize * (page - 1));

  res.json({
    books,
    page,
    pages: Math.ceil(count / pageSize),
    totalBooks: count,
  });
});

// @desc    Fetch single book by ID or Slug
// @route   GET /api/books/:idOrSlug
// @access  Public
const getBookByIdOrSlug = asyncHandler(async (req, res) => {
  const param = req.params.idOrSlug;
  let book;

  if (param.match(/^[0-9a-fA-F]{24}$/)) {
    book = await Book.findById(param)
      .populate('author', 'name slug bio image')
      .populate('category', 'name slug description')
      .populate('publisher', 'name slug description logo');
  } else {
    book = await Book.findOne({ slug: param })
      .populate('author', 'name slug bio image')
      .populate('category', 'name slug description')
      .populate('publisher', 'name slug description logo');
  }

  if (book) {
    res.json(book);
  } else {
    res.status(404);
    throw new Error('Book not found');
  }
});

// @desc    Create a book (Admin only)
// @route   POST /api/books
// @access  Private/Admin
const createBook = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    author,
    publisher,
    category,
    isbn,
    price,
    discountPrice,
    coverImage,
    images,
    pages,
    language,
    publicationYear,
    stock,
    featured,
    bestSeller,
  } = req.body;

  const existingIsbn = await Book.findOne({ isbn });
  if (existingIsbn) {
    res.status(400);
    throw new Error('Book with this ISBN already exists');
  }

  const slug = slugify(title) + '-' + Date.now();

  const book = new Book({
    title,
    slug,
    description,
    author,
    publisher,
    category,
    isbn,
    price,
    discountPrice: discountPrice || 0,
    coverImage,
    images: images || [coverImage],
    pages: pages || 200,
    language: language || 'English',
    publicationYear: publicationYear || 2024,
    stock: stock !== undefined ? stock : 10,
    featured: featured || false,
    bestSeller: bestSeller || false,
  });

  const createdBook = await book.save();
  res.status(201).json(createdBook);
});

// @desc    Update a book (Admin only)
// @route   PUT /api/books/:id
// @access  Private/Admin
const updateBook = asyncHandler(async (req, res) => {
  const book = await Book.findById(req.params.id);

  if (book) {
    book.title = req.body.title || book.title;
    if (req.body.title && req.body.title !== book.title) {
      book.slug = slugify(req.body.title) + '-' + Date.now();
    }
    book.description = req.body.description || book.description;
    book.author = req.body.author || book.author;
    book.publisher = req.body.publisher || book.publisher;
    book.category = req.body.category || book.category;
    book.isbn = req.body.isbn || book.isbn;
    book.price = req.body.price !== undefined ? req.body.price : book.price;
    book.discountPrice = req.body.discountPrice !== undefined ? req.body.discountPrice : book.discountPrice;
    book.coverImage = req.body.coverImage || book.coverImage;
    if (req.body.images) book.images = req.body.images;
    book.pages = req.body.pages || book.pages;
    book.language = req.body.language || book.language;
    book.publicationYear = req.body.publicationYear || book.publicationYear;
    book.stock = req.body.stock !== undefined ? req.body.stock : book.stock;
    book.featured = req.body.featured !== undefined ? req.body.featured : book.featured;
    book.bestSeller = req.body.bestSeller !== undefined ? req.body.bestSeller : book.bestSeller;

    const updatedBook = await book.save();
    res.json(updatedBook);
  } else {
    res.status(404);
    throw new Error('Book not found');
  }
});

// @desc    Delete a book (Admin only)
// @route   DELETE /api/books/:id
// @access  Private/Admin
const deleteBook = asyncHandler(async (req, res) => {
  const book = await Book.findById(req.params.id);
  if (book) {
    await book.deleteOne();
    res.json({ message: 'Book removed successfully' });
  } else {
    res.status(404);
    throw new Error('Book not found');
  }
});

module.exports = {
  getBooks,
  getBookByIdOrSlug,
  createBook,
  updateBook,
  deleteBook,
};
