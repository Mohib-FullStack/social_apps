// helper/friendRequestAcceptedEmail.js
const emailWithNodeMailer = require('./email');
const { clientURL } = require('../secret');

const sendFriendRequestAcceptedEmail = async (requester, recipient) => {
  const { firstName: requesterFirstName, email: requesterEmail } = requester;
  const { firstName: recipientFirstName, lastName: recipientLastName } = recipient;

  const subject = `${recipientFirstName} accepted your friend request!`;
  
  const html = `
    <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
      <div style="background-color: #0055A4; padding: 20px; text-align: center;">
        <img src="https://yourlogo.com/logo.png" alt="Your App Logo" style="height: 50px;">
      </div>
      
      <div style="padding: 30px; background-color: #f8f9fa;">
        <h2 style="color: #0055A4; margin-top: 0;">Hello ${requesterFirstName},</h2>
        
        <p>Great news! <strong>${recipientFirstName} ${recipientLastName}</strong> has accepted your friend request.</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <img src="https://yourlogo.com/friends-icon.png" alt="Friends" style="height: 100px;">
        </div>
        
        <p>Now you can:</p>
        <ul style="padding-left: 20px;">
          <li>View each other's posts</li>
          <li>Start chatting</li>
          <li>See mutual friends</li>
        </ul>
        
        <div style="margin: 30px 0; text-align: center;">
          <a href="${clientURL}/messages/new?userId=${recipient.id}" style="background-color: #42B72A; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">
            Send a Message
          </a>
        </div>
        
        <p style="font-size: 14px; color: #666;">
          This email was sent to ${requesterEmail}.<br>
          <a href="${clientURL}/friends" style="color: #0055A4;">View your friends list</a> or 
          <a href="${clientURL}/account/settings" style="color: #0055A4;">adjust notification settings</a>.
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

module.exports = sendFriendRequestAcceptedEmail;