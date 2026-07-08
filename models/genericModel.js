// =====================================================================
// models/genericModel.js
// Reusable data-access functions (the "M" in MVC) that work for any
// table described in models/tableConfig.js.
// Handles: getAll (search + filter + pagination), getById, create,
// update, remove.
// =====================================================================

const pool = require('../config/db');

// Build "WHERE ..." clause + values array for search & filters
function buildWhereClause(config, { search, filters }) {
  const conditions = [];
  const values = [];
  let i = 1;

  if (search && config.searchable.length > 0) {
    const searchConditions = config.searchable.map((col) => `${col}::text ILIKE $${i}`);
    conditions.push(`(${searchConditions.join(' OR ')})`);
    values.push(`%${search}%`);
    i++;
  }

  if (filters) {
    for (const key of Object.keys(filters)) {
      if (config.filterable.includes(key) && filters[key] !== undefined && filters[key] !== '') {
        conditions.push(`${key} = $${i}`);
        values.push(filters[key]);
        i++;
      }
    }
  }

  const whereSQL = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  return { whereSQL, values, nextIndex: i };
}

async function getAll(config, { search, filters, page = 1, limit = 10 } = {}) {
  const { whereSQL, values, nextIndex } = buildWhereClause(config, { search, filters });

  const offset = (page - 1) * limit;

  const dataQuery = `
    SELECT * FROM ${config.table}
    ${whereSQL}
    ORDER BY ${config.pk} DESC
    LIMIT $${nextIndex} OFFSET $${nextIndex + 1}
  `;
  const countQuery = `SELECT COUNT(*)::int AS total FROM ${config.table} ${whereSQL}`;

  const dataValues = [...values, limit, offset];

  const [dataResult, countResult] = await Promise.all([
    pool.query(dataQuery, dataValues),
    pool.query(countQuery, values)
  ]);

  return {
    rows: dataResult.rows,
    total: countResult.rows[0].total,
    page: Number(page),
    limit: Number(limit),
    totalPages: Math.ceil(countResult.rows[0].total / limit)
  };
}

async function getById(config, id) {
  const query = `SELECT * FROM ${config.table} WHERE ${config.pk} = $1`;
  const result = await pool.query(query, [id]);
  return result.rows[0];
}

async function create(config, data) {
  const columns = config.columns.filter((col) => data[col] !== undefined);
  const values = columns.map((col) => data[col]);
  const placeholders = columns.map((_, idx) => `$${idx + 1}`);

  const query = `
    INSERT INTO ${config.table} (${columns.join(', ')})
    VALUES (${placeholders.join(', ')})
    RETURNING *
  `;
  const result = await pool.query(query, values);
  return result.rows[0];
}

async function update(config, id, data) {
  const columns = config.columns.filter((col) => data[col] !== undefined);
  if (columns.length === 0) return getById(config, id);

  const setClause = columns.map((col, idx) => `${col} = $${idx + 1}`).join(', ');
  const values = columns.map((col) => data[col]);

  const query = `
    UPDATE ${config.table}
    SET ${setClause}
    WHERE ${config.pk} = $${columns.length + 1}
    RETURNING *
  `;
  const result = await pool.query(query, [...values, id]);
  return result.rows[0];
}

async function remove(config, id) {
  const query = `DELETE FROM ${config.table} WHERE ${config.pk} = $1 RETURNING *`;
  const result = await pool.query(query, [id]);
  return result.rows[0];
}

module.exports = { getAll, getById, create, update, remove };
