import {
  Check as AcceptIcon,
  Close as DeclineIcon
} from '@mui/icons-material';
import {
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Paper,
  Typography
} from '@mui/material';
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  acceptFriendRequest,
  getPendingRequests,
  rejectFriendRequest
} from '../../features/friendship/friendshipSlice';
import { showSnackbar } from '../../features/snackbar/snackbarSlice';
import { getFriendlyErrorMessage } from '../../utils/friendshipErrors';

const FriendRequestsPage = () => {
  const dispatch = useDispatch();
  const { pendingRequests, status, error } = useSelector(
    state => state.friendship
  );

  useEffect(() => {
    dispatch(getPendingRequests());
  }, [dispatch]);

  const handleAccept = async (friendshipId) => {
    try {
      const resultAction = await dispatch(acceptFriendRequest(friendshipId));
      
      if (acceptFriendRequest.fulfilled.match(resultAction)) {
        dispatch(showSnackbar({
          message: 'Friend request accepted!',
          severity: 'success',
          autoHideDuration: 3000
        }));
        
        // Refresh the list after 1 second to allow for propagation
        setTimeout(() => {
          dispatch(getPendingRequests());
        }, 1000);
      } else {
        const error = resultAction.payload;
        throw new Error(error?.code || 'accept_failed');
      }
    } catch (error) {
      dispatch(showSnackbar({
        message: getFriendlyErrorMessage(error.message),
        severity: 'error',
        autoHideDuration: error.message === 'already_friends' ? 6000 : 4000
      }));
    }
  };

  const handleReject = async (friendshipId) => {
    try {
      const resultAction = await dispatch(rejectFriendRequest(friendshipId));
      
      if (rejectFriendRequest.fulfilled.match(resultAction)) {
        dispatch(showSnackbar({
          message: 'Friend request rejected',
          severity: 'success',
          autoHideDuration: 3000
        }));
        
        setTimeout(() => {
          dispatch(getPendingRequests());
        }, 1000);
      } else {
        const error = resultAction.payload;
        throw new Error(error?.code || 'reject_failed');
      }
    } catch (error) {
      dispatch(showSnackbar({
        message: getFriendlyErrorMessage(error.message),
        severity: 'error',
        autoHideDuration: 4000
      }));
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
        <Typography color="error">{getFriendlyErrorMessage(error)}</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4">Friend Requests</Typography>
          <Chip 
            label={`${pendingRequests.data?.length || 0} pending`} 
            color="primary" 
            sx={{ ml: 2 }} 
          />
        </Box>

        {pendingRequests.data?.length === 0 ? (
          <Typography variant="body1" color="text.secondary">
            No pending friend requests
          </Typography>
        ) : (
          <List>
            {pendingRequests.data?.map(request => (
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
                      onClick={() => handleAccept(request.id)}
                      disabled={status === 'loading'}
                      sx={{ minWidth: 110 }}
                    >
                      {status === 'loading' ? (
                        <CircularProgress size={20} color="inherit" />
                      ) : (
                        'Accept'
                      )}
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={<DeclineIcon />}
                      onClick={() => handleReject(request.id)}
                      disabled={status === 'loading'}
                      sx={{ minWidth: 110 }}
                    >
                      {status === 'loading' ? (
                        <CircularProgress size={20} color="inherit" />
                      ) : (
                        'Decline'
                      )}
                    </Button>
                  </Box>
                </ListItem>
                <Divider />
              </React.Fragment>
            ))}
          </List>
        )}
      </Paper>
    </Container>
  );
};

export default FriendRequestsPage;

//! running
// import {
//   Check as AcceptIcon,
//   Close as DeclineIcon
// } from '@mui/icons-material';
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
//   Typography
// } from '@mui/material';
// import React, { useEffect } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import {
//   acceptFriendRequest,
//   getPendingRequests,
//   rejectFriendRequest
// } from '../../features/friendship/friendshipSlice';
// import { showSnackbar } from '../../features/snackbar/snackbarSlice';

// const FriendRequestsPage = () => {
//   const dispatch = useDispatch();
//   const { pendingRequests, status, error } = useSelector(
//     state => state.friendship
//   );

//   useEffect(() => {
//     dispatch(getPendingRequests());
//   }, [dispatch]);

//   const handleAccept = async (friendshipId) => {
//     try {
//       const resultAction = await dispatch(acceptFriendRequest(friendshipId));
      
//       if (acceptFriendRequest.fulfilled.match(resultAction)) {
//         dispatch(showSnackbar({
//           message: 'Friend request accepted!',
//           severity: 'success',
//           autoHideDuration: 3000
//         }));
        
//         // Refresh the list after 1 second to allow for propagation
//         setTimeout(() => {
//           dispatch(getPendingRequests());
//         }, 1000);
//       } else {
//         throw new Error(resultAction.payload?.message || 'Failed to accept');
//       }
//     } catch (error) {
//       dispatch(showSnackbar({
//         message: error.message,
//         severity: 'error',
//         autoHideDuration: 4000
//       }));
//     }
//   };

//   const handleReject = async (friendshipId) => {
//     try {
//       const resultAction = await dispatch(rejectFriendRequest(friendshipId));
      
//       if (rejectFriendRequest.fulfilled.match(resultAction)) {
//         dispatch(showSnackbar({
//           message: 'Friend request rejected',
//           severity: 'success',
//           autoHideDuration: 3000
//         }));
        
//         setTimeout(() => {
//           dispatch(getPendingRequests());
//         }, 1000);
//       } else {
//         throw new Error(resultAction.payload?.message || 'Failed to reject');
//       }
//     } catch (error) {
//       dispatch(showSnackbar({
//         message: error.message,
//         severity: 'error',
//         autoHideDuration: 4000
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
//         <Typography color="error">{error}</Typography>
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

//         {pendingRequests.data?.length === 0 ? (
//           <Typography variant="body1" color="text.secondary">
//             No pending friend requests
//           </Typography>
//         ) : (
//           <List>
//             {pendingRequests.data?.map(request => (
//               <React.Fragment key={request.id}>
//                 <ListItem>
//                   <ListItemAvatar>
//                     <Avatar src={request.requester?.profileImage} />
//                   </ListItemAvatar>
//                   <ListItemText
//                     primary={`${request.requester?.firstName} ${request.requester?.lastName}`}
//                     secondary="Sent you a friend request"
//                   />
//                   <Box sx={{ display: 'flex', gap: 1 }}>
//                     <Button
//                       variant="contained"
//                       color="success"
//                       startIcon={<AcceptIcon />}
//                       onClick={() => handleAccept(request.id)}
//                       disabled={status === 'loading'}
//                       sx={{ minWidth: 110 }}
//                     >
//                       Accept
//                     </Button>
//                     <Button
//                       variant="outlined"
//                       color="error"
//                       startIcon={<DeclineIcon />}
//                       onClick={() => handleReject(request.id)}
//                       disabled={status === 'loading'}
//                       sx={{ minWidth: 110 }}
//                     >
//                       Decline
//                     </Button>
//                   </Box>
//                 </ListItem>
//                 <Divider />
//               </React.Fragment>
//             ))}
//           </List>
//         )}
//       </Paper>
//     </Container>
//   );
// };

// export default FriendRequestsPage;












