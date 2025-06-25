 const Sequelize = require('sequelize');
 const sequelize = require('../config/database');

 const User = require('./userModel');
const Friendship = require('./friendshipModel');
const Notification = require('./notificationModel');
const Chat = require('./chatModel');


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
const Message = require('./messageModel');
const ChatParticipant = require('./chatParticipantModel');

 // Set up associations
 require('./associations');

// Add to export
module.exports = {
  sequelize,
  Sequelize,
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
