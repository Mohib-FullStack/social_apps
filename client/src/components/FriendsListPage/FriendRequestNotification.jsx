import {
  Check as AcceptIcon,
  Close as DeclineIcon
} from '@mui/icons-material';
import {
  Avatar,
  Box,
  Button,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Typography
} from '@mui/material';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  acceptFriendRequest,
  getPendingRequests,
  rejectFriendRequest,
} from '../../features/friendship/friendshipSlice';
import { markNotificationsAsRead } from '../../features/notification/notificationSlice';

const FriendRequestNotification = () => {
  const dispatch = useDispatch();
  const { pendingRequests } = useSelector(state => state.friendship);
  const { notifications } = useSelector(state => state.notification);
  
  // Combine and normalize both notification and pending request data
  const friendRequests = [
    ...notifications
      .filter(notification => (
        notification.type === 'friend_request' && 
        !notification.isRead
      ))
      .map(notification => ({
        id: notification.id,
        requestId: notification.metadata?.friendshipId,
        requester: notification.sender,
        isNotification: true
      })),
    ...pendingRequests.map(request => ({
      id: request.id,
      requestId: request.id,
      requester: request.requester,
      isNotification: false
    }))
  ];

  useEffect(() => {
    dispatch(getPendingRequests());
  }, [dispatch]);

  const handleRequestAction = async (action, requestId, isNotification, notificationId) => {
    try {
      await dispatch(action(requestId));
      if (isNotification && notificationId) {
        dispatch(markNotificationsAsRead([notificationId]));
      }
    } catch (error) {
      console.error('Failed to process friend request:', error);
    }
  };

  if (friendRequests.length === 0) {
    return (
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          No pending friend requests
        </Typography>
      </Box>
    );
  }

  return (
    <List sx={{ width: '100%', maxWidth: 360 }}>
      {friendRequests.map((request) => {
        const requesterName = `${request.requester?.firstName || ''} ${request.requester?.lastName || ''}`.trim();
        
        return (
          <ListItem key={request.id} alignItems="flex-start">
            <ListItemAvatar>
              <Avatar 
                src={request.requester?.profileImage} 
                alt={requesterName}
              />
            </ListItemAvatar>
            <ListItemText
              primary={requesterName || 'Unknown user'}
              secondary="Sent you a friend request"
            />
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button 
                size="small" 
                variant="contained" 
                color="success"
                startIcon={<AcceptIcon />}
                onClick={() => handleRequestAction(
                  acceptFriendRequest,
                  request.requestId,
                  request.isNotification,
                  request.isNotification ? request.id : null
                )}
                aria-label="Accept friend request"
              >
                Accept
              </Button>
              <Button 
                size="small" 
                variant="outlined" 
                color="error"
                startIcon={<DeclineIcon />}
                onClick={() => handleRequestAction(
                  rejectFriendRequest,
                  request.requestId,
                  request.isNotification,
                  request.isNotification ? request.id : null
                )}
                aria-label="Decline friend request"
              >
                Decline
              </Button>
            </Box>
          </ListItem>
        );
      })}
    </List>
  );
};

export default FriendRequestNotification;





