// src/models/associations.js
const User = require('./userModel');
const Post = require('./postModel');
const Comment = require('./commentModel');
const Media = require('./mediaModel');
const Like = require('./likeModel');
const Notification = require('./notificationModel');
const UserFollows = require('./userFollowsModel');
const Group = require('./groupModel');
const GroupMember = require('./groupMemberModel');
const AdminAlert = require('./adminAlertModel');
const PendingGenderChange = require('./pendingGenderChangeModel');
const TempPhoneUpdate = require('./tempPhoneUpdateModel');
const VerificationDocument = require('./verificationDocumentModel');
const TempGenderVerification = require('./tempGenderVerificationModel');
const Chat = require('./chatModel');
const Message = require('./messageModel');
const ChatParticipant = require('./chatParticipantModel');
const Friendship = require('./friendshipModel');

// Association configuration constants
const CASCADE = { onDelete: 'CASCADE', onUpdate: 'CASCADE' };
const SET_NULL = { onDelete: 'SET NULL', onUpdate: 'CASCADE' };

// ==================== 1. CORE CONTENT RELATIONSHIPS ====================

// User-Post relationships
User.hasMany(Post, { foreignKey: 'userId', ...CASCADE });
Post.belongsTo(User, { foreignKey: 'userId', ...CASCADE });

// Post-Comment relationships
Post.hasMany(Comment, { foreignKey: 'postId', ...CASCADE });
Comment.belongsTo(Post, { foreignKey: 'postId', ...CASCADE });

// Comment nesting
Comment.belongsTo(Comment, { foreignKey: 'parentId', as: 'parent', ...SET_NULL });
Comment.hasMany(Comment, { foreignKey: 'parentId', as: 'replies', ...CASCADE });

// Post-Media relationships
Post.hasMany(Media, { foreignKey: 'postId', ...CASCADE });
Media.belongsTo(Post, { foreignKey: 'postId', ...CASCADE });

// Content-Like relationships
Post.hasMany(Like, { foreignKey: 'postId', ...CASCADE });
Comment.hasMany(Like, { foreignKey: 'commentId', ...CASCADE });
Like.belongsTo(Post, { foreignKey: 'postId', ...CASCADE });
Like.belongsTo(Comment, { foreignKey: 'commentId', ...CASCADE });
Like.belongsTo(User, { foreignKey: 'userId', ...CASCADE });

// ==================== 2. SIMPLIFIED FRIENDSHIP SYSTEM ====================

// Friendship associations (simplified bidirectional)
User.belongsToMany(User, {
  through: Friendship,
  as: 'friends',
  foreignKey: 'userId',
  otherKey: 'friendId',
  ...CASCADE
});

// Friendship model relationships
Friendship.belongsTo(User, { as: 'requester', foreignKey: 'userId', ...CASCADE });
Friendship.belongsTo(User, { as: 'recipient', foreignKey: 'friendId', ...CASCADE });

// ==================== 3. FOLLOW SYSTEM ====================

User.belongsToMany(User, {
  through: UserFollows,
  as: 'following',
  foreignKey: 'followerId',
  otherKey: 'followingId',
  ...CASCADE
});

User.belongsToMany(User, {
  through: UserFollows,
  as: 'followers',
  foreignKey: 'followingId',
  otherKey: 'followerId',
  ...CASCADE
});

// ==================== 4. GROUP SYSTEM ====================

// Group ownership
User.hasMany(Group, { foreignKey: 'creatorId', ...CASCADE });
Group.belongsTo(User, { foreignKey: 'creatorId', as: 'creator', ...CASCADE });

// Group membership
User.belongsToMany(Group, { through: GroupMember, ...CASCADE });
Group.belongsToMany(User, { through: GroupMember, as: 'members', ...CASCADE });

// Group posts
Group.hasMany(Post, { foreignKey: 'groupId', ...CASCADE });
Post.belongsTo(Group, { foreignKey: 'groupId', ...SET_NULL });

// ==================== 5. VERIFICATION SYSTEM ====================

User.hasMany(VerificationDocument, { foreignKey: 'userId', ...CASCADE });
VerificationDocument.belongsTo(User, { foreignKey: 'userId', ...CASCADE });
VerificationDocument.belongsTo(User, { foreignKey: 'reviewedBy', ...SET_NULL });

// Phone verification
User.hasMany(TempPhoneUpdate, { foreignKey: 'userId', ...CASCADE });
TempPhoneUpdate.belongsTo(User, { foreignKey: 'userId', ...CASCADE });

// ==================== 6. GENDER VERIFICATION ====================

User.hasMany(PendingGenderChange, { foreignKey: 'userId', ...CASCADE });
PendingGenderChange.belongsTo(User, { foreignKey: 'userId', as: 'requester', ...CASCADE });
PendingGenderChange.belongsTo(User, { foreignKey: 'reviewedBy', ...SET_NULL });

PendingGenderChange.hasOne(TempGenderVerification, { 
  foreignKey: 'pendingChangeId', 
  ...CASCADE 
});
TempGenderVerification.belongsTo(PendingGenderChange, { 
  foreignKey: 'pendingChangeId', 
  ...CASCADE 
});

// ==================== 7. NOTIFICATION SYSTEM ====================

User.hasMany(Notification, { foreignKey: 'userId', as: 'notifications', ...CASCADE });
Notification.belongsTo(User, { foreignKey: 'userId', as: 'recipient', ...CASCADE });
Notification.belongsTo(User, { foreignKey: 'senderId', as: 'sender', ...CASCADE });

// Notification references
Notification.belongsTo(Post, { foreignKey: 'postId', ...SET_NULL });
Notification.belongsTo(Comment, { foreignKey: 'commentId', ...SET_NULL });
Notification.belongsTo(Group, { foreignKey: 'groupId', ...SET_NULL });
Notification.belongsTo(Friendship, { foreignKey: 'friendshipId', ...SET_NULL });

// ==================== 8. MESSAGING SYSTEM ====================

// Chat basics
Chat.hasMany(Message, { foreignKey: 'chatId', ...CASCADE });
Message.belongsTo(Chat, { foreignKey: 'chatId', ...CASCADE });

// Message senders/receivers
Message.belongsTo(User, { foreignKey: 'senderId', as: 'sender', ...CASCADE });
Message.belongsTo(User, { foreignKey: 'receiverId', as: 'receiver', ...CASCADE });

// Chat Participants - Refactored for consistency
// User-Chat many-to-many through ChatParticipant
User.belongsToMany(Chat, {
  through: ChatParticipant,
  foreignKey: 'userId',
  otherKey: 'chatId',
  as: 'userChats',
  ...CASCADE
});

Chat.belongsToMany(User, {
  through: ChatParticipant,
  foreignKey: 'chatId',
  otherKey: 'userId',
  as: 'chatUsers',
  ...CASCADE
});

// Direct relationships with ChatParticipant
User.hasMany(ChatParticipant, { 
  foreignKey: 'userId',
  as: 'participations',
  ...CASCADE 
});

Chat.hasMany(ChatParticipant, { 
  foreignKey: 'chatId',
  as: 'participantsInfo',
  ...CASCADE 
});

ChatParticipant.belongsTo(User, { 
  foreignKey: 'userId',
  ...CASCADE 
});

ChatParticipant.belongsTo(Chat, { 
  foreignKey: 'chatId',
  ...CASCADE 
});

module.exports = {
  User,
  Post,
  Comment,
  Media,
  Like,
  Friendship,
  UserFollows,
  Group,
  GroupMember,
  Notification,
  AdminAlert,
  PendingGenderChange,
  TempPhoneUpdate,
  VerificationDocument,
  TempGenderVerification,
  Chat,
  Message,
  ChatParticipant
};













































































