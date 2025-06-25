import { Message, PersonRemove } from '@mui/icons-material';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardHeader,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Tab,
  Tabs,
  Typography
} from '@mui/material';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getFriends, removeFriend } from '../../../features/friendship/friendshipSlice';

const FriendsListCard = () => {
  const dispatch = useDispatch();
  const { profile } = useSelector((state) => state.user);

  const friends = useSelector(
    (state) => state.friendship.friendsByUser[profile?.id] || { data: [] }
  );

  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    console.log('Current friends data:', friends); // Debug log
  }, [friends]);

    useEffect(() => {
    const loadFriends = async () => {
      setLoading(true);
      try {
        await dispatch(getFriends({ userId: profile?.id })).unwrap();
      } catch (error) {
        console.error('Failed to load friends:', error);
      } finally {
        setLoading(false);
      }
    };

    if (profile?.id) {
      loadFriends();
    }
  }, [dispatch, profile?.id]);

  const handleRemoveFriend = async (friendshipId) => {
    try {
      await dispatch(removeFriend(friendshipId)).unwrap();
      // Refresh friends list after removal
      dispatch(getFriends({ userId: profile?.id }));
    } catch (error) {
      console.error('Failed to remove friend:', error);
    }
  };

  const filteredFriends = friends.filter((friendship) => {
    if (!friendship.friend) return false; // Skip if no friend data
    if (activeTab === 'all') return true;
    return friendship.tier === activeTab;
  });

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" py={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Card>
      <CardHeader
        title="Your Friends"
        subheader={`${filteredFriends.length} friends`}
      />
      
      <Tabs
        value={activeTab}
        onChange={(_, newValue) => setActiveTab(newValue)}
        variant="fullWidth"
      >
        <Tab label="All" value="all" />
        <Tab label="Close" value="close" />
        <Tab label="Family" value="family" />
      </Tabs>
      
      {filteredFriends.length > 0 ? (
        <List>
          {filteredFriends.map((friendship) => {
            const friend = friendship.friend;
            if (!friend) return null;

            return (
              <Box key={friendship.id}>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar src={friend.profileImage || '/default-avatar.png'} />
                  </ListItemAvatar>
                  <ListItemText
                    primary={`${friend.firstName || ''} ${friend.lastName || ''}`}
                    secondary={friendship.tier !== 'regular' ? friendship.tier : ''}
                  />
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<Message />}
                    >
                      Message
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      startIcon={<PersonRemove />}
                      onClick={() => handleRemoveFriend(friendship.id)}
                    >
                      Remove
                    </Button>
                  </Box>
                </ListItem>
                <Divider />
              </Box>
            );
          })}
        </List>
      ) : (
        <Box textAlign="center" py={4}>
          <Typography variant="body1" color="text.secondary">
            {activeTab === 'all' 
              ? "You haven't added any friends yet" 
              : `No ${activeTab} friends found`}
          </Typography>
        </Box>
      )}
    </Card>
  );
};

export default FriendsListCard;

//! profilePage full functional
// Complete PrivateProfilePage.jsx (React) with clean friend list rendering
// Based on working friend list fetch and social network style layout

// import {
//   CardContent,
//   Grid
// } from '@mui/material';

// const FriendsListCard = () => {
//   const dispatch = useDispatch();
//   const { profile } = useSelector((state) => state.user);

//   const friends = useSelector(
//     (state) => state.friendship.friendsByUser[profile?.id] || { data: [] }
//   );

//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     if (!profile?.id) return;
//     setLoading(true);
//     dispatch(getFriends({ userId: profile.id }))
//       .unwrap()
//       .catch((err) => console.error('Failed to load friends:', err))
//       .finally(() => setLoading(false));
//   }, [dispatch, profile?.id]);

//   const handleRemove = async (friendshipId) => {
//     try {
//       await dispatch(removeFriend(friendshipId)).unwrap();
//     } catch (error) {
//       console.error('Failed to remove friend:', error);
//     }
//   };

//   if (loading) {
//     return (
//       <Box display="flex" justifyContent="center" py={2}>
//         <CircularProgress size={24} />
//       </Box>
//     );
//   }

//   const friendList = friends.data || [];

//   return (
//     <Card elevation={1} sx={{ mt: 1, mb: 2 }}>
//       <CardHeader
//         title="Friends"
//         subheader={`${friendList.length} accepted`}
//         sx={{ pt: 1, pb: 0.5 }}
//       />
//       <CardContent sx={{ pt: 0.5, pb: 1 }}>
//         {friendList.length === 0 ? (
//           <Typography color="text.secondary" align="center">
//             No friends to show.
//           </Typography>
//         ) : (
//           <Grid container spacing={2}>
//             {friendList.map(({ id, friend, tier }) => (
//               <Grid item xs={12} sm={6} md={4} key={id}>
//                 <Card variant="outlined" sx={{ height: '100%' }}>
//                   <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
//                     <Avatar src={friend.profileImage || '/default-avatar.png'} />
//                     <Box flexGrow={1}>
//                       <Typography variant="subtitle1">
//                         {friend.firstName} {friend.lastName}
//                       </Typography>
//                       {tier !== 'regular' && (
//                         <Typography variant="body2" color="text.secondary">
//                           {tier}
//                         </Typography>
//                       )}
//                     </Box>
//                   </CardContent>
//                   <Box display="flex" justifyContent="flex-end" gap={1} px={2} pb={2}>
//                     <Button
//                       size="small"
//                       variant="outlined"
//                       startIcon={<Message />}
//                     >
//                       Message
//                     </Button>
//                     <Button
//                       size="small"
//                       variant="outlined"
//                       color="error"
//                       startIcon={<PersonRemove />}
//                       onClick={() => handleRemove(id)}
//                     >
//                       Remove
//                     </Button>
//                   </Box>
//                 </Card>
//               </Grid>
//             ))}
//           </Grid>
//         )}
//       </CardContent>
//     </Card>
//   );
// };

// const PrivateProfilePage = () => {
//   const profile = useSelector((state) => state.user.profile);

//   if (!profile?.id) {
//     return (
//       <Box textAlign="center" mt={4}>
//         <Typography variant="body1" color="text.secondary">
//           Loading user profile...
//         </Typography>
//       </Box>
//     );
//   }

//   return (
//     <Box maxWidth="md" mx="auto" px={2} pt={2}>
//       <Typography variant="h5" gutterBottom>
//         {profile.firstName} {profile.lastName}'s Profile
//       </Typography>

//       {/* Profile summary can go here */}

//       <FriendsListCard />
//     </Box>
//   );
// };

// export default PrivateProfilePage;