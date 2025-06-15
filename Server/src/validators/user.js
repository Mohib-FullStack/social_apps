// validators/user.js
const { body } = require('express-validator');
const { Op } = require('sequelize');
const { parsePhoneNumber } = require('libphonenumber-js'); // <-- Add this line
const User = require('../models/userModel');
const { checkUserExist } = require('../helper/checkUserExist');

// === Validation Cache (10s TTL) ===
const validationCache = new Map();
const CACHE_TTL = 10000;

const checkUniqueField = async (field, value, excludeId = null) => {
  const cacheKey = `${field}:${value}:${excludeId || ''}`;
  const cached = validationCache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    if (!cached.valid) throw new Error(`${field} is already in use`);
    return true;
  }

  const where = { [field]: value };
  if (excludeId) where.id = { [Op.ne]: excludeId };

  const user = await User.findOne({ where });
  const valid = !user;

  validationCache.set(cacheKey, { valid, timestamp: Date.now() });

  if (!valid) throw new Error(`${field} is already in use`);
  return true;
};

const validateImageField = (fieldName = 'image') =>
  body(fieldName)
    .optional()
    .custom((value, { req }) => {
      if (req.file || value) return true;
      throw new Error(`Invalid ${fieldName}`);
    });

// === Registration ===
const validateRegistration = [
  body('firstName')
    .trim()
    .notEmpty().withMessage('First name is required')
    .isLength({ min: 2, max: 50 }).withMessage('First name must be 2-50 characters')
    .matches(/^[a-zA-ZÀ-ÿ\s-']+$/).withMessage('Only letters and basic punctuation allowed'),

  body('lastName')
    .trim()
    .notEmpty().withMessage('Last name is required')
    .isLength({ min: 2, max: 50 }).withMessage('Last name must be 2-50 characters')
    .matches(/^[a-zA-ZÀ-ÿ\s-']+$/).withMessage('Only letters and basic punctuation allowed'),

  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format')
    .custom(async (value) => {
      if (process.env.REAL_TIME_VALIDATION === 'true') return true;
      const { exists } = await checkUserExist({ email: value });
      if (exists) throw new Error('Email already in use');
      return true;
    }),

  body('password')
    .trim()
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 8, max: 100 }).withMessage('Password must be 8-100 characters')
    .matches(/[A-Z]/).withMessage('Must contain at least one uppercase letter')
    .matches(/[a-z]/).withMessage('Must contain at least one lowercase letter')
    .matches(/\d/).withMessage('Must contain at least one number')
    .matches(/[@$!%*?&]/).withMessage('Must contain at least one special character'),

    body('phone')
    .trim()
    .notEmpty().withMessage('Phone number is required')
    .custom(value => {
      try {
        const phoneNumber = parsePhoneNumber(value);
        if (!phoneNumber || !phoneNumber.isValid()) {
          throw new Error('Please enter a valid international phone number (e.g. +441234567890)');
        }
        return true;
      } catch (e) {
        throw new Error('Invalid format. Include country code (e.g. +1 for US)');
      }
    })
    .custom(value => checkUniqueField('phone', value)),

  validateImageField('profileImage'),

  body('gender')
    .notEmpty().withMessage('Gender is required')
    .isIn(['male', 'female', 'other', 'prefer-not-to-say'])
    .withMessage('Invalid gender selection'),

  body('birthDate')
    .notEmpty().withMessage('Birth date is required')
    .isDate().withMessage('Invalid date format')
    .custom((value) => {
      const birthDate = new Date(value);
      const minDate = new Date(); minDate.setFullYear(minDate.getFullYear() - 120);
      const maxDate = new Date(); maxDate.setFullYear(maxDate.getFullYear() - 13);
      return birthDate >= minDate && birthDate <= maxDate;
    }).withMessage('You must be at least 13 years old and not older than 120 years'),
];

//! === Profile Update ===
const validateProfileUpdate = [
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 }).withMessage('First name must be 2-50 characters')
    .matches(/^[a-zA-ZÀ-ÿ\s-']+$/).withMessage('Only letters and basic punctuation allowed'),

  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 }).withMessage('Last name must be 2-50 characters')
    .matches(/^[a-zA-ZÀ-ÿ\s-']+$/).withMessage('Only letters and basic punctuation allowed'),

  body('email')
    .optional()
    .isEmail().withMessage('Invalid email format')
    .custom(async (value, { req }) => {
      if (value !== req.user.email) {
        const { exists } = await checkUserExist({ email: value });
        if (exists) throw new Error('Email already in use');
      }
      return true;
    }),

    body('phone')
    .trim()
    .notEmpty().withMessage('Phone number is required')
    .custom(value => {
      try {
        const phoneNumber = parsePhoneNumber(value);
        if (!phoneNumber || !phoneNumber.isValid()) {
          throw new Error('Please enter a valid international phone number (e.g. +441234567890)');
        }
        return true;
      } catch (e) {
        throw new Error('Invalid format. Include country code (e.g. +1 for US)');
      }
    })
    .custom(value => checkUniqueField('phone', value)),

  body('bio')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Bio cannot exceed 500 characters'),

  body('website')
    .optional()
    .trim()
    .isURL().withMessage('Invalid website URL')
    .matches(/^https?:\/\//).withMessage('Website must start with http:// or https://'),

  body('gender')
    .notEmpty().withMessage('Gender is required')
    .isIn(['male', 'female', 'other', 'prefer-not-to-say'])
    .withMessage('Invalid gender selection'),

  body('birthDate')
    .notEmpty().withMessage('Birth date is required')
    .isDate().withMessage('Invalid date format')
    .custom((value) => {
      const birthDate = new Date(value);
      const minDate = new Date(); minDate.setFullYear(minDate.getFullYear() - 120);
      const maxDate = new Date(); maxDate.setFullYear(maxDate.getFullYear() - 13);
      return birthDate >= minDate && birthDate <= maxDate;
    }).withMessage('You must be at least 13 years old and not older than 120 years'),

  validateImageField('profileImage'),
  validateImageField('coverImage'),
];

//! === Privacy Settings ===
const validatePrivacySettings = [
  body('privacySettings')
    .exists().withMessage('Privacy settings object is required')
    .isObject().withMessage('Privacy settings must be an object'),

  body('privacySettings.profileVisibility')
    .optional()
    .isIn(['public', 'friends', 'private'])
    .withMessage('Invalid profile visibility setting'),

  body('privacySettings.searchVisibility')
    .optional()
    .isBoolean()
    .withMessage('Search visibility must be true or false'),

  body('privacySettings.activityStatus')
    .optional()
    .isBoolean()
    .withMessage('Activity status must be true or false'),
];

//! === Password Update ===
const validatePasswordUpdate = [
  body('currentPassword')
    .trim()
    .notEmpty().withMessage('Current password is required'),

  body('newPassword')
    .trim()
    .notEmpty().withMessage('New password is required')
    .isLength({ min: 8, max: 100 }).withMessage('Password must be 8-100 characters')
    .matches(/[A-Z]/).withMessage('Must contain at least one uppercase letter')
    .matches(/[a-z]/).withMessage('Must contain at least one lowercase letter')
    .matches(/\d/).withMessage('Must contain at least one number')
    .matches(/[@$!%*?&]/).withMessage('Must contain at least one special character')
    .custom((value, { req }) => value !== req.body.currentPassword)
    .withMessage('New password must be different from current password'),

  body('confirmPassword')
    .trim()
    .notEmpty().withMessage('Please confirm your new password')
    .custom((value, { req }) => value === req.body.newPassword)
    .withMessage('Passwords do not match'),
];

//! === Email Update ===
const validateEmailUpdate = [
  body('newEmail')
    .trim()
    .notEmpty().withMessage('New email is required')
    .isEmail().withMessage('Invalid email format')
    .normalizeEmail()
    .custom((value, { req }) => checkUniqueField('email', value, req.user.id)),

  body('currentPassword')
    .trim()
    .notEmpty().withMessage('Current password is required'),
];

//! === Login ===
// Login validation
const validateLogin = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required. Enter your email address')
    .isEmail()
    .withMessage('Invalid email address'),

  body('password')
    .trim()
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password should be at least 6 characters long')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/
    )
    .withMessage(
      'Password should contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    ),
]

//! === Forgot Password ===
const validateForgotPassword = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format'),
];

//! === Reset Password ===
const validateResetPassword = [
  body('token')
    .trim()
    .notEmpty().withMessage('Token is required'),

  body('password')
    .trim()
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 8, max: 100 }).withMessage('Password must be 8-100 characters')
    .matches(/[A-Z]/).withMessage('Must contain at least one uppercase letter')
    .matches(/[a-z]/).withMessage('Must contain at least one lowercase letter')
    .matches(/\d/).withMessage('Must contain at least one number')
    .matches(/[@$!%*?&]/).withMessage('Must contain at least one special character'),
];

// === Export All Validations ===
module.exports = {
  validateRegistration,
  validateProfileUpdate,
  validatePrivacySettings,
  validatePasswordUpdate,
  validateEmailUpdate,
  validateLogin,
  validateForgotPassword,
  validateResetPassword,
};