const express = require('express');
const router = express.Router();
const { verifyToken, requireAdmin } = require('../middleware/auth');
const legacyController = require('../controllers/legacyController');

// public
router.post('/members/check', legacyController.checkLegacyMemberExists);
router.post('/members/register', legacyController.registerLegacyMemberPublic);

// admin
router.get('/admin/members/all',    verifyToken, requireAdmin, legacyController.getAllLegacyMembers);
router.get('/admin/members/lookup', verifyToken, requireAdmin, legacyController.lookupLegacyMemberAdmin);
router.patch('/admin/members/:identifier/note', verifyToken, requireAdmin, legacyController.updateLegacyMemberNote);
router.delete('/admin/members/:identifier',     verifyToken, requireAdmin, legacyController.deleteLegacyMember);
router.patch('/admin/members/:identifier/mem-id',
  verifyToken, requireAdmin, legacyController.updateLegacyMemberMemId);

module.exports = router;