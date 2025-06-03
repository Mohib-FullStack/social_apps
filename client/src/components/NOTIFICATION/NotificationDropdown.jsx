import React, { useState, useEffect } from 'react';
import {
  Badge,
  Box,
  Button,
  Chip,
  Divider,
  IconButton,
  List,
  Menu,
  Typography,
  CircularProgress,
  Avatar,
  ListItem,
  ListItemAvatar,
  ListItemText,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Check as MarkAsReadIcon,
  MoreHoriz as MoreIcon,
  PersonAdd as FriendRequestIcon,
  Favorite as LikeIcon,
  Comment as CommentIcon,
  Mail as MessageIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

const NotificationDropdown = () => {
  const dispatch = useDispatch();
  const [anchorEl, setAnchorEl] = useState(null);
  
  // Use proper selectors from your slice
  const notifications = useSelector(state => state.notification.notifications || []);
  const unreadCount = useSelector(state => state.notification.unreadCount || 0);
  const status = useSelector(state => state.notification.status);
  
  const open = Boolean(anchorEl);

  useEffect(() => {
    if (open) {
      dispatch(fetchNotifications({ limit: 5 }));
      dispatch(fetchUnreadCount());
    }
  }, [dispatch, open]);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMarkAllAsRead = () => {
    if (unreadCount > 0) {
      dispatch(markAsRead([]));
    }
  };

  const handleDelete = (id, e) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(deleteNotification(id));
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

  const getNotificationLink = (notification) => {
    if (!notification) return '#';
    switch (notification.type) {
      case 'friend_request': return '/friend-requests';
      case 'post_like':
      case 'comment': return `/posts/${notification.metadata?.postId || ''}`;
      case 'message': return `/messages/${notification.metadata?.chatId || ''}`;
      default: return '/notifications';
    }
  };

  const groupNotifications = () => {
    const now = new Date();
    const today = new Date(now.setHours(0, 0, 0, 0));
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    return notifications.reduce((groups, notification) => {
      if (!notification?.createdAt) return groups;
      
      const date = new Date(notification.createdAt);
      
      if (!notification.isRead) groups.new.push(notification);
      else if (date >= today) groups.today.push(notification);
      else if (date >= yesterday) groups.yesterday.push(notification);
      else groups.earlier.push(notification);
      
      return groups;
    }, { new: [], today: [], yesterday: [], earlier: [] });
  };

  const notificationGroups = groupNotifications();

  return (
    <>
      <IconButton color="inherit" onClick={handleClick}>
        <Badge badgeContent={unreadCount} color="error" max={9}>
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
      >
        <Box sx={{ p: 2, pb: 1.5 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" sx={{ fontWeight: 600 }}>Notifications</Typography>
            <Box display="flex" gap={1}>
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
              <IconButton 
                size="small" 
                onClick={() => dispatch(fetchNotifications({ limit: 5 }))}
                disabled={status === 'loading'}
              >
                <RefreshIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>
        </Box>

        <Divider />

        {status === 'loading' ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress size={24} />
          </Box>
        ) : notifications.length === 0 ? (
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              No new notifications
            </Typography>
          </Box>
        ) : (
          <List sx={{ py: 0 }}>
            {Object.entries(notificationGroups).map(([group, items]) => (
              items.length > 0 && (
                <React.Fragment key={group}>
                  <Box sx={{ px: 2, pt: 1.5, pb: 1 }}>
                    <Chip 
                      label={group.charAt(0).toUpperCase() + group.slice(1)} 
                      size="small" 
                      color={group === 'new' ? 'primary' : 'default'} 
                    />
                  </Box>
                  {items.map(notification => {
                    const senderName = notification.sender 
                      ? `${notification.sender.firstName} ${notification.sender.lastName}`
                      : 'Someone';
                    const timeAgo = formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true });

                    return (
                      <ListItem
                        key={notification.id}
                        button
                        component={Link}
                        to={getNotificationLink(notification)}
                        onClick={() => !notification.isRead && dispatch(markAsRead([notification.id]))}
                        sx={{
                          px: 2,
                          py: 1.5,
                          alignItems: 'flex-start',
                          bgcolor: !notification.isRead ? 'action.hover' : 'background.paper',
                          borderLeft: !notification.isRead ? '3px solid' : 'none',
                          borderLeftColor: 'primary.main',
                        }}
                      >
                        <ListItemAvatar sx={{ minWidth: 40, mt: 0.5 }}>
                          <Avatar src={notification.sender?.profileImage} />
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {senderName} {notification.type?.replace(/_/g, ' ')}
                            </Typography>
                          }
                          secondary={
                            <>
                              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                {timeAgo}
                              </Typography>
                              {notification.metadata?.content && (
                                <Typography variant="body2" sx={{ mt: 0.5 }}>
                                  {notification.metadata.content}
                                </Typography>
                              )}
                            </>
                          }
                        />
                        <IconButton 
                          size="small" 
                          onClick={(e) => handleDelete(notification.id, e)}
                          sx={{ ml: 1 }}
                        >
                          <MoreIcon fontSize="small" />
                        </IconButton>
                      </ListItem>
                    );
                  })}
                </React.Fragment>
              )
            ))}
          </List>
        )}

        <Divider />

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
    </>
  );
};

export default NotificationDropdown;