const Interview = require('../models/Interview');
const Question = require('../models/Question');
const Result = require('../models/Result');
const User = require('../models/User');
const aiService = require('../services/aiService');

// @desc    Get all interviews for the logged-in user
// @route   GET /api/interviews
const getInterviews = async (req, res) => {
  try {
    const interviews = await Interview.find({ userId: req.user.id })
      .sort({ createdAt: -1 });

    res.json({ success: true, data: interviews });
  } catch (err) {
    console.error('getInterviews error:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Create a new interview
// @route   POST /api/interviews
const createInterview = async (req, res) => {
  try {
    const { title, role, personality, difficulty, resumeText } = req.body;

    const interview = await Interview.create({
      userId: req.user.id,
      title: title || `Interview - ${new Date().toLocaleDateString()}`,
      role: role || '',
      personality: personality || 'Friendly',
      difficulty: difficulty || 'Medium',
      resumeText: resumeText || '',
      status: 'active'
    });

    res.status(201).json({ success: true, data: interview });
  } catch (err) {
    console.error('createInterview error:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get a single interview by ID
// @route   GET /api/interviews/:id
const getInterview = async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id);

    if (!interview) {
      return res.status(404).json({ success: false, message: 'Interview not found' });
    }

    // Ensure the interview belongs to the logged-in user
    if (interview.userId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    res.json({ success: true, data: interview });
  } catch (err) {
    console.error('getInterview error:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    End an interview and generate results
// @route   PUT /api/interviews/:id/end
const endInterview = async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id);

    if (!interview) {
      return res.status(404).json({ success: false, message: 'Interview not found' });
    }

    if (interview.userId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Update interview status
    interview.status = 'completed';
    interview.completedAt = Date.now();

    // Calculate duration in seconds
    interview.duration = Math.floor((Date.now() - new Date(interview.createdAt).getTime()) / 1000);

    // Calculate average score from answers
    if (interview.answers && interview.answers.length > 0) {
      const totalScore = interview.answers.reduce((sum, a) => sum + (a.score || 0), 0);
      interview.score = Math.round(totalScore / interview.answers.length);
    }

    await interview.save();

    // Generate comprehensive results using AI
    const resultData = await aiService.generateResults(interview, interview.answers || []);

    // Create Result document
    const result = await Result.create({
      interviewId: interview._id,
      userId: req.user.id,
      overallScore: resultData.overallScore,
      percentile: resultData.percentile,
      timelineMarkers: resultData.timelineMarkers,
      strengths: resultData.strengths,
      improvements: resultData.improvements,
      evaluationTransparency: resultData.evaluationTransparency,
      skillRadarData: resultData.skillRadarData,
      recruiterView: resultData.recruiterView
    });

    // Update user's readiness score and progress
    const user = await User.findById(req.user.id);
    if (user) {
      // Weighted average with previous readinessScore
      const prevScore = user.readinessScore || 0;
      user.readinessScore = prevScore === 0
        ? resultData.overallScore
        : Math.round((prevScore + resultData.overallScore) / 2);

      // Update progress based on skill radar data
      if (resultData.skillRadarData && resultData.skillRadarData.length > 0) {
        const techSkill = resultData.skillRadarData.find((s) => s.subject === 'Technical Skills');
        if (techSkill) user.progress.technical = techSkill.candidateScore;

        const commSkill = resultData.skillRadarData.find((s) => s.subject === 'Communication');
        if (commSkill) user.progress.behavioral = commSkill.candidateScore;

        // Use confidence from recruiter view for body language proxy
        if (resultData.recruiterView) {
          user.progress.bodyLanguage = resultData.recruiterView.confidence || 0;
        }
      }

      await user.save();
    }

    res.json({ success: true, data: { interview, result } });
  } catch (err) {
    console.error('endInterview error:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Helper to recalculate user readinessScore and progress metrics
const recalculateUserProgress = async (userId) => {
  const user = await User.findById(userId);
  if (!user) return;

  const remainingInterviews = await Interview.find({ userId, status: 'completed' });

  if (remainingInterviews.length === 0) {
    user.readinessScore = 0;
    user.progress.technical = 0;
    user.progress.behavioral = 0;
    user.progress.bodyLanguage = 0;
  } else {
    const totalScore = remainingInterviews.reduce((sum, i) => sum + (i.score || 0), 0);
    user.readinessScore = Math.round(totalScore / remainingInterviews.length);

    const interviewIds = remainingInterviews.map(i => i._id);
    const results = await Result.find({ interviewId: { $in: interviewIds } });

    if (results.length > 0) {
      let totalTech = 0;
      let totalBehav = 0;
      let totalBody = 0;

      results.forEach(res => {
        if (res.skillRadarData) {
          const techSkill = res.skillRadarData.find(s => s.subject === 'Technical Skills');
          if (techSkill) totalTech += techSkill.candidateScore || 0;

          const commSkill = res.skillRadarData.find(s => s.subject === 'Communication');
          if (commSkill) totalBehav += commSkill.candidateScore || 0;
        }
        if (res.recruiterView) {
          totalBody += res.recruiterView.confidence || 0;
        }
      });

      user.progress.technical = Math.round(totalTech / results.length);
      user.progress.behavioral = Math.round(totalBehav / results.length);
      user.progress.bodyLanguage = Math.round(totalBody / results.length);
    } else {
      user.progress.technical = 0;
      user.progress.behavioral = 0;
      user.progress.bodyLanguage = 0;
    }
  }

  await user.save();
};

// @desc    Delete an interview and related data
// @route   DELETE /api/interviews/:id
const deleteInterview = async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id);

    if (!interview) {
      return res.status(404).json({ success: false, message: 'Interview not found' });
    }

    if (interview.userId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Delete related questions and results
    await Question.deleteMany({ interviewId: interview._id });
    await Result.deleteMany({ interviewId: interview._id });
    await Interview.findByIdAndDelete(interview._id);

    // Recalculate progress for user based on remaining interviews
    await recalculateUserProgress(req.user.id);

    res.json({ success: true, message: 'Interview deleted' });
  } catch (err) {
    console.error('deleteInterview error:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Delete all interviews for the logged-in user
// @route   DELETE /api/interviews
const deleteAllInterviews = async (req, res) => {
  try {
    const userInterviews = await Interview.find({ userId: req.user.id });
    const interviewIds = userInterviews.map(i => i._id);

    // Delete related questions and results
    await Question.deleteMany({ interviewId: { $in: interviewIds } });
    await Result.deleteMany({ interviewId: { $in: interviewIds } });
    await Interview.deleteMany({ userId: req.user.id });

    // Reset user progress to 0 since there are no remaining interviews
    const user = await User.findById(req.user.id);
    if (user) {
      user.readinessScore = 0;
      user.progress.technical = 0;
      user.progress.behavioral = 0;
      user.progress.bodyLanguage = 0;
      await user.save();
    }

    res.json({ success: true, message: 'All interviews deleted' });
  } catch (err) {
    console.error('deleteAllInterviews error:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Generate an AI Cheat Sheet for a topic
// @route   POST /api/interviews/cheat-sheet
const generateCheatSheet = async (req, res) => {
  try {
    const { topic } = req.body;
    if (!topic) {
      return res.status(400).json({ success: false, message: 'Topic is required' });
    }
    const cheatSheet = await aiService.generateCheatSheet(topic);
    res.json({ success: true, data: cheatSheet });
  } catch (err) {
    console.error('generateCheatSheet error:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  getInterviews,
  createInterview,
  getInterview,
  endInterview,
  deleteInterview,
  deleteAllInterviews,
  generateCheatSheet
};
