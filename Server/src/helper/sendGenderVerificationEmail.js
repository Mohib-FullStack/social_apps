const nodemailer = require('nodemailer');
const { smtpUsername, smtpPassword, clientURL } = require('../secret');

// Reuse the same transporter configuration
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: smtpUsername,
    pass: smtpPassword,
  },
});

/**
 * Sends gender change verification email
 * @param {Object} user - User object {firstName, email, gender}
 * @param {string} newGender - Requested new gender
 * @param {string} token - Verification token
 * @param {Object} meta - Additional metadata {ip, userAgent}
 */
const sendGenderVerificationEmail = async (user, newGender, token, meta = {}) => {
  const verificationLink = `${clientURL}/api/gender/verify-gender/${token}`;
  
  const mailOptions = {
    from: `"Account Security" <${smtpUsername}>`,
    to: user.email,
    subject: 'Confirm Your Gender Change Request',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2d3748;">Hello ${user.firstName},</h2>
        <p>We received a request to change your account gender from 
        <strong>${user.gender}</strong> to <strong>${newGender}</strong>.</p>
        
        <div style="margin: 25px 0; text-align: center;">
          <a href="${verificationLink}" 
             style="background-color: #4299e1; color: white; padding: 12px 24px; 
                    text-decoration: none; border-radius: 4px; font-weight: bold;">
            Verify Gender Change
          </a>
        </div>
        
        <div style="background-color: #f7fafc; padding: 15px; border-radius: 6px; border-left: 4px solid #4299e1;">
          <h4 style="margin-top: 0;">Request Details:</h4>
          <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
          ${meta.ip ? `<p><strong>IP Address:</strong> ${meta.ip}</p>` : ''}
          ${meta.userAgent ? `<p><strong>Device:</strong> ${meta.userAgent}</p>` : ''}
        </div>
        
        <p style="color: #718096; font-size: 0.9em; margin-top: 30px;">
          If you didn't request this change, please secure your account immediately.
          This link expires in 24 hours.
        </p>
      </div>
    `,
    // Add headers for better email deliverability
    headers: {
      'X-Priority': '1',
      'Importance': 'high'
    }
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Gender verification email sent to ${user.email}`);
    return true;
  } catch (error) {
    console.error('Gender email failed:', error);
    throw new Error(`Failed to send gender verification email: ${error.message}`);
  }
};

module.exports = {
  sendGenderVerificationEmail
};