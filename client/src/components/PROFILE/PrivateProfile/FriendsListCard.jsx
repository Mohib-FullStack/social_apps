// // src/components/PROFILE/PrivateProfile/FriendsListCard.jsx

// import { Message, PersonRemove } from '@mui/icons-material';
// import {
//     Avatar,
//     Box,
//     Button,
//     Card,
//     CardContent,
//     CardHeader,
//     CircularProgress,
//     Grid,
//     Tab,
//     Tabs,
//     Typography,
//     useMediaQuery,
//     useTheme,
// } from '@mui/material';
// import { useEffect, useState } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { getFriends, removeFriend } from '../../../features/friendship/friendshipSlice';
// import { showSnackbar } from '../../../features/snackbar/snackbarSlice';
// import MessageModal from '../../Chat/MessageModal';

// const FriendsListCard = () => {
//   const dispatch = useDispatch();
//   const theme = useTheme();
//   const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

//   const { profile } = useSelector((state) => state.user);
//   const friends = useSelector(
//     (state) => state.friendship.friendsByUser[profile?.id] || { data: [] }
//   );

//   const [activeTab, setActiveTab] = useState('all');
//   const [loading, setLoading] = useState(false);
//   const [openModal, setOpenModal] = useState(false);
//   const [selectedFriend, setSelectedFriend] = useState(null);

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
//       dispatch(showSnackbar({ message: 'Friend removed', severity: 'info' }));
//     } catch (error) {
//       dispatch(showSnackbar({ message: 'Failed to remove friend', severity: 'error' }));
//     }
//   };

//   const filteredFriends = friends.data?.filter((f) => {
//     if (activeTab === 'all') return true;
//     return f.tier === activeTab;
//   }) || [];

//   return (
//     <Card elevation={2} sx={{ p: 2 }}>
//       <CardHeader
//         title="Your Friends"
//         subheader={`${filteredFriends.length} ${activeTab} friends`}
//         sx={{ pb: 0, pt: 1, px: 1 }}
//       />

//       <Tabs
//         value={activeTab}
//         onChange={(e, val) => setActiveTab(val)}
//         variant="fullWidth"
//         indicatorColor="primary"
//         textColor="primary"
//         sx={{ my: 1 }}
//       >
//         <Tab label="All" value="all" />
//         <Tab label="Close" value="close" />
//         <Tab label="Family" value="family" />
//       </Tabs>

//       <CardContent>
//         {loading ? (
//           <Box display="flex" justifyContent="center" py={3}>
//             <CircularProgress size={24} />
//           </Box>
//         ) : filteredFriends.length === 0 ? (
//           <Typography variant="body2" color="text.secondary" align="center" py={2}>
//             No friends to show.
//           </Typography>
//         ) : (
//           <Grid container spacing={2}>
//             {filteredFriends.map(({ id, friend, tier }) => (
//               <Grid item xs={12} sm={12} md={6} key={id}>
//                 <Card variant="outlined" sx={{ p: 2 }}>
//                   <Box display="flex" alignItems="center" justifyContent="space-between">
//                     <Box display="flex" alignItems="center" gap={2}>
//                       <Avatar
//                         src={friend.profileImage || '/default-avatar.png'}
//                         alt={friend.firstName}
//                         sx={{ width: 56, height: 56 }}
//                       />
//                       <Box>
//                         <Typography variant="subtitle1" fontWeight={600}>
//                           {friend.firstName} {friend.lastName}
//                         </Typography>
//                         {tier !== 'regular' && (
//                           <Typography variant="caption" color="text.secondary">
//                             {tier.charAt(0).toUpperCase() + tier.slice(1)} friend
//                           </Typography>
//                         )}
//                       </Box>
//                     </Box>
//                     <Box display="flex" gap={1}>
//                       <Button
//                         size="small"
//                         variant="outlined"
//                         startIcon={<Message />}
//                         onClick={() => {
//                           setSelectedFriend(friend);
//                           setOpenModal(true);
//                         }}
//                       >
//                         Message
//                       </Button>
//                       <Button
//                         size="small"
//                         color="error"
//                         variant="outlined"
//                         startIcon={<PersonRemove />}
//                         onClick={() => handleRemove(id)}
//                       >
//                         Remove
//                       </Button>
//                     </Box>
//                   </Box>
//                 </Card>
//               </Grid>
//             ))}
//           </Grid>
//         )}
//       </CardContent>

//       {selectedFriend && (
//         <MessageModal
//           open={openModal}
//           onClose={() => setOpenModal(false)}
//           friend={selectedFriend}
//         />
//       )}
//     </Card>
//   );
// };

// export default FriendsListCard;


//! test & Good
// PrivateProfilePage.jsx (React) — Chat integrated with Socket.IO
//  import { Message, PersonRemove } from '@mui/icons-material';
// import {
//   Avatar,
//   Badge,
//   Box,
//   Button,
//   Card,
//   CardContent,
//   CardHeader,
//   Dialog,
//   DialogActions,
//   DialogContent,
//   DialogTitle,
//   Grid,
//   Tab,
//   Tabs,
//   TextField,
//   Typography,
//   useMediaQuery,
//   useTheme,
// } from '@mui/material';
// import { useEffect, useState } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { getFriends, removeFriend } from '../../../features/friendship/friendshipSlice';
// import socket from '../../../utils/socket';

// const mockMutualFriendsCount = (friendId) => {
//   const seed = friendId % 5;
//   return seed === 0 ? 0 : seed + 1;
// };

// const ChatPreviewModal = ({ open, onClose, friend }) => {
//   const user = useSelector((state) => state.user.profile);
//   const [messageText, setMessageText] = useState('');

//   const handleSend = () => {
//     if (!messageText.trim() || !user || !friend) return;

//     const payload = {
//       senderId: user.id,
//       receiverId: friend.id,
//       content: messageText,
//       timestamp: new Date().toISOString(),
//     };

//     socket. emit('private_message', payload);
//     setMessageText('');
//     onClose();
//   };

//   return (
//     <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
//       <DialogTitle>Start Chat</DialogTitle>
//       <DialogContent>
//         <Box display="flex" alignItems="center" gap={2} mb={2}>
//           <Avatar
//             src={friend?.profileImage || '/default-avatar.png'}
//             sx={{ width: 48, height: 48 }}
//           />
//           <Typography variant="subtitle1">
//             {friend?.firstName} {friend?.lastName}
//           </Typography>
//         </Box>
//         <TextField
//           autoFocus
//           multiline
//           rows={3}
//           fullWidth
//           variant="outlined"
//           value={messageText}
//           onChange={(e) => setMessageText(e.target.value)}
//           placeholder="Write your message..."
//         />
//       </DialogContent>
//       <DialogActions>
//         <Button onClick={onClose}>Cancel</Button>
//         <Button variant="contained" onClick={handleSend} disabled={!messageText.trim()}>
//           Send
//         </Button>
//       </DialogActions>
//     </Dialog>
//   );
// };

// const FriendsListCard = () => {

//  const dispatch = useDispatch();
//   const { profile } = useSelector((state) => state.user);
//   const theme = useTheme();
//   const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

//   const friends = useSelector(
//     (state) => state.friendship.friendsByUser[profile?.id] || { data: [] }
//   );

//   const [loading, setLoading] = useState(false);
//   const [activeTab, setActiveTab] = useState('all');
//   const [chatFriend, setChatFriend] = useState(null);

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

//   const friendList = friends.data || [];
//   const filteredFriends = activeTab === 'all'
//     ? friendList
//     : friendList.filter(f => f.tier === activeTab);

//   return (
//     <Card elevation={1} sx={{ mt: 1, mb: 2 }}>
//       <CardHeader
//         title="Hello this my Friends......."
//               subheader={`${filteredFriends.length} ${activeTab} friends`}
//         sx={{ pt: 1, pb: 0.5 }}
//       />

//       <Tabs
//         value={activeTab}
//         onChange={(e, value) => setActiveTab(value)}
//         variant="fullWidth"
//         indicatorColor="primary"
//         textColor="primary"
//       >
//         <Tab label="All" value="all" />
//         <Tab label="Close" value="close" />
//         <Tab label="Family" value="family" />
//       </Tabs>

//       <CardContent sx={{ pt: 0.5, pb: 1 }}>
//         {filteredFriends.length === 0 ? (
//           <Typography color="text.secondary" align="center">
//             No {activeTab !== 'all' ? activeTab : ''} friends to show.
//           </Typography>
//         ) : (
//           <Grid container spacing={2}>
//             {filteredFriends.map(({ id, friend, tier }) => {
//               const mutualCount = mockMutualFriendsCount(friend.id);
//               return (
//                 <Grid item xs={12} sm={6} md={4} key={id}>
//                   <Card variant="outlined" sx={{ height: '100%' }}>
//                     <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
//                       <Badge
//                         badgeContent={
//                           mutualCount > 0 ? `${mutualCount} mutual` : null
//                         }
//                         color="primary"
//                       >
//                         <Avatar
//                           src={friend.profileImage || '/default-avatar.png'}
//                           sx={{ width: isMobile ? 48 : 56, height: isMobile ? 48 : 56 }}
//                         />
//                       </Badge>
//                       <Box flexGrow={1}>
//                         <Typography variant="subtitle1" noWrap>
//                           {friend.firstName} {friend.lastName}
//                         </Typography>
//                         {tier !== 'regular' && (
//                           <Typography variant="body2" color="text.secondary">
//                             {tier}
//                           </Typography>
//                         )}
//                       </Box>
//                     </CardContent>
//                     <Box
//                       display="flex"
//                       flexDirection={isMobile ? 'column' : 'row'}
//                       justifyContent="flex-end"
//                       gap={1}
//                       px={2}
//                       pb={2}
//                     >
//                       <Button
//                         size="small"
//                         fullWidth={isMobile}
//                         variant="outlined"
//                         startIcon={<Message />}
//                         onClick={() => setChatFriend(friend)}
//                       >
//                         Message
//                       </Button>
//                       <Button
//                         size="small"
//                         fullWidth={isMobile}
//                         variant="outlined"
//                         color="error"
//                         startIcon={<PersonRemove />}
//                         onClick={() => handleRemove(id)}
//                       >
//                         Remove
//                       </Button>
//                     </Box>
//                   </Card>
//                 </Grid>
//               );
//             })}
//           </Grid>
//         )}
//         <ChatPreviewModal
//           open={!!chatFriend}
//           friend={chatFriend}
//           onClose={() => setChatFriend(null)}
//         />
//       </CardContent>
//     </Card>
//   );
// };



// export default FriendsListCard

//! refactor
import {
  Cancel,
  CheckCircle,
  FilterList,
  Message,
  MoreVert,
  PersonAdd,
  PersonRemove,
  Search
} from '@mui/icons-material';
import {
  Avatar,
  Badge,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  Menu,
  MenuItem,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { formatDistanceToNow } from 'date-fns';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  // getFriendRequests,
  getFriends,
  removeFriend,
  updateFriendshipTier,
} from '../../../features/friendship/friendshipSlice';
import socket from '../../../utils/socket';
import ConfirmationDialog from '../../common/ConfirmationDialog';
import EmptyState from '../../common/EmptyState';

const FriendsListCard = () => {
  const dispatch = useDispatch();
  const { profile } = useSelector((state) => state.user);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const {
    friendsByUser,
    friendRequests,
    searchResults,
    status: friendshipStatus
  } = useSelector((state) => state.friendship);

  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [chatFriend, setChatFriend] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [friendToRemove, setFriendToRemove] = useState(null);
  const [showRequests, setShowRequests] = useState(false);

  const friends = friendsByUser[profile?.id] || { data: [] };
  const isLoading = friendshipStatus === 'loading';

  useEffect(() => {
    if (!profile?.id) return;
    
    const loadData = async () => {
      setLoading(true);
      try {
        await dispatch(getFriends({ userId: profile.id })).unwrap();
        // await dispatch(getFriendRequests()).unwrap();
      } catch (err) {
        console.error('Failed to load friends:', err);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [dispatch, profile?.id]);

  const handleSearch = async (query) => {
    if (query.trim().length > 2) {
      try {
        // await dispatch(searchFriends(query)).unwrap();
        setShowSearchResults(true);
      } catch (error) {
        console.error('Search failed:', error);
      }
    } else {
      setShowSearchResults(false);
    }
  };

  const handleRemoveFriend = async () => {
    if (!friendToRemove) return;
    try {
      await dispatch(removeFriend(friendToRemove)).unwrap();
      setFriendToRemove(null);
      setConfirmOpen(false);
    } catch (error) {
      console.error('Failed to remove friend:', error);
    }
  };

  const handleUpdateTier = async (friendId, tier) => {
    try {
      await dispatch(updateFriendshipTier({ friendshipId: friendId, tier })).unwrap();
      setAnchorEl(null);
    } catch (error) {
      console.error('Failed to update friend tier:', error);
    }
  };

  const handleRespondToRequest = async (requestId, accept) => {
    try {
      // await dispatch(respondToFriendRequest({ requestId, accept })).unwrap();
    } catch (error) {
      console.error('Failed to respond to request:', error);
    }
  };

  const friendList = friends.data || [];
  const filteredFriends = activeTab === 'all'
    ? friendList
    : friendList.filter(f => f.tier === activeTab);

  const pendingRequests = friendRequests?.filter(req => req.status === 'pending') || [];

  return (
    <Card elevation={1} sx={{ mt: 1, mb: 2 }}>
      <CardHeader
        title="Your Friends"
        subheader={
          showSearchResults 
            ? `Search results (${searchResults?.length || 0})`
            : `${filteredFriends.length} ${activeTab !== 'all' ? activeTab : ''} friends`
        }
        action={
          <Box display="flex" gap={1}>
            <Tooltip title="Friend requests">
              <IconButton 
                onClick={() => setShowRequests(!showRequests)}
                color={pendingRequests.length > 0 ? 'primary' : 'default'}
              >
                <Badge badgeContent={pendingRequests.length} color="primary">
                  <PersonAdd />
                </Badge>
              </IconButton>
            </Tooltip>
            <IconButton onClick={() => setShowSearchResults(!showSearchResults)}>
              <Search />
            </IconButton>
            <IconButton>
              <FilterList />
            </IconButton>
          </Box>
        }
        sx={{ pt: 1, pb: 0.5 }}
      />

      {showSearchResults && (
        <Box px={2} pb={2}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search friends..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              handleSearch(e.target.value);
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
          />
        </Box>
      )}

      {showRequests && pendingRequests.length > 0 && (
        <Box px={2} pb={2}>
          <Typography variant="subtitle2" gutterBottom>
            Pending Friend Requests ({pendingRequests.length})
          </Typography>
          {pendingRequests.map((request) => (
            <Box 
              key={request.id} 
              display="flex" 
              alignItems="center" 
              justifyContent="space-between"
              mb={2}
              p={1.5}
              sx={{ 
                backgroundColor: theme.palette.action.hover,
                borderRadius: 1
              }}
            >
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar 
                  src={request.requester.profileImage || '/default-avatar.png'} 
                  sx={{ width: 40, height: 40 }}
                />
                <Box>
                  <Typography variant="subtitle2">
                    {request.requester.firstName} {request.requester.lastName}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {formatDistanceToNow(new Date(request.createdAt))} ago
                  </Typography>
                </Box>
              </Box>
              <Box display="flex" gap={1}>
                <IconButton 
                  color="success" 
                  onClick={() => handleRespondToRequest(request.id, true)}
                >
                  <CheckCircle />
                </IconButton>
                <IconButton 
                  color="error" 
                  onClick={() => handleRespondToRequest(request.id, false)}
                >
                  <Cancel />
                </IconButton>
              </Box>
            </Box>
          ))}
        </Box>
      )}

      <Tabs
        value={activeTab}
        onChange={(e, value) => setActiveTab(value)}
        variant="scrollable"
        scrollButtons="auto"
        indicatorColor="primary"
        textColor="primary"
        sx={{ px: 2 }}
      >
        <Tab label="All" value="all" />
        <Tab label="Close" value="close" />
        <Tab label="Family" value="family" />
        <Tab label="Colleagues" value="colleagues" />
      </Tabs>

      <CardContent sx={{ pt: 0.5, pb: 1 }}>
        {isLoading ? (
          <Box display="flex" justifyContent="center" p={4}>
            <CircularProgress />
          </Box>
        ) : showSearchResults ? (
          searchResults?.length > 0 ? (
            <Grid container spacing={2}>
              {searchResults.map((user) => (
                <Grid item xs={12} sm={6} md={4} key={user.id}>
                  <FriendCard 
                    user={user}
                    isFriend={friendList.some(f => f.friend.id === user.id)}
                    onMessage={() => setChatFriend(user)}
                    isMobile={isMobile}
                  />
                </Grid>
              ))}
            </Grid>
          ) : (
            <EmptyState
              icon={<Search fontSize="large" />}
              title="No results found"
              subtitle="Try a different search term"
            />
          )
        ) : filteredFriends.length === 0 ? (
          <EmptyState
            icon={<PersonAdd fontSize="large" />}
            title={`No ${activeTab !== 'all' ? activeTab : ''} friends yet`}
            subtitle={activeTab === 'all' ? "Start by adding some friends!" : `You haven't marked any friends as ${activeTab} yet`}
          />
        ) : (
          <Grid container spacing={2}>
            {filteredFriends.map(({ id, friend, tier, lastInteraction }) => {
              return (
                <Grid item xs={12} sm={6} md={4} key={id}>
                  <Card variant="outlined" sx={{ height: '100%' }}>
                    <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box position="relative">
                        <Avatar
                          src={friend.profileImage || '/default-avatar.png'}
                          sx={{ width: isMobile ? 48 : 56, height: isMobile ? 48 : 56 }}
                        />
                        {friend.isOnline && (
                          <Box
                            sx={{
                              position: 'absolute',
                              bottom: 0,
                              right: 0,
                              width: 12,
                              height: 12,
                              backgroundColor: 'success.main',
                              borderRadius: '50%',
                              border: `2px solid ${theme.palette.background.paper}`
                            }}
                          />
                        )}
                      </Box>
                      <Box flexGrow={1}>
                        <Typography variant="subtitle1" noWrap>
                          {friend.firstName} {friend.lastName}
                        </Typography>
                        <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                          {tier !== 'regular' && (
                            <Chip 
                              label={tier} 
                              size="small" 
                              color={
                                tier === 'close' ? 'primary' : 
                                tier === 'family' ? 'secondary' : 'default'
                              }
                            />
                          )}
                          {lastInteraction && (
                            <Typography variant="caption" color="text.secondary">
                              {formatDistanceToNow(new Date(lastInteraction))} ago
                            </Typography>
                          )}
                        </Box>
                      </Box>
                      <IconButton
                        onClick={(e) => {
                          setAnchorEl(e.currentTarget);
                          setSelectedFriend({ id, tier });
                        }}
                      >
                        <MoreVert />
                      </IconButton>
                    </CardContent>
                    <Divider />
                    <Box
                      display="flex"
                      flexDirection={isMobile ? 'column' : 'row'}
                      justifyContent="flex-end"
                      gap={1}
                      px={2}
                      py={1.5}
                    >
                      <Button
                        size="small"
                        fullWidth={isMobile}
                        variant="outlined"
                        startIcon={<Message />}
                        onClick={() => setChatFriend(friend)}
                        disabled={!friend.isOnline}
                      >
                        Message
                      </Button>
                      <Button
                        size="small"
                        fullWidth={isMobile}
                        variant="outlined"
                        color="error"
                        startIcon={<PersonRemove />}
                        onClick={() => {
                          setFriendToRemove(id);
                          setConfirmOpen(true);
                        }}
                      >
                        Remove
                      </Button>
                    </Box>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        )}
        
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
        >
          <MenuItem onClick={() => handleUpdateTier(selectedFriend?.id, 'close')}>
            Mark as Close Friend
          </MenuItem>
          <MenuItem onClick={() => handleUpdateTier(selectedFriend?.id, 'family')}>
            Mark as Family
          </MenuItem>
          <MenuItem onClick={() => handleUpdateTier(selectedFriend?.id, 'colleagues')}>
            Mark as Colleague
          </MenuItem>
          <MenuItem onClick={() => handleUpdateTier(selectedFriend?.id, 'regular')}>
            Reset to Regular
          </MenuItem>
        </Menu>

        <ConfirmationDialog
          open={confirmOpen}
          onClose={() => setConfirmOpen(false)}
          onConfirm={handleRemoveFriend}
          title="Remove Friend?"
          content="Are you sure you want to remove this friend? This action cannot be undone."
        />

        <ChatPreviewModal
          open={!!chatFriend}
          friend={chatFriend}
          onClose={() => setChatFriend(null)}
        />
      </CardContent>
    </Card>
  );
};

const FriendCard = ({ user, isFriend, onMessage, isMobile }) => {
  return (
    <Card variant="outlined">
      <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Avatar
          src={user.profileImage || '/default-avatar.png'}
          sx={{ width: isMobile ? 48 : 56, height: isMobile ? 48 : 56 }}
        />
        <Box flexGrow={1}>
          <Typography variant="subtitle1" noWrap>
            {user.firstName} {user.lastName}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {user.mutualFriends} mutual friends
          </Typography>
        </Box>
      </CardContent>
      <Box display="flex" gap={1} p={2}>
        {isFriend ? (
          <Button
            fullWidth
            variant="outlined"
            startIcon={<Message />}
            onClick={onMessage}
          >
            Message
          </Button>
        ) : (
          <Button
            fullWidth
            variant="contained"
            startIcon={<PersonAdd />}
          >
            Add Friend
          </Button>
        )}
      </Box>
    </Card>
  );
};

const ChatPreviewModal = ({ open, onClose, friend }) => {
  const user = useSelector((state) => state.user.profile);
  const [messageText, setMessageText] = useState('');

  const handleSend = () => {
    if (!messageText.trim() || !user || !friend) return;

    const payload = {
      senderId: user.id,
      receiverId: friend.id,
      content: messageText,
      timestamp: new Date().toISOString(),
    };

    socket.emit('private_message', payload);
    setMessageText('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <Avatar
            src={friend?.profileImage || '/default-avatar.png'}
            sx={{ width: 32, height: 32 }}
          />
          Message {friend?.firstName}
        </Box>
      </DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          multiline
          rows={4}
          fullWidth
          variant="outlined"
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          placeholder={`Write a message to ${friend?.firstName}...`}
          sx={{ mt: 2 }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button 
          variant="contained" 
          onClick={handleSend} 
          disabled={!messageText.trim()}
          color="primary"
        >
          Send
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FriendsListCard;