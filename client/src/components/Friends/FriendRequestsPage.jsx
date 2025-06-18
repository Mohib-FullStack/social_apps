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
  Skeleton,
  Typography,
  keyframes,
  styled
} from '@mui/material';
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  acceptFriendRequest,
  getPendingRequests,
  rejectFriendRequest
} from '../../features/friendship/friendshipSlice';
import { startLoading, stopLoading } from '../../features/loading/loadingSlice';
import { showSnackbar } from '../../features/snackbar/snackbarSlice';
import { getFriendlyErrorMessage } from '../../utils/friendshipErrors';

// Animations
const pulse = keyframes`
  0% { opacity: 0.6; }
  50% { opacity: 1; }
  100% { opacity: 0.6; }
`;

const wave = keyframes`
  0% { transform: translateX(-100%); }
  50% { transform: translateX(100%); }
  100% { transform: translateX(100%); }
`;

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const ShimmerOverlay = styled('div')({
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
  animation: `${wave} 1.5s infinite linear`,
  zIndex: 1
});

const LoadingBar = styled('div')({
  position: 'absolute',
  top: 0,
  left: 0,
  height: 4,
  background: 'linear-gradient(90deg, transparent, #1976d2, transparent)',
  width: '100%',
  animation: `${wave} 1.5s infinite linear`,
  zIndex: 2
});

const FriendRequestsPage = () => {
  const dispatch = useDispatch();
  const { pendingRequests, status, error } = useSelector(
    state => state.friendship
  );
  const { isLoading } = useSelector(state => state.loading);

  useEffect(() => {
    const loadRequests = async () => {
      dispatch(startLoading({ 
        message: 'Loading friend requests...',
        animationType: 'wave'
      }));
      try {
        await dispatch(getPendingRequests());
      } finally {
        dispatch(stopLoading());
      }
    };
    
    loadRequests();
  }, [dispatch]);

  const handleAccept = async (friendshipId) => {
    dispatch(startLoading({ 
      message: 'Accepting friend request...',
      animationType: 'wave'
    }));
    
    try {
      dispatch(
        showSnackbar({
          message: 'Accepting friend request...',
          severity: 'info',
          persist: true,
          icon: <CircularProgress size={20} color="inherit" />
        })
      );
      
      const resultAction = await dispatch(acceptFriendRequest(friendshipId));
      
      if (acceptFriendRequest.fulfilled.match(resultAction)) {
        dispatch(showSnackbar({
          message: 'Friend request accepted!',
          severity: 'success',
          icon: <AcceptIcon />,
          autoHideDuration: 3000
        }));
        
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
        icon: <DeclineIcon />,
        autoHideDuration: error.message === 'already_friends' ? 6000 : 4000
      }));
    } finally {
      dispatch(stopLoading());
    }
  };

  const handleReject = async (friendshipId) => {
    dispatch(startLoading({ 
      message: 'Rejecting friend request...',
      animationType: 'wave'
    }));
    
    try {
      dispatch(
        showSnackbar({
          message: 'Processing rejection...',
          severity: 'info',
          persist: true,
          icon: <CircularProgress size={20} color="inherit" />
        })
      );
      
      const resultAction = await dispatch(rejectFriendRequest(friendshipId));
      
      if (rejectFriendRequest.fulfilled.match(resultAction)) {
        dispatch(showSnackbar({
          message: 'Friend request rejected',
          severity: 'success',
          icon: <DeclineIcon />,
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
        icon: <DeclineIcon />,
        autoHideDuration: 4000
      }));
    } finally {
      dispatch(stopLoading());
    }
  };

  if (status === 'loading' && !pendingRequests.data?.length) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper elevation={3} sx={{ 
          p: 3, 
          borderRadius: 2,
          overflow: 'hidden',
          position: 'relative'
        }}>
          <LoadingBar />
          <ShimmerOverlay />
          
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            mb: 3,
            position: 'relative',
            zIndex: 2
          }}>
            <Skeleton 
              variant="rounded" 
              width={200} 
              height={40} 
              sx={{ 
                bgcolor: 'grey.200',
                animation: `${pulse} 1.5s ease-in-out infinite`
              }}
            />
            <Skeleton 
              variant="circular" 
              width={32} 
              height={32} 
              sx={{ 
                bgcolor: 'grey.200',
                ml: 2,
                animation: `${pulse} 1.5s ease-in-out infinite`
              }}
            />
          </Box>
          
          {[...Array(3)].map((_, index) => (
            <React.Fragment key={index}>
              <ListItem sx={{ 
                py: 2,
                position: 'relative',
                zIndex: 2
              }}>
                <ListItemAvatar>
                  <Skeleton 
                    variant="circular" 
                    width={48} 
                    height={48} 
                    sx={{ 
                      bgcolor: 'grey.200',
                      animation: `${pulse} 1.5s ease-in-out infinite`
                    }} 
                  />
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Skeleton 
                      variant="text" 
                      width={120} 
                      height={24} 
                      sx={{ 
                        bgcolor: 'grey.200',
                        animation: `${pulse} 1.5s ease-in-out infinite`
                      }} 
                    />
                  }
                  secondary={
                    <Skeleton 
                      variant="text" 
                      width={180} 
                      height={20} 
                      sx={{ 
                        bgcolor: 'grey.200',
                        animation: `${pulse} 1.5s ease-in-out infinite`,
                        mt: 1
                      }} 
                    />
                  }
                />
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Skeleton 
                    variant="rounded" 
                    width={110} 
                    height={36} 
                    sx={{ 
                      bgcolor: 'grey.200',
                      animation: `${pulse} 1.5s ease-in-out infinite`
                    }} 
                  />
                  <Skeleton 
                    variant="rounded" 
                    width={110} 
                    height={36} 
                    sx={{ 
                      bgcolor: 'grey.200',
                      animation: `${pulse} 1.5s ease-in-out infinite`
                    }} 
                  />
                </Box>
              </ListItem>
              <Divider sx={{ bgcolor: 'grey.100' }} />
            </React.Fragment>
          ))}
        </Paper>
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
                    <Avatar 
                      src={request.requester?.profileImage} 
                      sx={{
                        '&:hover': {
                          transform: 'scale(1.1)',
                          transition: 'transform 0.3s ease'
                        }
                      }}
                    />
                  </ListItemAvatar>
                  <ListItemText
                    primary={`${request.requester?.firstName} ${request.requester?.lastName}`}
                    secondary="Sent you a friend request"
                  />
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      variant="contained"
                      color="success"
                      startIcon={isLoading ? (
                        <CircularProgress 
                          size={20} 
                          color="inherit" 
                          sx={{
                            animation: `${spin} 1s linear infinite`,
                          }}
                        />
                      ) : <AcceptIcon />}
                      onClick={() => handleAccept(request.id)}
                      disabled={isLoading}
                      sx={{ 
                        minWidth: 110,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                        },
                        '&:disabled': {
                          bgcolor: 'success.main',
                          opacity: 0.7
                        }
                      }}
                    >
                      {isLoading ? 'Accepting...' : 'Accept'}
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={isLoading ? (
                        <CircularProgress 
                          size={20} 
                          color="inherit" 
                          sx={{
                            animation: `${spin} 1s linear infinite`,
                          }}
                        />
                      ) : <DeclineIcon />}
                      onClick={() => handleReject(request.id)}
                      disabled={isLoading}
                      sx={{ 
                        minWidth: 110,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                        },
                        '&:disabled': {
                          borderColor: 'error.main',
                          opacity: 0.7
                        }
                      }}
                    >
                      {isLoading ? 'Declining...' : 'Decline'}
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


//! good
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
//   Skeleton,
//   Typography,
//   keyframes,
//   styled
// } from '@mui/material';
// import React, { useEffect } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import {
//   acceptFriendRequest,
//   getPendingRequests,
//   rejectFriendRequest
// } from '../../features/friendship/friendshipSlice';
// import { startLoading, stopLoading } from '../../features/loading/loadingSlice';
// import { showSnackbar } from '../../features/snackbar/snackbarSlice';
// import { getFriendlyErrorMessage } from '../../utils/friendshipErrors';

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
//   zIndex: 1
// });

// const FriendRequestsPage = () => {
//   const dispatch = useDispatch();
//   const { pendingRequests, status, error } = useSelector(
//     state => state.friendship
//   );
//   const { isLoading } = useSelector(state => state.loading);

//   useEffect(() => {
//     const loadRequests = async () => {
//       dispatch(startLoading({ message: 'Loading friend requests...' }));
//       try {
//         await dispatch(getPendingRequests());
//       } finally {
//         dispatch(stopLoading());
//       }
//     };
    
//     loadRequests();
//   }, [dispatch]);

//   const handleAccept = async (friendshipId) => {
//     dispatch(startLoading({ message: 'Accepting friend request...' }));
    
//     try {
//       dispatch(
//         showSnackbar({
//           message: 'Accepting friend request...',
//           severity: 'info',
//           persist: true,
//           icon: <CircularProgress size={20} color="inherit" />
//         })
//       );
      
//       const resultAction = await dispatch(acceptFriendRequest(friendshipId));
      
//       if (acceptFriendRequest.fulfilled.match(resultAction)) {
//         dispatch(showSnackbar({
//           message: 'Friend request accepted!',
//           severity: 'success',
//           icon: <AcceptIcon />,
//           autoHideDuration: 3000
//         }));
        
//         setTimeout(() => {
//           dispatch(getPendingRequests());
//         }, 1000);
//       } else {
//         const error = resultAction.payload;
//         throw new Error(error?.code || 'accept_failed');
//       }
//     } catch (error) {
//       dispatch(showSnackbar({
//         message: getFriendlyErrorMessage(error.message),
//         severity: 'error',
//         icon: <DeclineIcon />,
//         autoHideDuration: error.message === 'already_friends' ? 6000 : 4000
//       }));
//     } finally {
//       dispatch(stopLoading());
//     }
//   };

//   const handleReject = async (friendshipId) => {
//     dispatch(startLoading({ message: 'Rejecting friend request...' }));
    
//     try {
//       dispatch(
//         showSnackbar({
//           message: 'Processing rejection...',
//           severity: 'info',
//           persist: true,
//           icon: <CircularProgress size={20} color="inherit" />
//         })
//       );
      
//       const resultAction = await dispatch(rejectFriendRequest(friendshipId));
      
//       if (rejectFriendRequest.fulfilled.match(resultAction)) {
//         dispatch(showSnackbar({
//           message: 'Friend request rejected',
//           severity: 'success',
//           icon: <DeclineIcon />,
//           autoHideDuration: 3000
//         }));
        
//         setTimeout(() => {
//           dispatch(getPendingRequests());
//         }, 1000);
//       } else {
//         const error = resultAction.payload;
//         throw new Error(error?.code || 'reject_failed');
//       }
//     } catch (error) {
//       dispatch(showSnackbar({
//         message: getFriendlyErrorMessage(error.message),
//         severity: 'error',
//         icon: <DeclineIcon />,
//         autoHideDuration: 4000
//       }));
//     } finally {
//       dispatch(stopLoading());
//     }
//   };

//   if (status === 'loading' && !pendingRequests.data?.length) {
//     return (
//       <Container maxWidth="md" sx={{ py: 4 }}>
//         <Paper elevation={3} sx={{ 
//           p: 3, 
//           borderRadius: 2,
//           overflow: 'hidden',
//           position: 'relative'
//         }}>
//           <ShimmerOverlay />
          
//           <Box sx={{ 
//             display: 'flex', 
//             alignItems: 'center', 
//             mb: 3,
//             position: 'relative',
//             zIndex: 2
//           }}>
//             <Skeleton 
//               variant="rounded" 
//               width={200} 
//               height={40} 
//               sx={{ 
//                 bgcolor: 'grey.200',
//                 animation: `${pulse} 1.5s ease-in-out infinite`
//               }}
//             />
//             <Skeleton 
//               variant="circular" 
//               width={32} 
//               height={32} 
//               sx={{ 
//                 bgcolor: 'grey.200',
//                 ml: 2,
//                 animation: `${pulse} 1.5s ease-in-out infinite`
//               }}
//             />
//           </Box>
          
//           {[...Array(3)].map((_, index) => (
//             <React.Fragment key={index}>
//               <ListItem sx={{ 
//                 py: 2,
//                 position: 'relative',
//                 zIndex: 2
//               }}>
//                 <ListItemAvatar>
//                   <Skeleton 
//                     variant="circular" 
//                     width={48} 
//                     height={48} 
//                     sx={{ 
//                       bgcolor: 'grey.200',
//                       animation: `${pulse} 1.5s ease-in-out infinite`
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
//                         animation: `${pulse} 1.5s ease-in-out infinite`
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
//                         mt: 1
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
//                       animation: `${pulse} 1.5s ease-in-out infinite`
//                     }} 
//                   />
//                   <Skeleton 
//                     variant="rounded" 
//                     width={110} 
//                     height={36} 
//                     sx={{ 
//                       bgcolor: 'grey.200',
//                       animation: `${pulse} 1.5s ease-in-out infinite`
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
//                     <Avatar 
//                       src={request.requester?.profileImage} 
//                       sx={{
//                         '&:hover': {
//                           transform: 'scale(1.1)',
//                           transition: 'transform 0.3s ease'
//                         }
//                       }}
//                     />
//                   </ListItemAvatar>
//                   <ListItemText
//                     primary={`${request.requester?.firstName} ${request.requester?.lastName}`}
//                     secondary="Sent you a friend request"
//                   />
//                   <Box sx={{ display: 'flex', gap: 1 }}>
//                     <Button
//                       variant="contained"
//                       color="success"
//                       startIcon={isLoading ? (
//                         <CircularProgress 
//                           size={20} 
//                           color="inherit" 
//                           sx={{
//                             animation: `${spin} 1s linear infinite`,
//                           }}
//                         />
//                       ) : <AcceptIcon />}
//                       onClick={() => handleAccept(request.id)}
//                       disabled={isLoading}
//                       sx={{ 
//                         minWidth: 110,
//                         transition: 'all 0.3s ease',
//                         '&:hover': {
//                           transform: 'translateY(-2px)',
//                           boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
//                         },
//                         '&:disabled': {
//                           bgcolor: 'success.main',
//                           opacity: 0.7
//                         }
//                       }}
//                     >
//                       {isLoading ? 'Accepting...' : 'Accept'}
//                     </Button>
//                     <Button
//                       variant="outlined"
//                       color="error"
//                       startIcon={isLoading ? (
//                         <CircularProgress 
//                           size={20} 
//                           color="inherit" 
//                           sx={{
//                             animation: `${spin} 1s linear infinite`,
//                           }}
//                         />
//                       ) : <DeclineIcon />}
//                       onClick={() => handleReject(request.id)}
//                       disabled={isLoading}
//                       sx={{ 
//                         minWidth: 110,
//                         transition: 'all 0.3s ease',
//                         '&:hover': {
//                           transform: 'translateY(-2px)',
//                           boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
//                         },
//                         '&:disabled': {
//                           borderColor: 'error.main',
//                           opacity: 0.7
//                         }
//                       }}
//                     >
//                       {isLoading ? 'Declining...' : 'Decline'}
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










//! good
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
//   Skeleton,
//   Typography,
//   keyframes,
//   styled
// } from '@mui/material';
// import React, { useEffect } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import {
//   acceptFriendRequest,
//   getPendingRequests,
//   rejectFriendRequest
// } from '../../features/friendship/friendshipSlice';
// import { showSnackbar } from '../../features/snackbar/snackbarSlice';
// import { getFriendlyErrorMessage } from '../../utils/friendshipErrors';

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
//   zIndex: 1
// });

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
//       dispatch(
//         showSnackbar({
//           message: 'Accepting friend request...',
//           severity: 'info',
//           persist: true,
//           icon: <CircularProgress size={20} color="inherit" />
//         })
//       );
      
//       const resultAction = await dispatch(acceptFriendRequest(friendshipId));
      
//       if (acceptFriendRequest.fulfilled.match(resultAction)) {
//         dispatch(showSnackbar({
//           message: 'Friend request accepted!',
//           severity: 'success',
//           icon: <AcceptIcon />,
//           autoHideDuration: 3000
//         }));
        
//         setTimeout(() => {
//           dispatch(getPendingRequests());
//         }, 1000);
//       } else {
//         const error = resultAction.payload;
//         throw new Error(error?.code || 'accept_failed');
//       }
//     } catch (error) {
//       dispatch(showSnackbar({
//         message: getFriendlyErrorMessage(error.message),
//         severity: 'error',
//         icon: <DeclineIcon />,
//         autoHideDuration: error.message === 'already_friends' ? 6000 : 4000
//       }));
//     }
//   };

//   const handleReject = async (friendshipId) => {
//     try {
//       dispatch(
//         showSnackbar({
//           message: 'Processing rejection...',
//           severity: 'info',
//           persist: true,
//           icon: <CircularProgress size={20} color="inherit" />
//         })
//       );
      
//       const resultAction = await dispatch(rejectFriendRequest(friendshipId));
      
//       if (rejectFriendRequest.fulfilled.match(resultAction)) {
//         dispatch(showSnackbar({
//           message: 'Friend request rejected',
//           severity: 'success',
//           icon: <DeclineIcon />,
//           autoHideDuration: 3000
//         }));
        
//         setTimeout(() => {
//           dispatch(getPendingRequests());
//         }, 1000);
//       } else {
//         const error = resultAction.payload;
//         throw new Error(error?.code || 'reject_failed');
//       }
//     } catch (error) {
//       dispatch(showSnackbar({
//         message: getFriendlyErrorMessage(error.message),
//         severity: 'error',
//         icon: <DeclineIcon />,
//         autoHideDuration: 4000
//       }));
//     }
//   };

//   if (status === 'loading' && !pendingRequests.data?.length) {
//     return (
//       <Container maxWidth="md" sx={{ py: 4 }}>
//         <Paper elevation={3} sx={{ 
//           p: 3, 
//           borderRadius: 2,
//           overflow: 'hidden',
//           position: 'relative'
//         }}>
//           <ShimmerOverlay />
          
//           <Box sx={{ 
//             display: 'flex', 
//             alignItems: 'center', 
//             mb: 3,
//             position: 'relative',
//             zIndex: 2
//           }}>
//             <Skeleton 
//               variant="rounded" 
//               width={200} 
//               height={40} 
//               sx={{ 
//                 bgcolor: 'grey.200',
//                 animation: `${pulse} 1.5s ease-in-out infinite`
//               }}
//             />
//             <Skeleton 
//               variant="circular" 
//               width={32} 
//               height={32} 
//               sx={{ 
//                 bgcolor: 'grey.200',
//                 ml: 2,
//                 animation: `${pulse} 1.5s ease-in-out infinite`
//               }}
//             />
//           </Box>
          
//           {[...Array(3)].map((_, index) => (
//             <React.Fragment key={index}>
//               <ListItem sx={{ 
//                 py: 2,
//                 position: 'relative',
//                 zIndex: 2
//               }}>
//                 <ListItemAvatar>
//                   <Skeleton 
//                     variant="circular" 
//                     width={48} 
//                     height={48} 
//                     sx={{ 
//                       bgcolor: 'grey.200',
//                       animation: `${pulse} 1.5s ease-in-out infinite`
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
//                         animation: `${pulse} 1.5s ease-in-out infinite`
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
//                         mt: 1
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
//                       animation: `${pulse} 1.5s ease-in-out infinite`
//                     }} 
//                   />
//                   <Skeleton 
//                     variant="rounded" 
//                     width={110} 
//                     height={36} 
//                     sx={{ 
//                       bgcolor: 'grey.200',
//                       animation: `${pulse} 1.5s ease-in-out infinite`
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
//                     <Avatar 
//                       src={request.requester?.profileImage} 
//                       sx={{
//                         '&:hover': {
//                           transform: 'scale(1.1)',
//                           transition: 'transform 0.3s ease'
//                         }
//                       }}
//                     />
//                   </ListItemAvatar>
//                   <ListItemText
//                     primary={`${request.requester?.firstName} ${request.requester?.lastName}`}
//                     secondary="Sent you a friend request"
//                   />
//                   <Box sx={{ display: 'flex', gap: 1 }}>
//                     <Button
//                       variant="contained"
//                       color="success"
//                       startIcon={status === 'loading' ? (
//                         <CircularProgress 
//                           size={20} 
//                           color="inherit" 
//                           sx={{
//                             animation: `${spin} 1s linear infinite`,
//                           }}
//                         />
//                       ) : <AcceptIcon />}
//                       onClick={() => handleAccept(request.id)}
//                       disabled={status === 'loading'}
//                       sx={{ 
//                         minWidth: 110,
//                         transition: 'all 0.3s ease',
//                         '&:hover': {
//                           transform: 'translateY(-2px)',
//                           boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
//                         },
//                         '&:disabled': {
//                           bgcolor: 'success.main',
//                           opacity: 0.7
//                         }
//                       }}
//                     >
//                       {status === 'loading' ? 'Accepting...' : 'Accept'}
//                     </Button>
//                     <Button
//                       variant="outlined"
//                       color="error"
//                       startIcon={status === 'loading' ? (
//                         <CircularProgress 
//                           size={20} 
//                           color="inherit" 
//                           sx={{
//                             animation: `${spin} 1s linear infinite`,
//                           }}
//                         />
//                       ) : <DeclineIcon />}
//                       onClick={() => handleReject(request.id)}
//                       disabled={status === 'loading'}
//                       sx={{ 
//                         minWidth: 110,
//                         transition: 'all 0.3s ease',
//                         '&:hover': {
//                           transform: 'translateY(-2px)',
//                           boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
//                         },
//                         '&:disabled': {
//                           borderColor: 'error.main',
//                           opacity: 0.7
//                         }
//                       }}
//                     >
//                       {status === 'loading' ? 'Declining...' : 'Decline'}
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




//! good
// Updated FriendRequestsPage.jsx
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
//   Typography,
//   keyframes
// } from '@mui/material';
// import React, { useEffect } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import {
//   acceptFriendRequest,
//   getPendingRequests,
//   rejectFriendRequest
// } from '../../features/friendship/friendshipSlice';
// import { showSnackbar } from '../../features/snackbar/snackbarSlice';
// import { getFriendlyErrorMessage } from '../../utils/friendshipErrors';

// // Animation for loading state
// const shimmer = keyframes`
//   0% { background-position: -200% 0; }
//   100% { background-position: 200% 0; }
// `;

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
//       dispatch(
//         showSnackbar({
//           message: 'Accepting friend request...',
//           severity: 'info',
//           persist: true,
//           icon: <CircularProgress size={20} color="inherit" />
//         })
//       );
      
//       const resultAction = await dispatch(acceptFriendRequest(friendshipId));
      
//       if (acceptFriendRequest.fulfilled.match(resultAction)) {
//         dispatch(showSnackbar({
//           message: 'Friend request accepted!',
//           severity: 'success',
//           icon: <AcceptIcon />,
//           autoHideDuration: 3000
//         }));
        
//         // Refresh the list after 1 second to allow for propagation
//         setTimeout(() => {
//           dispatch(getPendingRequests());
//         }, 1000);
//       } else {
//         const error = resultAction.payload;
//         throw new Error(error?.code || 'accept_failed');
//       }
//     } catch (error) {
//       dispatch(showSnackbar({
//         message: getFriendlyErrorMessage(error.message),
//         severity: 'error',
//         icon: <DeclineIcon />,
//         autoHideDuration: error.message === 'already_friends' ? 6000 : 4000
//       }));
//     }
//   };

//   const handleReject = async (friendshipId) => {
//     try {
//       dispatch(
//         showSnackbar({
//           message: 'Processing rejection...',
//           severity: 'info',
//           persist: true,
//           icon: <CircularProgress size={20} color="inherit" />
//         })
//       );
      
//       const resultAction = await dispatch(rejectFriendRequest(friendshipId));
      
//       if (rejectFriendRequest.fulfilled.match(resultAction)) {
//         dispatch(showSnackbar({
//           message: 'Friend request rejected',
//           severity: 'success',
//           icon: <DeclineIcon />,
//           autoHideDuration: 3000
//         }));
        
//         setTimeout(() => {
//           dispatch(getPendingRequests());
//         }, 1000);
//       } else {
//         const error = resultAction.payload;
//         throw new Error(error?.code || 'reject_failed');
//       }
//     } catch (error) {
//       dispatch(showSnackbar({
//         message: getFriendlyErrorMessage(error.message),
//         severity: 'error',
//         icon: <DeclineIcon />,
//         autoHideDuration: 4000
//       }));
//     }
//   };

//   if (status === 'loading' && !pendingRequests.data?.length) {
//     return (
//       <Container maxWidth="md" sx={{ py: 4 }}>
//         <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
//           <Box sx={{ 
//             display: 'flex', 
//             alignItems: 'center', 
//             mb: 3,
//             '& .MuiSkeleton-root': {
//               bgcolor: 'background.paper',
//               backgroundImage: 'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.3) 50%, rgba(255,255,255,0) 100%)',
//               backgroundSize: '200% 100%',
//               animation: `${shimmer} 1.5s infinite linear`
//             }
//           }}>
//             <Box 
//               sx={{ 
//                 width: 120, 
//                 height: 36, 
//                 borderRadius: 1,
//                 bgcolor: 'background.paper',
//                 backgroundImage: 'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.3) 50%, rgba(255,255,255,0) 100%)',
//                 backgroundSize: '200% 100%',
//                 animation: `${shimmer} 1.5s infinite linear`
//               }} 
//             />
//             <Box 
//               sx={{ 
//                 width: 80, 
//                 height: 32, 
//                 borderRadius: 16,
//                 ml: 2,
//                 bgcolor: 'background.paper',
//                 backgroundImage: 'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.3) 50%, rgba(255,255,255,0) 100%)',
//                 backgroundSize: '200% 100%',
//                 animation: `${shimmer} 1.5s infinite linear`
//               }} 
//             />
//           </Box>
          
//           {[...Array(3)].map((_, index) => (
//             <React.Fragment key={index}>
//               <ListItem sx={{ py: 2 }}>
//                 <ListItemAvatar>
//                   <Box 
//                     sx={{ 
//                       width: 40, 
//                       height: 40, 
//                       borderRadius: '50%',
//                       bgcolor: 'background.paper',
//                       backgroundImage: 'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.3) 50%, rgba(255,255,255,0) 100%)',
//                       backgroundSize: '200% 100%',
//                       animation: `${shimmer} 1.5s infinite linear`
//                     }} 
//                   />
//                 </ListItemAvatar>
//                 <ListItemText
//                   primary={
//                     <Box 
//                       sx={{ 
//                         width: 120, 
//                         height: 20, 
//                         borderRadius: 1,
//                         bgcolor: 'background.paper',
//                         backgroundImage: 'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.3) 50%, rgba(255,255,255,0) 100%)',
//                         backgroundSize: '200% 100%',
//                         animation: `${shimmer} 1.5s infinite linear`
//                       }} 
//                     />
//                   }
//                   secondary={
//                     <Box 
//                       sx={{ 
//                         width: 180, 
//                         height: 16, 
//                         borderRadius: 1,
//                         mt: 1,
//                         bgcolor: 'background.paper',
//                         backgroundImage: 'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.3) 50%, rgba(255,255,255,0) 100%)',
//                         backgroundSize: '200% 100%',
//                         animation: `${shimmer} 1.5s infinite linear`
//                       }} 
//                     />
//                   }
//                 />
//                 <Box sx={{ display: 'flex', gap: 1 }}>
//                   <Box 
//                     sx={{ 
//                       width: 110, 
//                       height: 36, 
//                       borderRadius: 1,
//                       bgcolor: 'background.paper',
//                       backgroundImage: 'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.3) 50%, rgba(255,255,255,0) 100%)',
//                       backgroundSize: '200% 100%',
//                       animation: `${shimmer} 1.5s infinite linear`
//                     }} 
//                   />
//                   <Box 
//                     sx={{ 
//                       width: 110, 
//                       height: 36, 
//                       borderRadius: 1,
//                       bgcolor: 'background.paper',
//                       backgroundImage: 'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.3) 50%, rgba(255,255,255,0) 100%)',
//                       backgroundSize: '200% 100%',
//                       animation: `${shimmer} 1.5s infinite linear`
//                     }} 
//                   />
//                 </Box>
//               </ListItem>
//               <Divider />
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
//                       startIcon={status === 'loading' ? (
//                         <CircularProgress 
//                           size={20} 
//                           color="inherit" 
//                           sx={{
//                             animation: `${spin} 1s linear infinite`,
//                           }}
//                         />
//                       ) : <AcceptIcon />}
//                       onClick={() => handleAccept(request.id)}
//                       disabled={status === 'loading'}
//                       sx={{ 
//                         minWidth: 110,
//                         '&:disabled': {
//                           bgcolor: 'success.main',
//                           opacity: 0.7
//                         }
//                       }}
//                     >
//                       {status === 'loading' ? 'Accepting...' : 'Accept'}
//                     </Button>
//                     <Button
//                       variant="outlined"
//                       color="error"
//                       startIcon={status === 'loading' ? (
//                         <CircularProgress 
//                           size={20} 
//                           color="inherit" 
//                           sx={{
//                             animation: `${spin} 1s linear infinite`,
//                           }}
//                         />
//                       ) : <DeclineIcon />}
//                       onClick={() => handleReject(request.id)}
//                       disabled={status === 'loading'}
//                       sx={{ 
//                         minWidth: 110,
//                         '&:disabled': {
//                           borderColor: 'error.main',
//                           opacity: 0.7
//                         }
//                       }}
//                     >
//                       {status === 'loading' ? 'Declining...' : 'Decline'}
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









//! original
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
// import { getFriendlyErrorMessage } from '../../utils/friendshipErrors';

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
//         const error = resultAction.payload;
//         throw new Error(error?.code || 'accept_failed');
//       }
//     } catch (error) {
//       dispatch(showSnackbar({
//         message: getFriendlyErrorMessage(error.message),
//         severity: 'error',
//         autoHideDuration: error.message === 'already_friends' ? 6000 : 4000
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
//         const error = resultAction.payload;
//         throw new Error(error?.code || 'reject_failed');
//       }
//     } catch (error) {
//       dispatch(showSnackbar({
//         message: getFriendlyErrorMessage(error.message),
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
//                       {status === 'loading' ? (
//                         <CircularProgress size={20} color="inherit" />
//                       ) : (
//                         'Accept'
//                       )}
//                     </Button>
//                     <Button
//                       variant="outlined"
//                       color="error"
//                       startIcon={<DeclineIcon />}
//                       onClick={() => handleReject(request.id)}
//                       disabled={status === 'loading'}
//                       sx={{ minWidth: 110 }}
//                     >
//                       {status === 'loading' ? (
//                         <CircularProgress size={20} color="inherit" />
//                       ) : (
//                         'Decline'
//                       )}
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













