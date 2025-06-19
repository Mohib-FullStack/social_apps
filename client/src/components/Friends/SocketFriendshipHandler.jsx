// src/components/SocketHandlers/SocketFriendshipHandler.jsx
import { Button } from '@mui/material';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useSocket } from '../../context/SocketContext';
import { getPendingRequests } from '../../features/friendship/friendshipSlice';
import { showSnackbar } from '../../features/snackbar/snackbarSlice';

const SocketFriendshipHandler = () => {
  const dispatch = useDispatch();
  const { socketInstance } = useSocket();

  useEffect(() => {
    if (!socketInstance) return;

    const handleFriendRequest = (data) => {
      dispatch(
        showSnackbar({
          message: data.message,
          severity: 'info',
          action: (
            <Button
              color="inherit"
              onClick={() => dispatch(getPendingRequests())}
            >
              View
            </Button>
          ),
        })
      );
      dispatch(getPendingRequests());
    };

    socketInstance.on('friend_request', handleFriendRequest);

    return () => {
      socketInstance.off('friend_request', handleFriendRequest);
    };
  }, [socketInstance, dispatch]);

  return null;
};

export default SocketFriendshipHandler;
