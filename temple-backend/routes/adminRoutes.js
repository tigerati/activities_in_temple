const express = require('express');
const router = express.Router();
const { verifyToken, requireAdmin } = require('../middleware/auth');
const adminController = require('../controllers/adminController');

// GET all users
router.get('/users', verifyToken, requireAdmin, adminController.getAllUsers);

// View registrations for a specific activity
router.get('/activity/:id/registrations', verifyToken, requireAdmin, adminController.getRegistrationsForActivity);

// CRUD
router.get('/', verifyToken, requireAdmin, ctrl.listActivities);
router.get('/:id', verifyToken, requireAdmin, ctrl.getActivity);
router.post('/', verifyToken, requireAdmin, ctrl.createActivity);
router.put('/:id', verifyToken, requireAdmin, ctrl.updateActivity);
router.delete('/:id', verifyToken, requireAdmin, ctrl.deleteActivity);

// Registrants + CSV export
router.get('/:id/registrants', verifyToken, requireAdmin, ctrl.registrants);
router.get('/:id/registrants.csv', verifyToken, requireAdmin, ctrl.exportRegistrantsCSV);

// Image upload (optional) -> /activity/upload
// (see section 2)
module.exports = router;