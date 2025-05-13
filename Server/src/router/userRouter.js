const express = require('express');
const {
  handleActivateUser,
  handleGetUsers,
  handleGetUserById,
  handleUpdateUserById,
  handleDeleteUserById,
  handleFetchUserProfile,
  handleUpdateUserProfile,
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


} = require('../controller/userController');

const { isLoggedIn, isAdmin } = require('../middleware/authMiddleware');
 const { uploadProfileImage} = require('../middleware/uploadProfileImage');

const {
  validateRegistration,
  validateForgotPassword,
  validateResetPassword,
  validatePasswordUpdate,
  validatePrivacySettings
} = require('../validators/user');
const runValidation = require('../validators');
const handleProcessAlert = require('../controller/adminController');




const userRouter = express.Router();


// Registration and Activation
userRouter.post(
  '/process-register',
   uploadProfileImage.single('profileImage'),
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
userRouter.get('/profile', isLoggedIn, handleFetchUserProfile);


userRouter.put(
  '/profile',
  isLoggedIn,
   uploadProfileImage.single('profileImage'),
   handleUpdateUserProfile,
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
userRouter.get('/', isLoggedIn, isAdmin, handleGetUsers);
userRouter.put('/ban-user/:id', isLoggedIn, isAdmin, handleBanUserById);
userRouter.put('/unban-user/:id', isLoggedIn, isAdmin, handleUnbanUserById);
userRouter.get('/:id', isLoggedIn,isAdmin, handleGetUserById); // Changed - now accessible to logged in users
userRouter.put(
  '/:id',
  isLoggedIn,
  isAdmin,
   uploadProfileImage.single('profileImage'),
   handleUpdateUserById
);


userRouter.delete('/:id', isLoggedIn, isAdmin, handleDeleteUserById);



// Admin routes
userRouter.put(
  '/alerts/:id',
  isLoggedIn,
  isAdmin,
  handleProcessAlert
);

module.exports = userRouter;



































