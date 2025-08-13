const express = require('express');
const router = express.Router();
const { verifyToken, requireAdmin } = require('../middleware/auth');
const userController = require('../controllers/userController');

// User routes
router.post('/register', userController.createUser);
router.post('/login', userController.login);
router.post('/forgot', userController.forgotPassword);
router.post('/reset', userController.resetPassword);

// Admin routes
router.get('/admin-only-data', verifyToken, requireAdmin, userController.getAllUsers);
router.get('/me', verifyToken, userController.getMyProfile);
router.get('/registered-activities', verifyToken, userController.getRegisteredActivities);

module.exports = router;
