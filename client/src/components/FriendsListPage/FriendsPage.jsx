import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Container,
  Tabs,
  Tab,
  Typography,
  CircularProgress,
  Grid,
  Button,
  Avatar,
  Divider
} from '@mui/material';
import {
  fetchUserFriends,
  fetchMutualFriends
} from '../../features/friendship/friendshipSlice';

const FriendsPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState('all');
  const [page, setPage] = useState(1);
  
  const {
    friendsList,
    friendsStatus,
    friendsError,
    mutualFriends,
    mutualFriendsStatus,
    mutualFriendsError,
  } = useSelector(state => state.friendship);

  const currentUserId = useSelector(state => state.user.profile?.id);
  const isOwnProfile = id === currentUserId;

  useEffect(() => {
    if (activeTab === 'all') {
      dispatch(fetchUserFriends({ userId: id, page }));
    } else {
      dispatch(fetchMutualFriends({ userId: id, page }));
    }
  }, [dispatch, id, page, activeTab]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setPage(1); // Reset to first page when switching tabs
  };

  const handleLoadMore = () => {
    setPage(prev => prev + 1);
  };

  const renderFriendsList = () => {
    if (activeTab === 'all') {
      if (friendsStatus === 'loading') return <CircularProgress />;
      if (friendsError) return <Typography color="error">{friendsError}</Typography>;
      
      return (
        <>
          <Grid container spacing={3}>
            {friendsList.data.map(friend => (
              <FriendItem key={friend.id} friend={friend} isOwnProfile={isOwnProfile} />
            ))}
          </Grid>
          {friendsList.pagination.totalPages > page && (
            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Button 
                variant="outlined" 
                onClick={handleLoadMore}
                disabled={friendsStatus === 'loading'}
              >
                Load More
              </Button>
            </Box>
          )}
        </>
      );
    } else {
      if (mutualFriendsStatus === 'loading') return <CircularProgress />;
      if (mutualFriendsError) return <Typography color="error">{mutualFriendsError}</Typography>;
      
      return (
        <>
          <Typography variant="subtitle1" sx={{ mb: 2 }}>
            {mutualFriends.pagination.totalItems} mutual connections
          </Typography>
          <Grid container spacing={3}>
            {mutualFriends.data.map(friend => (
              <FriendItem key={friend.id} friend={friend} isOwnProfile={isOwnProfile} />
            ))}
          </Grid>
          {mutualFriends.pagination.totalPages > page && (
            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Button 
                variant="outlined" 
                onClick={handleLoadMore}
                disabled={mutualFriendsStatus === 'loading'}
              >
                Load More
              </Button>
            </Box>
          )}
        </>
      );
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          {isOwnProfile ? 'Your Friends' : 'Friends'}
        </Typography>
        <Chip 
          label={`${friendsList.pagination?.totalItems || 0} total`} 
          sx={{ ml: 2 }} 
          color="primary"
        />
      </Box>

      <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 3 }}>
        <Tab label="All Friends" value="all" />
        {!isOwnProfile && <Tab label="Mutual Friends" value="mutual" />}
      </Tabs>

      <Divider sx={{ mb: 3 }} />

      {renderFriendsList()}
    </Container>
  );
};

const FriendItem = ({ friend, isOwnProfile }) => (
  <Grid item xs={12} sm={6} md={4}>
    <Box sx={{ display: 'flex', alignItems: 'center', p: 2, bgcolor: 'background.paper', borderRadius: 2 }}>
      <Avatar 
        src={friend.profileImage} 
        sx={{ width: 56, height: 56, mr: 2 }}
      />
      <Box sx={{ flexGrow: 1 }}>
        <Typography variant="subtitle1">
          {friend.firstName} {friend.lastName}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Last active: {new Date(friend.lastActive).toLocaleDateString()}
        </Typography>
      </Box>
      {!isOwnProfile && (
        <Button 
          variant="outlined" 
          size="small"
          sx={{ ml: 2 }}
        >
          Message
        </Button>
      )}
    </Box>
  </Grid>
);

export default FriendsPage;