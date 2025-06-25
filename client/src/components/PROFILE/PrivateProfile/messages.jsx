// src/components/PROFILE/PrivateProfile/Messages.jsx
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSocket } from '../../../context/SocketContext';
import { receiveMessage } from '../../../features/messages/messageSlice';
import { showSnackbar } from '../../../features/snackbar/snackbarSlice';

const Messages = () => {
  const dispatch = useDispatch();
  const { socketInstance } = useSocket();
  const currentUser = useSelector((state) => state.user.profile);

  useEffect(() => {
    if (!socketInstance) return;

    const handleMessage = (msg) => {
      const { senderId, content, timestamp, senderName, senderAvatar } = msg;

      // ✅ Store message in Redux
      dispatch(receiveMessage(msg));

      // ✅ Show snackbar if message isn't from current user
      if (senderId !== currentUser?.id) {
        dispatch(
          showSnackbar({
            message: `New message from ${senderName}: “${content.slice(0, 40)}…”`,
            severity: 'info',
            duration: 7000,
            username: senderName,
            avatarUrl: senderAvatar || '/default-avatar.png',
          })
        );
      }
    };

    socketInstance.on('private_message', handleMessage);

    return () => {
      socketInstance.off('private_message', handleMessage);
    };
  }, [socketInstance, dispatch, currentUser]);

  return null;
};

export default Messages;
