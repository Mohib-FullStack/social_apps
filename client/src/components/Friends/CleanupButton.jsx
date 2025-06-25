import { Button } from '@mui/material';
import { useDispatch } from 'react-redux';
import { showSnackbar } from '../../features/snackbar/snackbarSlice';
import { cleanupExpiredRequests } from '../../features/friendship/friendshipSlice';

const CleanupButton = () => {
  const dispatch = useDispatch();

  const handleCleanup = async () => {
    if (window.confirm('Are you sure you want to cleanup expired requests?')) {
      try {
        const result = await dispatch(cleanupExpiredRequests()).unwrap();
        dispatch(
          showSnackbar({
            message: `Cleaned up ${result} expired requests`,
            severity: 'success',
          })
        );
      } catch (error) {
        dispatch(
          showSnackbar({
            message: 'Failed to cleanup requests',
            severity: 'error',
          })
        );
      }
    }
  };

  return (
    <Button variant="outlined" color="secondary" onClick={handleCleanup}>
      Cleanup Expired Requests
    </Button>
  );
};

export default CleanupButton;
