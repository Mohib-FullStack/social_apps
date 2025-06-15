// src/helper/phoneHelper.js
require('dotenv').config({
  path: `.env.${process.env.NODE_ENV || 'development'}`
});

const { Sequelize } = require('sequelize');

const requiredEnvVars = [
  'POSTGRES_DATABASE',
  'POSTGRES_USER',
  'POSTGRES_PASSWORD',
  'POSTGRES_HOST',
];

const twilio = require('twilio');
const { Op } = require('sequelize');

// OTP Configuration
const OTP_CONFIG = {
  expiryMinutes: parseInt(process.env.OTP_EXPIRY_MINUTES) || 15,
  maxAttempts: parseInt(process.env.OTP_MAX_ATTEMPTS) || 5,
  resendDelay: parseInt(process.env.OTP_RESEND_DELAY_MINUTES) || 2,
  length: parseInt(process.env.OTP_LENGTH) || 6
};

// Phone number validation
const isValidPhone = (phone) => {
  if (!phone) return false;
  
  // Strict international phone validation
  const phoneRegex = /^\+(9[976]\d|8[987530]\d|6[987]\d|5[90]\d|42\d|3[875]\d|2[98654321]\d|9[8543210]|8[6421]|6[6543210]|5[87654321]|4[987654310]|3[9643210]|2[70]|7|1)\d{6,14}$/;
  
  const cleanedPhone = phone.replace(/[^\d+]/g, '');
  return phoneRegex.test(cleanedPhone);
};

// OTP generation
const generateOTP = (length = OTP_CONFIG.length) => {
  const digits = '0123456789';
  let otp = '';
  
  for (let i = 0; i < length; i++) {
    otp += digits[Math.floor(Math.random() * 10)];
  }
  
  return otp;
};

// SMS sending (with Twilio as primary and HTTP as fallback)
const sendSMS = async (phoneNumber, message) => {
  // Try Twilio first if configured
  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
    try {
      const client = twilio(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN
      );
      
      const response = await client.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phoneNumber
      });
      
      return { 
        success: true, 
        provider: 'twilio',
        messageId: response.sid 
      };
    } catch (twilioError) {
      console.error('Twilio SMS failed:', twilioError);
      // Continue to fallback provider
    }
  }

  // Fallback to HTTP SMS provider if configured
  if (process.env.SMS_API_KEY) {
    try {
      const response = await fetch('https://api.sms-provider.com/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.SMS_API_KEY}`
        },
        body: JSON.stringify({
          to: phoneNumber,
          text: message
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to send SMS');
      }
      
      return { 
        success: true,
        provider: 'http',
        data 
      };
    } catch (httpError) {
      console.error('HTTP SMS failed:', httpError);
    }
  }

  // Development fallback - log to console
  if (process.env.NODE_ENV !== 'production') {
    console.log(`[DEV SMS] To: ${phoneNumber}\nMessage: ${message}`);
    return {
      success: true,
      provider: 'development',
      messageId: 'dev-mock-sms'
    };
  }

  return { 
    success: false, 
    error: 'No SMS providers configured properly' 
  };
};

// Dedicated HTTP SMS provider function
const sendSMSViaHTTP = async (phoneNumber, message) => {
  if (!process.env.SMS_API_KEY) {
    return {
      success: false,
      error: 'SMS API key not configured'
    };
  }

  try {
    const response = await fetch('https://api.sms-provider.com/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.SMS_API_KEY}`
      },
      body: JSON.stringify({
        to: phoneNumber,
        text: message
      })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to send SMS');
    }
    
    return { 
      success: true, 
      data 
    };
    
  } catch (error) {
    console.error('SMS sending failed:', error);
    return { 
      success: false, 
      error: error.message 
    };
  }
};

// Phone number normalization
const normalizePhone = (phone) => {
  if (!phone) return null;
  
  // Remove all non-digit characters except leading +
  let normalized = phone.replace(/[^\d+]/g, '');
  
  // Ensure international format
  if (normalized.startsWith('00')) {
    normalized = '+' + normalized.substring(2);
  } else if (normalized.match(/^[1-9]/)) {
    normalized = '+' + normalized;
  }
  
  return normalized;
};

// Calculate OTP expiration time
const getOTPExpiry = () => {
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + OTP_CONFIG.expiryMinutes);
  return expiresAt;
};

module.exports = {
  OTP_CONFIG,
  isValidPhone,
  generateOTP,
  sendSMS,
  sendSMSViaHTTP,
  normalizePhone,
  getOTPExpiry
};








