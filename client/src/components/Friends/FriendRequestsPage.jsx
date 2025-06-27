// ✅ Fully Refactored FriendRequestsPage.jsx with Avatar & Username Snackbars

// Updated FriendRequestsPage.jsx with centralized loading and snackbar UX

import { Check as AcceptIcon, Close as DeclineIcon } from '@mui/icons-material';
import {
  Avatar,
  Box,
  Button,
  Chip,
  Container,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Paper,
  Tab,
  Tabs,
  Typography,
  keyframes,
  styled
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  acceptFriendRequest,
  getPendingRequests,
  getSentRequests,
  rejectFriendRequest
} from '../../features/friendship/friendshipSlice';
import { startLoading, stopLoading } from '../../features/loading/loadingSlice';
import { showSnackbar } from '../../features/snackbar/snackbarSlice';
import { getFriendlyErrorMessage } from '../../utils/friendshipErrors';
import CancelRequestButton from '../PROFILE/PrivateProfile/CancelRequestButton';

const wave = keyframes`
  0% { transform: translateX(-100%); }
  50% { transform: translateX(100%); }
  100% { transform: translateX(100%); }
`;

const ShimmerOverlay = styled('div')({
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
  animation: `${wave} 1.5s infinite linear`,
  zIndex: 1,
});

const LoadingBar = styled('div')({
  position: 'absolute',
  top: 0,
  left: 0,
  height: 4,
  background: 'linear-gradient(90deg, transparent, #1976d2, transparent)',
  width: '100%',
  animation: `${wave} 1.5s infinite linear`,
  zIndex: 2,
});

const SentRequestsTab = ({ requests }) => (
  <List>
    {requests.map((request) => (
      <ListItem key={request.id} sx={{ py: 2 }}>
        <ListItemAvatar>
          <Avatar src={request.receiver?.profileImage} />
        </ListItemAvatar>
        <ListItemText
          primary={`${request.receiver?.firstName} ${request.receiver?.lastName}`}
          secondary="Request sent - Pending"
        />
        <CancelRequestButton friendshipId={request.id} />
      </ListItem>
    ))}
  </List>
);

const FriendRequestsPage = () => {
  const dispatch = useDispatch();
  const [tabValue, setTabValue] = useState(0);
  const { pendingRequests, sentRequests } = useSelector((state) => state.friendship);
  const { isLoading } = useSelector((state) => state.loading);

  useEffect(() => {
    const loadRequests = async () => {
      dispatch(startLoading({ message: 'Loading friend requests...', animationType: 'wave' }));
      try {
        await Promise.all([
          dispatch(getPendingRequests()),
          dispatch(getSentRequests())
        ]);
      } finally {
        dispatch(stopLoading());
      }
    };
    loadRequests();
  }, [dispatch]);

  const handleAccept = async (friendshipId, requester) => {
    dispatch(startLoading({ message: 'Accepting friend request...', animationType: 'wave' }));
    try {
      const resultAction = await dispatch(acceptFriendRequest(friendshipId));
      if (acceptFriendRequest.fulfilled.match(resultAction)) {
        const user = resultAction.payload?.user || requester || {};
        dispatch(showSnackbar({
          message: `🎉 You are now friends with ${user.firstName || 'user'}!`,
          severity: 'success',
          duration: 8000,
          username: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
          avatarUrl: user.profileImage || '/default-avatar.png',
        }));
        setTimeout(() => dispatch(getPendingRequests()), 1000);
      } else {
        throw new Error(resultAction.payload?.code || 'accept_failed');
      }
    } catch (error) {
      dispatch(showSnackbar({
        message: getFriendlyErrorMessage(error.message),
        severity: 'error',
        icon: <DeclineIcon />,
        duration: 4000,
      }));
    } finally {
      dispatch(stopLoading());
    }
  };

  const handleReject = async (friendshipId, requester) => {
    dispatch(startLoading({ message: 'Rejecting friend request...', animationType: 'wave' }));
    try {
      const resultAction = await dispatch(rejectFriendRequest(friendshipId));
      if (rejectFriendRequest.fulfilled.match(resultAction)) {
        const user = resultAction.payload?.user || requester || {};
        dispatch(showSnackbar({
          message: `❌ You declined ${user.firstName || 'user'}'s friend request.`,
          severity: 'warning',
          duration: 8000,
          username: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
          avatarUrl: user.profileImage || '/default-avatar.png',
        }));
        setTimeout(() => dispatch(getPendingRequests()), 1000);
      } else {
        throw new Error(resultAction.payload?.code || 'reject_failed');
      }
    } catch (error) {
      dispatch(showSnackbar({
        message: getFriendlyErrorMessage(error.message),
        severity: 'error',
        icon: <DeclineIcon />,
        duration: 4000,
      }));
    } finally {
      dispatch(stopLoading());
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4">Friend Requests</Typography>
          <Chip label={`${pendingRequests.data?.length || 0} pending`} color="primary" sx={{ ml: 2 }} />
        </Box>

        <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} sx={{ mb: 3 }}>
          <Tab label="Received" />
          <Tab label="Sent" />
        </Tabs>

        {tabValue === 0 ? (
          pendingRequests.data?.length === 0 ? (
            <Typography variant="body1" color="text.secondary">
              No pending friend requests
            </Typography>
          ) : (
            <List>
              {pendingRequests.data?.map((request) => (
                <React.Fragment key={request.id}>
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar src={request.requester?.profileImage} />
                    </ListItemAvatar>
                    <ListItemText
                      primary={`${request.requester?.firstName} ${request.requester?.lastName}`}
                      secondary="Sent you a friend request"
                    />
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        variant="contained"
                        color="success"
                        startIcon={<AcceptIcon />}
                        onClick={() => handleAccept(request.id, request.requester)}
                        disabled={isLoading}
                        sx={{ minWidth: 110 }}
                      >
                        Accept
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        startIcon={<DeclineIcon />}
                        onClick={() => handleReject(request.id, request.requester)}
                        disabled={isLoading}
                        sx={{ minWidth: 110 }}
                      >
                        Decline
                      </Button>
                    </Box>
                  </ListItem>
                  <Divider />
                </React.Fragment>
              ))}
            </List>
          )
        ) : (
          <SentRequestsTab requests={sentRequests.data || []} />
        )}
      </Paper>
    </Container>
  );
};

export default FriendRequestsPage;

//! original
// import { Check as AcceptIcon, Close as DeclineIcon } from '@mui/icons-material';
// import {
//   Avatar,
//   Box,
//   Button,
//   Chip,
//   Container,
//   Divider,
//   List,
//   ListItem,
//   ListItemAvatar,
//   ListItemText,
//   Paper,
//   Tab,
//   Tabs,
//   Typography,
//   keyframes,
//   styled
// } from '@mui/material';
// import React, { useEffect, useState } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import {
//   acceptFriendRequest,
//   getPendingRequests,
//   getSentRequests,
//   rejectFriendRequest,
// } from '../../features/friendship/friendshipSlice';
// import { startLoading, stopLoading } from '../../features/loading/loadingSlice';
// import { showSnackbar } from '../../features/snackbar/snackbarSlice';
// import { getFriendlyErrorMessage } from '../../utils/friendshipErrors';
// import CancelRequestButton from '../PROFILE/PrivateProfile/CancelRequestButton';

// // Animations
// const pulse = keyframes`
//   0% { opacity: 0.6; }
//   50% { opacity: 1; }
//   100% { opacity: 0.6; }
// `;

// const wave = keyframes`
//   0% { transform: translateX(-100%); }
//   50% { transform: translateX(100%); }
//   100% { transform: translateX(100%); }
// `;

// const spin = keyframes`
//   0% { transform: rotate(0deg); }
//   100% { transform: rotate(360deg); }
// `;

// const ShimmerOverlay = styled('div')({
//   position: 'absolute',
//   top: 0,
//   left: 0,
//   width: '100%',
//   height: '100%',
//   background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
//   animation: `${wave} 1.5s infinite linear`,
//   zIndex: 1,
// });

// const LoadingBar = styled('div')({
//   position: 'absolute',
//   top: 0,
//   left: 0,
//   height: 4,
//   background: 'linear-gradient(90deg, transparent, #1976d2, transparent)',
//   width: '100%',
//   animation: `${wave} 1.5s infinite linear`,
//   zIndex: 2,
// });

// const SentRequestsTab = ({ requests }) => (
//   <List>
//     {requests.map((request) => (
//       <ListItem key={request.id} sx={{ py: 2 }}>
//         <ListItemAvatar>
//           <Avatar src={request.receiver?.profileImage} />
//         </ListItemAvatar>
//         <ListItemText
//           primary={`${request.receiver?.firstName} ${request.receiver?.lastName}`}
//           secondary="Request sent - Pending"
//         />
//         <CancelRequestButton friendshipId={request.id} />
//       </ListItem>
//     ))}
//   </List>
// );

// const FriendRequestsPage = () => {
//   const dispatch = useDispatch();
//   const [tabValue, setTabValue] = useState(0);
//   const { pendingRequests, sentRequests, status, error } = useSelector((state) => state.friendship);
//   const { isLoading } = useSelector((state) => state.loading);

//   useEffect(() => {
//     const loadRequests = async () => {
//       dispatch(startLoading({ message: 'Loading friend requests...', animationType: 'wave' }));
//       try {
//         await Promise.all([dispatch(getPendingRequests()), dispatch(getSentRequests())]);
//       } finally {
//         dispatch(stopLoading());
//       }
//     };
//     loadRequests();
//   }, [dispatch]);

//   const handleAccept = async (friendshipId, requester) => {
//     dispatch(startLoading({ message: 'Accepting friend request...', animationType: 'wave' }));
//     try {
//       dispatch(showSnackbar({
//         message: 'Accepting friend request...',
//         severity: 'info',
//         persist: true,
//       }));

//       const resultAction = await dispatch(acceptFriendRequest(friendshipId));

//       if (acceptFriendRequest.fulfilled.match(resultAction)) {
//         const user = resultAction.payload?.user || requester || {};
//         dispatch(showSnackbar({
//           message: `🎉 You are now friends with ${user.firstName || 'user'}!`,
//           severity: 'success',
//           duration: 8000,
//           username: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
//           avatarUrl: user.profileImage || '/default-avatar.png',
//         }));
//         setTimeout(() => dispatch(getPendingRequests()), 1000);
//       } else {
//         const error = resultAction.payload;
//         throw new Error(error?.code || 'accept_failed');
//       }
//     } catch (error) {
//       dispatch(showSnackbar({
//         message: getFriendlyErrorMessage(error.message),
//         severity: 'error',
//         icon: <DeclineIcon />,
//         duration: 4000,
//       }));
//     } finally {
//       dispatch(stopLoading());
//     }
//   };

//   const handleReject = async (friendshipId, requester) => {
//     dispatch(startLoading({ message: 'Rejecting friend request...', animationType: 'wave' }));
//     try {
//       dispatch(showSnackbar({
//         message: 'Processing rejection...',
//         severity: 'info',
//         persist: true,
//       }));

//       const resultAction = await dispatch(rejectFriendRequest(friendshipId));

//       if (rejectFriendRequest.fulfilled.match(resultAction)) {
//         const user = resultAction.payload?.user || requester || {};
//         dispatch(showSnackbar({
//           message: `❌ You declined ${user.firstName || 'user'}'s friend request.`,
//           severity: 'warning',
//           duration: 8000,
//           username: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
//           avatarUrl: user.profileImage || '/default-avatar.png',
//         }));
//         setTimeout(() => dispatch(getPendingRequests()), 1000);
//       } else {
//         const error = resultAction.payload;
//         throw new Error(error?.code || 'reject_failed');
//       }
//     } catch (error) {
//       dispatch(showSnackbar({
//         message: getFriendlyErrorMessage(error.message),
//         severity: 'error',
//         icon: <DeclineIcon />,
//         duration: 4000,
//       }));
//     } finally {
//       dispatch(stopLoading());
//     }
//   };

//   const handleTabChange = (event, newValue) => {
//     setTabValue(newValue);
//   };

//   return (
//     <Container maxWidth="md" sx={{ py: 4 }}>
//       <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
//         <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
//           <Typography variant="h4">Friend Requests</Typography>
//           <Chip label={`${pendingRequests.data?.length || 0} pending`} color="primary" sx={{ ml: 2 }} />
//         </Box>

//         <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 3 }}>
//           <Tab label="Received" />
//           <Tab label="Sent" />
//         </Tabs>

//         {tabValue === 0 ? (
//           pendingRequests.data?.length === 0 ? (
//             <Typography variant="body1" color="text.secondary">
//               No pending friend requests
//             </Typography>
//           ) : (
//             <List>
//               {pendingRequests.data?.map((request) => (
//                 <React.Fragment key={request.id}>
//                   <ListItem>
//                     <ListItemAvatar>
//                       <Avatar src={request.requester?.profileImage} />
//                     </ListItemAvatar>
//                     <ListItemText
//                       primary={`${request.requester?.firstName} ${request.requester?.lastName}`}
//                       secondary="Sent you a friend request"
//                     />
//                     <Box sx={{ display: 'flex', gap: 1 }}>
//                       <Button
//                         variant="contained"
//                         color="success"
//                         startIcon={<AcceptIcon />}
//                         onClick={() => handleAccept(request.id, request.requester)}
//                         disabled={isLoading}
//                         sx={{ minWidth: 110 }}
//                       >
//                         Accept
//                       </Button>
//                       <Button
//                         variant="outlined"
//                         color="error"
//                         startIcon={<DeclineIcon />}
//                         onClick={() => handleReject(request.id, request.requester)}
//                         disabled={isLoading}
//                         sx={{ minWidth: 110 }}
//                       >
//                         Decline
//                       </Button>
//                     </Box>
//                   </ListItem>
//                   <Divider />
//                 </React.Fragment>
//               ))}
//             </List>
//           )
//         ) : (
//           <SentRequestsTab requests={sentRequests.data || []} />
//         )}
//       </Paper>
//     </Container>
//   );
// };

// export default FriendRequestsPage;




//! original
// import { Check as AcceptIcon, Close as DeclineIcon } from '@mui/icons-material';
// import {
//   Avatar,
//   Box,
//   Button,
//   Chip,
//   CircularProgress,
//   Container,
//   Divider,
//   List,
//   ListItem,
//   ListItemAvatar,
//   ListItemText,
//   Paper,
//   Skeleton,
//   Tab,
//   Tabs,
//   Typography,
//   keyframes,
//   styled,
// } from '@mui/material';
// import React, { useEffect, useState } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import {
//   acceptFriendRequest,
//   getPendingRequests,
//   getSentRequests,
//   rejectFriendRequest,
// } from '../../features/friendship/friendshipSlice';
// import { startLoading, stopLoading } from '../../features/loading/loadingSlice';
// import { showSnackbar } from '../../features/snackbar/snackbarSlice';
// import { getFriendlyErrorMessage } from '../../utils/friendshipErrors';
// import CancelRequestButton from '../PROFILE/PrivateProfile/CancelRequestButton';

// // Animations
// const pulse = keyframes`
//   0% { opacity: 0.6; }
//   50% { opacity: 1; }
//   100% { opacity: 0.6; }
// `;

// const wave = keyframes`
//   0% { transform: translateX(-100%); }
//   50% { transform: translateX(100%); }
//   100% { transform: translateX(100%); }
// `;

// const spin = keyframes`
//   0% { transform: rotate(0deg); }
//   100% { transform: rotate(360deg); }
// `;

// const ShimmerOverlay = styled('div')({
//   position: 'absolute',
//   top: 0,
//   left: 0,
//   width: '100%',
//   height: '100%',
//   background:
//     'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
//   animation: `${wave} 1.5s infinite linear`,
//   zIndex: 1,
// });

// const LoadingBar = styled('div')({
//   position: 'absolute',
//   top: 0,
//   left: 0,
//   height: 4,
//   background: 'linear-gradient(90deg, transparent, #1976d2, transparent)',
//   width: '100%',
//   animation: `${wave} 1.5s infinite linear`,
//   zIndex: 2,
// });

// const SentRequestsTab = ({ requests }) => (
//   <List>
//     {requests.map(request => (
//       <ListItem key={request.id} sx={{ py: 2 }}>
//         <ListItemAvatar>
//           <Avatar src={request.receiver?.profileImage} />
//         </ListItemAvatar>
//         <ListItemText
//           primary={`${request.receiver?.firstName} ${request.receiver?.lastName}`}
//           secondary="Request sent - Pending"
//         />
//         <CancelRequestButton friendshipId={request.id} />
//       </ListItem>
//     ))}
//   </List>
// );

// const FriendRequestsPage = () => {
//   const dispatch = useDispatch();
//   const [tabValue, setTabValue] = useState(0);
//   const { pendingRequests, sentRequests, status, error } = useSelector(
//     (state) => state.friendship
//   );
//   const { isLoading } = useSelector((state) => state.loading);

//   useEffect(() => {
//     const loadRequests = async () => {
//       dispatch(
//         startLoading({
//           message: 'Loading friend requests...',
//           animationType: 'wave',
//         })
//       );
//       try {
//         await Promise.all([
//           dispatch(getPendingRequests()),
//           dispatch(getSentRequests()),
//         ]);
//       } finally {
//         dispatch(stopLoading());
//       }
//     };

//     loadRequests();
//   }, [dispatch]);

//   const handleAccept = async (friendshipId) => {
//     dispatch(
//       startLoading({
//         message: 'Accepting friend request...',
//         animationType: 'wave',
//       })
//     );

//     try {
//       dispatch(
//         showSnackbar({
//           message: 'Accepting friend request...',
//           severity: 'info',
//           persist: true,
//           icon: <CircularProgress size={20} color="inherit" />,
//         })
//       );

//       const resultAction = await dispatch(acceptFriendRequest(friendshipId));

//       if (acceptFriendRequest.fulfilled.match(resultAction)) {
//         dispatch(
//           showSnackbar({
//             message: 'Friend request accepted!',
//             severity: 'success',
//             icon: <AcceptIcon />,
//             autoHideDuration: 3000,
//           })
//         );

//         setTimeout(() => {
//           dispatch(getPendingRequests());
//         }, 1000);
//       } else {
//         const error = resultAction.payload;
//         throw new Error(error?.code || 'accept_failed');
//       }
//     } catch (error) {
//       dispatch(
//         showSnackbar({
//           message: getFriendlyErrorMessage(error.message),
//           severity: 'error',
//           icon: <DeclineIcon />,
//           autoHideDuration: error.message === 'already_friends' ? 6000 : 4000,
//         })
//       );
//     } finally {
//       dispatch(stopLoading());
//     }
//   };

//   const handleReject = async (friendshipId) => {
//     dispatch(
//       startLoading({
//         message: 'Rejecting friend request...',
//         animationType: 'wave',
//       })
//     );

//     try {
//       dispatch(
//         showSnackbar({
//           message: 'Processing rejection...',
//           severity: 'info',
//           persist: true,
//           icon: <CircularProgress size={20} color="inherit" />,
//         })
//       );

//       const resultAction = await dispatch(rejectFriendRequest(friendshipId));

//       if (rejectFriendRequest.fulfilled.match(resultAction)) {
//         dispatch(
//           showSnackbar({
//             message: 'Friend request rejected',
//             severity: 'success',
//             icon: <DeclineIcon />,
//             autoHideDuration: 3000,
//           })
//         );

//         setTimeout(() => {
//           dispatch(getPendingRequests());
//         }, 1000);
//       } else {
//         const error = resultAction.payload;
//         throw new Error(error?.code || 'reject_failed');
//       }
//     } catch (error) {
//       dispatch(
//         showSnackbar({
//           message: getFriendlyErrorMessage(error.message),
//           severity: 'error',
//           icon: <DeclineIcon />,
//           autoHideDuration: 4000,
//         })
//       );
//     } finally {
//       dispatch(stopLoading());
//     }
//   };

//   const handleTabChange = (event, newValue) => {
//     setTabValue(newValue);
//   };

//   if (status === 'loading' && !pendingRequests.data?.length && !sentRequests.data?.length) {
//     return (
//       <Container maxWidth="md" sx={{ py: 4 }}>
//         <Paper
//           elevation={3}
//           sx={{
//             p: 3,
//             borderRadius: 2,
//             overflow: 'hidden',
//             position: 'relative',
//           }}
//         >
//           <LoadingBar />
//           <ShimmerOverlay />

//           <Box
//             sx={{
//               display: 'flex',
//               alignItems: 'center',
//               mb: 3,
//               position: 'relative',
//               zIndex: 2,
//             }}
//           >
//             <Skeleton
//               variant="rounded"
//               width={200}
//               height={40}
//               sx={{
//                 bgcolor: 'grey.200',
//                 animation: `${pulse} 1.5s ease-in-out infinite`,
//               }}
//             />
//             <Skeleton
//               variant="circular"
//               width={32}
//               height={32}
//               sx={{
//                 bgcolor: 'grey.200',
//                 ml: 2,
//                 animation: `${pulse} 1.5s ease-in-out infinite`,
//               }}
//             />
//           </Box>

//           {[...Array(3)].map((_, index) => (
//             <React.Fragment key={index}>
//               <ListItem
//                 sx={{
//                   py: 2,
//                   position: 'relative',
//                   zIndex: 2,
//                 }}
//               >
//                 <ListItemAvatar>
//                   <Skeleton
//                     variant="circular"
//                     width={48}
//                     height={48}
//                     sx={{
//                       bgcolor: 'grey.200',
//                       animation: `${pulse} 1.5s ease-in-out infinite`,
//                     }}
//                   />
//                 </ListItemAvatar>
//                 <ListItemText
//                   primary={
//                     <Skeleton
//                       variant="text"
//                       width={120}
//                       height={24}
//                       sx={{
//                         bgcolor: 'grey.200',
//                         animation: `${pulse} 1.5s ease-in-out infinite`,
//                       }}
//                     />
//                   }
//                   secondary={
//                     <Skeleton
//                       variant="text"
//                       width={180}
//                       height={20}
//                       sx={{
//                         bgcolor: 'grey.200',
//                         animation: `${pulse} 1.5s ease-in-out infinite`,
//                         mt: 1,
//                       }}
//                     />
//                   }
//                 />
//                 <Box sx={{ display: 'flex', gap: 1 }}>
//                   <Skeleton
//                     variant="rounded"
//                     width={110}
//                     height={36}
//                     sx={{
//                       bgcolor: 'grey.200',
//                       animation: `${pulse} 1.5s ease-in-out infinite`,
//                     }}
//                   />
//                   <Skeleton
//                     variant="rounded"
//                     width={110}
//                     height={36}
//                     sx={{
//                       bgcolor: 'grey.200',
//                       animation: `${pulse} 1.5s ease-in-out infinite`,
//                     }}
//                   />
//                 </Box>
//               </ListItem>
//               <Divider sx={{ bgcolor: 'grey.100' }} />
//             </React.Fragment>
//           ))}
//         </Paper>
//       </Container>
//     );
//   }

//   if (error) {
//     return (
//       <Container maxWidth="md" sx={{ py: 4 }}>
//         <Typography color="error">{getFriendlyErrorMessage(error)}</Typography>
//       </Container>
//     );
//   }

//   return (
//     <Container maxWidth="md" sx={{ py: 4 }}>
//       <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
//         <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
//           <Typography variant="h4">Friend Requests</Typography>
//           <Chip
//             label={`${pendingRequests.data?.length || 0} pending`}
//             color="primary"
//             sx={{ ml: 2 }}
//           />
//         </Box>

//         <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 3 }}>
//           <Tab label="Received" />
//           <Tab label="Sent" />
//         </Tabs>

//         {tabValue === 0 ? (
//           pendingRequests.data?.length === 0 ? (
//             <Typography variant="body1" color="text.secondary">
//               No pending friend requests
//             </Typography>
//           ) : (
//             <List>
//               {pendingRequests.data?.map((request) => (
//                 <React.Fragment key={request.id}>
//                   <ListItem>
//                     <ListItemAvatar>
//                       <Avatar
//                         src={request.requester?.profileImage}
//                         sx={{
//                           '&:hover': {
//                             transform: 'scale(1.1)',
//                             transition: 'transform 0.3s ease',
//                           },
//                         }}
//                       />
//                     </ListItemAvatar>
//                     <ListItemText
//                       primary={`${request.requester?.firstName} ${request.requester?.lastName}`}
//                       secondary="Sent you a friend request"
//                     />
//                     <Box sx={{ display: 'flex', gap: 1 }}>
//                       <Button
//                         variant="contained"
//                         color="success"
//                         startIcon={
//                           isLoading ? (
//                             <CircularProgress
//                               size={20}
//                               color="inherit"
//                               sx={{
//                                 animation: `${spin} 1s linear infinite`,
//                               }}
//                             />
//                           ) : (
//                             <AcceptIcon />
//                           )
//                         }
//                         onClick={() => handleAccept(request.id)}
//                         disabled={isLoading}
//                         sx={{
//                           minWidth: 110,
//                           transition: 'all 0.3s ease',
//                           '&:hover': {
//                             transform: 'translateY(-2px)',
//                             boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
//                           },
//                           '&:disabled': {
//                             bgcolor: 'success.main',
//                             opacity: 0.7,
//                           },
//                         }}
//                       >
//                         {isLoading ? 'Accepting...' : 'Accept'}
//                       </Button>
//                       <Button
//                         variant="outlined"
//                         color="error"
//                         startIcon={
//                           isLoading ? (
//                             <CircularProgress
//                               size={20}
//                               color="inherit"
//                               sx={{
//                                 animation: `${spin} 1s linear infinite`,
//                               }}
//                             />
//                           ) : (
//                             <DeclineIcon />
//                           )
//                         }
//                         onClick={() => handleReject(request.id)}
//                         disabled={isLoading}
//                         sx={{
//                           minWidth: 110,
//                           transition: 'all 0.3s ease',
//                           '&:hover': {
//                             transform: 'translateY(-2px)',
//                             boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
//                           },
//                           '&:disabled': {
//                             borderColor: 'error.main',
//                             opacity: 0.7,
//                           },
//                         }}
//                       >
//                         {isLoading ? 'Declining...' : 'Decline'}
//                       </Button>
//                     </Box>
//                   </ListItem>
//                   <Divider />
//                 </React.Fragment>
//               ))}
//             </List>
//           )
//         ) : (
//           <SentRequestsTab requests={sentRequests.data || []} />
//         )}
//       </Paper>
//     </Container>
//   );
// };

// export default FriendRequestsPage;



