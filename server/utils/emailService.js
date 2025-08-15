import nodemailer from 'nodemailer';

// Debug logging for email configuration
console.log('Email Configuration:');
console.log('EMAIL_USER:', process.env.EMAIL_USER ? 'Set' : 'Not set');
console.log('EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? 'Set' : 'Not set');

const transporter = nodemailer.createTransport({
  service: 'gmail', // or your email service
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

export const sendVerificationEmail = async (email, verificationCode) => {
  console.log('Attempting to send verification email to:', email);
  
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    console.error('Email credentials not configured properly');
    throw new Error('Email service not configured');
  }
  const mailOptions = {
    from: `"Cookiepedia" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Verify Your Email - Cookiepedia',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Welcome to Cookiepedia! 🍪</h2>
        <p>Thank you for signing up. Please verify your email address by entering the following code:</p>
        <div style="background: #f4f4f4; padding: 20px; text-align: center; margin: 20px 0; font-size: 24px; letter-spacing: 2px;">
          ${verificationCode}
        </div>
        <p>This code will expire in 1 hour.</p>
        <p>If you didn't create an account, you can safely ignore this email.</p>
        <hr>
        <p style="color: #666; font-size: 12px;">
          This email was sent to ${email} because someone signed up for a Cookiepedia account with this address.
        </p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Error sending verification email:', error);
    return { success: false, error: 'Failed to send verification email' };
  }
};
