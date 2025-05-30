// src/components/profile/ProfileActions.jsx
import { Button, Box } from "@mui/material";
import { 
  Send as SendIcon, 
  PersonAdd as PersonAddIcon, 
  HourglassEmpty,
  Add as AddIcon,
  Edit as EditIcon,
  ArrowForward as ArrowForwardIcon,
  Check,
  MoreHoriz as MoreHorizIcon
} from "@mui/icons-material";
import PropTypes from "prop-types";

const ProfileActions = ({
  isOwnProfile,
  friendStatus, // "friends" | "pending" | "not_friends" | "following"
  onAddFriend,
  onMessage,
  onEditProfile,
  onCreateStory,
  onViewFriends
}) => {
  if (isOwnProfile) {
    return (
      <Box sx={{ display: 'flex', gap: 2, mt: 2, flexWrap: 'wrap' }}>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={onCreateStory}
          sx={{
            background: 'linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366)',
            color: 'white'
          }}
        >
          Add to story
        </Button>
        <Button 
          variant="outlined" 
          startIcon={<EditIcon />}
          onClick={onEditProfile}
        >
          Edit profile
        </Button>
        <Button 
          variant="text" 
          endIcon={<ArrowForwardIcon fontSize="small" />}
          onClick={onViewFriends}
        >
          See all friends
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', gap: 2, mt: 2, flexWrap: 'wrap' }}>
      {friendStatus === "not_friends" && (
        <Button 
          variant="contained" 
          startIcon={<PersonAddIcon />}
          onClick={onAddFriend}
        >
          Add Friend
        </Button>
      )}
      
      {friendStatus === "pending" && (
        <Button variant="outlined" disabled startIcon={<HourglassEmpty />}>
          Request Sent
        </Button>
      )}
      
      {friendStatus === "friends" && (
        <Button variant="contained" disabled startIcon={<Check />}>
          Friends
        </Button>
      )}
      
      {friendStatus === "following" && (
        <Button variant="outlined" disabled>
          Following
        </Button>
      )}
      
      <Button 
        variant="contained" 
        color="secondary"
        startIcon={<SendIcon />}
        onClick={onMessage}
      >
        Message
      </Button>
      
      <Button variant="outlined">
        <MoreHorizIcon />
      </Button>
    </Box>
  );
};

ProfileActions.propTypes = {
  isOwnProfile: PropTypes.bool.isRequired,
  friendStatus: PropTypes.oneOf(["friends", "pending", "not_friends", "following"]),
  onAddFriend: PropTypes.func,
  onMessage: PropTypes.func,
  onEditProfile: PropTypes.func,
  onCreateStory: PropTypes.func,
  onViewFriends: PropTypes.func
};

export default ProfileActions;










//! old
// // src/components/profile/ProfileActions.jsx
// import { Button, Box } from "@mui/material";
// import { Send, PersonAdd, HourglassEmpty } from "@mui/icons-material";
// import PropTypes from "prop-types";

// const ProfileActions = ({
//   isOwnProfile,
//   friendStatus,   // "friends" | "pending" | "not_friends"
//   onAddFriend,
//   onMessage,
//   onEditProfile,
//   onCreateStory,
// }) => {
//   // 1) Own profile
//   if (isOwnProfile) {
//     return (
//       <Box display="flex" gap={2} mt={2} justifyContent="center" flexWrap="wrap">
//         {onCreateStory && (
//           <Button variant="contained" startIcon={<PersonAdd />} onClick={onCreateStory}>
//             Create Story
//           </Button>
//         )}
//         {onEditProfile && (
//           <Button variant="outlined" startIcon={<HourglassEmpty />} onClick={onEditProfile}>
//             Edit Profile
//           </Button>
//         )}
//       </Box>
//     );
//   }

//   // 2) Someone else’s profile
//   return (
//     <Box display="flex" gap={2} mt={2} justifyContent="center" flexWrap="wrap">
//       {friendStatus === "not_friends" && onAddFriend && (
//         <Button variant="contained" startIcon={<PersonAdd />} onClick={onAddFriend}>
//           Add Friend
//         </Button>
//       )}
//       {friendStatus === "pending" && (
//         <Button variant="outlined" startIcon={<HourglassEmpty />} disabled>
//           Pending
//         </Button>
//       )}
//       {friendStatus === "friends" && (
//         <Button variant="contained" disabled>
//           Friends
//         </Button>
//       )}
//       {onMessage && (
//         <Button variant="outlined" startIcon={<Send />} onClick={onMessage}>
//           Message
//         </Button>
//       )}
//     </Box>
//   );
// };

// ProfileActions.propTypes = {
//   isOwnProfile: PropTypes.bool.isRequired,
//   friendStatus: PropTypes.oneOf(["friends", "pending", "not_friends"]),
//   onAddFriend: PropTypes.func,
//   onMessage: PropTypes.func,
//   onEditProfile: PropTypes.func,
//   onCreateStory: PropTypes.func,
// };

// export default ProfileActions;
