import {
    Button
} from '@mui/material';
import { useDispatch } from 'react-redux';
import { showSnackbar } from '../../../features/snackbar/snackbarSlice';



const UnblockUserButton = ({ userId }) => {
  const dispatch = useDispatch();
  
  const handleUnblock = async () => {
    try {
      await dispatch(unblockUser(userId)).unwrap();
      dispatch(showSnackbar({
        message: 'User unblocked successfully',
        severity: 'success'
      }));
    } catch (error) {
      dispatch(showSnackbar({
        message: 'Failed to unblock user',
        severity: 'error'
      }));
    }
  };

  return (
    <Button 
      variant="outlined" 
      color="primary"
      onClick={handleUnblock}
    >
      Unblock User
    </Button>
  );
};


export default UnblockUserButton