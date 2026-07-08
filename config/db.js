// =====================================================================
// config/db.js
// Sets up connection to NEON PostgreSQL cloud database using "pg" pool.
// IMPORTANT: Only DATABASE_URL from .env is used (Neon cloud only).
// =====================================================================

const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false } // required for Neon cloud connections
});

// Quick test on startup so students can see if the DB connected
pool.connect()
  .then((client) => {
    console.log('✅ Connected to Neon PostgreSQL database successfully');
    client.release();
  })
  .catch((err) => {
    console.error('❌ Database connection error:', err.message);
  });

module.exports = pool;
