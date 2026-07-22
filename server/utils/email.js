const nodemailer = require('nodemailer');

let transporter = null;

if (process.env.SMTP_USER && process.env.SMTP_PASS) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
}

const sendVerificationEmail = async (user, token) => {
  const verifyUrl = `${process.env.APP_URL || 'http://localhost:5173'}/verify-email?token=${token}`;

  if (!transporter) {
    console.log('=== EMAIL VERIFICATION (No SMTP configured) ===');
    console.log(`To: ${user.email}`);
    console.log(`Verification URL: ${verifyUrl}`);
    console.log('================================================');
    return;
  }

  await transporter.sendMail({
    from: `"AI Interview" <${process.env.SMTP_USER}>`,
    to: user.email,
    subject: 'Verify Your Email - AI Interview',
    html: `
      <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: #f8fafc; padding: 40px; border-radius: 16px;">
        <h1 style="text-align: center; background: linear-gradient(135deg, #3b82f6, #8b5cf6); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">AI Interview</h1>
        <h2 style="text-align: center; margin-top: 20px;">Verify Your Email</h2>
        <p style="text-align: center; color: #94a3b8;">Hi ${user.name}, click the button below to verify your email address.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verifyUrl}" style="background: linear-gradient(135deg, #3b82f6, #8b5cf6); color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600;">Verify Email</a>
        </div>
        <p style="text-align: center; color: #64748b; font-size: 12px;">This link expires in 24 hours. If you didn't create an account, ignore this email.</p>
      </div>
    `
  });
};

const sendPasswordResetEmail = async (user, token) => {
  const resetUrl = `${process.env.APP_URL || 'http://localhost:5173'}/reset-password?token=${token}`;

  if (!transporter) {
    console.log('=== PASSWORD RESET (No SMTP configured) ===');
    console.log(`To: ${user.email}`);
    console.log(`Reset URL: ${resetUrl}`);
    console.log('============================================');
    return;
  }

  await transporter.sendMail({
    from: `"AI Interview" <${process.env.SMTP_USER}>`,
    to: user.email,
    subject: 'Reset Your Password - AI Interview',
    html: `
      <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: #f8fafc; padding: 40px; border-radius: 16px;">
        <h1 style="text-align: center; background: linear-gradient(135deg, #3b82f6, #8b5cf6); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">AI Interview</h1>
        <h2 style="text-align: center; margin-top: 20px;">Reset Your Password</h2>
        <p style="text-align: center; color: #94a3b8;">Hi ${user.name}, click the button below to reset your password.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background: linear-gradient(135deg, #3b82f6, #8b5cf6); color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600;">Reset Password</a>
        </div>
        <p style="text-align: center; color: #64748b; font-size: 12px;">This link expires in 1 hour. If you didn't request this, ignore this email.</p>
      </div>
    `
  });
};

module.exports = { sendVerificationEmail, sendPasswordResetEmail };
