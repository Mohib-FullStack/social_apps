import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Avatar,
  Typography,
  Button,
  CircularProgress
} from '@mui/material';
import { PersonAdd, Check, Message } from '@mui/icons-material';
// import { fetchUserFriends } from '../../features/user/userSlice';

const FriendsSection = ({ userId }) => {
  const dispatch = useDispatch();
  const { friends, status } = useSelector(state => state.user.friends);
  
  useEffect(() => {
    dispatch(fetch(userId));
  }, [userId, dispatch]);

  if (status === 'loading') {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        {friends.length} Friends
      </Typography>
      
      <Grid container spacing={2}>
        {friends.map(friend => (
          <Grid item xs={12} sm={6} md={4} key={friend.id}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Avatar
                  src={friend.profileImage}
                  sx={{ 
                    width: 120, 
                    height: 120,
                    mx: 'auto',
                    mb: 2
                  }}
                />
                <Typography variant="subtitle1">
                  {friend.firstName} {friend.lastName}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {friend.mutualFriends} mutual friends
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<Message />}
                  >
                    Message
                  </Button>
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={friend.isFriend ? <Check /> : <PersonAdd />}
                  >
                    {friend.isFriend ? 'Friends' : 'Add Friend'}
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default FriendsSection;