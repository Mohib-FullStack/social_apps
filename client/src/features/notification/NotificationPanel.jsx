import {
  Check,
  Close,
  Comment as CommentIcon,
  Done,
  GroupAdd,
  Memory,
  Notifications as NotificationsIcon,
  Person,
  PersonAdd,
  PhotoLibrary,
  ThumbUp,
  VideoLibrary
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
  styled,
  Tab,
  Tabs,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import { motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  acceptFriendRequest,
  rejectFriendRequest,
} from '../friendship/friendshipSlice';
import { showSnackbar } from '../snackbar/snackbarSlice';
import {
  deleteNotification,
  fetchNotifications,
  markAllAsRead,
  markAsRead,
} from './notificationSlice';

// Constants
const NOTIFICATION_TYPES = {
  ALL: 0,
  UNREAD: 1,
};

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

const NOTIFICATION_ICONS = {
  friend_request: {
    icon: PersonAdd,
    color: 'primary.main',
  },
  post_like: {
    icon: ThumbUp,
    color: 'error.main',
  },
  follow: {
    icon: Person,
    color: 'success.main',
  },
  comment: {
    icon: CommentIcon,
    color: 'secondary.main',
  },
  memory: {
    icon: Memory,
    color: 'warning.main',
  },
  photo_upload: {
    icon: PhotoLibrary,
    color: 'info.main',
  },
  video_upload: {
    icon: VideoLibrary,
    color: 'info.main',
  },
  post: {
    icon: CommentIcon,
    color: 'secondary.main',
  },
  friend_suggestion: {
    icon: GroupAdd,
    color: 'success.main',
  },
  default: {
    icon: NotificationsIcon,
    color: 'text.disabled',
  },
};

const NotificationText = styled(Typography)({
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
});

const TimeText = styled(Typography)(({ theme }) => ({
  fontSize: '0.75rem',
  color: theme.palette.text.secondary,
}));

const NotificationPanel = ({ open, onClose }) => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const { items = [], status } = useSelector((state) => state.notifications);
  const [activeTab, setActiveTab] = useState(NOTIFICATION_TYPES.ALL);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (open) {
      const loadNotifications = async () => {
        try {
          setError(null);
          const result = await dispatch(fetchNotifications({ page: 1, size: 50 })).unwrap();
          if (!result?.notifications) {
            throw new Error('Invalid response structure');
          }
        } catch (error) {
          setError(error.message || 'Failed to load notifications');
          dispatch(
            showSnackbar({
              message: 'Failed to load notifications',
              severity: 'error',
            })
          );
        }
      };
      
      loadNotifications();
    }
  }, [open, dispatch]);

  const { newNotifications, olderNotifications } = useMemo(() => {
    const now = Date.now();
    const cutoffTime = now - ONE_DAY_MS;

    const filteredNotifications = activeTab === NOTIFICATION_TYPES.UNREAD 
      ? items.filter(n => !n.isRead) 
      : [...items];

    const newNotifs = filteredNotifications.filter(
      n => !n.isRead && n.createdAt && new Date(n.createdAt) > cutoffTime
    );
    
    const olderNotifs = filteredNotifications.filter(
      n => !newNotifs.includes(n)
    );

    return { newNotifications: newNotifs, olderNotifications: olderNotifs };
  }, [activeTab, items]);

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
    return `${Math.floor(diffInSeconds / 86400)}d`;
  };

  const handleMarkAsRead = async (id) => {
    try {
      await dispatch(markAsRead(id)).unwrap();
    } catch (error) {
      dispatch(
        showSnackbar({
          message: 'Failed to mark notification as read',
          severity: 'error',
        })
      );
    }
  };

  const handleMarkAllAsRead = async () => {
    if (items.some(n => !n.isRead)) {
      try {
        await dispatch(markAllAsRead()).unwrap();
        dispatch(
          showSnackbar({
            message: 'All notifications marked as read',
            severity: 'success',
          })
        );
      } catch (error) {
        dispatch(
          showSnackbar({
            message: 'Failed to mark all notifications as read',
            severity: 'error',
          })
        );
      }
    }
  };

  const handleFriendRequestAction = async (notification, action) => {
    try {
      const friendshipId = notification.metadata?.friendshipId;
      if (!friendshipId) throw new Error('Missing friendship ID');

      const result = await dispatch(
        action === 'accept' 
          ? acceptFriendRequest(friendshipId)
          : rejectFriendRequest(friendshipId)
      ).unwrap();

      if (result?.friendship?.id || result?.success) {
        await dispatch(deleteNotification(notification.id));
        dispatch(
          showSnackbar({
            message: result.message || 
              (action === 'accept' ? 'Friend request accepted' : 'Friend request rejected'),
            severity: 'success',
          })
        );
        dispatch(fetchNotifications());
      } else {
        throw new Error(result?.message || 'Action failed');
      }
    } catch (error) {
      dispatch(
        showSnackbar({
          message: error.message,
          severity: 'error',
        })
      );
    }
  };

  const renderNotificationIcon = (type) => {
    const { icon: Icon, color } = NOTIFICATION_ICONS[type] || NOTIFICATION_ICONS.default;
    return <Icon fontSize="small" sx={{ color: theme.palette[color] }} />;
  };

  const renderNotificationContent = (notification) => {
    const { type, metadata = {} } = notification;
    
    const senderName = metadata.senderName || 'Someone';
    const message = metadata.message || '';
    const content = metadata.content || '';

    switch (type) {
      case 'friend_request':
        return (
          <>
            <Typography variant="body2" fontWeight={600}>
              {senderName} {message || 'sent you a friend request'}
            </Typography>
          </>
        );
      case 'friend_request_accepted':
        return (
          <>
            <Typography variant="body2" fontWeight={600}>
              {senderName} {message || 'accepted your friend request'}
            </Typography>
          </>
        );
      case 'friend_request_rejected':
        return (
          <>
            <Typography variant="body2" fontWeight={600}>
              {senderName} {message || 'declined your friend request'}
            </Typography>
          </>
        );
      case 'memory':
        return (
          <>
            <Typography variant="body2" fontWeight={600}>
              Memory from today
            </Typography>
            <NotificationText variant="body2">
              {message || 'You have a memory to look back on today'}
            </NotificationText>
          </>
        );
      case 'photo_upload':
        return (
          <>
            <Typography variant="body2" fontWeight={600}>
              {senderName} added {metadata.count || 'some'} new photos
            </Typography>
            <NotificationText variant="body2">
              {content || 'New photos added to album'}
            </NotificationText>
          </>
        );
      case 'video_upload':
        return (
          <>
            <Typography variant="body2" fontWeight={600}>
              {senderName} added {metadata.count || 'some'} new videos
            </Typography>
            <NotificationText variant="body2">
              {content || 'New videos added'}
            </NotificationText>
          </>
        );
      case 'post':
        return (
          <>
            <Typography variant="body2" fontWeight={600}>
              {senderName} made a post you haven't seen
            </Typography>
            <NotificationText variant="body2">
              {content || 'New post from ' + senderName}
            </NotificationText>
            {metadata.responses && (
              <TimeText>
                {metadata.responses} Responses • {metadata.comments} Comments
              </TimeText>
            )}
          </>
        );
      case 'friend_suggestion':
        return (
          <>
            <Typography variant="body2" fontWeight={600}>
              You have a new friend suggestion
            </Typography>
            <NotificationText variant="body2">
              {senderName || content}
            </NotificationText>
          </>
        );
      default:
        return (
          <>
            <Typography variant="body2" fontWeight={600}>
              {senderName} {message}
            </Typography>
            {content && (
              <NotificationText variant="body2">
                {content}
              </NotificationText>
            )}
          </>
        );
    }
  };

  const renderNotificationItem = (notification) => {
    const { 
      id, 
      type, 
      isRead, 
      createdAt, 
      metadata = {}, 
      sender 
    } = notification;
    
    const senderData = {
      id: sender?.id || metadata.senderId,
      name: sender ? `${sender.firstName} ${sender.lastName}` : 
                  metadata.senderName || 'Someone',
      avatar: sender?.profileImage || metadata.avatarUrl || '/default-avatar.png',
      username: sender?.username || metadata.username
    };

    const isFriendRequest = type === 'friend_request';
    const isActionable = !isRead && !isFriendRequest;

    return (
      <motion.div 
        key={id} 
        whileHover={{ scale: 1.02 }} 
        transition={{ duration: 0.2 }}
        data-testid={`notification-${id}`}
      >
        <ListItem
          sx={{
            p: 1.5,
            mb: 1,
            bgcolor: isRead ? 'background.paper' : 'action.selected',
            borderRadius: 1,
            mx: 1,
            alignItems: 'flex-start',
            position: 'relative',
            '&:hover .notification-actions': {
              visibility: 'visible'
            }
          }}
          aria-labelledby={`notification-${id}-text`}
        >
          <ListItemAvatar>
            <Badge
              color="primary"
              variant={isRead ? undefined : 'dot'}
              overlap="circular"
              invisible={isRead}
            >
              <Avatar
                src={senderData.avatar}
                alt={senderData.name}
                component={senderData.id ? Link : 'div'}
                to={senderData.id ? `/profile/${senderData.id}` : '#'}
                sx={{ 
                  width: 48, 
                  height: 48,
                  '&:hover': {
                    transform: 'scale(1.1)',
                    transition: 'transform 0.2s ease'
                  }
                }}
              />
            </Badge>
          </ListItemAvatar>

          <Box sx={{ 
            flex: 1, 
            overflow: 'hidden',
            minWidth: 0
          }}>
            {renderNotificationContent(notification)}
            <TimeText>
              {formatTimeAgo(createdAt)}
            </TimeText>
          </Box>

          <Box 
            className="notification-actions"
            sx={{
              visibility: isActionable ? 'visible' : 'hidden',
              display: 'flex',
              gap: 1,
              alignSelf: 'center'
            }}
          >
            {isActionable && (
              <Tooltip title="Mark as read">
                <IconButton 
                  size="small" 
                  onClick={() => handleMarkAsRead(id)}
                  aria-label="Mark as read"
                  color="inherit"
                >
                  <Done fontSize="small" />
                </IconButton>
              </Tooltip>
            )}

            {isFriendRequest && (
              <>
                <Tooltip title="Accept request">
                  <IconButton
                    size="small"
                    color="success"
                    onClick={() => handleFriendRequestAction(notification, 'accept')}
                    aria-label="Accept friend request"
                  >
                    <Check fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Decline request">
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleFriendRequestAction(notification, 'reject')}
                    aria-label="Reject friend request"
                  >
                    <Close fontSize="small" />
                  </IconButton>
                </Tooltip>
              </>
            )}
          </Box>
        </ListItem>
        <Divider component="li" variant="inset" />
      </motion.div>
    );
  };

  const renderEmptyState = () => (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      height="100%"
      p={4}
    >
      <NotificationsIcon sx={{ fontSize: 60, color: 'text.disabled' }} />
      <Typography variant="h6" mt={2}>
        No notifications
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {activeTab === NOTIFICATION_TYPES.UNREAD
          ? "You're all caught up!"
          : 'You will see notifications here when they arrive.'}
      </Typography>
    </Box>
  );

  const renderError = () => (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      height="100%"
      p={4}
    >
      <Typography color="error" variant="h6">
        Failed to load notifications
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {error}
      </Typography>
      <Button 
        variant="contained" 
        color="primary" 
        onClick={() => dispatch(fetchNotifications({ page: 1, size: 50 }))}
        sx={{ mt: 2 }}
      >
        Retry
      </Button>
    </Box>
  );

  const StickySection = ({ title }) => (
    <Box
      sx={{
        px: 2,
        py: 1,
        bgcolor: 'background.default',
        position: 'sticky',
        top: 0,
        zIndex: 1,
        borderBottom: `1px solid ${theme.palette.divider}`,
      }}
    >
      <Typography variant="subtitle2" fontWeight="bold">
        {title}
      </Typography>
    </Box>
  );

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
        },
      }}
    >
      <Box display="flex" flexDirection="column" height="100%" bgcolor="background.paper">
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          p={2}
          borderBottom={`1px solid ${theme.palette.divider}`}
        >
          <Typography variant="h6" fontWeight="bold">
            Notifications
          </Typography>
          <Button
            size="small"
            onClick={handleMarkAllAsRead}
            disabled={items.every(n => n.isRead)}
            startIcon={<Done />}
            aria-label="Mark all notifications as read"
          >
            Mark all as read
          </Button>
        </Box>

        <Tabs 
          value={activeTab} 
          onChange={(_, newValue) => setActiveTab(newValue)} 
          variant="fullWidth"
          aria-label="Notification tabs"
          sx={{ borderBottom: `1px solid ${theme.palette.divider}` }}
        >
          <Tab 
            label="All" 
            aria-controls="notification-tabpanel-all" 
            id="notification-tab-all"
          />
          <Tab 
            label={`Unread (${items.filter(n => !n.isRead).length})`} 
            aria-controls="notification-tabpanel-unread" 
            id="notification-tab-unread"
          />
        </Tabs>

        {error ? renderError() : status === 'loading' ? (
          <Box flex={1} display="flex" alignItems="center" justifyContent="center">
            <CircularProgress aria-label="Loading notifications" />
          </Box>
        ) : (
          <Box
            flex={1}
            overflow="auto"
            sx={{
              '&::-webkit-scrollbar': { width: 6 },
              '&::-webkit-scrollbar-thumb': { bgcolor: 'rgba(0,0,0,0.2)' },
            }}
          >
            {newNotifications.length > 0 && (
              <>
                <StickySection title="New" />
                <List aria-label="New notifications" disablePadding>
                  {newNotifications.map(notification => renderNotificationItem(notification))}
                </List>
              </>
            )}
            {olderNotifications.length > 0 && (
              <>
                <StickySection title="Earlier" />
                <List aria-label="Earlier notifications" disablePadding>
                  {olderNotifications.map(notification => renderNotificationItem(notification))}
                </List>
              </>
            )}
            {newNotifications.length === 0 && olderNotifications.length === 0 && renderEmptyState()}
          </Box>
        )}
      </Box>
    </Drawer>
  );
};

export default NotificationPanel;

//! test with button

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
//   CircularProgress,
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
//   useTheme,
// } from '@mui/material';
// import { motion } from 'framer-motion';
// import { useEffect, useMemo, useState } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { Link } from 'react-router-dom';
// import {
//   acceptFriendRequest,
//   rejectFriendRequest,
// } from '../friendship/friendshipSlice';
// import { showSnackbar } from '../snackbar/snackbarSlice';
// import {
//   deleteNotification,
//   fetchNotifications,
//   markAllAsRead,
//   markAsRead,
// } from './notificationSlice';

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

// const NotificationPanel = ({ open, onClose }) => {
//   const theme = useTheme();
//   const dispatch = useDispatch();
//   const { items = [], status } = useSelector((state) => state.notifications);
//   const [activeTab, setActiveTab] = useState(NOTIFICATION_TYPES.ALL);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     if (open) {
//       const loadNotifications = async () => {
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
//     try {
//       await dispatch(markAsRead(id)).unwrap();
//     } catch (error) {
//       dispatch(
//         showSnackbar({
//           message: 'Failed to mark notification as read',
//           severity: 'error',
//         })
//       );
//     }
//   };

//   const handleMarkAllAsRead = async () => {
//     if (items.some(n => !n.isRead)) {
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
//       }
//     }
//   };

//   const handleFriendRequestAction = async (notification, action) => {
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
//               visibility: isActionable || isFriendRequest ? 'visible' : 'hidden',
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
//               <Box display="flex" gap={1}>
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
//               </Box>
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
//             disabled={items.every(n => n.isRead)}
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

//         {error ? renderError() : status === 'loading' ? (
//           <Box flex={1} display="flex" alignItems="center" justifyContent="center">
//             <CircularProgress aria-label="Loading notifications" />
//           </Box>
//         ) : (
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

//! final
// import {
//   Check,
//   Close,
//   Comment as CommentIcon,
//   Done,
//   Notifications as NotificationsIcon,
//   Person,
//   PersonAdd,
//   ThumbUp,
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
//   Typography,
//   useTheme,
// } from '@mui/material';
// import { motion } from 'framer-motion';
// import { useEffect, useMemo, useState } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { Link } from 'react-router-dom';
// import {
//   acceptFriendRequest,
//   rejectFriendRequest,
// } from '../friendship/friendshipSlice';
// import { showSnackbar } from '../snackbar/snackbarSlice';
// import {
//   deleteNotification,
//   fetchNotifications,
//   markAllAsRead,
//   markAsRead,
// } from './notificationSlice';

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
//   default: {
//     icon: NotificationsIcon,
//     color: 'text.disabled',
//   },
// };

// const NotificationPanel = ({ open, onClose }) => {
//   const theme = useTheme();
//   const dispatch = useDispatch();
//   const { items = [], status } = useSelector((state) => state.notifications);
//   const [activeTab, setActiveTab] = useState(NOTIFICATION_TYPES.ALL);

//   useEffect(() => {
//     if (open) {
//       const loadNotifications = async () => {
//         try {
//           await dispatch(fetchNotifications({ page: 1, size: 50 })).unwrap();
//         } catch (error) {
//           dispatch(
//             showSnackbar({
//               message: 'Failed to load notifications',
//               severity: 'error',
//             })
//           );
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

//   const handleMarkAsRead = async (id) => {
//     try {
//       await dispatch(markAsRead(id)).unwrap();
//     } catch (error) {
//       dispatch(
//         showSnackbar({
//           message: 'Failed to mark notification as read',
//           severity: 'error',
//         })
//       );
//     }
//   };

//   const handleMarkAllAsRead = async () => {
//     if (items.some(n => !n.isRead)) {
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
//       }
//     }
//   };

//   const handleFriendRequestAction = async (notification, action) => {
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
//     }
//   };

//   const renderNotificationIcon = (type) => {
//     const { icon: Icon, color } = NOTIFICATION_ICONS[type] || NOTIFICATION_ICONS.default;
//     return <Icon fontSize="small" sx={{ color: theme.palette[color] }} />;
//   };

//   const renderNotificationItem = (notification) => {
//     const { id, type, isRead, createdAt, metadata = {} } = notification;
//     const { senderId, senderName = 'Unknown User', avatarUrl, message = '' } = metadata;

//     return (
//       <motion.div key={id} whileHover={{ scale: 1.02 }} transition={{ duration: 0.3 }}>
//         <ListItem
//           sx={{
//             p: 1.5,
//             mb: 1,
//             bgcolor: isRead ? 'background.paper' : 'action.selected',
//             borderRadius: 2,
//             mx: 1,
//           }}
//         >
//           <ListItemAvatar>
//             <Badge
//               color="primary"
//               variant={isRead ? undefined : 'dot'}
//               overlap="circular"
//             >
//               <Avatar
//                 src={avatarUrl || '/default-avatar.png'}
//                 alt={senderName}
//                 component={senderId ? Link : 'div'}
//                 to={senderId ? `/profile/${senderId}` : '#'}
//                 sx={{ width: 48, height: 48 }}
//               />
//             </Badge>
//           </ListItemAvatar>

//           <ListItemText
//             primary={
//               <Box display="flex" alignItems="center">
//                 {renderNotificationIcon(type)}
//                 <Typography
//                   component={senderId ? Link : 'span'}
//                   to={senderId ? `/profile/${senderId}` : '#'}
//                   variant="body1"
//                   sx={{
//                     ml: 1,
//                     fontWeight: isRead ? 400 : 600,
//                     textDecoration: 'none',
//                     color: 'inherit',
//                     '&:hover': { textDecoration: senderId ? 'underline' : 'none' },
//                   }}
//                 >
//                   {senderName} {message}
//                 </Typography>
//               </Box>
//             }
//             secondary={
//               <Typography variant="caption" color="text.secondary">
//                 {createdAt ? new Date(createdAt).toLocaleString() : 'Unknown date'}
//               </Typography>
//             }
//             sx={{ ml: 1 }}
//           />

//           {!isRead && type !== 'friend_request' && (
//             <IconButton 
//               size="small" 
//               onClick={() => handleMarkAsRead(id)} 
//               title="Mark as read"
//               aria-label="Mark as read"
//             >
//               <Done fontSize="small" />
//             </IconButton>
//           )}

//           {type === 'friend_request' && (
//             <Box display="flex" gap={1}>
//               <Button
//                 size="small"
//                 variant="contained"
//                 color="success"
//                 startIcon={<Check />}
//                 onClick={() => handleFriendRequestAction(notification, 'accept')}
//                 aria-label="Accept friend request"
//               >
//                 Accept
//               </Button>
//               <Button
//                 size="small"
//                 variant="outlined"
//                 color="error"
//                 startIcon={<Close />}
//                 onClick={() => handleFriendRequestAction(notification, 'reject')}
//                 aria-label="Reject friend request"
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

//   const StickySection = ({ title }) => (
//     <Box
//       sx={{
//         px: 2,
//         py: 1,
//         bgcolor: 'action.hover',
//         position: 'sticky',
//         top: 0,
//         zIndex: 1,
//       }}
//     >
//       <Typography variant="subtitle2" fontWeight="bold">
//         {title}
//       </Typography>
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
//             disabled={items.every(n => n.isRead)}
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

//         {status === 'loading' ? (
//           <Box flex={1} display="flex" alignItems="center" justifyContent="center">
//             <CircularProgress aria-label="Loading notifications" />
//           </Box>
//         ) : (
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
//                 <List aria-label="New notifications">
//                   {newNotifications.map(renderNotificationItem)}
//                 </List>
//               </>
//             )}
//             {olderNotifications.length > 0 && (
//               <>
//                 <StickySection title="Earlier" />
//                 <List aria-label="Earlier notifications">
//                   {olderNotifications.map(renderNotificationItem)}
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































