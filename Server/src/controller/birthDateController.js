// controller/birthDateController.js
/**************************************
 *           BIRTH DATE CONTROLLER        *
 **************************************/
const createError = require('http-errors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Sequelize } = require('sequelize');
const sequelize = require('../config/database'); // Import the initialized instance
const { Op } = require('sequelize');
const fs = require('fs').promises;
const emailWithNodeMailer = require('../helper/email');
const { clientURL, jwtResetPasswordKey, jwtActivationkey } = require('../secret');
const { successResponse, errorResponse } = require('./responseController');
const User = require('../models/userModel');
const cloudinary = require('../config/cloudinary');
const { deleteFileFromCloudinary } = require('../helper/cloudinaryHelper');
const { createJSONWebToken } = require('../helper/jsonwebtoken');
const { checkUserExist } = require('../helper/checkUserExist');
const path = require('path');



//! BirthDate Update with ID Verification
const handleUpdateBirthDate = async (req, res) => {
    try {
      const { birthDate, documentFront, documentBack } = req.body;
      const user = await User.findByPk(req.user.id);
  
      // Validate date format
      if (!isValidDate(birthDate)) {
        return errorResponse(res, 'Invalid date format', 400);
      }
  
      // Upload documents to Cloudinary
      const [frontResult, backResult] = await Promise.all([
        cloudinary.uploader.upload(documentFront),
        documentBack && cloudinary.uploader.upload(documentBack)
      ]);
  
      // Store document references
      const doc = await VerificationDocument.create({
        userId: user.id,
        documentType: req.body.documentType,
        frontUrl: frontResult.secure_url,
        backUrl: backResult?.secure_url
      });
  
      // Auto-verify with Onfido/Jumio (pseudo-code)
      const verification = await verifyWithOnfido({
        userId: user.id,
        documentId: doc.id,
        birthDateClaim: birthDate
      });
  
      if (verification.success) {
        await user.update({ 
          birthDate,
          verificationDocuments: {
            ...user.verificationDocuments,
            birthDate: doc.id 
          }
        });
        return successResponse(res, 'Birthdate updated successfully');
      } else {
        await AdminAlert.create({
          type: 'birthdate_change',
          userId: user.id,
          details: { verificationError: verification.error }
        });
        return errorResponse(res, 'Manual verification required', 400);
      }
    } catch (error) {
      return errorResponse(res, 'Birthdate update failed', 500);
    }
  };
  

  module.exports = {handleUpdateBirthDate}