// // src/pages/NotificationPage.jsx

// // import React, { useEffect } from 'react';
// // import {
// //   Box,
// //   Typography,
// //   List,
// //   ListItem,
// //   ListItemAvatar,
// //   Avatar,
// //   ListItemText,
// //   IconButton,
// //   Button,
// //   Divider,
// //   CircularProgress,
// //   Paper,
// // } from '@mui/material';
// // import { PersonAdd, ThumbUp, Person, Done, Clear } from '@mui/icons-material';
// // import { useDispatch, useSelector } from 'react-redux';

// // // Thunks from your notificationSlice:
// // import {
// //   fetchNotifications,
// //   markAsRead,
// //   // If you have real thunks for accept/reject, import those instead:
// //   // acceptFriendRequest,
// //   // rejectFriendRequest,
// // } from '../../features/notification/notificationSlice';

// // // Action from your snackbarSlice:
// // import { showSnackbar } from '../../features/snackbar/snackbarSlice';

// // const NotificationPage = () => {
// //   const dispatch = useDispatch();

// //   // Grab notifications array + loading status from Redux:
// //   const { items: notifications = [], status, error } =
// //     useSelector((state) => state.notifications);

// //   useEffect(() => {
// //     // Fetch page #1 with size=20 when the component mounts
// //     dispatch(fetchNotifications({ page: 1, size: 20 }))
// //       .unwrap()
// //       .catch(() => {
// //         dispatch(
// //           showSnackbar({
// //             message: 'Failed to load notifications',
// //             severity: 'error',
// //           })
// //         );
// //       });
// //   }, [dispatch]);

// //   // Helper to render the correct icon based on notification type:
// //   const renderNotificationIcon = (type) => {
// //     switch (type) {
// //       case 'FRIEND_REQUEST':
// //         return <PersonAdd color="primary" />;
// //       case 'LIKE':
// //         return <ThumbUp color="secondary" />;
// //       case 'FOLLOW':
// //         return <Person color="action" />;
// //       default:
// //         return <Person color="disabled" />;
// //     }
// //   };

// //   // When the user clicks “Mark as read”:
// //   const handleMarkAsRead = async (notificationId) => {
// //     try {
// //       // Dispatch the thunk; unwrap() ensures we catch any error here
// //       await dispatch(markAsRead(notificationId)).unwrap();
// //       dispatch(
// //         showSnackbar({
// //           message: 'Notification marked as read',
// //           severity: 'success',
// //         })
// //       );
// //       // Because `markAsRead` should update Redux state and set isRead = true,
// //       // this notification will automatically disappear (see rendering logic below).
// //     } catch (err) {
// //       dispatch(
// //         showSnackbar({
// //           message: 'Failed to mark notification as read',
// //           severity: 'error',
// //         })
// //       );
// //     }
// //   };

// //   // If you also have real “acceptFriendRequest” and “rejectFriendRequest” thunks,
// //   // swap out the placeholder logic below with those thunks (and handle errors similarly).

// //   const handleAccept = async (notificationId) => {
// //     try {
// //       // Example with a real thunk: 
// //       // await dispatch(acceptFriendRequest(notificationId)).unwrap();
// //       // dispatch(showSnackbar({ message: 'Friend request accepted', severity: 'success' }));

// //       // Placeholder fallback:
// //       await dispatch({ type: 'notification/acceptRequest', payload: notificationId })
// //         .unwrap?.();
// //       dispatch(
// //         showSnackbar({
// //           message: 'Friend request accepted',
// //           severity: 'success',
// //         })
// //       );
// //     } catch (err) {
// //       dispatch(
// //         showSnackbar({
// //           message: 'Failed to accept friend request',
// //           severity: 'error',
// //         })
// //       );
// //     }
// //   };

// //   const handleReject = async (notificationId) => {
// //     try {
// //       // Example with a real thunk: 
// //       // await dispatch(rejectFriendRequest(notificationId)).unwrap();
// //       // dispatch(showSnackbar({ message: 'Friend request rejected', severity: 'info' }));

// //       // Placeholder fallback:
// //       await dispatch({ type: 'notification/rejectRequest', payload: notificationId })
// //         .unwrap?.();
// //       dispatch(
// //         showSnackbar({
// //           message: 'Friend request rejected',
// //           severity: 'info',
// //         })
// //       );
// //     } catch (err) {
// //       dispatch(
// //         showSnackbar({
// //           message: 'Failed to reject friend request',
// //           severity: 'error',
// //         })
// //       );
// //     }
// //   };

// //   // Show a loading spinner while notifications are being fetched:
// //   if (status === 'loading') {
// //     return (
// //       <Box textAlign="center" mt={4}>
// //         <CircularProgress />
// //       </Box>
// //     );
// //   }

// //   // Only render notifications that are still unread:
// //   const unreadNotifications = notifications.filter((n) => !n.isRead);

// //   return (
// //     <Box p={3} maxWidth="800px" margin="auto">
// //       <Typography variant="h4" gutterBottom>
// //         Notifications
// //       </Typography>
// //       <Paper elevation={3}>
// //         <List>
// //           {Array.isArray(unreadNotifications) && unreadNotifications.length > 0 ? (
// //             unreadNotifications.map((notification) => (
// //               <React.Fragment key={notification.id}>
// //                 <ListItem
// //                   alignItems="flex-start"
// //                   sx={{
// //                     backgroundColor: '#f9f9f9',
// //                   }}
// //                 >
// //                   <ListItemAvatar>
// //                     <Avatar>
// //                       {renderNotificationIcon(notification.type)}
// //                     </Avatar>
// //                   </ListItemAvatar>

// //                   <ListItemText
// //                     primary={notification.metadata?.senderName || 'System'}
// //                     secondary={
// //                       <>
// //                         <Typography
// //                           component="span"
// //                           variant="body2"
// //                           color="textPrimary"
// //                         >
// //                           {notification.type.replace('_', ' ')}
// //                         </Typography>
// //                         {` — ${notification.metadata?.message || ''}`}
// //                         <br />
// //                         {new Date(notification.createdAt).toLocaleString()}
// //                       </>
// //                     }
// //                   />

// //                   {/* “Mark as read” button: only shown on unread items */}
// //                   <IconButton
// //                     onClick={() => handleMarkAsRead(notification.id)}
// //                     title="Mark as read"
// //                   >
// //                     <Done />
// //                   </IconButton>

// //                   {/* If it’s a friend request, show Accept / Reject */}
// //                   {notification.type === 'FRIEND_REQUEST' && (
// //                     <>
// //                       <Button
// //                         color="success"
// //                         onClick={() => handleAccept(notification.id)}
// //                         startIcon={<Done />}
// //                       >
// //                         Accept
// //                       </Button>
// //                       <Button
// //                         color="error"
// //                         onClick={() => handleReject(notification.id)}
// //                         startIcon={<Clear />}
// //                       >
// //                         Reject
// //                       </Button>
// //                     </>
// //                   )}
// //                 </ListItem>
// //                 <Divider component="li" />
// //               </React.Fragment>
// //             ))
// //           ) : (
// //             <ListItem>
// //               <ListItemText primary="No unread notifications." />
// //             </ListItem>
// //           )}
// //         </List>
// //       </Paper>
// //     </Box>
// //   );
// // };

// // export default NotificationPage;










// //! running
// // src/pages/NotificationPage.jsx

// import React, { useEffect } from 'react';
// import {
//   Box,
//   Typography,
//   List,
//   ListItem,
//   ListItemAvatar,
//   Avatar,
//   ListItemText,
//   IconButton,
//   Button,
//   Divider,
//   CircularProgress,
//   Paper,
// } from '@mui/material';
// import { PersonAdd, ThumbUp, Person, Done, Clear } from '@mui/icons-material';
// import { useDispatch, useSelector } from 'react-redux';

// // These are your existing thunks from notificationSlice:
// import {
//   fetchNotifications,
//   markAsRead,
//   // …if you have acceptFriendRequest / rejectFriendRequest thunks, import them here
// } from '../../features/notification/notificationSlice';

// // Import the snackbar action:
// import { showSnackbar } from '../../features/snackbar/snackbarSlice';

// // If you do not yet have a “SnackbarContainer” component that uses
// // the snackbarSlice state to actually render an MUI <Snackbar/>, you’ll
// // need to create one and mount it at the root (e.g. in App.jsx). See notes below.

// const NotificationPage = () => {
//   const dispatch = useDispatch();

//   // Grab notifications + loading status from your notification slice:
//   const { items: notifications = [], status, error } =
//     useSelector((state) => state.notifications);

//   useEffect(() => {
//     // Fetch the first page (page=1, size=20). You can parameterize as needed.
//     dispatch(fetchNotifications({ page: 1, size: 20 }))
//       .unwrap()
//       .catch((err) => {
//         // If fetching fails, show an error snackbar
//         dispatch(
//           showSnackbar({
//             message: 'Failed to load notifications',
//             severity: 'error',
//           })
//         );
//       });
//   }, [dispatch]);

//   // Helper to pick an icon based on notification.type
//   const renderNotificationIcon = (type) => {
//     switch (type) {
//       case 'FRIEND_REQUEST':
//         return <PersonAdd color="primary" />;
//       case 'LIKE':
//         return <ThumbUp color="secondary" />;
//       case 'FOLLOW':
//         return <Person color="action" />;
//       default:
//         return <Person color="disabled" />;
//     }
//   };

//   // When you click “Mark as read,” dispatch markAsRead(...) first.
//   // Because markAsRead is a thunk, it returns a Promise that we can unwrap().
//   const handleMarkAsRead = async (notificationId) => {
//     try {
//       await dispatch(markAsRead(notificationId)).unwrap();
//       // If that succeeded:
//       dispatch(
//         showSnackbar({
//           message: 'Notification marked as read',
//           severity: 'success',
//         })
//       );
//     } catch (err) {
//       // If something went wrong:
//       dispatch(
//         showSnackbar({
//           message: 'Failed to mark notification as read',
//           severity: 'error',
//         })
//       );
//     }
//   };

//   // If you also have friend‐request “accept” / “reject” thunks, do the same pattern:
//   const handleAccept = async (notificationId) => {
//     try {
//       // Replace the below with your real thunk (e.g. acceptFriendRequest)
//       await dispatch({ type: 'notification/acceptRequest', payload: notificationId })
//         .unwrap?.();
//       dispatch(
//         showSnackbar({
//           message: 'Friend request accepted',
//           severity: 'success',
//         })
//       );
//     } catch (err) {
//       dispatch(
//         showSnackbar({
//           message: 'Failed to accept friend request',
//           severity: 'error',
//         })
//       );
//     }
//   };

//   const handleReject = async (notificationId) => {
//     try {
//       // Replace the below with your real thunk (e.g. rejectFriendRequest)
//       await dispatch({ type: 'notification/rejectRequest', payload: notificationId })
//         .unwrap?.();
//       dispatch(
//         showSnackbar({
//           message: 'Friend request rejected',
//           severity: 'info',
//         })
//       );
//     } catch (err) {
//       dispatch(
//         showSnackbar({
//           message: 'Failed to reject friend request',
//           severity: 'error',
//         })
//       );
//     }
//   };

//   // Show a loader if we’re in “loading” state
//   if (status === 'loading') {
//     return (
//       <Box textAlign="center" mt={4}>
//         <CircularProgress />
//       </Box>
//     );
//   }

//   return (
//     <Box p={3} maxWidth="800px" margin="auto">
//       <Typography variant="h4" gutterBottom>
//         Notifications
//       </Typography>
//       <Paper elevation={3}>
//         <List>
//           {Array.isArray(notifications) && notifications.length > 0 ? (
//             notifications.map((notification) => (
//               <React.Fragment key={notification.id}>
//                 <ListItem
//                   alignItems="flex-start"
//                   sx={{
//                     backgroundColor: notification.isRead ? 'white' : '#f1f1f1',
//                   }}
//                 >
//                   <ListItemAvatar>
//                     <Avatar>{renderNotificationIcon(notification.type)}</Avatar>
//                   </ListItemAvatar>
//                   <ListItemText
//                     primary={notification.metadata?.senderName || 'System'}
//                     secondary={
//                       <>
//                         <Typography
//                           component="span"
//                           variant="body2"
//                           color="textPrimary"
//                         >
//                           {notification.type.replace('_', ' ')}
//                         </Typography>
//                         {` — ${notification.metadata?.message || ''}`}
//                         <br />
//                         {new Date(notification.createdAt).toLocaleString()}
//                       </>
//                     }
//                   />

//                   {/* If it’s unread, show “Mark as read” button */}
//                   {!notification.isRead && (
//                     <IconButton
//                       onClick={() => handleMarkAsRead(notification.id)}
//                       title="Mark as read"
//                     >
//                       <Done />
//                     </IconButton>
//                   )}

//                   {/* If it’s a friend request and still unread, show Accept/Reject */}
//                   {notification.type === 'FRIEND_REQUEST' &&
//                     !notification.isRead && (
//                       <>
//                         <Button
//                           color="success"
//                           onClick={() => handleAccept(notification.id)}
//                           startIcon={<Done />}
//                         >
//                           Accept
//                         </Button>
//                         <Button
//                           color="error"
//                           onClick={() => handleReject(notification.id)}
//                           startIcon={<Clear />}
//                         >
//                           Reject
//                         </Button>
//                       </>
//                     )}
//                 </ListItem>
//                 <Divider component="li" />
//               </React.Fragment>
//             ))
//           ) : (
//             <ListItem>
//               <ListItemText primary="No notifications found." />
//             </ListItem>
//           )}
//         </List>
//       </Paper>
//     </Box>
//   );
// };

// export default NotificationPage;






