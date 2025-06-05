import { Box, Button, TextField, Typography } from '@mui/material';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { sendFriendRequest } from '../../features/friendship/friendshipSlice';

const SendFriendRequest = () => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.user);
  const [targetId, setTargetId] = useState('');

  const handleSendRequest = () => {
    if (!targetId || targetId === user.id) return;

    dispatch(sendFriendRequest({
      userId: user.id,
      friendId: targetId,
      status: 'pending',
    }));

    setTargetId('');
  };

  return (
    <Box mt={2}>
      <Typography variant="subtitle1">Send Friend Request</Typography>
      <Box display="flex" gap={2} mt={1}>
        <TextField
          label="Friend's ID"
          value={targetId}
          onChange={(e) => setTargetId(e.target.value)}
        />
        <Button variant="contained" onClick={handleSendRequest}>
          Send
        </Button>
      </Box>
    </Box>
  );
};

export default SendFriendRequest;























