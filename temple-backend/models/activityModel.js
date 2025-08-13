const pool = require('../config/db');

exports.getAllActivities = async () => {
  const result = await pool.query('SELECT * FROM activities');
  return result.rows;
};
