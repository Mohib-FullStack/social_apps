// src/models/associations/groups.js
module.exports = (db, CASCADE, SET_NULL) => {
  const { User, Group, GroupMember, Post } = db;

  Group.belongsTo(User, { foreignKey: 'creatorId', as: 'creator', ...CASCADE });
  User.hasMany(Group, { foreignKey: 'creatorId', as: 'createdGroups', ...CASCADE });

  Group.belongsToMany(User, {
    through: { model: GroupMember, unique: true, scope: { status: 'active' } },
    foreignKey: 'groupId',
    as: 'members',
    ...CASCADE
  });

  User.belongsToMany(Group, {
    through: GroupMember,
    foreignKey: 'userId',
    as: 'groups',
    ...CASCADE
  });

  Group.hasMany(Post, { foreignKey: 'groupId', as: 'posts', ...CASCADE });
  Post.belongsTo(Group, { foreignKey: 'groupId', as: 'group', ...SET_NULL });
};