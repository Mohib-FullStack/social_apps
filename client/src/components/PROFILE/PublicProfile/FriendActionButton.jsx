// src/components/common/FriendActionButton.jsx
// import {
//   Button,
//   CircularProgress,
//   Tooltip
// } from '@mui/material';
// import { useState } from 'react';
// import { useDispatch } from 'react-redux';
// import {
//   acceptFriendRequest,
//   cancelFriendRequest,
//   sendFriendRequest,
  
// } from '../../../features/friendship/friendshipSlice';
// import { showSnackbar } from '../../../features/snackbar/snackbarSlice';

// const FriendActionButton = ({ userId, currentStatus, disabled }) => {
//   const dispatch = useDispatch();
//   const [isLoading, setIsLoading] = useState(false);
//   const [isHovered, setIsHovered] = useState(false);

//   const handleAction = async (action, successMessage, errorMessage) => {
//     setIsLoading(true);
//     try {
//       await dispatch(action({ targetUserId: userId })).unwrap();
//       dispatch(showSnackbar({
//         message: successMessage,
//         severity: 'success',
//         autoHideDuration: 3000,
//       }));
//     } catch (error) {
//       dispatch(showSnackbar({
//         message: errorMessage || 'Action failed. Please try again later.',
//         severity: 'error',
//         autoHideDuration: 4000,
//       }));
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const getButtonConfig = () => {
//     switch (currentStatus) {
//       case 'friends':
//         return {
//           defaultLabel: 'Friends',
//           hoverLabel: 'Unfriend',
//           color: 'success',
//           variant: 'contained',
//           tooltip: 'Click to remove this friend',
//           onClick: () => handleAction(
//             unfriendUser,
//             'You are no longer friends',
//             'Could not remove friend'
//           ),
//         };
//       case 'pending_outgoing':
//         return {
//           defaultLabel: 'Request Sent',
//           hoverLabel: 'Cancel Request',
//           color: 'info',
//           variant: 'contained',
//           tooltip: 'Your friend request is pending. Click to cancel',
//           onClick: () => handleAction(
//             cancelFriendRequest,
//             'Friend request cancelled',
//             'Failed to cancel request'
//           ),
//         };
//       case 'pending_incoming':
//         return {
//           defaultLabel: 'Respond to Request',
//           hoverLabel: 'Accept Request',
//           color: 'primary',
//           variant: 'contained',
//           tooltip: 'This user sent you a friend request',
//           onClick: () => handleAction(
//             acceptFriendRequest,
//             'Friend request accepted!',
//             'Failed to accept request'
//           ),
//         };
//       case 'following':
//         return {
//           defaultLabel: 'Following',
//           hoverLabel: 'Unfollow',
//           color: 'secondary',
//           variant: 'outlined',
//           tooltip: 'You are following this user',
//           onClick: () => {}, // Add unfollow logic if needed
//         };
//       default:
//         return {
//           defaultLabel: 'Add Friend',
//           hoverLabel: 'Send Friend Request',
//           color: 'primary',
//           variant: 'contained',
//           tooltip: 'Click to send a friend request',
//           onClick: () => handleAction(
//             sendFriendRequest,
//             'Friend request sent successfully!',
//             'Failed to send friend request'
//           ),
//         };
//     }
//   };

//   const { defaultLabel, hoverLabel, color, variant, tooltip, onClick } = getButtonConfig();
//   const displayLabel = isHovered ? hoverLabel : defaultLabel;

//   // Special case for pending requests from other users
//   if (currentStatus === 'pending_incoming' && !isHovered) {
//     return (
//       <Tooltip title={tooltip} arrow>
//         <Button
//           variant="contained"
//           color="primary"
//           onClick={onClick}
//           disabled={disabled || isLoading}
//           startIcon={isLoading ? <CircularProgress size={16} /> : null}
//           onMouseEnter={() => setIsHovered(true)}
//           onMouseLeave={() => setIsHovered(false)}
//           sx={buttonStyles}
//         >
//           Respond to Request
//         </Button>
//       </Tooltip>
//     );
//   }

//   return (
//     <Tooltip title={tooltip} arrow>
//       <Button
//         variant={variant}
//         color={color}
//         onClick={onClick}
//         disabled={disabled || isLoading}
//         startIcon={isLoading ? <CircularProgress size={16} /> : null}
//         onMouseEnter={() => setIsHovered(true)}
//         onMouseLeave={() => setIsHovered(false)}
//         sx={buttonStyles}
//       >
//         {displayLabel}
//       </Button>
//     </Tooltip>
//   );
// };

// const buttonStyles = {
//   minWidth: 140,
//   transition: 'all 0.3s ease',
//   '&:hover': {
//     transform: 'translateY(-2px)',
//     boxShadow: 3,
//   },
//   '&.Mui-disabled': {
//     opacity: 0.8,
//   }
// };

// export default FriendActionButton;






//! previous
// src/components/PROFILE/PublicProfile/FriendActionButton.jsx
import {
  Check as CheckIcon,
  HourglassEmpty as HourglassEmptyIcon,
  PersonAdd as PersonAddIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import {
  Box,
  Button,
  CircularProgress,
  Tooltip
} from '@mui/material';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import {
  acceptFriendRequest,
  cancelFriendRequest,
  sendFriendRequest,
  // unfriendUser
} from '../../../features/friendship/friendshipSlice';
import { showSnackbar } from '../../../features/snackbar/snackbarSlice';


const actionConfigs = {
  not_connected: {
    label: 'Add Friend',
    hoverLabel: 'Send Friend Request',
    icon: <PersonAddIcon />,
    color: 'primary',
    variant: 'contained',
    action: sendFriendRequest,
    successMessage: 'Friend request sent!',
    errorMessage: 'Failed to send request',
    tooltip: 'Send friend request'
  },
  pending_outgoing: {
    label: 'Request Sent',
    hoverLabel: 'Cancel Request',
    icon: <HourglassEmptyIcon />,
    color: 'info',
    variant: 'contained',
    action: cancelFriendRequest,
    successMessage: 'Request cancelled',
    errorMessage: 'Failed to cancel request',
    tooltip: 'Cancel friend request'
  },
  pending_incoming: {
    label: 'Respond to Request',
    hoverLabel: 'Accept Request',
    icon: <PersonAddIcon />,
    color: 'primary',
    variant: 'contained',
    action: acceptFriendRequest,
    successMessage: 'Friend request accepted!',
    errorMessage: 'Failed to accept request',
    tooltip: 'Accept friend request'
  },
  friends: {
    label: 'Friends',
    hoverLabel: 'Unfriend',
    icon: <CheckIcon />,
    color: 'success',
    variant: 'contained',
    // action: unfriendUser,
    successMessage: 'Friend removed',
    errorMessage: 'Failed to remove friend',
    tooltip: 'Unfriend this user'
  },
  following: {
    label: 'Following',
    hoverLabel: 'Unfollow',
    icon: <PersonIcon />,
    color: 'secondary',
    variant: 'outlined',
    action: null, // Add follow/unfollow logic if needed
    tooltip: 'You are following this user'
  }
};

const FriendActionButton = ({ userId, currentStatus, disabled = false }) => {
  const dispatch = useDispatch();
  const [isHovered, setIsHovered] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [localStatus, setLocalStatus] = useState(currentStatus);

  useEffect(() => {
    setLocalStatus(currentStatus);
  }, [currentStatus]);

  const config = actionConfigs[localStatus] || actionConfigs.not_connected;

  const handleAction = async () => {
    if (!config.action || isLoading) return;
    
    setIsLoading(true);
    try {
      await dispatch(config.action(userId)).unwrap();
      dispatch(showSnackbar({
        message: config.successMessage,
        severity: 'success',
        autoHideDuration: 3000
      }));
    } catch (error) {
      dispatch(showSnackbar({
        message: config.errorMessage || 'Action failed',
        severity: 'error',
        autoHideDuration: 4000
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const getButtonContent = () => {
    if (isLoading) {
      return <CircularProgress size={20} />;
    }
    
    return (
      <>
        {config.icon}
        {isHovered ? config.hoverLabel : config.label}
      </>
    );
  };

  return (
    <Tooltip title={config.tooltip} arrow>
      <Box onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
        <Button
          variant={config.variant}
          color={config.color}
          disabled={disabled || isLoading || !config.action}
          onClick={handleAction}
          startIcon={!isLoading && config.icon}
          sx={{
            minWidth: 150,
            transition: 'all 0.3s ease',
            '&:hover': { transform: 'translateY(-2px)', boxShadow: 3 }
          }}
        >
          {getButtonContent()}
        </Button>
      </Box>
    </Tooltip>
  );
};

FriendActionButton.propTypes = {
  userId: PropTypes.string.isRequired,
  currentStatus: PropTypes.oneOf([
    'not_connected',
    'pending_outgoing',
    'pending_incoming',
    'friends',
    'following'
  ]),
  disabled: PropTypes.bool
};

FriendActionButton.defaultProps = {
  currentStatus: 'not_connected',
  disabled: false
};

export default FriendActionButton;