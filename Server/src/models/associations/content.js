// ===================== src/models/associations/content.js =====================
module.exports = (db, CASCADE, SET_NULL) => {
  const { User, Post, Comment, Media, Like } = db;

  User.hasMany(Post, { foreignKey: 'userId', as: 'posts', ...CASCADE });
  Post.belongsTo(User, { foreignKey: 'userId', as: 'user', ...CASCADE });

  Post.hasMany(Comment, { foreignKey: 'postId', as: 'comments', ...CASCADE });
  Comment.belongsTo(Post, { foreignKey: 'postId', as: 'post', ...CASCADE });

  Comment.belongsTo(Comment, { foreignKey: 'parentId', as: 'parentComment', ...SET_NULL });
  Comment.hasMany(Comment, { foreignKey: 'parentId', as: 'replies', ...CASCADE });

  Post.hasMany(Media, { foreignKey: 'postId', as: 'media', ...CASCADE });
  Media.belongsTo(Post, { foreignKey: 'postId', as: 'post', ...CASCADE });

  Post.hasMany(Like, { foreignKey: 'postId', as: 'likes', ...CASCADE });
  Comment.hasMany(Like, { foreignKey: 'commentId', as: 'likes', ...CASCADE });

  Like.belongsTo(Post, { foreignKey: 'postId', as: 'post', ...CASCADE });
  Like.belongsTo(Comment, { foreignKey: 'commentId', as: 'comment', ...CASCADE });
  Like.belongsTo(User, { foreignKey: 'userId', as: 'user', ...CASCADE });
};