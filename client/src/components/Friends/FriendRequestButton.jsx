// src/components/Friends/FriendRequestButton.jsx
import {
  PersonAddAlt1 as AcceptIcon, // Changed from PersonCheck to PersonAddAlt1
  PersonAdd as AddFriendIcon,
  Check as FriendsIcon,
  Schedule as PendingIcon,
} from '@mui/icons-material';
import { Button, CircularProgress, Tooltip } from '@mui/material';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  acceptFriendRequest,
  checkFriendshipStatus,
  sendFriendRequest,
} from '../../features/friendship/friendshipSlice';
import { showSnackbar } from '../../features/snackbar/snackbarSlice';

const FriendRequestButton = ({ friendId }) => {
  const dispatch = useDispatch();
  const currentUserId = useSelector((state) => state.user.profile?.id);
  const friendship = useSelector(
    (state) => state.friendship.friendshipStatus[friendId] || { status: 'none' }
  );
  const isLoading = useSelector(
    (state) => state.friendship.status === 'loading'
  );

  useEffect(() => {
    if (friendId && currentUserId && friendId !== currentUserId) {
      dispatch(checkFriendshipStatus(Number(friendId)));
    }
  }, [dispatch, friendId, currentUserId]);

  const handleAction = async () => {
    try {
      if (friendship.status === 'none') {
        await handleSendRequest();
      } else if (friendship.status === 'pending_received') {
        await handleAcceptRequest(friendship.requestId);
      }
    } catch (error) {
      // Error handling is done in the individual functions
    }
  };

  const handleSendRequest = async () => {
    try {
      if (Number(friendId) === currentUserId) {
        throw new Error("You can't send a friend request to yourself");
      }

      const result = await dispatch(
        sendFriendRequest(Number(friendId))
      ).unwrap();

      dispatch(
        showSnackbar({
          message: result.message || 'Friend request sent successfully!',
          severity: 'success',
        })
      );
    } catch (error) {
      dispatch(
        showSnackbar({
          message: error.message || 'Failed to send friend request',
          severity: 'error',
        })
      );
    }
  };

  const handleAcceptRequest = async (requestId) => {
    try {
      const result = await dispatch(
        acceptFriendRequest(Number(requestId))
      ).unwrap();

      dispatch(
        showSnackbar({
          message: result.message || 'Friend request accepted!',
          severity: 'success',
        })
      );
    } catch (error) {
      dispatch(
        showSnackbar({
          message: error.message || 'Failed to accept friend request',
          severity: 'error',
        })
      );
    }
  };

  if (!friendId || friendId === currentUserId) return null;

  const getButtonProps = () => {
    switch (friendship.status) {
      case 'pending_sent':
        return {
          label: 'Request Sent',
          icon: <PendingIcon />,
          color: 'secondary',
          variant: 'outlined',
          disabled: true,
        };
      case 'pending_received':
        return {
          label: 'Accept Request',
          icon: <AcceptIcon />,
          color: 'primary',
          variant: 'contained',
          disabled: false,
        };
      case 'accepted':
        return {
          label: 'Friends',
          icon: <FriendsIcon />,
          color: 'success',
          variant: 'outlined',
          disabled: true,
        };
      default:
        return {
          label: 'Add Friend',
          icon: <AddFriendIcon />,
          color: 'primary',
          variant: 'contained',
          disabled: false,
        };
    }
  };

  const { label, icon, color, variant, disabled } = getButtonProps();

  return (
    <Tooltip title={label} arrow>
      <Button
        variant={variant}
        color={color}
        size="small"
        startIcon={isLoading ? <CircularProgress size={20} /> : icon}
        onClick={handleAction}
        disabled={disabled || isLoading}
        sx={{
          textTransform: 'none',
          minWidth: '120px',
        }}
      >
        {label}
      </Button>
    </Tooltip>
  );
};

export default FriendRequestButton;
