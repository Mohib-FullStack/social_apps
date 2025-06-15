// ! updated
// const fs = require('fs');
// const path = require('path');
// const Sequelize = require('sequelize');
// const sequelize = require('../config/database');

// const db = {
//   sequelize,
//   Sequelize,
// };

// // Dynamically import all model files ending with Model.js
// const modelFiles = fs
//   .readdirSync(__dirname)
//   .filter(file => file !== 'index.js' && file.endsWith('Model.js'));

// // Load and initialize all models
// for (const file of modelFiles) {
//   const modelClass = require(path.join(__dirname, file));

//   if (typeof modelClass.init !== 'function' || typeof modelClass.getAttributes !== 'function') {
//     throw new Error(`Model ${file} must export a valid Sequelize Model class with getAttributes().`);
//   }

//   modelClass.init(modelClass.getAttributes(), {
//     ...modelClass.getOptions(),
//     sequelize,
//   });

//   db[modelClass.name] = modelClass;
// }

// // Setup model associations
// for (const modelName of Object.keys(db)) {
//   const model = db[modelName];
//   if (typeof model.associate === 'function') {
//     model.associate(db);
//   }
// }

// // Setup any additional associations (optional)
// require('./associations')(db);

// // Debug output
// console.log('Models initialized:');
// Object.keys(db).forEach(name => {
//   console.log(`- ${name}`);
//   if (db[name].associations) {
//     console.log(`  Associations: ${Object.keys(db[name].associations).join(', ')}`);
//   }
// });

// module.exports = db;





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













