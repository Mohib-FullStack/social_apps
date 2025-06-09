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
  rejectFriendRequest,
  sendFriendRequest
} from '../../features/friendship/friendshipSlice';
import { showSnackbar } from '../../features/snackbar/snackbarSlice';

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
    } catch (error) {
      dispatch(
        showSnackbar({
          message: error.message || 'Failed to send friend request',
          severity: 'error',
        })
      );
    }
  };

  const handleAcceptRequest = async () => {
    try {
      if (!friendship.friendship?.id) {
        throw new Error('Friendship ID not available');
      }

      await dispatch(acceptFriendRequest(friendship.friendship.id)).unwrap();
      dispatch(showSnackbar({
        message: 'Request accepted!',
        severity: 'success'
      }));
    } catch (error) {
      dispatch(showSnackbar({
        message: error.message || 'Failed to accept',
        severity: 'error'
      }));
    }
  };

  const handleRejectRequest = async () => {
    try {
      if (!friendship.friendship?.id) {
        throw new Error('Friendship ID not found');
      }
      
      await dispatch(rejectFriendRequest(friendship.friendship.id)).unwrap();
      dispatch(
        showSnackbar({
          message: 'Friend request rejected',
          severity: 'success',
        })
      );
    } catch (error) {
      dispatch(
        showSnackbar({
          message: error.message || 'Failed to reject friend request',
          severity: 'error',
        })
      );
    }
  };

  if (!friendId || friendId === currentUserId) return null;

  const getButtonProps = () => {
    switch (friendship.status) {
      case 'pending' && friendship.direction === 'outgoing':
        return {
          label: 'Request Sent',
          icon: <PendingIcon />,
          color: 'secondary',
          variant: 'outlined',
          disabled: true,
        };
      case 'pending' && friendship.direction === 'incoming':
        return {
          label: 'Accept Request',
          icon: <AcceptIcon />,
          color: 'primary',
          variant: 'contained',
          action: handleAcceptRequest,
          secondaryAction: handleRejectRequest,
          showReject: true
        };
      case 'accepted':
        return {
          label: 'Friends',
          icon: <FriendsIcon />,
          color: 'success',
          variant: 'outlined',
          disabled: true,
        };
      default:
        return {
          label: 'Add Friend',
          icon: <AddFriendIcon />,
          color: 'primary',
          variant: 'contained',
          action: handleSendRequest,
        };
    }
  };

  const { label, icon, color, variant, disabled, action, secondaryAction, showReject } = getButtonProps();

  return (
    <div style={{ display: 'flex', gap: '8px' }}>
      <Tooltip title={label} arrow>
        <Button
          variant={variant}
          color={color}
          size="small"
          startIcon={isLoading ? <CircularProgress size={20} /> : icon}
          onClick={action}
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
            onClick={secondaryAction}
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




//! previous
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
//   rejectFriendRequest,
//   sendFriendRequest
// } from '../../features/friendship/friendshipSlice';
// import { showSnackbar } from '../../features/snackbar/snackbarSlice';

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
//     } catch (error) {
//       dispatch(
//         showSnackbar({
//           message: error.message || 'Failed to send friend request',
//           severity: 'error',
//         })
//       );
//     }
//   };

 

// const handleAcceptRequest = async () => {
//   try {
//     if (!friendship.friendship?.id) {
//       throw new Error('Friendship ID not available');
//     }

//     await dispatch(acceptFriendRequest(friendship.friendship.id)).unwrap();
//     dispatch(showSnackbar({
//       message: 'Request accepted!',
//       severity: 'success'
//     }));
//   } catch (error) {
//     dispatch(showSnackbar({
//       message: error.message || 'Failed to accept',
//       severity: 'error'
//     }));
//   }
// };


//   const handleRejectRequest = async () => {
//     try {
//       if (!friendship.friendship?.id) {
//         throw new Error('Request ID not found');
//       }
      
//       await dispatch(rejectFriendRequest(friendship.friendship.id)).unwrap();
//       dispatch(
//         showSnackbar({
//           message: 'Friend request rejected',
//           severity: 'success',
//         })
//       );
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

//   const getButtonProps = () => {
//     switch (friendship.status) {
//       case 'pending' && friendship.direction === 'outgoing':
//         return {
//           label: 'Request Sent',
//           icon: <PendingIcon />,
//           color: 'secondary',
//           variant: 'outlined',
//           disabled: true,
//         };
//       case 'pending' && friendship.direction === 'incoming':
//         return {
//           label: 'Accept Request',
//           icon: <AcceptIcon />,
//           color: 'primary',
//           variant: 'contained',
//           action: handleAcceptRequest,
//           secondaryAction: handleRejectRequest,
//           showReject: true
//         };
//       case 'accepted':
//         return {
//           label: 'Friends',
//           icon: <FriendsIcon />,
//           color: 'success',
//           variant: 'outlined',
//           disabled: true,
//         };
//       default:
//         return {
//           label: 'Add Friend',
//           icon: <AddFriendIcon />,
//           color: 'primary',
//           variant: 'contained',
//           action: handleSendRequest,
//         };
//     }
//   };

//   const { label, icon, color, variant, disabled, action, secondaryAction, showReject } = getButtonProps();

//   return (
//     <div style={{ display: 'flex', gap: '8px' }}>
//       <Tooltip title={label} arrow>
//         <Button
//           variant={variant}
//           color={color}
//           size="small"
//           startIcon={isLoading ? <CircularProgress size={20} /> : icon}
//           onClick={action}
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
//             onClick={secondaryAction}
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




