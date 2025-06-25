import {
  Add as AddIcon,
  ArrowForward as ArrowForwardIcon,
  Check as CheckIcon,
  Edit as EditIcon,
  Event as EventsIcon,
  People as FriendsIcon,
  HourglassEmpty as HourglassEmptyIcon,
  AccountBox as InfoIcon,
  Favorite as LikesIcon,
  Lock as LockIcon,
  PhotoLibrary as MediaIcon,
  Message as MessageIcon,
  Chat as MessagesIcon,
  MoreHoriz as MoreHorizIcon,
  PersonAdd as PersonAddIcon,
  PersonRemove as PersonRemoveIcon,
  PhotoCamera as PhotoCameraIcon // Add this line
  ,
  Article as PostsIcon,
  Security as PrivacyIcon,
  BusinessCenter as ProfessionalIcon,
  Build as ToolsIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';
import OpenInNew from '@mui/icons-material/OpenInNew';
import {
  Avatar,
  Badge,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Tab,
  Tabs,
  TextField,
  ThemeProvider,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
  Zoom
} from '@mui/material';
import PropTypes from 'prop-types';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import theme from '../../../theme';

// Redux actions
import {
  blockUser,
  getFriends,
  removeFriend,
  unblockUser,
  updateFriendshipTier
} from '../../../features/friendship/friendshipSlice';
import { showSnackbar } from '../../../features/snackbar/snackbarSlice';
import {
  fetchUserProfile,
  logoutUser,
  updateCoverImage
} from '../../../features/user/userSlice';

// Utils
import socketService from '../../../utils/socket';

// Components
import CancelRequestButton from './CancelRequestButton';
import DeleteAccountDialog from './DeleteAccountDialog';
import ProfileHeader from './ProfileHeader';
import ProfileInfoSection from './ProfileInfoSection';
import ProfileSkeleton from './ProfileSkeleton';
import ProfileStats from './ProfileStats';

// Constants
const DEFAULT_PROFILE_IMAGE = '/default-avatar.png';
const DEFAULT_COVER_IMAGE = '/default-cover.jpg';
const MAX_COVER_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

const PROFILE_TABS = [
  { label: 'Posts', value: 0 },
  { label: 'About', value: 1 },
  { label: 'Friends', value: 2 },
  { label: 'Photos', value: 3 },
  { label: 'Dashboard', value: 4 }
];

// Chat Preview Modal Component
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

    socketService.emit('private_message', payload);
    setMessageText('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Start Chat</DialogTitle>
      <DialogContent>
        <Box display="flex" alignItems="center" gap={2} mb={2}>
          <Avatar
            src={friend?.profileImage || DEFAULT_PROFILE_IMAGE}
            sx={{ width: 48, height: 48 }}
          />
          <Typography variant="subtitle1">
            {friend?.firstName} {friend?.lastName}
          </Typography>
        </Box>
        <TextField
          autoFocus
          multiline
          rows={3}
          fullWidth
          variant="outlined"
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          placeholder="Write your message..."
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSend} disabled={!messageText.trim()}>
          Send
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Friendship Tier Dialog Component
const FriendshipTierDialog = ({ friendshipId, currentTier }) => {
  const dispatch = useDispatch();
  
  const tiers = [
    { value: 'close', label: 'Close Friends' },
    { value: 'regular', label: 'Regular Friends' },
    { value: 'family', label: 'Family' },
    { value: 'work', label: 'Work' }
  ];

  const handleChange = async (event) => {
    const newTier = event.target.value;
    try {
      await dispatch(updateFriendshipTier({ 
        friendshipId, 
        tier: newTier 
      })).unwrap();
      
      dispatch(showSnackbar({
        message: 'Friendship tier updated successfully',
        severity: 'success'
      }));
    } catch (error) {
      dispatch(showSnackbar({
        message: 'Failed to update friendship tier',
        severity: 'error'
      }));
    }
  };

  return (
    <Tooltip title="Change friendship tier" arrow>
      <FormControl size="small" sx={{ minWidth: 120 }}>
        <InputLabel>Tier</InputLabel>
        <Select
          value={currentTier || 'regular'}
          onChange={handleChange}
          label="Tier"
        >
          {tiers.map((tier) => (
            <MenuItem key={tier.value} value={tier.value}>
              {tier.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Tooltip>
  );
};

// Friends List Card Component
const FriendsListCard = () => {
  const dispatch = useDispatch();
  const { profile } = useSelector((state) => state.user);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const friends = useSelector(
    (state) => state.friendship.friendsByUser[profile?.id] || { data: [] }
  );

  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [chatFriend, setChatFriend] = useState(null);

  useEffect(() => {
    if (!profile?.id) return;
    setLoading(true);
    dispatch(getFriends({ userId: profile.id }))
      .unwrap()
      .catch((err) => {
        console.error('Failed to load friends:', err);
        dispatch(showSnackbar({
          message: 'Failed to load friends list',
          severity: 'error'
        }));
      })
      .finally(() => setLoading(false));
  }, [dispatch, profile?.id]);

  const handleRemove = async (friendshipId) => {
    if (window.confirm('Are you sure you want to remove this friend?')) {
      try {
        await dispatch(removeFriend(friendshipId)).unwrap();
        dispatch(showSnackbar({
          message: 'Friend removed successfully',
          severity: 'success'
        }));
      } catch (error) {
        dispatch(showSnackbar({
          message: 'Failed to remove friend',
          severity: 'error'
        }));
      }
    }
  };

  const mockMutualFriendsCount = (friendId) => {
    const seed = friendId % 5;
    return seed === 0 ? 0 : seed + 1;
  };

  const friendList = friends.data || [];
  const filteredFriends = activeTab === 'all'
    ? friendList
    : friendList.filter(f => f.tier === activeTab);

  return (
    <Card elevation={1} sx={{ mt: 1, mb: 2 }}>
      <CardHeader
        title="Friends"
        subheader={`${filteredFriends.length} ${activeTab !== 'all' ? activeTab : ''} friends`}
        sx={{ pt: 1, pb: 0.5 }}
      />

      <Tabs
        value={activeTab}
        onChange={(e, value) => setActiveTab(value)}
        variant="fullWidth"
        indicatorColor="primary"
        textColor="primary"
      >
        <Tab label="All" value="all" />
        <Tab label="Close" value="close" />
        <Tab label="Family" value="family" />
      </Tabs>

      <CardContent sx={{ pt: 0.5, pb: 1 }}>
        {loading ? (
          <Typography color="text.secondary" align="center">
            Loading friends...
          </Typography>
        ) : filteredFriends.length === 0 ? (
          <Typography color="text.secondary" align="center">
            No {activeTab !== 'all' ? activeTab : ''} friends to show.
          </Typography>
        ) : (
          <Grid container spacing={2}>
            {filteredFriends.map(({ id, friend, tier }) => {
              const mutualCount = mockMutualFriendsCount(friend.id);
              return (
                <Grid item xs={12} sm={6} md={4} key={id}>
                  <Card variant="outlined" sx={{ height: '100%' }}>
                    <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Badge
                        badgeContent={
                          mutualCount > 0 ? `${mutualCount} mutual` : null
                        }
                        color="primary"
                      >
                        <Avatar
                          src={friend.profileImage || DEFAULT_PROFILE_IMAGE}
                          sx={{ width: isMobile ? 48 : 56, height: isMobile ? 48 : 56 }}
                        />
                      </Badge>
                      <Box flexGrow={1}>
                        <Typography variant="subtitle1" noWrap>
                          {friend.firstName} {friend.lastName}
                        </Typography>
                        {tier !== 'regular' && (
                          <Typography variant="body2" color="text.secondary">
                            {tier}
                          </Typography>
                        )}
                      </Box>
                    </CardContent>
                    <Box
                      display="flex"
                      flexDirection={isMobile ? 'column' : 'row'}
                      justifyContent="flex-end"
                      gap={1}
                      px={2}
                      pb={2}
                    >
                      <Button
                        size="small"
                        fullWidth={isMobile}
                        variant="outlined"
                        startIcon={<MessageIcon />}
                        onClick={() => setChatFriend(friend)}
                      >
                        Message
                      </Button>
                      <Button
                        size="small"
                        fullWidth={isMobile}
                        variant="outlined"
                        color="error"
                        startIcon={<PersonRemoveIcon />}
                        onClick={() => handleRemove(id)}
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
        <ChatPreviewModal
          open={!!chatFriend}
          friend={chatFriend}
          onClose={() => setChatFriend(null)}
        />
      </CardContent>
    </Card>
  );
};

// Profile Actions Component
const ProfileActions = ({
  isOwnProfile,
  friendStatus = 'not_friends',
  friendshipId,
  userId,
  onAddFriend,
  onMessage,
  onEditProfile,
  onCreateStory,
  onViewFriends,
  onViewAsPublic,
  isBlocked
}) => {
  const dispatch = useDispatch();
  const [showFriendsList, setShowFriendsList] = useState(false);

  const commonStyles = {
    display: 'flex',
    gap: 2,
    mt: 2,
    flexWrap: 'wrap',
  };

   const storyButtonStyles = {
    background: 'linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366)',
    color: 'white',
    '&:hover': {
      opacity: 0.9,
    },
  };

  const viewAsPublicButtonStyles = {
    background: 'linear-gradient(45deg, #2196F3, #21CBF3)',
    color: 'white',
    '&:hover': {
      opacity: 0.9,
    },
  };

  const handleBlock = async () => {
    if (window.confirm('Are you sure you want to block this user?')) {
      try {
        await dispatch(blockUser(userId)).unwrap();
        dispatch(showSnackbar({
          message: 'User blocked successfully',
          severity: 'success'
        }));
      } catch (error) {
        dispatch(showSnackbar({
          message: error.message || 'Failed to block user',
          severity: 'error'
        }));
      }
    }
  };

  const handleUnblock = async () => {
    try {
      await dispatch(unblockUser(userId)).unwrap();
      dispatch(showSnackbar({
        message: 'User unblocked successfully',
        severity: 'success'
      }));
    } catch (error) {
      dispatch(showSnackbar({
        message: error.message || 'Failed to unblock user',
        severity: 'error'
      }));
    }
  };

  if (isOwnProfile) {
    return (
      <Box sx={commonStyles}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={onCreateStory}
          sx={storyButtonStyles}
        >
          Add to story
        </Button>

        <Button
          variant="contained"
          startIcon={<EditIcon />}
          onClick={onEditProfile}
          color="primary"
        >
          Edit profile
        </Button>

        <Button
          variant="contained"
          startIcon={<VisibilityIcon />}
          onClick={onViewAsPublic}
          sx={viewAsPublicButtonStyles}
        >
          View As Public
        </Button>

        <Button
          variant="outlined"
          endIcon={<ArrowForwardIcon fontSize="small" />}
          onClick={() => {
            onViewFriends();
            setShowFriendsList(prev => !prev);
          }}
        >
          {showFriendsList ? 'Hide Friends' : 'See all friends'}
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={commonStyles}>
      {isBlocked ? (
        <Button 
          variant="outlined" 
          color="primary"
          onClick={handleUnblock}
          sx={{ minWidth: 150 }}
        >
          Unblock User
        </Button>
      ) : (
        <>
          {friendStatus === 'not_friends' && (
            <Button
              variant="contained"
              startIcon={<PersonAddIcon />}
              onClick={onAddFriend}
              sx={{ minWidth: 150 }}
            >
              Add Friend
            </Button>
          )}

          {friendStatus === 'pending' && (
            <>
              <Button variant="outlined" disabled startIcon={<HourglassEmptyIcon />} sx={{ minWidth: 150 }}>
                Request Sent
              </Button>
              <CancelRequestButton friendshipId={friendshipId} />
            </>
          )}

          {friendStatus === 'friends' && (
            <>
              <Button variant="contained" disabled startIcon={<CheckIcon />} sx={{ minWidth: 150 }}>
                Friends
              </Button>
              <Button
                variant="contained"
                color="secondary"
                startIcon={<MessageIcon />}
                onClick={onMessage}
                sx={{ minWidth: 150 }}
              >
                Message
              </Button>
            </>
          )}

          {friendStatus === 'following' && (
            <Button variant="outlined" disabled sx={{ minWidth: 150 }}>
              Following
            </Button>
          )}
        </>
      )}

      {!isBlocked && (
        <Button 
          variant="outlined" 
          color="error"
          onClick={handleBlock}
          sx={{ minWidth: 150 }}
        >
          Block User
        </Button>
      )}

      <Button variant="outlined">
        <MoreHorizIcon />
      </Button>
    </Box>
  );
};

ProfileActions.propTypes = {
  isOwnProfile: PropTypes.bool.isRequired,
  friendStatus: PropTypes.oneOf([
    'friends',
    'pending',
    'not_friends',
    'following',
  ]),
  friendshipId: PropTypes.string,
  userId: PropTypes.string,
  isBlocked: PropTypes.bool,
  onAddFriend: PropTypes.func,
  onMessage: PropTypes.func,
  onEditProfile: PropTypes.func,
  onCreateStory: PropTypes.func,
  onViewFriends: PropTypes.func,
  onViewAsPublic: PropTypes.func,
};

ProfileActions.defaultProps = {
  friendStatus: 'not_friends',
  isBlocked: false,
  onViewAsPublic: () => {},
};

// Dashboard Component
const Dashboard = ({ userData }) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const cardStyle = (color) => ({
    height: '100%',
    background: `linear-gradient(135deg, ${color} 0%, ${theme.palette.background.paper} 100%)`,
    color: theme.palette.getContrastText(color),
    '&:hover': { transform: 'translateY(-4px)', boxShadow: 4 },
    transition: '0.3s'
  });

  const renderCard = ({ title, icon, subtitle, color, action }, index) => (
    <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
      <Card sx={cardStyle(color)} onClick={action}>
        <CardContent sx={{ p: 2 }}>
          <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 48, height: 48, mb: 1 }}>
            {icon}
          </Avatar>
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom noWrap>
            {title}
          </Typography>
          <Typography variant="body2" noWrap>{subtitle}</Typography>
        </CardContent>
        <Box sx={{ px: 2, pb: 2 }}>
          <Button
            variant="outlined"
            size="small"
            fullWidth
            sx={{
              fontSize: '0.75rem',
              py: 0.5,
              color: 'inherit',
              borderColor: 'rgba(255,255,255,0.5)',
              '&:hover': {
                bgcolor: 'rgba(255,255,255,0.1)',
                borderColor: 'white'
              }
            }}
          >
            Explore
          </Button>
        </Box>
      </Card>
    </Grid>
  );

  const socialCards = [
    {
      title: "Social Feed",
      icon: <PostsIcon fontSize="large" />,
      subtitle: "See latest posts",
      color: theme.palette.primary.main,
      action: () => navigate('/feed')
    },
    {
      title: "Profile Views",
      icon: <VisibilityIcon fontSize="large" />,
      subtitle: "Check who's viewed",
      color: theme.palette.success.main,
      action: () => navigate('/insights')
    },
    {
      title: "Messages",
      icon: <MessagesIcon fontSize="large" />,
      subtitle: "View conversations",
      color: theme.palette.info.main,
      action: () => navigate('/messages')
    },
    {
      title: "Events",
      icon: <EventsIcon fontSize="large" />,
      subtitle: "Upcoming activities",
      color: theme.palette.error.main,
      action: () => navigate('/events')
    },
    {
      title: "Story Archive",
      icon: <PhotoCameraIcon fontSize="large" />,
      subtitle: "Relive old moments",
      color: "#9c27b0",
      action: () => navigate('/stories')
    },
    {
      title: "Likes",
      icon: <LikesIcon fontSize="large" />,
      subtitle: "Content you liked",
      color: "#f44336",
      action: () => navigate('/likes')
    }
  ];

  const profileActionCards = [
    {
      title: "Edit Profile",
      icon: <EditIcon fontSize="large" />,
      subtitle: "Update your information",
      color: "#4caf50",
      action: () => navigate('/my-profile-update')
    },
    {
      title: "View as Public",
      icon: <VisibilityIcon fontSize="large" />,
      subtitle: "See your public profile",
      color: "#2196f3",
      action: () => window.open(`/profile/${userData?.id || 'me'}`, '_blank')
    },
    {
      title: "Update Password",
      icon: <LockIcon fontSize="large" />,
      subtitle: "Change your credentials",
      color: "#ff9800",
      action: () => navigate('/change-password')
    },
    {
      title: "Personal Info",
      icon: <InfoIcon fontSize="large" />,
      subtitle: "Your email, phone & bio",
      color: "#3f51b5",
      action: () => navigate('/profile/private-update')
    },
    {
      title: "Media",
      icon: <MediaIcon fontSize="large" />,
      subtitle: "Your uploaded content",
      color: "#9c27b0",
      action: () => navigate('/profile/media')
    },
    {
      title: "Tools",
      icon: <ToolsIcon fontSize="large" />,
      subtitle: "Developer or creative tools",
      color: "#607d8b",
      action: () => navigate('/profile/tools')
    },
    {
      title: "Professional",
      icon: <ProfessionalIcon fontSize="large" />,
      subtitle: "Job, career, portfolio",
      color: "#795548",
      action: () => navigate('/profile/professional')
    },
    {
      title: "Privacy Settings",
      icon: <PrivacyIcon fontSize="large" />,
      subtitle: "Control what others see",
      color: "#009688",
      action: () => navigate('/profile/privacy')
    },
    {
      title: "My Posts",
      icon: <PostsIcon fontSize="large" />,
      subtitle: "See all your posts",
      color: "#673ab7",
      action: () => navigate('/my-posts')
    },
    {
      title: "Friends",
      icon: <FriendsIcon fontSize="large" />,
      subtitle: "Manage your connections",
      color: "#00bcd4",
      action: () => navigate('/friends')
    },
    {
      title: "Blocked Users",
      icon: <PrivacyIcon fontSize="large" />,
      subtitle: "Users you blocked",
      color: "#607d8b",
      action: () => navigate('/profile/blocked-users')
    },
    {
      title: "Unblock Requests",
      icon: <LockIcon fontSize="large" />,
      subtitle: "Pending unblock requests",
      color: "#9e9e9e",
      action: () => navigate('/profile/unblock-requests')
    }
  ];

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Grid container spacing={3}>
        {socialCards.map(renderCard)}
      </Grid>

      <Typography variant="h5" sx={{ mt: 6, mb: 2 }}>Profile Settings</Typography>
      <Grid container spacing={3}>
        {profileActionCards.map(renderCard)}
      </Grid>

      {isMobile && (
        <Box sx={{
          position: 'fixed',
          bottom: 20,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <Card sx={{ borderRadius: 50, boxShadow: 3, px: 2, py: 1 }}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {[...socialCards.slice(0, 2), ...profileActionCards.slice(0, 2)].map((card, index) => (
                <Button
                  key={index}
                  startIcon={React.cloneElement(card.icon, { fontSize: 'small' })}
                  onClick={card.action}
                  sx={{
                    minWidth: 'unset',
                    color: card.color,
                    '&:hover': { bgcolor: `${card.color}10` }
                  }}
                />
              ))}
            </Box>
          </Card>
        </Box>
      )}
    </Container>
  );
};

// ProfileTabs Component
const ProfileTabs = ({
  tabValue,
  handleTabChange,
  userData,
  formatDate
}) => {
  return (
    <>
      <Tabs
        value={tabValue}
        onChange={handleTabChange}
        variant="scrollable"
        scrollButtons="auto"
        sx={{ mb: 3 }}
      >
        {PROFILE_TABS.map((tab) => (
          <Tab key={tab.value} label={tab.label} value={tab.value} />
        ))}
      </Tabs>

      {tabValue === 0 && (
        <Box>
          <Typography variant="h6" gutterBottom>Your Posts</Typography>
          <Typography color="text.secondary">No posts to display</Typography>
        </Box>
      )}

      {tabValue === 1 && (
        <Box>
          <ProfileInfoSection
            userData={userData}
            isMobile={useMediaQuery(theme.breakpoints.down('sm'))}
            formatDate={formatDate}
          />
        </Box>
      )}

      {tabValue === 2 && (
        <Box>
          <FriendsListCard />
        </Box>
      )}

      {tabValue === 3 && (
        <Box>
          <Typography variant="h6" gutterBottom>Your Photos</Typography>
          <Typography color="text.secondary">No photos to display</Typography>
        </Box>
      )}

      {tabValue === 4 && (
        <Dashboard userData={userData} />
      )}
    </>
  );
};

// Main PrivateProfilePage Component
const PrivateProfilePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const { profile, loading, error } = useSelector((state) => state.user);
  const { sentRequests, friendsList } = useSelector((state) => state.friendship);

  const [state, setState] = useState({
    tabValue: 0,
    deleteDialogOpen: false,
    coverImageLoading: false,
    privacy: {
      profileVisibility: 'public',
      emailVisibility: 'friends',
      phoneVisibility: 'private'
    },
    privacyChanged: false,
    searchInput: '',
    isHoveringCover: false,
    showCancelButtons: false,
    showFriendsList: false
  });

  const userId = useMemo(() => profile?.user?.id || profile?.id || 'me', [profile]);

  const userData = useMemo(() => ({
    id: userId,
    fullName: `${profile?.user?.firstName || profile?.firstName || ''} ${profile?.user?.lastName || profile?.lastName || ''}`.trim(),
    email: profile?.user?.email || profile?.email || 'No email provided',
    phone: profile?.user?.phone || profile?.phone || 'No phone provided',
    location: profile?.user?.location || profile?.location || 'Location not set',
    website: profile?.user?.website || profile?.website || null,
    bio: profile?.user?.bio || profile?.bio || 'Tell your story...',
    isVerified: profile?.user?.isVerified || profile?.isVerified || false,
    profileImage: profile?.user?.profileImage || profile?.profileImage || DEFAULT_PROFILE_IMAGE,
    coverImage: profile?.user?.coverImage || profile?.coverImage || DEFAULT_COVER_IMAGE,
    createdAt: profile?.user?.createdAt || profile?.createdAt || new Date(),
    updatedAt: profile?.user?.updatedAt || profile?.updatedAt || new Date(),
    postsCount: profile?.user?.postsCount || profile?.postsCount || 0,
    friendsCount: profile?.user?.friendsCount || profile?.friendsCount || 0,
    viewsCount: profile?.user?.viewsCount || profile?.viewsCount || 0,
    isCurrentUser: true,
    sentRequests: sentRequests?.data || [],
    friends: friendsList?.data?.map(friend => ({
      ...friend,
      friendshipDate: friend.friendshipDate || new Date()
    })) || [],
    isBlocked: profile?.user?.isBlocked || profile?.isBlocked || false
  }), [profile, userId, sentRequests, friendsList]);

  useEffect(() => {
    dispatch(fetchUserProfile());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      dispatch(showSnackbar({
        message: error,
        severity: 'error'
      }));
    }
  }, [error, dispatch]);

  const handleStateChange = useCallback((updates) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  const handleViewAsPublic = useCallback(() => {
    window.open(`/profile/${userId}`, '_blank');
  }, [userId]);

  const handleCreateStory = useCallback(() => navigate('/create-story'), [navigate]);
  const handleEditProfile = useCallback(() => navigate('/my-profile-update'), [navigate]);
  
  const handleViewFriends = useCallback(() => {
    handleStateChange({ 
      showFriendsList: !state.showFriendsList,
      showCancelButtons: false 
    });
  }, [state.showFriendsList, handleStateChange]);

  const handleMessageFriend = useCallback(() => {
    dispatch(showSnackbar({
      message: 'Select a friend to message from the friends list',
      severity: 'info'
    }));
  }, [dispatch]);

  const toggleCancelButtons = useCallback(() => {
    handleStateChange({ 
      showCancelButtons: !state.showCancelButtons,
      showFriendsList: false 
    });
  }, [state.showCancelButtons, handleStateChange]);

  const handleEditPrivateProfile = useCallback(() => navigate('/profile/private-update'), [navigate]);

  const handlePrivacyUpdate = useCallback((field, value) => {
    handleStateChange({ 
      privacy: { ...state.privacy, [field]: value },
      privacyChanged: true 
    });
  }, [state.privacy, handleStateChange]);

  const formatDate = useCallback((dateString) => {
    try {
      const date = new Date(dateString);
      return isNaN(date.getTime()) 
        ? 'Unknown date' 
        : date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          });
    } catch {
      return 'Unknown date';
    }
  }, []);

  const handleCoverPhotoUpdate = useCallback(async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      dispatch(showSnackbar({
        message: 'Only image files are allowed',
        severity: 'error'
      }));
      return;
    }

    if (file.size > MAX_COVER_IMAGE_SIZE) {
      dispatch(showSnackbar({
        message: 'Image size must be less than 5MB',
        severity: 'error'
      }));
      return;
    }

    handleStateChange({ coverImageLoading: true });
    
    try {
      const formData = new FormData();
      formData.append('coverImage', file);
      await dispatch(updateCoverImage(formData)).unwrap();
      
      dispatch(showSnackbar({
        message: 'Cover image updated successfully!',
        severity: 'success'
      }));
      
      await dispatch(fetchUserProfile());
    } catch (error) {
      dispatch(showSnackbar({
        message: error.message || 'Failed to update cover image',
        severity: 'error'
      }));
    } finally {
      handleStateChange({ coverImageLoading: false });
      e.target.value = '';
    }
  }, [dispatch, handleStateChange]);

  const renderErrorState = () => (
    <Box sx={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      flexDirection: 'column',
      gap: 2
    }}>
      <Typography variant="h6" color="error">
        Failed to load profile
      </Typography>
      <Button 
        variant="contained" 
        onClick={() => dispatch(fetchUserProfile())}
        sx={{ mt: 2 }}
      >
        Retry
      </Button>
    </Box>
  );

  if (loading || !profile) {
    return <ProfileSkeleton />;
  }

  if (error) {
    return renderErrorState();
  }

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{
        backgroundColor: 'background.default',
        minHeight: '100vh',
        pb: 6
      }}>
        <ProfileHeader
          userData={userData}
          isMobile={isMobile}
          onCoverPhotoEdit={handleCoverPhotoUpdate}
          onProfilePhotoEdit={handleEditProfile}
          coverImageLoading={state.coverImageLoading}
          isHoveringCover={state.isHoveringCover}
          setIsHoveringCover={(value) => handleStateChange({ isHoveringCover: value })}
        />

        <Zoom in={!loading} timeout={500}>
          <Box>
            <ProfileActions
              isOwnProfile={true}
              onCreateStory={handleCreateStory}
              onEditProfile={handleEditProfile}
              onViewFriends={handleViewFriends}
              onViewAsPublic={handleViewAsPublic}
              onMessage={handleMessageFriend}
              userId={userId}
              isBlocked={userData.isBlocked}
            />
          </Box>
        </Zoom>

        <Box sx={{ 
          maxWidth: 'lg', 
          mx: 'auto', 
          px: { xs: 2, sm: 3, md: 4 },
          mt: 4
        }}>
          <ProfileStats userData={userData} />

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2, mb: 1 }}>
            <Tooltip title="Open your public profile in new tab" arrow>
              <Button 
                onClick={handleViewAsPublic}
                startIcon={<OpenInNew />}
                variant="outlined"
                size="small"
              >
                View As Public
              </Button>
            </Tooltip>
          </Box>

          <ProfileTabs
            tabValue={state.tabValue}
            handleTabChange={(_, val) => handleStateChange({ tabValue: val })}
            userData={userData}
            formatDate={formatDate}
          />
        </Box>

        <DeleteAccountDialog
          open={state.deleteDialogOpen}
          onClose={() => handleStateChange({ deleteDialogOpen: false })}
          onConfirm={() => {
            dispatch(logoutUser());
            dispatch(showSnackbar({
              message: 'Account deleted successfully',
              severity: 'success'
            }));
            navigate('/');
          }}
        />
      </Box>
    </ThemeProvider>
  );
};

export default PrivateProfilePage;





//! ready
// import {
//   Add as AddIcon,
//   ArrowForward as ArrowForwardIcon,
//   Check as CheckIcon,
//   Edit as EditIcon,
//   HourglassEmpty as HourglassEmptyIcon,
//   Message as MessageIcon,
//   MoreHoriz as MoreHorizIcon,
//   PersonAdd as PersonAddIcon,
//   PersonRemove as PersonRemoveIcon,
//   Visibility as VisibilityIcon
// } from '@mui/icons-material';
// import OpenInNew from '@mui/icons-material/OpenInNew';
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
//   Fade,
//   FormControl,
//   Grid,
//   InputLabel,
//   MenuItem,
//   Select,
//   Tab,
//   Tabs,
//   TextField,
//   ThemeProvider,
//   Tooltip,
//   Typography,
//   useMediaQuery,
//   useTheme, // Make sure this is imported
//   Zoom
// } from '@mui/material';
// import PropTypes from 'prop-types';
// import { useCallback, useEffect, useMemo, useState } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { useNavigate } from 'react-router-dom';
// import theme from '../../../theme';

// // Redux actions
// import {
//   blockUser,
//   getFriends,
//   removeFriend,
//   unblockUser,
//   updateFriendshipTier
// } from '../../../features/friendship/friendshipSlice';
// import { showSnackbar } from '../../../features/snackbar/snackbarSlice';
// import {
//   fetchUserProfile,
//   logoutUser,
//   updateCoverImage
// } from '../../../features/user/userSlice';

// // Utils
// import socketService from '../../../utils/socket';

// // Components
// import Dashboard from '../../DASHBOARD/Dashboard';
// import CancelRequestButton from './CancelRequestButton';
// import DeleteAccountDialog from './DeleteAccountDialog';
// import ProfileHeader from './ProfileHeader';
// import ProfileInfoSection from './ProfileInfoSection';
// import ProfileSkeleton from './ProfileSkeleton';
// import ProfileStats from './ProfileStats';
// import ProfileTabs from './ProfileTabs';

// // Constants
// const DEFAULT_PROFILE_IMAGE = '/default-avatar.png';
// const DEFAULT_COVER_IMAGE = '/default-cover.jpg';
// const MAX_COVER_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

// // Chat Preview Modal Component (from new version)
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

//     socketService.emit('private_message', payload);
//     setMessageText('');
//     onClose();
//   };

//   return (
//     <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
//       <DialogTitle>Start Chat</DialogTitle>
//       <DialogContent>
//         <Box display="flex" alignItems="center" gap={2} mb={2}>
//           <Avatar
//             src={friend?.profileImage || DEFAULT_PROFILE_IMAGE}
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

// // Friendship Tier Dialog Component (from old version)
// const FriendshipTierDialog = ({ friendshipId, currentTier }) => {
//   const dispatch = useDispatch();
  
//   const tiers = [
//     { value: 'close', label: 'Close Friends' },
//     { value: 'regular', label: 'Regular Friends' },
//     { value: 'family', label: 'Family' },
//     { value: 'work', label: 'Work' }
//   ];

//   const handleChange = async (event) => {
//     const newTier = event.target.value;
//     try {
//       await dispatch(updateFriendshipTier({ 
//         friendshipId, 
//         tier: newTier 
//       })).unwrap();
      
//       dispatch(showSnackbar({
//         message: 'Friendship tier updated successfully',
//         severity: 'success'
//       }));
//     } catch (error) {
//       dispatch(showSnackbar({
//         message: 'Failed to update friendship tier',
//         severity: 'error'
//       }));
//     }
//   };

//   return (
//     <Tooltip title="Change friendship tier" arrow>
//       <FormControl size="small" sx={{ minWidth: 120 }}>
//         <InputLabel>Tier</InputLabel>
//         <Select
//           value={currentTier || 'regular'}
//           onChange={handleChange}
//           label="Tier"
//         >
//           {tiers.map((tier) => (
//             <MenuItem key={tier.value} value={tier.value}>
//               {tier.label}
//             </MenuItem>
//           ))}
//         </Select>
//       </FormControl>
//     </Tooltip>
//   );
// };

// // Friends List Card Component (integrated version)
// const FriendsListCard = () => {
//   const dispatch = useDispatch();
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
//       .catch((err) => {
//         console.error('Failed to load friends:', err);
//         dispatch(showSnackbar({
//           message: 'Failed to load friends list',
//           severity: 'error'
//         }));
//       })
//       .finally(() => setLoading(false));
//   }, [dispatch, profile?.id]);

//   const handleRemove = async (friendshipId) => {
//     if (window.confirm('Are you sure you want to remove this friend?')) {
//       try {
//         await dispatch(removeFriend(friendshipId)).unwrap();
//         dispatch(showSnackbar({
//           message: 'Friend removed successfully',
//           severity: 'success'
//         }));
//       } catch (error) {
//         dispatch(showSnackbar({
//           message: 'Failed to remove friend',
//           severity: 'error'
//         }));
//       }
//     }
//   };

//   const mockMutualFriendsCount = (friendId) => {
//     const seed = friendId % 5;
//     return seed === 0 ? 0 : seed + 1;
//   };

//   const friendList = friends.data || [];
//   const filteredFriends = activeTab === 'all'
//     ? friendList
//     : friendList.filter(f => f.tier === activeTab);

//   return (
//     <Card elevation={1} sx={{ mt: 1, mb: 2 }}>
//       <CardHeader
//         title="Friends"
//         subheader={`${filteredFriends.length} ${activeTab !== 'all' ? activeTab : ''} friends`}
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
//         {loading ? (
//           <Typography color="text.secondary" align="center">
//             Loading friends...
//           </Typography>
//         ) : filteredFriends.length === 0 ? (
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
//                           src={friend.profileImage || DEFAULT_PROFILE_IMAGE}
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
//                         startIcon={<MessageIcon />}
//                         onClick={() => setChatFriend(friend)}
//                       >
//                         Message
//                       </Button>
//                       <Button
//                         size="small"
//                         fullWidth={isMobile}
//                         variant="outlined"
//                         color="error"
//                         startIcon={<PersonRemoveIcon />}
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


// // Profile Actions Component (from old version with message functionality added)
// const ProfileActions = ({
//   isOwnProfile,
//   friendStatus = 'not_friends',
//   friendshipId,
//   userId,
//   onAddFriend,
//   onMessage,
//   onEditProfile,
//   onCreateStory,
//   onViewFriends,
//   onViewAsPublic,
//   isBlocked
// }) => {
//   const dispatch = useDispatch();
//   const [showFriendsList, setShowFriendsList] = useState(false);

//   const commonStyles = {
//     display: 'flex',
//     gap: 2,
//     mt: 2,
//     flexWrap: 'wrap',
//   };

//    const storyButtonStyles = {
//     background: 'linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366)',
//     color: 'white',
//     '&:hover': {
//       opacity: 0.9,
//     },
//   };

//   const viewAsPublicButtonStyles = {
//     background: 'linear-gradient(45deg, #2196F3, #21CBF3)',
//     color: 'white',
//     '&:hover': {
//       opacity: 0.9,
//     },
//   };

//   const handleBlock = async () => {
//     if (window.confirm('Are you sure you want to block this user?')) {
//       try {
//         await dispatch(blockUser(userId)).unwrap();
//         dispatch(showSnackbar({
//           message: 'User blocked successfully',
//           severity: 'success'
//         }));
//       } catch (error) {
//         dispatch(showSnackbar({
//           message: error.message || 'Failed to block user',
//           severity: 'error'
//         }));
//       }
//     }
//   };

//   const handleUnblock = async () => {
//     try {
//       await dispatch(unblockUser(userId)).unwrap();
//       dispatch(showSnackbar({
//         message: 'User unblocked successfully',
//         severity: 'success'
//       }));
//     } catch (error) {
//       dispatch(showSnackbar({
//         message: error.message || 'Failed to unblock user',
//         severity: 'error'
//       }));
//     }
//   };

//   if (isOwnProfile) {
//     return (
//       <Box sx={commonStyles}>
//         <Button
//           variant="contained"
//           startIcon={<AddIcon />}
//           onClick={onCreateStory}
//           sx={storyButtonStyles}
//         >
//           Add to story
//         </Button>

//         <Button
//           variant="contained"
//           startIcon={<EditIcon />}
//           onClick={onEditProfile}
//           color="primary"
//         >
//           Edit profile
//         </Button>

//         <Button
//           variant="contained"
//           startIcon={<VisibilityIcon />}
//           onClick={onViewAsPublic}
//           sx={viewAsPublicButtonStyles}
//         >
//           View As Public
//         </Button>

//         <Button
//           variant="outlined"
//           endIcon={<ArrowForwardIcon fontSize="small" />}
//           onClick={() => {
//             onViewFriends();
//             setShowFriendsList(prev => !prev);
//           }}
//         >
//           {showFriendsList ? 'Hide Friends' : 'See all friends'}
//         </Button>
//       </Box>
//     );
//   }

//   return (
//     <Box sx={commonStyles}>
//       {isBlocked ? (
//         <Button 
//           variant="outlined" 
//           color="primary"
//           onClick={handleUnblock}
//           sx={{ minWidth: 150 }}
//         >
//           Unblock User
//         </Button>
//       ) : (
//         <>
//           {friendStatus === 'not_friends' && (
//             <Button
//               variant="contained"
//               startIcon={<PersonAddIcon />}
//               onClick={onAddFriend}
//               sx={{ minWidth: 150 }}
//             >
//               Add Friend
//             </Button>
//           )}

//           {friendStatus === 'pending' && (
//             <>
//               <Button variant="outlined" disabled startIcon={<HourglassEmptyIcon />} sx={{ minWidth: 150 }}>
//                 Request Sent
//               </Button>
//               <CancelRequestButton friendshipId={friendshipId} />
//             </>
//           )}

//           {friendStatus === 'friends' && (
//             <>
//               <Button variant="contained" disabled startIcon={<CheckIcon />} sx={{ minWidth: 150 }}>
//                 Friends
//               </Button>
//               <Button
//                 variant="contained"
//                 color="secondary"
//                 startIcon={<MessageIcon />}
//                 onClick={onMessage}
//                 sx={{ minWidth: 150 }}
//               >
//                 Message
//               </Button>
//             </>
//           )}

//           {friendStatus === 'following' && (
//             <Button variant="outlined" disabled sx={{ minWidth: 150 }}>
//               Following
//             </Button>
//           )}
//         </>
//       )}

//       {!isBlocked && (
//         <Button 
//           variant="outlined" 
//           color="error"
//           onClick={handleBlock}
//           sx={{ minWidth: 150 }}
//         >
//           Block User
//         </Button>
//       )}

//       <Button variant="outlined">
//         <MoreHorizIcon />
//       </Button>
//     </Box>
//   );
// };

// ProfileActions.propTypes = {
//   isOwnProfile: PropTypes.bool.isRequired,
//   friendStatus: PropTypes.oneOf([
//     'friends',
//     'pending',
//     'not_friends',
//     'following',
//   ]),
//   friendshipId: PropTypes.string,
//   userId: PropTypes.string,
//   isBlocked: PropTypes.bool,
//   onAddFriend: PropTypes.func,
//   onMessage: PropTypes.func,
//   onEditProfile: PropTypes.func,
//   onCreateStory: PropTypes.func,
//   onViewFriends: PropTypes.func,
//   onViewAsPublic: PropTypes.func,
// };

// ProfileActions.defaultProps = {
//   friendStatus: 'not_friends',
//   isBlocked: false,
//   onViewAsPublic: () => {},
// };

// // Main PrivateProfilePage Component
// const PrivateProfilePage = () => {
//   // Initialization
//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
//   // Redux state
//   const { profile, loading, error } = useSelector((state) => state.user);
//   const { sentRequests, friendsList } = useSelector((state) => state.friendship);

//   // Component state
//   const [state, setState] = useState({
//     tabValue: 0,
//     deleteDialogOpen: false,
//     coverImageLoading: false,
//     privacy: {
//       profileVisibility: 'public',
//       emailVisibility: 'friends',
//       phoneVisibility: 'private'
//     },
//     privacyChanged: false,
//     searchInput: '',
//     isHoveringCover: false,
//     showCancelButtons: false,
//     showFriendsList: false
//   });

//   // Derived values
//   const userId = useMemo(() => profile?.user?.id || profile?.id || 'me', [profile]);

//   const userData = useMemo(() => ({
//     id: userId,
//     fullName: `${profile?.user?.firstName || profile?.firstName || ''} ${profile?.user?.lastName || profile?.lastName || ''}`.trim(),
//     email: profile?.user?.email || profile?.email || 'No email provided',
//     phone: profile?.user?.phone || profile?.phone || 'No phone provided',
//     location: profile?.user?.location || profile?.location || 'Location not set',
//     website: profile?.user?.website || profile?.website || null,
//     bio: profile?.user?.bio || profile?.bio || 'Tell your story...',
//     isVerified: profile?.user?.isVerified || profile?.isVerified || false,
//     profileImage: profile?.user?.profileImage || profile?.profileImage || DEFAULT_PROFILE_IMAGE,
//     coverImage: profile?.user?.coverImage || profile?.coverImage || DEFAULT_COVER_IMAGE,
//     createdAt: profile?.user?.createdAt || profile?.createdAt || new Date(),
//     updatedAt: profile?.user?.updatedAt || profile?.updatedAt || new Date(),
//     postsCount: profile?.user?.postsCount || profile?.postsCount || 0,
//     friendsCount: profile?.user?.friendsCount || profile?.friendsCount || 0,
//     viewsCount: profile?.user?.viewsCount || profile?.viewsCount || 0,
//     isCurrentUser: true,
//     sentRequests: sentRequests?.data || [],
//     friends: friendsList?.data?.map(friend => ({
//       ...friend,
//       friendshipDate: friend.friendshipDate || new Date()
//     })) || [],
//     isBlocked: profile?.user?.isBlocked || profile?.isBlocked || false
//   }), [profile, userId, sentRequests, friendsList]);

//   // Effects
//   useEffect(() => {
//     dispatch(fetchUserProfile());
//   }, [dispatch]);

//   useEffect(() => {
//     if (error) {
//       dispatch(showSnackbar({
//         message: error,
//         severity: 'error'
//       }));
//     }
//   }, [error, dispatch]);

//   // Handler functions
//   const handleStateChange = useCallback((updates) => {
//     setState(prev => ({ ...prev, ...updates }));
//   }, []);

//   const handleViewAsPublic = useCallback(() => {
//     window.open(`/profile/${userId}`, '_blank');
//   }, [userId]);

//   const handleCreateStory = useCallback(() => navigate('/create-story'), [navigate]);
//   const handleEditProfile = useCallback(() => navigate('/my-profile-update'), [navigate]);
  
//   const handleViewFriends = useCallback(() => {
//     handleStateChange({ 
//       showFriendsList: !state.showFriendsList,
//       showCancelButtons: false 
//     });
//   }, [state.showFriendsList, handleStateChange]);

//   const handleMessageFriend = useCallback(() => {
//     // This will be handled by the ChatPreviewModal in FriendsListCard
//     dispatch(showSnackbar({
//       message: 'Select a friend to message from the friends list',
//       severity: 'info'
//     }));
//   }, [dispatch]);

//   const toggleCancelButtons = useCallback(() => {
//     handleStateChange({ 
//       showCancelButtons: !state.showCancelButtons,
//       showFriendsList: false 
//     });
//   }, [state.showCancelButtons, handleStateChange]);

//   const handleEditPrivateProfile = useCallback(() => navigate('/profile/private-update'), [navigate]);

//   const handlePrivacyUpdate = useCallback((field, value) => {
//     handleStateChange({ 
//       privacy: { ...state.privacy, [field]: value },
//       privacyChanged: true 
//     });
//   }, [state.privacy, handleStateChange]);

//   const formatDate = useCallback((dateString) => {
//     try {
//       const date = new Date(dateString);
//       return isNaN(date.getTime()) 
//         ? 'Unknown date' 
//         : date.toLocaleDateString('en-US', {
//             year: 'numeric',
//             month: 'long',
//             day: 'numeric'
//           });
//     } catch {
//       return 'Unknown date';
//     }
//   }, []);

//   const handleCoverPhotoUpdate = useCallback(async (e) => {
//     const file = e.target.files[0];
//     if (!file) return;

//     if (!file.type.startsWith('image/')) {
//       dispatch(showSnackbar({
//         message: 'Only image files are allowed',
//         severity: 'error'
//       }));
//       return;
//     }

//     if (file.size > MAX_COVER_IMAGE_SIZE) {
//       dispatch(showSnackbar({
//         message: 'Image size must be less than 5MB',
//         severity: 'error'
//       }));
//       return;
//     }

//     handleStateChange({ coverImageLoading: true });
    
//     try {
//       const formData = new FormData();
//       formData.append('coverImage', file);
//       await dispatch(updateCoverImage(formData)).unwrap();
      
//       dispatch(showSnackbar({
//         message: 'Cover image updated successfully!',
//         severity: 'success'
//       }));
      
//       await dispatch(fetchUserProfile());
//     } catch (error) {
//       dispatch(showSnackbar({
//         message: error.message || 'Failed to update cover image',
//         severity: 'error'
//       }));
//     } finally {
//       handleStateChange({ coverImageLoading: false });
//       e.target.value = '';
//     }
//   }, [dispatch, handleStateChange]);

//   // Render functions
//   const renderErrorState = () => (
//     <Box sx={{
//       display: 'flex',
//       justifyContent: 'center',
//       alignItems: 'center',
//       height: '100vh',
//       flexDirection: 'column',
//       gap: 2
//     }}>
//       <Typography variant="h6" color="error">
//         Failed to load profile
//       </Typography>
//       <Button 
//         variant="contained" 
//         onClick={() => dispatch(fetchUserProfile())}
//         sx={{ mt: 2 }}
//       >
//         Retry
//       </Button>
//     </Box>
//   );

//   if (loading || !profile) {
//     return <ProfileSkeleton />;
//   }

//   if (error) {
//     return renderErrorState();
//   }

//   return (
//     <ThemeProvider theme={theme}>
//       <Box sx={{
//         backgroundColor: 'background.default',
//         minHeight: '100vh',
//         pb: 6
//       }}>
//         <ProfileHeader
//           userData={userData}
//           isMobile={isMobile}
//           onCoverPhotoEdit={handleCoverPhotoUpdate}
//           onProfilePhotoEdit={handleEditProfile}
//           coverImageLoading={state.coverImageLoading}
//           isHoveringCover={state.isHoveringCover}
//           setIsHoveringCover={(value) => handleStateChange({ isHoveringCover: value })}
//         />

//         <Zoom in={!loading} timeout={500}>
//           <Box>
//             <ProfileActions
//               isOwnProfile={true}
//               onCreateStory={handleCreateStory}
//               onEditProfile={handleEditProfile}
//               onViewFriends={handleViewFriends}
//               onViewAsPublic={handleViewAsPublic}
//               onMessage={handleMessageFriend}
//               userId={userId}
//               isBlocked={userData.isBlocked}
//             />
//           </Box>
//         </Zoom>

//         <Box sx={{ 
//           maxWidth: 'lg', 
//           mx: 'auto', 
//           px: { xs: 2, sm: 3, md: 4 },
//           mt: 4
//         }}>
//           <Grid container spacing={3}>
//             <Grid item xs={12} md={6}>
//               <FriendsListCard />
//             </Grid>
//           </Grid>
//         </Box>

//         <Fade in={!loading} timeout={1000}>
//           <Box>
//             <ProfileInfoSection
//               userData={userData}
//               isMobile={isMobile}
//               formatDate={formatDate}
//             />

//             <Box sx={{
//               maxWidth: 'lg',
//               mx: 'auto',
//               px: { xs: 2, sm: 3, md: 4 }
//             }}>
//               <ProfileStats userData={userData} />

//               <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2, mb: 1 }}>
//                 <Tooltip title="Open your public profile in new tab" arrow>
//                   <Button 
//                     onClick={handleViewAsPublic}
//                     startIcon={<OpenInNew />}
//                     variant="outlined"
//                     size="small"
//                   >
//                     View As Public
//                   </Button>
//                 </Tooltip>
//               </Box>

//               <ProfileTabs
//                 tabValue={state.tabValue}
//                 handleTabChange={(_, val) => handleStateChange({ tabValue: val })}
//                 privacy={state.privacy}
//                 privacyChanged={state.privacyChanged}
//                 handlePrivacyChange={handlePrivacyUpdate}
//                 onSavePrivacy={() => {
//                   dispatch(showSnackbar({
//                     message: 'Privacy settings saved!',
//                     severity: 'success'
//                   }));
//                   handleStateChange({ privacyChanged: false });
//                 }}
//                 onDeleteAccount={() => handleStateChange({ deleteDialogOpen: true })}
//                 userData={userData}
//                 formatDate={formatDate}
//               />
//             </Box>
//           </Box>
//         </Fade>

//         <DeleteAccountDialog
//           open={state.deleteDialogOpen}
//           onClose={() => handleStateChange({ deleteDialogOpen: false })}
//           onConfirm={() => {
//             dispatch(logoutUser());
//             dispatch(showSnackbar({
//               message: 'Account deleted successfully',
//               severity: 'success'
//             }));
//             navigate('/');
//           }}
//         />
//       </Box>
//     </ThemeProvider>
//   );
// };

// export default PrivateProfilePage;




//! new
// PrivateProfilePage.jsx (React) — Chat integrated with Socket.IO
// src/components/PROFILE/PrivateProiflePage.jsx
// import { Message, PersonRemove } from '@mui/icons-material';
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
//   useTheme
// } from '@mui/material';
// import { useEffect, useState } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { getFriends, removeFriend } from '../../../features/friendship/friendshipSlice';
// import socketService from '../../../utils/socket';
// import Messages from './messages';

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

//     socketService.emit('private_message', payload);
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
//   const dispatch = useDispatch();
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
//         title="Friends"
//         subheader={`${filteredFriends.length} ${activeTab} friends`}
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
//     <Typography variant="h5">
//       {profile.firstName} {profile.lastName}'s Profile
//     </Typography>
//     <Messages /> {/* ✅ Socket listener mounted */}
//     <FriendsListCard />
//   </Box>
//   );
// };

// export default PrivateProfilePage;










//! original
// import {
//   Add as AddIcon,
//   ArrowForward as ArrowForwardIcon,
//   Check as CheckIcon,
//   Edit as EditIcon,
//   HourglassEmpty as HourglassEmptyIcon,
//   MoreHoriz as MoreHorizIcon,
//   PersonAdd as PersonAddIcon,
//   Send as SendIcon,
//   Visibility as VisibilityIcon
// } from '@mui/icons-material';
// import OpenInNew from '@mui/icons-material/OpenInNew';
// import {
//   Box,
//   Button,
//   Fade,
//   FormControl,
//   Grid,
//   InputLabel,
//   MenuItem,
//   Select,
//   ThemeProvider,
//   Tooltip,
//   Typography,
//   useMediaQuery,
//   Zoom
// } from '@mui/material';
// import PropTypes from 'prop-types';
// import { useCallback, useEffect, useMemo, useState } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { useNavigate } from 'react-router-dom';
// import theme from '../../../theme';

// // Redux actions
// import {
//   blockUser,
//   unblockUser,
//   updateFriendshipTier
// } from '../../../features/friendship/friendshipSlice';
// import { showSnackbar } from '../../../features/snackbar/snackbarSlice';
// import {
//   fetchUserProfile,
//   logoutUser,
//   updateCoverImage
// } from '../../../features/user/userSlice';

// // Components
// import CancelRequestButton from './CancelRequestButton';
// import DeleteAccountDialog from './DeleteAccountDialog';
// import FriendsListCard from './FriendsListCard';
// // import GroupsCard from './GroupsCard';
// import ProfileHeader from './ProfileHeader';
// import ProfileInfoSection from './ProfileInfoSection';
// import ProfileSkeleton from './ProfileSkeleton';
// import ProfileStats from './ProfileStats';
// import ProfileTabs from './ProfileTabs';

// // Constants
// const DEFAULT_PROFILE_IMAGE = '/default-avatar.png';
// const DEFAULT_COVER_IMAGE = '/default-cover.jpg';
// const MAX_COVER_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

// const FriendshipTierDialog = ({ friendshipId, currentTier }) => {
//   const dispatch = useDispatch();
  
//   const tiers = [
//     { value: 'close_friends', label: 'Close Friends' },
//     { value: 'acquaintances', label: 'Acquaintances' },
//     { value: 'family', label: 'Family' },
//     { value: 'work', label: 'Work' },
//     { value: 'custom', label: 'Custom' }
//   ];

//   const handleChange = async (event) => {
//     const newTier = event.target.value;
//     try {
//       await dispatch(updateFriendshipTier({ 
//         friendshipId, 
//         tier: newTier 
//       })).unwrap();
      
//       dispatch(showSnackbar({
//         message: 'Friendship tier updated successfully',
//         severity: 'success'
//       }));
//     } catch (error) {
//       dispatch(showSnackbar({
//         message: 'Failed to update friendship tier',
//         severity: 'error'
//       }));
//     }
//   };

//   return (
//     <Tooltip title="Change friendship tier" arrow>
//       <FormControl size="small" sx={{ minWidth: 120 }}>
//         <InputLabel>Tier</InputLabel>
//         <Select
//           value={currentTier || ''}
//           onChange={handleChange}
//           label="Tier"
//         >
//           {tiers.map((tier) => (
//             <MenuItem key={tier.value} value={tier.value}>
//               {tier.label}
//             </MenuItem>
//           ))}
//         </Select>
//       </FormControl>
//     </Tooltip>
//   );
// };

// const ProfileActions = ({
//   isOwnProfile,
//   friendStatus = 'not_friends',
//   friendshipId,
//   userId,
//   onAddFriend,
//   onMessage,
//   onEditProfile,
//   onCreateStory,
//   onViewFriends,
//   onViewAsPublic,
//   isBlocked
// }) => {
//   const dispatch = useDispatch();
//   const [showFriendsList, setShowFriendsList] = useState(false);

//   const commonStyles = {
//     display: 'flex',
//     gap: 2,
//     mt: 2,
//     flexWrap: 'wrap',
//   };

//   const storyButtonStyles = {
//     background: 'linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366)',
//     color: 'white',
//     '&:hover': {
//       opacity: 0.9,
//     },
//   };

//   const viewAsPublicButtonStyles = {
//     background: 'linear-gradient(45deg, #2196F3, #21CBF3)',
//     color: 'white',
//     '&:hover': {
//       opacity: 0.9,
//     },
//   };

//   const handleBlock = async () => {
//     if (window.confirm('Are you sure you want to block this user?')) {
//       try {
//         await dispatch(blockUser(userId)).unwrap();
//         dispatch(showSnackbar({
//           message: 'User blocked successfully',
//           severity: 'success'
//         }));
//       } catch (error) {
//         dispatch(showSnackbar({
//           message: error.message || 'Failed to block user',
//           severity: 'error'
//         }));
//       }
//     }
//   };

//   const handleUnblock = async () => {
//     try {
//       await dispatch(unblockUser(userId)).unwrap();
//       dispatch(showSnackbar({
//         message: 'User unblocked successfully',
//         severity: 'success'
//       }));
//     } catch (error) {
//       dispatch(showSnackbar({
//         message: error.message || 'Failed to unblock user',
//         severity: 'error'
//       }));
//     }
//   };

//   if (isOwnProfile) {
//     return (
//       <Box sx={commonStyles}>
//         <Button
//           variant="contained"
//           startIcon={<AddIcon />}
//           onClick={onCreateStory}
//           sx={storyButtonStyles}
//         >
//           Add to story
//         </Button>

//         <Button
//           variant="contained"
//           startIcon={<EditIcon />}
//           onClick={onEditProfile}
//           color="primary"
//         >
//           Edit profile
//         </Button>

//         <Button
//           variant="contained"
//           startIcon={<VisibilityIcon />}
//           onClick={onViewAsPublic}
//           sx={viewAsPublicButtonStyles}
//         >
//           View As Public
//         </Button>

//         <Button
//           variant="outlined"
//           endIcon={<ArrowForwardIcon fontSize="small" />}
//           onClick={() => {
//             onViewFriends();
//             setShowFriendsList(prev => !prev);
//           }}
//         >
//           {showFriendsList ? 'Hide Friends' : 'See all friends'}
//         </Button>
//       </Box>
//     );
//   }

//   return (
//     <Box sx={commonStyles}>
//       {isBlocked ? (
//         <Button 
//           variant="outlined" 
//           color="primary"
//           onClick={handleUnblock}
//           sx={{ minWidth: 150 }}
//         >
//           Unblock User
//         </Button>
//       ) : (
//         <>
//           {friendStatus === 'not_friends' && (
//             <Button
//               variant="contained"
//               startIcon={<PersonAddIcon />}
//               onClick={onAddFriend}
//               sx={{ minWidth: 150 }}
//             >
//               Add Friend
//             </Button>
//           )}

//           {friendStatus === 'pending' && (
//             <>
//               <Button variant="outlined" disabled startIcon={<HourglassEmptyIcon />} sx={{ minWidth: 150 }}>
//                 Request Sent
//               </Button>
//               <CancelRequestButton friendshipId={friendshipId} />
//             </>
//           )}

//           {friendStatus === 'friends' && (
//             <Button variant="contained" disabled startIcon={<CheckIcon />} sx={{ minWidth: 150 }}>
//               Friends
//             </Button>
//           )}

//           {friendStatus === 'following' && (
//             <Button variant="outlined" disabled sx={{ minWidth: 150 }}>
//               Following
//             </Button>
//           )}

//           <Button
//             variant="contained"
//             color="secondary"
//             startIcon={<SendIcon />}
//             onClick={onMessage}
//             disabled={friendStatus !== 'friends'}
//             sx={{ minWidth: 150 }}
//           >
//             Message
//           </Button>
//         </>
//       )}

//       {!isBlocked && (
//         <Button 
//           variant="outlined" 
//           color="error"
//           onClick={handleBlock}
//           sx={{ minWidth: 150 }}
//         >
//           Block User
//         </Button>
//       )}

//       <Button variant="outlined">
//         <MoreHorizIcon />
//       </Button>
//     </Box>
//   );
// };

// ProfileActions.propTypes = {
//   isOwnProfile: PropTypes.bool.isRequired,
//   friendStatus: PropTypes.oneOf([
//     'friends',
//     'pending',
//     'not_friends',
//     'following',
//   ]),
//   friendshipId: PropTypes.string,
//   userId: PropTypes.string,
//   isBlocked: PropTypes.bool,
//   onAddFriend: PropTypes.func,
//   onMessage: PropTypes.func,
//   onEditProfile: PropTypes.func,
//   onCreateStory: PropTypes.func,
//   onViewFriends: PropTypes.func,
//   onViewAsPublic: PropTypes.func,
// };

// ProfileActions.defaultProps = {
//   friendStatus: 'not_friends',
//   isBlocked: false,
//   onViewAsPublic: () => {},
// };

// const PrivateProfilePage = () => {
//   // Initialization
//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
//   // Redux state
//   const { profile, loading, error } = useSelector((state) => state.user);
//   const { sentRequests, friendsList } = useSelector((state) => state.friendship);

//   // Component state
//   const [state, setState] = useState({
//     tabValue: 0,
//     deleteDialogOpen: false,
//     coverImageLoading: false,
//     privacy: {
//       profileVisibility: 'public',
//       emailVisibility: 'friends',
//       phoneVisibility: 'private'
//     },
//     privacyChanged: false,
//     searchInput: '',
//     isHoveringCover: false,
//     showCancelButtons: false,
//     showFriendsList: false
//   });

//   // Derived values
//   const userId = useMemo(() => profile?.user?.id || profile?.id || 'me', [profile]);

//   const userData = useMemo(() => ({
//     id: userId,
//     fullName: `${profile?.user?.firstName || profile?.firstName || ''} ${profile?.user?.lastName || profile?.lastName || ''}`.trim(),
//     email: profile?.user?.email || profile?.email || 'No email provided',
//     phone: profile?.user?.phone || profile?.phone || 'No phone provided',
//     location: profile?.user?.location || profile?.location || 'Location not set',
//     website: profile?.user?.website || profile?.website || null,
//     bio: profile?.user?.bio || profile?.bio || 'Tell your story...',
//     isVerified: profile?.user?.isVerified || profile?.isVerified || false,
//     profileImage: profile?.user?.profileImage || profile?.profileImage || DEFAULT_PROFILE_IMAGE,
//     coverImage: profile?.user?.coverImage || profile?.coverImage || DEFAULT_COVER_IMAGE,
//     createdAt: profile?.user?.createdAt || profile?.createdAt || new Date(),
//     updatedAt: profile?.user?.updatedAt || profile?.updatedAt || new Date(),
//     postsCount: profile?.user?.postsCount || profile?.postsCount || 0,
//     friendsCount: profile?.user?.friendsCount || profile?.friendsCount || 0,
//     viewsCount: profile?.user?.viewsCount || profile?.viewsCount || 0,
//     isCurrentUser: true,
//     sentRequests: sentRequests?.data || [],
//     friends: friendsList?.data?.map(friend => ({
//       ...friend,
//       friendshipDate: friend.friendshipDate || new Date()
//     })) || [],
//     isBlocked: profile?.user?.isBlocked || profile?.isBlocked || false
//   }), [profile, userId, sentRequests, friendsList]);

//   // Effects
//   useEffect(() => {
//     dispatch(fetchUserProfile());
//   }, [dispatch]);

//   useEffect(() => {
//     if (error) {
//       dispatch(showSnackbar({
//         message: error,
//         severity: 'error'
//       }));
//     }
//   }, [error, dispatch]);

//   // Handler functions
//   const handleStateChange = useCallback((updates) => {
//     setState(prev => ({ ...prev, ...updates }));
//   }, []);

//   const handleViewAsPublic = useCallback(() => {
//     window.open(`/profile/${userId}`, '_blank');
//   }, [userId]);

//   const handleCreateStory = useCallback(() => navigate('/create-story'), [navigate]);
//   const handleEditProfile = useCallback(() => navigate('/my-profile-update'), [navigate]);
  
//   const handleViewFriends = useCallback(() => {
//     handleStateChange({ 
//       showFriendsList: !state.showFriendsList,
//       showCancelButtons: false 
//     });
//   }, [state.showFriendsList, handleStateChange]);

//   const toggleCancelButtons = useCallback(() => {
//     handleStateChange({ 
//       showCancelButtons: !state.showCancelButtons,
//       showFriendsList: false 
//     });
//   }, [state.showCancelButtons, handleStateChange]);

//   const handleEditPrivateProfile = useCallback(() => navigate('/profile/private-update'), [navigate]);

//   const handlePrivacyUpdate = useCallback((field, value) => {
//     handleStateChange({ 
//       privacy: { ...state.privacy, [field]: value },
//       privacyChanged: true 
//     });
//   }, [state.privacy, handleStateChange]);

//   const formatDate = useCallback((dateString) => {
//     try {
//       const date = new Date(dateString);
//       return isNaN(date.getTime()) 
//         ? 'Unknown date' 
//         : date.toLocaleDateString('en-US', {
//             year: 'numeric',
//             month: 'long',
//             day: 'numeric'
//           });
//     } catch {
//       return 'Unknown date';
//     }
//   }, []);

//   const handleCoverPhotoUpdate = useCallback(async (e) => {
//     const file = e.target.files[0];
//     if (!file) return;

//     if (!file.type.startsWith('image/')) {
//       dispatch(showSnackbar({
//         message: 'Only image files are allowed',
//         severity: 'error'
//       }));
//       return;
//     }

//     if (file.size > MAX_COVER_IMAGE_SIZE) {
//       dispatch(showSnackbar({
//         message: 'Image size must be less than 5MB',
//         severity: 'error'
//       }));
//       return;
//     }

//     handleStateChange({ coverImageLoading: true });
    
//     try {
//       const formData = new FormData();
//       formData.append('coverImage', file);
//       await dispatch(updateCoverImage(formData)).unwrap();
      
//       dispatch(showSnackbar({
//         message: 'Cover image updated successfully!',
//         severity: 'success'
//       }));
      
//       await dispatch(fetchUserProfile());
//     } catch (error) {
//       dispatch(showSnackbar({
//         message: error.message || 'Failed to update cover image',
//         severity: 'error'
//       }));
//     } finally {
//       handleStateChange({ coverImageLoading: false });
//       e.target.value = '';
//     }
//   }, [dispatch, handleStateChange]);

//   // Render functions
//   const renderErrorState = () => (
//     <Box sx={{
//       display: 'flex',
//       justifyContent: 'center',
//       alignItems: 'center',
//       height: '100vh',
//       flexDirection: 'column',
//       gap: 2
//     }}>
//       <Typography variant="h6" color="error">
//         Failed to load profile
//       </Typography>
//       <Button 
//         variant="contained" 
//         onClick={() => dispatch(fetchUserProfile())}
//         sx={{ mt: 2 }}
//       >
//         Retry
//       </Button>
//     </Box>
//   );

//   if (loading || !profile) {
//     return <ProfileSkeleton />;
//   }

//   if (error) {
//     return renderErrorState();
//   }

//   return (
//     <ThemeProvider theme={theme}>
//       <Box sx={{
//         backgroundColor: 'background.default',
//         minHeight: '100vh',
//         pb: 6
//       }}>
//         <ProfileHeader
//           userData={userData}
//           isMobile={isMobile}
//           onCoverPhotoEdit={handleCoverPhotoUpdate}
//           onProfilePhotoEdit={handleEditProfile}
//           coverImageLoading={state.coverImageLoading}
//           isHoveringCover={state.isHoveringCover}
//           setIsHoveringCover={(value) => handleStateChange({ isHoveringCover: value })}
//         />

//         <Zoom in={!loading} timeout={500}>
//           <Box>
//             <ProfileActions
//               isOwnProfile={true}
//               onCreateStory={handleCreateStory}
//               onEditProfile={handleEditProfile}
//               onViewFriends={handleViewFriends}
//               onViewAsPublic={handleViewAsPublic}
//               userId={userId}
//               isBlocked={userData.isBlocked}
//             />
//           </Box>
//         </Zoom>

//         {/* Add the new cards here */}
//         <Box sx={{ 
//           maxWidth: 'lg', 
//           mx: 'auto', 
//           px: { xs: 2, sm: 3, md: 4 },
//           mt: 4
//         }}>
//           <Grid container spacing={3}>
//             {/* <Grid item xs={12} md={6}>
//               <FriendRequestCard />
//             </Grid> */}
//             <Grid item xs={12} md={6}>
//               <FriendsListCard />
//             </Grid>
//             <Grid item xs={12}>
//               {/* <GroupsCard /> */}
//             </Grid>
//           </Grid>
//         </Box>

//         <Fade in={!loading} timeout={1000}>
//           <Box>
//             <ProfileInfoSection
//               userData={userData}
//               isMobile={isMobile}
//               formatDate={formatDate}
//             />

//             <Box sx={{
//               maxWidth: 'lg',
//               mx: 'auto',
//               px: { xs: 2, sm: 3, md: 4 }
//             }}>
//               <ProfileStats userData={userData} />

//               <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2, mb: 1 }}>
//                 <Tooltip title="Open your public profile in new tab" arrow>
//                   <Button 
//                     onClick={handleViewAsPublic}
//                     startIcon={<OpenInNew />}
//                     variant="outlined"
//                     size="small"
//                   >
//                     View As Public
//                   </Button>
//                 </Tooltip>
//               </Box>

//               <ProfileTabs
//                 tabValue={state.tabValue}
//                 handleTabChange={(_, val) => handleStateChange({ tabValue: val })}
//                 privacy={state.privacy}
//                 privacyChanged={state.privacyChanged}
//                 handlePrivacyChange={handlePrivacyUpdate}
//                 onSavePrivacy={() => {
//                   dispatch(showSnackbar({
//                     message: 'Privacy settings saved!',
//                     severity: 'success'
//                   }));
//                   handleStateChange({ privacyChanged: false });
//                 }}
//                 onDeleteAccount={() => handleStateChange({ deleteDialogOpen: true })}
//                 userData={userData}
//                 formatDate={formatDate}
//               />
//             </Box>
//           </Box>
//         </Fade>

//         <DeleteAccountDialog
//           open={state.deleteDialogOpen}
//           onClose={() => handleStateChange({ deleteDialogOpen: false })}
//           onConfirm={() => {
//             dispatch(logoutUser());
//             dispatch(showSnackbar({
//               message: 'Account deleted successfully',
//               severity: 'success'
//             }));
//             navigate('/');
//           }}
//         />
//       </Box>
//     </ThemeProvider>
//   );
// };

// export default PrivateProfilePage;





//! final
// import {
//   Add as AddIcon,
//   ArrowForward as ArrowForwardIcon,
//   Check as CheckIcon,
//   Edit as EditIcon,
//   HourglassEmpty as HourglassEmptyIcon,
//   MoreHoriz as MoreHorizIcon,
//   PersonAdd as PersonAddIcon,
//   Send as SendIcon,
//   Visibility as VisibilityIcon
// } from '@mui/icons-material';
// import OpenInNew from '@mui/icons-material/OpenInNew';
// import {
//   Avatar,
//   Box,
//   Button,
//   Fade,
//   FormControl,
//   InputLabel,
//   List,
//   ListItem,
//   ListItemAvatar,
//   ListItemText,
//   MenuItem,
//   Select,
//   ThemeProvider,
//   Tooltip,
//   Typography,
//   useMediaQuery,
//   Zoom
// } from '@mui/material';
// import PropTypes from 'prop-types';
// import { useCallback, useEffect, useMemo, useState } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { useNavigate } from 'react-router-dom';
// import theme from '../../../theme';

// // Redux actions
// import {
//   blockUser,
//   unblockUser,
//   updateFriendshipTier
// } from '../../../features/friendship/friendshipSlice';
// import { showSnackbar } from '../../../features/snackbar/snackbarSlice';
// import {
//   fetchUserProfile,
//   logoutUser,
//   updateCoverImage
// } from '../../../features/user/userSlice';

// // Components
// import CancelRequestButton from './CancelRequestButton';
// import DeleteAccountDialog from './DeleteAccountDialog';
// import ProfileHeader from './ProfileHeader';
// import ProfileInfoSection from './ProfileInfoSection';
// import ProfileSkeleton from './ProfileSkeleton';
// import ProfileStats from './ProfileStats';
// import ProfileTabs from './ProfileTabs';
// import RemoveFriendButton from './RemoveFriendButton';

// // Constants
// const DEFAULT_PROFILE_IMAGE = '/default-avatar.png';
// const DEFAULT_COVER_IMAGE = '/default-cover.jpg';
// const MAX_COVER_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

// const FriendshipTierDialog = ({ friendshipId, currentTier }) => {
//   const dispatch = useDispatch();
  
//   const tiers = [
//     { value: 'close_friends', label: 'Close Friends' },
//     { value: 'acquaintances', label: 'Acquaintances' },
//     { value: 'family', label: 'Family' },
//     { value: 'work', label: 'Work' },
//     { value: 'custom', label: 'Custom' }
//   ];

//   const handleChange = async (event) => {
//     const newTier = event.target.value;
//     try {
//       await dispatch(updateFriendshipTier({ 
//         friendshipId, 
//         tier: newTier 
//       })).unwrap();
      
//       dispatch(showSnackbar({
//         message: 'Friendship tier updated successfully',
//         severity: 'success'
//       }));
//     } catch (error) {
//       dispatch(showSnackbar({
//         message: 'Failed to update friendship tier',
//         severity: 'error'
//       }));
//     }
//   };

//   return (
//     <Tooltip title="Change friendship tier" arrow>
//       <FormControl size="small" sx={{ minWidth: 120 }}>
//         <InputLabel>Tier</InputLabel>
//         <Select
//           value={currentTier || ''}
//           onChange={handleChange}
//           label="Tier"
//         >
//           {tiers.map((tier) => (
//             <MenuItem key={tier.value} value={tier.value}>
//               {tier.label}
//             </MenuItem>
//           ))}
//         </Select>
//       </FormControl>
//     </Tooltip>
//   );
// };

// const ProfileActions = ({
//   isOwnProfile,
//   friendStatus = 'not_friends',
//   friendshipId,
//   userId,
//   onAddFriend,
//   onMessage,
//   onEditProfile,
//   onCreateStory,
//   onViewFriends,
//   onViewAsPublic,
//   isBlocked
// }) => {
//   const dispatch = useDispatch();
//   const [showFriendsList, setShowFriendsList] = useState(false);

//   const commonStyles = {
//     display: 'flex',
//     gap: 2,
//     mt: 2,
//     flexWrap: 'wrap',
//   };

//   const storyButtonStyles = {
//     background: 'linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366)',
//     color: 'white',
//     '&:hover': {
//       opacity: 0.9,
//     },
//   };

//   const viewAsPublicButtonStyles = {
//     background: 'linear-gradient(45deg, #2196F3, #21CBF3)',
//     color: 'white',
//     '&:hover': {
//       opacity: 0.9,
//     },
//   };

//   const handleBlock = async () => {
//     if (window.confirm('Are you sure you want to block this user?')) {
//       try {
//         await dispatch(blockUser(userId)).unwrap();
//         dispatch(showSnackbar({
//           message: 'User blocked successfully',
//           severity: 'success'
//         }));
//       } catch (error) {
//         dispatch(showSnackbar({
//           message: error.message || 'Failed to block user',
//           severity: 'error'
//         }));
//       }
//     }
//   };

//   const handleUnblock = async () => {
//     try {
//       await dispatch(unblockUser(userId)).unwrap();
//       dispatch(showSnackbar({
//         message: 'User unblocked successfully',
//         severity: 'success'
//       }));
//     } catch (error) {
//       dispatch(showSnackbar({
//         message: error.message || 'Failed to unblock user',
//         severity: 'error'
//       }));
//     }
//   };

//   if (isOwnProfile) {
//     return (
//       <Box sx={commonStyles}>
//         <Button
//           variant="contained"
//           startIcon={<AddIcon />}
//           onClick={onCreateStory}
//           sx={storyButtonStyles}
//         >
//           Add to story
//         </Button>

//         <Button
//           variant="contained"
//           startIcon={<EditIcon />}
//           onClick={onEditProfile}
//           color="primary"
//         >
//           Edit profile
//         </Button>

//         <Button
//           variant="contained"
//           startIcon={<VisibilityIcon />}
//           onClick={onViewAsPublic}
//           sx={viewAsPublicButtonStyles}
//         >
//           View As Public
//         </Button>

//         <Button
//           variant="outlined"
//           endIcon={<ArrowForwardIcon fontSize="small" />}
//           onClick={() => {
//             onViewFriends();
//             setShowFriendsList(prev => !prev);
//           }}
//         >
//           {showFriendsList ? 'Hide Friends' : 'See all friends'}
//         </Button>
//       </Box>
//     );
//   }

//   return (
//     <Box sx={commonStyles}>
//       {isBlocked ? (
//         <Button 
//           variant="outlined" 
//           color="primary"
//           onClick={handleUnblock}
//           sx={{ minWidth: 150 }}
//         >
//           Unblock User
//         </Button>
//       ) : (
//         <>
//           {friendStatus === 'not_friends' && (
//             <Button
//               variant="contained"
//               startIcon={<PersonAddIcon />}
//               onClick={onAddFriend}
//               sx={{ minWidth: 150 }}
//             >
//               Add Friend
//             </Button>
//           )}

//           {friendStatus === 'pending' && (
//             <>
//               <Button variant="outlined" disabled startIcon={<HourglassEmptyIcon />} sx={{ minWidth: 150 }}>
//                 Request Sent
//               </Button>
//               <CancelRequestButton friendshipId={friendshipId} />
//             </>
//           )}

//           {friendStatus === 'friends' && (
//             <Button variant="contained" disabled startIcon={<CheckIcon />} sx={{ minWidth: 150 }}>
//               Friends
//             </Button>
//           )}

//           {friendStatus === 'following' && (
//             <Button variant="outlined" disabled sx={{ minWidth: 150 }}>
//               Following
//             </Button>
//           )}

//           <Button
//             variant="contained"
//             color="secondary"
//             startIcon={<SendIcon />}
//             onClick={onMessage}
//             disabled={friendStatus !== 'friends'}
//             sx={{ minWidth: 150 }}
//           >
//             Message
//           </Button>
//         </>
//       )}

//       {!isBlocked && (
//         <Button 
//           variant="outlined" 
//           color="error"
//           onClick={handleBlock}
//           sx={{ minWidth: 150 }}
//         >
//           Block User
//         </Button>
//       )}

//       <Button variant="outlined">
//         <MoreHorizIcon />
//       </Button>
//     </Box>
//   );
// };

// ProfileActions.propTypes = {
//   isOwnProfile: PropTypes.bool.isRequired,
//   friendStatus: PropTypes.oneOf([
//     'friends',
//     'pending',
//     'not_friends',
//     'following',
//   ]),
//   friendshipId: PropTypes.string,
//   userId: PropTypes.string,
//   isBlocked: PropTypes.bool,
//   onAddFriend: PropTypes.func,
//   onMessage: PropTypes.func,
//   onEditProfile: PropTypes.func,
//   onCreateStory: PropTypes.func,
//   onViewFriends: PropTypes.func,
//   onViewAsPublic: PropTypes.func,
// };

// ProfileActions.defaultProps = {
//   friendStatus: 'not_friends',
//   isBlocked: false,
//   onViewAsPublic: () => {},
// };

// const PrivateProfilePage = () => {
//   // Initialization
//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
//   // Redux state
//   const { profile, loading, error } = useSelector((state) => state.user);
//   const { sentRequests, friendsList } = useSelector((state) => state.friendship);

//   // Component state
//   const [state, setState] = useState({
//     tabValue: 0,
//     deleteDialogOpen: false,
//     coverImageLoading: false,
//     privacy: {
//       profileVisibility: 'public',
//       emailVisibility: 'friends',
//       phoneVisibility: 'private'
//     },
//     privacyChanged: false,
//     searchInput: '',
//     isHoveringCover: false,
//     showCancelButtons: false,
//     showFriendsList: false
//   });

//   // Derived values
//   const userId = useMemo(() => profile?.user?.id || profile?.id || 'me', [profile]);

//   const userData = useMemo(() => ({
//     id: userId,
//     fullName: `${profile?.user?.firstName || profile?.firstName || ''} ${profile?.user?.lastName || profile?.lastName || ''}`.trim(),
//     email: profile?.user?.email || profile?.email || 'No email provided',
//     phone: profile?.user?.phone || profile?.phone || 'No phone provided',
//     location: profile?.user?.location || profile?.location || 'Location not set',
//     website: profile?.user?.website || profile?.website || null,
//     bio: profile?.user?.bio || profile?.bio || 'Tell your story...',
//     isVerified: profile?.user?.isVerified || profile?.isVerified || false,
//     profileImage: profile?.user?.profileImage || profile?.profileImage || DEFAULT_PROFILE_IMAGE,
//     coverImage: profile?.user?.coverImage || profile?.coverImage || DEFAULT_COVER_IMAGE,
//     createdAt: profile?.user?.createdAt || profile?.createdAt || new Date(),
//     updatedAt: profile?.user?.updatedAt || profile?.updatedAt || new Date(),
//     postsCount: profile?.user?.postsCount || profile?.postsCount || 0,
//     friendsCount: profile?.user?.friendsCount || profile?.friendsCount || 0,
//     viewsCount: profile?.user?.viewsCount || profile?.viewsCount || 0,
//     isCurrentUser: true,
//     sentRequests: sentRequests?.data || [],
//     friends: friendsList?.data?.map(friend => ({
//       ...friend,
//       friendshipDate: friend.friendshipDate || new Date()
//     })) || [],
//     isBlocked: profile?.user?.isBlocked || profile?.isBlocked || false
//   }), [profile, userId, sentRequests, friendsList]);

//   // Effects
//   useEffect(() => {
//     dispatch(fetchUserProfile());
//   }, [dispatch]);

//   useEffect(() => {
//     if (error) {
//       dispatch(showSnackbar({
//         message: error,
//         severity: 'error'
//       }));
//     }
//   }, [error, dispatch]);

//   // Handler functions
//   const handleStateChange = useCallback((updates) => {
//     setState(prev => ({ ...prev, ...updates }));
//   }, []);

//   const handleViewAsPublic = useCallback(() => {
//     window.open(`/profile/${userId}`, '_blank');
//   }, [userId]);

//   const handleCreateStory = useCallback(() => navigate('/create-story'), [navigate]);
//   const handleEditProfile = useCallback(() => navigate('/my-profile-update'), [navigate]);
  
//   const handleViewFriends = useCallback(() => {
//     handleStateChange({ 
//       showFriendsList: !state.showFriendsList,
//       showCancelButtons: false 
//     });
//   }, [state.showFriendsList, handleStateChange]);

//   const toggleCancelButtons = useCallback(() => {
//     handleStateChange({ 
//       showCancelButtons: !state.showCancelButtons,
//       showFriendsList: false 
//     });
//   }, [state.showCancelButtons, handleStateChange]);

//   const handleEditPrivateProfile = useCallback(() => navigate('/profile/private-update'), [navigate]);

//   const handlePrivacyUpdate = useCallback((field, value) => {
//     handleStateChange({ 
//       privacy: { ...state.privacy, [field]: value },
//       privacyChanged: true 
//     });
//   }, [state.privacy, handleStateChange]);

//   const formatDate = useCallback((dateString) => {
//     try {
//       const date = new Date(dateString);
//       return isNaN(date.getTime()) 
//         ? 'Unknown date' 
//         : date.toLocaleDateString('en-US', {
//             year: 'numeric',
//             month: 'long',
//             day: 'numeric'
//           });
//     } catch {
//       return 'Unknown date';
//     }
//   }, []);

//   const handleCoverPhotoUpdate = useCallback(async (e) => {
//     const file = e.target.files[0];
//     if (!file) return;

//     if (!file.type.startsWith('image/')) {
//       dispatch(showSnackbar({
//         message: 'Only image files are allowed',
//         severity: 'error'
//       }));
//       return;
//     }

//     if (file.size > MAX_COVER_IMAGE_SIZE) {
//       dispatch(showSnackbar({
//         message: 'Image size must be less than 5MB',
//         severity: 'error'
//       }));
//       return;
//     }

//     handleStateChange({ coverImageLoading: true });
    
//     try {
//       const formData = new FormData();
//       formData.append('coverImage', file);
//       await dispatch(updateCoverImage(formData)).unwrap();
      
//       dispatch(showSnackbar({
//         message: 'Cover image updated successfully!',
//         severity: 'success'
//       }));
      
//       await dispatch(fetchUserProfile());
//     } catch (error) {
//       dispatch(showSnackbar({
//         message: error.message || 'Failed to update cover image',
//         severity: 'error'
//       }));
//     } finally {
//       handleStateChange({ coverImageLoading: false });
//       e.target.value = '';
//     }
//   }, [dispatch, handleStateChange]);

//   // Render functions
//   const renderErrorState = () => (
//     <Box sx={{
//       display: 'flex',
//       justifyContent: 'center',
//       alignItems: 'center',
//       height: '100vh',
//       flexDirection: 'column',
//       gap: 2
//     }}>
//       <Typography variant="h6" color="error">
//         Failed to load profile
//       </Typography>
//       <Button 
//         variant="contained" 
//         onClick={() => dispatch(fetchUserProfile())}
//         sx={{ mt: 2 }}
//       >
//         Retry
//       </Button>
//     </Box>
//   );

//   const renderPendingRequests = () => (
//     <Box sx={{ 
//       mt: 2, 
//       p: 2, 
//       bgcolor: 'background.paper', 
//       borderRadius: 1,
//       maxWidth: 'lg',
//       mx: 'auto'
//     }}>
//       <Typography variant="h6" gutterBottom>
//         Pending Friend Requests ({userData.sentRequests.length})
//       </Typography>
//       <List>
//         {userData.sentRequests.map(request => (
//           <ListItem 
//             key={request.id}
//             sx={{ 
//               py: 1.5,
//               '&:hover': { backgroundColor: 'action.hover' }
//             }}
//           >
//             <ListItemAvatar>
//               <Avatar 
//                 src={request.receiver?.profileImage || DEFAULT_PROFILE_IMAGE}
//                 sx={{ width: 48, height: 48 }}
//               />
//             </ListItemAvatar>
//             <ListItemText
//               primary={`${request.receiver?.firstName} ${request.receiver?.lastName}`}
//               secondary="Request sent - Pending"
//             />
//             <Box sx={{ ml: 2 }}>
//               <CancelRequestButton friendshipId={request.id} />
//             </Box>
//           </ListItem>
//         ))}
//       </List>
//     </Box>
//   );

//   const renderFriendsList = () => (
//     <Box sx={{ 
//       mt: 2, 
//       p: 2, 
//       bgcolor: 'background.paper', 
//       borderRadius: 1,
//       maxWidth: 'lg',
//       mx: 'auto'
//     }}>
//       <Typography variant="h6" gutterBottom>
//         Your Friends ({userData.friendsCount})
//       </Typography>
//       <List>
//         {userData.friends.map(friend => (
//           <ListItem 
//             key={friend.id}
//             sx={{ 
//               py: 1.5,
//               '&:hover': { backgroundColor: 'action.hover' }
//             }}
//           >
//             <ListItemAvatar>
//               <Avatar 
//                 src={friend.profileImage || DEFAULT_PROFILE_IMAGE}
//                 sx={{ width: 48, height: 48 }}
//               />
//             </ListItemAvatar>
//             <ListItemText
//               primary={`${friend.firstName} ${friend.lastName}`}
//               secondary={`Friends since ${formatDate(friend.friendshipDate)}`}
//             />
//             <Box sx={{ ml: 2, display: 'flex', gap: 1 }}>
//               <RemoveFriendButton 
//                 friendshipId={friend.friendshipId}
//                 sx={{ minWidth: 110 }}
//               />
//               <FriendshipTierDialog 
//                 friendshipId={friend.friendshipId} 
//                 currentTier={friend.tier} 
//               />
//             </Box>
//           </ListItem>
//         ))}
//       </List>
//     </Box>
//   );

//   if (loading || !profile) {
//     return <ProfileSkeleton />;
//   }

//   if (error) {
//     return renderErrorState();
//   }

//   return (
//     <ThemeProvider theme={theme}>
//       <Box sx={{
//         backgroundColor: 'background.default',
//         minHeight: '100vh',
//         pb: 6
//       }}>
//         <ProfileHeader
//           userData={userData}
//           isMobile={isMobile}
//           onCoverPhotoEdit={handleCoverPhotoUpdate}
//           onProfilePhotoEdit={handleEditProfile}
//           coverImageLoading={state.coverImageLoading}
//           isHoveringCover={state.isHoveringCover}
//           setIsHoveringCover={(value) => handleStateChange({ isHoveringCover: value })}
//         />

//         <Zoom in={!loading} timeout={500}>
//           <Box>
//             <ProfileActions
//               isOwnProfile={true}
//               onCreateStory={handleCreateStory}
//               onEditProfile={handleEditProfile}
//               onViewFriends={handleViewFriends}
//               onViewAsPublic={handleViewAsPublic}
//               userId={userId}
//               isBlocked={userData.isBlocked}
//             />
//             <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
//               <Button 
//                 variant="outlined" 
//                 onClick={toggleCancelButtons}
//                 sx={{ flex: 1 }}
//               >
//                 {state.showCancelButtons ? 'Hide Pending Requests' : 'Show Pending Requests'}
//               </Button>
//             </Box>
//           </Box>
//         </Zoom>

//         {state.showCancelButtons && userData.sentRequests.length > 0 && renderPendingRequests()}
//         {state.showFriendsList && userData.friends.length > 0 && renderFriendsList()}

//         <Fade in={!loading} timeout={1000}>
//           <Box>
//             <ProfileInfoSection
//               userData={userData}
//               isMobile={isMobile}
//               formatDate={formatDate}
//             />

//             <Box sx={{
//               maxWidth: 'lg',
//               mx: 'auto',
//               px: { xs: 2, sm: 3, md: 4 }
//             }}>
//               <ProfileStats userData={userData} />

//               <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2, mb: 1 }}>
//                 <Tooltip title="Open your public profile in new tab" arrow>
//                   <Button 
//                     onClick={handleViewAsPublic}
//                     startIcon={<OpenInNew />}
//                     variant="outlined"
//                     size="small"
//                   >
//                     View As Public
//                   </Button>
//                 </Tooltip>
//               </Box>

//               <ProfileTabs
//                 tabValue={state.tabValue}
//                 handleTabChange={(_, val) => handleStateChange({ tabValue: val })}
//                 privacy={state.privacy}
//                 privacyChanged={state.privacyChanged}
//                 handlePrivacyChange={handlePrivacyUpdate}
//                 onSavePrivacy={() => {
//                   dispatch(showSnackbar({
//                     message: 'Privacy settings saved!',
//                     severity: 'success'
//                   }));
//                   handleStateChange({ privacyChanged: false });
//                 }}
//                 onDeleteAccount={() => handleStateChange({ deleteDialogOpen: true })}
//                 userData={userData}
//                 formatDate={formatDate}
//               />
//             </Box>
//           </Box>
//         </Fade>

//         <DeleteAccountDialog
//           open={state.deleteDialogOpen}
//           onClose={() => handleStateChange({ deleteDialogOpen: false })}
//           onConfirm={() => {
//             dispatch(logoutUser());
//             dispatch(showSnackbar({
//               message: 'Account deleted successfully',
//               severity: 'success'
//             }));
//             navigate('/');
//           }}
//         />
//       </Box>
//     </ThemeProvider>
//   );
// };

// export default PrivateProfilePage;






