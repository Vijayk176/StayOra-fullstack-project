// =====================================================================
// routes/publicBookingRoutes.js
// Public routes for the customer-facing "Book Now" page. No JWT
// required - anyone visiting the website can use these.
// =====================================================================

const express = require('express');
const router = express.Router();
const asyncHandler = require('../utils/asyncHandler');
const { getRoomTypes, checkAvailability, createPublicBooking } = require('../controllers/publicBookingController');

router.get('/room-types', asyncHandler(getRoomTypes));
router.get('/availability', asyncHandler(checkAvailability));
router.post('/book', asyncHandler(createPublicBooking));

module.exports = router;
