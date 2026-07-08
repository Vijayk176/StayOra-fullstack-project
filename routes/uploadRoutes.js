// =====================================================================
// routes/uploadRoutes.js
// Simple endpoint to upload a room image using Multer.
// Returns the file path which can then be saved into rooms.image_url
// via PUT /api/rooms/:id
// =====================================================================

const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }
  res.status(201).json({
    success: true,
    message: 'File uploaded successfully',
    file_path: `/uploads/${req.file.filename}`
  });
});

module.exports = router;
