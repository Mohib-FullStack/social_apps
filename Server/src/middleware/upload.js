// Replace your current upload middleware with this
const upload = multer({
  storage: multer.diskStorage({
    destination: async function (req, file, cb) {
      let uploadDir;
      if (file.fieldname === 'profileImage') {
        uploadDir = path.join(__dirname, '../uploads/images/profile');
      } else if (file.fieldname === 'coverImage') {
        uploadDir = path.join(__dirname, '../uploads/images/cover');
      }
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
      cb(null, `${file.fieldname}-${req.user.id}-${uniqueSuffix}${ext}`);
    }
  }),
  fileFilter: (req, file, cb) => {
    if (!ALLOWED_FILE_TYPES.includes(file.mimetype)) {
      return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
  },
  limits: { fileSize: MAX_FILE_SIZE }
});

module.exports = upload;