const createError = require('http-errors');
const PendingGenderChange = require('../models/pendingGenderChangeModel');
const { Op } = require('sequelize');
const { successResponse, errorResponse } = require('./responseController');
const { createJSONWebToken } = require('../helper/jsonwebtoken');
const { jwtActivationkey } = require('../secret');
const { sendVerificationEmail, createPendingChange } = require('../services/genderService');
const sequelize = require('../config/database');
const jwt = require('jsonwebtoken');
const AdminAlert = require('../models/adminAlertModel');
const User = require('../models/userModel');
const { sendGenderVerificationEmail } = require('../helper/sendGenderVerificationEmail');
const { 
  generateOTP, 
  sendSMS,
  getOTPExpiry,
  OTP_CONFIG
} = require('../helper/phoneHelper');
const TempGenderVerification = require('../models/tempGenderVerificationModel');

// Uncomment when you implement notifications
// const { notifyAdmins } = require('../services/notificationService');

// Gender validation middleware
const validateGender = (req, res, next) => {
  const allowedGenders = ['male', 'female', 'other', 'prefer-not-to-say'];
  if (!req.body.gender || !allowedGenders.includes(req.body.gender.toLowerCase())) {
    return errorResponse(res, {
      statusCode: 400,
      message: `Invalid gender. Allowed values: ${allowedGenders.join(', ')}`
    });
  }
  req.body.gender = req.body.gender.toLowerCase();
  next();
};

// Change eligibility middleware
const checkChangeEligibility = async (req, res, next) => {
  try {
    // Fetch the user fresh from the database with required attributes
    const user = await User.findByPk(req.user.id, {
      attributes: ['gender', 'lastGenderChange', 'genderChangeCount']
    });

    if (!user) {
      return errorResponse(res, {
        statusCode: 404,
        message: 'User not found'
      });
    }

    // Check 6-month cooldown
    if (user.lastGenderChange) {
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      
      if (user.lastGenderChange > sixMonthsAgo) {
        const nextAllowed = new Date(user.lastGenderChange);
        nextAllowed.setMonth(nextAllowed.getMonth() + 6);
        return errorResponse(res, {
          statusCode: 429,
          message: 'Gender can only be changed once every 6 months',
          payload: { nextAllowedChange: nextAllowed.toISOString() }
        });
      }
    }

    // Check max changes (2)
    if (user.genderChangeCount >= 2) {
      return errorResponse(res, {
        statusCode: 403,
        message: 'Maximum gender changes reached. Contact support.'
      });
    }

    next();
  } catch (error) {
    next(error);
  }
};

// Gender update handler
const handleGenderUpdate = async (req, res) => {
  let transaction;
  
  try {
    transaction = await sequelize.transaction();
    const { gender, reason } = req.body;
    const user = await User.findByPk(req.user.id, { 
      transaction,
      attributes: ['id', 'firstName', 'email', 'gender', 'phone']
    });

    if (!user) {
      await transaction.rollback();
      return errorResponse(res, {
        statusCode: 404,
        message: 'User not found'
      });
    }

    // Validate gender input
    if (!['male', 'female', 'other'].includes(gender)) {
      await transaction.rollback();
      return errorResponse(res, {
        statusCode: 400,
        message: 'Invalid gender value'
      });
    }

    // Generate token with enhanced payload
    const token = createJSONWebToken(
      {
        userId: user.id,
        currentGender: user.gender,
        newGender: gender,
        requestData: {
          ip: req.ip,
          userAgent: req.headers['user-agent'],
          timestamp: Date.now()
        }
      },
      jwtActivationkey,
      '24h'
    );

    // Create pending record with all fields
    const pendingChange = await PendingGenderChange.create({
      userId: user.id,
      requestedGender: gender,
      currentGender: user.gender,
      verificationToken: token,
      isEmailVerified: false,
      reason: reason || null,
      requestIP: req.ip,
      userAgent: req.headers['user-agent'],
      status: 'pending',
      supportingDocuments: req.body.supportingDocuments || null
    }, { transaction });

    // Send email using dedicated service
    await sendGenderVerificationEmail(
      {
        firstName: user.firstName,
        email: user.email,
        gender: user.gender
      },
      gender,
      token,
      {
        ip: req.ip,
        userAgent: req.headers['user-agent'],
        requestId: pendingChange.id
      }
    );

    await transaction.commit();

    // Prepare response
    const response = {
      success: true,
      message: 'Verification email sent. Please check your email.',
      payload: {
        requestId: pendingChange.id,
        expiresIn: '24 hours',
        note: 'You must verify your email before the request can be processed',
        hasPhone: !!user.phone // Indicate if user can use OTP verification
      }
    };

    // Include testing information in development environment
    if (process.env.NODE_ENV === 'development') {
      response.payload.testingToken = token;
      response.payload.testingVerifyUrl = `${process.env.CLIENT_URL}/api/gender/verify-gender/${token}`;
      response.payload.debug = {
        userId: user.id,
        currentGender: user.gender,
        requestedGender: gender
      };
    }

    return successResponse(res, response);

  } catch (error) {
    if (transaction) await transaction.rollback();
    console.error('Gender update error:', error);
    
    // Handle specific error cases
    let statusCode = 500;
    let message = 'Failed to process gender change request';
    
    if (error.name === 'SequelizeValidationError') {
      statusCode = 400;
      message = 'Validation error';
    } else if (error.name === 'JsonWebTokenError') {
      statusCode = 500;
      message = 'Token generation failed';
    }

    return errorResponse(res, {
      statusCode,
      message,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      ...(error.errors && { details: error.errors })
    });
  }
};

// Email verification handler
const handleEmailVerification = async (req, res, next) => {
  const transaction = await sequelize.transaction();
  try {
    const { token } = req.body;
    const { action } = req.query;
    
    // Enhanced input validation
    if (!token || typeof token !== 'string') {
      await transaction.rollback();
      return errorResponse(res, {
        statusCode: 400,
        message: 'Token is required in request body and must be a string'
      });
    }

    // Verify JWT token if present
    let decoded;
    try {
      decoded = jwt.verify(token, jwtActivationkey);
      console.debug('Decoded token:', decoded);
    } catch (jwtError) {
      await transaction.rollback();
      if (jwtError.name === 'TokenExpiredError') {
        return errorResponse(res, {
          statusCode: 401,
          message: 'Verification token has expired'
        });
      }
      if (jwtError.name === 'JsonWebTokenError') {
        return errorResponse(res, {
          statusCode: 400,
          message: 'Invalid token format or signature'
        });
      }
      throw jwtError;
    }

    // Find pending request with user details
    const pending = await PendingGenderChange.findOne({
      where: { verificationToken: token },
      include: [{
        model: User,
        as: 'requestingUser',
        attributes: ['id', 'gender', 'email', 'firstName', 'phone']
      }],
      transaction
    });

    if (!pending) {
      await transaction.rollback();
      return errorResponse(res, {
        statusCode: 404,
        message: 'Invalid or expired token'
      });
    }

    // Handle already verified case
    if (pending.isEmailVerified) {
      await transaction.rollback();
      return errorResponse(res, {
        statusCode: 400,
        message: 'This request has already been verified'
      });
    }

    // Handle rejection case
    if (action === 'reject') {
      await pending.update({ 
        status: 'rejected',
        reason: 'User cancelled the request'
      }, { transaction });
      
      await transaction.commit();
      return successResponse(res, { 
        message: 'Request cancelled successfully',
        payload: { requestId: pending.id }
      });
    }

    // Update email verification status
    await pending.update({ 
      isEmailVerified: true
    }, { transaction });

    // Handle OTP flow for users with phone numbers
    if (pending.requestingUser.phone) {
      const otp = generateOTP();
      const expiresAt = getOTPExpiry();

      // In development, skip actual SMS
      if (process.env.NODE_ENV === 'development') {
        await TempGenderVerification.create({
          userId: pending.userId,
          pendingChangeId: pending.id,
          otp,
          expiresAt,
          attempts: 0
        }, { transaction });

        await pending.update({
          status: 'otp_pending'
        }, { transaction });

        await transaction.commit();
        
        return successResponse(res, {
          statusCode: 200,
          message: 'Email verified. OTP generated (development mode).',
          payload: { 
            requestId: pending.id,
            debugOtp: otp,
            expiresIn: OTP_CONFIG.expiryMinutes + ' minutes'
          }
        });
      }

      // In production, send actual SMS
      const smsResult = await sendSMS(
        pending.requestingUser.phone,
        `Your ${process.env.APP_NAME || 'App'} gender change verification code: ${otp}\nValid for ${OTP_CONFIG.expiryMinutes} minutes.`
      );

      if (!smsResult.success) {
        await transaction.rollback();
        return errorResponse(res, {
          statusCode: 500,
          message: 'Failed to send OTP'
        });
      }

      // Save OTP record
      await TempGenderVerification.create({
        userId: pending.userId,
        pendingChangeId: pending.id,
        otp,
        expiresAt,
        attempts: 0
      }, { transaction });

      await pending.update({
        status: 'otp_pending'
      }, { transaction });

      await transaction.commit();

      return successResponse(res, {
        statusCode: 200,
        message: 'Email verified. OTP sent to your registered phone number.',
        payload: { 
          requestId: pending.id,
          expiresIn: OTP_CONFIG.expiryMinutes + ' minutes'
        }
      });
    }

    // For users without phone numbers, create admin alert immediately
    const alertDetails = {
      alertMessage: `Gender change request from ${pending.requestingUser.firstName} (${pending.currentGender} → ${pending.requestedGender})`,
      oldGender: pending.currentGender,
      newGender: pending.requestedGender,
      userEmail: pending.requestingUser.email,
      requestData: {
        ip: pending.requestIP,
        device: pending.userAgent,
        requestedAt: pending.createdAt
      },
      verification: {
        emailVerified: true,
        verifiedAt: new Date(),
        phoneVerified: false
      }
    };

    const alert = await AdminAlert.create({
      type: 'gender_change',
      userId: pending.userId,
      referenceId: pending.id,
      priority: 'medium',
      details: alertDetails,
      status: 'pending',
      expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000)
    }, { transaction });

    await pending.update({ 
      adminAlertId: alert.id,
      status: 'admin_review'
    }, { transaction });

    await transaction.commit();

    // Send notifications
    try {
      await notifyAdmins({
        alertId: alert.id,
        userId: pending.userId,
        type: 'gender_change',
        priority: 'medium'
      });

      await sendConfirmationEmail(pending.requestingUser.email, {
        requestId: pending.id,
        alertId: alert.id,
        estimatedTime: '48 hours'
      });
    } catch (notificationError) {
      console.error('Notification failed:', notificationError);
    }

    return successResponse(res, {
      statusCode: 200,
      message: 'Email verified. Request is now pending admin approval (typically within 48 hours).',
      payload: { 
        requestId: pending.id,
        alertId: alert.id,
        expiresAt: alert.expiresAt
      }
    });

  } catch (error) {
    await transaction.rollback();
    console.error('Verification error:', error);
    
    // Handle validation errors
    if (error.name === 'SequelizeValidationError') {
      const errors = error.errors.map(err => ({
        field: err.path,
        message: err.message
      }));
      
      return errorResponse(res, {
        statusCode: 400,
        message: 'Validation failed',
        errors
      });
    }

    // Handle status validation errors
    if (error.message.includes('Invalid status value')) {
      return errorResponse(res, {
        statusCode: 400,
        message: 'Invalid request status'
      });
    }
    
    // Generic error handler
    return errorResponse(res, {
      statusCode: 500,
      message: 'Failed to process verification',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Verify OTP for gender change
 */
const verifyGenderOTP = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { otp } = req.body;
    const userId = req.user.id;

    // Validate OTP format
    if (!otp || !/^\d{6}$/.test(otp)) {
      await transaction.rollback();
      return errorResponse(res, {
        statusCode: 400,
        message: 'OTP must be 6 digits'
      });
    }

    // Find pending request with user and OTP info
    const pending = await PendingGenderChange.findOne({
      where: { 
        userId,
        status: 'otp_pending'
      },
      include: [
        {
          model: TempGenderVerification,
          as: 'otpVerification',
          required: true
        },
        {
          model: User,
          as: 'requestingUser',
          attributes: ['email'] // Include user email
        }
      ],
      order: [['createdAt', 'DESC']],
      transaction
    });

    if (!pending) {
      await transaction.rollback();
      return errorResponse(res, {
        statusCode: 404,
        message: 'No pending OTP verification found'
      });
    }

    // Verify OTP
    if (pending.otpVerification.otp !== otp.trim()) {
      await pending.otpVerification.increment('attempts', { transaction });
      
      if (pending.otpVerification.attempts >= OTP_CONFIG.maxAttempts) {
        await pending.update({ status: 'rejected' }, { transaction });
        await pending.otpVerification.destroy({ transaction });
        await transaction.commit();
        return errorResponse(res, {
          statusCode: 429,
          message: 'Too many attempts. Request rejected.'
        });
      }
      
      await transaction.commit();
      return errorResponse(res, {
        statusCode: 401,
        message: 'Invalid OTP'
      });
    }

    // Create admin alert with all required fields
    const alert = await AdminAlert.create({
      type: 'gender_change',
      userId,
      referenceId: pending.id,
      details: {
        alertMessage: `Gender change request from ${pending.currentGender} to ${pending.requestedGender}`,
        oldGender: pending.currentGender,
        newGender: pending.requestedGender,
        userEmail: pending.requestingUser.email, // Include user email
        requestData: {
          ip: pending.requestIP,
          device: pending.userAgent,
          requestedAt: pending.createdAt
        }
      },
      status: 'pending',
      expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000) // 48 hours
    }, { transaction });

    // Update request status
    await pending.update({
      status: 'admin_review',
      adminAlertId: alert.id
    }, { transaction });

    // Cleanup OTP record
    await pending.otpVerification.destroy({ transaction });
    await transaction.commit();

    return successResponse(res, {
      message: 'OTP verified. Request is now pending admin approval.'
    });

  } catch (error) {
    await transaction.rollback();
    console.error('OTP verification error:', {
      error: error.message,
      userId: req.user?.id,
      timestamp: new Date().toISOString()
    });
    return errorResponse(res, {
      statusCode: 500,
      message: 'Failed to verify OTP',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};





// Admin approval handler
const handleAdminApproval = async (req, res, next) => {
  const transaction = await sequelize.transaction();
  try {
    const { alertId } = req.params;
    const { action, reason } = req.body;

    const alert = await AdminAlert.findByPk(alertId, {
      include: [
        {
          model: PendingGenderChange,
          include: [{
            model: User,
            as: 'requestingUser'
          }]
        },
        {
          model: User,
          as: 'reviewingAdmin'
        }
      ],
      transaction
    });

    if (!alert) throw createError(404, 'Approval request not found');

    // Update status
    await alert.update({
      status: action === 'approve' ? 'approved' : 'rejected',
      reviewedBy: req.admin.id,
      reviewedAt: new Date(),
      reviewNotes: reason
    }, { transaction });

    if (action === 'approve') {
      await User.update({
        gender: alert.PendingGenderChange.requestedGender,
        lastGenderChange: new Date(),
        genderChangeCount: sequelize.literal('"genderChangeCount" + 1')
      }, {
        where: { id: alert.userId },
        transaction
      });
    }

    // Cleanup
    await PendingGenderChange.destroy({
      where: { id: alert.PendingGenderChange.id },
      transaction
    });

    await transaction.commit();

    return successResponse(res, {
      message: `Gender change ${action}d`,
      payload: action === 'approve' ? { 
        newGender: alert.PendingGenderChange.requestedGender 
      } : null
    });

  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

module.exports = {
  validateGender,
  checkChangeEligibility,
  handleGenderUpdate,
  handleEmailVerification,
  verifyGenderOTP,
  handleAdminApproval
};









//! running
// const createError = require('http-errors');
// const PendingGenderChange = require('../models/pendingGenderChangeModel');
// const { Op } = require('sequelize');
// const { successResponse, errorResponse } = require('./responseController');
// const { createJSONWebToken } = require('../helper/jsonwebtoken');
// const { jwtActivationkey } = require('../secret');
// const { sendVerificationEmail, createPendingChange } = require('../services/genderService');
// const sequelize = require('../config/database');
// const jwt = require('jsonwebtoken');
// const AdminAlert = require('../models/adminAlertModel');
// const User = require('../models/userModel');
// const { sendGenderVerificationEmail } = require('../helper/sendGenderVerificationEmail');


// // Uncomment when you implement notifications
// // const { notifyAdmins } = require('../services/notificationService');

// // Gender validation middleware
// const validateGender = (req, res, next) => {
//   const allowedGenders = ['male', 'female', 'other', 'prefer-not-to-say'];
//   if (!req.body.gender || !allowedGenders.includes(req.body.gender.toLowerCase())) {
//     return errorResponse(res, {
//       statusCode: 400,
//       message: `Invalid gender. Allowed values: ${allowedGenders.join(', ')}`
//     });
//   }
//   req.body.gender = req.body.gender.toLowerCase();
//   next();
// };

// // Change eligibility middleware
// const checkChangeEligibility = async (req, res, next) => {
//   try {
//     // Fetch the user fresh from the database with required attributes
//     const user = await User.findByPk(req.user.id, {
//       attributes: ['gender', 'lastGenderChange', 'genderChangeCount']
//     });

//     if (!user) {
//       return errorResponse(res, {
//         statusCode: 404,
//         message: 'User not found'
//       });
//     }

//     // Check 6-month cooldown
//     if (user.lastGenderChange) {
//       const sixMonthsAgo = new Date();
//       sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      
//       if (user.lastGenderChange > sixMonthsAgo) {
//         const nextAllowed = new Date(user.lastGenderChange);
//         nextAllowed.setMonth(nextAllowed.getMonth() + 6);
//         return errorResponse(res, {
//           statusCode: 429,
//           message: 'Gender can only be changed once every 6 months',
//           payload: { nextAllowedChange: nextAllowed.toISOString() }
//         });
//       }
//     }

//     // Check max changes (2)
//     if (user.genderChangeCount >= 2) {
//       return errorResponse(res, {
//         statusCode: 403,
//         message: 'Maximum gender changes reached. Contact support.'
//       });
//     }

//     next();
//   } catch (error) {
//     next(error);
//   }
// };

// // Gender update handler
// const handleGenderUpdate = async (req, res) => {
//   let transaction;
  
//   try {
//     transaction = await sequelize.transaction();
//     const { gender, reason } = req.body;
//     const user = await User.findByPk(req.user.id, { 
//       transaction,
//       attributes: ['id', 'firstName', 'email', 'gender']
//     });

//     if (!user) {
//       await transaction.rollback();
//       return res.status(404).json({ 
//         success: false, 
//         message: 'User not found' 
//       });
//     }

//     // Validate gender input
//     if (!['male', 'female', 'other'].includes(gender)) {
//       await transaction.rollback();
//       return res.status(400).json({
//         success: false,
//         message: 'Invalid gender value'
//       });
//     }

//     // Generate token with enhanced payload
//     const token = createJSONWebToken(
//       {
//         userId: user.id,
//         currentGender: user.gender,
//         newGender: gender,
//         requestData: {
//           ip: req.ip,
//           userAgent: req.headers['user-agent'],
//           timestamp: Date.now()
//         }
//       },
//       jwtActivationkey,
//       '24h'
//     );

//     // Create pending record with all fields
//     const pendingChange = await PendingGenderChange.create({
//       userId: user.id,
//       requestedGender: gender,
//       currentGender: user.gender,
//       verificationToken: token,
//       isEmailVerified: false,
//       reason: reason || null,
//       requestIP: req.ip,
//       userAgent: req.headers['user-agent'],
//       status: 'pending',
//       supportingDocuments: req.body.supportingDocuments || null
//     }, { transaction });

//     // Send email using dedicated service
//     await sendGenderVerificationEmail(
//       {
//         firstName: user.firstName,
//         email: user.email,
//         gender: user.gender
//       },
//       gender,
//       token,
//       {
//         ip: req.ip,
//         userAgent: req.headers['user-agent'],
//         requestId: pendingChange.id
//       }
//     );

//     await transaction.commit();

//     // Prepare response
//     const response = {
//       success: true,
//       message: 'Verification email sent. Please check your email.',
//       payload: {
//         requestId: pendingChange.id,
//         expiresIn: '24 hours',
//         note: 'You must verify your email before the request can be processed'
//       }
//     };

//     // Include testing information in development environment
//     if (process.env.NODE_ENV === 'development') {
//       response.payload.testingToken = token;
//       response.payload.testingVerifyUrl = `${process.env.CLIENT_URL}/api/gender/verify-gender/${token}`;
//       response.payload.debug = {
//         userId: user.id,
//         currentGender: user.gender,
//         requestedGender: gender
//       };
//     }

//     return res.status(202).json(response);

//   } catch (error) {
//     if (transaction) await transaction.rollback();
//     console.error('Gender update error:', error);
    
//     // Handle specific error cases
//     let statusCode = 500;
//     let message = 'Failed to process gender change request';
    
//     if (error.name === 'SequelizeValidationError') {
//       statusCode = 400;
//       message = 'Validation error';
//     } else if (error.name === 'JsonWebTokenError') {
//       statusCode = 500;
//       message = 'Token generation failed';
//     }

//     return res.status(statusCode).json({
//       success: false,
//       message,
//       error: process.env.NODE_ENV === 'development' ? error.message : undefined,
//       ...(error.errors && { details: error.errors })
//     });
//   }
// };



// // Email verification handler
// const handleEmailVerification = async (req, res, next) => {
//   const transaction = await sequelize.transaction();
//   try {
//     const { token } = req.body;
//     const { action } = req.query;
    
//     // Enhanced input validation
//     if (!token || typeof token !== 'string') {
//       await transaction.rollback();
//       return errorResponse(res, {
//         statusCode: 400,
//         message: 'Token is required in request body and must be a string'
//       });
//     }

//     // Verify JWT token if present (from updated version)
//     let decoded;
//     try {
//       decoded = jwt.verify(token, jwtActivationkey);
//       console.debug('Decoded token:', decoded); // Debug logging instead of console.log
//     } catch (jwtError) {
//       await transaction.rollback();
//       if (jwtError.name === 'TokenExpiredError') {
//         return errorResponse(res, {
//           statusCode: 401,
//           message: 'Verification token has expired'
//         });
//       }
//       if (jwtError.name === 'JsonWebTokenError') {
//         return errorResponse(res, {
//           statusCode: 400,
//           message: 'Invalid token format or signature'
//         });
//       }
//       throw jwtError;
//     }

//     // Find pending request with comprehensive includes
//     const pending = await PendingGenderChange.findOne({
//       where: { verificationToken: token },
//       include: [{
//         model: User,
//         as: 'requestingUser',
//         attributes: ['id', 'gender', 'email', 'firstName'] // Combined attributes
//       }],
//       transaction
//     });

//     if (!pending) {
//       await transaction.rollback();
//       return errorResponse(res, {
//         statusCode: 404,
//         message: 'Invalid or expired token'
//       });
//     }

//     // Handle already verified case
//     if (pending.isEmailVerified) {
//       await transaction.rollback();
//       return errorResponse(res, {
//         statusCode: 400,
//         message: 'This request has already been verified'
//       });
//     }

//     // Handle rejection case (from updated version)
//     if (action === 'reject') {
//       await pending.update({ 
//         status: 'rejected',
//         reason: 'User cancelled the request'
//       }, { transaction });
      
//       await transaction.commit();
//       return successResponse(res, { 
//         message: 'Request cancelled successfully',
//         payload: { requestId: pending.id }
//       });
//     }

//     // Enhanced alert details (combined from both versions)
//     const alertDetails = {
//       alertMessage: `Gender change request from ${pending.requestingUser.firstName} (${pending.currentGender} → ${pending.requestedGender})`,
//       oldGender: pending.currentGender,
//       newGender: pending.requestedGender,
//       userEmail: pending.requestingUser.email,
//       requestData: {
//         ip: pending.requestIP,
//         device: pending.userAgent,
//         requestedAt: pending.createdAt
//       },
//       // Additional verification info from updated version
//       verification: {
//         emailVerified: true,
//         verifiedAt: new Date()
//       }
//     };

//     // Create admin alert with combined fields
//     const alert = await AdminAlert.create({
//       type: 'gender_change',
//       userId: pending.userId,
//       referenceId: pending.id,
//       priority: 'medium',
//       details: alertDetails,
//       status: 'pending', // Using simple status for alert
//       expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000) // 48 hours
//     }, { transaction });

//     // Update pending request with new status from both versions
//     await pending.update({ 
//       isEmailVerified: true,
//       adminAlertId: alert.id,
//       status: 'admin_review' // Using consistent status value
//     }, { transaction });

//     await transaction.commit();

//     // Add notification system from updated version
//     try {
//       await notifyAdmins({
//         alertId: alert.id,
//         userId: pending.userId,
//         type: 'gender_change',
//         priority: 'medium'
//       });

//       await sendConfirmationEmail(pending.requestingUser.email, {
//         requestId: pending.id,
//         alertId: alert.id,
//         estimatedTime: '48 hours'
//       });
//     } catch (notificationError) {
//       console.error('Notification failed:', notificationError);
//       // Don't fail the request if notifications fail
//     }

//     return successResponse(res, {
//       statusCode: 200,
//       message: 'Email verified. Request is now pending admin approval (typically within 48 hours).',
//       payload: { 
//         requestId: pending.id,
//         alertId: alert.id,
//         expiresAt: alert.expiresAt
//       }
//     });

//   } catch (error) {
//     await transaction.rollback();
//     console.error('Verification error:', error);
    
//     // Handle validation errors
//     if (error.name === 'SequelizeValidationError') {
//       const errors = error.errors.map(err => ({
//         field: err.path,
//         message: err.message
//       }));
      
//       return errorResponse(res, {
//         statusCode: 400,
//         message: 'Validation failed',
//         errors
//       });
//     }

//     // Handle status validation errors
//     if (error.message.includes('Invalid status value')) {
//       return errorResponse(res, {
//         statusCode: 400,
//         message: 'Invalid request status'
//       });
//     }
    
//     // Generic error handler
//     return errorResponse(res, {
//       statusCode: 500,
//       message: 'Failed to process verification',
//       error: process.env.NODE_ENV === 'development' ? error.message : undefined
//     });
//   }
// };

// //! Admin approval handler
// const handleAdminApproval = async (req, res, next) => {
//   const transaction = await sequelize.transaction();
//   try {
//     const { alertId } = req.params;
//     const { action, reason } = req.body;

//     const alert = await AdminAlert.findByPk(alertId, {
//       include: [
//         {
//           model: PendingGenderChange,
//           include: [{
//             model: User,
//             as: 'requestingUser'
//           }]
//         },
//         {
//           model: User,
//           as: 'reviewingAdmin'
//         }
//       ],
//       transaction
//     });

//     if (!alert) throw createError(404, 'Approval request not found');

//     // Update status
//     await alert.update({
//       status: action === 'approve' ? 'approved' : 'rejected',
//       reviewedBy: req.admin.id,
//       reviewedAt: new Date(),
//       reviewNotes: reason
//     }, { transaction });

//     if (action === 'approve') {
//       await User.update({
//         gender: alert.PendingGenderChange.requestedGender,
//         lastGenderChange: new Date(),
//         genderChangeCount: sequelize.literal('"genderChangeCount" + 1')
//       }, {
//         where: { id: alert.userId },
//         transaction
//       });
//     }

//     // Cleanup
//     await PendingGenderChange.destroy({
//       where: { id: alert.PendingGenderChange.id },
//       transaction
//     });

//     await transaction.commit();

//     return successResponse(res, {
//       message: `Gender change ${action}d`,
//       payload: action === 'approve' ? { 
//         newGender: alert.PendingGenderChange.requestedGender 
//       } : null
//     });

//   } catch (error) {
//     await transaction.rollback();
//     next(error);
//   }
// };



// module.exports = {
//   validateGender,
//   checkChangeEligibility,
//   handleGenderUpdate,
//   handleEmailVerification,
//   handleAdminApproval
// };





