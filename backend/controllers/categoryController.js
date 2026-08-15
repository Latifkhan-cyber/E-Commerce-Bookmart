const asyncHandler = require('express-async-handler');
const Category = require('../models/Category');
const Book = require('../models/Book');

const slugify = (text) => text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '');

// @desc    Get all categories with book counts
// @route   GET /api/categories
// @access  Public
const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find({}).sort({ name: 1 });
  
  // Aggregate book counts per category
  const categoriesWithCounts = await Promise.all(
    categories.map(async (cat) => {
      const bookCount = await Book.countDocuments({ category: cat._id });
      return {
        ...cat.toObject(),
        bookCount,
      };
    })
  );

  res.json(categoriesWithCounts);
});

// @desc    Get single category by slug or ID
// @route   GET /api/categories/:idOrSlug
// @access  Public
const getCategoryByIdOrSlug = asyncHandler(async (req, res) => {
  const param = req.params.idOrSlug;
  const query = param.match(/^[0-9a-fA-F]{24}$/) ? { _id: param } : { slug: param };

  const category = await Category.findOne(query);
  if (category) {
    const books = await Book.find({ category: category._id })
      .populate('author', 'name slug')
      .populate('publisher', 'name slug');
    res.json({ category, books });
  } else {
    res.status(404);
    throw new Error('Category not found');
  }
});

// @desc    Create Category
// @route   POST /api/categories
// @access  Private/Admin
const createCategory = asyncHandler(async (req, res) => {
  const { name, description, image } = req.body;

  const existing = await Category.findOne({ name });
  if (existing) {
    res.status(400);
    throw new Error('Category already exists');
  }

  const slug = slugify(name);
  const category = new Category({
    name,
    slug,
    description: description || '',
    image: image || 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=500&q=80',
  });

  const created = await category.save();
  res.status(201).json(created);
});

// @desc    Update Category
// @route   PUT /api/categories/:id
// @access  Private/Admin
const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (category) {
    category.name = req.body.name || category.name;
    if (req.body.name) category.slug = slugify(req.body.name);
    category.description = req.body.description !== undefined ? req.body.description : category.description;
    if (req.body.image) category.image = req.body.image;

    const updated = await category.save();
    res.json(updated);
  } else {
    res.status(404);
    throw new Error('Category not found');
  }
});

// @desc    Delete Category
// @route   DELETE /api/categories/:id
// @access  Private/Admin
const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (category) {
    await category.deleteOne();
    res.json({ message: 'Category removed' });
  } else {
    res.status(404);
    throw new Error('Category not found');
  }
});

module.exports = {
  getCategories,
  getCategoryByIdOrSlug,
  createCategory,
  updateCategory,
  deleteCategory,
};
