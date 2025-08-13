const pool = require('../config/db');

// exports.getAllActivities = async (req, res) => {
//   try {
//     const result = await pool.query('SELECT * FROM activities');
//     res.json(result.rows);
//   } catch (error) {
//     console.error('Error fetching activities:', error.message);
//     res.status(500).json({ message: 'Server error' });
//   }
// };

// exports.getActivityById = async (req, res) => {
//   const activityId = req.params.id;

//   try {
//     const result = await pool.query('SELECT id, title FROM activities WHERE id = $1', [activityId]);

//     if (result.rows.length === 0) {
//       return res.status(404).json({ message: 'Activity not found' });
//     }

//     res.json(result.rows[0]);
//   } catch (error) {
//     console.error('Error fetching activity by ID:', error.message);
//     res.status(500).json({ message: 'Server error' });
//   }
// };

exports.listActivities = async (req, res) => {
  const q = 'SELECT id, title, description, image_url FROM activities ORDER BY id DESC';
  const { rows } = await pool.query(q);
  res.json(rows);
};

exports.getActivity = async (req, res) => {
  const { rows } = await pool.query(
    'SELECT * FROM activities WHERE id = $1',
    [req.params.id]
  );
  if (!rows[0]) return res.status(404).json({ message: 'Not found' });
  res.json(rows[0]);
};

exports.registerUserToActivity = async (req, res) => {
  const { user_id, activity_id } = req.body;

  try {
    // Check if the user has already registered
    const check = await pool.query(
      'SELECT * FROM user_activities WHERE user_id = $1 AND activity_id = $2',
      [user_id, activity_id]
    );

    if (check.rows.length > 0) {
      return res.status(409).json({ message: 'ลงทะเบียนแล้ว' }); // Already registered
    }

    // Insert registration
    await pool.query(
      'INSERT INTO user_activities (user_id, activity_id) VALUES ($1, $2)',
      [user_id, activity_id]
    );

    res.status(201).json({ message: 'ลงทะเบียนสำเร็จ' });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.createActivity = async (req, res) => {
  const { title, description, image_url } = req.body;
  const { rows } = await pool.query(
    `INSERT INTO activities (title, description, image_url)
     VALUES ($1,$2,$3) RETURNING *`,
    [title, description, image_url]
  );
  res.status(201).json(rows[0]);
};

exports.updateActivity = async (req, res) => {
  const { title, description, image_url } = req.body;
  const { rows } = await pool.query(
    `UPDATE activities
     SET title=$1, description=$2, image_url=$3
     WHERE id=$4 RETURNING *`,
    [title, description, image_url, req.params.id]
  );
  if (!rows[0]) return res.status(404).json({ message: 'Not found' });
  res.json(rows[0]);
};

exports.deleteActivity = async (_req, res) => {
  await pool.query('DELETE FROM activities WHERE id = $1', [_req.params.id]);
  res.json({ message: 'Deleted' });
};

exports.registrants = async (req, res) => {
  const { rows } = await pool.query(
    `SELECT u.first_name, u.last_name, u.email, u.phone, ua.registered_at
     FROM user_activities ua
     JOIN users u ON ua.user_id = u.id
     WHERE ua.activity_id = $1
     ORDER BY ua.registered_at DESC`,
    [req.params.id]
  );
  res.json(rows);
};

exports.exportRegistrantsCSV = async (req, res) => {
  const { rows } = await pool.query(
    `SELECT u.first_name, u.last_name, u.email, u.phone, ua.registered_at
     FROM user_activities ua
     JOIN users u ON ua.user_id = u.id
     WHERE ua.activity_id = $1
     ORDER BY ua.registered_at DESC`,
    [req.params.id]
  );

  const header = 'full_name,email,phone,registered_at\n';
  const body = rows.map(r =>
    `"${(r.full_name||'').replaceAll('"','""')}",${r.email},${r.phone},${r.registered_at?.toISOString()||''}`
  ).join('\n');

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="registrants.csv"');
  res.send(header + body);
};
