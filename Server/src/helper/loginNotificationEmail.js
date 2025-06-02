// helper/loginNotificationEmail.js
const emailWithNodeMailer = require('./email');
const { clientURL } = require('../secret');

const sendLoginNotificationEmail = async (user, loginDetails) => {
  const { firstName, lastName, email } = user;
  const { time, location, device, ipAddress } = loginDetails;

  const formattedTime = new Date(time).toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short'
  });

  const subject = `New login detected on your account`;
  
  const html = `
    <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
      <div style="background-color: #0055A4; padding: 20px; text-align: center;">
        <img src="https://yourlogo.com/logo.png" alt="Your App Logo" style="height: 50px;">
      </div>
      
      <div style="padding: 30px; background-color: #f8f9fa;">
        <h2 style="color: #0055A4; margin-top: 0;">Hello ${firstName} ${lastName},</h2>
        
        <p>We noticed a new login to your account:</p>
        
        <div style="background-color: white; border-radius: 8px; padding: 20px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
          <table style="width: 100%;">
            <tr>
              <td style="width: 30%; color: #666; padding: 8px 0;">Time:</td>
              <td style="padding: 8px 0;"><strong>${formattedTime}</strong></td>
            </tr>
            <tr>
              <td style="color: #666; padding: 8px 0;">Location:</td>
              <td style="padding: 8px 0;"><strong>${location.city}, ${location.region}, ${location.country}</strong></td>
            </tr>
            <tr>
              <td style="color: #666; padding: 8px 0;">Device:</td>
              <td style="padding: 8px 0;"><strong>${device}</strong></td>
            </tr>
            <tr>
              <td style="color: #666; padding: 8px 0;">IP Address:</td>
              <td style="padding: 8px 0;"><strong>${ipAddress}</strong></td>
            </tr>
          </table>
        </div>
        
        <p>If this was you, you can safely ignore this email. If you don't recognize this activity, please secure your account immediately.</p>
        
        <div style="margin: 30px 0; text-align: center;">
          <a href="${clientURL}/account/security" style="background-color: #EF3340; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">
            Review Account Security
          </a>
        </div>
        
        <p style="font-size: 14px; color: #666;">
          For your security, this email was sent to ${email}.<br>
          Need help? <a href="${clientURL}/support" style="color: #0055A4;">Contact our support team</a>.
        </p>
      </div>
      
      <div style="background-color: #f1f1f1; padding: 20px; text-align: center; font-size: 12px; color: #666;">
        <p>© ${new Date().getFullYear()} Your App Name. All rights reserved.</p>
        <p>
          <a href="${clientURL}/privacy" style="color: #0055A4; text-decoration: none; margin: 0 10px;">Privacy Policy</a>
          <a href="${clientURL}/terms" style="color: #0055A4; text-decoration: none; margin: 0 10px;">Terms of Service</a>
        </p>
      </div>
    </div>
  `;

  await emailWithNodeMailer({
    email,
    subject,
    html
  });
};

module.exports = sendLoginNotificationEmail;