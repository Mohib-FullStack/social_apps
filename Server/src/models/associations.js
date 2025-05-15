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
  ...SET_NULL
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

// Friendship associations
User.belongsToMany(User, {
  through: Friendship,
  as: 'friends',
  foreignKey: 'userId',
  otherKey: 'friendId',
  ...CASCADE
});

User.belongsToMany(User, {
  through: Friendship,
  as: 'friendOf',
  foreignKey: 'friendId',
  otherKey: 'userId',
  ...CASCADE
});

// Direct friendship access
User.hasMany(Friendship, {
  foreignKey: 'userId',
  as: 'sentFriendRequests',
  ...CASCADE
});

User.hasMany(Friendship, {
  foreignKey: 'friendId',
  as: 'receivedFriendRequests',
  ...CASCADE
});

User.hasMany(Friendship, {
  foreignKey: 'actionUserId',
  as: 'friendshipActions',
  ...SET_NULL
});

// Detailed friendship relationships
Friendship.belongsTo(User, {
  as: 'requester',
  foreignKey: 'userId',
  ...CASCADE
});

Friendship.belongsTo(User, {
  as: 'requested',
  foreignKey: 'friendId',
  ...CASCADE
});

Friendship.belongsTo(User, {
  as: 'actionUser',
  foreignKey: 'actionUserId',
  ...SET_NULL
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

// Gender change requests
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

// Gender verification OTPs
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

// User-Message associations
User.hasMany(Message, {
  foreignKey: 'senderId',
  as: 'sentMessages',
  ...CASCADE
});
User.hasMany(Message, {
  foreignKey: 'receiverId',
  as: 'receivedMessages',
  ...CASCADE
});
Message.belongsTo(User, {
  foreignKey: 'senderId',
  as: 'sender',
  ...CASCADE
});
Message.belongsTo(User, {
  foreignKey: 'receiverId',
  as: 'receiver',
  ...CASCADE
});

// Chat Participants
Chat.belongsToMany(User, {
  through: ChatParticipant,
  foreignKey: 'chatId',
  otherKey: 'userId',
  as: 'participants',
  ...CASCADE
});
User.belongsToMany(Chat, {
  through: ChatParticipant,
  foreignKey: 'userId',
  otherKey: 'chatId',
  as: 'chats',
  ...CASCADE
});

// ==================== 8. NOTIFICATION SYSTEM RELATIONSHIPS ====================

// User-Notification relationships
User.hasMany(Notification, {
  foreignKey: 'userId',
  as: 'receivedNotifications',
  ...CASCADE
});

User.hasMany(Notification, {
  foreignKey: 'senderId',
  as: 'sentNotifications',
  ...CASCADE
});

// Notification relationships
Notification.belongsTo(User, {
  foreignKey: 'userId',
  as: 'recipient',
  ...CASCADE
});

Notification.belongsTo(User, {
  foreignKey: 'senderId',
  as: 'sender',
  ...CASCADE
});

// Notification metadata relationships
Notification.belongsTo(Friendship, {
  foreignKey: 'friendshipId',
  as: 'friendshipNotification',
  ...SET_NULL
});

Notification.belongsTo(Post, {
  foreignKey: 'postId',
  as: 'postNotification',
  ...SET_NULL
});

Notification.belongsTo(Comment, {
  foreignKey: 'commentId',
  as: 'commentNotification',
  ...SET_NULL
});

Notification.belongsTo(Group, {
  foreignKey: 'groupId',
  as: 'groupNotification',
  ...SET_NULL
});

Notification.belongsTo(Chat, {
  foreignKey: 'chatId',
  as: 'chatNotification',
  ...SET_NULL
});

Notification.belongsTo(Message, {
  foreignKey: 'messageId',
  as: 'messageNotification',
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
  Notification,
  
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








// // src/models/associations.js
// const User = require('./userModel');
// const Post = require('./postModel');
// const Comment = require('./commentModel');
// const Media = require('./mediaModel');
// const Like = require('./likeModel');
// const Notification = require('./notificationModel');
// const UserFollows = require('./userFollowsModel');
// const Group = require('./groupModel');
// const GroupMember = require('./groupMemberModel');
// const AdminAlert = require('./adminAlertModel');
// const PendingGenderChange = require('./pendingGenderChangeModel');
// const TempPhoneUpdate = require('./tempPhoneUpdateModel');
// const VerificationDocument = require('./verificationDocumentModel');
// const TempGenderVerification = require('./tempGenderVerificationModel');
// const Chat = require('./chatModel');
// const Message = require('./messageModel');
// const ChatParticipant = require('./chatParticipantModel');
// const Friendship = require('./friendshipModel');

// // Association configuration constants
// const CASCADE = { onDelete: 'CASCADE', onUpdate: 'CASCADE' };
// const SET_NULL = { onDelete: 'SET NULL', onUpdate: 'CASCADE' };

// // ==================== 1. CORE CONTENT RELATIONSHIPS ====================

// // User-Post relationships
// User.hasMany(Post, { 
//   foreignKey: 'userId',
//   as: 'authoredPosts',
//   ...CASCADE
// });
// Post.belongsTo(User, {
//   foreignKey: 'userId',
//   as: 'author',
//   ...CASCADE
// });

// // Post-Comment relationships
// Post.hasMany(Comment, {
//   foreignKey: 'postId',
//   as: 'comments',
//   ...CASCADE
// });
// Comment.belongsTo(Post, {
//   foreignKey: 'postId',
//   as: 'post',
//   ...CASCADE
// });

// // Comment nesting
// Comment.belongsTo(Comment, {
//   foreignKey: 'parentId',
//   as: 'parentComment',
//   ...SET_NULL
// });
// Comment.hasMany(Comment, {
//   foreignKey: 'parentId',
//   as: 'replies',
//   ...CASCADE
// });

// // Post-Media relationships
// Post.hasMany(Media, {
//   foreignKey: 'postId',
//   as: 'media',
//   ...CASCADE
// });
// Media.belongsTo(Post, {
//   foreignKey: 'postId',
//   as: 'post',
//   ...CASCADE
// });

// // Content-Like relationships
// Post.hasMany(Like, {
//   foreignKey: 'postId',
//   as: 'likes',
//   ...CASCADE
// });
// Comment.hasMany(Like, {
//   foreignKey: 'commentId',
//   as: 'likes',
//   ...CASCADE
// });
// Like.belongsTo(Post, {
//   foreignKey: 'postId',
//   as: 'post',
//   ...CASCADE
// });
// Like.belongsTo(Comment, {
//   foreignKey: 'commentId',
//   as: 'comment',
//   ...CASCADE
// });
// Like.belongsTo(User, {
//   foreignKey: 'userId',
//   as: 'user',
//   ...CASCADE
// });

// // ==================== 2. SOCIAL GRAPH RELATIONSHIPS ====================

// // 🌟 ENHANCED FRIENDSHIP ASSOCIATIONS ==============================

// // Two-way friendship association
// User.belongsToMany(User, {
//   through: Friendship,
//   as: 'friends',
//   foreignKey: 'userId',
//   otherKey: 'friendId',
//   ...CASCADE,
//   comment: 'Friends initiated by this user'
// });

// User.belongsToMany(User, {
//   through: Friendship,
//   as: 'friendOf',
//   foreignKey: 'friendId',
//   otherKey: 'userId',
//   ...CASCADE,
//   comment: 'Friends who initiated with this user'
// });

// // Direct friendship access
// User.hasMany(Friendship, {
//   foreignKey: 'userId',
//   as: 'sentFriendRequests',
//   ...CASCADE,
//   comment: 'Friend requests sent by this user'
// });

// User.hasMany(Friendship, {
//   foreignKey: 'friendId',
//   as: 'receivedFriendRequests',
//   ...CASCADE,
//   comment: 'Friend requests received by this user'
// });

// User.hasMany(Friendship, {
//   foreignKey: 'actionUserId',
//   as: 'friendshipActions',
//   ...SET_NULL,
//   comment: 'Friendship status changes performed by this user'
// });

// // Detailed friendship relationships
// Friendship.belongsTo(User, {
//   as: 'requester',
//   foreignKey: 'userId',
//   ...CASCADE,
//   comment: 'The user who sent the friend request'
// });

// Friendship.belongsTo(User, {
//   as: 'requested',
//   foreignKey: 'friendId',
//   ...CASCADE,
//   comment: 'The user who received the friend request'
// });

// Friendship.belongsTo(User, {
//   as: 'actionUser',
//   foreignKey: 'actionUserId',
//   ...SET_NULL,
//   comment: 'User who performed the last status change'
// });

// // Follow system
// User.belongsToMany(User, {
//   as: 'following',
//   through: UserFollows,
//   foreignKey: 'followerId',
//   otherKey: 'followingId',
//   ...CASCADE
// });

// User.belongsToMany(User, {
//   as: 'followers',
//   through: UserFollows,
//   foreignKey: 'followingId',
//   otherKey: 'followerId',
//   ...CASCADE
// });

// // ==================== 3. GROUP RELATIONSHIPS ====================

// // Group ownership
// Group.belongsTo(User, {
//   foreignKey: 'creatorId',
//   as: 'creator',
//   ...CASCADE
// });
// User.hasMany(Group, {
//   foreignKey: 'creatorId',
//   as: 'createdGroups',
//   ...CASCADE
// });

// // Group membership
// Group.belongsToMany(User, {
//   through: {
//     model: GroupMember,
//     unique: true,
//     scope: {
//       status: 'active'
//     }
//   },
//   foreignKey: 'groupId',
//   as: 'members',
//   ...CASCADE
// });
// User.belongsToMany(Group, {
//   through: GroupMember,
//   foreignKey: 'userId',
//   as: 'groups',
//   ...CASCADE
// });

// // Group posts
// Group.hasMany(Post, {
//   foreignKey: 'groupId',
//   as: 'posts',
//   ...CASCADE
// });
// Post.belongsTo(Group, {
//   foreignKey: 'groupId',
//   as: 'group',
//   ...SET_NULL
// });

// // ==================== 4. VERIFICATION SYSTEM ====================

// // User verification documents
// User.hasMany(VerificationDocument, {
//   foreignKey: 'userId',
//   as: 'submittedDocuments',
//   ...CASCADE
// });

// VerificationDocument.belongsTo(User, {
//   foreignKey: 'userId',
//   as: 'submitter',
//   ...CASCADE
// });
// VerificationDocument.belongsTo(User, {
//   foreignKey: 'reviewedBy',
//   as: 'reviewer',
//   ...SET_NULL
// });

// // Phone verification
// User.hasMany(TempPhoneUpdate, {
//   foreignKey: 'userId',
//   as: 'phoneUpdateRequests',
//   ...CASCADE
// });
// TempPhoneUpdate.belongsTo(User, {
//   foreignKey: 'userId',
//   as: 'user',
//   ...CASCADE
// });

// // ==================== 5. GENDER VERIFICATION SYSTEM ====================

// // Gender change requests
// User.hasMany(PendingGenderChange, {
//   foreignKey: 'userId',
//   as: 'genderChangeRequests',
//   ...CASCADE
// });

// PendingGenderChange.belongsTo(User, {
//   foreignKey: 'userId',
//   as: 'requestingUser',
//   ...CASCADE
// });

// PendingGenderChange.belongsTo(User, {
//   foreignKey: 'reviewedBy',
//   as: 'reviewingAdmin',
//   ...SET_NULL
// });

// // Gender verification OTPs
// PendingGenderChange.hasOne(TempGenderVerification, {
//   foreignKey: 'pendingChangeId',
//   as: 'otpVerification',
//   ...CASCADE
// });

// TempGenderVerification.belongsTo(PendingGenderChange, {
//   foreignKey: 'pendingChangeId',
//   as: 'genderChangeRequest',
//   ...CASCADE
// });

// User.hasMany(TempGenderVerification, {
//   foreignKey: 'userId',
//   as: 'genderVerificationOTPs',
//   ...CASCADE
// });

// TempGenderVerification.belongsTo(User, {
//   foreignKey: 'userId',
//   as: 'user',
//   ...CASCADE
// });

// // ==================== 6. ADMIN MODERATION SYSTEM ====================

// // Admin alerts
// User.hasMany(AdminAlert, {
//   foreignKey: 'userId',
//   as: 'alerts',
//   ...CASCADE
// });

// AdminAlert.belongsTo(User, {
//   foreignKey: 'userId',
//   as: 'affectedUser',
//   ...CASCADE
// });

// AdminAlert.belongsTo(User, {
//   foreignKey: 'reviewedBy',
//   as: 'reviewingAdmin',
//   ...SET_NULL
// });

// // Link between alerts and gender changes
// AdminAlert.hasOne(PendingGenderChange, {
//   foreignKey: 'adminAlertId',
//   as: 'genderChangeRequest',
//   ...SET_NULL
// });
// PendingGenderChange.belongsTo(AdminAlert, {
//   foreignKey: 'adminAlertId',
//   as: 'adminAlert',
//   ...SET_NULL
// });


// // ==================== 7. MESSAGING SYSTEM RELATIONSHIPS ====================

// // Chat-Message relationships (already included above)
// Chat.hasMany(Message, {
//   foreignKey: 'chatId',
//   as: 'messages',
//   ...CASCADE
// });
// Message.belongsTo(Chat, {
//   foreignKey: 'chatId',
//   as: 'chat',
//   ...CASCADE
// });

// // ✅ Complete User-Message associations (sender and receiver)
// User.hasMany(Message, {
//   foreignKey: 'senderId',
//   as: 'sentMessages',
//   ...CASCADE
// });
// User.hasMany(Message, {
//   foreignKey: 'receiverId',
//   as: 'receivedMessages',
//   ...CASCADE
// });
// Message.belongsTo(User, {
//   foreignKey: 'senderId',
//   as: 'sender',
//   ...CASCADE
// });
// Message.belongsTo(User, {
//   foreignKey: 'receiverId',
//   as: 'receiver',
//   ...CASCADE
// });

// // Chat Participants
// Chat.belongsToMany(User, {
//   through: ChatParticipant,
//   foreignKey: 'chatId',
//   otherKey: 'userId',
//   as: 'participants',
//   ...CASCADE
// });
// User.belongsToMany(Chat, {
//   through: ChatParticipant,
//   foreignKey: 'userId',
//   otherKey: 'chatId',
//   as: 'chats',
//   ...CASCADE
// });


// // ==================== 8. NOTIFICATION SYSTEM RELATIONSHIPS ====================

// // User-Notification relationships (recipient)
// User.hasMany(Notification, {
//   foreignKey: 'userId',
//   as: 'receivedNotifications',
//   ...CASCADE
// });

// // User-Notification relationships (sender)
// User.hasMany(Notification, {
//   foreignKey: 'senderId',
//   as: 'sentNotifications',
//   ...CASCADE
// });

// // Notification relationships
// Notification.belongsTo(User, {
//   foreignKey: 'userId',
//   as: 'recipient',
//   ...CASCADE
// });

// Notification.belongsTo(User, {
//   foreignKey: 'senderId',
//   as: 'sender',
//   ...CASCADE
// });

// // Notification metadata relationships
// Notification.belongsTo(Friendship, {
//   foreignKey: 'friendshipId',
//   as: 'friendshipNotification',
//   ...SET_NULL
// });

// Notification.belongsTo(Post, {
//   foreignKey: 'postId',
//   as: 'postNotification',
//   ...SET_NULL
// });

// Notification.belongsTo(Comment, {
//   foreignKey: 'commentId',
//   as: 'commentNotification',
//   ...SET_NULL
// });

// Notification.belongsTo(Message, {
//   foreignKey: 'messageId',
//   as: 'messageNotification',
//   ...SET_NULL
// });

// // ==================== EXPORT MODELS IN DEPENDENCY ORDER ====================
// module.exports = {
//   // 1. Core independent models
//   User,
//   Post,
//   Comment,
//   Media,
//   Like,
//   Group,
//   Notification,
  
//   // 2. Social graph models
//   Friendship,
//   UserFollows,
//   GroupMember,
  
//   // 3. Verification models
//   VerificationDocument,
//   AdminAlert,
  
//   // 4. Dependent models
//   PendingGenderChange,
//   TempPhoneUpdate,
//   TempGenderVerification,
  
//   // 5. Messaging system models
//   Chat,
//   Message,
//   ChatParticipant
// };














































