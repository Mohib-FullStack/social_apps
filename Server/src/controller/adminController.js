const User = require("../models/userModel");

// controller/adminController.js
const handleProcessAlert = async (req, res) => {
    try {
      const { alertId, action } = req.body;
      const alert = await AdminAlert.findByPk(alertId);
  
      if (!alert) {
        return errorResponse(res, 'Alert not found', 404);
      }
  
      const user = await User.findByPk(alert.userId);
      if (!user) {
        return errorResponse(res, 'User not found', 404);
      }
  
      if (action === 'approve') {
        switch (alert.type) {
          case 'gender_change':
            await user.update({
              gender: alert.details.newGender,
              lastGenderChange: new Date()
            });
            break;
          // Handle other alert types...
        }
      }
  
      await alert.update({ status: action });
  
      return successResponse(res, `Alert ${action}d successfully`);
    } catch (error) {
      return errorResponse(res, 'Failed to process alert', 500);
    }
  };


  module.exports = handleProcessAlert