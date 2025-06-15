const express = require('express');
const genderRouter = express.Router();
const { isLoggedIn, isAdmin } = require('../middleware/authMiddleware');
const { 
  validateGender, 
  checkChangeEligibility 
} = require('../middleware/genderMiddleware');
const {
  handleGenderUpdate,
  handleEmailVerification,
  handleAdminApproval,
  verifyGenderOTP
} = require('../controller/genderController');

// User routes
genderRouter.put(
  '/gender',
  isLoggedIn,
  validateGender,
  checkChangeEligibility,
  handleGenderUpdate
);

genderRouter.post(
  '/verify-gender', 
  handleEmailVerification
);

// OTP verification routes
genderRouter.post('/verify-gender-otp', isLoggedIn, verifyGenderOTP);

// Admin routes
genderRouter.put(
  '/admin/gender-approval/:alertId',
  isLoggedIn,
  isAdmin,
  handleAdminApproval
);

module.exports = genderRouter;







//! running
// const express = require('express');

// const genderRouter = express.Router();
// const { isLoggedIn, isAdmin } = require('../middleware/authMiddleware');
// const { 
//   validateGender, 
//   checkChangeEligibility 
// } = require('../middleware/genderMiddleware');
// const {
//   handleGenderUpdate,
//   handleEmailVerification,
//   handleAdminApproval
// } = require('../controller/genderController');

// // User routes
// genderRouter.put(
//   '/gender',
//   isLoggedIn,
//   validateGender,
//   checkChangeEligibility,
//   handleGenderUpdate
// );

// genderRouter.post('/verify-gender', handleEmailVerification);

// // Admin routes
// genderRouter.put(
//   '/admin/gender-approval/:alertId',
//   isLoggedIn,
//   isAdmin,
//   handleAdminApproval
// );



// module.exports = genderRouter;
