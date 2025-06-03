// NotificationItem.jsx
import React from 'react';
import {
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Chip,
  IconButton,
  Typography,
  Box,
  Button,
} from '@mui/material';
import { MoreVert as MoreIcon } from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';

const getNotificationIcon = (type) => {
  const iconProps = { sx: { fontSize: 20 } };
  switch (type) {
    case 'friend_request': return <PersonAdd color="primary" {...iconProps} />;
    case 'friend_request_accepted': return <PersonAdd color="success" {...iconProps} />;
    case 'post_like': return <Favorite color="error" {...iconProps} />;
    case 'comment': return <Comment color="info" {...iconProps} />;
    case 'message': return <Mail color="secondary" {...iconProps} />;
    default: return <Notifications {...iconProps} />;
  }
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

const NotificationItem = ({ 
  notification, 
  onMarkAsRead, 
  onDelete,
  dense = false,
}) => {
  const senderName = notification.sender 
    ? `${notification.sender.firstName} ${notification.sender.lastName}`
    : 'Someone';

  const content = notification.message || `${senderName} ${notification.type}`;
  const timeAgo = formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true });

  return (
    <ListItem
      button
      component={Link}
      to={getNotificationLink(notification)}
      sx={{
        px: dense ? 1 : 2,
        py: dense ? 1 : 1.5,
        alignItems: 'flex-start',
        backgroundColor: notification.isRead ? 'inherit' : 'rgba(0,0,0,0.04)',
        borderLeft: !notification.isRead ? '3px solid' : 'none',
        borderLeftColor: 'primary.main',
        '&:hover': {
          backgroundColor: !notification.isRead ? 'action.selected' : 'action.hover'
        }
      }}
    >
      <ListItemAvatar sx={{ minWidth: dense ? 32 : 40, mt: 0.5 }}>
        <Avatar 
          src={notification.sender?.profileImage} 
          sx={{ width: dense ? 32 : 40, height: dense ? 32 : 40 }}
        />
      </ListItemAvatar>
      <ListItemText
        primary={
          <Box display="flex" justifyContent="space-between">
            <Typography variant={dense ? 'body2' : 'subtitle2'} sx={{ fontWeight: 500 }}>
              {content}
            </Typography>
            {!notification.isRead && !dense && (
              <Chip 
                label="New" 
                size="small" 
                color="primary" 
                sx={{ ml: 1 }} 
              />
            )}
          </Box>
        }
        secondary={
          <>
            <Typography variant="body2" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
              {timeAgo}
            </Typography>
            {notification.metadata?.content && (
              <Typography variant="body2" sx={{ mt: 0.5 }}>
                {notification.metadata.content}
              </Typography>
            )}
          </>
        }
        sx={{ my: 0 }}
      />
      {!dense && (
        <IconButton
          edge="end"
          aria-label="mark as read"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onMarkAsRead(notification.id);
          }}
          sx={{ ml: 1 }}
        >
          <MoreIcon fontSize="small" />
        </IconButton>
      )}
    </ListItem>
  );
};

export default NotificationItem;