const { Friendship } = require('../models');
const { Op } = require('sequelize');

const validateFriendshipAction = async (req, res, next) => {
  const { id } = req.params;
  
  const friendship = await Friendship.findOne({
    where: {
      id,
      [Op.or]: [
        { userId: req.user.id },
        { friendId: req.user.id }
      ]
    }
  });

  if (!friendship) {
    return res.status(404).json({ error: "Friendship not found or access denied" });
  }

  req.friendship = friendship;
  next();
};

// Update your router to use this middleware:
// friendshipsRouter.delete('/:id', isLoggedIn, validateFriendshipAction, removeFriendship);

module.exports = validateFriendshipAction
