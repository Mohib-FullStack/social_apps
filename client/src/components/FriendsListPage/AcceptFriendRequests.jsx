import { Box, Button, List, ListItem, ListItemText, Typography } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { acceptFriendRequest } from '../../features/friendship/friendshipSlice';

const AcceptFriendRequest = () => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.user);
  const { friendships } = useSelector(state => state.friendship);

  const pendingRequests = friendships?.filter(f =>
    f.status === 'pending' && f.friendId === user.id
  );

  const handleAccept = (id) => {
    dispatch(acceptFriendRequest({ id }));
  };

  return (
    <Box mt={3}>
      <Typography variant="subtitle1">Pending Requests</Typography>
      {pendingRequests.length > 0 ? (
        <List>
          {pendingRequests.map(req => (
            <ListItem key={req.id}>
              <ListItemText primary={`From User ID: ${req.userId}`} />
              <Button variant="contained" onClick={() => handleAccept(req.id)}>
                Accept
              </Button>
            </ListItem>
          ))}
        </List>
      ) : (
        <Typography color="text.secondary">No pending requests.</Typography>
      )}
    </Box>
  );
};

export default AcceptFriendRequest;
