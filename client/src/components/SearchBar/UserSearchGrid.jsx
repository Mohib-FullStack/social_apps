// components/SearchBar/UserSearchGrid.jsx
import {
    Box,
    Button,
    Card,
    CardContent,
    CircularProgress,
    Grid,
    Typography
} from '@mui/material';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { sendFriendRequest } from '../../features/friendship/friendshipSlice';
import { showSnackbar } from '../../features/snackbar/snackbarSlice';
import { fetchAllUsers } from '../../features/user/userSlice';
import SearchBar from '../SearchBar/SearchBar';

const UserSearchGrid = () => {
  const dispatch = useDispatch();
  const { users, status } = useSelector(state => state.user);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    dispatch(fetchAllUsers({ search: '', page: 1, limit: 50 }));
  }, [dispatch]);

  const handleSendFriendRequest = async (userId) => {
    try {
      await dispatch(sendFriendRequest({ targetUserId: userId })).unwrap();
      dispatch(showSnackbar({ message: 'Friend request sent!', severity: 'success' }));
    } catch (err) {
      dispatch(showSnackbar({ message: err.message || 'Failed to send request', severity: 'error' }));
    }
  };

  const filteredUsers = users.filter(user =>
    `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box sx={{ mt: 4 }}>
      <SearchBar value={searchTerm} onChange={setSearchTerm} />
      {status === 'loading' ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={2} sx={{ mt: 2 }}>
          {filteredUsers.map(user => (
            <Grid item xs={12} sm={6} md={4} key={user.id}>
              <Card>
                <CardContent>
                  <Typography variant="h6">
                    {user.firstName} {user.lastName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {user.email}
                  </Typography>
                  <Button
                    variant="contained"
                    sx={{ mt: 1 }}
                    onClick={() => handleSendFriendRequest(user.id)}
                  >
                    Add Friend
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default UserSearchGrid;
