const express = require('express');
const router = express.Router();
const {
  getPublishers,
  getPublisherByIdOrSlug,
  createPublisher,
  updatePublisher,
  deletePublisher,
} = require('../controllers/publisherController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
  .get(getPublishers)
  .post(protect, admin, createPublisher);

router.route('/:idOrSlug')
  .get(getPublisherByIdOrSlug);

router.route('/:id')
  .put(protect, admin, updatePublisher)
  .delete(protect, admin, deletePublisher);

module.exports = router;
