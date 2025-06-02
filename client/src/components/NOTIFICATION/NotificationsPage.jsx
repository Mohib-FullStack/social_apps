import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Divider,
  CircularProgress,
  Button
} from '@mui/material';
import { Refresh as RefreshIcon } from '@mui/icons-material';
import {
  fetchNotifications,
  selectAllNotifications,
  selectNotificationStatus,
  selectNotificationError
} from '../../features/notification/notificationSlice';

const NotificationsPage = () => {
  const dispatch = useDispatch();
  const notifications = useSelector(selectAllNotifications);
  const status = useSelector(selectNotificationStatus);
  const error = useSelector(selectNotificationError);

  useEffect(() => {
    dispatch(fetchNotifications({ page: 1, limit: 20 }));
  }, [dispatch]);

  if (status === 'loading') {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (status === 'failed') {
    return (
      <Box sx={{ p: 2 }}>
        <Typography color="error">{error}</Typography>
        <Button
          variant="contained"
          startIcon={<RefreshIcon />}
          onClick={() => dispatch(fetchNotifications({ page: 1, limit: 20 }))}
        >
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 2 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>Notifications</Typography>
      
      {notifications?.length > 0 ? (
        <List>
          {notifications.map((notification) => (
            <React.Fragment key={notification.id}>
              <ListItem alignItems="flex-start">
                <ListItemAvatar>
                  <Avatar src={notification.sender?.profileImage} />
                </ListItemAvatar>
                <ListItemText
                  primary={notification.message || 'New notification'}
                  secondary={
                    new Date(notification.createdAt).toLocaleString()
                  }
                />
              </ListItem>
              <Divider variant="inset" component="li" />
            </React.Fragment>
          ))}
        </List>
      ) : (
        <Box sx={{ textAlign: 'center', p: 4 }}>
          <Typography variant="h6">No notifications yet</Typography>
          <Typography sx={{ mt: 1 }}>
            When you receive notifications, they'll appear here
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default NotificationsPage;