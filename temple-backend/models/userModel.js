const pool = require('../config/db');

const getAllUsers = async () => {
  const result = await pool.query('SELECT * FROM users');
  return result.rows;
};

const getUsersByActivity = async (activityId) => {
  const result = await pool.query(`
    SELECT u.* FROM users u
    JOIN registrations r ON u.id = r.user_id
    WHERE r.activity_id = $1
  `, [activityId]);
  return result.rows;
};

module.exports = {
  getAllUsers,
  getUsersByActivity
};
