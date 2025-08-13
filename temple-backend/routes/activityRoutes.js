const express = require('express');
const router = express.Router();
const activityController = require('../controllers/activityController');

router.get('/', activityController.listActivities);
router.get('/:id', activityController.getActivity);
router.post('/register', activityController.registerUserToActivity);

// (optional) add registrant endpoints you referenced on the frontend
router.get('/:id/registrants', activityController.registrants);
router.get('/:id/registrants.csv', activityController.exportRegistrantsCSV);

// If you want the upload route, make sure these are defined and imported
const { verifyToken, requireAdmin } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (_req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

router.post('/upload', verifyToken, requireAdmin, upload.single('image'), (req, res) => {
  res.json({ url: `/uploads/${req.file.filename}` });
});

module.exports = router;
