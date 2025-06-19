// src/components/Friends/DashboardSuggestions.jsx
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Typography
} from '@mui/material';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getFriendSuggestions } from '../../features/friendship/friendshipSlice';
import FriendRequestButton from '../Friends/FriendRequestButton';

const FriendSuggestions = () => {
  const dispatch = useDispatch();
  const { suggestions, status } = useSelector((state) => state.friendship);
  const currentUserId = useSelector((state) => state.user.profile?.id);

  useEffect(() => {
    dispatch(getFriendSuggestions());
  }, [dispatch]);

  if (status === 'loading') {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  if (!suggestions.data || suggestions.data.length === 0) {
    return null;
  }

  return (
    <Card elevation={3} sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          People You May Know
        </Typography>
        <Divider sx={{ mb: 2 }} />
        
        <List disablePadding>
          {suggestions.data.map((user) => (
            <ListItem key={user.id} sx={{ py: 1.5 }}>
              <ListItemAvatar>
                <Avatar src={user.profileImage} />
              </ListItemAvatar>
              <ListItemText
                primary={`${user.firstName} ${user.lastName}`}
                secondary={
                  user.mutualFriendsCount > 0 
                    ? `${user.mutualFriendsCount} mutual friends` 
                    : 'New to SocialApp'
                }
              />
              <Box sx={{ ml: 2 }}>
                <FriendRequestButton 
                  friendId={user.id} 
                  size="small" 
                  currentStatus="not_friends" 
                />
              </Box>
            </ListItem>
          ))}
        </List>

        {suggestions.data.length >= 5 && (
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Button 
              variant="text" 
              onClick={() => dispatch(getFriendSuggestions())}
            >
              Show More
            </Button>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default FriendSuggestions;

