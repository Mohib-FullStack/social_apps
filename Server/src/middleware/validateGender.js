// src/middleware/validateGender
const validateGender = (req, res, next) => {
    const { gender } = req.body;
    const allowedGenders = ['male', 'female', 'other', 'prefer-not-to-say'];
  
    if (!gender || !allowedGenders.includes(gender.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: `Invalid gender. Allowed values: ${allowedGenders.join(', ')}`
      });
    }
  
    // Normalize case
    req.body.gender = gender.toLowerCase();
    next();
  };


  module.exports = validateGender
  



