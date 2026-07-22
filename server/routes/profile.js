const express = require('express');
const router = express.Router();
const { updateProfile, changePassword, deleteAccount, getStats } = require('../controllers/profileController');
const auth = require('../middleware/auth');

router.use(auth);
router.put('/update', updateProfile);
router.put('/password', changePassword);
router.delete('/account', deleteAccount);
router.get('/stats', getStats);

module.exports = router;
