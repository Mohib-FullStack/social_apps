// src/components/Friends/FriendRequestsPage.jsx

import {
  Check as AcceptIcon,
  Close as DeclineIcon
} from '@mui/icons-material';
import {
  Avatar,
  Box,
  Button,
  CircularProgress,
  Container,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Paper,
  Typography,
  Chip
} from '@mui/material';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  acceptFriendRequest as acceptFR,
  getPendingRequests,
  rejectFriendRequest as rejectFR
} from '../../features/friendship/friendshipSlice';
import { markAsRead } from '../../features/notification/notificationSlice';
import { showSnackbar } from '../../features/snackbar/snackbarSlice';

const FriendRequestsPage = () => {
  const dispatch = useDispatch();
  const { pendingRequests, status, error } = useSelector((state) => state.friendship);
  const { items: notifications } = useSelector((state) => state.notifications);
  const currentUser = useSelector((state) => state.user.profile);

  // 1) Load pending requests on mount
  useEffect(() => {
    dispatch(getPendingRequests());
  }, [dispatch]);

  // 2) Combine notifications & pendingRequests into a single “requests” array
  //    so the user can accept either from a notification or from the page list.
  const friendRequests = [
    // A) From notifications of type 'friend_request' that are unread
    ...notifications
      .filter((n) => n.type === 'friend_request' && !n.isRead)
      .map((n) => ({
        id: n.metadata.friendshipId, // friendship row’s ID
        notificationId: n.id,        // notification row’s ID
        requester: n.sender,         // user object for the sender
        isNotification: true
      })),

    // B) From friendshipSlice.pendingRequests
    ...pendingRequests.map((req) => ({
      id: req.id,
      notificationId: null, // not from a notification
      requester: req.requester,
      isNotification: false
    }))
  ];

  const handleRequestAction = async (actionThunk, friendshipId, isNotification, notificationId) => {
    try {
      await dispatch(actionThunk({ notificationId, friendshipId })).unwrap();
      if (isNotification && notificationId) {
        // Mark that notification as read, so it disappears from NotificationPanel
        dispatch(markAsRead(notificationId));
      }
    } catch (err) {
      console.error('Error processing friend request:', err);
      dispatch(
        showSnackbar({
          message: err || 'Failed to process friend request',
          severity: 'error'
        })
      );
    }
  };

  if (status === 'loading') {
    return (
      <Container maxWidth="md" sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography color="error" variant="h6">
          Error loading friend requests: {error}
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4">Friend Requests</Typography>
          <Chip label={`${friendRequests.length} pending`} color="primary" sx={{ ml: 2 }} />
        </Box>

        {friendRequests.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h6" color="text.secondary">
              No pending friend requests
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
              When someone sends you a friend request, it will appear here.
            </Typography>
          </Box>
        ) : (
          <List sx={{ width: '100%' }}>
            {friendRequests.map((req) => {
              const requesterName = `${req.requester?.firstName || ''} ${
                req.requester?.lastName || ''
              }`.trim();

              return (
                <Box key={`${req.id}-${req.notificationId || 'manual'}`}>
                  <ListItem alignItems="flex-start" sx={{ py: 2 }}>
                    <ListItemAvatar>
                      <Avatar src={req.requester?.profileImage} />
                    </ListItemAvatar>
                    <ListItemText
                      primary={requesterName || 'Unknown user'}
                      secondary="Sent you a friend request"
                      sx={{ ml: 2 }}
                    />
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Button
                        variant="contained"
                        color="success"
                        startIcon={<AcceptIcon />}
                        onClick={() =>
                          handleRequestAction(
                            acceptFR,
                            req.id,
                            req.isNotification,
                            req.notificationId
                          )
                        }
                        sx={{ minWidth: 120 }}
                      >
                        Accept
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        startIcon={<DeclineIcon />}
                        onClick={() =>
                          handleRequestAction(
                            rejectFR,
                            req.id,
                            req.isNotification,
                            req.notificationId
                          )
                        }
                        sx={{ minWidth: 120 }}
                      >
                        Decline
                      </Button>
                    </Box>
                  </ListItem>
                  <Divider variant="inset" component="li" />
                </Box>
              );
            })}
          </List>
        )}
      </Paper>
    </Container>
  );
};

export default FriendRequestsPage;



//! running
// import {
//     Check as AcceptIcon,
//     PersonAdd as FriendRequestIcon,
//     Close as RejectIcon
// } from '@mui/icons-material';
// import {
//     Avatar,
//     Box,
//     Button,
//     Chip,
//     CircularProgress,
//     Container,
//     Divider,
//     List,
//     ListItem,
//     ListItemAvatar,
//     ListItemText,
//     Paper,
//     Typography
// } from '@mui/material';
// import { useEffect } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import {
//     acceptFriendRequest,
//     getPendingRequests,
//     rejectFriendRequest
// } from '../../features/friendship/friendshipSlice';
// import { showSnackbar } from '../../features/snackbar/snackbarSlice';

// const FriendRequestsPage = () => {
//   const dispatch = useDispatch();
//   const { pendingRequests, status, error } = useSelector(state => state.friendship);
//   const currentUser = useSelector(state => state.user.profile);

//   // Load pending requests on component mount
//   useEffect(() => {
//     dispatch(getPendingRequests());
//   }, [dispatch]);

//   const handleAcceptRequest = async (requestId) => {
//     try {
//       await dispatch(acceptFriendRequest(requestId)).unwrap();
//       dispatch(showSnackbar({
//         message: 'Friend request accepted!',
//         severity: 'success'
//       }));
//     } catch (error) {
//       dispatch(showSnackbar({
//         message: error || 'Failed to accept friend request',
//         severity: 'error'
//       }));
//     }
//   };

//   const handleRejectRequest = async (requestId) => {
//     try {
//       await dispatch(rejectFriendRequest(requestId)).unwrap();
//       dispatch(showSnackbar({
//         message: 'Friend request rejected',
//         severity: 'info'
//       }));
//     } catch (error) {
//       dispatch(showSnackbar({
//         message: error || 'Failed to reject friend request',
//         severity: 'error'
//       }));
//     }
//   };

//   if (status === 'loading') {
//     return (
//       <Container maxWidth="md" sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
//         <CircularProgress />
//       </Container>
//     );
//   }

//   if (error) {
//     return (
//       <Container maxWidth="md" sx={{ py: 4 }}>
//         <Typography color="error" variant="h6">
//           Error loading friend requests: {error}
//         </Typography>
//       </Container>
//     );
//   }

//   return (
//     <Container maxWidth="md" sx={{ py: 4 }}>
//       <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
//         <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
//           <FriendRequestIcon fontSize="large" color="primary" sx={{ mr: 2 }} />
//           <Typography variant="h4" component="h1">
//             Friend Requests
//           </Typography>
//           <Chip 
//             label={`${pendingRequests.length} pending`} 
//             color="primary" 
//             sx={{ ml: 2 }} 
//           />
//         </Box>

//         <Divider sx={{ mb: 3 }} />

//         {pendingRequests.length === 0 ? (
//           <Box sx={{ textAlign: 'center', py: 4 }}>
//             <Typography variant="h6" color="text.secondary">
//               No pending friend requests
//             </Typography>
//             <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
//               When someone sends you a friend request, it will appear here.
//             </Typography>
//           </Box>
//         ) : (
//           <List sx={{ width: '100%' }}>
//             {pendingRequests.map((request) => (
//               <Box key={request.id}>
//                 <ListItem alignItems="flex-start" sx={{ py: 2 }}>
//                   <ListItemAvatar>
//                     <Avatar 
//                       src={request.requester?.profileImage} 
//                       sx={{ width: 56, height: 56 }}
//                     />
//                   </ListItemAvatar>
//                   <ListItemText
//                     primary={
//                       <Typography variant="h6" component="div">
//                         {request.requester?.firstName} {request.requester?.lastName}
//                       </Typography>
//                     }
//                     secondary={
//                       <Typography variant="body2" color="text.secondary">
//                         Sent you a friend request
//                       </Typography>
//                     }
//                     sx={{ ml: 2 }}
//                   />
//                   <Box sx={{ display: 'flex', gap: 2 }}>
//                     <Button
//                       variant="contained"
//                       color="success"
//                       startIcon={<AcceptIcon />}
//                       onClick={() => handleAcceptRequest(request.id)}
//                       sx={{ minWidth: 120 }}
//                     >
//                       Accept
//                     </Button>
//                     <Button
//                       variant="outlined"
//                       color="error"
//                       startIcon={<RejectIcon />}
//                       onClick={() => handleRejectRequest(request.id)}
//                       sx={{ minWidth: 120 }}
//                     >
//                       Decline
//                     </Button>
//                   </Box>
//                 </ListItem>
//                 <Divider variant="inset" component="li" />
//               </Box>
//             ))}
//           </List>
//         )}
//       </Paper>
//     </Container>
//   );
// };

// export default FriendRequestsPage;