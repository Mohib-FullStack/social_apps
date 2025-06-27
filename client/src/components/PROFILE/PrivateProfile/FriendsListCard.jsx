 // src/components/PROFILE/PrivateProfile/FriendsListCard.jsx
import {
  Cancel,
  CheckCircle,
  FilterList,
  Message,
  MoreVert,
  PersonAdd,
  PersonRemove,
  Search,
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
  useTheme,
} from '@mui/material';
import { formatDistanceToNow } from 'date-fns';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  // getFriendRequests,
  getFriends,
  removeFriend,
  // respondToFriendRequest,
  // searchFriends,
  updateFriendshipTier,
} from '../../../features/friendship/friendshipSlice';
import { startLoading, stopLoading } from '../../../features/loading/loadingSlice';
import { showSnackbar } from '../../../features/snackbar/snackbarSlice';
import socket from '../../../utils/socket';
import ConfirmationDialog from '../../common/ConfirmationDialog';
import EmptyState from '../../common/EmptyState';

const countFriendsByTier = (friends) => {
  return friends.reduce((acc, { tier }) => {
    acc[tier] = (acc[tier] || 0) + 1;
    acc.total = (acc.total || 0) + 1;
    return acc;
  }, {});
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
        <Box display="flex" alignItems="center" gap={2} mb={2}>
          <Avatar
            src={friend?.profileImage || '/default-avatar.png'}
            sx={{ width: 48, height: 48 }}
          />
          <Typography variant="subtitle1">
            {friend?.firstName} {friend?.lastName}
          </Typography>
        </Box>
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

const FriendCard = ({
  user,
  isFriend,
  onMessage,
  isMobile,
  friendCount,
  tier,
  lastInteraction,
  onRemove,
  onUpdateTier,
}) => {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState(null);

  return (
    <Card variant="outlined" sx={{ height: '100%' }}>
      <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box position="relative">
          <Badge
            badgeContent={friendCount > 0 ? `${friendCount} friends` : null}
            color="primary"
            sx={{
              '& .MuiBadge-badge': {
                fontSize: '0.6rem',
                height: 18,
                minWidth: 18,
                padding: '0 4px',
                top: 5,
                right: 5,
                borderRadius: '4px',
              },
            }}
          >
            <Avatar
              src={user.profileImage || '/default-avatar.png'}
              sx={{ width: isMobile ? 48 : 56, height: isMobile ? 48 : 56 }}
            />
          </Badge>
          {user.isOnline && (
            <Box
              sx={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                width: 12,
                height: 12,
                backgroundColor: 'success.main',
                borderRadius: '50%',
                border: `2px solid ${theme.palette.background.paper}`,
              }}
            />
          )}
        </Box>
        <Box flexGrow={1}>
          <Typography variant="subtitle1" noWrap>
            {user.firstName} {user.lastName}
          </Typography>
          {tier && (
            <Box display="flex" alignItems="center" gap={1} mt={0.5}>
              <Chip
                label={tier}
                size="small"
                color={
                  tier === 'close'
                    ? 'primary'
                    : tier === 'family'
                    ? 'secondary'
                    : tier === 'colleague'
                    ? 'info'
                    : 'default'
                }
              />
              {lastInteraction && (
                <Typography variant="caption" color="text.secondary">
                  {formatDistanceToNow(new Date(lastInteraction))} ago
                </Typography>
              )}
            </Box>
          )}
        </Box>
        {isFriend && (
          <IconButton
            onClick={(e) => {
              setAnchorEl(e.currentTarget);
            }}
          >
            <MoreVert />
          </IconButton>
        )}
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
        {isFriend ? (
          <>
            <Button
              size="small"
              fullWidth={isMobile}
              variant="outlined"
              startIcon={<Message />}
              onClick={onMessage}
            >
              Message
            </Button>
            <Button
              size="small"
              fullWidth={isMobile}
              variant="outlined"
              color="error"
              startIcon={<PersonRemove />}
              onClick={onRemove}
            >
              Remove
            </Button>
          </>
        ) : (
          <Button fullWidth variant="contained" startIcon={<PersonAdd />}>
            Add Friend
          </Button>
        )}
      </Box>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem
          onClick={() => {
            onUpdateTier('close');
            setAnchorEl(null);
          }}
        >
          Mark as Close Friend
        </MenuItem>
        <MenuItem
          onClick={() => {
            onUpdateTier('family');
            setAnchorEl(null);
          }}
        >
          Mark as Family
        </MenuItem>
        <MenuItem
          onClick={() => {
            onUpdateTier('colleague');
            setAnchorEl(null);
          }}
        >
          Mark as Colleague
        </MenuItem>
        <MenuItem
          onClick={() => {
            onUpdateTier('regular');
            setAnchorEl(null);
          }}
        >
          Reset to Regular
        </MenuItem>
      </Menu>
    </Card>
  );
};

const FriendsList = () => {
  const dispatch = useDispatch();
  const { profile } = useSelector((state) => state.user);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const {
    friendsByUser,
    friendRequests,
    searchResults,
    status: friendshipStatus,
  } = useSelector((state) => state.friendship);

  const [activeTab, setActiveTab] = useState('all');
  const [chatFriend, setChatFriend] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [friendToRemove, setFriendToRemove] = useState(null);
  const [showRequests, setShowRequests] = useState(false);

  const friends = friendsByUser[profile?.id] || { data: [] };
  const friendCounts = countFriendsByTier(friends.data);
  const isLoading = friendshipStatus === 'loading';
  const pendingRequests =
    friendRequests?.filter((req) => req.status === 'pending') || [];
  const friendList = friends.data || [];
  const filteredFriends =
    activeTab === 'all'
      ? friendList
      : friendList.filter((f) => f.tier === activeTab);

  useEffect(() => {
    if (!profile?.id) return;

    const loadData = async () => {
      dispatch(startLoading({ message: 'Loading friends...', animationType: 'wave' }));
      try {
        await dispatch(getFriends({ userId: profile.id })).unwrap();
        await dispatch(getFriendRequests()).unwrap();
      } catch (err) {
        console.error('Failed to load friends:', err);
        dispatch(showSnackbar({ message: 'Failed to load friends', severity: 'error' }));
      } finally {
        dispatch(stopLoading());
      }
    };

    loadData();
  }, [dispatch, profile?.id]);

  const handleSearch = async (query) => {
    if (query.trim().length > 2) {
      dispatch(startLoading({ message: 'Searching friends...', animationType: 'wave' }));
      try {
        await dispatch(searchFriends(query)).unwrap();
        setShowSearchResults(true);
      } catch (error) {
        console.error('Search failed:', error);
        dispatch(showSnackbar({ message: 'Search failed', severity: 'error' }));
      } finally {
        dispatch(stopLoading());
      }
    } else {
      setShowSearchResults(false);
    }
  };

  const handleRemoveFriend = async () => {
    if (!friendToRemove) return;
    dispatch(startLoading({ message: 'Removing friend...', animationType: 'wave' }));
    try {
      await dispatch(removeFriend(friendToRemove)).unwrap();
      dispatch(showSnackbar({ message: 'Friend removed successfully.', severity: 'success' }));
      setFriendToRemove(null);
      setConfirmOpen(false);
    } catch (error) {
      console.error('Failed to remove friend:', error);
      dispatch(showSnackbar({ message: 'Failed to remove friend', severity: 'error' }));
    } finally {
      dispatch(stopLoading());
    }
  };

  const handleUpdateTier = async (friendId, tier) => {
    dispatch(startLoading({ message: `Updating tier to ${tier}...`, animationType: 'wave' }));
    try {
      await dispatch(updateFriendshipTier({ friendshipId: friendId, tier })).unwrap();
      await dispatch(getFriends({ userId: profile.id })).unwrap();
      dispatch(showSnackbar({ message: 'Friend tier updated.', severity: 'success' }));
    } catch (error) {
      console.error('Failed to update friend tier:', error);
      dispatch(showSnackbar({ message: 'Tier update failed', severity: 'error' }));
    } finally {
      dispatch(stopLoading());
    }
  };

  const handleRespondToRequest = async (requestId, accept) => {
    dispatch(startLoading({ message: `${accept ? 'Accepting' : 'Rejecting'} friend request...`, animationType: 'wave' }));
    try {
      await dispatch(respondToFriendRequest({ requestId, accept })).unwrap();
      await dispatch(getFriendRequests()).unwrap();
      await dispatch(getFriends({ userId: profile.id })).unwrap();
      dispatch(showSnackbar({
        message: accept ? 'Friend request accepted!' : 'Friend request declined.',
        severity: accept ? 'success' : 'warning',
      }));
    } catch (error) {
      console.error('Failed to respond to request:', error);
      dispatch(showSnackbar({ message: 'Failed to process friend request.', severity: 'error' }));
    } finally {
      dispatch(stopLoading());
    }
  };

  return (
    <Card elevation={1} sx={{ mb: 2 }}>
      <CardHeader
        title={
          <Box display="flex" alignItems="center" gap={2}>
            <Typography variant="h6">Your Friends</Typography>
            <Badge
              badgeContent={friendCounts.total || 0}
              color="primary"
              sx={{
                '& .MuiBadge-badge': {
                  right: -10,
                  top: 13,
                  fontSize: '0.75rem',
                  height: 20,
                  minWidth: 20,
                  padding: '0 4px',
                },
              }}
            />
          </Box>
        }
        subheader={
          showSearchResults
            ? `Search results (${searchResults?.length || 0})`
            : `${filteredFriends.length} ${
                activeTab !== 'all' ? activeTab : ''
              } friends`
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
            <IconButton
              onClick={() => setShowSearchResults(!showSearchResults)}
            >
              <Search />
            </IconButton>
            <IconButton>
              <FilterList />
            </IconButton>
          </Box>
        }
        sx={{ py: 1 }}
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
                borderRadius: 1,
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
        sx={{ px: 1 }}
      >
        <Tab
          label={
            <Box display="flex" alignItems="center" gap={1}>
              <span>All</span>
              {friendCounts.total > 0 && (
                <Chip
                  label={friendCounts.total}
                  size="small"
                  color="default"
                  sx={{ height: 20, fontSize: '0.75rem' }}
                />
              )}
            </Box>
          }
          value="all"
        />
        <Tab
          label={
            <Box display="flex" alignItems="center" gap={1}>
              <span>Close</span>
              {friendCounts.close > 0 && (
                <Chip
                  label={friendCounts.close}
                  size="small"
                  color="primary"
                  sx={{ height: 20, fontSize: '0.75rem' }}
                />
              )}
            </Box>
          }
          value="close"
        />
        <Tab
          label={
            <Box display="flex" alignItems="center" gap={1}>
              <span>Family</span>
              {friendCounts.family > 0 && (
                <Chip
                  label={friendCounts.family}
                  size="small"
                  color="secondary"
                  sx={{ height: 20, fontSize: '0.75rem' }}
                />
              )}
            </Box>
          }
          value="family"
        />
        <Tab
          label={
            <Box display="flex" alignItems="center" gap={1}>
              <span>Colleague</span>
              {friendCounts.colleague > 0 && (
                <Chip
                  label={friendCounts.colleague}
                  size="small"
                  color="info"
                  sx={{ height: 20, fontSize: '0.75rem' }}
                />
              )}
            </Box>
          }
          value="colleague"
        />
      </Tabs>

      <CardContent sx={{ py: 1 }}>
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
                    isFriend={friendList.some((f) => f.friend.id === user.id)}
                    onMessage={() => setChatFriend(user)}
                    isMobile={isMobile}
                    friendCount={friendCounts.total}
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
            subtitle={
              activeTab === 'all'
                ? 'Start by adding some friends!'
                : `You haven't marked any friends as ${activeTab} yet`
            }
          />
        ) : (
          <Grid container spacing={2}>
            {filteredFriends.map(({ id, friend, tier, lastInteraction }) => (
              <Grid item xs={12} sm={6} md={4} key={id}>
                <FriendCard
                  user={friend}
                  isFriend={true}
                  onMessage={() => setChatFriend(friend)}
                  isMobile={isMobile}
                  friendCount={friendCounts.total}
                  tier={tier}
                  lastInteraction={lastInteraction}
                  onRemove={() => {
                    setFriendToRemove(id);
                    setConfirmOpen(true);
                  }}
                  onUpdateTier={(newTier) => handleUpdateTier(id, newTier)}
                />
              </Grid>
            ))}
          </Grid>
        )}

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

export default FriendsList;
//! original
// import {
//   Cancel,
//   CheckCircle,
//   FilterList,
//   Message,
//   MoreVert,
//   PersonAdd,
//   PersonRemove,
//   Search,
// } from '@mui/icons-material';
// import {
//   Avatar,
//   Badge,
//   Box,
//   Button,
//   Card,
//   CardContent,
//   CardHeader,
//   Chip,
//   CircularProgress,
//   Dialog,
//   DialogActions,
//   DialogContent,
//   DialogTitle,
//   Divider,
//   Grid,
//   IconButton,
//   InputAdornment,
//   Menu,
//   MenuItem,
//   Tab,
//   Tabs,
//   TextField,
//   Tooltip,
//   Typography,
//   useMediaQuery,
//   useTheme,
// } from '@mui/material';
// import { formatDistanceToNow } from 'date-fns';
// import { useEffect, useState } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import {
//   // getFriendRequests,
//   getFriends,
//   removeFriend,
//   // respondToFriendRequest,
//   updateFriendshipTier,
// } from '../../../features/friendship/friendshipSlice';
// import socket from '../../../utils/socket';
// import ConfirmationDialog from '../../common/ConfirmationDialog';
// import EmptyState from '../../common/EmptyState';

// const countFriendsByTier = (friends) => {
//   return friends.reduce((acc, { tier }) => {
//     acc[tier] = (acc[tier] || 0) + 1;
//     acc.total = (acc.total || 0) + 1;
//     return acc;
//   }, {});
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

//     socket.emit('private_message', payload);
//     setMessageText('');
//     onClose();
//   };

//   return (
//     <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
//       <DialogTitle>
//         <Box display="flex" alignItems="center" gap={1}>
//           <Avatar
//             src={friend?.profileImage || '/default-avatar.png'}
//             sx={{ width: 32, height: 32 }}
//           />
//           Message {friend?.firstName}
//         </Box>
//       </DialogTitle>
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
//           rows={4}
//           fullWidth
//           variant="outlined"
//           value={messageText}
//           onChange={(e) => setMessageText(e.target.value)}
//           placeholder={`Write a message to ${friend?.firstName}...`}
//           sx={{ mt: 2 }}
//         />
//       </DialogContent>
//       <DialogActions>
//         <Button onClick={onClose}>Cancel</Button>
//         <Button
//           variant="contained"
//           onClick={handleSend}
//           disabled={!messageText.trim()}
//           color="primary"
//         >
//           Send
//         </Button>
//       </DialogActions>
//     </Dialog>
//   );
// };

// const FriendCard = ({
//   user,
//   isFriend,
//   onMessage,
//   isMobile,
//   friendCount,
//   tier,
//   lastInteraction,
//   onRemove,
//   onUpdateTier,
// }) => {
//   const theme = useTheme();
//   const [anchorEl, setAnchorEl] = useState(null);

//   return (
//     <Card variant="outlined" sx={{ height: '100%' }}>
//       <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
//         <Box position="relative">
//           <Badge
//             badgeContent={friendCount > 0 ? `${friendCount} friends` : null}
//             color="primary"
//             sx={{
//               '& .MuiBadge-badge': {
//                 fontSize: '0.6rem',
//                 height: 18,
//                 minWidth: 18,
//                 padding: '0 4px',
//                 top: 5,
//                 right: 5,
//                 borderRadius: '4px',
//               },
//             }}
//           >
//             <Avatar
//               src={user.profileImage || '/default-avatar.png'}
//               sx={{ width: isMobile ? 48 : 56, height: isMobile ? 48 : 56 }}
//             />
//           </Badge>
//           {user.isOnline && (
//             <Box
//               sx={{
//                 position: 'absolute',
//                 bottom: 0,
//                 right: 0,
//                 width: 12,
//                 height: 12,
//                 backgroundColor: 'success.main',
//                 borderRadius: '50%',
//                 border: `2px solid ${theme.palette.background.paper}`,
//               }}
//             />
//           )}
//         </Box>
//         <Box flexGrow={1}>
//           <Typography variant="subtitle1" noWrap>
//             {user.firstName} {user.lastName}
//           </Typography>
//           {tier && (
//             <Box display="flex" alignItems="center" gap={1} mt={0.5}>
//               <Chip
//                 label={tier}
//                 size="small"
//                 color={
//                   tier === 'close'
//                     ? 'primary'
//                     : tier === 'family'
//                     ? 'secondary'
//                     : tier === 'colleague'
//                     ? 'info'
//                     : 'default'
//                 }
//               />
//               {lastInteraction && (
//                 <Typography variant="caption" color="text.secondary">
//                   {formatDistanceToNow(new Date(lastInteraction))} ago
//                 </Typography>
//               )}
//             </Box>
//           )}
//         </Box>
//         {isFriend && (
//           <IconButton
//             onClick={(e) => {
//               setAnchorEl(e.currentTarget);
//             }}
//           >
//             <MoreVert />
//           </IconButton>
//         )}
//       </CardContent>
//       <Divider />
//       <Box
//         display="flex"
//         flexDirection={isMobile ? 'column' : 'row'}
//         justifyContent="flex-end"
//         gap={1}
//         px={2}
//         py={1.5}
//       >
//         {isFriend ? (
//           <>
//             <Button
//               size="small"
//               fullWidth={isMobile}
//               variant="outlined"
//               startIcon={<Message />}
//               onClick={onMessage}
//             >
//               Message
//             </Button>
//             <Button
//               size="small"
//               fullWidth={isMobile}
//               variant="outlined"
//               color="error"
//               startIcon={<PersonRemove />}
//               onClick={onRemove}
//             >
//               Remove
//             </Button>
//           </>
//         ) : (
//           <Button fullWidth variant="contained" startIcon={<PersonAdd />}>
//             Add Friend
//           </Button>
//         )}
//       </Box>

//       <Menu
//         anchorEl={anchorEl}
//         open={Boolean(anchorEl)}
//         onClose={() => setAnchorEl(null)}
//       >
//         <MenuItem
//           onClick={() => {
//             onUpdateTier('close');
//             setAnchorEl(null);
//           }}
//         >
//           Mark as Close Friend
//         </MenuItem>
//         <MenuItem
//           onClick={() => {
//             onUpdateTier('family');
//             setAnchorEl(null);
//           }}
//         >
//           Mark as Family
//         </MenuItem>
//         <MenuItem
//           onClick={() => {
//             onUpdateTier('colleague');
//             setAnchorEl(null);
//           }}
//         >
//           Mark as Colleague
//         </MenuItem>
//         <MenuItem
//           onClick={() => {
//             onUpdateTier('regular');
//             setAnchorEl(null);
//           }}
//         >
//           Reset to Regular
//         </MenuItem>
//       </Menu>
//     </Card>
//   );
// };

// const FriendsList = () => {
//   const dispatch = useDispatch();
//   const { profile } = useSelector((state) => state.user);
//   const theme = useTheme();
//   const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

//   const {
//     friendsByUser,
//     friendRequests,
//     searchResults,
//     status: friendshipStatus,
//   } = useSelector((state) => state.friendship);

//   const [loading, setLoading] = useState(false);
//   const [activeTab, setActiveTab] = useState('all');
//   const [chatFriend, setChatFriend] = useState(null);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [showSearchResults, setShowSearchResults] = useState(false);
//   const [confirmOpen, setConfirmOpen] = useState(false);
//   const [friendToRemove, setFriendToRemove] = useState(null);
//   const [showRequests, setShowRequests] = useState(false);

//   const friends = friendsByUser[profile?.id] || { data: [] };
//   const friendCounts = countFriendsByTier(friends.data);
//   const isLoading = friendshipStatus === 'loading';
//   const pendingRequests =
//     friendRequests?.filter((req) => req.status === 'pending') || [];
//   const friendList = friends.data || [];
//   const filteredFriends =
//     activeTab === 'all'
//       ? friendList
//       : friendList.filter((f) => f.tier === activeTab);

//   useEffect(() => {
//     if (!profile?.id) return;

//     const loadData = async () => {
//       setLoading(true);
//       try {
//         await dispatch(getFriends({ userId: profile.id })).unwrap();
//         await dispatch(getFriendRequests()).unwrap();
//       } catch (err) {
//         console.error('Failed to load friends:', err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     loadData();
//   }, [dispatch, profile?.id]);

//   const handleSearch = async (query) => {
//     if (query.trim().length > 2) {
//       try {
//         await dispatch(searchFriends(query)).unwrap();
//         setShowSearchResults(true);
//       } catch (error) {
//         console.error('Search failed:', error);
//       }
//     } else {
//       setShowSearchResults(false);
//     }
//   };

//   const handleRemoveFriend = async () => {
//     if (!friendToRemove) return;
//     try {
//       await dispatch(removeFriend(friendToRemove)).unwrap();
//       setFriendToRemove(null);
//       setConfirmOpen(false);
//     } catch (error) {
//       console.error('Failed to remove friend:', error);
//     }
//   };

//   const handleUpdateTier = async (friendId, tier) => {
//     try {
//       await dispatch(
//         updateFriendshipTier({ friendshipId: friendId, tier })
//       ).unwrap();
//       await dispatch(getFriends({ userId: profile.id })).unwrap();
//     } catch (error) {
//       console.error('Failed to update friend tier:', error);
//     }
//   };

//   const handleRespondToRequest = async (requestId, accept) => {
//     try {
//       await dispatch(respondToFriendRequest({ requestId, accept })).unwrap();
//       await dispatch(getFriendRequests()).unwrap();
//       await dispatch(getFriends({ userId: profile.id })).unwrap();
//     } catch (error) {
//       console.error('Failed to respond to request:', error);
//     }
//   };

//   return (
//     <Card elevation={1} sx={{ mb: 2 }}>
//       <CardHeader
//         title={
//           <Box display="flex" alignItems="center" gap={2}>
//             <Typography variant="h6">Your Friends</Typography>
//             <Badge
//               badgeContent={friendCounts.total || 0}
//               color="primary"
//               sx={{
//                 '& .MuiBadge-badge': {
//                   right: -10,
//                   top: 13,
//                   fontSize: '0.75rem',
//                   height: 20,
//                   minWidth: 20,
//                   padding: '0 4px',
//                 },
//               }}
//             />
//           </Box>
//         }
//         subheader={
//           showSearchResults
//             ? `Search results (${searchResults?.length || 0})`
//             : `${filteredFriends.length} ${
//                 activeTab !== 'all' ? activeTab : ''
//               } friends`
//         }
//         action={
//           <Box display="flex" gap={1}>
//             <Tooltip title="Friend requests">
//               <IconButton
//                 onClick={() => setShowRequests(!showRequests)}
//                 color={pendingRequests.length > 0 ? 'primary' : 'default'}
//               >
//                 <Badge badgeContent={pendingRequests.length} color="primary">
//                   <PersonAdd />
//                 </Badge>
//               </IconButton>
//             </Tooltip>
//             <IconButton
//               onClick={() => setShowSearchResults(!showSearchResults)}
//             >
//               <Search />
//             </IconButton>
//             <IconButton>
//               <FilterList />
//             </IconButton>
//           </Box>
//         }
//         sx={{ py: 1 }}
//       />

//       {showSearchResults && (
//         <Box px={2} pb={2}>
//           <TextField
//             fullWidth
//             variant="outlined"
//             placeholder="Search friends..."
//             value={searchQuery}
//             onChange={(e) => {
//               setSearchQuery(e.target.value);
//               handleSearch(e.target.value);
//             }}
//             InputProps={{
//               startAdornment: (
//                 <InputAdornment position="start">
//                   <Search />
//                 </InputAdornment>
//               ),
//             }}
//           />
//         </Box>
//       )}

//       {showRequests && pendingRequests.length > 0 && (
//         <Box px={2} pb={2}>
//           <Typography variant="subtitle2" gutterBottom>
//             Pending Friend Requests ({pendingRequests.length})
//           </Typography>
//           {pendingRequests.map((request) => (
//             <Box
//               key={request.id}
//               display="flex"
//               alignItems="center"
//               justifyContent="space-between"
//               mb={2}
//               p={1.5}
//               sx={{
//                 backgroundColor: theme.palette.action.hover,
//                 borderRadius: 1,
//               }}
//             >
//               <Box display="flex" alignItems="center" gap={2}>
//                 <Avatar
//                   src={request.requester.profileImage || '/default-avatar.png'}
//                   sx={{ width: 40, height: 40 }}
//                 />
//                 <Box>
//                   <Typography variant="subtitle2">
//                     {request.requester.firstName} {request.requester.lastName}
//                   </Typography>
//                   <Typography variant="caption" color="text.secondary">
//                     {formatDistanceToNow(new Date(request.createdAt))} ago
//                   </Typography>
//                 </Box>
//               </Box>
//               <Box display="flex" gap={1}>
//                 <IconButton
//                   color="success"
//                   onClick={() => handleRespondToRequest(request.id, true)}
//                 >
//                   <CheckCircle />
//                 </IconButton>
//                 <IconButton
//                   color="error"
//                   onClick={() => handleRespondToRequest(request.id, false)}
//                 >
//                   <Cancel />
//                 </IconButton>
//               </Box>
//             </Box>
//           ))}
//         </Box>
//       )}

//       <Tabs
//         value={activeTab}
//         onChange={(e, value) => setActiveTab(value)}
//         variant="scrollable"
//         scrollButtons="auto"
//         indicatorColor="primary"
//         textColor="primary"
//         sx={{ px: 1 }}
//       >
//         <Tab
//           label={
//             <Box display="flex" alignItems="center" gap={1}>
//               <span>All</span>
//               {friendCounts.total > 0 && (
//                 <Chip
//                   label={friendCounts.total}
//                   size="small"
//                   color="default"
//                   sx={{ height: 20, fontSize: '0.75rem' }}
//                 />
//               )}
//             </Box>
//           }
//           value="all"
//         />
//         <Tab
//           label={
//             <Box display="flex" alignItems="center" gap={1}>
//               <span>Close</span>
//               {friendCounts.close > 0 && (
//                 <Chip
//                   label={friendCounts.close}
//                   size="small"
//                   color="primary"
//                   sx={{ height: 20, fontSize: '0.75rem' }}
//                 />
//               )}
//             </Box>
//           }
//           value="close"
//         />
//         <Tab
//           label={
//             <Box display="flex" alignItems="center" gap={1}>
//               <span>Family</span>
//               {friendCounts.family > 0 && (
//                 <Chip
//                   label={friendCounts.family}
//                   size="small"
//                   color="secondary"
//                   sx={{ height: 20, fontSize: '0.75rem' }}
//                 />
//               )}
//             </Box>
//           }
//           value="family"
//         />
//         <Tab
//           label={
//             <Box display="flex" alignItems="center" gap={1}>
//               <span>Colleague</span>
//               {friendCounts.colleague > 0 && (
//                 <Chip
//                   label={friendCounts.colleague}
//                   size="small"
//                   color="info"
//                   sx={{ height: 20, fontSize: '0.75rem' }}
//                 />
//               )}
//             </Box>
//           }
//           value="colleague"
//         />
//       </Tabs>

//       <CardContent sx={{ py: 1 }}>
//         {isLoading ? (
//           <Box display="flex" justifyContent="center" p={4}>
//             <CircularProgress />
//           </Box>
//         ) : showSearchResults ? (
//           searchResults?.length > 0 ? (
//             <Grid container spacing={2}>
//               {searchResults.map((user) => (
//                 <Grid item xs={12} sm={6} md={4} key={user.id}>
//                   <FriendCard
//                     user={user}
//                     isFriend={friendList.some((f) => f.friend.id === user.id)}
//                     onMessage={() => setChatFriend(user)}
//                     isMobile={isMobile}
//                     friendCount={friendCounts.total}
//                   />
//                 </Grid>
//               ))}
//             </Grid>
//           ) : (
//             <EmptyState
//               icon={<Search fontSize="large" />}
//               title="No results found"
//               subtitle="Try a different search term"
//             />
//           )
//         ) : filteredFriends.length === 0 ? (
//           <EmptyState
//             icon={<PersonAdd fontSize="large" />}
//             title={`No ${activeTab !== 'all' ? activeTab : ''} friends yet`}
//             subtitle={
//               activeTab === 'all'
//                 ? 'Start by adding some friends!'
//                 : `You haven't marked any friends as ${activeTab} yet`
//             }
//           />
//         ) : (
//           <Grid container spacing={2}>
//             {filteredFriends.map(({ id, friend, tier, lastInteraction }) => (
//               <Grid item xs={12} sm={6} md={4} key={id}>
//                 <FriendCard
//                   user={friend}
//                   isFriend={true}
//                   onMessage={() => setChatFriend(friend)}
//                   isMobile={isMobile}
//                   friendCount={friendCounts.total}
//                   tier={tier}
//                   lastInteraction={lastInteraction}
//                   onRemove={() => {
//                     setFriendToRemove(id);
//                     setConfirmOpen(true);
//                   }}
//                   onUpdateTier={(newTier) => handleUpdateTier(id, newTier)}
//                 />
//               </Grid>
//             ))}
//           </Grid>
//         )}

//         <ConfirmationDialog
//           open={confirmOpen}
//           onClose={() => setConfirmOpen(false)}
//           onConfirm={handleRemoveFriend}
//           title="Remove Friend?"
//           content="Are you sure you want to remove this friend? This action cannot be undone."
//         />

//         <ChatPreviewModal
//           open={!!chatFriend}
//           friend={chatFriend}
//           onClose={() => setChatFriend(null)}
//         />
//       </CardContent>
//     </Card>
//   );
// };

// export default FriendsList;
