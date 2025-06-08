import {
  Check as AcceptIcon,
  Close as DeclineIcon
} from '@mui/icons-material';
import {
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Paper,
  Typography
} from '@mui/material';
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  acceptFriendRequest,
  getPendingRequests,
  rejectFriendRequest
} from '../../features/friendship/friendshipSlice';

const FriendRequestsPage = () => {
  const dispatch = useDispatch();
  const { pendingRequests, status, error } = useSelector(
    state => state.friendship
  );

  useEffect(() => {
    dispatch(getPendingRequests());
  }, [dispatch]);

  const handleRequestAction = (requestId, action) => {
    dispatch(action(requestId));
  };

  if (status === 'loading') {
    return (
      <Container maxWidth="md" sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography color="error">{error}</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4">Friend Requests</Typography>
          <Chip label={`${pendingRequests.length} pending`} color="primary" sx={{ ml: 2 }} />
        </Box>

        {pendingRequests.length === 0 ? (
          <Typography variant="body1" color="text.secondary">
            No pending friend requests
          </Typography>
        ) : (
          <List>
            {pendingRequests.map(request => (
              <React.Fragment key={request.id}>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar src={request.requester.profileImage} />
                  </ListItemAvatar>
                  <ListItemText
                    primary={`${request.requester.firstName} ${request.requester.lastName}`}
                    secondary="Sent you a friend request"
                  />
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      variant="contained"
                      color="success"
                      startIcon={<AcceptIcon />}
                      onClick={() => handleRequestAction(
                        request.id, 
                        acceptFriendRequest
                      )}
                    >
                      Accept
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={<DeclineIcon />}
                      onClick={() => handleRequestAction(
                        request.id, 
                        rejectFriendRequest
                      )}
                    >
                      Decline
                    </Button>
                  </Box>
                </ListItem>
                <Divider />
              </React.Fragment>
            ))}
          </List>
        )}
      </Paper>
    </Container>
  );
};

export default FriendRequestsPage;








