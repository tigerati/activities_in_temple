// load environment variables
require('dotenv').config();

// create express app
const express = require('express');
const cors = require('cors');
const app = express();
const pool = require('./config/db');

// allow frontend at port 3000 to access backend
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());

const legacyRoutes = require('./routes/legacyRoutes');
app.use('/legacy', legacyRoutes);

const userRoutes = require('./routes/userRoutes');
app.use('/users', userRoutes);

const activityRoutes = require('./routes/activityRoutes');
app.use('/activity', activityRoutes);

app.get("/activity", async (req, res) => {
  try {
    const result = await pool.query("SELECT id, title, description, image_url FROM activities ORDER BY id ASC");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const mediaRoutes = require('./routes/mediaRoutes');
app.use('/media', mediaRoutes);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
