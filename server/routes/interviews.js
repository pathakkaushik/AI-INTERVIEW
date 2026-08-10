const express = require('express');
const router = express.Router();
const { getInterviews, createInterview, getInterview, endInterview, deleteInterview, deleteAllInterviews, generateCheatSheet } = require('../controllers/interviewController');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { resumeUpload } = require('../middleware/upload');
const auth = require('../middleware/auth');

router.use(auth);
router.get('/', getInterviews);
router.post('/', resumeUpload, [
  body('role').optional().isString().trim(),
  body('personality').optional().isIn(['Friendly', 'Strict', 'HR-like', 'Technical Expert']),
  body('difficulty').optional().isIn(['Easy', 'Medium', 'Hard'])
], validate, createInterview);
router.post('/cheat-sheet', generateCheatSheet);
router.get('/:id', getInterview);
router.put('/:id/end', endInterview);
router.delete('/:id', deleteInterview);
router.delete('/', deleteAllInterviews);

module.exports = router;
