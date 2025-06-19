// src/components/PROFILE/PrivateProfile/UnfriendButton.jsx
import { Button, CircularProgress } from '@mui/material';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { removeFriend } from '../../../features/friendship/friendshipSlice';
import { showSnackbar } from '../../../features/snackbar/snackbarSlice';

const RemoveFriendButton = ({ friendshipId }) => {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);

  const handleRemove = async () => {
    setIsLoading(true);
    try {
      await dispatch(removeFriend(friendshipId)).unwrap();
      dispatch(
        showSnackbar({
          message: 'Friend removed successfully',
          severity: 'success',
        })
      );
    } catch (error) {
      dispatch(
        showSnackbar({
          message: 'Failed to remove friend',
          severity: 'error',
        })
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="outlined"
      color="error"
      onClick={handleRemove}
      disabled={isLoading}
      startIcon={isLoading ? <CircularProgress size={20} /> : null}
      sx={{
        minWidth: 120,
        textTransform: 'none',
        '&:hover': {
          backgroundColor: 'error.light',
          color: 'white',
        },
      }}
    >
      {isLoading ? 'Removing...' : 'Unfriend'}
    </Button>
  );
};

export default RemoveFriendButton;
