
// controllers/authController.js
// Handles Register, Login, Logout, and "get my profile".
// Passwords hashed with bcrypt, sessions handled with JWT.


const bcrypt = require('bcryptjs');
const userModel = require('../models/userModel');
const generateToken = require('../utils/generateToken');
const pool = require('../config/db');

// @route  POST /api/auth/register
// @access Public
const register = async (req, res) => {
  const { full_name, email, password, role_name } = req.body;

  if (!full_name || !email || !password) {
    return res.status(400).json({ success: false, message: 'full_name, email and password are required' });
  }

  const existing = await userModel.findByEmail(email);
  if (existing) {
    return res.status(409).json({ success: false, message: 'Email already registered' });
  }

  // Default new registrations to "Receptionist" unless explicitly Admin is requested
  const roleName = role_name === 'Admin' ? 'Admin' : 'Receptionist';
  const role_id = await userModel.getRoleIdByName(roleName);

  const password_hash = await bcrypt.hash(password, 10);
  const newUser = await userModel.createUser({ full_name, email, password_hash, role_id });

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: newUser
  });
};

// @route  POST /api/auth/login
// @access Public
const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'email and password are required' });
  }

  const user = await userModel.findByEmail(email);
  if (!user || !user.is_active) {
    return res.status(401).json({ success: false, message: 'Invalid email or password' });
  }

  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) {
    return res.status(401).json({ success: false, message: 'Invalid email or password' });
  }

  const token = generateToken(user);

  await pool.query(
    `INSERT INTO activitylogs (user_id, action, entity_name, entity_id) VALUES ($1, $2, $3, $4)`,
    [user.user_id, 'User logged in', 'users', user.user_id]
  );

  res.status(200).json({
    success: true,
    message: 'Login successful',
    token,
    user: {
      user_id: user.user_id,
      full_name: user.full_name,
      email: user.email,
      role_name: user.role_name
    }
  });
};

const logout = async (req, res) => {
  if (req.user) {
    await pool.query(
      `INSERT INTO activitylogs (user_id, action, entity_name, entity_id) VALUES ($1, $2, $3, $4)`,
      [req.user.user_id, 'User logged out', 'users', req.user.user_id]
    );
  }
  res.status(200).json({ success: true, message: 'Logged out successfully. Please delete the token on client side.' });
};

// @route  GET /api/auth/profile
// @access Private
const getProfile = async (req, res) => {
  const user = await userModel.findById(req.user.user_id);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }
  res.status(200).json({ success: true, data: user });
};

module.exports = { register, login, logout, getProfile };
