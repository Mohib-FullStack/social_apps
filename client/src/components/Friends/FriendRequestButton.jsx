// src/components/Friends/FriendRequestButton.jsx
import {
  PersonAddAlt1 as AcceptIcon,
  PersonAdd as AddFriendIcon,
  Close,
  Check as FriendsIcon,
  Schedule as PendingIcon,
  Close as RejectIcon,
} from '@mui/icons-material';
import {
  Box,
  Button,
  CircularProgress,
  Tooltip,
  keyframes,
  styled,
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import {
  acceptFriendRequest,
  checkFriendshipStatus,
  rejectFriendRequest,
  sendFriendRequest,
} from '../../features/friendship/friendshipSlice';
import { startLoading, stopLoading } from '../../features/loading/loadingSlice';
import { showSnackbar } from '../../features/snackbar/snackbarSlice';
import { getFriendlyErrorMessage } from '../../utils/friendshipErrors';

// Animations
const pulseRing = keyframes`
  0% { transform: scale(0.95); opacity: 0.8; }
  80% { transform: scale(1.2); opacity: 0; }
  100% { opacity: 0; }
`;

const bounce = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
`;

const shimmer = keyframes`
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
`;

const ProgressPulse = styled(CircularProgress)(({ theme }) => ({
  position: 'relative',
  '&:before': {
    content: '""',
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: '50%',
    border: `2px solid ${theme.palette.primary.main}`,
    animation: `${pulseRing} 1.5s cubic-bezier(0.215, 0.61, 0.355, 1) infinite`,
  },
}));

const STATUS_MAP = {
  pending_outgoing: {
    label: 'Request Sent',
    icon: <PendingIcon />,
    color: 'secondary',
    variant: 'outlined',
    disabled: true,
  },
  pending_incoming: {
    label: 'Accept Request',
    icon: <AcceptIcon />,
    color: 'primary',
    variant: 'contained',
    action: 'accept',
    showReject: true,
  },
  accepted: {
    label: 'Friends',
    icon: <FriendsIcon />,
    color: 'success',
    variant: 'outlined',
    disabled: true,
  },
  default: {
    label: 'Add Friend',
    icon: <AddFriendIcon />,
    color: 'primary',
    variant: 'contained',
    action: 'send',
  },
};

const FriendRequestButton = ({ friendId }) => {
  const dispatch = useDispatch();
  const currentUserId = useSelector((state) => state.user.profile?.id);
  const friendship = useSelector(
    (state) => state.friendship.statusLookup[friendId] || { status: 'none' }
  );
  const isLoading = useSelector((state) => state.loading.isLoading);

  const statusKey =
    friendship.status === 'pending'
      ? `${friendship.status}_${friendship.direction}`
      : friendship.status || 'default';

  const { label, icon, color, variant, disabled, action, showReject } =
    STATUS_MAP[statusKey] || STATUS_MAP.default;

  const executeWithLoading = async (asyncFn, loadingMessage) => {
    const loadingKey = `friendRequest:${friendId}`;
    dispatch(
      startLoading({
        message: loadingMessage,
        key: loadingKey,
        animationType: 'wave',
      })
    );

    try {
      await asyncFn();
    } finally {
      dispatch(stopLoading());
    }
  };

  const handleSendRequest = () => {
    executeWithLoading(async () => {
      dispatch(
        showSnackbar({
          message: 'Sending friend request...',
          severity: 'info',
          persist: true,
        })
      );
      await dispatch(
        sendFriendRequest({ friendId: Number(friendId) })
      ).unwrap();
      dispatch(
        showSnackbar({
          message: 'Friend request sent successfully!',
          severity: 'success',
          icon: <AddFriendIcon />,
          autoHideDuration: 3000,
        })
      );
      dispatch(checkFriendshipStatus(friendId));
    }, 'Sending friend request...').catch((error) => {
      dispatch(
        showSnackbar({
          message: getFriendlyErrorMessage(error.code),
          severity: 'error',
          icon: <Close fontSize="small" />,
          autoHideDuration: 4000,
        })
      );
    });
  };

  const handleAcceptRequest = () => {
    executeWithLoading(async () => {
      if (!friendship?.friendship?.id) throw new Error('Missing friendship ID');
      dispatch(
        showSnackbar({
          message: 'Accepting request...',
          severity: 'info',
          persist: true,
        })
      );

      const result = await dispatch(
        acceptFriendRequest(friendship.friendship.id)
      ).unwrap();
      dispatch(
        showSnackbar({
          message: result.message || 'Request accepted!',
          severity: 'success',
          icon: <Check />,
          autoHideDuration: 3000,
        })
      );
      dispatch(checkFriendshipStatus(friendId));
    }, 'Accepting friend request...').catch((error) => {
      dispatch(
        showSnackbar({
          message:
            getFriendlyErrorMessage(error.code) || 'Failed to accept request',
          severity: 'error',
          icon: <Close fontSize="small" />,
          autoHideDuration: 4000,
        })
      );
    });
  };

  const handleRejectRequest = () => {
    executeWithLoading(async () => {
      if (!friendship?.friendship?.id) throw new Error('Missing friendship ID');
      dispatch(
        showSnackbar({
          message: 'Rejecting request...',
          severity: 'info',
          persist: true,
        })
      );

      const result = await dispatch(
        rejectFriendRequest(friendship.friendship.id)
      ).unwrap();
      dispatch(
        showSnackbar({
          message: result.message || 'Friend request rejected.',
          severity: 'success',
          icon: <Close />,
          autoHideDuration: 3000,
        })
      );
      dispatch(checkFriendshipStatus(friendId));
    }, 'Rejecting friend request...').catch((error) => {
      dispatch(
        showSnackbar({
          message:
            getFriendlyErrorMessage(error.code) || 'Failed to reject request',
          severity: 'error',
          icon: <Close fontSize="small" />,
          autoHideDuration: 4000,
        })
      );
    });
  };

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

  if (!friendId || friendId === currentUserId) return null;

  return (
    <Box sx={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
      <Tooltip title={label} arrow>
        <Button
          variant={variant}
          color={color}
          size="small"
          startIcon={
            isLoading ? (
              <ProgressPulse
                size={20}
                thickness={4}
                sx={{ animation: `${bounce} 1s infinite ease-in-out` }}
              />
            ) : (
              icon
            )
          }
          onClick={handleAction()}
          disabled={disabled || isLoading}
          sx={{
            textTransform: 'none',
            minWidth: '120px',
            position: 'relative',
            overflow: 'hidden',
            '&:hover': {
              transform: isLoading ? 'none' : 'translateY(-2px)',
              boxShadow: isLoading ? 'none' : '0 4px 8px rgba(0,0,0,0.1)',
            },
            transition: 'all 0.3s ease',
            ...(isLoading && {
              '&:after': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: `linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)`,
                animation: `${shimmer} 1.5s infinite linear`,
              },
            }),
          }}
        >
          {isLoading ? (
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <span>Processing</span>
              <Box
                sx={{
                  display: 'flex',
                  '& > span': {
                    width: 4,
                    height: 4,
                    bgcolor: 'currentColor',
                    borderRadius: '50%',
                    display: 'inline-block',
                    mx: 0.5,
                    animation: `${bounce} 0.6s infinite ease-in-out`,
                    '&:nth-of-type(2)': { animationDelay: '0.2s' },
                    '&:nth-of-type(3)': { animationDelay: '0.4s' },
                  },
                }}
              >
                <span></span>
                <span></span>
                <span></span>
              </Box>
            </Box>
          ) : (
            label
          )}
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
              '&:hover': {
                transform: isLoading ? 'none' : 'translateY(-2px)',
                boxShadow: isLoading ? 'none' : '0 2px 4px rgba(0,0,0,0.1)',
              },
              transition: 'all 0.2s ease',
              '& .MuiSvgIcon-root': {
                transition: 'transform 0.3s ease',
                transform: isLoading ? 'rotate(90deg)' : 'none',
              },
            }}
          >
            <RejectIcon fontSize="small" />
          </Button>
        </Tooltip>
      )}
    </Box>
  );
};

export default FriendRequestButton;

//! good
// import {
//   PersonAddAlt1 as AcceptIcon,
//   PersonAdd as AddFriendIcon,
//   Close,
//   Check as FriendsIcon,
//   Schedule as PendingIcon,
//   Close as RejectIcon
// } from '@mui/icons-material';
// import {
//   Box, Button, CircularProgress, Tooltip,
//   keyframes, styled
// } from '@mui/material';
// import { useDispatch, useSelector } from 'react-redux';
// import {
//   acceptFriendRequest,
//   checkFriendshipStatus,
//   rejectFriendRequest,
//   sendFriendRequest
// } from '../../features/friendship/friendshipSlice';
// import { startLoading, stopLoading } from '../../features/loading/loadingSlice';
// import { showSnackbar } from '../../features/snackbar/snackbarSlice';
// import { getFriendlyErrorMessage } from '../../utils/friendshipErrors';

// // Animations
// const pulseRing = keyframes`
//   0% { transform: scale(0.95); opacity: 0.8; }
//   80% { transform: scale(1.2); opacity: 0; }
//   100% { opacity: 0; }
// `;

// const bounce = keyframes`
//   0%, 100% { transform: translateY(0); }
//   50% { transform: translateY(-5px); }
// `;

// const shimmer = keyframes`
//   0% { transform: translateX(-100%); }
//   100% { transform: translateX(100%); }
// `;

// const ProgressPulse = styled(CircularProgress)(({ theme }) => ({
//   position: 'relative',
//   '&:before': {
//     content: '""',
//     position: 'absolute',
//     width: '100%',
//     height: '100%',
//     borderRadius: '50%',
//     border: `2px solid ${theme.palette.primary.main}`,
//     animation: `${pulseRing} 1.5s cubic-bezier(0.215, 0.61, 0.355, 1) infinite`,
//   },
// }));

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
//   const isLoading = useSelector((state) => state.loading.isLoading);

//   const statusKey = friendship.status === 'pending'
//     ? `${friendship.status}_${friendship.direction}`
//     : friendship.status || 'default';

//   const {
//     label, icon, color, variant, disabled, action, showReject
//   } = STATUS_MAP[statusKey] || STATUS_MAP.default;

//   const executeWithLoading = async (asyncFn, loadingMessage) => {
//     const loadingKey = `friendRequest:${friendId}`;
//     dispatch(startLoading({
//       message: loadingMessage,
//       key: loadingKey
//     }));

//     try {
//       await asyncFn();
//     } finally {
//       dispatch(stopLoading());
//     }
//   };

//   const handleSendRequest = () => {
//     executeWithLoading(async () => {
//       dispatch(showSnackbar({ message: 'Sending friend request...', severity: 'info', persist: true }));
//       await dispatch(sendFriendRequest({ friendId: Number(friendId) })).unwrap();
//       dispatch(showSnackbar({
//         message: 'Friend request sent successfully!',
//         severity: 'success',
//         icon: <AddFriendIcon />,
//         autoHideDuration: 3000
//       }));
//       dispatch(checkFriendshipStatus(friendId));
//     }, 'Sending friend request...').catch((error) => {
//       dispatch(showSnackbar({
//         message: getFriendlyErrorMessage(error.code),
//         severity: 'error',
//         icon: <Close fontSize="small" />,
//         autoHideDuration: 4000
//       }));
//     });
//   };

//   const handleAcceptRequest = () => {
//     executeWithLoading(async () => {
//       if (!friendship?.friendship?.id) throw new Error('Missing friendship ID');
//       dispatch(showSnackbar({ message: 'Accepting request...', severity: 'info', persist: true }));

//       const result = await dispatch(acceptFriendRequest(friendship.friendship.id)).unwrap();
//       dispatch(showSnackbar({
//         message: result.message || 'Request accepted!',
//         severity: 'success',
//         icon: <Check />,
//         autoHideDuration: 3000
//       }));
//       dispatch(checkFriendshipStatus(friendId));
//     }, 'Accepting friend request...').catch((error) => {
//       dispatch(showSnackbar({
//         message: getFriendlyErrorMessage(error.code) || 'Failed to accept request',
//         severity: 'error',
//         icon: <Close fontSize="small" />,
//         autoHideDuration: 4000
//       }));
//     });
//   };

//   const handleRejectRequest = () => {
//     executeWithLoading(async () => {
//       if (!friendship?.friendship?.id) throw new Error('Missing friendship ID');
//       dispatch(showSnackbar({ message: 'Rejecting request...', severity: 'info', persist: true }));

//       const result = await dispatch(rejectFriendRequest(friendship.friendship.id)).unwrap();
//       dispatch(showSnackbar({
//         message: result.message || 'Friend request rejected.',
//         severity: 'success',
//         icon: <Close />,
//         autoHideDuration: 3000
//       }));
//       dispatch(checkFriendshipStatus(friendId));
//     }, 'Rejecting friend request...').catch((error) => {
//       dispatch(showSnackbar({
//         message: getFriendlyErrorMessage(error.code) || 'Failed to reject request',
//         severity: 'error',
//         icon: <Close fontSize="small" />,
//         autoHideDuration: 4000
//       }));
//     });
//   };

//   const handleAction = () => {
//     switch (action) {
//       case 'accept': return handleAcceptRequest;
//       case 'send': return handleSendRequest;
//       default: return undefined;
//     }
//   };

//   if (!friendId || friendId === currentUserId) return null;

//   return (
//     <Box sx={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
//       <Tooltip title={label} arrow>
//         <Button
//           variant={variant}
//           color={color}
//           size="small"
//           startIcon={isLoading ? (
//             <ProgressPulse size={20} thickness={4} sx={{ animation: `${bounce} 1s infinite ease-in-out` }} />
//           ) : icon}
//           onClick={handleAction()}
//           disabled={disabled || isLoading}
//           sx={{
//             textTransform: 'none',
//             minWidth: '120px',
//             position: 'relative',
//             overflow: 'hidden',
//             '&:hover': {
//               transform: isLoading ? 'none' : 'translateY(-2px)',
//               boxShadow: isLoading ? 'none' : '0 4px 8px rgba(0,0,0,0.1)',
//             },
//             transition: 'all 0.3s ease',
//             ...(isLoading && {
//               '&:after': {
//                 content: '""',
//                 position: 'absolute',
//                 top: 0,
//                 left: 0,
//                 width: '100%',
//                 height: '100%',
//                 background: `linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)`,
//                 animation: `${shimmer} 1.5s infinite linear`,
//               }
//             })
//           }}
//         >
//           {isLoading ? (
//             <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
//               <span>Processing</span>
//               <Box sx={{
//                 display: 'flex',
//                 '& > span': {
//                   width: 4,
//                   height: 4,
//                   bgcolor: 'currentColor',
//                   borderRadius: '50%',
//                   display: 'inline-block',
//                   mx: 0.5,
//                   animation: `${bounce} 0.6s infinite ease-in-out`,
//                   '&:nth-of-type(2)': { animationDelay: '0.2s' },
//                   '&:nth-of-type(3)': { animationDelay: '0.4s' }
//                 }
//               }}>
//                 <span></span><span></span><span></span>
//               </Box>
//             </Box>
//           ) : label}
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
//               '&:hover': {
//                 transform: isLoading ? 'none' : 'translateY(-2px)',
//                 boxShadow: isLoading ? 'none' : '0 2px 4px rgba(0,0,0,0.1)',
//               },
//               transition: 'all 0.2s ease',
//               '& .MuiSvgIcon-root': {
//                 transition: 'transform 0.3s ease',
//                 transform: isLoading ? 'rotate(90deg)' : 'none'
//               }
//             }}
//           >
//             <RejectIcon fontSize="small" />
//           </Button>
//         </Tooltip>
//       )}
//     </Box>
//   );
// };

// export default FriendRequestButton;

//! good
// import {
//   PersonAddAlt1 as AcceptIcon,
//   PersonAdd as AddFriendIcon,
//   Close,
//   Check as FriendsIcon,
//   Schedule as PendingIcon,
//   Close as RejectIcon
// } from '@mui/icons-material';
// import {
//   Box, Button, CircularProgress, Tooltip,
//   keyframes, styled
// } from '@mui/material';
// import { useDispatch, useSelector } from 'react-redux';
// import {
//   acceptFriendRequest,
//   checkFriendshipStatus,
//   rejectFriendRequest,
//   sendFriendRequest
// } from '../../features/friendship/friendshipSlice';
// import { startLoading, stopLoading } from '../../features/loading/loadingSlice';
// import { showSnackbar } from '../../features/snackbar/snackbarSlice';
// import { getFriendlyErrorMessage } from '../../utils/friendshipErrors';

// // Animations
// const pulseRing = keyframes`
//   0% { transform: scale(0.95); opacity: 0.8; }
//   80% { transform: scale(1.2); opacity: 0; }
//   100% { opacity: 0; }
// `;

// const bounce = keyframes`
//   0%, 100% { transform: translateY(0); }
//   50% { transform: translateY(-5px); }
// `;

// const shimmer = keyframes`
//   0% { transform: translateX(-100%); }
//   100% { transform: translateX(100%); }
// `;

// const ProgressPulse = styled(CircularProgress)(({ theme }) => ({
//   position: 'relative',
//   '&:before': {
//     content: '""',
//     position: 'absolute',
//     width: '100%',
//     height: '100%',
//     borderRadius: '50%',
//     border: `2px solid ${theme.palette.primary.main}`,
//     animation: `${pulseRing} 1.5s cubic-bezier(0.215, 0.61, 0.355, 1) infinite`,
//   },
// }));

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
//   const isLoading = useSelector((state) => state.loading.isLoading);

//   const statusKey = friendship.status === 'pending'
//     ? `${friendship.status}_${friendship.direction}`
//     : friendship.status || 'default';

//   const {
//     label, icon, color, variant, disabled, action, showReject
//   } = STATUS_MAP[statusKey] || STATUS_MAP.default;

//   const executeWithLoading = async (asyncFn) => {
//     dispatch(startLoading(`friendRequest:${friendId}`));
//     try {
//       await asyncFn();
//     } finally {
//       dispatch(stopLoading());
//     }
//   };

//   const handleSendRequest = () => {
//     executeWithLoading(async () => {
//       dispatch(showSnackbar({ message: 'Sending friend request...', severity: 'info', persist: true }));
//       await dispatch(sendFriendRequest({ friendId: Number(friendId) })).unwrap();
//       dispatch(showSnackbar({
//         message: 'Friend request sent successfully!',
//         severity: 'success',
//         icon: <AddFriendIcon />,
//         autoHideDuration: 3000
//       }));
//       dispatch(checkFriendshipStatus(friendId));
//     }).catch((error) => {
//       dispatch(showSnackbar({
//         message: getFriendlyErrorMessage(error.code),
//         severity: 'error',
//         icon: <Close fontSize="small" />,
//         autoHideDuration: 4000
//       }));
//     });
//   };

//   const handleAcceptRequest = () => {
//     executeWithLoading(async () => {
//       if (!friendship?.friendship?.id) throw new Error('Missing friendship ID');
//       dispatch(showSnackbar({ message: 'Accepting request...', severity: 'info', persist: true }));

//       const result = await dispatch(acceptFriendRequest(friendship.friendship.id)).unwrap();
//       dispatch(showSnackbar({
//         message: result.message || 'Request accepted!',
//         severity: 'success',
//         icon: <Check />,
//         autoHideDuration: 3000
//       }));
//       dispatch(checkFriendshipStatus(friendId));
//     }).catch((error) => {
//       dispatch(showSnackbar({
//         message: getFriendlyErrorMessage(error.code) || 'Failed to accept request',
//         severity: 'error',
//         icon: <Close fontSize="small" />,
//         autoHideDuration: 4000
//       }));
//     });
//   };

//   const handleRejectRequest = () => {
//     executeWithLoading(async () => {
//       if (!friendship?.friendship?.id) throw new Error('Missing friendship ID');
//       dispatch(showSnackbar({ message: 'Rejecting request...', severity: 'info', persist: true }));

//       const result = await dispatch(rejectFriendRequest(friendship.friendship.id)).unwrap();
//       dispatch(showSnackbar({
//         message: result.message || 'Friend request rejected.',
//         severity: 'success',
//         icon: <Close />,
//         autoHideDuration: 3000
//       }));
//       dispatch(checkFriendshipStatus(friendId));
//     }).catch((error) => {
//       dispatch(showSnackbar({
//         message: getFriendlyErrorMessage(error.code) || 'Failed to reject request',
//         severity: 'error',
//         icon: <Close fontSize="small" />,
//         autoHideDuration: 4000
//       }));
//     });
//   };

//   const handleAction = () => {
//     switch (action) {
//       case 'accept': return handleAcceptRequest;
//       case 'send': return handleSendRequest;
//       default: return undefined;
//     }
//   };

//   if (!friendId || friendId === currentUserId) return null;

//   return (
//     <Box sx={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
//       <Tooltip title={label} arrow>
//         <Button
//           variant={variant}
//           color={color}
//           size="small"
//           startIcon={isLoading ? (
//             <ProgressPulse size={20} thickness={4} sx={{ animation: `${bounce} 1s infinite ease-in-out` }} />
//           ) : icon}
//           onClick={handleAction()}
//           disabled={disabled || isLoading}
//           sx={{
//             textTransform: 'none',
//             minWidth: '120px',
//             position: 'relative',
//             overflow: 'hidden',
//             '&:hover': {
//               transform: isLoading ? 'none' : 'translateY(-2px)',
//               boxShadow: isLoading ? 'none' : '0 4px 8px rgba(0,0,0,0.1)',
//             },
//             transition: 'all 0.3s ease',
//             ...(isLoading && {
//               '&:after': {
//                 content: '""',
//                 position: 'absolute',
//                 top: 0,
//                 left: 0,
//                 width: '100%',
//                 height: '100%',
//                 background: `linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)`,
//                 animation: `${shimmer} 1.5s infinite linear`,
//               }
//             })
//           }}
//         >
//           {isLoading ? (
//             <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
//               <span>Processing</span>
//               <Box sx={{
//                 display: 'flex',
//                 '& > span': {
//                   width: 4,
//                   height: 4,
//                   bgcolor: 'currentColor',
//                   borderRadius: '50%',
//                   display: 'inline-block',
//                   mx: 0.5,
//                   animation: `${bounce} 0.6s infinite ease-in-out`,
//                   '&:nth-of-type(2)': { animationDelay: '0.2s' },
//                   '&:nth-of-type(3)': { animationDelay: '0.4s' }
//                 }
//               }}>
//                 <span></span><span></span><span></span>
//               </Box>
//             </Box>
//           ) : label}
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
//               '&:hover': {
//                 transform: isLoading ? 'none' : 'translateY(-2px)',
//                 boxShadow: isLoading ? 'none' : '0 2px 4px rgba(0,0,0,0.1)',
//               },
//               transition: 'all 0.2s ease',
//               '& .MuiSvgIcon-root': {
//                 transition: 'transform 0.3s ease',
//                 transform: isLoading ? 'rotate(90deg)' : 'none'
//               }
//             }}
//           >
//             <RejectIcon fontSize="small" />
//           </Button>
//         </Tooltip>
//       )}
//     </Box>
//   );
// };

// export default FriendRequestButton;

//! good
// import {
//   PersonAddAlt1 as AcceptIcon,
//   PersonAdd as AddFriendIcon,
//   Check as FriendsIcon,
//   Schedule as PendingIcon,
//   Close as RejectIcon
// } from '@mui/icons-material';
// import { Box, Button, CircularProgress, Tooltip, keyframes, styled } from '@mui/material';
// import { useDispatch, useSelector } from 'react-redux';
// import {
//   acceptFriendRequest,
//   checkFriendshipStatus,
//   rejectFriendRequest,
//   sendFriendRequest
// } from '../../features/friendship/friendshipSlice';
// import { showSnackbar } from '../../features/snackbar/snackbarSlice';
// import { getFriendlyErrorMessage } from '../../utils/friendshipErrors';

// // Animations
// const pulseRing = keyframes`
//   0% { transform: scale(0.95); opacity: 0.8; }
//   80% { transform: scale(1.2); opacity: 0; }
//   100% { opacity: 0; }
// `;

// const bounce = keyframes`
//   0%, 100% { transform: translateY(0); }
//   50% { transform: translateY(-5px); }
// `;

// const shimmer = keyframes`
//   0% { transform: translateX(-100%); }
//   100% { transform: translateX(100%); }
// `;

// const ProgressPulse = styled(CircularProgress)(({ theme }) => ({
//   position: 'relative',
//   '&:before': {
//     content: '""',
//     position: 'absolute',
//     width: '100%',
//     height: '100%',
//     borderRadius: '50%',
//     border: `2px solid ${theme.palette.primary.main}`,
//     animation: `${pulseRing} 1.5s cubic-bezier(0.215, 0.61, 0.355, 1) infinite`,
//   },
// }));

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
//       dispatch(
//         showSnackbar({
//           message: 'Sending friend request...',
//           severity: 'info',
//           persist: true
//         })
//       );

//       await dispatch(sendFriendRequest({ friendId: Number(friendId) })).unwrap();

//       dispatch(
//         showSnackbar({
//           message: 'Friend request sent successfully!',
//           severity: 'success',
//           icon: <AddFriendIcon />,
//           autoHideDuration: 3000
//         })
//       );
//       dispatch(checkFriendshipStatus(friendId));
//     } catch (error) {
//       const friendlyMessage = getFriendlyErrorMessage(error.code);
//       dispatch(
//         showSnackbar({
//           message: friendlyMessage,
//           severity: 'error',
//           icon: <Close fontSize="small" />,
//           autoHideDuration: error.code === 'REQUEST_ALREADY_RECEIVED' ? 6000 : 3000
//         })
//       );
//     }
//   };

//   const handleAcceptRequest = async () => {
//     try {
//       if (!friendship?.friendship?.id) {
//         throw new Error('Friendship ID not available');
//       }

//       dispatch(
//         showSnackbar({
//           message: 'Accepting request...',
//           severity: 'info',
//           persist: true
//         })
//       );

//       const result = await dispatch(
//         acceptFriendRequest(friendship.friendship.id)
//       ).unwrap();

//       if (result?.friendship) {
//         dispatch(
//           showSnackbar({
//             message: result.message || 'Request accepted! You are now friends.',
//             severity: 'success',
//             icon: <Check />,
//             autoHideDuration: 4000
//           })
//         );
//         dispatch(checkFriendshipStatus(friendId));
//       } else {
//         throw new Error('Invalid response from server');
//       }
//     } catch (error) {
//       dispatch(
//         showSnackbar({
//           message: getFriendlyErrorMessage(error.code) || 'Failed to accept request',
//           severity: 'error',
//           icon: <Close fontSize="small" />,
//           autoHideDuration: 4000
//         })
//       );
//     }
//   };

//   const handleRejectRequest = async () => {
//     try {
//       if (!friendship?.friendship?.id) {
//         throw new Error('Friendship ID not found');
//       }

//       dispatch(
//         showSnackbar({
//           message: 'Processing rejection...',
//           severity: 'info',
//           persist: true
//         })
//       );

//       const result = await dispatch(rejectFriendRequest(friendship.friendship.id)).unwrap();

//       if (result?.friendship?.id) {
//         dispatch(
//           showSnackbar({
//             message: result.message || 'Friend request rejected',
//             severity: 'success',
//             icon: <Close />,
//             autoHideDuration: 3000
//           })
//         );
//         dispatch(checkFriendshipStatus(friendId));
//       } else {
//         throw new Error('Invalid response from server');
//       }
//     } catch (error) {
//       dispatch(
//         showSnackbar({
//           message: getFriendlyErrorMessage(error.code) || 'Failed to reject friend request',
//           severity: 'error',
//           icon: <Close fontSize="small" />,
//           autoHideDuration: 4000
//         })
//       );
//     }
//   };

//   if (!friendId || friendId === currentUserId) return null;

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
//     switch (action) {
//       case 'accept':
//         return handleAcceptRequest;
//       case 'send':
//         return handleSendRequest;
//       default:
//         return undefined;
//     }
//   };

//   return (
//     <Box sx={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
//       <Tooltip title={label} arrow>
//         <Button
//           variant={variant}
//           color={color}
//           size="small"
//           startIcon={isLoading ? (
//             <ProgressPulse
//               size={20}
//               thickness={4}
//               sx={{
//                 color: variant === 'contained' ? 'common.white' : 'primary.main',
//                 animation: `${bounce} 0.8s infinite ease-in-out`,
//               }}
//             />
//           ) : icon}
//           onClick={handleAction()}
//           disabled={disabled || isLoading}
//           sx={{
//             textTransform: 'none',
//             minWidth: '120px',
//             position: 'relative',
//             overflow: 'hidden',
//             '&:hover': {
//               transform: isLoading ? 'none' : 'translateY(-2px)',
//               boxShadow: isLoading ? 'none' : '0 4px 8px rgba(0,0,0,0.1)',
//             },
//             transition: 'all 0.3s ease',
//             ...(isLoading && {
//               '&:after': {
//                 content: '""',
//                 position: 'absolute',
//                 top: 0,
//                 left: 0,
//                 width: '100%',
//                 height: '100%',
//                 background: `linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)`,
//                 animation: `${shimmer} 1.5s infinite linear`,
//               }
//             })
//           }}
//         >
//           {isLoading ? (
//             <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
//               <span>Processing</span>
//               <Box component="span" sx={{
//                 display: 'flex',
//                 '& > span': {
//                   width: 4,
//                   height: 4,
//                   bgcolor: 'currentColor',
//                   borderRadius: '50%',
//                   display: 'inline-block',
//                   mx: 0.5,
//                   animation: `${bounce} 0.6s infinite ease-in-out`,
//                   '&:nth-of-type(2)': { animationDelay: '0.2s' },
//                   '&:nth-of-type(3)': { animationDelay: '0.4s' },
//                 }
//               }}>
//                 <span></span>
//                 <span></span>
//                 <span></span>
//               </Box>
//             </Box>
//           ) : label}
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
//               '&:hover': {
//                 transform: isLoading ? 'none' : 'translateY(-2px)',
//                 boxShadow: isLoading ? 'none' : '0 2px 4px rgba(0,0,0,0.1)',
//               },
//               transition: 'all 0.2s ease',
//               '& .MuiSvgIcon-root': {
//                 transition: 'transform 0.3s ease',
//                 transform: isLoading ? 'rotate(90deg)' : 'none'
//               }
//             }}
//           >
//             <RejectIcon fontSize="small" />
//           </Button>
//         </Tooltip>
//       )}
//     </Box>
//   );
// };

// export default FriendRequestButton;

//! good
// Updated FriendRequestButton.jsx
// import {
//   PersonAddAlt1 as AcceptIcon,
//   PersonAdd as AddFriendIcon,
//   Check as FriendsIcon,
//   Schedule as PendingIcon,
//   Close as RejectIcon
// } from '@mui/icons-material';
// import { Button, CircularProgress, Tooltip, keyframes } from '@mui/material';
// import { useDispatch, useSelector } from 'react-redux';
// import {
//   acceptFriendRequest,
//   checkFriendshipStatus,
//   rejectFriendRequest,
//   sendFriendRequest
// } from '../../features/friendship/friendshipSlice';
// import { showSnackbar } from '../../features/snackbar/snackbarSlice';
// import { getFriendlyErrorMessage } from '../../utils/friendshipErrors';

// // Add some animations
// const pulse = keyframes`
//   0% { transform: scale(1); opacity: 1; }
//   50% { transform: scale(1.05); opacity: 0.7; }
//   100% { transform: scale(1); opacity: 1; }
// `;

// const spin = keyframes`
//   0% { transform: rotate(0deg); }
//   100% { transform: rotate(360deg); }
// `;

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
//       dispatch(
//         showSnackbar({
//           message: 'Sending friend request...',
//           severity: 'info',
//           persist: true
//         })
//       );

//       await dispatch(sendFriendRequest({ friendId: Number(friendId) })).unwrap();

//       dispatch(
//         showSnackbar({
//           message: 'Friend request sent successfully!',
//           severity: 'success',
//           icon: <AddFriendIcon />,
//           autoHideDuration: 3000
//         })
//       );
//       dispatch(checkFriendshipStatus(friendId));
//     } catch (error) {
//       const friendlyMessage = getFriendlyErrorMessage(error.code);
//       dispatch(
//         showSnackbar({
//           message: friendlyMessage,
//           severity: 'error',
//           icon: <Close fontSize="small" />,
//           autoHideDuration: error.code === 'REQUEST_ALREADY_RECEIVED' ? 6000 : 3000
//         })
//       );
//     }
//   };

//   const handleAcceptRequest = async () => {
//     try {
//       if (!friendship?.friendship?.id) {
//         throw new Error('Friendship ID not available');
//       }

//       dispatch(
//         showSnackbar({
//           message: 'Accepting request...',
//           severity: 'info',
//           persist: true
//         })
//       );

//       const result = await dispatch(
//         acceptFriendRequest(friendship.friendship.id)
//       ).unwrap();

//       if (result?.friendship) {
//         dispatch(
//           showSnackbar({
//             message: result.message || 'Request accepted! You are now friends.',
//             severity: 'success',
//             icon: <Check />,
//             autoHideDuration: 4000
//           })
//         );
//         dispatch(checkFriendshipStatus(friendId));
//       } else {
//         throw new Error('Invalid response from server');
//       }
//     } catch (error) {
//       dispatch(
//         showSnackbar({
//           message: getFriendlyErrorMessage(error.code) || 'Failed to accept request',
//           severity: 'error',
//           icon: <Close fontSize="small" />,
//           autoHideDuration: 4000
//         })
//       );
//     }
//   };

//   const handleRejectRequest = async () => {
//     try {
//       if (!friendship?.friendship?.id) {
//         throw new Error('Friendship ID not found');
//       }

//       dispatch(
//         showSnackbar({
//           message: 'Processing rejection...',
//           severity: 'info',
//           persist: true
//         })
//       );

//       const result = await dispatch(rejectFriendRequest(friendship.friendship.id)).unwrap();

//       if (result?.friendship?.id) {
//         dispatch(
//           showSnackbar({
//             message: result.message || 'Friend request rejected',
//             severity: 'success',
//             icon: <Close />,
//             autoHideDuration: 3000
//           })
//         );
//         dispatch(checkFriendshipStatus(friendId));
//       } else {
//         throw new Error('Invalid response from server');
//       }
//     } catch (error) {
//       dispatch(
//         showSnackbar({
//           message: getFriendlyErrorMessage(error.code) || 'Failed to reject friend request',
//           severity: 'error',
//           icon: <Close fontSize="small" />,
//           autoHideDuration: 4000
//         })
//       );
//     }
//   };

//   if (!friendId || friendId === currentUserId) return null;

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
//     switch (action) {
//       case 'accept':
//         return handleAcceptRequest;
//       case 'send':
//         return handleSendRequest;
//       default:
//         return undefined;
//     }
//   };

//   return (
//     <div style={{ display: 'flex', gap: '8px' }}>
//       <Tooltip title={label} arrow>
//         <Button
//           variant={variant}
//           color={color}
//           size="small"
//           startIcon={isLoading ? (
//             <CircularProgress
//               size={20}
//               sx={{
//                 animation: `${spin} 1s linear infinite`,
//                 color: variant === 'contained' ? 'common.white' : 'primary.main'
//               }}
//             />
//           ) : icon}
//           onClick={handleAction()}
//           disabled={disabled || isLoading}
//           sx={{
//             textTransform: 'none',
//             minWidth: '120px',
//             animation: isLoading ? `${pulse} 1.5s ease infinite` : 'none',
//             position: 'relative',
//             overflow: 'hidden',
//             '&:after': {
//               content: '""',
//               position: 'absolute',
//               top: 0,
//               left: 0,
//               width: isLoading ? '100%' : '0%',
//               height: '100%',
//               backgroundColor: 'rgba(255, 255, 255, 0.3)',
//               transition: 'width 0.3s ease',
//               pointerEvents: 'none'
//             }
//           }}
//         >
//           {isLoading ? (
//             <span style={{ opacity: 0.7 }}>Processing...</span>
//           ) : label}
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
//               animation: isLoading ? `${pulse} 1.5s ease infinite` : 'none',
//               '& .MuiSvgIcon-root': {
//                 transition: 'transform 0.3s ease',
//                 transform: isLoading ? 'rotate(90deg)' : 'none'
//               }
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

//! original
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
// import { getFriendlyErrorMessage } from '../../utils/friendshipErrors';

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
//       const friendlyMessage = getFriendlyErrorMessage(error.code);
//       dispatch(
//         showSnackbar({
//           message: friendlyMessage,
//           severity: 'error',
//           autoHideDuration: error.code === 'REQUEST_ALREADY_RECEIVED' ? 6000 : 3000
//         })
//       );
//     }
//   };

//   const handleAcceptRequest = async () => {
//     try {
//       if (!friendship?.friendship?.id) {
//         throw new Error('Friendship ID not available');
//       }

//       const result = await dispatch(
//         acceptFriendRequest(friendship.friendship.id)
//       ).unwrap();

//       if (result?.friendship) {
//         dispatch(
//           showSnackbar({
//             message: result.message || 'Request accepted!',
//             severity: 'success'
//           })
//         );
//         dispatch(checkFriendshipStatus(friendId));
//       } else {
//         throw new Error('Invalid response from server');
//       }
//     } catch (error) {
//       dispatch(
//         showSnackbar({
//           message: getFriendlyErrorMessage(error.code) || 'Failed to accept request',
//           severity: 'error'
//         })
//       );
//     }
//   };

//   const handleRejectRequest = async () => {
//   try {
//     if (!friendship?.friendship?.id) {
//       throw new Error('Friendship ID not found');
//     }

//     const result = await dispatch(rejectFriendRequest(friendship.friendship.id)).unwrap();

//     if (result?.friendship?.id) {
//       dispatch(
//         showSnackbar({
//           message: result.message || 'Friend request rejected',
//           severity: 'success',
//         })
//       );
//       dispatch(checkFriendshipStatus(friendId));
//     } else {
//       throw new Error('Invalid response from server');
//     }
//   } catch (error) {
//     console.error('Reject error:', error);
//     dispatch(
//       showSnackbar({
//         message: getFriendlyErrorMessage(error.code) || 'Failed to reject friend request',
//         severity: 'error',
//       })
//     );
//   }
// };

//   if (!friendId || friendId === currentUserId) return null;

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
//     switch (action) {
//       case 'accept':
//         return handleAcceptRequest;
//       case 'send':
//         return handleSendRequest;
//       default:
//         return undefined;
//     }
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
