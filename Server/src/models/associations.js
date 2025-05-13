// src/models/associations.js
const User = require('./userModel');
const Post = require('./postModel');
const Comment = require('./commentModel');
const Media = require('./mediaModel');
const Like = require('./likeModel');

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
User.hasMany(Post, { 
  foreignKey: 'userId',
  as: 'authoredPosts',
  ...CASCADE
});
Post.belongsTo(User, {
  foreignKey: 'userId',
  as: 'author',
  ...CASCADE
});

// Post-Comment relationships
Post.hasMany(Comment, {
  foreignKey: 'postId',
  as: 'comments',
  ...CASCADE
});
Comment.belongsTo(Post, {
  foreignKey: 'postId',
  as: 'post',
  ...CASCADE
});

// Comment nesting
Comment.belongsTo(Comment, {
  foreignKey: 'parentId',
  as: 'parentComment',
  ...CASCADE
});
Comment.hasMany(Comment, {
  foreignKey: 'parentId',
  as: 'replies',
  ...CASCADE
});

// Post-Media relationships
Post.hasMany(Media, {
  foreignKey: 'postId',
  as: 'media',
  ...CASCADE
});
Media.belongsTo(Post, {
  foreignKey: 'postId',
  as: 'post',
  ...CASCADE
});

// Content-Like relationships
Post.hasMany(Like, {
  foreignKey: 'postId',
  as: 'likes',
  ...CASCADE
});
Comment.hasMany(Like, {
  foreignKey: 'commentId',
  as: 'likes',
  ...CASCADE
});
Like.belongsTo(Post, {
  foreignKey: 'postId',
  as: 'post',
  ...CASCADE
});
Like.belongsTo(Comment, {
  foreignKey: 'commentId',
  as: 'comment',
  ...CASCADE
});
Like.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user',
  ...CASCADE
});

// ==================== 2. SOCIAL GRAPH RELATIONSHIPS ====================

// Friendship system
User.belongsToMany(User, {
  as: 'friends',
  through: {
    model: Friendship,
    unique: true,
    scope: {
      status: 'active'
    }
  },
  foreignKey: 'userId',
  otherKey: 'friendId',
  ...CASCADE
});

// Follow system
User.belongsToMany(User, {
  as: 'following',
  through: UserFollows,
  foreignKey: 'followerId',
  otherKey: 'followingId',
  ...CASCADE
});
User.belongsToMany(User, {
  as: 'followers',
  through: UserFollows,
  foreignKey: 'followingId',
  otherKey: 'followerId',
  ...CASCADE
});

// ==================== 3. GROUP RELATIONSHIPS ====================

// Group ownership
Group.belongsTo(User, {
  foreignKey: 'creatorId',
  as: 'creator',
  ...CASCADE
});
User.hasMany(Group, {
  foreignKey: 'creatorId',
  as: 'createdGroups',
  ...CASCADE
});

// Group membership
Group.belongsToMany(User, {
  through: {
    model: GroupMember,
    unique: true,
    scope: {
      status: 'active'
    }
  },
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

// Group posts
Group.hasMany(Post, {
  foreignKey: 'groupId',
  as: 'posts',
  ...CASCADE
});
Post.belongsTo(Group, {
  foreignKey: 'groupId',
  as: 'group',
  ...SET_NULL
});

// ==================== 4. VERIFICATION SYSTEM ====================

// User verification documents
User.hasMany(VerificationDocument, {
  foreignKey: 'userId',
  as: 'submittedDocuments',
  ...CASCADE
});

VerificationDocument.belongsTo(User, {
  foreignKey: 'userId',
  as: 'submitter',
  ...CASCADE
});
VerificationDocument.belongsTo(User, {
  foreignKey: 'reviewedBy',
  as: 'reviewer',
  ...SET_NULL
});

// Phone verification
User.hasMany(TempPhoneUpdate, {
  foreignKey: 'userId',
  as: 'phoneUpdateRequests',
  ...CASCADE
});
TempPhoneUpdate.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user',
  ...CASCADE
});

// ==================== 5. GENDER VERIFICATION SYSTEM ====================

// Gender change requests (Updated with clear aliases)
User.hasMany(PendingGenderChange, {
  foreignKey: 'userId',
  as: 'genderChangeRequests',
  ...CASCADE
});

PendingGenderChange.belongsTo(User, {
  foreignKey: 'userId',
  as: 'requestingUser',
  ...CASCADE
});

PendingGenderChange.belongsTo(User, {
  foreignKey: 'reviewedBy',
  as: 'reviewingAdmin',
  ...SET_NULL
});

// Gender verification OTPs (Updated with clearer naming)
PendingGenderChange.hasOne(TempGenderVerification, {
  foreignKey: 'pendingChangeId',
  as: 'otpVerification',
  ...CASCADE
});

TempGenderVerification.belongsTo(PendingGenderChange, {
  foreignKey: 'pendingChangeId',
  as: 'genderChangeRequest',
  ...CASCADE
});

User.hasMany(TempGenderVerification, {
  foreignKey: 'userId',
  as: 'genderVerificationOTPs',
  ...CASCADE
});

TempGenderVerification.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user',
  ...CASCADE
});

// ==================== 6. ADMIN MODERATION SYSTEM ====================

// Admin alerts
User.hasMany(AdminAlert, {
  foreignKey: 'userId',
  as: 'alerts',
  ...CASCADE
});

// Admin alerts (Updated to match gender change aliases)
AdminAlert.belongsTo(User, {
  foreignKey: 'userId',
  as: 'affectedUser',
  ...CASCADE
});

AdminAlert.belongsTo(User, {
  foreignKey: 'reviewedBy',
  as: 'reviewingAdmin',
  ...SET_NULL
});

// Link between alerts and gender changes
AdminAlert.hasOne(PendingGenderChange, {
  foreignKey: 'adminAlertId',
  as: 'genderChangeRequest',
  ...SET_NULL
});
PendingGenderChange.belongsTo(AdminAlert, {
  foreignKey: 'adminAlertId',
  as: 'adminAlert',
  ...SET_NULL
});

// ==================== 7. MESSAGING SYSTEM RELATIONSHIPS ====================

// Chat-Message relationships
Chat.hasMany(Message, {
  foreignKey: 'chatId',
  as: 'messages',
  ...CASCADE
});
Message.belongsTo(Chat, {
  foreignKey: 'chatId',
  as: 'chat',
  ...CASCADE
});

// User-Message relationships (sender)
User.hasMany(Message, {
  foreignKey: 'senderId',
  as: 'sentMessages',
  ...CASCADE
});
Message.belongsTo(User, {
  foreignKey: 'senderId',
  as: 'sender',
  ...CASCADE
});

// Chat-User relationships (participants)
User.belongsToMany(Chat, {
  through: ChatParticipant,
  foreignKey: 'userId',
  as: 'chats',
  ...CASCADE
});
Chat.belongsToMany(User, {
  through: ChatParticipant,
  foreignKey: 'chatId',
  as: 'participants',
  ...CASCADE
});

// Chat last message relationship
Chat.belongsTo(Message, {
  foreignKey: 'lastMessageId',
  as: 'lastMessageRef',
  ...SET_NULL
});

// ==================== EXPORT MODELS IN DEPENDENCY ORDER ====================
module.exports = {
  // 1. Core independent models
  User,
  Post,
  Comment,
  Media,
  Like,
  Group,
  
  // 2. Social graph models
  Friendship,
  UserFollows,
  GroupMember,
  
  // 3. Verification models
  VerificationDocument,
  AdminAlert,
  
  // 4. Dependent models
  PendingGenderChange,
  TempPhoneUpdate,
  TempGenderVerification,
  
  // 5. Messaging system models
  Chat,
  Message,
  ChatParticipant
};


















