const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

// Create new user (registration)
exports.createUser = async (req, res) => {
  const { first_name, last_name, email, phone, address, password, id_number, birthdate } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      'INSERT INTO users (first_name, last_name, email, phone, address, password, id_number, birthdate) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
      [first_name, last_name, email, phone, address, hashedPassword, id_number, birthdate]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create User Error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    let { email, password } = req.body || {};
    email = (email || "").trim().toLowerCase();
    password = password || "";

    // 1) find user
    const { rows } = await pool.query(
      "SELECT id, email, role, password FROM users WHERE LOWER(email) = $1",
      [email]
    );
    const user = rows[0];

    // 2) handle not found
    if (!user || !user.password) {
      return res.status(401).json({ message: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" });
    }

    // 3) compare password
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return res.status(401).json({ message: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" });
    }

    // 4) sign token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    return res.json({ message: "เข้าสู่ระบบสำเร็จ", token });
  } catch (err) {
    console.error("login error:", err);
    return res.status(500).json({ message: "เกิดข้อผิดพลาดในระบบ" });
  }
};


// controllers/userController.js
exports.getMyProfile = async (req, res) => {
  try {
    const userId = req.user.id; // set by verifyToken
    const q = `
      SELECT
        first_name,
        last_name,
        email,
        phone,
        address,
        id_number,
        birthdate,
        created_at,
        profile_image_url  -- optional, if you added this column
      FROM users
      WHERE id = $1
    `;
    const { rows } = await pool.query(q, [userId]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    // ✅ shape your normalizeUser() expects
    return res.json({ user: rows[0] });
  } catch (error) {
    console.error('getMyProfile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


exports.getRegisteredActivities = async (req, res) => {
  const userId = req.user.id;

  try {
    const result = await pool.query(
      `SELECT a.title
       FROM user_activities ua
       JOIN activities a ON ua.activity_id = a.id
       WHERE ua.user_id = $1`,
      [userId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching registered activities:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const result = await pool.query('SELECT id, first_name, last_name, email, phone, address, id_number, birthdate, created_at FROM users');
    res.json(result.rows);
  } catch (error) {
    console.error('Get All Users Error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const u = await pool.query('SELECT id FROM users WHERE email=$1', [email]);
    if (u.rowCount === 0) {
      // Not found
      return res.status(200).json({
        exists: false,
        message: 'ไม่พบอีเมลนี้ในระบบ'
      });
    }

    const userId = u.rows[0].id;
    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await pool.query(
      `INSERT INTO password_reset_tokens(user_id, token, expires_at) VALUES ($1,$2,$3)`,
      [userId, token, expires]
    );

    const resetUrl = `http://localhost:3000/reset?token=${token}`;
    // TODO: send resetUrl via email. For dev:
    return res.status(200).json({
      exists: true,
      message: 'Reset link generated',
      resetUrl
    });
  } catch (e) {
    console.error('forgotPassword:', e.message);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;
  try {
    const r = await pool.query(
      `SELECT prt.id, prt.user_id, prt.expires_at, prt.used
       FROM password_reset_tokens prt WHERE token=$1`,
      [token]
    );
    if (r.rowCount === 0) return res.status(400).json({ message: 'Invalid token' });
    const row = r.rows[0];
    if (row.used) return res.status(400).json({ message: 'Token already used' });
    if (new Date(row.expires_at) < new Date()) return res.status(400).json({ message: 'Token expired' });

    const hash = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE users SET password=$1 WHERE id=$2', [hash, row.user_id]);

    await pool.query('UPDATE password_reset_tokens SET used=true WHERE id=$1', [row.id]);

    res.json({ message: 'Password updated successfully' });
  } catch (e) {
    console.error('resetPassword:', e.message);
    res.status(500).json({ message: 'Server error' });
  }
};