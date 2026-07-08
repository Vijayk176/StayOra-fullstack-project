// =====================================================================
// middleware/authMiddleware.js
// Protects routes using JWT. Also provides role-based access control.
// =====================================================================

const jwt = require('jsonwebtoken');
require('dotenv').config();

// 1) Verify that a valid JWT token was sent in the "Authorization" header
//    Header format expected: Authorization: Bearer <token>
function protect(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // decoded = { user_id, role_name, iat, exp }
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Not authorized, token invalid or expired' });
  }
}

// 2) Restrict a route to specific roles, e.g. authorizeRoles('Admin')
function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role_name)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Requires role: ${allowedRoles.join(' or ')}`
      });
    }
    next();
  };
}

module.exports = { protect, authorizeRoles };
