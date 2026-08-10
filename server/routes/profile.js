const express = require('express');
const router = express.Router();
const { updateProfile, changePassword, deleteAccount, getStats, updateAvatar } = require('../controllers/profileController');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { avatarUpload } = require('../middleware/upload');
const auth = require('../middleware/auth');

router.use(auth);
router.put('/update', [
  body('name').optional().isLength({ min: 2, max: 50 }).withMessage('Name must be 2-50 characters'),
  body('email').optional().isEmail().withMessage('Invalid email format')
], validate, updateProfile);
router.put('/password', [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
], validate, changePassword);
router.put('/avatar', avatarUpload, updateAvatar);
router.delete('/account', deleteAccount);
router.get('/stats', getStats);

module.exports = router;
