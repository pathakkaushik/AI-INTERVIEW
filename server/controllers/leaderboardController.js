const User = require('../models/User');
const Interview = require('../models/Interview');

// @desc    Get leaderboard
// @route   GET /api/leaderboard?period=all&limit=50
const getLeaderboard = async (req, res) => {
  try {
    const { period = 'all', limit = 50 } = req.query;

    let dateFilter = {};
    const now = new Date();
    if (period === 'week') {
      dateFilter = { createdAt: { $gte: new Date(now - 7 * 24 * 60 * 60 * 1000) } };
    } else if (period === 'month') {
      dateFilter = { createdAt: { $gte: new Date(now - 30 * 24 * 60 * 60 * 1000) } };
    }

    const users = await User.find({ readinessScore: { $gt: 0 }, ...dateFilter })
      .select('name readinessScore progress createdAt')
      .sort({ readinessScore: -1 })
      .limit(parseInt(limit));

    const leaderboard = await Promise.all(users.map(async (user, index) => {
      const totalInterviews = await Interview.countDocuments({ userId: user._id, status: 'completed' });

      const progressFields = [
        { name: 'Technical', value: user.progress?.technical || 0 },
        { name: 'Behavioral', value: user.progress?.behavioral || 0 },
        { name: 'Body Language', value: user.progress?.bodyLanguage || 0 }
      ];
      const topSkill = progressFields.sort((a, b) => b.value - a.value)[0];

      return {
        _id: user._id,
        rank: index + 1,
        name: user.name,
        readinessScore: user.readinessScore,
        totalInterviews,
        topSkill: topSkill.value > 0 ? topSkill.name : 'N/A'
      };
    }));

    res.json({ success: true, data: leaderboard });
  } catch (err) {
    console.error('getLeaderboard error:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { getLeaderboard };
