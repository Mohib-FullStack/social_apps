const { createJSONWebToken } = require('../helper/jsonwebtoken');
const emailWithNodeMailer = require('../helper/email');
const { clientURL } = require('../secret');

const sendVerificationEmail = async (user, newGender, token, req) => {
  return emailWithNodeMailer({
    email: user.email,
    subject: 'Gender Change Verification',
    html: `
      <h2>Gender Change Request</h2>
      <p>Requested change: <strong>${user.gender} → ${newGender}</strong></p>
      <p>IP: ${req.ip} | Device: ${req.headers['user-agent']}</p>
      <div style="margin: 20px 0;">
        <a href="${clientURL}/verify-gender/${token}" 
           style="background: #4CAF50; color: white; padding: 10px 20px; text-decoration: none;">
          Verify Change
        </a>
        <a href="${clientURL}/reject-gender/${token}" 
           style="background: #f44336; color: white; padding: 10px 20px; margin-left: 10px; text-decoration: none;">
          Reject Request
        </a>
      </div>
      <p><small>If you didn't request this, secure your account immediately.</small></p>
    `
  });
};

const createPendingChange = async (userId, newGender, token, req, transaction) => {
  return await PendingGenderChange.create({
    userId,
    newGender,
    verificationToken: token,
    requestIP: req.ip,
    userAgent: req.headers['user-agent']
  }, { transaction });
};

module.exports = { sendVerificationEmail, createPendingChange };