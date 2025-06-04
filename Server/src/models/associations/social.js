// ===================== src/models/associations/social.js =====================
module.exports = (db, CASCADE, SET_NULL) => {
  const { User, Friendship, UserFollows } = db;

  User.belongsToMany(User, {
    through: Friendship,
    as: 'friends',
    foreignKey: 'userId',
    otherKey: 'friendId',
    ...CASCADE,
  });

  User.belongsToMany(User, {
    through: Friendship,
    as: 'friendOf',
    foreignKey: 'friendId',
    otherKey: 'userId',
    ...CASCADE,
  });

  User.hasMany(Friendship, { foreignKey: 'userId', as: 'sentFriendRequests', ...CASCADE });
  User.hasMany(Friendship, { foreignKey: 'friendId', as: 'receivedFriendRequests', ...CASCADE });
  User.hasMany(Friendship, { foreignKey: 'actionUserId', as: 'friendshipActions', ...SET_NULL });

  Friendship.belongsTo(User, { as: 'requester', foreignKey: 'userId', ...CASCADE });
  Friendship.belongsTo(User, { as: 'requested', foreignKey: 'friendId', ...CASCADE });
  Friendship.belongsTo(User, { as: 'actionUser', foreignKey: 'actionUserId', ...SET_NULL });

  User.belongsToMany(User, {
    as: 'following',
    through: UserFollows,
    foreignKey: 'followerId',
    otherKey: 'followingId',
    ...CASCADE,
  });

  User.belongsToMany(User, {
    as: 'followers',
    through: UserFollows,
    foreignKey: 'followingId',
    otherKey: 'followerId',
    ...CASCADE,
  });
};