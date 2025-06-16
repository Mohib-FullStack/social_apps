// helper/friendRequestRejectedEmail.js
const emailWithNodeMailer = require('./email');
const { clientURL } = require('../secret');

const sendFriendRequestRejectedEmail = async (requester, recipient) => {
  const { firstName: requesterFirstName, email: requesterEmail } = requester;
  const { firstName: recipientFirstName, lastName: recipientLastName } = recipient;

  const subject = `${recipientFirstName} declined your friend request`;
  
  const html = `
    <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
      <div style="background-color: #0055A4; padding: 20px; text-align: center;">
        <img src="https://yourlogo.com/logo.png" alt="Your App Logo" style="height: 50px;">
      </div>
      
      <div style="padding: 30px; background-color: #f8f9fa;">
        <h2 style="color: #0055A4; margin-top: 0;">Hello ${requesterFirstName},</h2>
        
        <p>We wanted to let you know that <strong>${recipientFirstName} ${recipientLastName}</strong> has declined your friend request.</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <img src="https://yourlogo.com/friends-icon.png" alt="Friends" style="height: 100px; opacity: 0.5;">
        </div>
        
        <p>Don't worry! You can still:</p>
        <ul style="padding-left: 20px;">
          <li>Connect with other friends</li>
          <li>Find people with similar interests</li>
          <li>Try sending a message first</li>
        </ul>
        
        <div style="margin: 30px 0; text-align: center;">
          <a href="${clientURL}/friends/suggestions" style="background-color: #1877F2; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">
            Find New Friends
          </a>
        </div>
        
        <p style="font-size: 14px; color: #666;">
          This email was sent to ${requesterEmail}.<br>
          <a href="${clientURL}/account/settings" style="color: #0055A4;">Adjust your notification settings</a> if you don't want to receive these emails.
        </p>
      </div>
      
      <div style="background-color: #f1f1f1; padding: 20px; text-align: center; font-size: 12px; color: #666;">
        <p>© ${new Date().getFullYear()} Your App Name. All rights reserved.</p>
      </div>
    </div>
  `;

  await emailWithNodeMailer({
    email: requesterEmail,
    subject,
    html
  });
};

module.exports = sendFriendRequestRejectedEmail;