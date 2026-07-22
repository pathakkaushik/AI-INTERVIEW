const express = require('express');
const router = express.Router();
const { getNextQuestion, submitAnswer } = require('../controllers/questionController');
const auth = require('../middleware/auth');

router.use(auth);
router.get('/:interviewId/questions/next', getNextQuestion);
router.post('/:interviewId/answers', submitAnswer);

module.exports = router;
