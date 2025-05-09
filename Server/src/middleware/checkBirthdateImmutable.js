// middleware/checkBirthdateImmutable.js
  
  const checkBirthdateImmutable = async (req, res, next) => {
    if (req.body.birthDate) {
      const user = await User.findByPk(req.user.id);
      if (user.originalBirthDate !== req.body.birthDate) {
        return res.status(403).json({
          success: false,
          message: 'Birthdate changes require ID verification'
        });
      }
    }
    next();
  };



  module.exports = {checkBirthdateImmutable}