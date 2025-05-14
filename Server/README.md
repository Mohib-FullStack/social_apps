npx sequelize-cli migration:generate --name create-friendships

could you integrate this updated code with existing code

Migration Execution Order
Run these migrations in exactly this order:

#

Sure! Here's a **complete, clean setup** of the `Friendship` model, its controller, and how it integrates with the `associations.js` file in a Sequelize project using a central association handler. This setup assumes you already have a working `User` model.

---

## ✅ Folder Structure (for reference)

```
models/
  ├── index.js
  ├── user.js
  ├── friendship.js
  ├── associations.js
controllers/
  ├── friendshipController.js
routes/
  ├── friendshipRoutes.js
```

---

## 📦 1. `models/friendship.js`

```js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Friendship = sequelize.define(
  'Friendship',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    friendId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('pending', 'accepted', 'rejected', 'blocked'),
      defaultValue: 'pending',
    },
    actionUserId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    acceptedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: 'friendships',
    indexes: [
      {
        unique: true,
        fields: ['userId', 'friendId'],
      },
      { fields: ['userId', 'status'] },
      { fields: ['friendId', 'status'] },
    ],
    hooks: {
      beforeUpdate: async (friendship) => {
        if (friendship.changed('status') && friendship.status === 'accepted') {
          friendship.acceptedAt = new Date();
        }
      },
    },
  }
);

module.exports = Friendship;
```

---

## 👥 2. `models/associations.js`

```js
const User = require('./user');
const Friendship = require('./friendship');

// User -> Friendships
User.hasMany(Friendship, { foreignKey: 'userId', as: 'sentFriendRequests' });
User.hasMany(Friendship, {
  foreignKey: 'friendId',
  as: 'receivedFriendRequests',
});
User.hasMany(Friendship, {
  foreignKey: 'actionUserId',
  as: 'friendshipActions',
});

// Friendship -> Users
Friendship.belongsTo(User, { foreignKey: 'userId', as: 'requester' });
Friendship.belongsTo(User, { foreignKey: 'friendId', as: 'receiver' });
Friendship.belongsTo(User, { foreignKey: 'actionUserId', as: 'actionUser' });

module.exports = {
  User,
  Friendship,
};
```

---

## 🔧 3. `controllers/friendshipController.js`

```js
const { Friendship, User } = require('../models/associations');

// Create a friend request
exports.sendFriendRequest = async (req, res) => {
  const { userId, friendId } = req.body;

  if (userId === friendId) {
    return res.status(400).json({ message: 'You cannot friend yourself.' });
  }

  try {
    const [friendship, created] = await Friendship.findOrCreate({
      where: {
        userId,
        friendId,
      },
      defaults: {
        status: 'pending',
        actionUserId: userId,
      },
    });

    if (!created) {
      return res
        .status(409)
        .json({ message: 'Friend request already exists.' });
    }

    res.status(201).json(friendship);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Accept a friend request
exports.acceptFriendRequest = async (req, res) => {
  const { friendshipId } = req.params;
  const userId = req.body.userId;

  try {
    const friendship = await Friendship.findByPk(friendshipId);

    if (!friendship || friendship.status !== 'pending') {
      return res.status(404).json({ message: 'Pending friendship not found.' });
    }

    friendship.status = 'accepted';
    friendship.actionUserId = userId;

    await friendship.save();
    res.status(200).json(friendship);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Reject a friend request
exports.rejectFriendRequest = async (req, res) => {
  const { friendshipId } = req.params;
  const userId = req.body.userId;

  try {
    const friendship = await Friendship.findByPk(friendshipId);

    if (!friendship || friendship.status !== 'pending') {
      return res.status(404).json({ message: 'Pending friendship not found.' });
    }

    friendship.status = 'rejected';
    friendship.actionUserId = userId;

    await friendship.save();
    res.status(200).json(friendship);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Block a user
exports.blockUser = async (req, res) => {
  const { userId, friendId } = req.body;

  try {
    const [friendship, created] = await Friendship.findOrCreate({
      where: {
        userId,
        friendId,
      },
      defaults: {
        status: 'blocked',
        actionUserId: userId,
      },
    });

    if (!created) {
      friendship.status = 'blocked';
      friendship.actionUserId = userId;
      await friendship.save();
    }

    res.status(200).json(friendship);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all friends (accepted)
exports.getFriends = async (req, res) => {
  const userId = parseInt(req.params.userId);

  try {
    const friendships = await Friendship.findAll({
      where: {
        status: 'accepted',
        [Op.or]: [{ userId }, { friendId: userId }],
      },
      include: [
        { model: User, as: 'requester', attributes: ['id', 'nom', 'prenom'] },
        { model: User, as: 'receiver', attributes: ['id', 'nom', 'prenom'] },
      ],
    });

    const friends = friendships.map((f) => {
      const isRequester = f.userId === userId;
      return isRequester ? f.receiver : f.requester;
    });

    res.status(200).json(friends);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
```

---

## 🌐 4. `routes/friendshipRoutes.js`

```js
const express = require('express');
const router = express.Router();
const friendshipController = require('../controllers/friendshipController');

router.post('/send', friendshipController.sendFriendRequest);
router.post('/accept/:friendshipId', friendshipController.acceptFriendRequest);
router.post('/reject/:friendshipId', friendshipController.rejectFriendRequest);
router.post('/block', friendshipController.blockUser);
router.get('/friends/:userId', friendshipController.getFriends);

module.exports = router;
```

---

## 🧠 5. `models/index.js`

Make sure `associations.js` is imported and executed in your main model loader:

```js
const Sequelize = require('sequelize');
const sequelize = require('../config/database');
const User = require('./user');
const Friendship = require('./friendship');

// This sets up all associations
require('./associations');

module.exports = {
  sequelize,
  Sequelize,
  User,
  Friendship,
};
```

---

## ✅ Final Notes

- You **do not need a `UserBlock` model**, since the `status: 'blocked'` field in `Friendship` covers that use case.
- The associations are well-structured for bi-directional querying of friend relationships.
- This controller handles:

  - Sending
  - Accepting
  - Rejecting
  - Blocking
  - Listing friends

Let me know if you want advanced filters (mutual friends, pagination, etc.) or want to integrate this with a frontend app.
