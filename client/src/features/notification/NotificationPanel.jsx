import {
  Clear,
  Comment as CommentIcon,
  Done,
  Notifications as NotificationsIcon,
  Person,
  PersonAdd,
  ThumbUp,
  Check,
  Close
} from '@mui/icons-material';
import {
  Avatar,
  Badge,
  Box,
  Button,
  CircularProgress,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Tab,
  Tabs,
  Typography
} from '@mui/material';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { showSnackbar } from '../snackbar/snackbarSlice';
import {
  acceptFriendRequest,
  fetchNotifications,
  markAllAsRead,
  markAsRead,
  rejectFriendRequest
} from './notificationSlice';

const TAB_ALL = 0;
const TAB_UNREAD = 1;

export default function NotificationPanel({ open, onClose }) {
  const dispatch = useDispatch();
  const { items: allNotifications = [], status } = useSelector(
    (state) => state.notifications
  );
  const [tabIndex, setTabIndex] = useState(TAB_ALL);

  useEffect(() => {
    if (open) {
      dispatch(fetchNotifications({ page: 1, size: 50 }))
        .unwrap()
        .catch(() => {
          dispatch(
            showSnackbar({
              message: 'Failed to load notifications',
              severity: 'error'
            })
          );
        });
    }
  }, [dispatch, open]);

  const groupNotifications = (notifications) => {
    const newNotifications = notifications.filter(n => 
      !n.isRead && new Date(n.createdAt) > new Date(Date.now() - 24 * 60 * 60 * 1000)
    );
    const olderNotifications = notifications.filter(n => 
      !newNotifications.includes(n)
    );
    return { new: newNotifications, older: olderNotifications };
  };

  const { new: newNotifications, older: olderNotifications } = 
    groupNotifications(tabIndex === TAB_UNREAD 
      ? allNotifications.filter(n => !n.isRead) 
      : allNotifications);

  const renderIconByType = (type) => {
    switch (type) {
      case 'friend_request': return <PersonAdd fontSize="small" sx={{ color: '#1976d2' }} />;
      case 'post_like': return <ThumbUp fontSize="small" sx={{ color: '#d32f2f' }} />;
      case 'follow': return <Person fontSize="small" sx={{ color: '#388e3c' }} />;
      case 'comment': return <CommentIcon fontSize="small" sx={{ color: '#6a1b9a' }} />;
      default: return <NotificationsIcon fontSize="small" sx={{ color: '#757575' }} />;
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await dispatch(markAsRead(notificationId)).unwrap();
    } catch {
      dispatch(showSnackbar({ message: 'Failed to mark as read', severity: 'error' }));
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await dispatch(markAllAsRead()).unwrap();
      dispatch(showSnackbar({ message: 'All notifications marked as read', severity: 'success' }));
    } catch {
      dispatch(showSnackbar({ message: 'Failed to mark all as read', severity: 'error' }));
    }
  };

  const handleAccept = async (notification) => {
    const { id: notificationId, metadata } = notification;
    const { friendshipId, senderId } = metadata || {};
    if (!friendshipId) return;
    
    try {
      await dispatch(acceptFriendRequest({ notificationId, friendshipId, senderId })).unwrap();
      dispatch(showSnackbar({ message: 'Friend request accepted', severity: 'success' }));
    } catch {
      dispatch(showSnackbar({ message: 'Failed to accept friend request', severity: 'error' }));
    }
  };

  const handleReject = async (notification) => {
    const { id: notificationId, metadata } = notification;
    const { friendshipId, senderId } = metadata || {};
    if (!friendshipId) return;
    
    try {
      await dispatch(rejectFriendRequest({ notificationId, friendshipId, senderId })).unwrap();
      dispatch(showSnackbar({ message: 'Friend request rejected', severity: 'info' }));
    } catch {
      dispatch(showSnackbar({ message: 'Failed to reject friend request', severity: 'error' }));
    }
  };

  const renderNotificationItem = (notification) => {
    const {
      id,
      type,
      metadata: { senderName, avatarUrl, message, senderId },
      isRead,
      createdAt
    } = notification;

    return (
      <motion.div
        key={id}
        whileHover={{ scale: 1.02 }}
        style={{ originZ: 0 }}
      >
        <ListItem
          alignItems="flex-start"
          sx={{
            p: 1.5,
            mb: 1,
            bgcolor: isRead ? 'background.paper' : 'action.selected',
            borderRadius: 1,
            mx: 1,
            '&:hover': {
              bgcolor: isRead ? 'action.hover' : 'action.selected'
            }
          }}
        >
          <ListItemAvatar>
            <Badge
              color="primary"
              overlap="circular"
              variant={isRead ? undefined : 'dot'}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
              <Avatar 
                src={avatarUrl || '/default-avatar.png'} 
                alt={senderName}
                component={Link}
                to={`/profile/${senderId}`}
                sx={{ 
                  width: 48, 
                  height: 48,
                  textDecoration: 'none'
                }}
              />
            </Badge>
          </ListItemAvatar>

          <ListItemText
            primary={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {renderIconByType(type)}
                <Typography 
                  variant="body1" 
                  component={Link} 
                  to={`/profile/${senderId}`}
                  sx={{ 
                    ml: 1, 
                    fontWeight: isRead ? 400 : 600,
                    textDecoration: 'none',
                    color: 'inherit',
                    '&:hover': {
                      textDecoration: 'underline'
                    }
                  }}
                >
                  {senderName} {message}
                </Typography>
              </Box>
            }
            secondary={
              <Typography variant="caption" color="text.secondary">
                {new Date(createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                {' • '}
                {new Date(createdAt).toLocaleDateString()}
              </Typography>
            }
            sx={{ ml: 1 }}
          />

          {!isRead && type !== 'friend_request' && (
            <IconButton
              onClick={() => handleMarkAsRead(id)}
              title="Mark as read"
              size="small"
              sx={{ mr: 1 }}
            >
              <Done fontSize="small" />
            </IconButton>
          )}

          {type === 'friend_request' && (
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              <Button
                size="small"
                color="success"
                variant="contained"
                startIcon={<Check />}
                onClick={() => handleAccept(notification)}
                sx={{
                  minWidth: 0,
                  px: 1,
                  textTransform: 'none'
                }}
              >
                Accept
              </Button>
              <Button
                size="small"
                color="error"
                variant="outlined"
                startIcon={<Close />}
                onClick={() => handleReject(notification)}
                sx={{
                  minWidth: 0,
                  px: 1,
                  textTransform: 'none'
                }}
              >
                Reject
              </Button>
            </Box>
          )}
        </ListItem>
        <Divider component="li" />
      </motion.div>
    );
  };

  return (
    <Drawer 
      anchor="right" 
      open={open} 
      onClose={onClose}
      sx={{
        '& .MuiDrawer-paper': {
          width: { xs: '100%', sm: 400 },
          top: '56px',
          height: 'calc(100vh - 56px)',
          borderLeft: '1px solid rgba(0, 0, 0, 0.12)',
          position: 'fixed',
          zIndex: 1200
        }
      }}
    >
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        height: '100%',
        bgcolor: 'background.paper'
      }}>
        <Box sx={{ 
          p: 2, 
          borderBottom: '1px solid #eee',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Notifications</Typography>
          <Button 
            size="small"
            onClick={handleMarkAllAsRead}
            disabled={allNotifications.every(n => n.isRead)}
            startIcon={<Done />}
            sx={{ textTransform: 'none' }}
          >
            Mark all as read
          </Button>
        </Box>

        <Tabs
          value={tabIndex}
          onChange={(e, newValue) => setTabIndex(newValue)}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
          sx={{ borderBottom: '1px solid #eee' }}
        >
          <Tab label="All" />
          <Tab label={`Unread (${allNotifications.filter(n => !n.isRead).length})`} />
        </Tabs>

        {status === 'loading' ? (
          <Box sx={{ 
            flex: 1, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center' 
          }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box sx={{ 
            flex: 1, 
            overflowY: 'auto',
            '&::-webkit-scrollbar': { width: '6px' },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: 'rgba(0,0,0,0.2)',
              borderRadius: '3px'
            }
          }}>
            {newNotifications.length > 0 && (
              <>
                <Box sx={{ 
                  px: 2, 
                  py: 1, 
                  bgcolor: 'action.hover',
                  position: 'sticky',
                  top: 0,
                  zIndex: 1
                }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                    New
                  </Typography>
                </Box>
                <List>
                  {newNotifications.map(renderNotificationItem)}
                </List>
              </>
            )}

            {olderNotifications.length > 0 && (
              <>
                <Box sx={{ 
                  px: 2, 
                  py: 1, 
                  bgcolor: 'action.hover',
                  position: 'sticky',
                  top: 0,
                  zIndex: 1
                }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                    Earlier
                  </Typography>
                </Box>
                <List>
                  {olderNotifications.map(renderNotificationItem)}
                </List>
              </>
            )}

            {newNotifications.length === 0 && olderNotifications.length === 0 && (
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center', 
                height: '100%',
                p: 4,
                textAlign: 'center'
              }}>
                <NotificationsIcon sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
                <Typography variant="h6" sx={{ mb: 1 }}>
                  No notifications
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {tabIndex === TAB_UNREAD 
                    ? "You're all caught up!" 
                    : "You'll see notifications here when you get them."}
                </Typography>
              </Box>
            )}
          </Box>
        )}

        <Box sx={{ 
          p: 2, 
          borderTop: '1px solid #eee',
          textAlign: 'center'
        }}>
          <Button 
            variant="text" 
            color="primary"
            component={Link}
            to="/notifications"
            onClick={onClose}
            sx={{ textTransform: 'none' }}
          >
            See All Notifications
          </Button>
        </Box>
      </Box>
    </Drawer>
  );
}






// ! running
// NotificationPanel.js
// import {
//   Clear,
//   Comment as CommentIcon,
//   DoneAll,
//   Done,
//   Notifications as NotificationsIcon,
//   Person,
//   PersonAdd,
//   ThumbUp,
//   MoreVert,
//   Settings
// } from '@mui/icons-material';
// import {
//   Avatar,
//   Badge,
//   Box,
//   Button,
//   Chip,
//   CircularProgress,
//   Divider,
//   Drawer,
//   IconButton,
//   List,
//   ListItem,
//   ListItemAvatar,
//   ListItemButton,
//   ListItemIcon,
//   ListItemText,
//   Menu,
//   MenuItem,
//   Tab,
//   Tabs,
//   Typography,
//   useTheme
// } from '@mui/material';
// import { motion } from 'framer-motion';
// import { useEffect, useState } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { Link } from 'react-router-dom';
// import { showSnackbar } from '../snackbar/snackbarSlice';
// import {
//   acceptFriendRequest,
//   fetchNotifications,
//   markAllAsRead,
//   markAsRead,
//   rejectFriendRequest
// } from './notificationSlice';

// const TAB_ALL = 0;
// const TAB_UNREAD = 1;

// export default function NotificationPanel({ open, onClose }) {
//   const dispatch = useDispatch();
//   const theme = useTheme();
//   const { items: allNotifications = [], status } = useSelector(
//     (state) => state.notifications
//   );
//   const [tabIndex, setTabIndex] = useState(TAB_ALL);
//   const [anchorEl, setAnchorEl] = useState(null);
//   const [selectedNotification, setSelectedNotification] = useState(null);

//   useEffect(() => {
//     if (open) {
//       dispatch(fetchNotifications({ page: 1, size: 50 }))
//         .unwrap()
//         .catch(() => {
//           dispatch(
//             showSnackbar({
//               message: 'Failed to load notifications',
//               severity: 'error'
//             })
//           );
//         });
//     }
//   }, [dispatch, open]);

//   const handleMenuOpen = (event, notification) => {
//     setAnchorEl(event.currentTarget);
//     setSelectedNotification(notification);
//   };

//   const handleMenuClose = () => {
//     setAnchorEl(null);
//     setSelectedNotification(null);
//   };

//   const groupNotifications = (notifications) => {
//     const today = new Date();
//     today.setHours(0, 0, 0, 0);

//     const newNotifications = notifications.filter(n => 
//       !n.isRead && new Date(n.createdAt) > new Date(Date.now() - 24 * 60 * 60 * 1000)
//     );
    
//     const todayNotifications = notifications.filter(n => 
//       new Date(n.createdAt) >= today && !newNotifications.includes(n)
//     );
    
//     const olderNotifications = notifications.filter(n => 
//       !newNotifications.includes(n) && !todayNotifications.includes(n)
//     );

//     return { new: newNotifications, today: todayNotifications, older: olderNotifications };
//   };

//   const { new: newNotifications, today: todayNotifications, older: olderNotifications } = 
//     groupNotifications(tabIndex === TAB_UNREAD 
//       ? allNotifications.filter(n => !n.isRead) 
//       : allNotifications);

//   const getNotificationColor = (type) => {
//     switch (type) {
//       case 'friend_request': return theme.palette.primary.main;
//       case 'post_like': return '#e91e63';
//       case 'follow': return '#4caf50';
//       case 'comment': return '#9c27b0';
//       case 'tag': return '#ff9800';
//       default: return theme.palette.text.secondary;
//     }
//   };

//   const renderIconByType = (type) => {
//     const color = getNotificationColor(type);
//     switch (type) {
//       case 'friend_request': return <PersonAdd fontSize="small" sx={{ color }} />;
//       case 'post_like': return <ThumbUp fontSize="small" sx={{ color }} />;
//       case 'follow': return <Person fontSize="small" sx={{ color }} />;
//       case 'comment': return <CommentIcon fontSize="small" sx={{ color }} />;
//       default: return <NotificationsIcon fontSize="small" sx={{ color }} />;
//     }
//   };

//   const handleMarkAsRead = async (notificationId) => {
//     try {
//       await dispatch(markAsRead(notificationId)).unwrap();
//     } catch {
//       dispatch(showSnackbar({ message: 'Failed to mark as read', severity: 'error' }));
//     }
//   };

//   const handleMarkAllAsRead = async () => {
//     try {
//       await dispatch(markAllAsRead()).unwrap();
//       dispatch(showSnackbar({ 
//         message: 'All notifications marked as read', 
//         severity: 'success' 
//       }));
//     } catch {
//       dispatch(showSnackbar({ 
//         message: 'Failed to mark all as read', 
//         severity: 'error' 
//       }));
//     }
//   };

//   const handleAccept = async (notification) => {
//     const { id: notificationId, metadata } = notification;
//     const { friendshipId } = metadata || {};
//     if (!friendshipId) return;
    
//     try {
//       await dispatch(acceptFriendRequest({ notificationId, friendshipId })).unwrap();
//       dispatch(showSnackbar({ 
//         message: 'Friend request accepted', 
//         severity: 'success' 
//       }));
//     } catch {
//       dispatch(showSnackbar({ 
//         message: 'Failed to accept friend request', 
//         severity: 'error' 
//       }));
//     }
//   };

//   const handleReject = async (notification) => {
//     const { id: notificationId, metadata } = notification;
//     const { friendshipId } = metadata || {};
//     if (!friendshipId) return;
    
//     try {
//       await dispatch(rejectFriendRequest({ notificationId, friendshipId })).unwrap();
//       dispatch(showSnackbar({ 
//         message: 'Friend request rejected', 
//         severity: 'info' 
//       }));
//     } catch {
//       dispatch(showSnackbar({ 
//         message: 'Failed to reject friend request', 
//         severity: 'error' 
//       }));
//     }
//   };

//   const formatTime = (dateString) => {
//     const now = new Date();
//     const date = new Date(dateString);
//     const diffHours = Math.floor((now - date) / (1000 * 60 * 60));
    
//     if (diffHours < 1) {
//       const diffMinutes = Math.floor((now - date) / (1000 * 60));
//       return `${diffMinutes}m`;
//     } else if (diffHours < 24) {
//       return `${diffHours}h`;
//     } else {
//       return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
//     }
//   };

//   const renderNotificationItem = (notification) => {
//     const {
//       id,
//       type,
//       metadata: { senderName, avatarUrl, message, postId, senderId },
//       isRead,
//       createdAt
//     } = notification;

//     return (
//       <motion.div
//         key={id}
//         whileHover={{ scale: 1.01 }}
//         style={{ originZ: 0 }}
//       >
//         <ListItem
//           alignItems="flex-start"
//           sx={{
//             p: 0,
//             mb: 0.5,
//             bgcolor: isRead ? 'background.paper' : 'action.selected',
//             borderRadius: 1,
//             mx: 1,
//             '&:hover': {
//               bgcolor: isRead ? 'action.hover' : 'action.selected'
//             }
//           }}
//           secondaryAction={
//             <Box sx={{ display: 'flex', alignItems: 'center' }}>
//               <Typography variant="caption" color="text.secondary" sx={{ mr: 1 }}>
//                 {formatTime(createdAt)}
//               </Typography>
//               <IconButton
//                 size="small"
//                 onClick={(e) => handleMenuOpen(e, notification)}
//               >
//                 <MoreVert fontSize="small" />
//               </IconButton>
//             </Box>
//           }
//           disablePadding
//         >
//           <ListItemButton 
//             component={Link} 
//             to={type === 'friend_request' ? `/profile/${senderId}` : `/post/${postId}`}
//             sx={{ py: 1.5, px: 2 }}
//           >
//             <ListItemAvatar>
//               <Badge
//                 color="primary"
//                 overlap="circular"
//                 variant={isRead ? undefined : 'dot'}
//                 anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
//               >
//                 <Avatar 
//                   src={avatarUrl} 
//                   alt={senderName}
//                   sx={{ 
//                     width: 48, 
//                     height: 48,
//                     border: `2px solid ${getNotificationColor(type)}`
//                   }}
//                 />
//               </Badge>
//             </ListItemAvatar>

//             <ListItemText
//               primary={
//                 <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
//                   {renderIconByType(type)}
//                   <Typography 
//                     variant="body1" 
//                     component="span" 
//                     sx={{ 
//                       ml: 1, 
//                       fontWeight: isRead ? 400 : 600,
//                       color: getNotificationColor(type)
//                     }}
//                   >
//                     {senderName}
//                   </Typography>
//                 </Box>
//               }
//               secondary={
//                 <Typography 
//                   variant="body2" 
//                   color="text.secondary"
//                   sx={{
//                     display: '-webkit-box',
//                     WebkitLineClamp: 2,
//                     WebkitBoxOrient: 'vertical',
//                     overflow: 'hidden',
//                     textOverflow: 'ellipsis'
//                   }}
//                 >
//                   {message}
//                 </Typography>
//               }
//               sx={{ ml: 1 }}
//             />
//           </ListItemButton>
//         </ListItem>
//         <Divider component="li" sx={{ mx: 3 }} />
//       </motion.div>
//     );
//   };

//   return (
//     <>
//       <Drawer 
//         anchor="right" 
//         open={open} 
//         onClose={onClose}
//         sx={{
//           '& .MuiDrawer-paper': {
//             width: { xs: '100%', sm: 450 },
//             top: '56px',
//             height: 'calc(100vh - 56px)',
//             borderLeft: '1px solid rgba(0, 0, 0, 0.12)',
//             position: 'fixed',
//             zIndex: 1200
//           }
//         }}
//         ModalProps={{
//           keepMounted: true,
//           disableScrollLock: false,
//         }}
//       >
//         <Box sx={{ 
//           display: 'flex', 
//           flexDirection: 'column', 
//           height: '100%',
//           bgcolor: 'background.paper'
//         }}>
//           {/* Header */}
//           <Box sx={{ 
//             p: 2, 
//             borderBottom: '1px solid #eee',
//             display: 'flex',
//             justifyContent: 'space-between',
//             alignItems: 'center',
//             bgcolor: theme.palette.mode === 'dark' ? '#1e1e1e' : '#f5f5f5'
//           }}>
//             <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
//               Notifications
//             </Typography>
//             <Box>
//               <IconButton onClick={() => {}} sx={{ mr: 1 }}>
//                 <Settings fontSize="small" />
//               </IconButton>
//               <Button 
//                 size="small"
//                 onClick={handleMarkAllAsRead}
//                 disabled={allNotifications.every(n => n.isRead)}
//                 startIcon={<DoneAll fontSize="small" />}
//                 sx={{ textTransform: 'none' }}
//               >
//                 Mark all as read
//               </Button>
//             </Box>
//           </Box>

//           {/* Tabs */}
//           <Tabs
//             value={tabIndex}
//             onChange={(e, newValue) => setTabIndex(newValue)}
//             indicatorColor="primary"
//             textColor="primary"
//             variant="fullWidth"
//             sx={{ 
//               borderBottom: '1px solid #eee',
//               bgcolor: theme.palette.mode === 'dark' ? '#1e1e1e' : '#f5f5f5'
//             }}
//           >
//             <Tab label="All" />
//             <Tab label={`Unread (${allNotifications.filter(n => !n.isRead).length})`} />
//           </Tabs>

//           {status === 'loading' ? (
//             <Box sx={{ 
//               flex: 1, 
//               display: 'flex', 
//               alignItems: 'center', 
//               justifyContent: 'center' 
//             }}>
//               <CircularProgress />
//             </Box>
//           ) : (
//             <Box sx={{ 
//               flex: 1, 
//               overflowY: 'auto',
//               '&::-webkit-scrollbar': { width: '6px' },
//               '&::-webkit-scrollbar-thumb': {
//                 backgroundColor: 'rgba(0,0,0,0.2)',
//                 borderRadius: '3px'
//               }
//             }}>
//               {/* New Notifications Section */}
//               {newNotifications.length > 0 && (
//                 <>
//                   <Box sx={{ 
//                     px: 2, 
//                     py: 1.5, 
//                     bgcolor: theme.palette.primary.light,
//                     position: 'sticky',
//                     top: 0,
//                     zIndex: 1
//                   }}>
//                     <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: 'primary.contrastText' }}>
//                       New
//                     </Typography>
//                   </Box>
//                   <List disablePadding>
//                     {newNotifications.map(renderNotificationItem)}
//                   </List>
//                 </>
//               )}

//               {/* Today's Notifications Section */}
//               {todayNotifications.length > 0 && (
//                 <>
//                   <Box sx={{ 
//                     px: 2, 
//                     py: 1.5, 
//                     bgcolor: 'action.hover',
//                     position: 'sticky',
//                     top: 0,
//                     zIndex: 1
//                   }}>
//                     <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
//                       Today
//                     </Typography>
//                   </Box>
//                   <List disablePadding>
//                     {todayNotifications.map(renderNotificationItem)}
//                   </List>
//                 </>
//               )}

//               {/* Older Notifications Section */}
//               {olderNotifications.length > 0 && (
//                 <>
//                   <Box sx={{ 
//                     px: 2, 
//                     py: 1.5, 
//                     bgcolor: 'action.hover',
//                     position: 'sticky',
//                     top: 0,
//                     zIndex: 1
//                   }}>
//                     <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
//                       Earlier
//                     </Typography>
//                   </Box>
//                   <List disablePadding>
//                     {olderNotifications.map(renderNotificationItem)}
//                   </List>
//                 </>
//               )}

//               {newNotifications.length === 0 && 
//                todayNotifications.length === 0 && 
//                olderNotifications.length === 0 && (
//                 <Box sx={{ 
//                   display: 'flex', 
//                   flexDirection: 'column', 
//                   alignItems: 'center', 
//                   justifyContent: 'center', 
//                   height: '100%',
//                   p: 4,
//                   textAlign: 'center'
//                 }}>
//                   <NotificationsIcon sx={{ 
//                     fontSize: 60, 
//                     color: 'text.disabled', 
//                     mb: 2 
//                   }} />
//                   <Typography variant="h6" sx={{ mb: 1 }}>
//                     No notifications
//                   </Typography>
//                   <Typography variant="body2" color="text.secondary">
//                     {tabIndex === TAB_UNREAD 
//                       ? "You're all caught up!" 
//                       : "You'll see notifications here when you get them."}
//                   </Typography>
//                 </Box>
//               )}
//             </Box>
//           )}

//           {/* Footer */}
//           <Box sx={{ 
//             p: 2, 
//             borderTop: '1px solid #eee',
//             textAlign: 'center',
//             bgcolor: theme.palette.mode === 'dark' ? '#1e1e1e' : '#f5f5f5'
//           }}>
//             <Button 
//               variant="text" 
//               color="primary"
//               component={Link}
//               to="/notifications"
//               onClick={onClose}
//               sx={{ textTransform: 'none' }}
//             >
//               See All Notifications
//             </Button>
//           </Box>
//         </Box>
//       </Drawer>

//       {/* Notification Menu */}
//       <Menu
//         anchorEl={anchorEl}
//         open={Boolean(anchorEl)}
//         onClose={handleMenuClose}
//         onClick={handleMenuClose}
//         PaperProps={{
//           elevation: 0,
//           sx: {
//             overflow: 'visible',
//             filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
//             mt: 1.5,
//             '& .MuiAvatar-root': {
//               width: 32,
//               height: 32,
//               ml: -0.5,
//               mr: 1,
//             },
//           },
//         }}
//         transformOrigin={{ horizontal: 'right', vertical: 'top' }}
//         anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
//       >
//         {selectedNotification && !selectedNotification.isRead && (
//           <MenuItem onClick={() => {
//             handleMarkAsRead(selectedNotification.id);
//             handleMenuClose();
//           }}>
//             <ListItemIcon>
//               <Done fontSize="small" />
//             </ListItemIcon>
//             <ListItemText>Mark as read</ListItemText>
//           </MenuItem>
//         )}
//         <MenuItem onClick={handleMenuClose}>
//           <ListItemIcon>
//             <Settings fontSize="small" />
//             </ListItemIcon>
//             <ListItemText>Notification settings</ListItemText>
//           </MenuItem>
//         </Menu>
//       </>
//     );
//   };







// ! running
// import {
//   Clear,
//   Comment as CommentIcon,
//   Done,
//   Notifications as NotificationsIcon,
//   Person,
//   PersonAdd,
//   ThumbUp
// } from '@mui/icons-material';
// import {
//   Avatar,
//   Badge,
//   Box,
//   Button,
//   CircularProgress,
//   Divider,
//   Drawer,
//   IconButton,
//   List,
//   ListItem,
//   ListItemAvatar,
//   ListItemText,
//   Tab,
//   Tabs,
//   Typography
// } from '@mui/material';
// import { motion } from 'framer-motion';
// import { useEffect, useState } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { showSnackbar } from '../snackbar/snackbarSlice';
// import {
//   acceptFriendRequest,
//   fetchNotifications,
//   markAllAsRead,
//   markAsRead,
//   rejectFriendRequest
// } from './notificationSlice';

// const TAB_ALL = 0;
// const TAB_UNREAD = 1;

// export default function NotificationPanel({ open, onClose }) {
//   const dispatch = useDispatch();
//   const { items: allNotifications = [], status } = useSelector(
//     (state) => state.notifications
//   );
//   const [tabIndex, setTabIndex] = useState(TAB_ALL);

//   useEffect(() => {
//     if (open) {
//       dispatch(fetchNotifications({ page: 1, size: 50 }))
//         .unwrap()
//         .catch(() => {
//           dispatch(
//             showSnackbar({
//               message: 'Failed to load notifications',
//               severity: 'error'
//             })
//           );
//         });
//     }
//   }, [dispatch, open]);

//   const groupNotifications = (notifications) => {
//     const newNotifications = notifications.filter(n => 
//       !n.isRead && new Date(n.createdAt) > new Date(Date.now() - 24 * 60 * 60 * 1000)
//     );
//     const olderNotifications = notifications.filter(n => 
//       !newNotifications.includes(n)
//     );
//     return { new: newNotifications, older: olderNotifications };
//   };

//   const { new: newNotifications, older: olderNotifications } = 
//     groupNotifications(tabIndex === TAB_UNREAD 
//       ? allNotifications.filter(n => !n.isRead) 
//       : allNotifications);

//   const renderIconByType = (type) => {
//     switch (type) {
//       case 'friend_request': return <PersonAdd fontSize="small" sx={{ color: '#1976d2' }} />;
//       case 'post_like': return <ThumbUp fontSize="small" sx={{ color: '#d32f2f' }} />;
//       case 'follow': return <Person fontSize="small" sx={{ color: '#388e3c' }} />;
//       case 'comment': return <CommentIcon fontSize="small" sx={{ color: '#6a1b9a' }} />;
//       default: return <NotificationsIcon fontSize="small" sx={{ color: '#757575' }} />;
//     }
//   };

//   const handleMarkAsRead = async (notificationId) => {
//     try {
//       await dispatch(markAsRead(notificationId)).unwrap();
//     } catch {
//       dispatch(showSnackbar({ message: 'Failed to mark as read', severity: 'error' }));
//     }
//   };

//   const handleMarkAllAsRead = async () => {
//     try {
//       await dispatch(markAllAsRead()).unwrap();
//       dispatch(showSnackbar({ message: 'All notifications marked as read', severity: 'success' }));
//     } catch {
//       dispatch(showSnackbar({ message: 'Failed to mark all as read', severity: 'error' }));
//     }
//   };

//   const handleAccept = async (notification) => {
//     const { id: notificationId, metadata } = notification;
//     const { friendshipId } = metadata || {};
//     if (!friendshipId) return;
    
//     try {
//       await dispatch(acceptFriendRequest({ notificationId, friendshipId })).unwrap();
//       dispatch(showSnackbar({ message: 'Friend request accepted', severity: 'success' }));
//     } catch {
//       dispatch(showSnackbar({ message: 'Failed to accept friend request', severity: 'error' }));
//     }
//   };

//   const handleReject = async (notification) => {
//     const { id: notificationId, metadata } = notification;
//     const { friendshipId } = metadata || {};
//     if (!friendshipId) return;
    
//     try {
//       await dispatch(rejectFriendRequest({ notificationId, friendshipId })).unwrap();
//       dispatch(showSnackbar({ message: 'Friend request rejected', severity: 'info' }));
//     } catch {
//       dispatch(showSnackbar({ message: 'Failed to reject friend request', severity: 'error' }));
//     }
//   };

//   const renderNotificationItem = (notification) => {
//     const {
//       id,
//       type,
//       metadata: { senderName, avatarUrl, message },
//       isRead,
//       createdAt
//     } = notification;

//     return (
//       <motion.div
//         key={id}
//         whileHover={{ scale: 1.02 }}
//         style={{ originZ: 0 }}
//       >
//         <ListItem
//           alignItems="flex-start"
//           sx={{
//             p: 1.5,
//             mb: 1,
//             bgcolor: isRead ? 'background.paper' : 'action.selected',
//             borderRadius: 1,
//             mx: 1,
//             '&:hover': {
//               bgcolor: isRead ? 'action.hover' : 'action.selected'
//             }
//           }}
//         >
//           <ListItemAvatar>
//             <Badge
//               color="primary"
//               overlap="circular"
//               variant={isRead ? undefined : 'dot'}
//               anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
//             >
//               <Avatar src={avatarUrl} alt={senderName} sx={{ width: 40, height: 40 }} />
//             </Badge>
//           </ListItemAvatar>

//           <ListItemText
//             primary={
//               <Box sx={{ display: 'flex', alignItems: 'center' }}>
//                 {renderIconByType(type)}
//                 <Typography variant="body1" component="span" sx={{ ml: 1, fontWeight: isRead ? 400 : 600 }}>
//                   {senderName} {message}
//                 </Typography>
//               </Box>
//             }
//             secondary={
//               <Typography variant="caption" color="text.secondary">
//                 {new Date(createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
//                 {' • '}
//                 {new Date(createdAt).toLocaleDateString()}
//               </Typography>
//             }
//             sx={{ ml: 1 }}
//           />

//           {!isRead && (
//             <IconButton
//               onClick={() => handleMarkAsRead(id)}
//               title="Mark as read"
//               size="small"
//               sx={{ mr: 1 }}
//             >
//               <Done fontSize="small" />
//             </IconButton>
//           )}

//           {type === 'friend_request' && !isRead && (
//             <Box sx={{ display: 'flex', gap: 0.5 }}>
//               <Button
//                 size="small"
//                 color="success"
//                 variant="contained"
//                 startIcon={<Done />}
//                 onClick={() => handleAccept(notification)}
//               >
//                 Accept
//               </Button>
//               <Button
//                 size="small"
//                 color="error"
//                 variant="outlined"
//                 startIcon={<Clear />}
//                 onClick={() => handleReject(notification)}
//               >
//                 Reject
//               </Button>
//             </Box>
//           )}
//         </ListItem>
//         <Divider component="li" />
//       </motion.div>
//     );
//   };

//   return (
//     <Drawer 
//       anchor="right" 
//       open={open} 
//       onClose={onClose}
//       sx={{
//         '& .MuiDrawer-paper': {
//           width: { xs: '100%', sm: 400 },
//           top: '56px',
//           height: 'calc(100vh - 56px)',
//           borderLeft: '1px solid rgba(0, 0, 0, 0.12)',
//           position: 'fixed',
//           zIndex: 1200
//         }
//       }}
//       ModalProps={{
//         keepMounted: true,
//         disableScrollLock: false,
//       }}
//     >
//       <Box sx={{ 
//         display: 'flex', 
//         flexDirection: 'column', 
//         height: '100%',
//         bgcolor: 'background.paper'
//       }}>
//         <Box sx={{ 
//           p: 2, 
//           borderBottom: '1px solid #eee',
//           display: 'flex',
//           justifyContent: 'space-between',
//           alignItems: 'center'
//         }}>
//           <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Notifications</Typography>
//           <Button 
//             size="small"
//             onClick={handleMarkAllAsRead}
//             disabled={allNotifications.every(n => n.isRead)}
//           >
//             Mark all as read
//           </Button>
//         </Box>

//         <Tabs
//           value={tabIndex}
//           onChange={(e, newValue) => setTabIndex(newValue)}
//           indicatorColor="primary"
//           textColor="primary"
//           variant="fullWidth"
//           sx={{ borderBottom: '1px solid #eee' }}
//         >
//           <Tab label="All" />
//           <Tab label={`Unread (${allNotifications.filter(n => !n.isRead).length})`} />
//         </Tabs>

//         {status === 'loading' ? (
//           <Box sx={{ 
//             flex: 1, 
//             display: 'flex', 
//             alignItems: 'center', 
//             justifyContent: 'center' 
//           }}>
//             <CircularProgress />
//           </Box>
//         ) : (
//           <Box sx={{ 
//             flex: 1, 
//             overflowY: 'auto',
//             '&::-webkit-scrollbar': { width: '6px' },
//             '&::-webkit-scrollbar-thumb': {
//               backgroundColor: 'rgba(0,0,0,0.2)',
//               borderRadius: '3px'
//             }
//           }}>
//             {newNotifications.length > 0 && (
//               <>
//                 <Box sx={{ 
//                   px: 2, 
//                   py: 1, 
//                   bgcolor: 'action.hover',
//                   position: 'sticky',
//                   top: 0,
//                   zIndex: 1
//                 }}>
//                   <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
//                     New
//                   </Typography>
//                 </Box>
//                 <List>
//                   {newNotifications.map(renderNotificationItem)}
//                 </List>
//               </>
//             )}

//             {olderNotifications.length > 0 && (
//               <>
//                 <Box sx={{ 
//                   px: 2, 
//                   py: 1, 
//                   bgcolor: 'action.hover',
//                   position: 'sticky',
//                   top: 0,
//                   zIndex: 1
//                 }}>
//                   <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
//                     Earlier
//                   </Typography>
//                 </Box>
//                 <List>
//                   {olderNotifications.map(renderNotificationItem)}
//                 </List>
//               </>
//             )}

//             {newNotifications.length === 0 && olderNotifications.length === 0 && (
//               <Box sx={{ 
//                 display: 'flex', 
//                 flexDirection: 'column', 
//                 alignItems: 'center', 
//                 justifyContent: 'center', 
//                 height: '100%',
//                 p: 4,
//                 textAlign: 'center'
//               }}>
//                 <NotificationsIcon sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
//                 <Typography variant="h6" sx={{ mb: 1 }}>
//                   No notifications
//                 </Typography>
//                 <Typography variant="body2" color="text.secondary">
//                   {tabIndex === TAB_UNREAD 
//                     ? "You're all caught up!" 
//                     : "You'll see notifications here when you get them."}
//                 </Typography>
//               </Box>
//             )}
//           </Box>
//         )}
//       </Box>
//     </Drawer>
//   );
// }







// ! running
// import {
//   Clear,
//   Comment as CommentIcon,
//   Done,
//   Notifications as NotificationsIcon,
//   Person,
//   PersonAdd,
//   ThumbUp
// } from '@mui/icons-material';
// import {
//   Avatar,
//   Badge,
//   Box,
//   Button,
//   CircularProgress,
//   Divider,
//   Drawer,
//   IconButton,
//   List,
//   ListItem,
//   ListItemAvatar,
//   ListItemText,
//   Tab,
//   Tabs,
//   Typography
// } from '@mui/material';
// import { motion } from 'framer-motion';
// import { useEffect, useState } from 'react';
// import { useDispatch, useSelector } from 'react-redux';

// import { showSnackbar } from '../snackbar/snackbarSlice';
// import {
//   acceptFriendRequest,
//   fetchNotifications,
//   markAsRead,
//   rejectFriendRequest
// } from './notificationSlice';

// const TAB_ALL = 0;
// const TAB_UNREAD = 1;

// export default function NotificationPanel({ open, onClose }) {
//   const dispatch = useDispatch();
//   const { items: allNotifications = [], status } = useSelector(
//     (state) => state.notifications
//   );
//   const [tabIndex, setTabIndex] = useState(TAB_ALL);

//   useEffect(() => {
//     if (open) {
//       dispatch(fetchNotifications({ page: 1, size: 50 }))
//         .unwrap()
//         .catch(() => {
//           dispatch(
//             showSnackbar({
//               message: 'Failed to load notifications',
//               severity: 'error'
//             })
//           );
//         });
//     }
//   }, [dispatch, open]);

//   // Group notifications by type/time for Facebook-like sections
//   const groupNotifications = (notifications) => {
//     const newNotifications = notifications.filter(n => 
//       !n.isRead && new Date(n.createdAt) > new Date(Date.now() - 24 * 60 * 60 * 1000)
//     );
//     const olderNotifications = notifications.filter(n => 
//       !newNotifications.includes(n)
//     );

//     return {
//       new: newNotifications,
//       older: olderNotifications
//     };
//   };

//   const { new: newNotifications, older: olderNotifications } = 
//     groupNotifications(tabIndex === TAB_UNREAD 
//       ? allNotifications.filter(n => !n.isRead) 
//       : allNotifications);

//   const renderIconByType = (type) => {
//     switch (type) {
//       case 'friend_request':
//         return <PersonAdd fontSize="small" sx={{ color: '#1976d2' }} />;
//       case 'post_like':
//         return <ThumbUp fontSize="small" sx={{ color: '#d32f2f' }} />;
//       case 'follow':
//         return <Person fontSize="small" sx={{ color: '#388e3c' }} />;
//       case 'comment':
//         return <CommentIcon fontSize="small" sx={{ color: '#6a1b9a' }} />;
//       default:
//         return <NotificationsIcon fontSize="small" sx={{ color: '#757575' }} />;
//     }
//   };

//   const handleMarkAsRead = async (notificationId) => {
//     try {
//       await dispatch(markAsRead(notificationId)).unwrap();
//     } catch {
//       dispatch(
//         showSnackbar({
//           message: 'Failed to mark as read',
//           severity: 'error'
//         })
//       );
//     }
//   };

//   const handleAccept = async (notification) => {
//     const { id: notificationId, metadata } = notification;
//     const { friendshipId } = metadata || {};
//     if (!friendshipId) return;
    
//     try {
//       await dispatch(acceptFriendRequest({ notificationId, friendshipId })).unwrap();
//       dispatch(
//         showSnackbar({
//           message: 'Friend request accepted',
//           severity: 'success'
//         })
//       );
//     } catch {
//       dispatch(
//         showSnackbar({
//           message: 'Failed to accept friend request',
//           severity: 'error'
//         })
//       );
//     }
//   };

//   const handleReject = async (notification) => {
//     const { id: notificationId, metadata } = notification;
//     const { friendshipId } = metadata || {};
//     if (!friendshipId) return;
    
//     try {
//       await dispatch(rejectFriendRequest({ notificationId, friendshipId })).unwrap();
//       dispatch(
//         showSnackbar({
//           message: 'Friend request rejected',
//           severity: 'info'
//         })
//       );
//     } catch {
//       dispatch(
//         showSnackbar({
//           message: 'Failed to reject friend request',
//           severity: 'error'
//         })
//       );
//     }
//   };

//   const handleTabChange = (event, newValue) => {
//     setTabIndex(newValue);
//   };

//   const renderNotificationItem = (notification) => {
//     const {
//       id,
//       type,
//       metadata: { senderName, avatarUrl, message },
//       isRead,
//       createdAt
//     } = notification;

//     return (
//       <motion.div
//         key={id}
//         whileHover={{ scale: 1.02 }}
//         style={{ originZ: 0 }}
//       >
//         <ListItem
//           alignItems="flex-start"
//           sx={{
//             p: 1.5,
//             mb: 1,
//             bgcolor: isRead ? 'background.paper' : 'action.selected',
//             borderRadius: 1,
//             mx: 1,
//             '&:hover': {
//               bgcolor: isRead ? 'action.hover' : 'action.selected'
//             }
//           }}
//         >
//           <ListItemAvatar>
//             <Badge
//               color="primary"
//               overlap="circular"
//               variant={isRead ? undefined : 'dot'}
//               anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
//             >
//               <Avatar
//                 src={avatarUrl}
//                 alt={senderName}
//                 sx={{ width: 40, height: 40 }}
//               />
//             </Badge>
//           </ListItemAvatar>

//           <ListItemText
//             primary={
//               <Box sx={{ display: 'flex', alignItems: 'center' }}>
//                 {renderIconByType(type)}
//                 <Typography
//                   variant="body1"
//                   component="span"
//                   sx={{ ml: 1, fontWeight: isRead ? 400 : 600 }}
//                 >
//                   {senderName} {message}
//                 </Typography>
//               </Box>
//             }
//             secondary={
//               <Typography variant="caption" color="text.secondary">
//                 {new Date(createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
//                 {' • '}
//                 {new Date(createdAt).toLocaleDateString()}
//               </Typography>
//             }
//             sx={{ ml: 1 }}
//           />

//           {!isRead && (
//             <IconButton
//               onClick={() => handleMarkAsRead(id)}
//               title="Mark as read"
//               size="small"
//               sx={{ mr: 1 }}
//             >
//               <Done fontSize="small" />
//             </IconButton>
//           )}

//           {type === 'friend_request' && !isRead && (
//             <Box sx={{ display: 'flex', gap: 0.5 }}>
//               <Button
//                 size="small"
//                 color="success"
//                 variant="contained"
//                 startIcon={<Done />}
//                 onClick={() => handleAccept(notification)}
//               >
//                 Accept
//               </Button>
//               <Button
//                 size="small"
//                 color="error"
//                 variant="outlined"
//                 startIcon={<Clear />}
//                 onClick={() => handleReject(notification)}
//               >
//                 Reject
//               </Button>
//             </Box>
//           )}
//         </ListItem>
//         <Divider component="li" />
//       </motion.div>
//     );
//   };

//   return (
//     <Drawer 
//       anchor="right" 
//       open={open} 
//       onClose={onClose}
//       sx={{
//         '& .MuiDrawer-paper': {
//           width: 400,
//           top: '56px',
//           height: 'calc(100vh - 56px)',
//           borderLeft: '1px solid rgba(0, 0, 0, 0.12)'
//         }
//       }}
//     >
//       <Box sx={{ 
//         display: 'flex', 
//         flexDirection: 'column', 
//         height: '100%',
//         bgcolor: 'background.paper'
//       }}>
//         {/* Header */}
//         <Box sx={{ 
//           p: 2, 
//           borderBottom: '1px solid #eee',
//           display: 'flex',
//           justifyContent: 'space-between',
//           alignItems: 'center'
//         }}>
//           <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Notifications</Typography>
//           <Button 
//             size="small"
//             onClick={() => {
//               // Mark all as read logic here
//             }}
//           >
//             Mark all as read
//           </Button>
//         </Box>

//         {/* Tabs */}
//         <Tabs
//           value={tabIndex}
//           onChange={handleTabChange}
//           indicatorColor="primary"
//           textColor="primary"
//           variant="fullWidth"
//           sx={{ borderBottom: '1px solid #eee' }}
//         >
//           <Tab label="All" />
//           <Tab label={`Unread (${allNotifications.filter(n => !n.isRead).length})`} />
//         </Tabs>

//         {/* Content */}
//         {status === 'loading' ? (
//           <Box sx={{ 
//             flex: 1, 
//             display: 'flex', 
//             alignItems: 'center', 
//             justifyContent: 'center' 
//           }}>
//             <CircularProgress />
//           </Box>
//         ) : (
//           <Box sx={{ 
//             flex: 1, 
//             overflowY: 'auto',
//             '&::-webkit-scrollbar': {
//               width: '6px'
//             },
//             '&::-webkit-scrollbar-thumb': {
//               backgroundColor: 'rgba(0,0,0,0.2)',
//               borderRadius: '3px'
//             }
//           }}>
//             {/* New Notifications Section */}
//             {newNotifications.length > 0 && (
//               <>
//                 <Box sx={{ 
//                   px: 2, 
//                   py: 1, 
//                   bgcolor: 'action.hover',
//                   position: 'sticky',
//                   top: 0,
//                   zIndex: 1
//                 }}>
//                   <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
//                     New
//                   </Typography>
//                 </Box>
//                 <List>
//                   {newNotifications.map(renderNotificationItem)}
//                 </List>
//               </>
//             )}

//             {/* Older Notifications Section */}
//             {olderNotifications.length > 0 && (
//               <>
//                 <Box sx={{ 
//                   px: 2, 
//                   py: 1, 
//                   bgcolor: 'action.hover',
//                   position: 'sticky',
//                   top: 0,
//                   zIndex: 1
//                 }}>
//                   <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
//                     Earlier
//                   </Typography>
//                 </Box>
//                 <List>
//                   {olderNotifications.map(renderNotificationItem)}
//                 </List>
//               </>
//             )}

//             {newNotifications.length === 0 && olderNotifications.length === 0 && (
//               <Box sx={{ 
//                 display: 'flex', 
//                 flexDirection: 'column', 
//                 alignItems: 'center', 
//                 justifyContent: 'center', 
//                 height: '100%',
//                 p: 4,
//                 textAlign: 'center'
//               }}>
//                 <NotificationsIcon sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
//                 <Typography variant="h6" sx={{ mb: 1 }}>
//                   No notifications
//                 </Typography>
//                 <Typography variant="body2" color="text.secondary">
//                   {tabIndex === TAB_UNREAD 
//                     ? "You're all caught up!" 
//                     : "You'll see notifications here when you get them."}
//                 </Typography>
//               </Box>
//             )}
//           </Box>
//         )}

//         {/* Footer */}
//         <Box sx={{ 
//           p: 2, 
//           borderTop: '1px solid #eee',
//           textAlign: 'center'
//         }}>
//           <Button 
//             variant="text" 
//             color="primary"
//             onClick={() => {
//               // View all notifications logic here
//             }}
//           >
//             See All Notifications
//           </Button>
//         </Box>
//       </Box>
//     </Drawer>
//   );
// }


