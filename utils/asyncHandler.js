// =====================================================================
// utils/asyncHandler.js
// Wraps async route handlers so we don't need try/catch in every function.
// Any error is automatically forwarded to errorMiddleware.js
// =====================================================================

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
