// src/features/notification/NotificationPanel.jsx
import {
  Check,
  Close,
  Done,
  Mail,
  Notifications as NotificationsIcon
} from '@mui/icons-material';
import {
  Avatar,
  Badge,
  Box,
  Button,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  styled,
  Tab,
  Tabs,
  Tooltip,
  Typography,
  useTheme
} from '@mui/material';
import { motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import {
  acceptFriendRequest,
  rejectFriendRequest,
} from '../friendship/friendshipSlice';
import { startLoading, stopLoading } from '../loading/loadingSlice';
import { showSnackbar } from '../snackbar/snackbarSlice';
import {
  deleteNotification,
  fetchNotifications,
  fetchUnreadCount,
  markAllAsRead,
  markAsRead,
} from './notificationSlice';

const NOTIFICATION_TYPES = { ALL: 0, UNREAD: 1 };
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

const NotificationAlert = styled(Box)(({ theme, isread }) => ({
  backgroundColor: isread === 'true' ? theme.palette.background.paper : 'rgba(25, 118, 210, 0.05)',
  borderRadius: '12px',
  boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
  transition: 'all 0.3s ease',
  display: 'flex',
  alignItems: 'center',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
  },
  '&:hover .notification-actions': {
    opacity: 1,
    visibility: 'visible',
  }
}));

const ActionBox = styled(Box)(() => ({
  display: 'flex',
  gap: '0.25rem',
  alignItems: 'center',
  opacity: 0,
  visibility: 'hidden',
  transition: 'opacity 0.2s ease-in-out',
}));

const NotificationPanel = ({ open, onClose }) => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const { items = [], status } = useSelector((state) => state.notifications);
  const { isLoading } = useSelector((state) => state.loading);
  const [activeTab, setActiveTab] = useState(NOTIFICATION_TYPES.ALL);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (open) {
      const loadNotifications = async () => {
        dispatch(startLoading({ message: 'Loading notifications...' }));
        try {
          setError(null);
          await dispatch(fetchNotifications({ page: 1, size: 50 })).unwrap();
        } catch (err) {
          setError(err.message || 'Failed to load notifications');
          dispatch(showSnackbar({ message: 'Failed to load notifications', severity: 'error' }));
        } finally {
          dispatch(stopLoading());
        }
      };
      loadNotifications();
    }
  }, [open, dispatch]);

  const { newNotifications, olderNotifications } = useMemo(() => {
    const now = Date.now();
    const cutoffTime = now - ONE_DAY_MS;
    const filtered = activeTab === NOTIFICATION_TYPES.UNREAD ? items.filter(n => !n.isRead) : items;
    return {
      newNotifications: filtered.filter(n => !n.isRead && new Date(n.createdAt) > cutoffTime),
      olderNotifications: filtered.filter(n => new Date(n.createdAt) <= cutoffTime || n.isRead),
    };
  }, [activeTab, items]);

  const handleMarkAsRead = async (id) => {
    dispatch(startLoading({ message: 'Marking as read...' }));
    try {
      await dispatch(markAsRead(id)).unwrap();
      await dispatch(fetchNotifications({ page: 1, size: 50 }));
      await dispatch(fetchUnreadCount());
    } catch {
      dispatch(showSnackbar({ message: 'Failed to mark as read', severity: 'error' }));
    } finally {
      dispatch(stopLoading());
    }
  };

  const handleMarkAllAsRead = async () => {
    if (items.some(n => !n.isRead)) {
      dispatch(startLoading({ message: 'Marking all as read...' }));
      try {
        await dispatch(markAllAsRead()).unwrap();
        await dispatch(fetchNotifications({ page: 1, size: 50 }));
        await dispatch(fetchUnreadCount());
        dispatch(showSnackbar({ message: 'All notifications marked as read', severity: 'success' }));
      } catch {
        dispatch(showSnackbar({ message: 'Failed to mark all notifications as read', severity: 'error' }));
      } finally {
        dispatch(stopLoading());
      }
    }
  };

  const handleFriendRequestAction = async (notification, action) => {
    dispatch(startLoading({ message: `${action === 'accept' ? 'Accepting' : 'Rejecting'} request...` }));
    try {
      const friendshipId = notification.metadata?.friendshipId;
      if (!friendshipId) throw new Error('Missing friendship ID');
      const result = await dispatch(
        action === 'accept' ? acceptFriendRequest(friendshipId) : rejectFriendRequest(friendshipId)
      ).unwrap();
      if (result?.friendship?.id || result?.success) {
        await dispatch(deleteNotification(notification.id));
        dispatch(showSnackbar({
          message: result.message || `${action === 'accept' ? 'Friend request accepted' : 'Friend request rejected'}`,
          severity: 'success',
        }));
        await dispatch(fetchNotifications({ page: 1, size: 50 }));
        await dispatch(fetchUnreadCount());
      }
    } catch (err) {
      dispatch(showSnackbar({ message: err.message || 'Friend request action failed', severity: 'error' }));
    } finally {
      dispatch(stopLoading());
    }
  };

  const formatTimeAgo = (dateStr) => {
    const date = new Date(dateStr);
    const diff = Math.floor((Date.now() - date) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
    return `${Math.floor(diff / 86400)}d`;
  };

  const renderNotificationContent = (notification) => {
    const { metadata = {}, type } = notification;
    const sender = metadata.senderName || 'Someone';
    return (
      <>
        <Typography variant="body2" fontWeight={600}>{sender} {metadata.message || ''}</Typography>
        {metadata.content && <Typography variant="body2">{metadata.content}</Typography>}
      </>
    );
  };

  const renderNotificationItem = (notification) => {
    const { id, isRead, createdAt, sender, metadata = {}, type } = notification;
    const avatar = sender?.profileImage || metadata.avatarUrl || '/default-avatar.png';
    const name = sender ? `${sender.firstName} ${sender.lastName}` : metadata.senderName || 'Someone';
    const isFriendRequest = type === 'friend_request';
    return (
      <motion.div key={id}>
        <ListItem component={NotificationAlert} isread={isRead.toString()}>
          <ListItemAvatar>
            <Badge color="primary" variant={isRead ? undefined : 'dot'} overlap="circular">
              <Avatar src={avatar} alt={name} />
            </Badge>
          </ListItemAvatar>
          <Box flex={1}>
            {renderNotificationContent(notification)}
            <Typography variant="caption" color="textSecondary">{formatTimeAgo(createdAt)}</Typography>
          </Box>
          <ActionBox className="notification-actions">
            {!isRead && !isFriendRequest && (
              <Tooltip title="Mark as read">
                <IconButton onClick={() => handleMarkAsRead(id)}><Done fontSize="small" /></IconButton>
              </Tooltip>
            )}
            {isFriendRequest && (
              <>
                <Tooltip title="Accept request">
                  <IconButton color="success" onClick={() => handleFriendRequestAction(notification, 'accept')}>
                    <Check fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Decline request">
                  <IconButton color="error" onClick={() => handleFriendRequestAction(notification, 'reject')}>
                    <Close fontSize="small" />
                  </IconButton>
                </Tooltip>
              </>
            )}
          </ActionBox>
        </ListItem>
        <Divider component="li" variant="inset" />
      </motion.div>
    );
  };

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box display="flex" flexDirection="column" height="100%">
        <Box display="flex" justifyContent="space-between" alignItems="center" p={2}>
          <Typography variant="h6" fontWeight="bold"><NotificationsIcon color="primary" /> Notifications</Typography>
          <Button
            size="small"
            onClick={handleMarkAllAsRead}
            disabled={items.every(n => n.isRead) || isLoading}
            startIcon={<Done />}
          >
            Mark all as read
          </Button>
        </Box>
        <Tabs value={activeTab} onChange={(_, val) => setActiveTab(val)}>
          <Tab label="All" />
          <Tab label={<Badge badgeContent={items.filter(n => !n.isRead).length} color="error"><Mail fontSize="small" /> Unread</Badge>} />
        </Tabs>
        <Box flex={1} overflow="auto">
          <List>
            {newNotifications.map(renderNotificationItem)}
            {olderNotifications.map(renderNotificationItem)}
            {newNotifications.length === 0 && olderNotifications.length === 0 && (
              <Typography textAlign="center" mt={4} color="text.secondary">No notifications</Typography>
            )}
          </List>
        </Box>
      </Box>
    </Drawer>
  );
};

export default NotificationPanel;




// ! runing
// src/features/notification/NotificationPanel.jsx
// import {
//   Check,
//   Close,
//   Done,
//   Mail,
//   Notifications as NotificationsIcon
// } from '@mui/icons-material';
// import {
//   Avatar,
//   Badge,
//   Box,
//   Button,
//   Divider,
//   Drawer,
//   IconButton,
//   List,
//   ListItem,
//   ListItemAvatar,
//   styled,
//   Tab,
//   Tabs,
//   Tooltip,
//   Typography,
//   useTheme
// } from '@mui/material';
// import { motion } from 'framer-motion';
// import { useEffect, useMemo, useState } from 'react';
// import { useDispatch, useSelector } from 'react-redux';

// import {
//   acceptFriendRequest,
//   rejectFriendRequest,
// } from '../friendship/friendshipSlice';
// import { startLoading, stopLoading } from '../loading/loadingSlice';
// import { showSnackbar } from '../snackbar/snackbarSlice';
// import {
//   deleteNotification,
//   fetchNotifications,
//   fetchUnreadCount,
//   markAllAsRead,
//   markAsRead,
// } from './notificationSlice';

// const NOTIFICATION_TYPES = { ALL: 0, UNREAD: 1 };
// const ONE_DAY_MS = 24 * 60 * 60 * 1000;

// const NotificationAlert = styled(Box)(({ theme, isread }) => ({
//   backgroundColor: isread === 'true' ? theme.palette.background.paper : 'rgba(25, 118, 210, 0.05)',
//   borderRadius: '12px',
//   boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
//   transition: 'all 0.3s ease',
//   display: 'flex',
//   alignItems: 'center',
//   '&:hover': {
//     transform: 'translateY(-2px)',
//     boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
//   },
//   '&:hover .notification-actions': {
//     opacity: 1,
//     visibility: 'visible',
//   }
// }));

// const ActionBox = styled(Box)(() => ({
//   display: 'flex',
//   gap: '0.25rem',
//   alignItems: 'center',
//   opacity: 0,
//   visibility: 'hidden',
//   transition: 'opacity 0.2s ease-in-out',
// }));

// const NotificationPanel = ({ open, onClose }) => {
//   const theme = useTheme();
//   const dispatch = useDispatch();
//   const { items = [], status } = useSelector((state) => state.notifications);
//   const { isLoading } = useSelector((state) => state.loading);
//   const [activeTab, setActiveTab] = useState(NOTIFICATION_TYPES.ALL);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     if (open) {
//       const loadNotifications = async () => {
//         dispatch(startLoading({ message: 'Loading notifications...' }));
//         try {
//           setError(null);
//           await dispatch(fetchNotifications({ page: 1, size: 50 })).unwrap();
//         } catch (err) {
//           setError(err.message || 'Failed to load notifications');
//           dispatch(showSnackbar({ message: 'Failed to load notifications', severity: 'error' }));
//         } finally {
//           dispatch(stopLoading());
//         }
//       };
//       loadNotifications();
//     }
//   }, [open, dispatch]);

//   const { newNotifications, olderNotifications } = useMemo(() => {
//     const now = Date.now();
//     const cutoffTime = now - ONE_DAY_MS;
//     const filtered = activeTab === NOTIFICATION_TYPES.UNREAD ? items.filter(n => !n.isRead) : items;
//     return {
//       newNotifications: filtered.filter(n => !n.isRead && new Date(n.createdAt) > cutoffTime),
//       olderNotifications: filtered.filter(n => new Date(n.createdAt) <= cutoffTime || n.isRead),
//     };
//   }, [activeTab, items]);

//   const handleMarkAsRead = async (id) => {
//     dispatch(startLoading({ message: 'Marking as read...' }));
//     try {
//       await dispatch(markAsRead(id)).unwrap();
//       await dispatch(fetchNotifications({ page: 1, size: 50 }));
//       await dispatch(fetchUnreadCount());
//     } catch {
//       dispatch(showSnackbar({ message: 'Failed to mark as read', severity: 'error' }));
//     } finally {
//       dispatch(stopLoading());
//     }
//   };

//   const handleMarkAllAsRead = async () => {
//     if (items.some(n => !n.isRead)) {
//       dispatch(startLoading({ message: 'Marking all as read...' }));
//       try {
//         await dispatch(markAllAsRead()).unwrap();
//         await dispatch(fetchNotifications({ page: 1, size: 50 }));
//         await dispatch(fetchUnreadCount());
//         dispatch(showSnackbar({ message: 'All notifications marked as read', severity: 'success' }));
//       } catch {
//         dispatch(showSnackbar({ message: 'Failed to mark all notifications as read', severity: 'error' }));
//       } finally {
//         dispatch(stopLoading());
//       }
//     }
//   };

//   const handleFriendRequestAction = async (notification, action) => {
//     dispatch(startLoading({ message: `${action === 'accept' ? 'Accepting' : 'Rejecting'} request...` }));
//     try {
//       const friendshipId = notification.metadata?.friendshipId;
//       if (!friendshipId) throw new Error('Missing friendship ID');
//       const result = await dispatch(
//         action === 'accept' ? acceptFriendRequest(friendshipId) : rejectFriendRequest(friendshipId)
//       ).unwrap();
//       if (result?.friendship?.id || result?.success) {
//         await dispatch(deleteNotification(notification.id));
//         dispatch(showSnackbar({
//           message: result.message || `${action === 'accept' ? 'Friend request accepted' : 'Friend request rejected'}`,
//           severity: 'success',
//         }));
//         await dispatch(fetchNotifications({ page: 1, size: 50 }));
//         await dispatch(fetchUnreadCount());
//       }
//     } catch (err) {
//       dispatch(showSnackbar({ message: err.message || 'Friend request action failed', severity: 'error' }));
//     } finally {
//       dispatch(stopLoading());
//     }
//   };

//   const formatTimeAgo = (dateStr) => {
//     const date = new Date(dateStr);
//     const diff = Math.floor((Date.now() - date) / 1000);
//     if (diff < 60) return 'Just now';
//     if (diff < 3600) return `${Math.floor(diff / 60)}m`;
//     if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
//     return `${Math.floor(diff / 86400)}d`;
//   };

//   const renderNotificationContent = (notification) => {
//     const { metadata = {}, type } = notification;
//     const sender = metadata.senderName || 'Someone';
//     return (
//       <>
//         <Typography variant="body2" fontWeight={600}>{sender} {metadata.message || ''}</Typography>
//         {metadata.content && <Typography variant="body2">{metadata.content}</Typography>}
//       </>
//     );
//   };

//   const renderNotificationItem = (notification) => {
//     const { id, isRead, createdAt, sender, metadata = {}, type } = notification;
//     const avatar = sender?.profileImage || metadata.avatarUrl || '/default-avatar.png';
//     const name = sender ? `${sender.firstName} ${sender.lastName}` : metadata.senderName || 'Someone';
//     const isFriendRequest = type === 'friend_request';
//     return (
//       <motion.div key={id}>
//         <ListItem component={NotificationAlert} isread={isRead.toString()}>
//           <ListItemAvatar>
//             <Badge color="primary" variant={isRead ? undefined : 'dot'} overlap="circular">
//               <Avatar src={avatar} alt={name} />
//             </Badge>
//           </ListItemAvatar>
//           <Box flex={1}>
//             {renderNotificationContent(notification)}
//             <Typography variant="caption" color="textSecondary">{formatTimeAgo(createdAt)}</Typography>
//           </Box>
//           <ActionBox className="notification-actions">
//             {!isRead && !isFriendRequest && (
//               <Tooltip title="Mark as read">
//                 <IconButton onClick={() => handleMarkAsRead(id)}><Done fontSize="small" /></IconButton>
//               </Tooltip>
//             )}
//             {isFriendRequest && (
//               <>
//                 <Tooltip title="Accept request">
//                   <IconButton color="success" onClick={() => handleFriendRequestAction(notification, 'accept')}>
//                     <Check fontSize="small" />
//                   </IconButton>
//                 </Tooltip>
//                 <Tooltip title="Decline request">
//                   <IconButton color="error" onClick={() => handleFriendRequestAction(notification, 'reject')}>
//                     <Close fontSize="small" />
//                   </IconButton>
//                 </Tooltip>
//               </>
//             )}
//           </ActionBox>
//         </ListItem>
//         <Divider component="li" variant="inset" />
//       </motion.div>
//     );
//   };

//   return (
//     <Drawer anchor="right" open={open} onClose={onClose}>
//       <Box display="flex" flexDirection="column" height="100%">
//         <Box display="flex" justifyContent="space-between" alignItems="center" p={2}>
//           <Typography variant="h6" fontWeight="bold"><NotificationsIcon color="primary" /> Notifications</Typography>
//           <Button
//             size="small"
//             onClick={handleMarkAllAsRead}
//             disabled={items.every(n => n.isRead) || isLoading}
//             startIcon={<Done />}
//           >
//             Mark all as read
//           </Button>
//         </Box>
//         <Tabs value={activeTab} onChange={(_, val) => setActiveTab(val)}>
//           <Tab label="All" />
//           <Tab label={<Badge badgeContent={items.filter(n => !n.isRead).length} color="error"><Mail fontSize="small" /> Unread</Badge>} />
//         </Tabs>
//         <Box flex={1} overflow="auto">
//           <List>
//             {newNotifications.map(renderNotificationItem)}
//             {olderNotifications.map(renderNotificationItem)}
//             {newNotifications.length === 0 && olderNotifications.length === 0 && (
//               <Typography textAlign="center" mt={4} color="text.secondary">No notifications</Typography>
//             )}
//           </List>
//         </Box>
//       </Box>
//     </Drawer>
//   );
// };

// export default NotificationPanel;







//! final
// src/features/notification/NotificationPanel.jsx
// import {
//   Check,
//   Close,
//   Comment as CommentIcon,
//   Done,
//   GroupAdd,
//   Mail,
//   Memory,
//   Notifications as NotificationsIcon,
//   Person,
//   PersonAdd,
//   PhotoLibrary,
//   ThumbUp,
//   VideoLibrary
// } from '@mui/icons-material';
// import {
//   Avatar,
//   Badge,
//   Box,
//   Button,
//   Divider,
//   Drawer,
//   IconButton,
//   keyframes,
//   List,
//   ListItem,
//   ListItemAvatar,
//   Skeleton,
//   styled,
//   Tab,
//   Tabs,
//   Tooltip,
//   Typography,
//   useTheme
// } from '@mui/material';
// import { motion } from 'framer-motion';
// import { useEffect, useMemo, useState } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { Link } from 'react-router-dom';
// import {
//   acceptFriendRequest,
//   rejectFriendRequest,
// } from '../friendship/friendshipSlice';
// import { startLoading, stopLoading } from '../loading/loadingSlice';
// import { showSnackbar } from '../snackbar/snackbarSlice';
// import {
//   deleteNotification,
//   fetchNotifications,
//   markAllAsRead,
//   markAsRead,
// } from './notificationSlice';

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

// const bounce = keyframes`
//   0%, 100% { transform: translateY(0); }
//   50% { transform: translateY(-5px); }
// `;

// // Constants
// const NOTIFICATION_TYPES = {
//   ALL: 0,
//   UNREAD: 1,
// };

// const ONE_DAY_MS = 24 * 60 * 60 * 1000;

// const NOTIFICATION_ICONS = {
//   friend_request: {
//     icon: PersonAdd,
//     color: 'primary.main',
//   },
//   post_like: {
//     icon: ThumbUp,
//     color: 'error.main',
//   },
//   follow: {
//     icon: Person,
//     color: 'success.main',
//   },
//   comment: {
//     icon: CommentIcon,
//     color: 'secondary.main',
//   },
//   memory: {
//     icon: Memory,
//     color: 'warning.main',
//   },
//   photo_upload: {
//     icon: PhotoLibrary,
//     color: 'info.main',
//   },
//   video_upload: {
//     icon: VideoLibrary,
//     color: 'info.main',
//   },
//   post: {
//     icon: CommentIcon,
//     color: 'secondary.main',
//   },
//   friend_suggestion: {
//     icon: GroupAdd,
//     color: 'success.main',
//   },
//   default: {
//     icon: NotificationsIcon,
//     color: 'text.disabled',
//   },
// };

// // Styled Components
// const NotificationAlert = styled(Box)(({ theme, isread }) => ({
//   backgroundColor: isread === 'true' 
//     ? theme.palette.background.paper 
//     : 'rgba(25, 118, 210, 0.05)',
//   borderRadius: '12px',
//   boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
//   transition: 'all 0.3s ease',
//   '&:hover': {
//     transform: 'translateY(-2px)',
//     boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
//   }
// }));

// const NotificationText = styled(Typography)({
//   display: '-webkit-box',
//   WebkitLineClamp: 2,
//   WebkitBoxOrient: 'vertical',
//   overflow: 'hidden',
//   textOverflow: 'ellipsis',
// });

// const TimeBadge = styled(Box)(({ theme }) => ({
//   display: 'inline-flex',
//   alignItems: 'center',
//   padding: '2px 6px',
//   borderRadius: '12px',
//   backgroundColor: theme.palette.grey[200],
//   fontSize: '0.65rem',
//   fontWeight: 500,
//   color: theme.palette.text.secondary
// }));

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

// const ActionButton = styled(IconButton)(({ theme }) => ({
//   transition: 'all 0.2s ease',
//   '&:hover': {
//     transform: 'scale(1.1)',
//     backgroundColor: theme.palette.action.hover
//   }
// }));

// const StickySection = styled(Box)(({ theme }) => ({
//   px: 2,
//   py: 1.5,
//   bgcolor: 'background.default',
//   position: 'sticky',
//   top: 0,
//   zIndex: 1,
//   borderBottom: `1px solid ${theme.palette.divider}`,
//   backdropFilter: 'blur(8px)',
//   '& .MuiTypography-root': {
//     fontWeight: 600,
//     letterSpacing: '0.5px'
//   }
// }));

// const NotificationPanel = ({ open, onClose }) => {
//   const theme = useTheme();
//   const dispatch = useDispatch();
//   const { items = [], status } = useSelector((state) => state.notifications);
//   const { isLoading } = useSelector((state) => state.loading);
//   const [activeTab, setActiveTab] = useState(NOTIFICATION_TYPES.ALL);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     if (open) {
//       const loadNotifications = async () => {
//         dispatch(startLoading({ 
//           message: 'Loading notifications...',
//           animationType: 'wave'
//         }));
//         try {
//           setError(null);
//           const result = await dispatch(fetchNotifications({ page: 1, size: 50 })).unwrap();
//           if (!result?.notifications) {
//             throw new Error('Invalid response structure');
//           }
//         } catch (error) {
//           setError(error.message || 'Failed to load notifications');
//           dispatch(
//             showSnackbar({
//               message: 'Failed to load notifications',
//               severity: 'error',
//               duration: 6000,
//               username: 'Notification Error',
//               avatarUrl: '/error-avatar.png'
//             })
//           );
//         } finally {
//           dispatch(stopLoading());
//         }
//       };
      
//       loadNotifications();
//     }
//   }, [open, dispatch]);

//   const { newNotifications, olderNotifications } = useMemo(() => {
//     const now = Date.now();
//     const cutoffTime = now - ONE_DAY_MS;

//     const filteredNotifications = activeTab === NOTIFICATION_TYPES.UNREAD 
//       ? items.filter(n => !n.isRead) 
//       : [...items];

//     const newNotifs = filteredNotifications.filter(
//       n => !n.isRead && n.createdAt && new Date(n.createdAt) > cutoffTime
//     );
    
//     const olderNotifs = filteredNotifications.filter(
//       n => !newNotifs.includes(n)
//     );

//     return { newNotifications: newNotifs, olderNotifications: olderNotifs };
//   }, [activeTab, items]);

//   const formatTimeAgo = (dateString) => {
//     if (!dateString) return 'Just now';
    
//     const date = new Date(dateString);
//     const now = new Date();
//     const diffInSeconds = Math.floor((now - date) / 1000);
    
//     if (diffInSeconds < 60) return 'Just now';
//     if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
//     if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
//     return `${Math.floor(diffInSeconds / 86400)}d`;
//   };

//   const handleMarkAsRead = async (id) => {
//     dispatch(startLoading({ 
//       message: 'Updating notification...',
//       animationType: 'bar'
//     }));
//     try {
//       await dispatch(markAsRead(id)).unwrap();
//     } catch (error) {
//       dispatch(
//         showSnackbar({
//           message: 'Failed to mark notification as read',
//           severity: 'error',
//           duration: 4000
//         })
//       );
//     } finally {
//       dispatch(stopLoading());
//     }
//   };

//   const handleMarkAllAsRead = async () => {
//     if (items.some(n => !n.isRead)) {
//       dispatch(startLoading({ 
//         message: 'Marking all as read...',
//         animationType: 'bar'
//       }));
//       try {
//         await dispatch(markAllAsRead()).unwrap();
//         dispatch(
//           showSnackbar({
//             message: 'All notifications marked as read',
//             severity: 'success',
//             duration: 3000
//           })
//         );
//       } catch (error) {
//         dispatch(
//           showSnackbar({
//             message: 'Failed to mark all notifications as read',
//             severity: 'error',
//             duration: 4000
//           })
//         );
//       } finally {
//         dispatch(stopLoading());
//       }
//     }
//   };

//   const handleFriendRequestAction = async (notification, action) => {
//     dispatch(startLoading({ 
//       message: action === 'accept' 
//         ? 'Accepting friend request...' 
//         : 'Rejecting friend request...',
//       animationType: 'wave'
//     }));
    
//     try {
//       const friendshipId = notification.metadata?.friendshipId;
//       if (!friendshipId) throw new Error('Missing friendship ID');

//       const result = await dispatch(
//         action === 'accept' 
//           ? acceptFriendRequest(friendshipId)
//           : rejectFriendRequest(friendshipId)
//       ).unwrap();

//       if (result?.friendship?.id || result?.success) {
//         await dispatch(deleteNotification(notification.id));
//         dispatch(
//           showSnackbar({
//             message: result.message || 
//               (action === 'accept' ? 'Friend request accepted' : 'Friend request rejected'),
//             severity: 'success',
//             duration: 5000,
//             username: notification.metadata?.senderName || 'User',
//             avatarUrl: notification.metadata?.avatarUrl || '/default-avatar.png'
//           })
//         );
//         dispatch(fetchNotifications());
//       } else {
//         throw new Error(result?.message || 'Action failed');
//       }
//     } catch (error) {
//       dispatch(
//         showSnackbar({
//           message: error.message || 'Failed to process friend request',
//           severity: 'error',
//           duration: 6000
//         })
//       );
//     } finally {
//       dispatch(stopLoading());
//     }
//   };

//   const renderNotificationIcon = (type) => {
//     const { icon: Icon, color } = NOTIFICATION_ICONS[type] || NOTIFICATION_ICONS.default;
//     return <Icon fontSize="small" sx={{ color: theme.palette[color] }} />;
//   };

//   const renderNotificationContent = (notification) => {
//     const { type, metadata = {} } = notification;
    
//     const senderName = metadata.senderName || 'Someone';
//     const message = metadata.message || '';
//     const content = metadata.content || '';

//     switch (type) {
//       case 'friend_request':
//         return (
//           <>
//             <Typography variant="body2" fontWeight={600}>
//               {senderName} {message || 'sent you a friend request'}
//             </Typography>
//           </>
//         );
//       case 'friend_request_accepted':
//         return (
//           <>
//             <Typography variant="body2" fontWeight={600}>
//               {senderName} {message || 'accepted your friend request'}
//             </Typography>
//           </>
//         );
//       case 'friend_request_rejected':
//         return (
//           <>
//             <Typography variant="body2" fontWeight={600}>
//               {senderName} {message || 'declined your friend request'}
//             </Typography>
//           </>
//         );
//       case 'memory':
//         return (
//           <>
//             <Typography variant="body2" fontWeight={600}>
//               Memory from today
//             </Typography>
//             <NotificationText variant="body2">
//               {message || 'You have a memory to look back on today'}
//             </NotificationText>
//           </>
//         );
//       case 'photo_upload':
//         return (
//           <>
//             <Typography variant="body2" fontWeight={600}>
//               {senderName} added {metadata.count || 'some'} new photos
//             </Typography>
//             <NotificationText variant="body2">
//               {content || 'New photos added to album'}
//             </NotificationText>
//           </>
//         );
//       case 'video_upload':
//         return (
//           <>
//             <Typography variant="body2" fontWeight={600}>
//               {senderName} added {metadata.count || 'some'} new videos
//             </Typography>
//             <NotificationText variant="body2">
//               {content || 'New videos added'}
//             </NotificationText>
//           </>
//         );
//       case 'post':
//         return (
//           <>
//             <Typography variant="body2" fontWeight={600}>
//               {senderName} made a post you haven't seen
//             </Typography>
//             <NotificationText variant="body2">
//               {content || 'New post from ' + senderName}
//             </NotificationText>
//             {metadata.responses && (
//               <TimeBadge sx={{ mt: 0.5 }}>
//                 {metadata.responses} Responses • {metadata.comments} Comments
//               </TimeBadge>
//             )}
//           </>
//         );
//       case 'friend_suggestion':
//         return (
//           <>
//             <Typography variant="body2" fontWeight={600}>
//               You have a new friend suggestion
//             </Typography>
//             <NotificationText variant="body2">
//               {senderName || content}
//             </NotificationText>
//           </>
//         );
//       default:
//         return (
//           <>
//             <Typography variant="body2" fontWeight={600}>
//               {senderName} {message}
//             </Typography>
//             {content && (
//               <NotificationText variant="body2">
//                 {content}
//               </NotificationText>
//             )}
//           </>
//         );
//     }
//   };

// // Update the renderNotificationItem function in the refactored component
// // const renderNotificationItem = (notification) => {
// //     const { 
// //       id, 
// //       type, 
// //       isRead, 
// //       createdAt, 
// //       metadata = {}, 
// //       sender 
// //     } = notification;
    
// //     const senderData = {
// //       id: sender?.id || metadata.senderId,
// //       name: sender ? `${sender.firstName} ${sender.lastName}` : 
// //                   metadata.senderName || 'Someone',
// //       avatar: sender?.profileImage || metadata.avatarUrl || '/default-avatar.png',
// //       username: sender?.username || metadata.username
// //     };

// //     const isFriendRequest = type === 'friend_request';
// //     const isActionable = !isRead;

// //     return (
// //       <motion.div 
// //         key={id} 
// //         whileHover={{ scale: 1.02 }} 
// //         whileTap={{ scale: 0.98 }}
// //         transition={{ duration: 0.2 }}
// //         data-testid={`notification-${id}`}
// //       >
// //         <ListItem
// //           component={NotificationAlert}
// //           isread={isRead.toString()}
// //           sx={{
// //             p: 2,
// //             mb: 1.5,
// //             position: 'relative',
// //             overflow: 'hidden',
// //             '&:before': {
// //               content: '""',
// //               position: 'absolute',
// //               left: 0,
// //               top: 0,
// //               bottom: 0,
// //               width: 4,
// //               bgcolor: NOTIFICATION_ICONS[type]?.color || 'text.disabled'
// //             },
// //             '&:hover .notification-actions': {
// //               visibility: 'visible',
// //               opacity: 1
// //             }
// //           }}
// //           aria-labelledby={`notification-${id}-text`}
// //         >
// //           <ListItemAvatar>
// //             <Badge
// //               color="primary"
// //               variant={isRead ? undefined : 'dot'}
// //               overlap="circular"
// //               invisible={isRead}
// //               anchorOrigin={{
// //                 vertical: 'bottom',
// //                 horizontal: 'right'
// //               }}
// //             >
// //               <Avatar
// //                 src={senderData.avatar}
// //                 alt={senderData.name}
// //                 component={senderData.id ? Link : 'div'}
// //                 to={senderData.id ? `/profile/${senderData.id}` : '#'}
// //                 sx={{ 
// //                   width: 48, 
// //                   height: 48,
// //                   transition: 'transform 0.2s ease',
// //                   '&:hover': {
// //                     transform: 'scale(1.1)'
// //                   }
// //                 }}
// //               />
// //             </Badge>
// //           </ListItemAvatar>

// //           <Box sx={{ 
// //             flex: 1, 
// //             overflow: 'hidden',
// //             minWidth: 0
// //           }}>
// //             {renderNotificationContent(notification)}
// //             <TimeBadge sx={{ mt: 0.5 }}>
// //               {formatTimeAgo(createdAt)}
// //             </TimeBadge>
// //           </Box>

// //           <Box 
// //             className="notification-actions"
// //             sx={{
// //               visibility: isFriendRequest ? 'visible' : isActionable ? 'hidden' : 'hidden',
// //               opacity: isFriendRequest ? 1 : 0,
// //               display: 'flex',
// //               gap: 1,
// //               alignSelf: 'center',
// //               transition: 'opacity 0.2s ease'
// //             }}
// //           >
// //             {isActionable && !isFriendRequest && (
// //               <Tooltip title="Mark as read">
// //                 <ActionButton 
// //                   size="small" 
// //                   onClick={() => handleMarkAsRead(id)}
// //                   aria-label="Mark as read"
// //                   color="inherit"
// //                 >
// //                   <Done fontSize="small" />
// //                 </ActionButton>
// //               </Tooltip>
// //             )}

// //             {isFriendRequest && (
// //               <>
// //                 <Tooltip title="Accept request">
// //                   <ActionButton
// //                     size="small"
// //                     color="success"
// //                     onClick={() => handleFriendRequestAction(notification, 'accept')}
// //                     aria-label="Accept friend request"
// //                   >
// //                     <Check fontSize="small" />
// //                   </ActionButton>
// //                 </Tooltip>
// //                 <Tooltip title="Decline request">
// //                   <ActionButton
// //                     size="small"
// //                     color="error"
// //                     onClick={() => handleFriendRequestAction(notification, 'reject')}
// //                     aria-label="Reject friend request"
// //                   >
// //                     <Close fontSize="small" />
// //                   </ActionButton>
// //                 </Tooltip>
// //               </>
// //             )}
// //           </Box>
// //         </ListItem>
// //         <Divider component="li" variant="inset" />
// //       </motion.div>
// //     );
// //   };

// const renderNotificationItem = (notification) => {
//     const { 
//       id, 
//       type, 
//       isRead, 
//       createdAt, 
//       metadata = {}, 
//       sender 
//     } = notification;
    
//     const senderData = {
//       id: sender?.id || metadata.senderId,
//       name: sender ? `${sender.firstName} ${sender.lastName}` : 
//                   metadata.senderName || 'Someone',
//       avatar: sender?.profileImage || metadata.avatarUrl || '/default-avatar.png',
//       username: sender?.username || metadata.username
//     };

//     const isFriendRequest = type === 'friend_request';
//     const isActionable = !isRead;

//     return (
//       <motion.div 
//         key={id} 
//         whileHover={{ scale: 1.02 }} 
//         whileTap={{ scale: 0.98 }}
//         transition={{ duration: 0.2 }}
//         data-testid={`notification-${id}`}
//       >
//         <ListItem
//           component={NotificationAlert}
//           isread={isRead.toString()}
//           sx={{
//             p: 2,
//             mb: 1.5,
//             position: 'relative',
//             overflow: 'hidden',
//             '&:before': {
//               content: '""',
//               position: 'absolute',
//               left: 0,
//               top: 0,
//               bottom: 0,
//               width: 4,
//               bgcolor: NOTIFICATION_ICONS[type]?.color || 'text.disabled'
//             },
//             '&:hover .notification-actions': {
//               visibility: 'visible',
//               opacity: 1
//             }
//           }}
//           aria-labelledby={`notification-${id}-text`}
//         >
//           <ListItemAvatar>
//             <Badge
//               color="primary"
//               variant={isRead ? undefined : 'dot'}
//               overlap="circular"
//               invisible={isRead}
//               anchorOrigin={{
//                 vertical: 'bottom',
//                 horizontal: 'right'
//               }}
//             >
//               <Avatar
//                 src={senderData.avatar}
//                 alt={senderData.name}
//                 component={senderData.id ? Link : 'div'}
//                 to={senderData.id ? `/profile/${senderData.id}` : '#'}
//                 sx={{ 
//                   width: 48, 
//                   height: 48,
//                   transition: 'transform 0.2s ease',
//                   '&:hover': {
//                     transform: 'scale(1.1)'
//                   }
//                 }}
//               />
//             </Badge>
//           </ListItemAvatar>

//           <Box sx={{ 
//             flex: 1, 
//             overflow: 'hidden',
//             minWidth: 0
//           }}>
//             {renderNotificationContent(notification)}
//             <TimeBadge sx={{ mt: 0.5 }}>
//               {formatTimeAgo(createdAt)}
//             </TimeBadge>
//           </Box>

//           <Box 
//             className="notification-actions"
//             sx={{
//               visibility: 'hidden',
//               opacity: 0,
//               display: 'flex',
//               gap: 1,
//               alignSelf: 'center',
//               transition: 'all 0.2s ease'
//             }}
//           >
//             {isActionable && !isFriendRequest && (
//               <Tooltip title="Mark as read">
//                 <ActionButton 
//                   size="small" 
//                   onClick={() => handleMarkAsRead(id)}
//                   aria-label="Mark as read"
//                   color="inherit"
//                 >
//                   <Done fontSize="small" />
//                 </ActionButton>
//               </Tooltip>
//             )}

//             {isFriendRequest && (
//               <>
//                 <Tooltip title="Accept request">
//                   <ActionButton
//                     size="small"
//                     color="success"
//                     onClick={() => handleFriendRequestAction(notification, 'accept')}
//                     aria-label="Accept friend request"
//                   >
//                     <Check fontSize="small" />
//                   </ActionButton>
//                 </Tooltip>
//                 <Tooltip title="Decline request">
//                   <ActionButton
//                     size="small"
//                     color="error"
//                     onClick={() => handleFriendRequestAction(notification, 'reject')}
//                     aria-label="Reject friend request"
//                   >
//                     <Close fontSize="small" />
//                   </ActionButton>
//                 </Tooltip>
//               </>
//             )}
//           </Box>
//         </ListItem>
//         <Divider component="li" variant="inset" />
//       </motion.div>
//     );
//   };

//   const renderEmptyState = () => (
//     <Box
//       sx={{
//         display: 'flex',
//         flexDirection: 'column',
//         alignItems: 'center',
//         justifyContent: 'center',
//         height: '60vh',
//         textAlign: 'center',
//         background: 'linear-gradient(135deg, rgba(245,245,245,0.8) 0%, rgba(255,255,255,1) 100%)',
//         borderRadius: 4,
//         p: 4,
//         mx: 2
//       }}
//     >
//       <NotificationsIcon sx={{ 
//         fontSize: 80, 
//         color: 'text.disabled',
//         mb: 2,
//         opacity: 0.6
//       }} />
//       <Typography variant="h6" color="text.secondary">
//         No notifications yet
//       </Typography>
//       <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
//         {activeTab === NOTIFICATION_TYPES.UNREAD
//           ? "You're all caught up!"
//           : 'Your notifications will appear here.'}
//       </Typography>
//     </Box>
//   );

//   const renderError = () => (
//     <Box
//       sx={{
//         display: 'flex',
//         flexDirection: 'column',
//         alignItems: 'center',
//         justifyContent: 'center',
//         height: '60vh',
//         textAlign: 'center',
//         p: 4,
//         mx: 2
//       }}
//     >
//       <Typography color="error" variant="h6" gutterBottom>
//         Failed to load notifications
//       </Typography>
//       <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
//         {error}
//       </Typography>
//       <Button 
//         variant="contained" 
//         color="primary" 
//         onClick={() => dispatch(fetchNotifications({ page: 1, size: 50 }))}
//         startIcon={<NotificationsIcon />}
//         sx={{
//           borderRadius: '20px',
//           px: 3,
//           py: 1,
//           textTransform: 'none',
//           fontWeight: 600
//         }}
//       >
//         Retry
//       </Button>
//     </Box>
//   );

//   const renderLoadingState = () => (
//     <Box flex={1} display="flex" flexDirection="column">
//       <StickySection>
//         <Typography variant="subtitle2">Loading notifications...</Typography>
//       </StickySection>
//       <List aria-label="Loading notifications" disablePadding>
//         {[...Array(5)].map((_, index) => (
//           <motion.div
//             key={index}
//             initial={{ opacity: 0.5, y: 10 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ 
//               duration: 0.3,
//               delay: index * 0.1
//             }}
//           >
//             <Box sx={{ 
//               p: 2, 
//               mb: 1.5,
//               position: 'relative',
//               overflow: 'hidden',
//               borderRadius: '12px',
//               bgcolor: 'background.paper'
//             }}>
//               <Box sx={{ display: 'flex', gap: 2 }}>
//                 <Skeleton 
//                   variant="circular" 
//                   width={48} 
//                   height={48} 
//                   sx={{ 
//                     bgcolor: 'grey.200',
//                     animation: `${pulse} 1.5s infinite ease-in-out`
//                   }} 
//                 />
//                 <Box sx={{ flex: 1 }}>
//                   <Skeleton 
//                     variant="text" 
//                     width="60%" 
//                     height={24} 
//                     sx={{ 
//                       bgcolor: 'grey.200',
//                       borderRadius: 1
//                     }} 
//                   />
//                   <Skeleton 
//                     variant="text" 
//                     width="80%" 
//                     height={20} 
//                     sx={{ 
//                       bgcolor: 'grey.200',
//                       borderRadius: 1,
//                       mt: 1
//                     }} 
//                   />
//                   <Skeleton 
//                     variant="text" 
//                     width="40%" 
//                     height={16} 
//                     sx={{ 
//                       bgcolor: 'grey.200',
//                       borderRadius: 1,
//                       mt: 1.5
//                     }} 
//                   />
//                 </Box>
//               </Box>
//               <ShimmerOverlay />
//             </Box>
//           </motion.div>
//         ))}
//       </List>
//     </Box>
//   );

//   return (
//     <Drawer
//       anchor="right"
//       open={open}
//       onClose={onClose}
//       sx={{
//         '& .MuiDrawer-paper': {
//           width: { xs: '100%', sm: 420 },
//           top: '64px',
//           height: 'calc(100vh - 64px)',
//           borderLeft: `1px solid ${theme.palette.divider}`,
//           boxShadow: '0px 0px 20px rgba(0,0,0,0.05)'
//         },
//       }}
//       ModalProps={{
//         keepMounted: true
//       }}
//     >
//       <Box display="flex" flexDirection="column" height="100%" bgcolor="background.paper">
//         <Box
//           display="flex"
//           justifyContent="space-between"
//           alignItems="center"
//           p={2}
//           borderBottom={`1px solid ${theme.palette.divider}`}
//         >
//           <Typography variant="h6" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
//             <NotificationsIcon color="primary" />
//             Notifications
//           </Typography>
//           <Button
//             size="small"
//             onClick={handleMarkAllAsRead}
//             disabled={items.every(n => n.isRead) || isLoading}
//             startIcon={<Done />}
//             aria-label="Mark all notifications as read"
//             sx={{
//               borderRadius: '20px',
//               px: 2,
//               py: 0.5,
//               textTransform: 'none',
//               fontWeight: 600
//             }}
//           >
//             Mark all as read
//           </Button>
//         </Box>

//         <Tabs 
//           value={activeTab}
//           onChange={(_, newValue) => setActiveTab(newValue)}
//           variant="fullWidth"
//           sx={{
//             '& .MuiTabs-indicator': {
//               height: 3,
//               borderRadius: '3px 3px 0 0'
//             }
//           }}
//         >
//           <Tab 
//             label={
//               <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
//                 <NotificationsIcon fontSize="small" />
//                 <span>All</span>
//               </Box>
//             }
//             sx={{ py: 1.5 }}
//           />
//           <Tab 
//             label={
//               <Badge 
//                 color="error" 
//                 badgeContent={items.filter(n => !n.isRead).length}
//                 max={99}
//               >
//                 <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
//                   <Mail fontSize="small" />
//                   <span>Unread</span>
//                 </Box>
//               </Badge>
//             }
//             sx={{ py: 1.5 }}
//           />
//         </Tabs>

//         {error ? renderError() : status === 'loading' ? renderLoadingState() : (
//           <Box
//             flex={1}
//             overflow="auto"
//             sx={{
//               '&::-webkit-scrollbar': { width: 6 },
//               '&::-webkit-scrollbar-thumb': { 
//                 bgcolor: 'rgba(0,0,0,0.2)',
//                 borderRadius: 3
//               },
//             }}
//           >
//             {newNotifications.length > 0 && (
//               <>
//                 <StickySection>
//                   <Typography variant="subtitle2">New</Typography>
//                 </StickySection>
//                 <List aria-label="New notifications" disablePadding>
//                   {newNotifications.map(notification => renderNotificationItem(notification))}
//                 </List>
//               </>
//             )}
//             {olderNotifications.length > 0 && (
//               <>
//                 <StickySection>
//                   <Typography variant="subtitle2">Earlier</Typography>
//                 </StickySection>
//                 <List aria-label="Earlier notifications" disablePadding>
//                   {olderNotifications.map(notification => renderNotificationItem(notification))}
//                 </List>
//               </>
//             )}
//             {newNotifications.length === 0 && olderNotifications.length === 0 && renderEmptyState()}
//           </Box>
//         )}
//       </Box>
//     </Drawer>
//   );
// };

// export default NotificationPanel;






//! final
// src/features/notification/NotificationPanel.jsx
// import {
//   Check,
//   Close,
//   Comment as CommentIcon,
//   Done,
//   GroupAdd,
//   Memory,
//   Notifications as NotificationsIcon,
//   Person,
//   PersonAdd,
//   PhotoLibrary,
//   ThumbUp,
//   VideoLibrary
// } from '@mui/icons-material';
// import {
//   Avatar,
//   Badge,
//   Box,
//   Button,
//   Divider,
//   Drawer,
//   IconButton,
//   keyframes,
//   List,
//   ListItem,
//   ListItemAvatar,
//   Skeleton,
//   styled,
//   Tab,
//   Tabs,
//   Tooltip,
//   Typography,
//   useTheme
// } from '@mui/material';
// import { motion } from 'framer-motion';
// import { useEffect, useMemo, useState } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { Link } from 'react-router-dom';
// import {
//   acceptFriendRequest,
//   rejectFriendRequest,
// } from '../friendship/friendshipSlice';
// import { startLoading, stopLoading } from '../loading/loadingSlice';
// import { showSnackbar } from '../snackbar/snackbarSlice';
// import {
//   deleteNotification,
//   fetchNotifications,
//   markAllAsRead,
//   markAsRead,
// } from './notificationSlice';

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

// // Constants
// const NOTIFICATION_TYPES = {
//   ALL: 0,
//   UNREAD: 1,
// };

// const ONE_DAY_MS = 24 * 60 * 60 * 1000;

// const NOTIFICATION_ICONS = {
//   friend_request: {
//     icon: PersonAdd,
//     color: 'primary.main',
//   },
//   post_like: {
//     icon: ThumbUp,
//     color: 'error.main',
//   },
//   follow: {
//     icon: Person,
//     color: 'success.main',
//   },
//   comment: {
//     icon: CommentIcon,
//     color: 'secondary.main',
//   },
//   memory: {
//     icon: Memory,
//     color: 'warning.main',
//   },
//   photo_upload: {
//     icon: PhotoLibrary,
//     color: 'info.main',
//   },
//   video_upload: {
//     icon: VideoLibrary,
//     color: 'info.main',
//   },
//   post: {
//     icon: CommentIcon,
//     color: 'secondary.main',
//   },
//   friend_suggestion: {
//     icon: GroupAdd,
//     color: 'success.main',
//   },
//   default: {
//     icon: NotificationsIcon,
//     color: 'text.disabled',
//   },
// };

// const NotificationText = styled(Typography)({
//   display: '-webkit-box',
//   WebkitLineClamp: 2,
//   WebkitBoxOrient: 'vertical',
//   overflow: 'hidden',
//   textOverflow: 'ellipsis',
// });

// const TimeText = styled(Typography)(({ theme }) => ({
//   fontSize: '0.75rem',
//   color: theme.palette.text.secondary,
// }));

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

// const NotificationPanel = ({ open, onClose }) => {
//   const theme = useTheme();
//   const dispatch = useDispatch();
//   const { items = [], status } = useSelector((state) => state.notifications);
//   const { isLoading } = useSelector((state) => state.loading);
//   const [activeTab, setActiveTab] = useState(NOTIFICATION_TYPES.ALL);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     if (open) {
//       const loadNotifications = async () => {
//         dispatch(startLoading({ 
//           message: 'Loading notifications...',
//           animationType: 'wave'
//         }));
//         try {
//           setError(null);
//           const result = await dispatch(fetchNotifications({ page: 1, size: 50 })).unwrap();
//           if (!result?.notifications) {
//             throw new Error('Invalid response structure');
//           }
//         } catch (error) {
//           setError(error.message || 'Failed to load notifications');
//           dispatch(
//             showSnackbar({
//               message: 'Failed to load notifications',
//               severity: 'error',
//             })
//           );
//         } finally {
//           dispatch(stopLoading());
//         }
//       };
      
//       loadNotifications();
//     }
//   }, [open, dispatch]);

//   const { newNotifications, olderNotifications } = useMemo(() => {
//     const now = Date.now();
//     const cutoffTime = now - ONE_DAY_MS;

//     const filteredNotifications = activeTab === NOTIFICATION_TYPES.UNREAD 
//       ? items.filter(n => !n.isRead) 
//       : [...items];

//     const newNotifs = filteredNotifications.filter(
//       n => !n.isRead && n.createdAt && new Date(n.createdAt) > cutoffTime
//     );
    
//     const olderNotifs = filteredNotifications.filter(
//       n => !newNotifs.includes(n)
//     );

//     return { newNotifications: newNotifs, olderNotifications: olderNotifs };
//   }, [activeTab, items]);

//   const formatTimeAgo = (dateString) => {
//     const date = new Date(dateString);
//     const now = new Date();
//     const diffInSeconds = Math.floor((now - date) / 1000);
    
//     if (diffInSeconds < 60) return 'Just now';
//     if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
//     if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
//     return `${Math.floor(diffInSeconds / 86400)}d`;
//   };

//   const handleMarkAsRead = async (id) => {
//     dispatch(startLoading({ 
//       message: 'Updating notification...',
//       animationType: 'bar'
//     }));
//     try {
//       await dispatch(markAsRead(id)).unwrap();
//     } catch (error) {
//       dispatch(
//         showSnackbar({
//           message: 'Failed to mark notification as read',
//           severity: 'error',
//         })
//       );
//     } finally {
//       dispatch(stopLoading());
//     }
//   };

//   const handleMarkAllAsRead = async () => {
//     if (items.some(n => !n.isRead)) {
//       dispatch(startLoading({ 
//         message: 'Marking all as read...',
//         animationType: 'bar'
//       }));
//       try {
//         await dispatch(markAllAsRead()).unwrap();
//         dispatch(
//           showSnackbar({
//             message: 'All notifications marked as read',
//             severity: 'success',
//           })
//         );
//       } catch (error) {
//         dispatch(
//           showSnackbar({
//             message: 'Failed to mark all notifications as read',
//             severity: 'error',
//           })
//         );
//       } finally {
//         dispatch(stopLoading());
//       }
//     }
//   };

//   const handleFriendRequestAction = async (notification, action) => {
//     dispatch(startLoading({ 
//       message: action === 'accept' 
//         ? 'Accepting friend request...' 
//         : 'Rejecting friend request...',
//       animationType: 'wave'
//     }));
    
//     try {
//       const friendshipId = notification.metadata?.friendshipId;
//       if (!friendshipId) throw new Error('Missing friendship ID');

//       const result = await dispatch(
//         action === 'accept' 
//           ? acceptFriendRequest(friendshipId)
//           : rejectFriendRequest(friendshipId)
//       ).unwrap();

//       if (result?.friendship?.id || result?.success) {
//         await dispatch(deleteNotification(notification.id));
//         dispatch(
//           showSnackbar({
//             message: result.message || 
//               (action === 'accept' ? 'Friend request accepted' : 'Friend request rejected'),
//             severity: 'success',
//           })
//         );
//         dispatch(fetchNotifications());
//       } else {
//         throw new Error(result?.message || 'Action failed');
//       }
//     } catch (error) {
//       dispatch(
//         showSnackbar({
//           message: error.message,
//           severity: 'error',
//         })
//       );
//     } finally {
//       dispatch(stopLoading());
//     }
//   };

//   const renderNotificationIcon = (type) => {
//     const { icon: Icon, color } = NOTIFICATION_ICONS[type] || NOTIFICATION_ICONS.default;
//     return <Icon fontSize="small" sx={{ color: theme.palette[color] }} />;
//   };

//   const renderNotificationContent = (notification) => {
//     const { type, metadata = {} } = notification;
    
//     const senderName = metadata.senderName || 'Someone';
//     const message = metadata.message || '';
//     const content = metadata.content || '';

//     switch (type) {
//       case 'friend_request':
//         return (
//           <>
//             <Typography variant="body2" fontWeight={600}>
//               {senderName} {message || 'sent you a friend request'}
//             </Typography>
//           </>
//         );
//       case 'friend_request_accepted':
//         return (
//           <>
//             <Typography variant="body2" fontWeight={600}>
//               {senderName} {message || 'accepted your friend request'}
//             </Typography>
//           </>
//         );
//       case 'friend_request_rejected':
//         return (
//           <>
//             <Typography variant="body2" fontWeight={600}>
//               {senderName} {message || 'declined your friend request'}
//             </Typography>
//           </>
//         );
//       case 'memory':
//         return (
//           <>
//             <Typography variant="body2" fontWeight={600}>
//               Memory from today
//             </Typography>
//             <NotificationText variant="body2">
//               {message || 'You have a memory to look back on today'}
//             </NotificationText>
//           </>
//         );
//       case 'photo_upload':
//         return (
//           <>
//             <Typography variant="body2" fontWeight={600}>
//               {senderName} added {metadata.count || 'some'} new photos
//             </Typography>
//             <NotificationText variant="body2">
//               {content || 'New photos added to album'}
//             </NotificationText>
//           </>
//         );
//       case 'video_upload':
//         return (
//           <>
//             <Typography variant="body2" fontWeight={600}>
//               {senderName} added {metadata.count || 'some'} new videos
//             </Typography>
//             <NotificationText variant="body2">
//               {content || 'New videos added'}
//             </NotificationText>
//           </>
//         );
//       case 'post':
//         return (
//           <>
//             <Typography variant="body2" fontWeight={600}>
//               {senderName} made a post you haven't seen
//             </Typography>
//             <NotificationText variant="body2">
//               {content || 'New post from ' + senderName}
//             </NotificationText>
//             {metadata.responses && (
//               <TimeText>
//                 {metadata.responses} Responses • {metadata.comments} Comments
//               </TimeText>
//             )}
//           </>
//         );
//       case 'friend_suggestion':
//         return (
//           <>
//             <Typography variant="body2" fontWeight={600}>
//               You have a new friend suggestion
//             </Typography>
//             <NotificationText variant="body2">
//               {senderName || content}
//             </NotificationText>
//           </>
//         );
//       default:
//         return (
//           <>
//             <Typography variant="body2" fontWeight={600}>
//               {senderName} {message}
//             </Typography>
//             {content && (
//               <NotificationText variant="body2">
//                 {content}
//               </NotificationText>
//             )}
//           </>
//         );
//     }
//   };

//   const renderNotificationItem = (notification) => {
//     const { 
//       id, 
//       type, 
//       isRead, 
//       createdAt, 
//       metadata = {}, 
//       sender 
//     } = notification;
    
//     const senderData = {
//       id: sender?.id || metadata.senderId,
//       name: sender ? `${sender.firstName} ${sender.lastName}` : 
//                   metadata.senderName || 'Someone',
//       avatar: sender?.profileImage || metadata.avatarUrl || '/default-avatar.png',
//       username: sender?.username || metadata.username
//     };

//     const isFriendRequest = type === 'friend_request';
//     const isActionable = !isRead && !isFriendRequest;

//     return (
//       <motion.div 
//         key={id} 
//         whileHover={{ scale: 1.02 }} 
//         transition={{ duration: 0.2 }}
//         data-testid={`notification-${id}`}
//       >
//         <ListItem
//           sx={{
//             p: 1.5,
//             mb: 1,
//             bgcolor: isRead ? 'background.paper' : 'action.selected',
//             borderRadius: 1,
//             mx: 1,
//             alignItems: 'flex-start',
//             position: 'relative',
//             '&:hover .notification-actions': {
//               visibility: 'visible'
//             }
//           }}
//           aria-labelledby={`notification-${id}-text`}
//         >
//           <ListItemAvatar>
//             <Badge
//               color="primary"
//               variant={isRead ? undefined : 'dot'}
//               overlap="circular"
//               invisible={isRead}
//             >
//               <Avatar
//                 src={senderData.avatar}
//                 alt={senderData.name}
//                 component={senderData.id ? Link : 'div'}
//                 to={senderData.id ? `/profile/${senderData.id}` : '#'}
//                 sx={{ 
//                   width: 48, 
//                   height: 48,
//                   '&:hover': {
//                     transform: 'scale(1.1)',
//                     transition: 'transform 0.2s ease'
//                   }
//                 }}
//               />
//             </Badge>
//           </ListItemAvatar>

//           <Box sx={{ 
//             flex: 1, 
//             overflow: 'hidden',
//             minWidth: 0
//           }}>
//             {renderNotificationContent(notification)}
//             <TimeText>
//               {formatTimeAgo(createdAt)}
//             </TimeText>
//           </Box>

//           <Box 
//             className="notification-actions"
//             sx={{
//               visibility: isActionable ? 'visible' : 'hidden',
//               display: 'flex',
//               gap: 1,
//               alignSelf: 'center'
//             }}
//           >
//             {isActionable && (
//               <Tooltip title="Mark as read">
//                 <IconButton 
//                   size="small" 
//                   onClick={() => handleMarkAsRead(id)}
//                   aria-label="Mark as read"
//                   color="inherit"
//                 >
//                   <Done fontSize="small" />
//                 </IconButton>
//               </Tooltip>
//             )}

//             {isFriendRequest && (
//               <>
//                 <Tooltip title="Accept request">
//                   <IconButton
//                     size="small"
//                     color="success"
//                     onClick={() => handleFriendRequestAction(notification, 'accept')}
//                     aria-label="Accept friend request"
//                   >
//                     <Check fontSize="small" />
//                   </IconButton>
//                 </Tooltip>
//                 <Tooltip title="Decline request">
//                   <IconButton
//                     size="small"
//                     color="error"
//                     onClick={() => handleFriendRequestAction(notification, 'reject')}
//                     aria-label="Reject friend request"
//                   >
//                     <Close fontSize="small" />
//                   </IconButton>
//                 </Tooltip>
//               </>
//             )}
//           </Box>
//         </ListItem>
//         <Divider component="li" variant="inset" />
//       </motion.div>
//     );
//   };

//   const renderEmptyState = () => (
//     <Box
//       display="flex"
//       flexDirection="column"
//       justifyContent="center"
//       alignItems="center"
//       height="100%"
//       p={4}
//     >
//       <NotificationsIcon sx={{ fontSize: 60, color: 'text.disabled' }} />
//       <Typography variant="h6" mt={2}>
//         No notifications
//       </Typography>
//       <Typography variant="body2" color="text.secondary">
//         {activeTab === NOTIFICATION_TYPES.UNREAD
//           ? "You're all caught up!"
//           : 'You will see notifications here when they arrive.'}
//       </Typography>
//     </Box>
//   );

//   const renderError = () => (
//     <Box
//       display="flex"
//       flexDirection="column"
//       justifyContent="center"
//       alignItems="center"
//       height="100%"
//       p={4}
//     >
//       <Typography color="error" variant="h6">
//         Failed to load notifications
//       </Typography>
//       <Typography variant="body2" color="text.secondary">
//         {error}
//       </Typography>
//       <Button 
//         variant="contained" 
//         color="primary" 
//         onClick={() => dispatch(fetchNotifications({ page: 1, size: 50 }))}
//         sx={{ mt: 2 }}
//       >
//         Retry
//       </Button>
//     </Box>
//   );

//   const StickySection = ({ title }) => (
//     <Box
//       sx={{
//         px: 2,
//         py: 1,
//         bgcolor: 'background.default',
//         position: 'sticky',
//         top: 0,
//         zIndex: 1,
//         borderBottom: `1px solid ${theme.palette.divider}`,
//       }}
//     >
//       <Typography variant="subtitle2" fontWeight="bold">
//         {title}
//       </Typography>
//     </Box>
//   );

//   const renderLoadingState = () => (
//     <Box flex={1} display="flex" flexDirection="column">
//       <StickySection title="Loading notifications..." />
//       <List aria-label="Loading notifications" disablePadding>
//         {[...Array(5)].map((_, index) => (
//           <motion.div
//             key={index}
//             initial={{ opacity: 0.5, y: 10 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ 
//               duration: 0.3,
//               delay: index * 0.1
//             }}
//           >
//             <ListItem sx={{ 
//               p: 2, 
//               alignItems: 'flex-start',
//               position: 'relative',
//               overflow: 'hidden',
//               '&:after': {
//                 content: '""',
//                 position: 'absolute',
//                 top: 0,
//                 left: 0,
//                 width: '100%',
//                 height: '100%',
//                 background: `linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)`,
//                 animation: `${wave} 1.5s infinite`,
//               }
//             }}>
//               <ListItemAvatar>
//                 <Skeleton 
//                   variant="circular" 
//                   width={48} 
//                   height={48} 
//                   sx={{ 
//                     bgcolor: 'grey.200',
//                     animation: `${pulse} 1.5s infinite ease-in-out`
//                   }} 
//                 />
//               </ListItemAvatar>
//               <Box sx={{ flex: 1 }}>
//                 <Skeleton 
//                   variant="text" 
//                   width="60%" 
//                   height={24} 
//                   sx={{ 
//                     bgcolor: 'grey.200',
//                     borderRadius: 1
//                   }} 
//                 />
//                 <Skeleton 
//                   variant="text" 
//                   width="80%" 
//                   height={20} 
//                   sx={{ 
//                     bgcolor: 'grey.200',
//                     borderRadius: 1,
//                     mt: 1
//                   }} 
//                 />
//                 <Skeleton 
//                   variant="text" 
//                   width="40%" 
//                   height={16} 
//                   sx={{ 
//                     bgcolor: 'grey.200',
//                     borderRadius: 1,
//                     mt: 1
//                   }} 
//                 />
//               </Box>
//               <Box sx={{ 
//                 display: 'flex', 
//                 gap: 1,
//                 position: 'relative',
//                 zIndex: 1
//               }}>
//                 <Skeleton 
//                   variant="circular" 
//                   width={32} 
//                   height={32} 
//                   sx={{ 
//                     bgcolor: 'grey.200',
//                     animation: `${pulse} 1.5s infinite ease-in-out`
//                   }} 
//                 />
//                 <Skeleton 
//                   variant="circular" 
//                   width={32} 
//                   height={32} 
//                   sx={{ 
//                     bgcolor: 'grey.200',
//                     animation: `${pulse} 1.5s infinite ease-in-out`,
//                     animationDelay: '0.2s'
//                   }} 
//                 />
//               </Box>
//             </ListItem>
//             <Divider sx={{ bgcolor: 'grey.100' }} />
//           </motion.div>
//         ))}
//       </List>
//     </Box>
//   );

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
//         },
//       }}
//     >
//       <Box display="flex" flexDirection="column" height="100%" bgcolor="background.paper">
//         <Box
//           display="flex"
//           justifyContent="space-between"
//           alignItems="center"
//           p={2}
//           borderBottom={`1px solid ${theme.palette.divider}`}
//         >
//           <Typography variant="h6" fontWeight="bold">
//             Notifications
//           </Typography>
//           <Button
//             size="small"
//             onClick={handleMarkAllAsRead}
//             disabled={items.every(n => n.isRead) || isLoading}
//             startIcon={<Done />}
//             aria-label="Mark all notifications as read"
//           >
//             Mark all as read
//           </Button>
//         </Box>

//         <Tabs 
//           value={activeTab} 
//           onChange={(_, newValue) => setActiveTab(newValue)} 
//           variant="fullWidth"
//           aria-label="Notification tabs"
//           sx={{ borderBottom: `1px solid ${theme.palette.divider}` }}
//         >
//           <Tab 
//             label="All" 
//             aria-controls="notification-tabpanel-all" 
//             id="notification-tab-all"
//           />
//           <Tab 
//             label={`Unread (${items.filter(n => !n.isRead).length})`} 
//             aria-controls="notification-tabpanel-unread" 
//             id="notification-tab-unread"
//           />
//         </Tabs>

//         {error ? renderError() : status === 'loading' ? renderLoadingState() : (
//           <Box
//             flex={1}
//             overflow="auto"
//             sx={{
//               '&::-webkit-scrollbar': { width: 6 },
//               '&::-webkit-scrollbar-thumb': { bgcolor: 'rgba(0,0,0,0.2)' },
//             }}
//           >
//             {newNotifications.length > 0 && (
//               <>
//                 <StickySection title="New" />
//                 <List aria-label="New notifications" disablePadding>
//                   {newNotifications.map(notification => renderNotificationItem(notification))}
//                 </List>
//               </>
//             )}
//             {olderNotifications.length > 0 && (
//               <>
//                 <StickySection title="Earlier" />
//                 <List aria-label="Earlier notifications" disablePadding>
//                   {olderNotifications.map(notification => renderNotificationItem(notification))}
//                 </List>
//               </>
//             )}
//             {newNotifications.length === 0 && olderNotifications.length === 0 && renderEmptyState()}
//           </Box>
//         )}
//       </Box>
//     </Drawer>
//   );
// };

// export default NotificationPanel;








































