import {
    Button
} from '@mui/material';
import { useDispatch } from 'react-redux';
import { showSnackbar } from '../../../features/snackbar/snackbarSlice';


const BlockUserButton = ({ userId }) => {
  const dispatch = useDispatch();
  
  const handleBlock = async () => {
    if (window.confirm('Are you sure you want to block this user?')) {
      try {
        await dispatch(blockUser(userId)).unwrap();
        dispatch(showSnackbar({
          message: 'User blocked successfully',
          severity: 'success'
        }));
      } catch (error) {
        dispatch(showSnackbar({
          message: 'Failed to block user',
          severity: 'error'
        }));
      }
    }
  };

  return (
    <Button 
      variant="outlined" 
      color="error"
      onClick={handleBlock}
    >
      Block User
    </Button>
  );
};


export default BlockUserButton