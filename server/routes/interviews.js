const express = require('express');
const router = express.Router();
const { getInterviews, createInterview, getInterview, endInterview, deleteInterview, deleteAllInterviews, generateCheatSheet } = require('../controllers/interviewController');
const auth = require('../middleware/auth');

router.use(auth);
router.get('/', getInterviews);
router.post('/', createInterview);
router.post('/cheat-sheet', generateCheatSheet);
router.get('/:id', getInterview);
router.put('/:id/end', endInterview);
router.delete('/:id', deleteInterview);
router.delete('/', deleteAllInterviews);

module.exports = router;
