// src/components/PROFILE/PrivateProfile/CancelRequestButton.jsx
import { Button, CircularProgress } from '@mui/material';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { cancelFriendRequest } from '../../../features/friendship/friendshipSlice';
import { showSnackbar } from '../../../features/snackbar/snackbarSlice';

const CancelRequestButton = ({ friendshipId }) => {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);

  const handleCancel = async () => {
    setIsLoading(true);
    try {
      const result = await dispatch(cancelFriendRequest(friendshipId)).unwrap();
      
      dispatch(showSnackbar({
        message: result.message || 'Friend request cancelled successfully',
        severity: 'success',
        autoHideDuration: 3000,
      }));
    } catch (error) {
      dispatch(showSnackbar({
        message: error.message || 'Failed to cancel friend request',
        severity: 'error',
        autoHideDuration: 4000,
      }));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="outlined"
      color="error"
      onClick={handleCancel}
      disabled={isLoading}
      startIcon={isLoading ? <CircularProgress size={20} /> : null}
      sx={{
        minWidth: 150,
        textTransform: 'none',
        transition: 'all 0.3s ease',
        '&:hover': {
          backgroundColor: 'error.main',
          color: 'white',
          transform: 'translateY(-2px)',
          boxShadow: 1,
        },
        '&.Mui-disabled': {
          borderColor: 'error.main',
          opacity: 0.7,
        }
      }}
    >
      {isLoading ? 'Cancelling...' : 'Cancel Request'}
    </Button>
  );
};

export default CancelRequestButton;