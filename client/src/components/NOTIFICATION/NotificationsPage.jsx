import React, { useEffect } from 'react';
import {
  Box,
  Typography,
  List,
  Divider,
  CircularProgress,
  Button,
  Avatar,
  ListItem,
  ListItemAvatar,
  ListItemText,
  IconButton,
} from '@mui/material';
import { Refresh as RefreshIcon, MoreHoriz as MoreIcon } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { formatDistanceToNow } from 'date-fns';
import {
  fetchNotifications,
  markAsRead,
  deleteNotification,
  selectAllNotifications,
  selectNotificationStatus,
  selectNotificationError,
  selectNotificationPagination,
} from '../../features/notification/notificationSlice';

const groupNotifications = (notifications = []) => {
  if (!Array.isArray(notifications)) {
    console.error('Notifications is not an array:', notifications);
    return {
      new: [],
      today: [],
      yesterday: [],
      earlier: []
    };
  }

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

const NotificationGroup = ({ group, items, onDelete }) => {
  if (!items || items.length === 0) return null;

  return (
    <>
      <Typography variant="subtitle1" sx={{ px: 2, pt: 1 }}>
        {group.charAt(0).toUpperCase() + group.slice(1)}
      </Typography>
      {items.map(notification => {
        const senderName = notification.sender 
          ? `${notification.sender.firstName} ${notification.sender.lastName}`
          : 'Someone';
        const timeAgo = formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true });

        return (
          <ListItem
            key={notification.id}
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
                <Typography variant="subtitle2" sx={{ fontWeight: 500 }}>
                  {senderName} {notification.type?.replace(/_/g, ' ') || 'Notification'}
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
              onClick={() => onDelete(notification.id)}
              sx={{ ml: 1 }}
              aria-label="Delete notification"
            >
              <MoreIcon fontSize="small" />
            </IconButton>
          </ListItem>
        );
      })}
      <Divider sx={{ my: 2 }} />
    </>
  );
};

// NotificationsPage.jsx
const NotificationsPage = () => {
  const dispatch = useDispatch();
  const notifications = useSelector(selectAllNotifications) || [];  // Double safety
  const status = useSelector(selectNotificationStatus);
  const error = useSelector(selectNotificationError);
  const pagination = useSelector(selectNotificationPagination);

  useEffect(() => {
    dispatch(fetchNotifications({ page: 1 }));
  }, [dispatch]);

  const handleRetry = () => dispatch(fetchNotifications({ page: 1 }));
  const handleMarkAsRead = (id) => dispatch(markAsRead(id));
  const handleDelete = (id) => dispatch(deleteNotification(id));

  const notificationGroups = groupNotifications(notifications);
  const hasNotifications = notifications.length > 0;

  if (status === 'loading') {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (status === 'failed') {
    return (
      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <Typography color="error" variant="h6">
          {error || 'Failed to load notifications'}
        </Typography>
        <Button
          variant="contained"
          startIcon={<RefreshIcon />}
          sx={{ mt: 2 }}
          onClick={handleRetry}
        >
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Notifications</Typography>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={() => dispatch(fetchNotifications({ page: 1 }))}
          aria-label="Refresh notifications"
        >
          Refresh
        </Button>
      </Box>

      {!hasNotifications ? (
        <Box sx={{ textAlign: 'center', p: 5 }}>
          <Typography variant="h6">No notifications yet</Typography>
          <Typography sx={{ mt: 1, color: 'text.secondary' }}>
            When you receive notifications, they will appear here.
          </Typography>
        </Box>
      ) : (
        <List sx={{ mt: 2 }}>
          {Object.entries(notificationGroups).map(([group, items]) => (
            <NotificationGroup 
              key={group}
              group={group}
              items={items}
              onDelete={handleDelete}
            />
          ))}
        </List>
      )}
    </Box>
  );
};

export default NotificationsPage;