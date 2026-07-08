// =====================================================================
// controllers/genericController.js
// Factory function that creates a full set of controller functions
// (getAll, getOne, create, update, remove) for ANY module, based on
// the table config passed in. Used by routes/genericRoutes.js
// =====================================================================

const genericModel = require('../models/genericModel');
const pool = require('../config/db');

function createControllerFor(config) {
  return {
    // GET /api/<module>?search=&page=&limit=&<filterField>=value
    getAll: async (req, res) => {
      const { search, page = 1, limit = 10, ...rest } = req.query;
      const filters = {};
      config.filterable.forEach((field) => {
        if (rest[field] !== undefined) filters[field] = rest[field];
      });

      const result = await genericModel.getAll(config, {
        search,
        filters,
        page: Number(page),
        limit: Number(limit)
      });

      res.status(200).json({
        success: true,
        count: result.rows.length,
        total: result.total,
        page: result.page,
        totalPages: result.totalPages,
        data: result.rows
      });
    },

    // GET /api/<module>/:id
    getOne: async (req, res) => {
      const record = await genericModel.getById(config, req.params.id);
      if (!record) {
        return res.status(404).json({ success: false, message: `${config.table} record not found` });
      }
      res.status(200).json({ success: true, data: record });
    },

    // POST /api/<module>
    create: async (req, res) => {
      const record = await genericModel.create(config, req.body);

      // log activity if a logged-in user made the change
      if (req.user) {
        await pool.query(
          `INSERT INTO activitylogs (user_id, action, entity_name, entity_id) VALUES ($1, $2, $3, $4)`,
          [req.user.user_id, `Created record in ${config.table}`, config.table, record[config.pk]]
        );
      }

      res.status(201).json({ success: true, message: 'Created successfully', data: record });
    },

    // PUT /api/<module>/:id
    update: async (req, res) => {
      const existing = await genericModel.getById(config, req.params.id);
      if (!existing) {
        return res.status(404).json({ success: false, message: `${config.table} record not found` });
      }

      const updated = await genericModel.update(config, req.params.id, req.body);

      if (req.user) {
        await pool.query(
          `INSERT INTO activitylogs (user_id, action, entity_name, entity_id) VALUES ($1, $2, $3, $4)`,
          [req.user.user_id, `Updated record in ${config.table}`, config.table, req.params.id]
        );
      }

      res.status(200).json({ success: true, message: 'Updated successfully', data: updated });
    },

    // DELETE /api/<module>/:id
    remove: async (req, res) => {
      const existing = await genericModel.getById(config, req.params.id);
      if (!existing) {
        return res.status(404).json({ success: false, message: `${config.table} record not found` });
      }

      await genericModel.remove(config, req.params.id);

      if (req.user) {
        await pool.query(
          `INSERT INTO activitylogs (user_id, action, entity_name, entity_id) VALUES ($1, $2, $3, $4)`,
          [req.user.user_id, `Deleted record from ${config.table}`, config.table, req.params.id]
        );
      }

      res.status(200).json({ success: true, message: 'Deleted successfully' });
    }
  };
}

module.exports = createControllerFor;
