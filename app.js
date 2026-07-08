// =====================================================================
// app.js
// Configures the Express application: middleware, static files, routes.
// =====================================================================

const express = require('express');
const cors = require('cors');
const path = require('path');

const apiRoutes = require('./routes');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

const app = express();

// ---- Global middleware ----
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ---- Serve uploaded images ----
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ---- Serve frontend (public folder) ----
app.use(express.static(path.join(__dirname, 'public')));

// ---- API routes ----
app.use('/api', apiRoutes);

// ---- Health check ----
app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, message: 'Stayora API is running 🚀' });
});

// ---- Fallback to index.html for frontend routing ----
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ---- Error handling (must be last) ----
app.use(notFound);
app.use(errorHandler);

module.exports = app;
