 // src/features/notification/NotificationPanel.jsx
// Updated NotificationPanel.jsx with centralized loading pattern

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
  rejectFriendRequest
} from '../friendship/friendshipSlice';
import { startLoading, stopLoading } from '../loading/loadingSlice';
import { showSnackbar } from '../snackbar/snackbarSlice';
import {
  deleteNotification,
  fetchNotifications,
  fetchUnreadCount,
  markAllAsRead,
  markAsRead
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
  const { items = [] } = useSelector((state) => state.notifications);
  const { isLoading } = useSelector((state) => state.loading);
  const [activeTab, setActiveTab] = useState(NOTIFICATION_TYPES.ALL);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (open) {
      const loadNotifications = async () => {
        dispatch(startLoading({ message: 'Loading notifications...', animationType: 'wave' }));
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
    dispatch(startLoading({ message: 'Marking as read...', animationType: 'wave' }));
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
      dispatch(startLoading({ message: 'Marking all as read...', animationType: 'wave' }));
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
    dispatch(startLoading({ message: `${action === 'accept' ? 'Accepting' : 'Rejecting'} request...`, animationType: 'wave' }));
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
          username: result?.user?.firstName || undefined,
          avatarUrl: result?.user?.profileImage || '/default-avatar.png'
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


//! original
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

