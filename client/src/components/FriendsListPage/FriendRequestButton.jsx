import {
  PersonAdd as AddFriendIcon,
  Schedule as PendingIcon
} from '@mui/icons-material';
import { Button, CircularProgress, Tooltip } from '@mui/material';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  cancelFriendRequest,
  checkFriendshipStatus,
  sendFriendRequest
} from '../../features/friendship/friendshipSlice';
import { showSnackbar } from '../../features/snackbar/snackbarSlice';

const FriendRequestButton = ({ targetUserId }) => {
  const dispatch = useDispatch();
  const currentUserId = useSelector(state => state.user.profile?.id);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);
  const [friendshipId, setFriendshipId] = useState(null);

  // Check friendship status on mount
  useEffect(() => {
    if (targetUserId && currentUserId && targetUserId !== currentUserId) {
      dispatch(checkFriendshipStatus(targetUserId))
        .then((action) => {
          setStatus(action.payload.status);
          setFriendshipId(action.payload.friendship?.id);
        });
    }
  }, [targetUserId, currentUserId, dispatch]);

  const handleSendRequest = async () => {
    if (!targetUserId || targetUserId === currentUserId) return;
    
    setLoading(true);
    try {
      const result = await dispatch(sendFriendRequest({ targetUserId })).unwrap();
      setStatus('pending');
      setFriendshipId(result.id);
      
      dispatch(showSnackbar({
        message: 'Friend request sent!',
        severity: 'success'
      }));
    } catch (error) {
      dispatch(showSnackbar({
        message: error || 'Failed to send friend request',
        severity: 'error'
      }));
    } finally {
      setLoading(false);
    }
  };

  const handleCancelRequest = async () => {
    if (!friendshipId) return;
    
    setLoading(true);
    try {
      await dispatch(cancelFriendRequest(friendshipId)).unwrap();
      setStatus('none');
      
      dispatch(showSnackbar({
        message: 'Friend request cancelled',
        severity: 'info'
      }));
    } catch (error) {
      dispatch(showSnackbar({
        message: error || 'Failed to cancel request',
        severity: 'error'
      }));
    } finally {
      setLoading(false);
    }
  };

  if (!targetUserId || targetUserId === currentUserId) {
    return null;
  }

  if (loading) {
    return (
      <Button variant="outlined" size="small" disabled>
        <CircularProgress size={20} />
      </Button>
    );
  }

  switch (status) {
    case 'none':
      return (
        <Tooltip title="Add friend" arrow>
          <Button 
            variant="contained" 
            color="primary" 
            size="small"
            startIcon={<AddFriendIcon />}
            onClick={handleSendRequest}
            sx={{ textTransform: 'none' }}
          >
            Add Friend
          </Button>
        </Tooltip>
      );
      
    case 'pending':
      return (
        <Tooltip title="Cancel friend request" arrow>
          <Button 
            variant="outlined" 
            color="secondary" 
            size="small"
            startIcon={<PendingIcon />}
            onClick={handleCancelRequest}
            sx={{ textTransform: 'none' }}
          >
            Request Sent
          </Button>
        </Tooltip>
      );
      
    case 'accepted':
      return (
        <Button 
          variant="outlined" 
          color="success" 
          size="small"
          disabled
          sx={{ textTransform: 'none' }}
        >
          Friends
        </Button>
      );
      
    default:
      return (
        <Button 
          variant="contained" 
          color="primary" 
          size="small"
          startIcon={<AddFriendIcon />}
          onClick={handleSendRequest}
          sx={{ textTransform: 'none' }}
        >
          Add Friend
        </Button>
      );
  }
};

export default FriendRequestButton;