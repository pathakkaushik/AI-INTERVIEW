const express = require('express');
const router = express.Router();
const { getResults, getSkills, generateActionPlan } = require('../controllers/resultController');
const auth = require('../middleware/auth');

router.use(auth);
router.get('/:interviewId/results', getResults);
router.get('/:interviewId/skills', getSkills);
router.post('/:interviewId/action-plan', generateActionPlan);

module.exports = router;
