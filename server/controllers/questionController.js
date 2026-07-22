const Question = require('../models/Question');
const Interview = require('../models/Interview');
const aiService = require('../services/aiService');

// @desc    Get the next question for an interview
// @route   GET /api/questions/:interviewId/questions/next
const getNextQuestion = async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.interviewId);

    if (!interview) {
      return res.status(404).json({ success: false, message: 'Interview not found' });
    }

    if (interview.userId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Check if all questions have been answered
    if (interview.currentQuestion >= interview.totalQuestions && interview.answers.length >= interview.totalQuestions) {
      return res.json({
        success: false,
        message: 'All questions answered'
      });
    }

    // Check if a question is already generated for the current step but not answered yet
    if (interview.currentQuestion > 0 && interview.answers.length < interview.currentQuestion) {
      const existingQuestion = await Question.findOne({
        interviewId: interview._id,
        questionNumber: interview.currentQuestion
      });
      if (existingQuestion) {
        return res.json({
          success: true,
          data: {
            question: existingQuestion,
            questionNumber: interview.currentQuestion,
            totalQuestions: interview.totalQuestions
          }
        });
      }
    }

    // Get existing questions to avoid repetition
    const existingQuestions = await Question.find({ interviewId: interview._id });
    const previousTexts = existingQuestions.map((q) => q.text);

    // Adjust difficulty progressively based on selected difficulty and total questions
    let currentDifficulty = interview.difficulty;
    const progressRatio = interview.currentQuestion / (interview.totalQuestions || 20);
    
    if (interview.difficulty === 'Easy') {
      if (progressRatio > 0.7) {
        currentDifficulty = 'Hard';
      } else if (progressRatio > 0.35) {
        currentDifficulty = 'Medium';
      }
    } else if (interview.difficulty === 'Medium') {
      if (progressRatio > 0.35) {
        currentDifficulty = 'Hard';
      }
    }

    // Generate a new question using AI
    const generated = await aiService.generateQuestion(
      interview.role,
      interview.personality,
      currentDifficulty,
      previousTexts,
      interview.resumeText || ""
    );

    // Increment current question count
    interview.currentQuestion += 1;
    await interview.save();

    // Save question to DB
    const question = await Question.create({
      interviewId: interview._id,
      text: generated.text,
      questionNumber: interview.currentQuestion,
      totalQuestions: interview.totalQuestions,
      difficulty: currentDifficulty,
      category: generated.category || 'Technical'
    });

    res.json({
      success: true,
      data: {
        question,
        questionNumber: interview.currentQuestion,
        totalQuestions: interview.totalQuestions
      }
    });
  } catch (err) {
    console.error('getNextQuestion error:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Submit an answer for the latest question
// @route   POST /api/questions/:interviewId/answers
const submitAnswer = async (req, res) => {
  try {
    const { answerText } = req.body;

    const interview = await Interview.findById(req.params.interviewId);

    if (!interview) {
      return res.status(404).json({ success: false, message: 'Interview not found' });
    }

    if (interview.userId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Get the latest question for this interview
    const question = await Question.findOne({ interviewId: interview._id })
      .sort({ createdAt: -1 })
      .limit(1);

    if (!question) {
      return res.status(404).json({ success: false, message: 'No question found to answer' });
    }

    // Analyze the answer using AI
    const analysis = await aiService.analyzeAnswer(question.text, answerText, interview.role);

    // Push analysis to interview answers array
    interview.answers.push({
      questionId: question._id,
      answerText,
      score: analysis.score,
      analysis: {
        keywordsDetected: analysis.keywordsDetected,
        missingConcepts: analysis.missingConcepts,
        suggestedImprovement: analysis.suggestedImprovement
      }
    });

    await interview.save();

    res.json({
      success: true,
      data: { analysis }
    });
  } catch (err) {
    console.error('submitAnswer error:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  getNextQuestion,
  submitAnswer
};
