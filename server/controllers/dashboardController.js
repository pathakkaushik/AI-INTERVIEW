const User = require('../models/User');
const Interview = require('../models/Interview');
const Result = require('../models/Result');
const { formatDuration } = require('../utils/helpers');

// Helper: format a date into a relative time string
function relativeDate(date) {
  const now = Date.now();
  const diffMs = now - new Date(date).getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 1) return 'Today';
  if (diffDays < 2) return '1 day ago';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 14) return '1 week ago';
  if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `${weeks} weeks ago`;
  }
  const months = Math.floor(diffDays / 30);
  return `${months} month${months > 1 ? 's' : ''} ago`;
}

// @desc    Get dashboard statistics for the logged-in user
// @route   GET /api/dashboard/stats
const getDashboardStats = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Get recent completed or active interviews
    const interviews = await Interview.find({
      userId: req.user.id,
      status: { $in: ['completed', 'active'] }
    })
      .sort({ createdAt: -1 })
      .limit(10);

    const recentInterviews = interviews.map((interview) => ({
      _id: interview._id,
      title: interview.title,
      date: relativeDate(interview.createdAt),
      score: interview.score,
      status: interview.status,
      duration: formatDuration(interview.duration)
    }));

    res.json({
      success: true,
      data: {
        user: {
          name: user.name,
          readinessScore: user.readinessScore,
          progress: user.progress
        },
        recentInterviews
      }
    });
  } catch (err) {
    console.error('getDashboardStats error:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get the recruiter view for the logged-in user
// @route   GET /api/dashboard/recruiter-view
const getRecruiterView = async (req, res) => {
  try {
    // Find the latest result for this user
    const result = await Result.findOne({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(1);

    if (result) {
      return res.json({
        success: true,
        data: result.recruiterView,
        skillRadarData: result.skillRadarData
      });
    }

    // No results yet – return defaults
    res.json({
      success: true,
      data: {
        technicalSkills: 0,
        communication: 0,
        confidence: 0,
        hireSuggestion: 'No data yet',
        aiInsights: ['Complete an interview to get AI insights.']
      },
      skillRadarData: []
    });
  } catch (err) {
    console.error('getRecruiterView error:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  getDashboardStats,
  getRecruiterView
};
