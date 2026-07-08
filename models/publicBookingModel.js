

const pool = require('../config/db');

async function getRoomTypes() {
  const result = await pool.query('SELECT * FROM roomtypes ORDER BY base_price ASC');
  return result.rows;
}

async function findAvailableRoom(room_type_id, check_in_date, check_out_date) {
  const query = `
    SELECT r.*
    FROM rooms r
    WHERE r.room_type_id = $1
      AND r.status != 'Maintenance'
      AND r.room_id NOT IN (
        SELECT b.room_id FROM bookings b
        WHERE b.booking_status != 'Cancelled'
          AND b.check_in_date < $3
          AND b.check_out_date > $2
      )
    ORDER BY r.room_id ASC
    LIMIT 1
  `;
  const result = await pool.query(query, [room_type_id, check_in_date, check_out_date]);
  return result.rows[0];
}

// Count how many rooms of a type are free for given dates (used to show availability)
async function countAvailableRooms(room_type_id, check_in_date, check_out_date) {
  const query = `
    SELECT COUNT(*)::int AS available_count
    FROM rooms r
    WHERE r.room_type_id = $1
      AND r.status != 'Maintenance'
      AND r.room_id NOT IN (
        SELECT b.room_id FROM bookings b
        WHERE b.booking_status != 'Cancelled'
          AND b.check_in_date < $3
          AND b.check_out_date > $2
      )
  `;
  const result = await pool.query(query, [room_type_id, check_in_date, check_out_date]);
  return result.rows[0].available_count;
}

async function findOrCreateGuest({ full_name, email, phone, cnic_passport, city, country }) {
  const existing = await pool.query('SELECT * FROM guests WHERE email = $1', [email]);
  if (existing.rows[0]) return existing.rows[0];

  const result = await pool.query(
    `INSERT INTO guests (full_name, email, phone, cnic_passport, city, country)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [full_name, email, phone, cnic_passport, city || null, country || 'Pakistan']
  );
  return result.rows[0];
}

async function createBooking({ guest_id, room_id, check_in_date, check_out_date, total_amount }) {
  const result = await pool.query(
    `INSERT INTO bookings (guest_id, room_id, check_in_date, check_out_date, total_amount, booking_status)
     VALUES ($1, $2, $3, $4, $5, 'PendingConfirmation') RETURNING *`,
    [guest_id, room_id, check_in_date, check_out_date, total_amount]
  );
  return result.rows[0];
}

module.exports = { getRoomTypes, findAvailableRoom, countAvailableRooms, findOrCreateGuest, createBooking };
