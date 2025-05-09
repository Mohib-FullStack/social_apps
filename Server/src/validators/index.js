//! validators/index.js
const { validationResult } = require("express-validator");
const runValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log("Validation Errors:", errors.array()); // Log errors for debugging
    return res.status(400).json({
      success: false,
      message: "Validation failed. Please correct the errors and try again.",
      errors: errors.array().map((err) => ({
        field: err.param,
        message: err.msg,
      })),
    });
  }
  next();
};

module.exports = runValidation;

