const express = require('express');
const router = express.Router();
const { getPlatformStats, getUsers, getUser, updateUserRole, deleteUser, getAllInterviews, deleteAnyInterview } = require('../controllers/adminController');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

router.use(auth, admin);
router.get('/stats', getPlatformStats);
router.get('/users', getUsers);
router.get('/users/:id', getUser);
router.put('/users/:id/role', updateUserRole);
router.delete('/users/:id', deleteUser);
router.get('/interviews', getAllInterviews);
router.delete('/interviews/:id', deleteAnyInterview);

module.exports = router;
