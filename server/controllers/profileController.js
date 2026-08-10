const User = require('../models/User');
const Interview = require('../models/Interview');
const Question = require('../models/Question');
const Result = require('../models/Result');
const fs = require('fs');
const path = require('path');

// @desc    Update user profile
// @route   PUT /api/profile/update
const updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (email && email !== user.email) {
      const existing = await User.findOne({ email });
      if (existing) {
        return res.status(400).json({ success: false, message: 'Email already in use' });
      }
      user.email = email;
      user.isEmailVerified = false;
    }

    if (name) user.name = name;
    await user.save();

    res.json({
      success: true,
      data: { id: user._id, name: user.name, email: user.email, role: user.role, readinessScore: user.readinessScore, progress: user.progress, isEmailVerified: user.isEmailVerified }
    });
  } catch (err) {
    console.error('updateProfile error:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Change password
// @route   PUT /api/profile/password
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Both current and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters' });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    const isMatch = await user.comparePassword(currentPassword);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (err) {
    console.error('changePassword error:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Delete user account and all related data
// @route   DELETE /api/profile/account
const deleteAccount = async (req, res) => {
  try {
    const userId = req.user.id;

    const interviews = await Interview.find({ userId });
    const interviewIds = interviews.map(i => i._id);

    await Question.deleteMany({ interviewId: { $in: interviewIds } });
    await Result.deleteMany({ interviewId: { $in: interviewIds } });
    await Interview.deleteMany({ userId });
    await User.findByIdAndDelete(userId);

    res.json({ success: true, message: 'Account deleted successfully' });
  } catch (err) {
    console.error('deleteAccount error:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get user profile stats
// @route   GET /api/profile/stats
const getStats = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    const interviews = await Interview.find({ userId: req.user.id, status: 'completed' });
    const totalInterviews = interviews.length;
    const avgScore = totalInterviews > 0
      ? Math.round(interviews.reduce((sum, i) => sum + (i.score || 0), 0) / totalInterviews)
      : 0;

    res.json({
      success: true,
      data: { totalInterviews, avgScore, memberSince: user.createdAt, readinessScore: user.readinessScore }
    });
  } catch (err) {
    console.error('getStats error:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Update user avatar
// @route   PUT /api/profile/avatar
const updateAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const uploadDir = path.join(__dirname, '../uploads/avatars');
    fs.mkdirSync(uploadDir, { recursive: true });

    const filename = `avatar-${req.user.id}-${Date.now()}${path.extname(req.file.originalname)}`;
    const filepath = path.join(uploadDir, filename);

    fs.writeFileSync(filepath, req.file.buffer);

    user.avatar = `/uploads/avatars/${filename}`;
    await user.save();

    res.json({ success: true, data: { avatar: user.avatar } });
  } catch (err) {
    console.error('updateAvatar error:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { updateProfile, changePassword, deleteAccount, getStats, updateAvatar };
