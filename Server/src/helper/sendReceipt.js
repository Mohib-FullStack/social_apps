// helper/sendReceipt.js
const nodemailer = require("nodemailer");
const { smtpUsername, smtpPassword } = require("../secret");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // Consider setting to true for port 465
  auth: {
    user: smtpUsername,
    pass: smtpPassword,
  },
});

const sendReceiptEmail = async (emailData) => {
  try {
    const mailOptions = {
      from: smtpUsername, // Sender address
      to: emailData.email, // Receiver's email
      subject: emailData.subject, // Subject line
      html: emailData.html, // Email body
    };

    await transporter.sendMail(mailOptions);
    console.log(`Receipt email sent to ${emailData.email}`);
  } catch (error) {
    console.error("Error sending receipt email:", error);
    throw new Error("Failed to send receipt email"); // Optionally include error details
  }
};

module.exports = sendReceiptEmail;