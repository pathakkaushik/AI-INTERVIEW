const Result = require('../models/Result');
const Interview = require('../models/Interview');
const aiService = require('../services/aiService');

// @desc    Get results for an interview
// @route   GET /api/results/:interviewId/results
const getResults = async (req, res) => {
  try {
    const result = await Result.findOne({ interviewId: req.params.interviewId })
      .populate({
        path: 'interviewId',
        populate: {
          path: 'answers.questionId',
          model: 'Question'
        }
      });

    if (!result) {
      return res.status(404).json({ success: false, message: 'Results not found' });
    }

    res.json({ success: true, data: result });
  } catch (err) {
    console.error('getResults error:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get skill radar data for an interview
// @route   GET /api/results/:interviewId/skills
const getSkills = async (req, res) => {
  try {
    const result = await Result.findOne({ interviewId: req.params.interviewId });

    if (!result) {
      return res.status(404).json({ success: false, message: 'Results not found' });
    }

    res.json({ success: true, data: result.skillRadarData });
  } catch (err) {
    console.error('getSkills error:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Generate an action plan based on results
// @route   POST /api/results/:interviewId/action-plan
const generateActionPlan = async (req, res) => {
  try {
    const result = await Result.findOne({ interviewId: req.params.interviewId });

    if (!result) {
      return res.status(404).json({ success: false, message: 'Results not found' });
    }

    const actionPlan = await aiService.generateActionPlan(result);

    res.json({ success: true, data: { actionPlan } });
  } catch (err) {
    console.error('generateActionPlan error:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  getResults,
  getSkills,
  generateActionPlan
};
