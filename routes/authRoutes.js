
// routes/authRoutes.js

const express = require('express');
const router = express.Router();
const asyncHandler = require('../utils/asyncHandler');
const { register, login, logout, getProfile } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', asyncHandler(register));
router.post('/login', asyncHandler(login));
router.post('/logout', protect, asyncHandler(logout));
router.get('/profile', protect, asyncHandler(getProfile));

module.exports = router;
