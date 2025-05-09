// middleware/checkGenderChange.js

const User = require("../models/userModel");


const checkGenderChangeFrequency = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ['genderChangeCount', 'lastGenderChange']
    });

    if (!user) return errorResponse(res, 'User not found', 404);

    // Check if exceeded max changes
    if (user.genderChangeCount >= 2) {
      return res.status(429).json({
        success: false,
        message: 'Maximum gender changes reached. Contact support for assistance.',
        nextAllowedChange: null // Could add date if implementing appeals
      });
    }

    // Check 6-month cooldown
    if (user.lastGenderChange) {
      const sixMonthsInMs = 6 * 30 * 24 * 60 * 60 * 1000;
      const nextAllowedDate = new Date(user.lastGenderChange.getTime() + sixMonthsInMs);
      
      if (new Date() < nextAllowedDate) {
        return res.status(429).json({
          success: false,
          message: 'Gender can only be changed once every 6 months',
          nextAllowedChange: nextAllowedDate.toISOString()
        });
      }
    }

    next();
  } catch (error) {
    console.error('Gender change middleware error:', error);
    return errorResponse(res, 'System error validating gender change', 500);
  }
};

module.exports = { checkGenderChangeFrequency };