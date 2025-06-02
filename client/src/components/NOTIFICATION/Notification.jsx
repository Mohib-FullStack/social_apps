import {
  Comment as CommentIcon,
  PersonAdd as FriendRequestIcon,
  Favorite as LikeIcon,
  Check as MarkAsReadIcon,
  Mail as MessageIcon,
  MoreHoriz as MoreIcon,
  Notifications as NotificationsIcon
} from '@mui/icons-material';
import {
  Avatar,
  Badge,
  Box,
  Button,
  Chip,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Menu,
  Typography
} from '@mui/material';
import { formatDistanceToNow } from 'date-fns';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  deleteNotification,
  fetchNotifications,
  fetchUnreadCount,
  markAsRead
} from '../../features/notification/notificationSlice';
import NotificationSkeleton from './NotificationSkeleton';

const NotificationItem = ({ 
  notification, 
  getNotificationIcon, 
  getNotificationContent,
  handleDeleteNotification,
  expanded,
  toggleExpand
}) => {
  const content = getNotificationContent(notification);

  return (
    <ListItem
      button
      component={Link}
      to={getNotificationLink(notification)}
      sx={{
        px: 2,
        py: 1.5,
        alignItems: 'flex-start',
        bgcolor: !notification.isRead ? 'action.hover' : 'background.paper',
        borderLeft: !notification.isRead ? '3px solid' : 'none',
        borderLeftColor: 'primary.main',
        '&:hover': {
          bgcolor: !notification.isRead ? 'action.selected' : 'action.hover'
        }
      }}
    >
      <ListItemAvatar sx={{ minWidth: 40, mt: 0.5 }}>
        <Avatar 
          src={notification.sender?.profileImage} 
          sx={{ width: 40, height: 40 }}
        />
      </ListItemAvatar>
      <ListItemText
        primary={
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {content.primary}
          </Typography>
        }
        secondary={
          <>
            <Typography 
              variant="body2" 
              color="text.secondary" 
              sx={{ display: 'block', mt: 0.5 }}
            >
              {content.secondary}
            </Typography>
            {content.media}
            {content.action}
          </>
        }
        sx={{ my: 0 }}
      />
      <IconButton 
        size="small" 
        sx={{ ml: 1 }}
        onClick={(e) => handleDeleteNotification(notification.id, e)}
      >
        <MoreIcon fontSize="small" />
      </IconButton>
    </ListItem>
  );
};

const getNotificationLink = (notification) => {
  switch (notification.type) {
    case 'friend_request': return '/friend-requests';
    case 'post_like':
    case 'comment': return `/posts/${notification.metadata?.postId}`;
    case 'message': return `/messages/${notification.metadata?.chatId}`;
    default: return '/notifications';
  }
};

const Notification = () => {
  const dispatch = useDispatch();
  const { notifications = [], unreadCount = 0, status } = useSelector(state => state.notification);
  const [anchorEl, setAnchorEl] = useState(null);
  const [expandedNotification, setExpandedNotification] = useState(null);
  const open = Boolean(anchorEl);

  useEffect(() => {
    if (open) {
      dispatch(fetchNotifications({ page: 1 }));
    }
    // Refresh unread count when menu opens/closes
    dispatch(fetchUnreadCount());
  }, [dispatch, open]);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setExpandedNotification(null);
  };

  const handleMarkAsRead = (notificationId) => {
    dispatch(markAsRead([notificationId]));
  };

  const handleMarkAllAsRead = () => {
    dispatch(markAsRead([]));
  };

  const handleDeleteNotification = (notificationId, e) => {
    e.stopPropagation();
    e.preventDefault();
    dispatch(deleteNotification(notificationId));
  };

  const toggleExpandNotification = (notificationId, e) => {
    e.stopPropagation();
    e.preventDefault();
    setExpandedNotification(expandedNotification === notificationId ? null : notificationId);
  };

  const getNotificationIcon = (type) => {
    const iconProps = { sx: { fontSize: 20 } };
    switch (type) {
      case 'friend_request': return <FriendRequestIcon color="primary" {...iconProps} />;
      case 'friend_request_accepted': return <FriendRequestIcon color="success" {...iconProps} />;
      case 'post_like': return <LikeIcon color="error" {...iconProps} />;
      case 'comment': return <CommentIcon color="info" {...iconProps} />;
      case 'message': return <MessageIcon color="secondary" {...iconProps} />;
      default: return <NotificationsIcon {...iconProps} />;
    }
  };

  const getNotificationContent = (notification) => {
    const senderName = `${notification.sender?.firstName} ${notification.sender?.lastName}`;
    const timeAgo = formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true });
    
    switch (notification.type) {
      case 'friend_request':
        return {
          primary: `${senderName} sent you a friend request`,
          secondary: timeAgo,
          action: (
            <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
              <Button variant="contained" size="small" color="primary">
                Confirm
              </Button>
              <Button variant="outlined" size="small">
                Delete
              </Button>
            </Box>
          )
        };
      case 'friend_request_accepted':
        return {
          primary: `${senderName} accepted your friend request`,
          secondary: timeAgo,
          action: (
            <Button variant="text" size="small" sx={{ mt: 1 }}>
              Message
            </Button>
          )
        };
      case 'post_like':
        return {
          primary: `${senderName} liked your post`,
          secondary: `${timeAgo} · ${notification.metadata?.postContent?.slice(0, 50)}${notification.metadata?.postContent?.length > 50 ? '...' : ''}`,
          media: notification.metadata?.postImage && (
            <Box sx={{ mt: 1, borderRadius: 1, overflow: 'hidden' }}>
              <img 
                src={notification.metadata.postImage} 
                alt="Post" 
                style={{ width: '100%', maxHeight: 150, objectFit: 'cover' }} 
              />
            </Box>
          )
        };
      case 'comment':
        return {
          primary: `${senderName} commented on your post`,
          secondary: `${timeAgo} · ${notification.metadata?.commentContent}`,
          media: notification.metadata?.postImage && (
            <Box sx={{ mt: 1, borderRadius: 1, overflow: 'hidden' }}>
              <img 
                src={notification.metadata.postImage} 
                alt="Post" 
                style={{ width: '100%', maxHeight: 150, objectFit: 'cover' }} 
              />
            </Box>
          )
        };
      case 'message':
        return {
          primary: `New message from ${senderName}`,
          secondary: `${timeAgo} · ${notification.metadata?.messageContent?.slice(0, 100)}${notification.metadata?.messageContent?.length > 100 ? '...' : ''}`
        };
      default:
        return {
          primary: notification.metadata?.message || 'New notification',
          secondary: timeAgo
        };
    }
  };

  const groupNotificationsByDate = (notifications = []) => {
    const now = new Date();
    const today = new Date(now.setHours(0, 0, 0, 0));
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const groups = {
      new: [],
      today: [],
      yesterday: [],
      earlier: []
    };

    notifications.forEach(notification => {
      const notificationDate = new Date(notification.createdAt);
      
      if (!notification.isRead) {
        groups.new.push(notification);
      } else if (notificationDate >= today) {
        groups.today.push(notification);
      } else if (notificationDate >= yesterday) {
        groups.yesterday.push(notification);
      } else {
        groups.earlier.push(notification);
      }
    });

    return groups;
  };

  const notificationGroups = groupNotificationsByDate(notifications);

  return (
    <div>
      <IconButton
        color="inherit"
        aria-label="notifications"
        onClick={handleClick}
        sx={{ position: 'relative' }}
      >
        <Badge
          badgeContent={unreadCount}
          color="error"
          max={9}
          invisible={unreadCount === 0}
        >
          <NotificationsIcon />
        </Badge>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          sx: {
            width: 400,
            maxWidth: '100%',
            maxHeight: '80vh',
            overflow: 'auto',
            borderRadius: 2,
            boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)'
          }
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        MenuListProps={{
          sx: { py: 0 }
        }}
      >
        <Box sx={{ p: 2, pb: 1.5 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>Notifications</Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {unreadCount > 0 && (
                <Button
                  size="small"
                  startIcon={<MarkAsReadIcon />}
                  onClick={handleMarkAllAsRead}
                  sx={{ textTransform: 'none' }}
                >
                  Mark all as read
                </Button>
              )}
              <IconButton size="small">
                <MoreIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>
        </Box>

        <Divider sx={{ my: 0 }} />

        {status === 'loading' ? (
          <Box sx={{ p: 2 }}>
            {[...Array(3)].map((_, i) => (
              <NotificationSkeleton key={i} />
            ))}
          </Box>
        ) : notifications.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              No notifications
            </Typography>
          </Box>
        ) : (
          <List sx={{ py: 0 }}>
            {/* New Notifications */}
            {notificationGroups.new.length > 0 && (
              <>
                <Box sx={{ px: 2, pt: 1.5, pb: 1 }}>
                  <Chip label="New" size="small" color="primary" />
                </Box>
                {notificationGroups.new.map(notification => (
                  <NotificationItem 
                    key={notification.id}
                    notification={notification}
                    getNotificationIcon={getNotificationIcon}
                    getNotificationContent={getNotificationContent}
                    handleDeleteNotification={handleDeleteNotification}
                    expanded={expandedNotification === notification.id}
                    toggleExpand={toggleExpandNotification}
                  />
                ))}
              </>
            )}

            {/* Today */}
            {notificationGroups.today.length > 0 && (
              <>
                <Box sx={{ px: 2, pt: 1.5, pb: 1 }}>
                  <Chip label="Today" size="small" />
                </Box>
                {notificationGroups.today.map(notification => (
                  <NotificationItem 
                    key={notification.id}
                    notification={notification}
                    getNotificationIcon={getNotificationIcon}
                    getNotificationContent={getNotificationContent}
                    handleDeleteNotification={handleDeleteNotification}
                    expanded={expandedNotification === notification.id}
                    toggleExpand={toggleExpandNotification}
                  />
                ))}
              </>
            )}

            {/* Yesterday */}
            {notificationGroups.yesterday.length > 0 && (
              <>
                <Box sx={{ px: 2, pt: 1.5, pb: 1 }}>
                  <Chip label="Yesterday" size="small" />
                </Box>
                {notificationGroups.yesterday.map(notification => (
                  <NotificationItem 
                    key={notification.id}
                    notification={notification}
                    getNotificationIcon={getNotificationIcon}
                    getNotificationContent={getNotificationContent}
                    handleDeleteNotification={handleDeleteNotification}
                    expanded={expandedNotification === notification.id}
                    toggleExpand={toggleExpandNotification}
                  />
                ))}
              </>
            )}

            {/* Earlier */}
            {notificationGroups.earlier.length > 0 && (
              <>
                <Box sx={{ px: 2, pt: 1.5, pb: 1 }}>
                  <Chip label="Earlier" size="small" />
                </Box>
                {notificationGroups.earlier.map(notification => (
                  <NotificationItem 
                    key={notification.id}
                    notification={notification}
                    getNotificationIcon={getNotificationIcon}
                    getNotificationContent={getNotificationContent}
                    handleDeleteNotification={handleDeleteNotification}
                    expanded={expandedNotification === notification.id}
                    toggleExpand={toggleExpandNotification}
                  />
                ))}
              </>
            )}
          </List>
        )}

        <Divider sx={{ my: 0 }} />

        <Box sx={{ p: 1.5, textAlign: 'center' }}>
          <Button 
            component={Link}
            to="/notifications"
            onClick={handleClose}
            size="small"
            sx={{ textTransform: 'none' }}
          >
            See all notifications
          </Button>
        </Box>
      </Menu>
    </div>
  );
};

export default Notification;


