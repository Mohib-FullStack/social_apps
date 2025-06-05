// src/components/profile/ProfileActions.jsx
import { Button, Box } from "@mui/material";
import { 
  Send as SendIcon, 
  PersonAdd as PersonAddIcon, 
  HourglassEmpty as HourglassEmptyIcon,
  Add as AddIcon,
  Edit as EditIcon,
  ArrowForward as ArrowForwardIcon,
  Check as CheckIcon,
  MoreHoriz as MoreHorizIcon
} from "@mui/icons-material";
import PropTypes from "prop-types";

const ProfileActions = ({
  isOwnProfile,
  friendStatus = "not_friends",
  onAddFriend,
  onMessage,
  onEditProfile,
  onCreateStory,
  onViewFriends
}) => {
  const commonStyles = {
    display: 'flex',
    gap: 2,
    mt: 2,
    flexWrap: 'wrap'
  };

  const storyButtonStyles = {
    background: 'linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366)',
    color: 'white'
  };

  if (isOwnProfile) {
    return (
      <Box sx={commonStyles}>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={onCreateStory}
          sx={storyButtonStyles}
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
    <Box sx={commonStyles}>
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
        <Button variant="outlined" disabled startIcon={<HourglassEmptyIcon />}>
          Request Sent
        </Button>
      )}
      
      {friendStatus === "friends" && (
        <Button variant="contained" disabled startIcon={<CheckIcon />}>
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

ProfileActions.defaultProps = {
  friendStatus: "not_friends"
};

export default ProfileActions;




