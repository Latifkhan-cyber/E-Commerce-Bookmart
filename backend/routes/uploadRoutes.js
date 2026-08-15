const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');
const cloudinary = require('../config/cloudinary');
const fs = require('fs');

router.post('/', upload.single('image'), async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error('Please upload an image file');
  }

  // Check if Cloudinary is configured
  if (
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_CLOUD_NAME !== 'demo' &&
    process.env.CLOUDINARY_API_KEY
  ) {
    try {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'bookmart',
      });
      // Remove temp local file
      fs.unlinkSync(req.file.path);
      return res.json({ url: result.secure_url });
    } catch (err) {
      console.error('Cloudinary upload failed, using local file path:', err);
    }
  }

  // Fallback to local server path
  const localUrl = `/uploads/${req.file.filename}`;
  res.json({ url: localUrl });
});

module.exports = router;
