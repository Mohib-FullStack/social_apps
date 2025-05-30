// middleware/uploadUserImages.js
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const { ALLOWED_FILE_TYPES, MAX_FILE_SIZE } = require('../config');

const storage = multer.diskStorage({
  destination: async function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads/images/users');
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (err) {
      cb(err);
    }
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  if (!ALLOWED_FILE_TYPES.includes(file.mimetype)) {
    return cb(new Error('Only image files are allowed!'), false);
  }
  cb(null, true);
};

const uploadUserImages = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter
}).fields([
  { name: 'profileImage', maxCount: 1 },
  { name: 'coverImage', maxCount: 1 }
]);

module.exports = uploadUserImages;