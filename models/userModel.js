// =====================================================================
// models/userModel.js
// Data-access functions specific to Users + Roles (authentication).
// =====================================================================

const pool = require('../config/db');

async function findByEmail(email) {
  const query = `
    SELECT u.user_id, u.full_name, u.email, u.password_hash, u.is_active, r.role_id, r.role_name
    FROM users u
    JOIN roles r ON u.role_id = r.role_id
    WHERE u.email = $1
  `;
  const result = await pool.query(query, [email]);
  return result.rows[0];
}

async function findById(id) {
  const query = `
    SELECT u.user_id, u.full_name, u.email, u.is_active, u.created_at, r.role_id, r.role_name
    FROM users u
    JOIN roles r ON u.role_id = r.role_id
    WHERE u.user_id = $1
  `;
  const result = await pool.query(query, [id]);
  return result.rows[0];
}

async function createUser({ full_name, email, password_hash, role_id }) {
  const query = `
    INSERT INTO users (full_name, email, password_hash, role_id)
    VALUES ($1, $2, $3, $4)
    RETURNING user_id, full_name, email, role_id, created_at
  `;
  const result = await pool.query(query, [full_name, email, password_hash, role_id]);
  return result.rows[0];
}

async function getRoleIdByName(role_name) {
  const result = await pool.query('SELECT role_id FROM roles WHERE role_name = $1', [role_name]);
  return result.rows[0]?.role_id;
}

module.exports = { findByEmail, findById, createUser, getRoleIdByName };
