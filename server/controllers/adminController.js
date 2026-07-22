const User = require('../models/User');
const Interview = require('../models/Interview');
const Question = require('../models/Question');
const Result = require('../models/Result');

// @desc    Get platform stats
// @route   GET /api/admin/stats
const getPlatformStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalInterviews = await Interview.countDocuments();

    const completedInterviews = await Interview.find({ status: 'completed' });
    const avgScore = completedInterviews.length > 0
      ? Math.round(completedInterviews.reduce((sum, i) => sum + (i.score || 0), 0) / completedInterviews.length)
      : 0;

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const activeToday = await Interview.distinct('userId', { createdAt: { $gte: todayStart } });

    res.json({
      success: true,
      data: { totalUsers, totalInterviews, avgScore, activeToday: activeToday.length }
    });
  } catch (err) {
    console.error('getPlatformStats error:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get all users (paginated)
// @route   GET /api/admin/users?page=1&search=
const getUsers = async (req, res) => {
  try {
    const { page = 1, search = '', limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    let filter = {};
    if (search) {
      filter = {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ]
      };
    }

    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(filter);

    res.json({
      success: true,
      data: users,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) }
    });
  } catch (err) {
    console.error('getUsers error:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get single user
// @route   GET /api/admin/users/:id
const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const interviewCount = await Interview.countDocuments({ userId: user._id });
    res.json({ success: true, data: { ...user.toObject(), interviewCount } });
  } catch (err) {
    console.error('getUser error:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Update user role
// @route   PUT /api/admin/users/:id/role
const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role' });
    }

    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    res.json({ success: true, data: user });
  } catch (err) {
    console.error('updateUserRole error:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Delete user and all data
// @route   DELETE /api/admin/users/:id
const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const interviews = await Interview.find({ userId });
    const interviewIds = interviews.map(i => i._id);

    await Question.deleteMany({ interviewId: { $in: interviewIds } });
    await Result.deleteMany({ interviewId: { $in: interviewIds } });
    await Interview.deleteMany({ userId });
    await User.findByIdAndDelete(userId);

    res.json({ success: true, message: 'User deleted' });
  } catch (err) {
    console.error('deleteUser error:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get all interviews (paginated)
// @route   GET /api/admin/interviews?page=1
const getAllInterviews = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const interviews = await Interview.find()
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Interview.countDocuments();

    res.json({
      success: true,
      data: interviews,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) }
    });
  } catch (err) {
    console.error('getAllInterviews error:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Delete any interview
// @route   DELETE /api/admin/interviews/:id
const deleteAnyInterview = async (req, res) => {
  try {
    const interviewId = req.params.id;
    await Question.deleteMany({ interviewId });
    await Result.deleteMany({ interviewId });
    await Interview.findByIdAndDelete(interviewId);

    res.json({ success: true, message: 'Interview deleted' });
  } catch (err) {
    console.error('deleteAnyInterview error:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { getPlatformStats, getUsers, getUser, updateUserRole, deleteUser, getAllInterviews, deleteAnyInterview };
