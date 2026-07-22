const express = require('express');
const router = express.Router();
const { getDashboardStats, getRecruiterView } = require('../controllers/dashboardController');
const auth = require('../middleware/auth');

router.use(auth);
router.get('/stats', getDashboardStats);
router.get('/recruiter-view', getRecruiterView);

module.exports = router;
