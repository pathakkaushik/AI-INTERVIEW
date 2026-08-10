const express = require('express');
const router = express.Router();
const { getNextQuestion, submitAnswer } = require('../controllers/questionController');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const auth = require('../middleware/auth');

router.use(auth);
router.get('/:interviewId/questions/next', getNextQuestion);
router.post('/:interviewId/answers', [
  body('answerText').notEmpty().withMessage('Answer text is required')
], validate, submitAnswer);

module.exports = router;
