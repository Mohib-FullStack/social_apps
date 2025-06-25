const { body, param } = require('express-validator');
const { FriendshipStatus } = require('../models/friendshipModel');

const validateFriendId = [
  body('friendId')
    .isInt({ min: 1 })
    .withMessage('Invalid friend ID')
    .custom((value, { req }) => {
      if (value === req.user.id) {
        throw new Error('Cannot perform action with yourself');
      }
      return true;
    }),
];

const validateRequestId = [
  param('requestId').isInt({ min: 1 }).withMessage('Invalid request ID'),
];

const validateFriendshipAction = [
  param('requestId').isInt({ min: 1 }),
  body('action')
    .isIn(['accept', 'reject', 'cancel'])
    .withMessage('Invalid action'),
];

const validateBlockAction = [
  body('userId')
    .isInt({ min: 1 })
    .withMessage('Invalid user ID')
    .custom((value, { req }) => {
      if (value === req.user.id) {
        throw new Error('Cannot block yourself');
      }
      return true;
    }),
];

module.exports = {
  validateFriendId,
  validateRequestId,
  validateFriendshipAction,
  validateBlockAction,
};
