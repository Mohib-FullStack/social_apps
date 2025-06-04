// src/components/NotificationPanel.jsx

import {
    Clear,
    Comment as CommentIcon,
    Done,
    Notifications as NotificationsIcon,
    Person,
    PersonAdd,
    ThumbUp,
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
    Typography,
} from '@mui/material';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import {
    acceptFriendRequest,
    fetchNotifications,
    markAsRead,
    rejectFriendRequest,
} from '../../features/notification/notificationSlice';

import { showSnackbar } from '../../features/snackbar/snackbarSlice';

const TAB_ALL = 0;
const TAB_UNREAD = 1;

const NotificationPanel = ({ open, onClose }) => {
  const dispatch = useDispatch();

  // Local state for which tab is selected:
  const [tabIndex, setTabIndex] = useState(TAB_ALL);

  // Pull notifications + status from Redux:
  const { items: allNotifications = [], status } = useSelector(
    (state) => state.notifications
  );

  // Whenever the drawer opens, fetch notifications (page=1, size=50).
  useEffect(() => {
    if (open) {
      dispatch(fetchNotifications({ page: 1, size: 50 }))
        .unwrap()
        .catch(() => {
          dispatch(
            showSnackbar({
              message: 'Failed to load notifications',
              severity: 'error',
            })
          );
        });
    }
  }, [dispatch, open]);

  // Filter notifications based on tabIndex:
  const unreadNotifications = allNotifications.filter((n) => !n.isRead);
  const displayedNotifications =
    tabIndex === TAB_UNREAD ? unreadNotifications : allNotifications;

  // Helper: pick an icon by type
  const renderIconByType = (type) => {
    switch (type) {
      case 'FRIEND_REQUEST':
        return <PersonAdd fontSize="small" sx={{ color: '#1976d2' }} />;
      case 'LIKE':
        return <ThumbUp fontSize="small" sx={{ color: '#d32f2f' }} />;
      case 'FOLLOW':
        return <Person fontSize="small" sx={{ color: '#388e3c' }} />;
      case 'COMMENT':
        return <CommentIcon fontSize="small" sx={{ color: '#6a1b9a' }} />;
      default:
        return <NotificationsIcon fontSize="small" sx={{ color: '#757575' }} />;
    }
  };

  // MARK AS READ
  const handleMarkAsRead = async (notificationId) => {
    try {
      await dispatch(markAsRead(notificationId)).unwrap();
      dispatch(
        showSnackbar({
          message: 'Notification marked as read',
          severity: 'success',
        })
      );
      // Because we filtered out isRead notifications, it will vanish from the list.
    } catch (err) {
      dispatch(
        showSnackbar({
          message: 'Failed to mark as read',
          severity: 'error',
        })
      );
    }
  };

  // ACCEPT FRIEND REQUEST
  const handleAccept = async (notificationId) => {
    try {
      await dispatch(acceptFriendRequest(notificationId)).unwrap();
      dispatch(
        showSnackbar({
          message: 'Friend request accepted',
          severity: 'success',
        })
      );
    } catch (err) {
      dispatch(
        showSnackbar({
          message: 'Failed to accept friend request',
          severity: 'error',
        })
      );
    }
  };

  // REJECT FRIEND REQUEST
  const handleReject = async (notificationId) => {
    try {
      await dispatch(rejectFriendRequest(notificationId)).unwrap();
      dispatch(
        showSnackbar({
          message: 'Friend request rejected',
          severity: 'info',
        })
      );
    } catch (err) {
      dispatch(
        showSnackbar({
          message: 'Failed to reject friend request',
          severity: 'error',
        })
      );
    }
  };

  // Handler for switching tabs
  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
  };

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box sx={{ width: 360, height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Box sx={{ p: 2, borderBottom: '1px solid #eee' }}>
          <Typography variant="h6">Notifications</Typography>
        </Box>

        {/* Tabs: All / Unread */}
        <Tabs
          value={tabIndex}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab label={`All (${allNotifications.length})`} />
          <Tab label={`Unread (${unreadNotifications.length})`} />
        </Tabs>

        {/* Loading spinner if we’re loading */}
        {status === 'loading' ? (
          <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CircularProgress />
          </Box>
        ) : (
          // List of notifications
          <List sx={{ flexGrow: 1, overflowY: 'auto', bgcolor: 'background.paper' }}>
            {displayedNotifications.length > 0 ? (
              displayedNotifications.map((notification) => {
                const {
                  id,
                  type,
                  metadata: { senderName, avatarUrl, message },
                  isRead,
                  createdAt,
                } = notification;

                return (
                  <motion.div
                    key={id}
                    whileHover={{ scale: 1.02, rotateX: 2 }}
                    whileTap={{ scale: 0.98 }}
                    style={{ originZ: 0 }}
                  >
                    <ListItem
                      alignItems="flex-start"
                      sx={{
                        p: 1.5,
                        mb: 1,
                        bgcolor: isRead ? '#ffffff' : '#e3f2fd', // light blue for unread
                        borderRadius: 2,
                        mx: 1,
                      }}
                    >
                      <ListItemAvatar>
                        <Badge
                          color="primary"
                          overlap="circular"
                          badgeContent={isRead ? null : ''}
                          variant={isRead ? undefined : 'dot'}
                          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                        >
                          <Avatar
                            src={avatarUrl}
                            alt={senderName}
                            sx={{ width: 40, height: 40 }}
                          />
                        </Badge>
                      </ListItemAvatar>

                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            {renderIconByType(type)}
                            <Typography
                              variant="body1"
                              component="span"
                              sx={{ ml: 1, fontWeight: isRead ? 400 : 600 }}
                            >
                              {senderName} {message}
                            </Typography>
                          </Box>
                        }
                        secondary={
                          <Typography
                            variant="caption"
                            color="text.secondary"
                          >
                            {new Date(createdAt).toLocaleString()}
                          </Typography>
                        }
                        sx={{ ml: 1 }}
                      />

                      {/* If this notification is UNREAD, show “Mark as read” icon */}
                      {!isRead && (
                        <IconButton
                          edge="end"
                          onClick={() => handleMarkAsRead(id)}
                          title="Mark as read"
                          size="small"
                          sx={{ mr: 1 }}
                        >
                          <Done fontSize="small" />
                        </IconButton>
                      )}

                      {/* If this is a FRIEND_REQUEST and still unread, show Accept/Reject */}
                      {type === 'FRIEND_REQUEST' && !isRead && (
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          <Button
                            size="small"
                            color="success"
                            variant="contained"
                            startIcon={<Done />}
                            onClick={() => handleAccept(id)}
                          >
                            Accept
                          </Button>
                          <Button
                            size="small"
                            color="error"
                            variant="outlined"
                            startIcon={<Clear />}
                            onClick={() => handleReject(id)}
                          >
                            Reject
                          </Button>
                        </Box>
                      )}
                    </ListItem>
                    <Divider component="li" />
                  </motion.div>
                );
              })
            ) : (
              <ListItem>
                <ListItemText
                  primary={
                    tabIndex === TAB_UNREAD
                      ? 'You have no unread notifications.'
                      : 'No notifications to show.'
                  }
                />
              </ListItem>
            )}
          </List>
        )}
      </Box>
    </Drawer>
  );
}

export default NotificationPanel