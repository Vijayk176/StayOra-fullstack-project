// =====================================================================
// middleware/errorMiddleware.js
// Central place to catch errors and send clean JSON responses.
// =====================================================================

// 404 handler - runs when no route matches
function notFound(req, res, next) {
  if (req.originalUrl.startsWith('/api')) {
    return res.status(404).json({ success: false, message: `Route not found: ${req.originalUrl}` });
  }
  // For any other (frontend) route, serve the 404 page
  res.status(404).sendFile(require('path').join(__dirname, '..', 'public', '404.html'));
}

// General error handler - catches errors thrown anywhere (via next(err))
function errorHandler(err, req, res, next) {
  console.error('🔥 Error:', err.message);

  // PostgreSQL unique_violation
  if (err.code === '23505') {
    return res.status(409).json({ success: false, message: 'Duplicate value: record already exists' });
  }
  // PostgreSQL foreign_key_violation
  if (err.code === '23503') {
    return res.status(400).json({ success: false, message: 'Invalid reference: related record does not exist' });
  }
  // PostgreSQL check_violation
  if (err.code === '23514') {
    return res.status(400).json({ success: false, message: 'Invalid value: check constraint failed' });
  }

  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
}

module.exports = { notFound, errorHandler };
