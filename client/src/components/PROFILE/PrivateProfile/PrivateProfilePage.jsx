import { useState, useEffect, useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  ThemeProvider, 
  useMediaQuery, 
  ClickAwayListener,
  Box, 
  CircularProgress, 
  Fade, 
  Zoom, 
  Button, 
  Typography,
  Tooltip
} from '@mui/material';
import theme from '../../../theme';
import OpenInNew from '@mui/icons-material/OpenInNew';

// Redux actions
import { showSnackbar } from '../../../features/snackbar/snackbarSlice';
import {
  fetchUserProfile,
  logoutUser,
  updateCoverImage
} from '../../../features/user/userSlice';

// Components
import ProfileHeader from './ProfileHeader';
import ProfileInfoSection from './ProfileInfoSection';
import ProfileStats from './ProfileStats';
import ProfileTabs from './ProfileTabs';
import DeleteAccountDialog from './DeleteAccountDialog';
import ProfileActions from './ProfileActions';
import SearchBar from '../../SearchBar/SearchBar';
import ProfileSkeleton from './ProfileSkeleton';

// Constants
const DEFAULT_PROFILE_IMAGE = '/default-avatar.png';
const DEFAULT_COVER_IMAGE = '/default-cover.jpg';
const MAX_COVER_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

const PrivateProfilePage = () => {
  // Initialization
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { profile, loading, error } = useSelector((state) => state.user);

  // State management
  const [tabValue, setTabValue] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [coverImageLoading, setCoverImageLoading] = useState(false);
  const [privacy, setPrivacy] = useState({
    profileVisibility: 'public',
    emailVisibility: 'friends',
    phoneVisibility: 'private'
  });
  const [privacyChanged, setPrivacyChanged] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [isHoveringCover, setIsHoveringCover] = useState(false);

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
    isCurrentUser: true
  }), [profile, userId]);

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

  // Handlers
  const handleViewAsPublic = useCallback(() => {
    window.open(`/profile/${userId}`, '_blank');
  }, [userId]);

  const handleCreateStory = useCallback(() => navigate('/create-story'), [navigate]);
  const handleEditProfile = useCallback(() => navigate('/my-profile-update'), [navigate]);
  const handleViewFriends = useCallback(() => navigate('/friends'), [navigate]);
  const handleEditPrivateProfile = useCallback(() => navigate('/profile/private-update'), [navigate]);

  const handlePrivacyUpdate = useCallback((field, value) => {
    setPrivacy(prev => ({ ...prev, [field]: value }));
    setPrivacyChanged(true);
  }, []);

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

    setCoverImageLoading(true);
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
      setCoverImageLoading(false);
      e.target.value = '';
    }
  }, [dispatch]);

  if (loading || !profile) {
    return <ProfileSkeleton />;
  }

  if (error) {
    return (
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
          coverImageLoading={coverImageLoading}
          isHoveringCover={isHoveringCover}
          setIsHoveringCover={setIsHoveringCover}
        />

        <Zoom in={!loading} timeout={500}>
          <Box>
            <ProfileActions
              isOwnProfile={true}
              onCreateStory={handleCreateStory}
              onEditProfile={handleEditProfile}
              onViewFriends={handleViewFriends}
              onViewAsPublic={handleViewAsPublic}
            />
          </Box>
        </Zoom>

        <ClickAwayListener onClickAway={() => setSearchInput('')}>
          <Fade in={!loading} timeout={800}>
            <Box sx={{
              p: 2,
              width: '100%',
              maxWidth: 600,
              mx: 'auto',
              mt: 2
            }}>
              <SearchBar
                value={searchInput}
                onChange={setSearchInput}
                placeholder="Search your profile..."
              />
            </Box>
          </Fade>
        </ClickAwayListener>

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
                tabValue={tabValue}
                handleTabChange={(_, val) => setTabValue(val)}
                privacy={privacy}
                privacyChanged={privacyChanged}
                handlePrivacyChange={handlePrivacyUpdate}
                onSavePrivacy={() => {
                  dispatch(showSnackbar({
                    message: 'Privacy settings saved!',
                    severity: 'success'
                  }));
                  setPrivacyChanged(false);
                }}
                onDeleteAccount={() => setDeleteDialogOpen(true)}
                userData={userData}
                formatDate={formatDate}
              />
            </Box>
          </Box>
        </Fade>

        <DeleteAccountDialog
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
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
















