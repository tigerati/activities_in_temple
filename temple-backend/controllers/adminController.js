// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const result = await pool.query('SELECT id, first_name, last_name, email, phone, address, id_number, birthdate, created_at FROM users');
    res.json(result.rows);
  } catch (error) {
    console.error('Get All Users Error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get users by activity ID
exports.getUsersByActivity = async (req, res) => {
  const activityId = req.params.id;

  try {
    const result = await pool.query(
      `SELECT u.id, u.first_name, u.last_name, u.email, u.phone, u.address, u.id_number, u.birthdate
       FROM users u
       JOIN user_activities ua ON u.id = ua.user_id
       WHERE ua.activity_id = $1`,
      [activityId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get Users by Activity Error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};