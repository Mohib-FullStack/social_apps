// src/components/Friends/FriendRequestButton.jsx
// Updated FriendRequestButton.jsx with centralized loading

import {
  PersonAddAlt1 as AcceptIcon,
  PersonAdd as AddFriendIcon,
  Check as FriendsIcon,
  Schedule as PendingIcon,
  Close as RejectIcon
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
  pending_outgoing: { label: 'Request Sent', icon: <PendingIcon />, color: 'secondary', variant: 'outlined', disabled: true },
  pending_incoming: { label: 'Accept Request', icon: <AcceptIcon />, color: 'primary', variant: 'contained', action: 'accept', showReject: true },
  accepted: { label: 'Friends', icon: <FriendsIcon />, color: 'success', variant: 'outlined', disabled: true },
  default: { label: 'Add Friend', icon: <AddFriendIcon />, color: 'primary', variant: 'contained', action: 'send' },
};

const FriendRequestButton = ({ friendId }) => {
  const dispatch = useDispatch();
  const currentUserId = useSelector((state) => state.user.profile?.id);
  const friendship = useSelector((state) => state.friendship.statusLookup[friendId] || { status: 'none' });
  const isLoading = useSelector((state) => state.loading.isLoading);

  const statusKey = friendship.status === 'pending' ? `${friendship.status}_${friendship.direction}` : friendship.status || 'default';
  const { label, icon, color, variant, disabled, action, showReject } = STATUS_MAP[statusKey] || STATUS_MAP.default;

  const executeWithLoading = async (asyncFn, loadingMessage) => {
    dispatch(startLoading({ message: loadingMessage, animationType: 'wave' }));
    try {
      await asyncFn();
    } catch (error) {
      throw error;
    } finally {
      setTimeout(() => dispatch(stopLoading()), 300);
    }
  };

  const handleSendRequest = () => {
    executeWithLoading(async () => {
      const friend = friendship?.friend || {};
      const friendName = `${friend.firstName || ''} ${friend.lastName || ''}`.trim();
      const friendAvatar = friend.profileImage || '/default-avatar.png';

      await dispatch(sendFriendRequest({ friendId: Number(friendId) })).unwrap();

      dispatch(showSnackbar({
        message: `🎉 Friend request sent to ${friend.firstName || 'user'}!`,
        severity: 'success', duration: 8000, username: friendName, avatarUrl: friendAvatar,
      }));

      dispatch(checkFriendshipStatus(friendId));
    }, 'Sending friend request...').catch((error) => {
      dispatch(showSnackbar({
        message: getFriendlyErrorMessage(error.code),
        severity: 'error', duration: 4000,
      }));
    });
  };

  const handleAcceptRequest = () => {
    executeWithLoading(async () => {
      if (!friendship?.friendship?.id) throw new Error('Missing friendship ID');

      const result = await dispatch(acceptFriendRequest(friendship.friendship.id)).unwrap();
      const user = result?.user || {};

      dispatch(showSnackbar({
        message: `🎊 You are now friends with ${user.firstName || 'user'}!`,
        severity: 'success', duration: 8000,
        username: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
        avatarUrl: user.profileImage || '/default-avatar.png',
      }));

      dispatch(checkFriendshipStatus(friendId));
    }, 'Accepting friend request...').catch((error) => {
      dispatch(showSnackbar({
        message: getFriendlyErrorMessage(error.code) || 'Failed to accept request',
        severity: 'error', duration: 4000,
      }));
    });
  };

  const handleRejectRequest = () => {
    executeWithLoading(async () => {
      if (!friendship?.friendship?.id) throw new Error('Missing friendship ID');

      const result = await dispatch(rejectFriendRequest(friendship.friendship.id)).unwrap();
      const user = result?.user || {};

      dispatch(showSnackbar({
        message: `❌ You declined ${user.firstName || 'the user'}'s friend request.`,
        severity: 'warning', duration: 8000,
        username: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
        avatarUrl: user.profileImage || '/default-avatar.png',
      }));

      dispatch(checkFriendshipStatus(friendId));
    }, 'Rejecting friend request...').catch((error) => {
      dispatch(showSnackbar({
        message: getFriendlyErrorMessage(error.code) || 'Failed to reject request',
        severity: 'error', duration: 4000,
      }));
    });
  };

  const handleAction = () => {
    switch (action) {
      case 'accept': return handleAcceptRequest;
      case 'send': return handleSendRequest;
      default: return undefined;
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
          startIcon={isLoading ? <ProgressPulse size={20} thickness={4} /> : icon}
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
          }}
        >
          {isLoading ? (
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <span>Processing</span>
              <Box sx={{ display: 'flex' }}>
                {[...Array(3)].map((_, i) => (
                  <span
                    key={i}
                    style={{
                      width: 4,
                      height: 4,
                      margin: '0 2px',
                      borderRadius: '50%',
                      backgroundColor: 'currentColor',
                      animation: `${bounce} 0.6s infinite ease-in-out`,
                      animationDelay: `${i * 0.2}s`,
                      display: 'inline-block',
                    }}
                  />
                ))}
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


//! original
// import {
//   PersonAddAlt1 as AcceptIcon,
//   PersonAdd as AddFriendIcon,
//   Check as FriendsIcon,
//   Schedule as PendingIcon,
//   Close as RejectIcon
// } from '@mui/icons-material';
// import {
//   Box,
//   Button,
//   CircularProgress,
//   Tooltip,
//   keyframes,
//   styled,
// } from '@mui/material';
// import { useDispatch, useSelector } from 'react-redux';
// import {
//   acceptFriendRequest,
//   checkFriendshipStatus,
//   rejectFriendRequest,
//   sendFriendRequest,
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
//     disabled: true,
//   },
//   pending_incoming: {
//     label: 'Accept Request',
//     icon: <AcceptIcon />,
//     color: 'primary',
//     variant: 'contained',
//     action: 'accept',
//     showReject: true,
//   },
//   accepted: {
//     label: 'Friends',
//     icon: <FriendsIcon />,
//     color: 'success',
//     variant: 'outlined',
//     disabled: true,
//   },
//   default: {
//     label: 'Add Friend',
//     icon: <AddFriendIcon />,
//     color: 'primary',
//     variant: 'contained',
//     action: 'send',
//   },
// };

// const FriendRequestButton = ({ friendId }) => {
//   const dispatch = useDispatch();
//   const currentUserId = useSelector((state) => state.user.profile?.id);
//   const friendship = useSelector(
//     (state) => state.friendship.statusLookup[friendId] || { status: 'none' }
//   );
//   const isLoading = useSelector((state) => state.loading.isLoading);

//   const statusKey =
//     friendship.status === 'pending'
//       ? `${friendship.status}_${friendship.direction}`
//       : friendship.status || 'default';

//   const { label, icon, color, variant, disabled, action, showReject } =
//     STATUS_MAP[statusKey] || STATUS_MAP.default;

//   const executeWithLoading = async (asyncFn, loadingMessage) => {
//     const loadingKey = `friendRequest:${friendId}`;
//     dispatch(startLoading({ message: loadingMessage, key: loadingKey, animationType: 'wave' }));
//     try {
//       await asyncFn();
//     } finally {
//       dispatch(stopLoading());
//     }
//   };

//   const handleSendRequest = () => {
//     executeWithLoading(async () => {
//       const friend = friendship?.friend || {};
//       const friendName = `${friend.firstName || ''} ${friend.lastName || ''}`.trim();
//       const friendAvatar = friend.profileImage || '/default-avatar.png';

//       await dispatch(sendFriendRequest({ friendId: Number(friendId) })).unwrap();

//       dispatch(
//         showSnackbar({
//           message: `🎉 Friend request sent to ${friend.firstName || 'user'}!`,
//           severity: 'success',
//           duration: 8000,
//           username: friendName,
//           avatarUrl: friendAvatar,
//         })
//       );

//       dispatch(checkFriendshipStatus(friendId));
//     }, 'Sending friend request...').catch((error) => {
//       dispatch(
//         showSnackbar({
//           message: getFriendlyErrorMessage(error.code),
//           severity: 'error',
//           duration: 4000,
//         })
//       );
//     });
//   };

//   const handleAcceptRequest = () => {
//     executeWithLoading(async () => {
//       if (!friendship?.friendship?.id) throw new Error('Missing friendship ID');

//       const result = await dispatch(acceptFriendRequest(friendship.friendship.id)).unwrap();
//       const user = result?.user || {};

//       dispatch(
//         showSnackbar({
//           message: `🎊 You are now friends with ${user.firstName || 'user'}!`,
//           severity: 'success',
//           duration: 8000,
//           username: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
//           avatarUrl: user.profileImage || '/default-avatar.png',
//         })
//       );

//       dispatch(checkFriendshipStatus(friendId));
//     }, 'Accepting friend request...').catch((error) => {
//       dispatch(
//         showSnackbar({
//           message: getFriendlyErrorMessage(error.code) || 'Failed to accept request',
//           severity: 'error',
//           duration: 4000,
//         })
//       );
//     });
//   };

//   const handleRejectRequest = () => {
//     executeWithLoading(async () => {
//       if (!friendship?.friendship?.id) throw new Error('Missing friendship ID');

//       const result = await dispatch(rejectFriendRequest(friendship.friendship.id)).unwrap();
//       const user = result?.user || {};

//       dispatch(
//         showSnackbar({
//           message: `❌ You declined ${user.firstName || 'the user'}'s friend request.`,
//           severity: 'warning',
//           duration: 8000,
//           username: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
//           avatarUrl: user.profileImage || '/default-avatar.png',
//         })
//       );

//       dispatch(checkFriendshipStatus(friendId));
//     }, 'Rejecting friend request...').catch((error) => {
//       dispatch(
//         showSnackbar({
//           message: getFriendlyErrorMessage(error.code) || 'Failed to reject request',
//           severity: 'error',
//           duration: 4000,
//         })
//       );
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
//           startIcon={
//             isLoading ? (
//               <ProgressPulse
//                 size={20}
//                 thickness={4}
//                 sx={{ animation: `${bounce} 1s infinite ease-in-out` }}
//               />
//             ) : (
//               icon
//             )
//           }
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
//               },
//             }),
//           }}
//         >
//           {isLoading ? (
//             <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
//               <span>Processing</span>
//               <Box sx={{ display: 'flex' }}>
//                 {[...Array(3)].map((_, i) => (
//                   <span
//                     key={i}
//                     style={{
//                       width: 4,
//                       height: 4,
//                       margin: '0 2px',
//                       borderRadius: '50%',
//                       backgroundColor: 'currentColor',
//                       animation: `${bounce} 0.6s infinite ease-in-out`,
//                       animationDelay: `${i * 0.2}s`,
//                       display: 'inline-block',
//                     }}
//                   />
//                 ))}
//               </Box>
//             </Box>
//           ) : (
//             label
//           )}
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






