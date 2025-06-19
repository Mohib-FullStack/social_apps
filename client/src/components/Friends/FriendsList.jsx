// src/components/Friends/FriendsList.jsx
import {
  Avatar,
  Box,
  CircularProgress,
  Grid,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Typography
} from '@mui/material';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getFriends } from '../../features/friendship/friendshipSlice';
import UnblockUserButton from '../PROFILE/PrivateProfile/UnblockUserButton';


const FriendsList = ({ userId, isCurrentUser = false }) => {
  const dispatch = useDispatch();
  const { friends, status } = useSelector((state) => state.friendship);
  
  useEffect(() => {
    if (userId) {
      dispatch(getFriends({ userId }));
    }
  }, [dispatch, userId]);

  if (status === 'loading') {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (friends.data.length === 0) {
    return (
      <Typography variant="body1" color="text.secondary" align="center" p={4}>
        {isCurrentUser ? "You don't have any friends yet" : "No friends to show"}
      </Typography>
    );
  }

  return (
    <Grid container spacing={2}>
      <List sx={{ width: '100%' }}>
        {friends.data.map((friend) => (
          <ListItem key={friend.id} sx={{ py: 1.5 }}>
            <ListItemAvatar>
              <Avatar src={friend.profileImage} />
            </ListItemAvatar>
            <ListItemText
              primary={`${friend.firstName} ${friend.lastName}`}
              secondary={friend.mutualFriendsCount ? `${friend.mutualFriendsCount} mutual friends` : ''}
            />
            {isCurrentUser && (
              <UnblockUserButton friendshipId={friend.friendshipId} />
            )}
          </ListItem>
        ))}
      </List>
    </Grid>
  );
};

export default FriendsList;