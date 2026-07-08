// =====================================================================
// routes/index.js
// Mounts every route module onto the main Express app.
// =====================================================================

const express = require('express');
const router = express.Router();

const buildRouter = require('./genericRoutes');
const tableConfig = require('../models/tableConfig');

const authRoutes = require('./authRoutes');
const dashboardRoutes = require('./dashboardRoutes');
const uploadRoutes = require('./uploadRoutes');
const publicBookingRoutes = require('./publicBookingRoutes');

// Auth & Dashboard & Upload (custom logic)
router.use('/auth', authRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/upload', uploadRoutes);
router.use('/public', publicBookingRoutes);

// Generic CRUD modules (built automatically from tableConfig.js)
router.use('/roles', buildRouter(tableConfig.roles, { adminOnlyWrite: true }));
router.use('/departments', buildRouter(tableConfig.departments, { adminOnlyWrite: true }));
router.use('/employees', buildRouter(tableConfig.employees, { adminOnlyWrite: true }));
router.use('/guests', buildRouter(tableConfig.guests));
router.use('/room-types', buildRouter(tableConfig.roomtypes, { adminOnlyWrite: true }));
router.use('/rooms', buildRouter(tableConfig.rooms));
router.use('/bookings', buildRouter(tableConfig.bookings));
router.use('/payments', buildRouter(tableConfig.payments));
router.use('/invoices', buildRouter(tableConfig.invoices));
router.use('/services', buildRouter(tableConfig.services, { adminOnlyWrite: true }));
router.use('/service-bookings', buildRouter(tableConfig.servicebookings));
router.use('/housekeeping', buildRouter(tableConfig.housekeeping));
router.use('/reviews', buildRouter(tableConfig.reviews));
router.use('/contact-messages', buildRouter(tableConfig.contactmessages, { adminOnlyWrite: true, publicCreate: true }));
router.use('/activity-logs', buildRouter(tableConfig.activitylogs, { adminOnlyWrite: true }));

module.exports = router;
