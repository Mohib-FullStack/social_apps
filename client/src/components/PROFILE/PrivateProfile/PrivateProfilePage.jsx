import {
  Add as AddIcon,
  ArrowForward as ArrowForwardIcon,
  Check as CheckIcon,
  Edit as EditIcon,
  HourglassEmpty as HourglassEmptyIcon,
  MoreHoriz as MoreHorizIcon,
  PersonAdd as PersonAddIcon,
  Send as SendIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';
import OpenInNew from '@mui/icons-material/OpenInNew';
import {
  Avatar,
  Box,
  Button,
  Fade,
  FormControl,
  InputLabel,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  MenuItem,
  Select,
  ThemeProvider,
  Tooltip,
  Typography,
  useMediaQuery,
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
  unblockUser,
  updateFriendshipTier
} from '../../../features/friendship/friendshipSlice';
import { showSnackbar } from '../../../features/snackbar/snackbarSlice';
import {
  fetchUserProfile,
  logoutUser,
  updateCoverImage
} from '../../../features/user/userSlice';

// Components
import CancelRequestButton from './CancelRequestButton';
import DeleteAccountDialog from './DeleteAccountDialog';
import ProfileHeader from './ProfileHeader';
import ProfileInfoSection from './ProfileInfoSection';
import ProfileSkeleton from './ProfileSkeleton';
import ProfileStats from './ProfileStats';
import ProfileTabs from './ProfileTabs';
import RemoveFriendButton from './RemoveFriendButton';

// Constants
const DEFAULT_PROFILE_IMAGE = '/default-avatar.png';
const DEFAULT_COVER_IMAGE = '/default-cover.jpg';
const MAX_COVER_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

const FriendshipTierDialog = ({ friendshipId, currentTier }) => {
  const dispatch = useDispatch();
  
  const tiers = [
    { value: 'close_friends', label: 'Close Friends' },
    { value: 'acquaintances', label: 'Acquaintances' },
    { value: 'family', label: 'Family' },
    { value: 'work', label: 'Work' },
    { value: 'custom', label: 'Custom' }
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
          value={currentTier || ''}
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
            <Button variant="contained" disabled startIcon={<CheckIcon />} sx={{ minWidth: 150 }}>
              Friends
            </Button>
          )}

          {friendStatus === 'following' && (
            <Button variant="outlined" disabled sx={{ minWidth: 150 }}>
              Following
            </Button>
          )}

          <Button
            variant="contained"
            color="secondary"
            startIcon={<SendIcon />}
            onClick={onMessage}
            disabled={friendStatus !== 'friends'}
            sx={{ minWidth: 150 }}
          >
            Message
          </Button>
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

const PrivateProfilePage = () => {
  // Initialization
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Redux state
  const { profile, loading, error } = useSelector((state) => state.user);
  const { sentRequests, friendsList } = useSelector((state) => state.friendship);

  // Component state
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

  // Derived values
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

  // Effects
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

  // Handler functions
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

  // Render functions
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

  const renderPendingRequests = () => (
    <Box sx={{ 
      mt: 2, 
      p: 2, 
      bgcolor: 'background.paper', 
      borderRadius: 1,
      maxWidth: 'lg',
      mx: 'auto'
    }}>
      <Typography variant="h6" gutterBottom>
        Pending Friend Requests ({userData.sentRequests.length})
      </Typography>
      <List>
        {userData.sentRequests.map(request => (
          <ListItem 
            key={request.id}
            sx={{ 
              py: 1.5,
              '&:hover': { backgroundColor: 'action.hover' }
            }}
          >
            <ListItemAvatar>
              <Avatar 
                src={request.receiver?.profileImage || DEFAULT_PROFILE_IMAGE}
                sx={{ width: 48, height: 48 }}
              />
            </ListItemAvatar>
            <ListItemText
              primary={`${request.receiver?.firstName} ${request.receiver?.lastName}`}
              secondary="Request sent - Pending"
            />
            <Box sx={{ ml: 2 }}>
              <CancelRequestButton friendshipId={request.id} />
            </Box>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  const renderFriendsList = () => (
    <Box sx={{ 
      mt: 2, 
      p: 2, 
      bgcolor: 'background.paper', 
      borderRadius: 1,
      maxWidth: 'lg',
      mx: 'auto'
    }}>
      <Typography variant="h6" gutterBottom>
        Your Friends ({userData.friendsCount})
      </Typography>
      <List>
        {userData.friends.map(friend => (
          <ListItem 
            key={friend.id}
            sx={{ 
              py: 1.5,
              '&:hover': { backgroundColor: 'action.hover' }
            }}
          >
            <ListItemAvatar>
              <Avatar 
                src={friend.profileImage || DEFAULT_PROFILE_IMAGE}
                sx={{ width: 48, height: 48 }}
              />
            </ListItemAvatar>
            <ListItemText
              primary={`${friend.firstName} ${friend.lastName}`}
              secondary={`Friends since ${formatDate(friend.friendshipDate)}`}
            />
            <Box sx={{ ml: 2, display: 'flex', gap: 1 }}>
              <RemoveFriendButton 
                friendshipId={friend.friendshipId}
                sx={{ minWidth: 110 }}
              />
              <FriendshipTierDialog 
                friendshipId={friend.friendshipId} 
                currentTier={friend.tier} 
              />
            </Box>
          </ListItem>
        ))}
      </List>
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
              userId={userId}
              isBlocked={userData.isBlocked}
            />
            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              <Button 
                variant="outlined" 
                onClick={toggleCancelButtons}
                sx={{ flex: 1 }}
              >
                {state.showCancelButtons ? 'Hide Pending Requests' : 'Show Pending Requests'}
              </Button>
            </Box>
          </Box>
        </Zoom>

        {state.showCancelButtons && userData.sentRequests.length > 0 && renderPendingRequests()}
        {state.showFriendsList && userData.friends.length > 0 && renderFriendsList()}

        <Fade in={!loading} timeout={1000}>
          <Box>
            <ProfileInfoSection
              userData={userData}
              isMobile={isMobile}
              formatDate={formatDate}
            />

            <Box sx={{
              maxWidth: 'lg',
              mx: 'auto',
              px: { xs: 2, sm: 3, md: 4 }
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
                privacy={state.privacy}
                privacyChanged={state.privacyChanged}
                handlePrivacyChange={handlePrivacyUpdate}
                onSavePrivacy={() => {
                  dispatch(showSnackbar({
                    message: 'Privacy settings saved!',
                    severity: 'success'
                  }));
                  handleStateChange({ privacyChanged: false });
                }}
                onDeleteAccount={() => handleStateChange({ deleteDialogOpen: true })}
                userData={userData}
                formatDate={formatDate}
              />
            </Box>
          </Box>
        </Fade>

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





//! curent
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
//   List,
//   ListItem,
//   ListItemAvatar,
//   ListItemText,
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
// import { showSnackbar } from '../../../features/snackbar/snackbarSlice';
// import {
//   fetchUserProfile,
//   logoutUser,
//   updateCoverImage
// } from '../../../features/user/userSlice';

// // Components
// import { blockUser, unblockUser } from '../../../features/friendship/friendshipSlice';
// // import SearchBar from '../../SearchBar/SearchBar';
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
//             <Box sx={{ ml: 2 }}>
//               <RemoveFriendButton 
//                 friendshipId={friend.friendshipId}
//                 sx={{ minWidth: 110 }}
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

//         {/* <ClickAwayListener onClickAway={() => handleStateChange({ searchInput: '' })}>
//           <Fade in={!loading} timeout={800}>
//             <Box sx={{
//               p: 2,
//               width: '100%',
//               maxWidth: 600,
//               mx: 'auto',
//               mt: 2
//             }}>
//               <SearchBar
//                 value={state.searchInput}
//                 onChange={(value) => handleStateChange({ searchInput: value })}
//                 placeholder="Search your profile..."
//               />
//             </Box>
//           </Fade>
//         </ClickAwayListener> */}

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


//! curent
// import OpenInNew from '@mui/icons-material/OpenInNew';
// import {
//   Avatar,
//   Box,
//   Button,
//   ClickAwayListener,
//   Fade,
//   List,
//   ListItem,
//   ListItemAvatar,
//   ListItemText,
//   ThemeProvider,
//   Tooltip,
//   Typography,
//   useMediaQuery,
//   Zoom
// } from '@mui/material';
// import { useCallback, useEffect, useMemo, useState } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { useNavigate } from 'react-router-dom';
// import theme from '../../../theme';

// // Redux actions
// import { showSnackbar } from '../../../features/snackbar/snackbarSlice';
// import {
//   fetchUserProfile,
//   logoutUser,
//   updateCoverImage
// } from '../../../features/user/userSlice';

// // Components
// import SearchBar from '../../SearchBar/SearchBar';
// import CancelRequestButton from './CancelRequestButton';
// import DeleteAccountDialog from './DeleteAccountDialog';
// import ProfileActions from './ProfileActions';
// import ProfileHeader from './ProfileHeader';
// import ProfileInfoSection from './ProfileInfoSection';
// import ProfileSkeleton from './ProfileSkeleton';
// import ProfileStats from './ProfileStats';
// import ProfileTabs from './ProfileTabs';

// // Constants
// const DEFAULT_PROFILE_IMAGE = '/default-avatar.png';
// const DEFAULT_COVER_IMAGE = '/default-cover.jpg';
// const MAX_COVER_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

// const PrivateProfilePage = () => {
//   // Initialization
//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
//   const { profile, loading, error } = useSelector((state) => state.user);
//   const { sentRequests } = useSelector((state) => state.friendship);

//   // State management
//   const [tabValue, setTabValue] = useState(0);
//   const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
//   const [coverImageLoading, setCoverImageLoading] = useState(false);
//   const [privacy, setPrivacy] = useState({
//     profileVisibility: 'public',
//     emailVisibility: 'friends',
//     phoneVisibility: 'private'
//   });
//   const [privacyChanged, setPrivacyChanged] = useState(false);
//   const [searchInput, setSearchInput] = useState('');
//   const [isHoveringCover, setIsHoveringCover] = useState(false);
//   const [showCancelButtons, setShowCancelButtons] = useState(false);

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
//     sentRequests: sentRequests?.data || []
//   }), [profile, userId, sentRequests]);

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

//   // Handlers
//   const handleViewAsPublic = useCallback(() => {
//     window.open(`/profile/${userId}`, '_blank');
//   }, [userId]);

//   const handleCreateStory = useCallback(() => navigate('/create-story'), [navigate]);
//   const handleEditProfile = useCallback(() => navigate('/my-profile-update'), [navigate]);
//   const handleViewFriends = useCallback(() => navigate('/friends'), [navigate]);
//   const handleEditPrivateProfile = useCallback(() => navigate('/profile/private-update'), [navigate]);

//   const handlePrivacyUpdate = useCallback((field, value) => {
//     setPrivacy(prev => ({ ...prev, [field]: value }));
//     setPrivacyChanged(true);
//   }, []);

//   const toggleCancelButtons = useCallback(() => {
//     setShowCancelButtons(prev => !prev);
//   }, []);

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

//     setCoverImageLoading(true);
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
//       setCoverImageLoading(false);
//       e.target.value = '';
//     }
//   }, [dispatch]);

//   if (loading || !profile) {
//     return <ProfileSkeleton />;
//   }

//   if (error) {
//     return (
//       <Box sx={{
//         display: 'flex',
//         justifyContent: 'center',
//         alignItems: 'center',
//         height: '100vh',
//         flexDirection: 'column',
//         gap: 2
//       }}>
//         <Typography variant="h6" color="error">
//           Failed to load profile
//         </Typography>
//         <Button 
//           variant="contained" 
//           onClick={() => dispatch(fetchUserProfile())}
//           sx={{ mt: 2 }}
//         >
//           Retry
//         </Button>
//       </Box>
//     );
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
//           coverImageLoading={coverImageLoading}
//           isHoveringCover={isHoveringCover}
//           setIsHoveringCover={setIsHoveringCover}
//         />

//         <Zoom in={!loading} timeout={500}>
//           <Box>
//             <ProfileActions
//               isOwnProfile={true}
//               onCreateStory={handleCreateStory}
//               onEditProfile={handleEditProfile}
//               onViewFriends={handleViewFriends}
//               onViewAsPublic={handleViewAsPublic}
//             />
//             <Button 
//               variant="outlined" 
//               onClick={toggleCancelButtons}
//               sx={{ mt: 2, ml: 2 }}
//             >
//               {showCancelButtons ? 'Hide Pending Requests' : 'Show Pending Requests'}
//             </Button>
//           </Box>
//         </Zoom>

//         {showCancelButtons && userData.sentRequests.length > 0 && (
//           <Box sx={{ mt: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
//             <Typography variant="h6" gutterBottom>
//               Pending Friend Requests
//             </Typography>
//             <List>
//               {userData.sentRequests.map(request => (
//                 <ListItem key={request.id}>
//                   <ListItemAvatar>
//                     <Avatar src={request.receiver?.profileImage} />
//                   </ListItemAvatar>
//                   <ListItemText
//                     primary={`${request.receiver?.firstName} ${request.receiver?.lastName}`}
//                     secondary="Request sent - Pending"
//                   />
//                   <CancelRequestButton friendshipId={request.id} />
//                 </ListItem>
//               ))}
//             </List>
//           </Box>
//         )}

//         <ClickAwayListener onClickAway={() => setSearchInput('')}>
//           <Fade in={!loading} timeout={800}>
//             <Box sx={{
//               p: 2,
//               width: '100%',
//               maxWidth: 600,
//               mx: 'auto',
//               mt: 2
//             }}>
//               <SearchBar
//                 value={searchInput}
//                 onChange={setSearchInput}
//                 placeholder="Search your profile..."
//               />
//             </Box>
//           </Fade>
//         </ClickAwayListener>

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
//                 tabValue={tabValue}
//                 handleTabChange={(_, val) => setTabValue(val)}
//                 privacy={privacy}
//                 privacyChanged={privacyChanged}
//                 handlePrivacyChange={handlePrivacyUpdate}
//                 onSavePrivacy={() => {
//                   dispatch(showSnackbar({
//                     message: 'Privacy settings saved!',
//                     severity: 'success'
//                   }));
//                   setPrivacyChanged(false);
//                 }}
//                 onDeleteAccount={() => setDeleteDialogOpen(true)}
//                 userData={userData}
//                 formatDate={formatDate}
//               />
//             </Box>
//           </Box>
//         </Fade>

//         <DeleteAccountDialog
//           open={deleteDialogOpen}
//           onClose={() => setDeleteDialogOpen(false)}
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










//! original
// import OpenInNew from '@mui/icons-material/OpenInNew';
// import {
//   Box,
//   Button,
//   ClickAwayListener,
//   Fade,
//   ThemeProvider,
//   Tooltip,
//   Typography,
//   useMediaQuery,
//   Zoom
// } from '@mui/material';
// import { useCallback, useEffect, useMemo, useState } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { useNavigate } from 'react-router-dom';
// import theme from '../../../theme';

// // Redux actions
// import { showSnackbar } from '../../../features/snackbar/snackbarSlice';
// import {
//   fetchUserProfile,
//   logoutUser,
//   updateCoverImage
// } from '../../../features/user/userSlice';

// // Components
// import SearchBar from '../../SearchBar/SearchBar';
// import DeleteAccountDialog from './DeleteAccountDialog';
// import ProfileActions from './ProfileActions';
// import ProfileHeader from './ProfileHeader';
// import ProfileInfoSection from './ProfileInfoSection';
// import ProfileSkeleton from './ProfileSkeleton';
// import ProfileStats from './ProfileStats';
// import ProfileTabs from './ProfileTabs';

// // Constants
// const DEFAULT_PROFILE_IMAGE = '/default-avatar.png';
// const DEFAULT_COVER_IMAGE = '/default-cover.jpg';
// const MAX_COVER_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

// const PrivateProfilePage = () => {
//   // Initialization
//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
//   const { profile, loading, error } = useSelector((state) => state.user);

//   // State management
//   const [tabValue, setTabValue] = useState(0);
//   const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
//   const [coverImageLoading, setCoverImageLoading] = useState(false);
//   const [privacy, setPrivacy] = useState({
//     profileVisibility: 'public',
//     emailVisibility: 'friends',
//     phoneVisibility: 'private'
//   });
//   const [privacyChanged, setPrivacyChanged] = useState(false);
//   const [searchInput, setSearchInput] = useState('');
//   const [isHoveringCover, setIsHoveringCover] = useState(false);

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
//     isCurrentUser: true
//   }), [profile, userId]);

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

//   // Handlers
//   const handleViewAsPublic = useCallback(() => {
//     window.open(`/profile/${userId}`, '_blank');
//   }, [userId]);

//   const handleCreateStory = useCallback(() => navigate('/create-story'), [navigate]);
//   const handleEditProfile = useCallback(() => navigate('/my-profile-update'), [navigate]);
//   const handleViewFriends = useCallback(() => navigate('/friends'), [navigate]);
//   const handleEditPrivateProfile = useCallback(() => navigate('/profile/private-update'), [navigate]);

//   const handlePrivacyUpdate = useCallback((field, value) => {
//     setPrivacy(prev => ({ ...prev, [field]: value }));
//     setPrivacyChanged(true);
//   }, []);

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

//     setCoverImageLoading(true);
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
//       setCoverImageLoading(false);
//       e.target.value = '';
//     }
//   }, [dispatch]);

//   if (loading || !profile) {
//     return <ProfileSkeleton />;
//   }

//   if (error) {
//     return (
//       <Box sx={{
//         display: 'flex',
//         justifyContent: 'center',
//         alignItems: 'center',
//         height: '100vh',
//         flexDirection: 'column',
//         gap: 2
//       }}>
//         <Typography variant="h6" color="error">
//           Failed to load profile
//         </Typography>
//         <Button 
//           variant="contained" 
//           onClick={() => dispatch(fetchUserProfile())}
//           sx={{ mt: 2 }}
//         >
//           Retry
//         </Button>
//       </Box>
//     );
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
//           coverImageLoading={coverImageLoading}
//           isHoveringCover={isHoveringCover}
//           setIsHoveringCover={setIsHoveringCover}
//         />

//         <Zoom in={!loading} timeout={500}>
//           <Box>
//             <ProfileActions
//               isOwnProfile={true}
//               onCreateStory={handleCreateStory}
//               onEditProfile={handleEditProfile}
//               onViewFriends={handleViewFriends}
//               onViewAsPublic={handleViewAsPublic}
//             />
//           </Box>
//         </Zoom>

//         <ClickAwayListener onClickAway={() => setSearchInput('')}>
//           <Fade in={!loading} timeout={800}>
//             <Box sx={{
//               p: 2,
//               width: '100%',
//               maxWidth: 600,
//               mx: 'auto',
//               mt: 2
//             }}>
//               <SearchBar
//                 value={searchInput}
//                 onChange={setSearchInput}
//                 placeholder="Search your profile..."
//               />
//             </Box>
//           </Fade>
//         </ClickAwayListener>

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
//                 tabValue={tabValue}
//                 handleTabChange={(_, val) => setTabValue(val)}
//                 privacy={privacy}
//                 privacyChanged={privacyChanged}
//                 handlePrivacyChange={handlePrivacyUpdate}
//                 onSavePrivacy={() => {
//                   dispatch(showSnackbar({
//                     message: 'Privacy settings saved!',
//                     severity: 'success'
//                   }));
//                   setPrivacyChanged(false);
//                 }}
//                 onDeleteAccount={() => setDeleteDialogOpen(true)}
//                 userData={userData}
//                 formatDate={formatDate}
//               />
//             </Box>
//           </Box>
//         </Fade>

//         <DeleteAccountDialog
//           open={deleteDialogOpen}
//           onClose={() => setDeleteDialogOpen(false)}
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

