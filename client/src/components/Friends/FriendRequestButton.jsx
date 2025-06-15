// src/components/Friends/FriendRequestButton.jsx
import {
  PersonAddAlt1 as AcceptIcon,
  PersonAdd as AddFriendIcon,
  Check as FriendsIcon,
  Schedule as PendingIcon,
  Close as RejectIcon
} from '@mui/icons-material';
import { Button, CircularProgress, Tooltip } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import {
  acceptFriendRequest,
  checkFriendshipStatus,
  rejectFriendRequest,
  sendFriendRequest
} from '../../features/friendship/friendshipSlice';
import { showSnackbar } from '../../features/snackbar/snackbarSlice';
import { getFriendlyErrorMessage } from '../../utils/friendshipErrors';

const STATUS_MAP = {
  pending_outgoing: {
    label: 'Request Sent',
    icon: <PendingIcon />,
    color: 'secondary',
    variant: 'outlined',
    disabled: true
  },
  pending_incoming: {
    label: 'Accept Request',
    icon: <AcceptIcon />,
    color: 'primary',
    variant: 'contained',
    action: 'accept',
    showReject: true
  },
  accepted: {
    label: 'Friends',
    icon: <FriendsIcon />,
    color: 'success',
    variant: 'outlined',
    disabled: true
  },
  default: {
    label: 'Add Friend',
    icon: <AddFriendIcon />,
    color: 'primary',
    variant: 'contained',
    action: 'send'
  }
};

const FriendRequestButton = ({ friendId }) => {
  const dispatch = useDispatch();
  const currentUserId = useSelector((state) => state.user.profile?.id);
  const friendship = useSelector(
    (state) => state.friendship.statusLookup[friendId] || { status: 'none' }
  );
  const isLoading = useSelector(
    (state) => state.friendship.status === 'loading'
  );

  const handleSendRequest = async () => {
    try {
      await dispatch(sendFriendRequest({ friendId: Number(friendId) })).unwrap();
      dispatch(
        showSnackbar({
          message: 'Friend request sent successfully!',
          severity: 'success',
        })
      );
      dispatch(checkFriendshipStatus(friendId));
    } catch (error) {
      const friendlyMessage = getFriendlyErrorMessage(error.code);
      dispatch(
        showSnackbar({
          message: friendlyMessage,
          severity: 'error',
          autoHideDuration: error.code === 'REQUEST_ALREADY_RECEIVED' ? 6000 : 3000
        })
      );
    }
  };

  const handleAcceptRequest = async () => {
    try {
      if (!friendship?.friendship?.id) {
        throw new Error('Friendship ID not available');
      }

      const result = await dispatch(
        acceptFriendRequest(friendship.friendship.id)
      ).unwrap();
      
      if (result?.friendship) {
        dispatch(
          showSnackbar({
            message: result.message || 'Request accepted!',
            severity: 'success'
          })
        );
        dispatch(checkFriendshipStatus(friendId));
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      dispatch(
        showSnackbar({
          message: getFriendlyErrorMessage(error.code) || 'Failed to accept request',
          severity: 'error'
        })
      );
    }
  };

  const handleRejectRequest = async () => {
    try {
      if (!friendship?.friendship?.id) {
        throw new Error('Friendship ID not found');
      }
      
      await dispatch(rejectFriendRequest(friendship.friendship.id)).unwrap();
      dispatch(
        showSnackbar({
          message: 'Friend request rejected',
          severity: 'success',
        })
      );
      dispatch(checkFriendshipStatus(friendId));
    } catch (error) {
      dispatch(
        showSnackbar({
          message: getFriendlyErrorMessage(error.code) || 'Failed to reject friend request',
          severity: 'error',
        })
      );
    }
  };

  if (!friendId || friendId === currentUserId) return null;

  const statusKey = friendship.status === 'pending' 
    ? `${friendship.status}_${friendship.direction}`
    : friendship.status || 'default';

  const {
    label,
    icon,
    color,
    variant,
    disabled,
    action,
    showReject
  } = STATUS_MAP[statusKey] || STATUS_MAP.default;

  const handleAction = () => {
    switch (action) {
      case 'accept':
        return handleAcceptRequest;
      case 'send':
        return handleSendRequest;
      default:
        return undefined;
    }
  };

  return (
    <div style={{ display: 'flex', gap: '8px' }}>
      <Tooltip title={label} arrow>
        <Button
          variant={variant}
          color={color}
          size="small"
          startIcon={isLoading ? <CircularProgress size={20} /> : icon}
          onClick={handleAction()}
          disabled={disabled || isLoading}
          sx={{
            textTransform: 'none',
            minWidth: '120px',
          }}
        >
          {label}
        </Button>
      </Tooltip>
      
      {showReject && (
        <Tooltip title="Reject Request" arrow>
          <Button
            variant="outlined"
            color="error"
            size="small"
            onClick={handleRejectRequest}
            disabled={isLoading}
            sx={{
              textTransform: 'none',
              minWidth: '40px',
            }}
          >
            <RejectIcon fontSize="small" />
          </Button>
        </Tooltip>
      )}
    </div>
  );
};

export default FriendRequestButton;







//! running
// // src/components/Friends/FriendRequestButton.jsx
// import {
//   PersonAddAlt1 as AcceptIcon,
//   PersonAdd as AddFriendIcon,
//   Check as FriendsIcon,
//   Schedule as PendingIcon,
//   Close as RejectIcon
// } from '@mui/icons-material';
// import { Button, CircularProgress, Tooltip } from '@mui/material';
// import { useDispatch, useSelector } from 'react-redux';
// import {
//   acceptFriendRequest,
//   checkFriendshipStatus,
//   rejectFriendRequest,
//   sendFriendRequest
// } from '../../features/friendship/friendshipSlice';
// import { showSnackbar } from '../../features/snackbar/snackbarSlice';

// const STATUS_MAP = {
//   pending_outgoing: {
//     label: 'Request Sent',
//     icon: <PendingIcon />,
//     color: 'secondary',
//     variant: 'outlined',
//     disabled: true
//   },
//   pending_incoming: {
//     label: 'Accept Request',
//     icon: <AcceptIcon />,
//     color: 'primary',
//     variant: 'contained',
//     action: 'accept',
//     showReject: true
//   },
//   accepted: {
//     label: 'Friends',
//     icon: <FriendsIcon />,
//     color: 'success',
//     variant: 'outlined',
//     disabled: true
//   },
//   default: {
//     label: 'Add Friend',
//     icon: <AddFriendIcon />,
//     color: 'primary',
//     variant: 'contained',
//     action: 'send'
//   }
// };

// const FriendRequestButton = ({ friendId }) => {
//   const dispatch = useDispatch();
//   const currentUserId = useSelector((state) => state.user.profile?.id);
//   const friendship = useSelector(
//     (state) => state.friendship.statusLookup[friendId] || { status: 'none' }
//   );
//   const isLoading = useSelector(
//     (state) => state.friendship.status === 'loading'
//   );

//   const handleSendRequest = async () => {
//     try {
//       await dispatch(sendFriendRequest({ friendId: Number(friendId) })).unwrap();
//       dispatch(
//         showSnackbar({
//           message: 'Friend request sent successfully!',
//           severity: 'success',
//         })
//       );
//       dispatch(checkFriendshipStatus(friendId));
//     } catch (error) {
//       dispatch(
//         showSnackbar({
//           message: error.message || 'Failed to send friend request',
//           severity: 'error',
//         })
//       );
//     }
//   };


//   // In FriendRequestButton.jsx, update handleAcceptRequest:
// const handleAcceptRequest = async () => {
//   try {
//     if (!friendship?.friendship?.id) {
//       throw new Error('Friendship ID not available');
//     }

//     const result = await dispatch(
//       acceptFriendRequest(friendship.friendship.id)
//     ).unwrap();
    
//     if (result?.friendship) {
//       dispatch(
//         showSnackbar({
//           message: result.message || 'Request accepted!',
//           severity: 'success'
//         })
//       );
//       dispatch(checkFriendshipStatus(friendId));
//     } else {
//       throw new Error('Invalid response from server');
//     }
//   } catch (error) {
//     dispatch(
//       showSnackbar({
//         message: error.message || 'Failed to accept request',
//         severity: 'error'
//       })
//     );
//   }
// };

//   const handleRejectRequest = async () => {
//     try {
//       if (!friendship?.friendship?.id) {
//         throw new Error('Friendship ID not found');
//       }
      
//       await dispatch(rejectFriendRequest(friendship.friendship.id)).unwrap();
//       dispatch(
//         showSnackbar({
//           message: 'Friend request rejected',
//           severity: 'success',
//         })
//       );
//       dispatch(checkFriendshipStatus(friendId));
//     } catch (error) {
//       dispatch(
//         showSnackbar({
//           message: error.message || 'Failed to reject friend request',
//           severity: 'error',
//         })
//       );
//     }
//   };

//   if (!friendId || friendId === currentUserId) return null;

//   // Determine status key for the map
//   const statusKey = friendship.status === 'pending' 
//     ? `${friendship.status}_${friendship.direction}`
//     : friendship.status || 'default';

//   const {
//     label,
//     icon,
//     color,
//     variant,
//     disabled,
//     action,
//     showReject
//   } = STATUS_MAP[statusKey] || STATUS_MAP.default;

//   const handleAction = () => {
//     if (action === 'accept') return handleAcceptRequest;
//     if (action === 'send') return handleSendRequest;
//     return undefined;
//   };

//   return (
//     <div style={{ display: 'flex', gap: '8px' }}>
//       <Tooltip title={label} arrow>
//         <Button
//           variant={variant}
//           color={color}
//           size="small"
//           startIcon={isLoading ? <CircularProgress size={20} /> : icon}
//           onClick={handleAction()}
//           disabled={disabled || isLoading}
//           sx={{
//             textTransform: 'none',
//             minWidth: '120px',
//           }}
//         >
//           {label}
//         </Button>
//       </Tooltip>
      
//       {showReject && (
//         <Tooltip title="Reject Request" arrow>
//           <Button
//             variant="outlined"
//             color="error"
//             size="small"
//             onClick={handleRejectRequest}
//             disabled={isLoading}
//             sx={{
//               textTransform: 'none',
//               minWidth: '40px',
//             }}
//           >
//             <RejectIcon fontSize="small" />
//           </Button>
//         </Tooltip>
//       )}
//     </div>
//   );
// };

// export default FriendRequestButton;




