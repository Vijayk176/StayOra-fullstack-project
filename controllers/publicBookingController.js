// =====================================================================
// controllers/publicBookingController.js
// Handles the public "Book Now" page - no login required.
// A customer picks a room type + dates, enters their details, and a
// booking is created automatically (status: PendingConfirmation) for
// hotel staff to review and confirm from the admin dashboard.
// =====================================================================

const publicBookingModel = require('../models/publicBookingModel');
const pool = require('../config/db');

function nightsBetween(checkIn, checkOut) {
  const msPerDay = 1000 * 60 * 60 * 24;
  const diff = new Date(checkOut) - new Date(checkIn);
  return Math.round(diff / msPerDay);
}

// @route  GET /api/public/room-types
// @access Public
const getRoomTypes = async (req, res) => {
  const roomTypes = await publicBookingModel.getRoomTypes();
  res.status(200).json({ success: true, data: roomTypes });
};

// @route  GET /api/public/availability?room_type_id=&check_in_date=&check_out_date=
// @access Public
const checkAvailability = async (req, res) => {
  const { room_type_id, check_in_date, check_out_date } = req.query;

  if (!room_type_id || !check_in_date || !check_out_date) {
    return res.status(400).json({ success: false, message: 'room_type_id, check_in_date and check_out_date are required' });
  }
  if (new Date(check_out_date) <= new Date(check_in_date)) {
    return res.status(400).json({ success: false, message: 'check_out_date must be after check_in_date' });
  }

  const availableCount = await publicBookingModel.countAvailableRooms(room_type_id, check_in_date, check_out_date);

  res.status(200).json({
    success: true,
    data: {
      available: availableCount > 0,
      available_rooms: availableCount
    }
  });
};

// @route  POST /api/public/book
// @access Public
const createPublicBooking = async (req, res) => {
  const {
    full_name, email, phone, cnic_passport, city, country,
    room_type_id, check_in_date, check_out_date
  } = req.body;

  // ---- Basic validation ----
  if (!full_name || !email || !phone || !cnic_passport) {
    return res.status(400).json({ success: false, message: 'full_name, email, phone and cnic_passport are required' });
  }
  if (!room_type_id || !check_in_date || !check_out_date) {
    return res.status(400).json({ success: false, message: 'room_type_id, check_in_date and check_out_date are required' });
  }
  if (new Date(check_out_date) <= new Date(check_in_date)) {
    return res.status(400).json({ success: false, message: 'check_out_date must be after check_in_date' });
  }
  if (new Date(check_in_date) < new Date(new Date().toDateString())) {
    return res.status(400).json({ success: false, message: 'check_in_date cannot be in the past' });
  }

  // ---- Find a free room of the requested type ----
  const room = await publicBookingModel.findAvailableRoom(room_type_id, check_in_date, check_out_date);
  if (!room) {
    return res.status(409).json({ success: false, message: 'Sorry, no rooms of this type are available for the selected dates' });
  }

  // ---- Get the room type's price to calculate the total ----
  const roomTypeResult = await pool.query('SELECT * FROM roomtypes WHERE room_type_id = $1', [room_type_id]);
  const roomType = roomTypeResult.rows[0];
  if (!roomType) {
    return res.status(404).json({ success: false, message: 'Room type not found' });
  }

  const nights = nightsBetween(check_in_date, check_out_date);
  const total_amount = Number(roomType.base_price) * nights;

  // ---- Find or create the guest record ----
  const guest = await publicBookingModel.findOrCreateGuest({ full_name, email, phone, cnic_passport, city, country });

  // ---- Create the booking (status: PendingConfirmation) ----
  const booking = await publicBookingModel.createBooking({
    guest_id: guest.guest_id,
    room_id: room.room_id,
    check_in_date,
    check_out_date,
    total_amount
  });

  // ---- Log the activity (system-generated, no logged-in user) ----
  await pool.query(
    `INSERT INTO activitylogs (user_id, action, entity_name, entity_id) VALUES ($1, $2, $3, $4)`,
    [null, 'Public booking submitted by customer', 'bookings', booking.booking_id]
  );

  res.status(201).json({
    success: true,
    message: 'Booking request received! Our team will contact you shortly to confirm.',
    data: {
      booking_id: booking.booking_id,
      room_number: room.room_number,
      room_type: roomType.type_name,
      nights,
      total_amount,
      booking_status: booking.booking_status
    }
  });
};

module.exports = { getRoomTypes, checkAvailability, createPublicBooking };
