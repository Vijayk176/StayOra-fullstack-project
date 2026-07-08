
// routes/dashboardRoutes.js


const express = require('express');
const router = express.Router();
const asyncHandler = require('../utils/asyncHandler');
const { protect } = require('../middleware/authMiddleware');
const {
  getSummary,
  getMonthlyBookings,
  getMonthlyRevenue,
  getRoomsStatus,
  getServicesStats,
  getRecentBookings
} = require('../controllers/dashboardController');

router.get('/summary', protect, asyncHandler(getSummary));
router.get('/bookings', protect, asyncHandler(getMonthlyBookings));
router.get('/revenue', protect, asyncHandler(getMonthlyRevenue));
router.get('/rooms-status', protect, asyncHandler(getRoomsStatus));
router.get('/services-stats', protect, asyncHandler(getServicesStats));
router.get('/recent-bookings', protect, asyncHandler(getRecentBookings));

module.exports = router;
