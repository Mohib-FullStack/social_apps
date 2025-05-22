const express = require('express');
const {
  handleActivateUser,
  handleGetUsers,
  handleGetUserById,
  handleUpdateUserById,
  handleDeleteUserById,
  handleFetchUserProfile,
  handleProcessRegister,
  handleBanUserById,
  handleUnbanUserById,
  handleUpdatePassword,
  handleForgetPassword,
  handleResetPassword,
  handleFollowUser,
  handleUnfollowUser,
  handleGetFollowers,
  handleGetFollowing,
  handleUpdatePrivacySettings,
  handleGetPublicProfile,
  handleUpdatePrivateProfile,
  handleUpdatePublicProfile,
} = require('../controller/userController');

const { isLoggedIn, isAdmin } = require('../middleware/authMiddleware');
const { singleProfileImage } = require('../middleware/uploadProfileImage');
const  { uploadCoverImage }  = require('../middleware/uploadCoverImage');

const {
  validateRegistration,
  validateForgotPassword,
  validateResetPassword,
  validatePasswordUpdate,
  validatePrivacySettings,
} = require('../validators/user');
const runValidation = require('../validators');
const handleProcessAlert = require('../controller/adminController');

const userRouter = express.Router();

// Registration and Activation
userRouter.post(
  '/process-register',
  // uploadProfileImage.single('profileImage'),
  singleProfileImage,
  validateRegistration,
  runValidation,
  handleProcessRegister
);

userRouter.post('/activate', handleActivateUser);

// Password Management
userRouter.post(
  '/forgot-password',
  validateForgotPassword,
  runValidation,
  handleForgetPassword
);
userRouter.put(
  '/reset-password',
  validateResetPassword,
  runValidation,
  handleResetPassword
);

//! Profile Routes
// userRouter.get('/profile', isLoggedIn, handleFetchUserProfile);

// Add these new routes:


userRouter.get('/profile/public/:id', isLoggedIn, handleGetPublicProfile);
// userRouter.get('/profile/:slug', isLoggedIn, handleGetPublicProfile);
userRouter.get('/profile/me', isLoggedIn, handleFetchUserProfile); // Your existing profile route



// For routes that only need profile image
userRouter.put(
  '/profile/me',
  isLoggedIn,
  singleProfileImage,
  handleUpdatePrivateProfile
);



// For routes that need both
userRouter.put(
  '/profile/public',
  isLoggedIn,
  (req, res, next) => {
    // Handle profile image first
    singleProfileImage(req, res, (err) => {
      if (err) return next(err);
      // Then handle cover image
      uploadCoverImage.singleCoverImage(req, res, next);
    });
  },
  handleUpdatePublicProfile
);


userRouter.put(
  '/privacy-settings',
  isLoggedIn,
  validatePrivacySettings,
  runValidation,
  handleUpdatePrivacySettings
);
userRouter.put(
  '/update-password',
  validatePasswordUpdate,
  runValidation,
  isLoggedIn,
  handleUpdatePassword
);

// Social Features
userRouter.post('/follow/:id', isLoggedIn, handleFollowUser);
userRouter.post('/unfollow/:id', isLoggedIn, handleUnfollowUser);
userRouter.get('/followers/:id', isLoggedIn, handleGetFollowers);
userRouter.get('/following/:id', isLoggedIn, handleGetFollowing);

// Admin Routes
// userRouter.get('/', isLoggedIn, isAdmin, handleGetUsers);
userRouter.get('/', isLoggedIn, handleGetUsers);
userRouter.put('/ban-user/:id', isLoggedIn, isAdmin, handleBanUserById);
userRouter.put('/unban-user/:id', isLoggedIn, isAdmin, handleUnbanUserById);
userRouter.get('/:id', isLoggedIn, isAdmin, handleGetUserById); // Changed - now accessible to logged in users
userRouter.put(
  '/:id',
  isLoggedIn,
  isAdmin,
  // uploadProfileImage.single('profileImage'),
  singleProfileImage,
  handleUpdateUserById
);

userRouter.delete('/:id', isLoggedIn, isAdmin, handleDeleteUserById);

// Admin routes
userRouter.put('/alerts/:id', isLoggedIn, isAdmin, handleProcessAlert);

module.exports = userRouter;
