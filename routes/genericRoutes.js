
// routes/genericRoutes.js
// Builds a full Express router (GET all, GET one, POST, PUT, DELETE)
// for a given table config. Used to quickly wire up every module
// (Guests, Rooms, Bookings, Payments, etc.) without repeating code.

const express = require('express');
const asyncHandler = require('../utils/asyncHandler');
const createControllerFor = require('../controllers/genericController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

function buildRouter(config, options = {}) {
  const router = express.Router();
  const controller = createControllerFor(config);

  const writeGuard = options.adminOnlyWrite
    ? [protect, authorizeRoles('Admin')]
    : [protect];

  const createGuard = options.publicCreate ? [] : writeGuard;

  router.get('/', protect, asyncHandler(controller.getAll));
  router.get('/:id', protect, asyncHandler(controller.getOne));
  router.post('/', ...createGuard, asyncHandler(controller.create));
  router.put('/:id', ...writeGuard, asyncHandler(controller.update));
  router.delete('/:id', ...writeGuard, asyncHandler(controller.remove));

  return router;
}
module.exports = buildRouter;
