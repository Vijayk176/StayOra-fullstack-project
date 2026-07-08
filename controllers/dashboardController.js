// =====================================================================
// controllers/dashboardController.js
// All analytics queries that power the admin dashboard charts.
// Demonstrates INNER JOIN, LEFT JOIN, COUNT, SUM, GROUP BY, ORDER BY.
// =====================================================================

const pool = require('../config/db');

const getSummary = async (req, res) => {
  const totalBookingsQ = pool.query('SELECT COUNT(*)::int AS total_bookings FROM bookings ');
  const totalRevenueQ = pool.query(`SELECT COALESCE(SUM(amount_paid), 0)::numeric AS total_revenue FROM payments WHERE payment_status = 'Paid'`);
  const totalGuestsQ = pool.query('SELECT COUNT(*)::int AS total_guests FROM guests');
  const availableRoomsQ = pool.query(`SELECT COUNT(*)::int AS available_rooms FROM rooms WHERE status = 'Available'`);
  const occupiedRoomsQ = pool.query(`SELECT COUNT(*)::int AS occupied_rooms FROM rooms WHERE status = 'Occupied'`);

  const [bookings, revenue, guests, available, occupied] = await Promise.all([
    totalBookingsQ, totalRevenueQ, totalGuestsQ, availableRoomsQ, occupiedRoomsQ
  ]);

  res.status(200).json({
    success: true,
    data: {
      total_bookings: bookings.rows[0].total_bookings,
      total_revenue: revenue.rows[0].total_revenue,
      total_guests: guests.rows[0].total_guests,
      available_rooms: available.rows[0].available_rooms,
      occupied_rooms: occupied.rows[0].occupied_rooms
    }
  });
};

// @route  GET /api/dashboard/bookings

const getMonthlyBookings = async (req, res) => {
  const query = `
    SELECT TO_CHAR(check_in_date, 'Mon YYYY') AS month,
           DATE_TRUNC('month', check_in_date) AS month_sort,
           COUNT(*)::int AS total_bookings
    FROM bookings
    GROUP BY month, month_sort
    ORDER BY month_sort ASC
  `;
  const result = await pool.query(query);
  res.status(200).json({ success: true, data: result.rows });
};

// @route  GET /api/dashboard/revenue
// Line chart: monthly revenue trend
const getMonthlyRevenue = async (req, res) => {
  const query = `
    SELECT TO_CHAR(payment_date, 'Mon YYYY') AS month,
           DATE_TRUNC('month', payment_date) AS month_sort,
           SUM(amount_paid)::numeric AS total_revenue
    FROM payments
    WHERE payment_status = 'Paid'
    GROUP BY month, month_sort
    ORDER BY month_sort ASC
  `;
  const result = await pool.query(query);
  res.status(200).json({ success: true, data: result.rows });
};

// @route  GET /api/dashboard/rooms-status
// Pie chart: Available vs Occupied vs Maintenance
const getRoomsStatus = async (req, res) => {
  const query = `
    SELECT status, COUNT(*)::int AS total
    FROM rooms
    GROUP BY status
    ORDER BY status
  `;
  const result = await pool.query(query);
  res.status(200).json({ success: true, data: result.rows });
};

// @route  GET /api/dashboard/services-stats
// Bar chart: Top services used (by quantity booked)
const getServicesStats = async (req, res) => {
  const query = `
    SELECT s.service_name, SUM(sb.quantity)::int AS total_used, SUM(sb.total_price)::numeric AS total_revenue
    FROM servicebookings sb
    INNER JOIN services s ON sb.service_id = s.service_id
    GROUP BY s.service_name
    ORDER BY total_used DESC
  `;
  const result = await pool.query(query);
  res.status(200).json({ success: true, data: result.rows });
};

// @route  GET /api/dashboard/recent-bookings
// Recent bookings with guest + room details (INNER JOIN + LEFT JOIN demo)
const getRecentBookings = async (req, res) => {
  const query = `
    SELECT b.booking_id, g.full_name AS guest_name, r.room_number, rt.type_name,
           b.check_in_date, b.check_out_date, b.total_amount, b.booking_status,
           u.full_name AS booked_by
    FROM bookings b
    INNER JOIN guests g ON b.guest_id = g.guest_id
    INNER JOIN rooms r ON b.room_id = r.room_id
    INNER JOIN roomtypes rt ON r.room_type_id = rt.room_type_id
    LEFT JOIN users u ON b.user_id = u.user_id
    ORDER BY b.created_at DESC
    LIMIT 10
  `;
  const result = await pool.query(query);
  res.status(200).json({ success: true, data: result.rows });
};

module.exports = {
  getSummary,
  getMonthlyBookings,
  getMonthlyRevenue,
  getRoomsStatus,
  getServicesStats,
  getRecentBookings
};
