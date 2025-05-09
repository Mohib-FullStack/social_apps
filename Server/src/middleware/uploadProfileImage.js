// middleware/uploadProfileImage.js
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const { ALLOWED_FILE_TYPES, MAX_FILE_SIZE } = require('../config');

// Local storage for temporary files during registration
const tempStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, './uploads/images/profile');
    fs.mkdir(uploadDir, { recursive: true }).then(() => {
      cb(null, uploadDir);
    }).catch(err => cb(err));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  if (!ALLOWED_FILE_TYPES.includes(file.mimetype)) {
    return cb(new Error('File type not allowed'), false);
  }
  cb(null, true);
};

// For registration (temporary local storage only)
const uploadProfileImage = multer({
  storage: tempStorage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter
});



module.exports = { uploadProfileImage };


