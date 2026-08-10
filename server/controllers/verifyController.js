const crypto = require('crypto');
const User = require('../models/User');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../utils/email');

// @desc    Send verification email
// @route   POST /api/verify/send
const sendVerification = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (user.isEmailVerified) {
      return res.json({ success: true, message: 'Email already verified' });
    }

    const token = crypto.randomBytes(32).toString('hex');
    user.emailVerificationToken = token;
    user.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
    await user.save();

    await sendVerificationEmail(user, token);

    res.json({ success: true, message: 'Verification email sent' });
  } catch (err) {
    console.error('sendVerification error:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Verify email with token
// @route   GET /api/verify/confirm/:token
const verifyEmail = async (req, res) => {
  try {
    const user = await User.findOne({
      emailVerificationToken: req.params.token,
      emailVerificationExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired verification token' });
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    res.json({ success: true, message: 'Email verified successfully' });
  } catch (err) {
    console.error('verifyEmail error:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Forgot password - send reset email
// @route   POST /api/verify/forgot-password
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.json({ success: true, message: 'If this email exists, a reset link has been sent' });
    }

    const token = crypto.randomBytes(32).toString('hex');
    user.passwordResetToken = token;
    user.passwordResetExpires = Date.now() + 60 * 60 * 1000; // 1 hour
    await user.save();

    await sendPasswordResetEmail(user, token);

    res.json({ success: true, message: 'Password reset email sent' });
  } catch (err) {
    console.error('forgotPassword error:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Reset password with token
// @route   POST /api/verify/reset-password/:token
const resetPassword = async (req, res) => {
  try {
    const { password } = req.body;

    if (!password || password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    const user = await User.findOne({
      passwordResetToken: req.params.token,
      passwordResetExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired reset token' });
    }

    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    res.json({ success: true, message: 'Password reset successfully' });
  } catch (err) {
    console.error('resetPassword error:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { sendVerification, verifyEmail, forgotPassword, resetPassword };
