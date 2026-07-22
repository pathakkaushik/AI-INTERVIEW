const express = require('express');
const router = express.Router();
const { sendVerification, verifyEmail, forgotPassword, resetPassword } = require('../controllers/verifyController');
const auth = require('../middleware/auth');

router.post('/send', auth, sendVerification);
router.get('/confirm/:token', verifyEmail);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

module.exports = router;
