// utils/friendshipErrors.js
export const getFriendlyErrorMessage = (errorCode) => {
  const messages = {
    'SELF_ACTION': "You can't send a friend request to yourself.",
    'USER_NOT_FOUND': "This user doesn't exist.",
    'REQUEST_ALREADY_SENT': "You've already sent a friend request to this user.",
    'REQUEST_ALREADY_RECEIVED': "This user already sent you a request. Check your friend requests!",
    'ALREADY_FRIENDS': "You're already friends with this user.",
    'COOLING_PERIOD_ACTIVE': "Please wait before sending another request.",
    'USER_BLOCKED': "You can't send a request to this user.",
    'UNKNOWN_ERROR': "Something went wrong. Please try again."
  };
  
  return messages[errorCode] || messages['UNKNOWN_ERROR'];
};