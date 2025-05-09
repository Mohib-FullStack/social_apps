const { errorResponse } = require('../controller/responseController');
const { Op } = require('sequelize');
const User = require('../models/userModel'); // Make sure to import your User model


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

module.exports = { validateGender, checkChangeEligibility };


// const { errorResponse } = require('../controller/responseController');
// const { Op } = require('sequelize');

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

// const checkChangeEligibility = async (req, res, next) => {
//   try {
//     const user = await req.user.reload({
//       attributes: ['gender', 'lastGenderChange', 'genderChangeCount']
//     });

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

// module.exports = { validateGender, checkChangeEligibility };