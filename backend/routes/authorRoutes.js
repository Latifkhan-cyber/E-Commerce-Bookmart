const express = require('express');
const router = express.Router();
const {
  getAuthors,
  getAuthorByIdOrSlug,
  createAuthor,
  updateAuthor,
  deleteAuthor,
} = require('../controllers/authorController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
  .get(getAuthors)
  .post(protect, admin, createAuthor);

router.route('/:idOrSlug')
  .get(getAuthorByIdOrSlug);

router.route('/:id')
  .put(protect, admin, updateAuthor)
  .delete(protect, admin, deleteAuthor);

module.exports = router;
