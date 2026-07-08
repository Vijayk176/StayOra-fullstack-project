// =====================================================================
// utils/generateToken.js
// Generates a signed JWT for a logged-in user.
// =====================================================================

const jwt = require('jsonwebtoken');
require('dotenv').config();

function generateToken(user) {
  return jwt.sign(
    {
      user_id: user.user_id,
      full_name: user.full_name,
      email: user.email,
      role_name: user.role_name
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
  );
}

module.exports = generateToken;
