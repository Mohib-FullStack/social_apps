import {
  ArrowBack,
  Cake,
  CameraAlt,
  Delete,
  Email,
  Event,
  Groups,
  Link as LinkIcon,
  LocationOn,
  Lock,
  MusicNote,
  Notes,
  People,
  Person,
  PhotoLibrary,
  PostAdd,
  School,
  VerifiedUser,
  VideoLibrary,
  Visibility,
  Work
} from '@mui/icons-material';
import {
  Avatar,
  Badge,
  Box,
  Button,
  Card,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  Link,
  MenuItem,
  Paper,
  Select,
  Tab,
  Tabs,
  Typography,
  useMediaQuery
} from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { showSnackbar } from '../../features/snackbar/snackbarSlice';
import { fetchUserProfile, logoutUser, updateCoverImage } from '../../features/user/userSlice';
import theme from '../../theme';

// Constants
const DEFAULT_PROFILE_IMAGE = '/default-avatar.png';
const DEFAULT_COVER_IMAGE = '/default-cover.jpg';

// Utility functions
const formatDate = (date) => {
  try {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch {
    return 'Unknown date';
  }
};

const formatWebsite = (url) => {
  if (!url) return '';
  return url.replace(/(^\w+:|^)\/\//, '');
};

// Sub-components
const StatBox = ({ icon, count, label }) => (
  <Paper elevation={0} sx={{ 
    p: 2, 
    textAlign: 'center',
    borderRadius: 2,
    bgcolor: 'background.paper',
    transition: 'all 0.3s ease',
    '&:hover': {
      transform: 'translateY(-4px)',
      boxShadow: 3,
    }
  }}>
    <Box sx={{ color: 'primary.main', fontSize: 32, mb: 1 }}>{icon}</Box>
    <Typography variant="h5" fontWeight="bold">{count}</Typography>
    <Typography variant="body2" color="text.secondary">{label}</Typography>
  </Paper>
);

const ActionCard = ({ icon, title, path, color, navigate }) => (
  <Paper elevation={2} sx={{ 
    p: 2, 
    borderRadius: 2,
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    transition: 'all 0.3s ease',
    '&:hover': {
      transform: 'translateY(-4px)',
      boxShadow: 4,
    }
  }}>
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
      <Avatar sx={{ 
        bgcolor: `${color}.main`, 
        mr: 2,
        width: 40,
        height: 40,
        color: 'common.white'
      }}>
        {icon}
      </Avatar>
      <Typography variant="subtitle1" fontWeight="500">{title}</Typography>
    </Box>
    <Button
      variant="outlined"
      color={color}
      fullWidth
      onClick={() => navigate(path)}
      size="small"
      sx={{ mt: 'auto' }}
    >
      Open
    </Button>
  </Paper>
);

const DeleteAccountDialog = ({ open, onClose, onConfirm }) => (
  <Dialog
    open={open}
    onClose={onClose}
    aria-labelledby="alert-dialog-title"
    aria-describedby="alert-dialog-description"
  >
    <DialogTitle id="alert-dialog-title">Confirm Account Deletion</DialogTitle>
    <DialogContent>
      <DialogContentText id="alert-dialog-description">
        Are you sure you want to delete your account? This action cannot be undone. 
        All your data will be permanently removed from our servers.
      </DialogContentText>
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose} color="primary">Cancel</Button>
      <Button onClick={onConfirm} color="error" autoFocus startIcon={<Delete />}>
        Delete Account
      </Button>
    </DialogActions>
  </Dialog>
);

const ProfileHeader = ({ 
  userData, 
  isMobile, 
  navigate,
  onCoverPhotoEdit,
  onProfilePhotoEdit,
  coverImageLoading
}) => {
  return (
    <Box sx={{ 
      position: 'relative', 
      width: '100%', 
      height: isMobile ? '45vh' : '55vh',
      maxHeight: 500,
      bgcolor: 'grey.200',
      overflow: 'hidden',
      mt: 8
    }}>
      {/* Cover Photo */}
      {coverImageLoading ? (
        <Box sx={{
          width: '100%',
          height: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          bgcolor: 'background.paper'
        }}>
          <CircularProgress size={60} />
        </Box>
      ) : (
        <Box
          component="img"
          src={userData.coverImage}
          alt={`${userData.fullName}'s cover`}
          sx={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center'
          }}
        />
      )}
      
      {/* Dark overlay gradient */}
      <Box sx={{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.5) 50%, transparent 100%)'
      }} />
      
      {/* Back button */}
      <IconButton
        onClick={() => navigate(-1)}
        sx={{
          position: 'absolute',
          top: 16,
          left: 16,
          bgcolor: 'background.paper',
          '&:hover': {
            bgcolor: 'primary.main',
            color: 'common.white'
          }
        }}
      >
        <ArrowBack />
      </IconButton>
      
      {/* Cover photo edit button */}
      <IconButton
        component="label"
        sx={{
          position: 'absolute',
          top: 16,
          right: 16,
          bgcolor: 'background.paper',
          '&:hover': {
            bgcolor: 'primary.main',
            color: 'common.white'
          }
        }}
      >
        <input
          hidden
          accept="image/*"
          type="file"
          onChange={onCoverPhotoEdit}
        />
        <CameraAlt />
      </IconButton>
      
      {/* Profile Image */}
      <Box sx={{
        position: 'absolute',
        left: isMobile ? '50%' : 32,
        bottom: isMobile ? -80 : -100,
        transform: isMobile ? 'translateX(-50%)' : 'none',
        zIndex: 2,
        mb: 12
      }}>
        <Badge
          overlap="circular"
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          badgeContent={
            <IconButton
              component="label"
              sx={{
                bgcolor: 'primary.main',
                color: 'common.white',
                '&:hover': {
                  bgcolor: 'primary.dark'
                }
              }}
            >
              <input
                hidden
                accept="image/*"
                type="file"
                onChange={onProfilePhotoEdit}
              />
              <CameraAlt fontSize="small" />
            </IconButton>
          }
        >
          <Avatar
            src={userData.profileImage}
            sx={{
              width: isMobile ? 120 : 150,
              height: isMobile ? 120 : 150,
              border: '4px solid',
              borderColor: 'background.paper',
              boxShadow: 3,
              bgcolor: 'primary.main',
            }}
          >
            {userData.fullName?.charAt(0) || ''}
          </Avatar>
        </Badge>
      </Box>
    </Box>
  );
};

const ProfileInfoSection = ({ userData, isMobile }) => {
  return (
    <Box sx={{ 
      maxWidth: 'lg', 
      mx: 'auto', 
      px: { xs: 2, sm: 3, md: 4 },
      mt: isMobile ? 12 : 8,
      textAlign: isMobile ? 'center' : 'left',
      mb: 4,
      ml: isMobile ? 0 : 24
    }}>
      <Typography variant="h3" component="h1" sx={{ fontWeight: 700 }}>
        {userData.fullName || 'Anonymous User'}
        {userData.isVerified && (
          <VerifiedUser 
            color="primary" 
            sx={{ 
              ml: 1, 
              verticalAlign: 'middle',
              fontSize: 'inherit'
            }} 
          />
        )}
      </Typography>
      
      {userData.bio && (
        <Typography variant="subtitle1" color="text.secondary" sx={{ mt: 1 }}>
          {userData.bio}
        </Typography>
      )}
      
      {userData.location && (
        <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
          <LocationOn fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
          {userData.location}
        </Typography>
      )}
      
      {userData.website && (
        <Link 
          href={userData.website.startsWith('http') ? userData.website : `https://${userData.website}`}
          target="_blank"
          rel="noopener noreferrer"
          color="primary"
          sx={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            mt: 1,
            textDecoration: 'none',
            '&:hover': {
              textDecoration: 'underline'
            }
          }}
        >
          <LinkIcon fontSize="small" sx={{ mr: 0.5 }} />
          {formatWebsite(userData.website)}
        </Link>
      )}
    </Box>
  );
};

const ProfileStats = ({ userData }) => {
  return (
    <Grid container spacing={2} sx={{ mb: 4 }}>
      <Grid item xs={4}>
        <StatBox 
          icon={<PostAdd />} 
          count={userData.postsCount} 
          label="Posts" 
        />
      </Grid>
      <Grid item xs={4}>
        <StatBox 
          icon={<People />} 
          count={userData.friendsCount} 
          label="Friends" 
        />
      </Grid>
      <Grid item xs={4}>
        <StatBox 
          icon={<Visibility />} 
          count={userData.viewsCount} 
          label="Profile Views" 
        />
      </Grid>
    </Grid>
  );
};

const ProfileTabs = ({ 
  tabValue, 
  handleTabChange, 
  profileActions, 
  mediaActions, 
  productivityTools, 
  professionalSection, 
  privacy, 
  privacyChanged, 
  handlePrivacyChange, 
  handleSavePrivacy, 
  handleDeleteAccount, 
  navigate, 
  userData 
}) => {
  return (
    <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
      <Tabs 
        value={tabValue} 
        onChange={handleTabChange} 
        variant="scrollable"
        scrollButtons="auto"
        sx={{ 
          borderBottom: 1, 
          borderColor: 'divider',
          '& .MuiTab-root': { 
            minWidth: 120,
            py: 1.5,
            textTransform: 'none',
            fontWeight: 500
          }
        }}
      >
        <Tab label="Profile" icon={<Person />} iconPosition="start" />
        <Tab label="Media" icon={<PhotoLibrary />} iconPosition="start" />
        <Tab label="Tools" icon={<PostAdd />} iconPosition="start" />
        <Tab label="Professional" icon={<Work />} iconPosition="start" />
        <Tab label="Privacy" icon={<Lock />} iconPosition="start" />
      </Tabs>

      <Box sx={{ p: 3 }}>
        {/* Profile Tab */}
        {tabValue === 0 && (
          <Grid container spacing={3}>
            {profileActions.map((action, index) => (
              <Grid item xs={12} sm={6} key={index}>
                <ActionCard {...action} navigate={navigate} />
              </Grid>
            ))}
            
            <Grid item xs={12}>
              <Card sx={{ borderRadius: 2, p: 3 }}>
                <Typography variant="h6" gutterBottom>Personal Information</Typography>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Email color="action" sx={{ mr: 1.5 }} />
                      <Box>
                        <Typography variant="caption" color="text.secondary">Email</Typography>
                        <Typography>{userData.email}</Typography>
                      </Box>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Cake color="action" sx={{ mr: 1.5 }} />
                      <Box>
                        <Typography variant="caption" color="text.secondary">Member Since</Typography>
                        <Typography>{formatDate(userData.createdAt)}</Typography>
                      </Box>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Person color="action" sx={{ mr: 1.5 }} />
                      <Box>
                        <Typography variant="caption" color="text.secondary">Last Updated</Typography>
                        <Typography>{formatDate(userData.updatedAt)}</Typography>
                      </Box>
                    </Box>
                  </Grid>
                </Grid>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Media Tab */}
        {tabValue === 1 && (
          <Grid container spacing={2}>
            {mediaActions.map((action, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <ActionCard {...action} navigate={navigate} />
              </Grid>
            ))}
          </Grid>
        )}

        {/* Tools Tab */}
        {tabValue === 2 && (
          <Grid container spacing={2}>
            {productivityTools.map((action, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <ActionCard {...action} navigate={navigate} />
              </Grid>
            ))}
          </Grid>
        )}

        {/* Professional Tab */}
        {tabValue === 3 && (
          <Grid container spacing={2}>
            {professionalSection.map((action, index) => (
              <Grid item xs={12} sm={6} key={index}>
                <ActionCard {...action} navigate={navigate} />
              </Grid>
            ))}
          </Grid>
        )}

        {/* Privacy Tab */}
        {tabValue === 4 && (
          <Box>
            <Typography variant="h6" gutterBottom>Privacy Settings</Typography>
            <Divider sx={{ mb: 3 }} />
            
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Profile Visibility</InputLabel>
                  <Select
                    value={privacy.profileVisibility}
                    onChange={(e) => handlePrivacyChange('profileVisibility', e.target.value)}
                    label="Profile Visibility"
                  >
                    <MenuItem value="public">Public</MenuItem>
                    <MenuItem value="friends">Friends Only</MenuItem>
                    <MenuItem value="private">Private</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Email Visibility</InputLabel>
                  <Select
                    value={privacy.emailVisibility}
                    onChange={(e) => handlePrivacyChange('emailVisibility', e.target.value)}
                    label="Email Visibility"
                  >
                    <MenuItem value="public">Public</MenuItem>
                    <MenuItem value="friends">Friends Only</MenuItem>
                    <MenuItem value="private">Private</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Phone Visibility</InputLabel>
                  <Select
                    value={privacy.phoneVisibility}
                    onChange={(e) => handlePrivacyChange('phoneVisibility', e.target.value)}
                    label="Phone Visibility"
                  >
                    <MenuItem value="friends">Friends Only</MenuItem>
                    <MenuItem value="private">Private</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleSavePrivacy}
                disabled={!privacyChanged}
              >
                Save Changes
              </Button>
              
              <Button
                variant="outlined"
                color="error"
                onClick={handleDeleteAccount}
                startIcon={<Delete />}
              >
                Delete Account
              </Button>
            </Box>
          </Box>
        )}
      </Box>
    </Card>
  );
};

const PrivateProfilePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { profile, loading, status } = useSelector((state) => state.user);
  
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

  // Fetch profile data
  useEffect(() => {
    dispatch(fetchUserProfile());
  }, [dispatch]);

  // Memoized profile data
  const userData = useMemo(() => {
    const data = profile?.user || profile || {};
    return {
      id: data._id || data.id || 'me',
      fullName: `${data.firstName || ''} ${data.lastName || ''}`.trim(),
      email: data.email || 'No email provided',
      phone: data.phone || 'No phone provided',
      location: data.location || 'Location not set',
      website: data.website || null,
      bio: data.bio || 'Tell your story...',
      isVerified: data.isVerified || false,
      profileImage: data.profileImage || DEFAULT_PROFILE_IMAGE,
      coverImage: data.coverImage || DEFAULT_COVER_IMAGE,
      createdAt: data.createdAt || new Date(),
      updatedAt: data.updatedAt || new Date(),
      postsCount: data.postsCount || 0,
      friendsCount: data.friendsCount || 0,
      viewsCount: data.viewsCount || 0
    };
  }, [profile]);

  // Action configurations
  const profileActions = useMemo(() => [
    { icon: <Person />, title: 'Update Profile', path: '/my-profile-update', color: 'primary' },
    { icon: <Lock />, title: 'Update Password', path: '/update-password', color: 'secondary' }
  ], []);

  const mediaActions = useMemo(() => [
    { icon: <PhotoLibrary />, title: 'Photo Library', path: '/photos', color: 'warning' },
    { icon: <VideoLibrary />, title: 'Video Library', path: '/videos', color: 'error' },
    { icon: <MusicNote />, title: 'Music Library', path: '/music', color: 'success' }
  ], []);

  const productivityTools = useMemo(() => [
    { icon: <Event />, title: 'Calendar', path: '/calendar', color: 'info' },
    { icon: <Notes />, title: 'Notes', path: '/notes', color: 'info' },
    { icon: <PostAdd />, title: 'Posts', path: '/posts', color: 'info' }
  ], []);

  const professionalSection = useMemo(() => [
    { icon: <Work />, title: 'Work Experience', path: '/work', color: 'primary' },
    { icon: <School />, title: 'Education', path: '/education', color: 'primary' },
    { icon: <Groups />, title: 'Groups', path: '/groups', color: 'primary' },
    { icon: <LinkIcon />, title: 'Portfolio Links', path: '/links', color: 'primary' }
  ], []);

  // Event handlers
  const handleTabChange = (_, newValue) => {
    setTabValue(newValue);
  };

  const handlePrivacyChange = (field, value) => {
    setPrivacy(prev => ({ ...prev, [field]: value }));
    setPrivacyChanged(true);
  };

  const handleSavePrivacy = () => {
    dispatch(showSnackbar({
      message: 'Privacy settings saved successfully',
      severity: 'success'
    }));
    setPrivacyChanged(false);
  };

  const handleDeleteAccount = () => setDeleteDialogOpen(true);
  const confirmDeleteAccount = () => {
    dispatch(logoutUser());
    dispatch(showSnackbar({
      message: 'Account deleted successfully',
      severity: 'success'
    }));
    navigate('/');
    setDeleteDialogOpen(false);
  };
  const cancelDeleteAccount = () => setDeleteDialogOpen(false);

  const handleCoverPhotoEdit = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.match('image.*')) {
      dispatch(showSnackbar({
        message: 'Only image files are allowed',
        severity: 'error'
      }));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
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
        message: 'Cover image updated successfully',
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
      e.target.value = ''; // Reset file input
    }
  };

  const handleProfilePhotoEdit = (e) => {
    // Redirect to update profile page for profile image change
    navigate('/my-profile-update');
  };

  if (loading || !profile) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress size={60} />
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
          navigate={navigate}
          onCoverPhotoEdit={handleCoverPhotoEdit}
          onProfilePhotoEdit={handleProfilePhotoEdit}
          coverImageLoading={coverImageLoading}
        />
        
        <ProfileInfoSection
          userData={userData}
          isMobile={isMobile}
        />
        
        <Box sx={{ 
          maxWidth: 'lg', 
          mx: 'auto', 
          px: { xs: 2, sm: 3, md: 4 }
        }}>
          <ProfileStats userData={userData} />
          
          <ProfileTabs
            tabValue={tabValue}
            handleTabChange={handleTabChange}
            profileActions={profileActions}
            mediaActions={mediaActions}
            productivityTools={productivityTools}
            professionalSection={professionalSection}
            privacy={privacy}
            privacyChanged={privacyChanged}
            handlePrivacyChange={handlePrivacyChange}
            handleSavePrivacy={handleSavePrivacy}
            handleDeleteAccount={handleDeleteAccount}
            navigate={navigate}
            userData={userData}
          />
        </Box>

        <DeleteAccountDialog
          open={deleteDialogOpen}
          onClose={cancelDeleteAccount}
          onConfirm={confirmDeleteAccount}
        />
      </Box>
    </ThemeProvider>
  );
};

export default PrivateProfilePage;





//!final
// import {
//   ArrowBack,
//   Cake,
//   CameraAlt,
//   Delete,
//   Email,
//   Event,
//   Groups,
//   Link as LinkIcon,
//   LocationOn,
//   Lock,
//   MusicNote,
//   Notes,
//   People,
//   Person,
//   PhotoLibrary,
//   PostAdd,
//   School,
//   VerifiedUser,
//   VideoLibrary,
//   Visibility,
//   Work
// } from '@mui/icons-material';
// import {
//   Avatar,
//   Badge,
//   Box,
//   Button,
//   Card,
//   CircularProgress,
//   Dialog,
//   DialogActions,
//   DialogContent,
//   DialogContentText,
//   DialogTitle,
//   Divider,
//   FormControl,
//   Grid,
//   IconButton,
//   InputLabel,
//   Link,
//   MenuItem,
//   Paper,
//   Select,
//   Tab,
//   Tabs,
//   Typography,
//   useMediaQuery
// } from '@mui/material';
// import { ThemeProvider } from '@mui/material/styles';
// import { useEffect, useMemo, useState } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { useNavigate } from 'react-router-dom';
// import { showSnackbar } from '../../features/snackbar/snackbarSlice';
// import { fetchUserProfile, logoutUser } from '../../features/user/userSlice';
// import theme from '../../theme';

// // Constants
// const DEFAULT_PROFILE_IMAGE = '/default-avatar.png';
// const DEFAULT_COVER_IMAGE = '/default-cover.jpg';

// // Utility functions
// const formatDate = (date) => {
//   try {
//     return new Date(date).toLocaleDateString('en-US', {
//       year: 'numeric',
//       month: 'long',
//       day: 'numeric'
//     });
//   } catch {
//     return 'Unknown date';
//   }
// };

// const formatWebsite = (url) => {
//   if (!url) return '';
//   return url.replace(/(^\w+:|^)\/\//, '');
// };

// // Sub-components
// const StatBox = ({ icon, count, label }) => (
//   <Paper elevation={0} sx={{ 
//     p: 2, 
//     textAlign: 'center',
//     borderRadius: 2,
//     bgcolor: 'background.paper',
//     transition: 'all 0.3s ease',
//     '&:hover': {
//       transform: 'translateY(-4px)',
//       boxShadow: 3,
//     }
//   }}>
//     <Box sx={{ color: 'primary.main', fontSize: 32, mb: 1 }}>{icon}</Box>
//     <Typography variant="h5" fontWeight="bold">{count}</Typography>
//     <Typography variant="body2" color="text.secondary">{label}</Typography>
//   </Paper>
// );

// const ActionCard = ({ icon, title, path, color, navigate }) => (
//   <Paper elevation={2} sx={{ 
//     p: 2, 
//     borderRadius: 2,
//     height: '100%',
//     display: 'flex',
//     flexDirection: 'column',
//     transition: 'all 0.3s ease',
//     '&:hover': {
//       transform: 'translateY(-4px)',
//       boxShadow: 4,
//     }
//   }}>
//     <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
//       <Avatar sx={{ 
//         bgcolor: `${color}.main`, 
//         mr: 2,
//         width: 40,
//         height: 40,
//         color: 'common.white'
//       }}>
//         {icon}
//       </Avatar>
//       <Typography variant="subtitle1" fontWeight="500">{title}</Typography>
//     </Box>
//     <Button
//       variant="outlined"
//       color={color}
//       fullWidth
//       onClick={() => navigate(path)}
//       size="small"
//       sx={{ mt: 'auto' }}
//     >
//       Open
//     </Button>
//   </Paper>
// );

// const DeleteAccountDialog = ({ open, onClose, onConfirm }) => (
//   <Dialog
//     open={open}
//     onClose={onClose}
//     aria-labelledby="alert-dialog-title"
//     aria-describedby="alert-dialog-description"
//   >
//     <DialogTitle id="alert-dialog-title">Confirm Account Deletion</DialogTitle>
//     <DialogContent>
//       <DialogContentText id="alert-dialog-description">
//         Are you sure you want to delete your account? This action cannot be undone. 
//         All your data will be permanently removed from our servers.
//       </DialogContentText>
//     </DialogContent>
//     <DialogActions>
//       <Button onClick={onClose} color="primary">Cancel</Button>
//       <Button onClick={onConfirm} color="error" autoFocus startIcon={<Delete />}>
//         Delete Account
//       </Button>
//     </DialogActions>
//   </Dialog>
// );

// const ProfileHeader = ({ 
//   userData, 
//   isMobile, 
//   navigate,
//   onCoverPhotoEdit,
//   onProfilePhotoEdit
// }) => {
//   return (
//     <Box sx={{ 
//       position: 'relative', 
//       width: '100%', 
//       height: isMobile ? '45vh' : '55vh',
//       maxHeight: 500,
//       bgcolor: 'grey.200',
//       overflow: 'hidden',
//       mt:8 // coverImage
//     }}>
//       {/* Cover Photo */}
//       <Box
//         component="img"
//         src={userData.coverImage}
//         alt={`${userData.fullName}'s cover`}
//         sx={{
//           width: '100%',
//           height: '100%',
//           objectFit: 'cover',
//           objectPosition: 'center'
//         }}
//       />
      
//       {/* Dark overlay gradient */}
//       <Box sx={{
//         position: 'absolute',
//         inset: 0,
//         background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.5) 50%, transparent 100%)'
//       }} />
      
//       {/* Back button */}
//       <IconButton
//         onClick={() => navigate(-1)}
//         sx={{
//           position: 'absolute',
//           top: 16,
//           left: 16,
//           bgcolor: 'background.paper',
//           '&:hover': {
//             bgcolor: 'primary.main',
//             color: 'common.white'
//           }
//         }}
//       >
//         <ArrowBack />
//       </IconButton>
      
//       {/* Cover photo edit button */}
//       <IconButton
//         onClick={onCoverPhotoEdit}
//         sx={{
//           position: 'absolute',
//           top: 16,
//           right: 16,
//           bgcolor: 'background.paper',
//           '&:hover': {
//             bgcolor: 'primary.main',
//             color: 'common.white'
//           }
//         }}
//       >
//         <CameraAlt />
//       </IconButton>
      
//       {/* Profile Image */}
//       <Box sx={{
//         position: 'absolute',
//         left: isMobile ? '50%' : 32,
//         bottom: isMobile ? -80 : -100,
//         transform: isMobile ? 'translateX(-50%)' : 'none',
//         zIndex: 2,
//         mb:12
//       }}>
//         <Badge
//           overlap="circular"
//           anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
//           badgeContent={
//             <IconButton
//               component="label"
//               onClick={onProfilePhotoEdit}
//               sx={{
//                 bgcolor: 'primary.main',
//                 color: 'common.white',
//                 '&:hover': {
//                   bgcolor: 'primary.dark'
//                 }
//               }}
//             >
//               <CameraAlt fontSize="small" />
//             </IconButton>
//           }
//         >
//           <Avatar
//             src={userData.profileImage}
//             sx={{
//               width: isMobile ? 120 : 150,
//               height: isMobile ? 120 : 150,
//               border: '4px solid',
//               borderColor: 'background.paper',
//               boxShadow: 3,
//               bgcolor: 'primary.main',
//             }}
//           >
//             {userData.fullName?.charAt(0) || ''}
//           </Avatar>
//         </Badge>
//       </Box>
//     </Box>
//   );
// };

// const ProfileInfoSection = ({ userData, isMobile }) => {
//   return (
//     <Box sx={{ 
//       maxWidth: 'lg', 
//       mx: 'auto', 
//       px: { xs: 2, sm: 3, md: 4 },
//       mt: isMobile ? 12 : 8,
//       textAlign: isMobile ? 'center' : 'left',
//       mb: 4,
//       ml: isMobile ? 0 : 24
//     }}>
//       <Typography variant="h3" component="h1" sx={{ fontWeight: 700 }}>
//         {userData.fullName || 'Anonymous User'}
//         {userData.isVerified && (
//           <VerifiedUser 
//             color="primary" 
//             sx={{ 
//               ml: 1, 
//               verticalAlign: 'middle',
//               fontSize: 'inherit'
//             }} 
//           />
//         )}
//       </Typography>
      
//       {userData.bio && (
//         <Typography variant="subtitle1" color="text.secondary" sx={{ mt: 1 }}>
//           {userData.bio}
//         </Typography>
//       )}
      
//       {userData.location && (
//         <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
//           <LocationOn fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
//           {userData.location}
//         </Typography>
//       )}
      
//       {userData.website && (
//         <Link 
//           href={userData.website.startsWith('http') ? userData.website : `https://${userData.website}`}
//           target="_blank"
//           rel="noopener noreferrer"
//           color="primary"
//           sx={{ 
//             display: 'inline-flex', 
//             alignItems: 'center', 
//             mt: 1,
//             textDecoration: 'none',
//             '&:hover': {
//               textDecoration: 'underline'
//             }
//           }}
//         >
//           <LinkIcon fontSize="small" sx={{ mr: 0.5 }} />
//           {formatWebsite(userData.website)}
//         </Link>
//       )}
//     </Box>
//   );
// };

// const ProfileStats = ({ userData }) => {
//   return (
//     <Grid container spacing={2} sx={{ mb: 4 }}>
//       <Grid item xs={4}>
//         <StatBox 
//           icon={<PostAdd />} 
//           count={userData.postsCount} 
//           label="Posts" 
//         />
//       </Grid>
//       <Grid item xs={4}>
//         <StatBox 
//           icon={<People />} 
//           count={userData.friendsCount} 
//           label="Friends" 
//         />
//       </Grid>
//       <Grid item xs={4}>
//         <StatBox 
//           icon={<Visibility />} 
//           count={userData.viewsCount} 
//           label="Profile Views" 
//         />
//       </Grid>
//     </Grid>
//   );
// };

// const ProfileTabs = ({ 
//   tabValue, 
//   handleTabChange, 
//   profileActions, 
//   mediaActions, 
//   productivityTools, 
//   professionalSection, 
//   privacy, 
//   privacyChanged, 
//   handlePrivacyChange, 
//   handleSavePrivacy, 
//   handleDeleteAccount, 
//   navigate, 
//   userData 
// }) => {
//   return (
//     <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
//       <Tabs 
//         value={tabValue} 
//         onChange={handleTabChange} 
//         variant="scrollable"
//         scrollButtons="auto"
//         sx={{ 
//           borderBottom: 1, 
//           borderColor: 'divider',
//           '& .MuiTab-root': { 
//             minWidth: 120,
//             py: 1.5,
//             textTransform: 'none',
//             fontWeight: 500
//           }
//         }}
//       >
//         <Tab label="Profile" icon={<Person />} iconPosition="start" />
//         <Tab label="Media" icon={<PhotoLibrary />} iconPosition="start" />
//         <Tab label="Tools" icon={<PostAdd />} iconPosition="start" />
//         <Tab label="Professional" icon={<Work />} iconPosition="start" />
//         <Tab label="Privacy" icon={<Lock />} iconPosition="start" />
//       </Tabs>

//       <Box sx={{ p: 3 }}>
//         {/* Profile Tab */}
//         {tabValue === 0 && (
//           <Grid container spacing={3}>
//             {profileActions.map((action, index) => (
//               <Grid item xs={12} sm={6} key={index}>
//                 <ActionCard {...action} navigate={navigate} />
//               </Grid>
//             ))}
            
//             <Grid item xs={12}>
//               <Card sx={{ borderRadius: 2, p: 3 }}>
//                 <Typography variant="h6" gutterBottom>Personal Information</Typography>
//                 <Divider sx={{ mb: 2 }} />
//                 <Grid container spacing={2}>
//                   <Grid item xs={12} md={6}>
//                     <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
//                       <Email color="action" sx={{ mr: 1.5 }} />
//                       <Box>
//                         <Typography variant="caption" color="text.secondary">Email</Typography>
//                         <Typography>{userData.email}</Typography>
//                       </Box>
//                     </Box>
//                   </Grid>
//                   <Grid item xs={12} md={6}>
//                     <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
//                       <Cake color="action" sx={{ mr: 1.5 }} />
//                       <Box>
//                         <Typography variant="caption" color="text.secondary">Member Since</Typography>
//                         <Typography>{formatDate(userData.createdAt)}</Typography>
//                       </Box>
//                     </Box>
//                   </Grid>
//                   <Grid item xs={12} md={6}>
//                     <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
//                       <Person color="action" sx={{ mr: 1.5 }} />
//                       <Box>
//                         <Typography variant="caption" color="text.secondary">Last Updated</Typography>
//                         <Typography>{formatDate(userData.updatedAt)}</Typography>
//                       </Box>
//                     </Box>
//                   </Grid>
//                 </Grid>
//               </Card>
//             </Grid>
//           </Grid>
//         )}

//         {/* Media Tab */}
//         {tabValue === 1 && (
//           <Grid container spacing={2}>
//             {mediaActions.map((action, index) => (
//               <Grid item xs={12} sm={6} md={4} key={index}>
//                 <ActionCard {...action} navigate={navigate} />
//               </Grid>
//             ))}
//           </Grid>
//         )}

//         {/* Tools Tab */}
//         {tabValue === 2 && (
//           <Grid container spacing={2}>
//             {productivityTools.map((action, index) => (
//               <Grid item xs={12} sm={6} md={4} key={index}>
//                 <ActionCard {...action} navigate={navigate} />
//               </Grid>
//             ))}
//           </Grid>
//         )}

//         {/* Professional Tab */}
//         {tabValue === 3 && (
//           <Grid container spacing={2}>
//             {professionalSection.map((action, index) => (
//               <Grid item xs={12} sm={6} key={index}>
//                 <ActionCard {...action} navigate={navigate} />
//               </Grid>
//             ))}
//           </Grid>
//         )}

//         {/* Privacy Tab */}
//         {tabValue === 4 && (
//           <Box>
//             <Typography variant="h6" gutterBottom>Privacy Settings</Typography>
//             <Divider sx={{ mb: 3 }} />
            
//             <Grid container spacing={2}>
//               <Grid item xs={12} md={6}>
//                 <FormControl fullWidth sx={{ mb: 2 }}>
//                   <InputLabel>Profile Visibility</InputLabel>
//                   <Select
//                     value={privacy.profileVisibility}
//                     onChange={(e) => handlePrivacyChange('profileVisibility', e.target.value)}
//                     label="Profile Visibility"
//                   >
//                     <MenuItem value="public">Public</MenuItem>
//                     <MenuItem value="friends">Friends Only</MenuItem>
//                     <MenuItem value="private">Private</MenuItem>
//                   </Select>
//                 </FormControl>
//               </Grid>
              
//               <Grid item xs={12} md={6}>
//                 <FormControl fullWidth sx={{ mb: 2 }}>
//                   <InputLabel>Email Visibility</InputLabel>
//                   <Select
//                     value={privacy.emailVisibility}
//                     onChange={(e) => handlePrivacyChange('emailVisibility', e.target.value)}
//                     label="Email Visibility"
//                   >
//                     <MenuItem value="public">Public</MenuItem>
//                     <MenuItem value="friends">Friends Only</MenuItem>
//                     <MenuItem value="private">Private</MenuItem>
//                   </Select>
//                 </FormControl>
//               </Grid>
              
//               <Grid item xs={12} md={6}>
//                 <FormControl fullWidth sx={{ mb: 2 }}>
//                   <InputLabel>Phone Visibility</InputLabel>
//                   <Select
//                     value={privacy.phoneVisibility}
//                     onChange={(e) => handlePrivacyChange('phoneVisibility', e.target.value)}
//                     label="Phone Visibility"
//                   >
//                     <MenuItem value="friends">Friends Only</MenuItem>
//                     <MenuItem value="private">Private</MenuItem>
//                   </Select>
//                 </FormControl>
//               </Grid>
//             </Grid>
            
//             <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
//               <Button
//                 variant="contained"
//                 color="primary"
//                 onClick={handleSavePrivacy}
//                 disabled={!privacyChanged}
//               >
//                 Save Changes
//               </Button>
              
//               <Button
//                 variant="outlined"
//                 color="error"
//                 onClick={handleDeleteAccount}
//                 startIcon={<Delete />}
//               >
//                 Delete Account
//               </Button>
//             </Box>
//           </Box>
//         )}
//       </Box>
//     </Card>
//   );
// };

// const PrivateProfilePage = () => {
//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
//   const { profile, loading } = useSelector((state) => state.user);
  
//   // State management
//   const [tabValue, setTabValue] = useState(0);
//   const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
//   const [privacy, setPrivacy] = useState({
//     profileVisibility: 'public',
//     emailVisibility: 'friends',
//     phoneVisibility: 'private'
//   });
//   const [privacyChanged, setPrivacyChanged] = useState(false);

//   // Fetch profile data
//   useEffect(() => {
//     dispatch(fetchUserProfile());
//   }, [dispatch]);

//   // Memoized profile data
//   const userData = useMemo(() => {
//     const data = profile?.user || profile || {};
//     return {
//       id: data._id || data.id || 'me',
//       fullName: `${data.firstName || ''} ${data.lastName || ''}`.trim(),
//       email: data.email || 'No email provided',
//       phone: data.phone || 'No phone provided',
//       location: data.location || 'Location not set',
//       website: data.website || null,
//       bio: data.bio || 'Tell your story...',
//       isVerified: data.isVerified || false,
//       profileImage: data.profileImage || DEFAULT_PROFILE_IMAGE,
//       coverImage: data.coverImage || DEFAULT_COVER_IMAGE,
//       createdAt: data.createdAt || new Date(),
//       updatedAt: data.updatedAt || new Date(),
//       postsCount: data.postsCount || 0,
//       friendsCount: data.friendsCount || 0,
//       viewsCount: data.viewsCount || 0
//     };
//   }, [profile]);

//   // Action configurations
//   const profileActions = useMemo(() => [
//     { icon: <Person />, title: 'Update Profile', path: '/my-profile-update', color: 'primary' },
//     { icon: <Lock />, title: 'Update Password', path: '/update-password', color: 'secondary' }
//   ], []);

//   const mediaActions = useMemo(() => [
//     { icon: <PhotoLibrary />, title: 'Photo Library', path: '/photos', color: 'warning' },
//     { icon: <VideoLibrary />, title: 'Video Library', path: '/videos', color: 'error' },
//     { icon: <MusicNote />, title: 'Music Library', path: '/music', color: 'success' }
//   ], []);

//   const productivityTools = useMemo(() => [
//     { icon: <Event />, title: 'Calendar', path: '/calendar', color: 'info' },
//     { icon: <Notes />, title: 'Notes', path: '/notes', color: 'info' },
//     { icon: <PostAdd />, title: 'Posts', path: '/posts', color: 'info' }
//   ], []);

//   const professionalSection = useMemo(() => [
//     { icon: <Work />, title: 'Work Experience', path: '/work', color: 'primary' },
//     { icon: <School />, title: 'Education', path: '/education', color: 'primary' },
//     { icon: <Groups />, title: 'Groups', path: '/groups', color: 'primary' },
//     { icon: <LinkIcon />, title: 'Portfolio Links', path: '/links', color: 'primary' }
//   ], []);

//   // Event handlers
//   const handleTabChange = (_, newValue) => {
//     setTabValue(newValue);
//   };

//   const handlePrivacyChange = (field, value) => {
//     setPrivacy(prev => ({ ...prev, [field]: value }));
//     setPrivacyChanged(true);
//   };

//   const handleSavePrivacy = () => {
//     dispatch(showSnackbar({
//       message: 'Privacy settings saved successfully',
//       severity: 'success'
//     }));
//     setPrivacyChanged(false);
//   };

//   const handleDeleteAccount = () => setDeleteDialogOpen(true);
//   const confirmDeleteAccount = () => {
//     dispatch(logoutUser());
//     dispatch(showSnackbar({
//       message: 'Account deleted successfully',
//       severity: 'success'
//     }));
//     navigate('/');
//     setDeleteDialogOpen(false);
//   };
//   const cancelDeleteAccount = () => setDeleteDialogOpen(false);

//   const handleCoverPhotoEdit = () => {
//     // Implement cover photo edit logic
//     console.log('Edit cover photo clicked');
//   };

//   const handleProfilePhotoEdit = () => {
//     // Implement profile photo edit logic
//     console.log('Edit profile photo clicked');
//   };

//   if (loading || !profile) {
//     return (
//       <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
//         <CircularProgress size={60} />
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
//           navigate={navigate}
//           onCoverPhotoEdit={handleCoverPhotoEdit}
//           onProfilePhotoEdit={handleProfilePhotoEdit}
//         />
        
//         <ProfileInfoSection
//           userData={userData}
//           isMobile={isMobile}
//         />
        
//         <Box sx={{ 
//           maxWidth: 'lg', 
//           mx: 'auto', 
//           px: { xs: 2, sm: 3, md: 4 }
//         }}>
//           <ProfileStats userData={userData} />
          
//           <ProfileTabs
//             tabValue={tabValue}
//             handleTabChange={handleTabChange}
//             profileActions={profileActions}
//             mediaActions={mediaActions}
//             productivityTools={productivityTools}
//             professionalSection={professionalSection}
//             privacy={privacy}
//             privacyChanged={privacyChanged}
//             handlePrivacyChange={handlePrivacyChange}
//             handleSavePrivacy={handleSavePrivacy}
//             handleDeleteAccount={handleDeleteAccount}
//             navigate={navigate}
//             userData={userData}
//           />
//         </Box>

//         <DeleteAccountDialog
//           open={deleteDialogOpen}
//           onClose={cancelDeleteAccount}
//           onConfirm={confirmDeleteAccount}
//         />
//       </Box>
//     </ThemeProvider>
//   );
// };

// export default PrivateProfilePage;







//! running
// import {
//   Add,
//   ArrowBack,
//   Cake,
//   CameraAlt,
//   Comment,
//   Delete,
//   Edit,
//   Email,
//   Event,
//   Groups,
//   Link as LinkIcon,
//   LocationOn,
//   Lock,
//   MoreVert,
//   MusicNote,
//   Notes,
//   People,
//   Person,
//   PhotoLibrary,
//   PostAdd,
//   School,
//   Share,
//   ThumbUp,
//   VerifiedUser,
//   VideoLibrary,
//   Visibility,
//   Work
// } from '@mui/icons-material';
// import {
//   Avatar,
//   Backdrop,
//   Badge,
//   Box,
//   Button,
//   Card,
//   Chip,
//   CircularProgress,
//   Dialog,
//   DialogActions,
//   DialogContent,
//   DialogContentText,
//   DialogTitle,
//   Divider,
//   FormControl,
//   Grid,
//   IconButton,
//   InputLabel,
//   Link,
//   MenuItem,
//   Paper,
//   Select,
//   Tab,
//   Tabs,
//   Typography,
//   useMediaQuery
// } from '@mui/material';
// import { ThemeProvider } from '@mui/material/styles';
// import { useEffect, useState } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { Link as RouterLink, useNavigate } from 'react-router-dom';
// import { showSnackbar } from '../../features/snackbar/snackbarSlice';
// import { fetchUserProfile, logoutUser } from '../../features/user/userSlice';
// import theme from '../../theme';

// const PrivateProfilePage = () => {
//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
//   const { profile, loading } = useSelector((state) => state.user);
//   const [tabValue, setTabValue] = useState(0);
//   const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

//   // Privacy settings state
//   const [privacy, setPrivacy] = useState({
//     profileVisibility: 'public',
//     emailVisibility: 'friends',
//     phoneVisibility: 'private'
//   });
//   const [privacyChanged, setPrivacyChanged] = useState(false);

//   useEffect(() => {
//     dispatch(fetchUserProfile());
//   }, [dispatch]);

//   // Safely access profile data with fallbacks
//   const userData = profile?.user || profile || {};
//   const userId = userData._id || userData.id || 'me';
//   const fullName = `${userData.firstName || ''} ${userData.lastName || ''}`.trim();
//   const email = userData.email || 'No email provided';
//   const phone = userData.phone || 'No phone provided';
//   const location = userData.location || 'Location not set';
//   const website = userData.website || null;
//   const bio = userData.bio || 'Tell your story...';
//   const isVerified = userData.isVerified || false;
//   const profileImage = userData.profileImage || '/default-avatar.png';
//   const coverImage = userData.coverImage || '/default-cover.jpg';
//   const createdAt = userData.createdAt || new Date();
//   const updatedAt = userData.updatedAt || new Date();
//   const postsCount = userData.postsCount || 0;
//   const friendsCount = userData.friendsCount || 0;
//   const viewsCount = userData.viewsCount || 0;

//   const formatDate = (date) => {
//     try {
//       return new Date(date).toLocaleDateString('en-US', {
//         year: 'numeric',
//         month: 'long',
//         day: 'numeric'
//       });
//     } catch (e) {
//       return 'Unknown date';
//     }
//   };

//   const formatWebsite = (url) => {
//     if (!url) return '';
//     return url.replace(/(^\w+:|^)\/\//, '');
//   };

//   const handleTabChange = (event, newValue) => {
//     setTabValue(newValue);
//   };

//   const handlePrivacyChange = (field, value) => {
//     setPrivacy({ ...privacy, [field]: value });
//     setPrivacyChanged(true);
//   };

//   const handleSavePrivacy = () => {
//     dispatch(showSnackbar({
//       message: 'Privacy settings saved successfully',
//       severity: 'success'
//     }));
//     setPrivacyChanged(false);
//   };

//   const handleDeleteAccount = () => {
//     setDeleteDialogOpen(true);
//   };

//   const confirmDeleteAccount = () => {
//     dispatch(logoutUser());
//     dispatch(showSnackbar({
//       message: 'Account deleted successfully',
//       severity: 'success'
//     }));
//     navigate('/');
//     setDeleteDialogOpen(false);
//   };

//   const cancelDeleteAccount = () => {
//     setDeleteDialogOpen(false);
//   };

//   // Profile action cards
//   const profileActions = [
//     { icon: <Person />, title: 'Update Profile', path: '/my-profile-update', color: 'primary' },
//     { icon: <Lock />, title: 'Update Password', path: '/update-password', color: 'secondary' }
//   ];

//   const mediaActions = [
//     { icon: <PhotoLibrary />, title: 'Photo Library', path: '/photos', color: 'warning' },
//     { icon: <VideoLibrary />, title: 'Video Library', path: '/videos', color: 'error' },
//     { icon: <MusicNote />, title: 'Music Library', path: '/music', color: 'success' }
//   ];

//   const productivityTools = [
//     { icon: <Event />, title: 'Calendar', path: '/calendar', color: 'info' },
//     { icon: <Notes />, title: 'Notes', path: '/notes', color: 'info' },
//     { icon: <PostAdd />, title: 'Posts', path: '/posts', color: 'info' }
//   ];

//   const professionalSection = [
//     { icon: <Work />, title: 'Work Experience', path: '/work', color: 'primary' },
//     { icon: <School />, title: 'Education', path: '/education', color: 'primary' },
//     { icon: <Groups />, title: 'Groups', path: '/groups', color: 'primary' },
//     { icon: <LinkIcon />, title: 'Portfolio Links', path: '/links', color: 'primary' }
//   ];

//   if (loading || !profile) {
//     return (
//       <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
//         <CircularProgress size={60} />
//       </Box>
//     );
//   }

//   // StatBox component
//   const StatBox = ({ icon, count, label }) => (
//     <Paper elevation={0} sx={{ 
//       p: 2, 
//       textAlign: 'center',
//       borderRadius: 2,
//       bgcolor: 'background.paper',
//       transition: 'all 0.3s ease',
//       '&:hover': {
//         transform: 'translateY(-4px)',
//         boxShadow: 3,
//       }
//     }}>
//       <Box sx={{ color: 'primary.main', fontSize: 32, mb: 1 }}>{icon}</Box>
//       <Typography variant="h5" fontWeight="bold">{count}</Typography>
//       <Typography variant="body2" color="text.secondary">{label}</Typography>
//     </Paper>
//   );

//   // ActionCard component
//   const ActionCard = ({ icon, title, path, color }) => (
//     <Paper elevation={2} sx={{ 
//       p: 2, 
//       borderRadius: 2,
//       height: '100%',
//       display: 'flex',
//       flexDirection: 'column',
//       transition: 'all 0.3s ease',
//       '&:hover': {
//         transform: 'translateY(-4px)',
//         boxShadow: 4,
//       }
//     }}>
//       <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
//         <Avatar sx={{ 
//           bgcolor: `${color}.main`, 
//           mr: 2,
//           width: 40,
//           height: 40,
//           color: 'common.white'
//         }}>
//           {icon}
//         </Avatar>
//         <Typography variant="subtitle1" fontWeight="500">{title}</Typography>
//       </Box>
//       <Button
//         variant="outlined"
//         color={color}
//         fullWidth
//         onClick={() => navigate(path)}
//         size="small"
//         sx={{ mt: 'auto' }}
//       >
//         Open
//       </Button>
//     </Paper>
//   );

//   return (
//     <ThemeProvider theme={theme}>
//       <Box sx={{ 
//         backgroundColor: 'background.default', 
//         minHeight: '100vh',
//         pb: 6
//       }}>
//         {/* Cover Photo Section */}
//         <Box sx={{ 
//           position: 'relative', 
//           width: '100%', 
//           height: isMobile ? '40vh' : '50vh',
//           maxHeight: 500,
//           bgcolor: 'grey.200',
//           overflow: 'hidden'
//         }}>
//           {/* Cover Image with Gradient Overlay */}
//           <Box
//             component="img"
//             src={coverImage}
//             alt={`${fullName}'s cover`}
//             sx={{
//               width: '100%',
//               height: '100%',
//               objectFit: 'cover',
//               objectPosition: 'center'
//             }}
//           />
          
//           {/* Gradient Overlay */}
//           <Box sx={{
//             position: 'absolute',
//             inset: 0,
//             background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 50%, transparent 100%)'
//           }} />
          
//           {/* Back Button */}
//           <IconButton
//             onClick={() => navigate(-1)}
//             sx={{
//               position: 'absolute',
//               top: 16,
//               left: 16,
//               bgcolor: 'background.paper',
//               '&:hover': {
//                 bgcolor: 'primary.main',
//                 color: 'common.white'
//               }
//             }}
//           >
//             <ArrowBack />
//           </IconButton>
          
//           {/* Cover Image Edit Button */}
//           <IconButton
//             sx={{
//               position: 'absolute',
//               top: 16,
//               right: 16,
//               bgcolor: 'background.paper',
//               '&:hover': {
//                 bgcolor: 'primary.main',
//                 color: 'common.white'
//               }
//             }}
//           >
//             <CameraAlt />
//           </IconButton>
          
//           {/* Profile Picture */}
//           <Box sx={{
//             position: 'absolute',
//             left: isMobile ? '50%' : 32,
//             bottom: isMobile ? -80 : -80,
//             transform: isMobile ? 'translateX(-50%)' : 'none',
//             zIndex: 2
//           }}>
//             <Badge
//               overlap="circular"
//               anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
//               badgeContent={
//                 <IconButton
//                   component="label"
//                   sx={{
//                     bgcolor: 'primary.main',
//                     color: 'common.white',
//                     '&:hover': {
//                       bgcolor: 'primary.dark'
//                     }
//                   }}
//                 >
//                   <CameraAlt fontSize="small" />
//                 </IconButton>
//               }
//             >
//               <Avatar
//                 src={profileImage}
//                 sx={{
//                   width: isMobile ? 120 : 160,
//                   height: isMobile ? 120 : 160,
//                   border: '4px solid',
//                   borderColor: 'background.paper',
//                   boxShadow: 3
//                 }}
//               />
//             </Badge>
//           </Box>
//         </Box>
        
//         {/* Profile Header */}
//         <Box sx={{ 
//           maxWidth: 'lg', 
//           mx: 'auto', 
//           px: { xs: 2, sm: 3, md: 4 },
//           mt: isMobile ? 10 : 6
//         }}>
//           <Box sx={{ 
//             textAlign: isMobile ? 'center' : 'left',
//             mb: 4,
//             ml: isMobile ? 0 : 24
//           }}>
//             <Typography variant="h3" component="h1" sx={{ fontWeight: 700 }}>
//               {fullName || 'Anonymous User'}
//               {isVerified && (
//                 <VerifiedUser 
//                   color="primary" 
//                   sx={{ 
//                     ml: 1, 
//                     verticalAlign: 'middle',
//                     fontSize: 'inherit'
//                   }} 
//                 />
//               )}
//             </Typography>
            
//             {bio && (
//               <Typography variant="subtitle1" color="text.secondary" sx={{ mt: 1 }}>
//                 {bio}
//               </Typography>
//             )}
            
//             {location && (
//               <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
//                 <LocationOn fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
//                 {location}
//               </Typography>
//             )}
            
//             {website && (
//               <Link 
//                 href={website.startsWith('http') ? website : `https://${website}`}
//                 target="_blank"
//                 rel="noopener noreferrer"
//                 color="primary"
//                 sx={{ 
//                   display: 'inline-flex', 
//                   alignItems: 'center', 
//                   mt: 1,
//                   textDecoration: 'none',
//                   '&:hover': {
//                     textDecoration: 'underline'
//                   }
//                 }}
//               >
//                 <LinkIcon fontSize="small" sx={{ mr: 0.5 }} />
//                 {formatWebsite(website)}
//               </Link>
//             )}
//           </Box>
          
//           {/* Stats Section */}
//           <Grid container spacing={2} sx={{ mb: 4 }}>
//             <Grid item xs={4}>
//               <StatBox 
//                 icon={<PostAdd />} 
//                 count={postsCount} 
//                 label="Posts" 
//               />
//             </Grid>
//             <Grid item xs={4}>
//               <StatBox 
//                 icon={<People />} 
//                 count={friendsCount} 
//                 label="Friends" 
//               />
//             </Grid>
//             <Grid item xs={4}>
//               <StatBox 
//                 icon={<Visibility />} 
//                 count={viewsCount} 
//                 label="Profile Views" 
//               />
//             </Grid>
//           </Grid>
          
//           {/* Main Content */}
//           <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
//             <Tabs 
//               value={tabValue} 
//               onChange={handleTabChange} 
//               variant="scrollable"
//               scrollButtons="auto"
//               sx={{ 
//                 borderBottom: 1, 
//                 borderColor: 'divider',
//                 '& .MuiTab-root': { 
//                   minWidth: 120,
//                   py: 1.5,
//                   textTransform: 'none',
//                   fontWeight: 500
//                 }
//               }}
//             >
//               <Tab label="Profile" icon={<Person />} iconPosition="start" />
//               <Tab label="Media" icon={<PhotoLibrary />} iconPosition="start" />
//               <Tab label="Tools" icon={<PostAdd />} iconPosition="start" />
//               <Tab label="Professional" icon={<Work />} iconPosition="start" />
//               <Tab label="Privacy" icon={<Lock />} iconPosition="start" />
//             </Tabs>

//             <Box sx={{ p: 3 }}>
//               {/* Profile Tab */}
//               {tabValue === 0 && (
//                 <Grid container spacing={3}>
//                   {profileActions.map((action, index) => (
//                     <Grid item xs={12} sm={6} key={index}>
//                       <ActionCard {...action} />
//                     </Grid>
//                   ))}
                  
//                   <Grid item xs={12}>
//                     <Card sx={{ borderRadius: 2, p: 3 }}>
//                       <Typography variant="h6" gutterBottom>Personal Information</Typography>
//                       <Divider sx={{ mb: 2 }} />
//                       <Grid container spacing={2}>
//                         <Grid item xs={12} md={6}>
//                           <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
//                             <Email color="action" sx={{ mr: 1.5 }} />
//                             <Box>
//                               <Typography variant="caption" color="text.secondary">Email</Typography>
//                               <Typography>{email}</Typography>
//                             </Box>
//                           </Box>
//                         </Grid>
//                         <Grid item xs={12} md={6}>
//                           <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
//                             <Cake color="action" sx={{ mr: 1.5 }} />
//                             <Box>
//                               <Typography variant="caption" color="text.secondary">Member Since</Typography>
//                               <Typography>{formatDate(createdAt)}</Typography>
//                             </Box>
//                           </Box>
//                         </Grid>
//                         <Grid item xs={12} md={6}>
//                           <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
//                             <Person color="action" sx={{ mr: 1.5 }} />
//                             <Box>
//                               <Typography variant="caption" color="text.secondary">Last Updated</Typography>
//                               <Typography>{formatDate(updatedAt)}</Typography>
//                             </Box>
//                           </Box>
//                         </Grid>
//                       </Grid>
//                     </Card>
//                   </Grid>
//                 </Grid>
//               )}

//               {/* Media Tab */}
//               {tabValue === 1 && (
//                 <Grid container spacing={2}>
//                   {mediaActions.map((action, index) => (
//                     <Grid item xs={12} sm={6} md={4} key={index}>
//                       <ActionCard {...action} />
//                     </Grid>
//                   ))}
//                 </Grid>
//               )}

//               {/* Tools Tab */}
//               {tabValue === 2 && (
//                 <Grid container spacing={2}>
//                   {productivityTools.map((action, index) => (
//                     <Grid item xs={12} sm={6} md={4} key={index}>
//                       <ActionCard {...action} />
//                     </Grid>
//                   ))}
//                 </Grid>
//               )}

//               {/* Professional Tab */}
//               {tabValue === 3 && (
//                 <Grid container spacing={2}>
//                   {professionalSection.map((action, index) => (
//                     <Grid item xs={12} sm={6} key={index}>
//                       <ActionCard {...action} />
//                     </Grid>
//                   ))}
//                 </Grid>
//               )}

//               {/* Privacy Tab */}
//               {tabValue === 4 && (
//                 <Box>
//                   <Typography variant="h6" gutterBottom>Privacy Settings</Typography>
//                   <Divider sx={{ mb: 3 }} />
                  
//                   <Grid container spacing={2}>
//                     <Grid item xs={12} md={6}>
//                       <FormControl fullWidth sx={{ mb: 2 }}>
//                         <InputLabel>Profile Visibility</InputLabel>
//                         <Select
//                           value={privacy.profileVisibility}
//                           onChange={(e) => handlePrivacyChange('profileVisibility', e.target.value)}
//                           label="Profile Visibility"
//                         >
//                           <MenuItem value="public">Public</MenuItem>
//                           <MenuItem value="friends">Friends Only</MenuItem>
//                           <MenuItem value="private">Private</MenuItem>
//                         </Select>
//                       </FormControl>
//                     </Grid>
                    
//                     <Grid item xs={12} md={6}>
//                       <FormControl fullWidth sx={{ mb: 2 }}>
//                         <InputLabel>Email Visibility</InputLabel>
//                         <Select
//                           value={privacy.emailVisibility}
//                           onChange={(e) => handlePrivacyChange('emailVisibility', e.target.value)}
//                           label="Email Visibility"
//                         >
//                           <MenuItem value="public">Public</MenuItem>
//                           <MenuItem value="friends">Friends Only</MenuItem>
//                           <MenuItem value="private">Private</MenuItem>
//                         </Select>
//                       </FormControl>
//                     </Grid>
                    
//                     <Grid item xs={12} md={6}>
//                       <FormControl fullWidth sx={{ mb: 2 }}>
//                         <InputLabel>Phone Visibility</InputLabel>
//                         <Select
//                           value={privacy.phoneVisibility}
//                           onChange={(e) => handlePrivacyChange('phoneVisibility', e.target.value)}
//                           label="Phone Visibility"
//                         >
//                           <MenuItem value="friends">Friends Only</MenuItem>
//                           <MenuItem value="private">Private</MenuItem>
//                         </Select>
//                       </FormControl>
//                     </Grid>
//                   </Grid>
                  
//                   <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
//                     <Button
//                       variant="contained"
//                       color="primary"
//                       onClick={handleSavePrivacy}
//                       disabled={!privacyChanged}
//                     >
//                       Save Changes
//                     </Button>
                    
//                     <Button
//                       variant="outlined"
//                       color="error"
//                       onClick={handleDeleteAccount}
//                       startIcon={<Delete />}
//                     >
//                       Delete Account
//                     </Button>
//                   </Box>
//                 </Box>
//               )}
//             </Box>
//           </Card>
//         </Box>

//         {/* Delete Account Confirmation Dialog */}
//         <Dialog
//           open={deleteDialogOpen}
//           onClose={cancelDeleteAccount}
//           aria-labelledby="alert-dialog-title"
//           aria-describedby="alert-dialog-description"
//         >
//           <DialogTitle id="alert-dialog-title">
//             {"Confirm Account Deletion"}
//           </DialogTitle>
//           <DialogContent>
//             <DialogContentText id="alert-dialog-description">
//               Are you sure you want to delete your account? This action cannot be undone. 
//               All your data will be permanently removed from our servers.
//             </DialogContentText>
//           </DialogContent>
//           <DialogActions>
//             <Button onClick={cancelDeleteAccount} color="primary">
//               Cancel
//             </Button>
//             <Button onClick={confirmDeleteAccount} color="error" autoFocus startIcon={<Delete />}>
//               Delete Account
//             </Button>
//           </DialogActions>
//         </Dialog>
//       </Box>
//     </ThemeProvider>
//   );
// };

// export default PrivateProfilePage;


//! running
// import {
//   Alarm as AlarmIcon,
//   ArrowBack as ArrowBackIcon,
//   Calculate as CalculateIcon,
//   CalendarToday as CalendarIcon,
//   CameraAlt as CameraIcon,
//   Delete as DeleteIcon,
//   Edit as EditIcon,
//   Email as EmailIcon,
//   Phone as PhoneIcon,
//   Close as CloseIcon,
//   Groups as GroupsIcon,
//   Link as LinkIcon,
//   LocationOn as LocationIcon,
//   Lock as LockIcon,
//   MusicNote as MusicIcon,
//   Notes as NotesIcon,
//   Person as PersonIcon,
//   PhotoLibrary as PhotoLibraryIcon,
//   Public as GlobeIcon,
//   School as SchoolIcon,
//   VerifiedUser as VerifiedIcon,
//   VideoLibrary as VideoLibraryIcon,
//   Work as WorkIcon,
  
// } from '@mui/icons-material';
// import {
//   Avatar,
//   Badge,
//   Box,
//   Button,
//   Card,
//   Checkbox,
//   Chip,
//   CircularProgress,
//   Dialog,
//   DialogActions,
//   DialogContent,
//   DialogContentText,
//   DialogTitle,
//   Divider,
//   Fade,
//   FormControl,
//   FormControlLabel,
//   Grid,
//   IconButton,
//   InputLabel,
//   Link,
//   MenuItem,
//   Paper,
//   Select,
//   Tab,
//   Tabs,
//   Typography,
//   useMediaQuery
// } from '@mui/material';
// import { ThemeProvider } from '@mui/material/styles';
// import { useEffect, useState, useRef } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { Link as RouterLink, useNavigate } from 'react-router-dom';
// import { showSnackbar } from '../../features/snackbar/snackbarSlice';
// import { fetchUserProfile, logoutUser, updatePrivateProfile } from '../../features/user/userSlice';
// import theme from '../../theme';

// const PrivateProfilePage = () => {
//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
//   const { profile, loading } = useSelector((state) => state.user);
//   const [tabValue, setTabValue] = useState(0);
//   const [privacy, setPrivacy] = useState({
//     profileVisibility: 'public',
//     emailVisibility: 'friends',
//     phoneVisibility: 'private'
//   });
//   const [privacyChanged, setPrivacyChanged] = useState(false);
//   const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
//   const [coverImageDialogOpen, setCoverImageDialogOpen] = useState(false);
//   const [profileImageDialogOpen, setProfileImageDialogOpen] = useState(false);
//   const [selectedImage, setSelectedImage] = useState(null);
//   const [isUploading, setIsUploading] = useState(false);
//   const coverInputRef = useRef(null);
//   const profileInputRef = useRef(null);

//   useEffect(() => {
//     dispatch(fetchUserProfile());
//   }, [dispatch]);

//   // Safely access profile data with fallbacks
//   const userData = profile?.user || profile || {};
//   const userId = userData._id || userData.id || 'me';
//   const fullName = `${userData.firstName || ''} ${userData.lastName || ''}`.trim();
//   const email = userData.email || 'No email provided';
//   const phone = userData.phone || 'No phone provided';
//   const location = userData.location || 'Location not specified';
//   const website = userData.website || null;
//   const createdAt = userData.createdAt || new Date();
//   const updatedAt = userData.updatedAt || new Date();
//   const isVerified = userData.isVerified || false;
//   const profileImage = userData.profileImage || '/default-avatar.png';
//   const coverImage = userData.coverImage || '/default-cover.jpg';
//   const bio = userData.bio || 'No bio provided yet';
//   const postsCount = userData.postsCount || 0;
//   const friendsCount = userData.friendsCount || 0;
//   const viewsCount = userData.viewsCount || 0;

//   const formatDate = (date) => {
//     try {
//       return new Date(date).toLocaleDateString('en-US', {
//         year: 'numeric',
//         month: 'long',
//         day: 'numeric'
//       });
//     } catch (e) {
//       return 'Unknown date';
//     }
//   };

//   const formatWebsite = (url) => {
//     if (!url) return '';
//     return url.replace(/(^\w+:|^)\/\//, '');
//   };

//   const handleTabChange = (event, newValue) => {
//     setTabValue(newValue);
//   };

//   const handlePrivacyChange = (field, value) => {
//     setPrivacy({ ...privacy, [field]: value });
//     setPrivacyChanged(true);
//   };

//   const handleSavePrivacy = () => {
//     dispatch(showSnackbar({
//       message: 'Privacy settings saved successfully',
//       severity: 'success'
//     }));
//     setPrivacyChanged(false);
//   };

//   const handleDeleteAccount = () => {
//     setDeleteDialogOpen(true);
//   };

//   const confirmDeleteAccount = () => {
//     dispatch(logoutUser());
//     dispatch(showSnackbar({
//       message: 'Account deleted successfully',
//       severity: 'success'
//     }));
//     navigate('/');
//     setDeleteDialogOpen(false);
//   };

//   const handleImageUpload = async (type) => {
//     if (!selectedImage) return;
//     setIsUploading(true);
    
//     try {
//       const formData = new FormData();
//       formData.append(type === 'cover' ? 'coverImage' : 'profileImage', selectedImage);
      
//       await dispatch(updatePrivateProfile(formData)).unwrap();
      
//       dispatch(showSnackbar({
//         message: `${type === 'cover' ? 'Cover' : 'Profile'} image updated successfully`,
//         severity: 'success'
//       }));
      
//       if (type === 'cover') {
//         setCoverImageDialogOpen(false);
//       } else {
//         setProfileImageDialogOpen(false);
//       }
//       setSelectedImage(null);
//     } catch (error) {
//       dispatch(showSnackbar({
//         message: `Failed to update ${type} image`,
//         severity: 'error'
//       }));
//     } finally {
//       setIsUploading(false);
//     }
//   };

//   const handleFileChange = (e, type) => {
//     const file = e.target.files[0];
//     if (file) {
//       if (!file.type.match('image.*')) {
//         dispatch(showSnackbar({
//           message: 'Only image files are allowed',
//           severity: 'error'
//         }));
//         return;
//       }

//       if (file.size > (type === 'cover' ? 10 : 5) * 1024 * 1024) {
//         dispatch(showSnackbar({
//           message: `Image must be less than ${type === 'cover' ? '10MB' : '5MB'}`,
//           severity: 'error'
//         }));
//         return;
//       }

//       setSelectedImage(file);
//       if (type === 'cover') {
//         setCoverImageDialogOpen(true);
//       } else {
//         setProfileImageDialogOpen(true);
//       }
//     }
//   };

//   const StatItem = ({ count, label, icon, color = 'primary' }) => (
//     <Box sx={{ 
//       p: 2, 
//       textAlign: 'center',
//       borderRadius: 2,
//       bgcolor: 'background.paper',
//       boxShadow: 1,
//       transition: 'all 0.3s ease',
//       '&:hover': {
//         transform: 'translateY(-4px)',
//         boxShadow: 3,
//         bgcolor: `${color}.light`
//       }
//     }}>
//       <Box sx={{ color: `${color}.main`, mb: 1 }}>{icon}</Box>
//       <Typography variant="h5" fontWeight="bold">{count}</Typography>
//       <Typography variant="caption" color="text.secondary">{label}</Typography>
//     </Box>
//   );

//   const profileActions = [
//     { icon: <PersonIcon />, title: 'Update Profile', path: '/my-profile-update', color: 'primary' },
//     { icon: <LockIcon />, title: 'Update Password', path: '/update-password', color: 'secondary' }
//   ];

//   const mediaActions = [
//     { icon: <PhotoLibraryIcon />, title: 'Photo Library', path: '/photos', color: 'warning' },
//     { icon: <VideoLibraryIcon />, title: 'Video Library', path: '/videos', color: 'error' },
//     { icon: <MusicIcon />, title: 'Music Library', path: '/music', color: 'success' }
//   ];

//   const productivityTools = [
//     { icon: <CalendarIcon />, title: 'Calendar', path: '/calendar', color: 'info' },
//     { icon: <NotesIcon />, title: 'Notes', path: '/notes', color: 'info' },
//     { icon: <AlarmIcon />, title: 'Reminders', path: '/reminders', color: 'info' }
//   ];

//   const professionalSection = [
//     { icon: <WorkIcon />, title: 'Work Experience', path: '/work', color: 'primary' },
//     { icon: <SchoolIcon />, title: 'Education', path: '/education', color: 'primary' },
//     { icon: <GroupsIcon />, title: 'Groups', path: '/groups', color: 'primary' },
//     { icon: <LinkIcon />, title: 'Portfolio Links', path: '/links', color: 'primary' }
//   ];

//   if (loading || !profile) {
//     return (
//       <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
//         <CircularProgress size={60} />
//       </Box>
//     );
//   }

//   return (
//     <ThemeProvider theme={theme}>
//       <Box sx={{ backgroundColor: 'background.default', minHeight: '100vh', pb: 6 }}>
//         {/* Cover Image Section */}
//         <Box sx={{ 
//           position: 'relative', 
//           width: '100%', 
//           height: isMobile ? '40vh' : '50vh',
//           maxHeight: 500,
//           bgcolor: 'grey.200',
//           overflow: 'hidden'
//         }}>
//           <Box
//             component="img"
//             src={coverImage}
//             alt={`${fullName}'s cover`}
//             sx={{
//               width: '100%',
//               height: '100%',
//               objectFit: 'cover',
//               objectPosition: 'center'
//             }}
//           />
          
//           {/* Gradient Overlay */}
//           <Box sx={{
//             position: 'absolute',
//             inset: 0,
//             background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 50%, transparent 100%)'
//           }} />
          
//           {/* Cover Image Edit Button */}
//           <IconButton
//             onClick={() => coverInputRef.current.click()}
//             sx={{
//               position: 'absolute',
//               top: 16,
//               right: 16,
//               bgcolor: 'background.paper',
//               '&:hover': {
//                 bgcolor: 'primary.main',
//                 color: 'common.white'
//               }
//             }}
//           >
//             <CameraIcon />
//           </IconButton>
          
//           {/* Profile Picture */}
//           <Box sx={{
//             position: 'absolute',
//             left: isMobile ? '50%' : 32,
//             bottom: isMobile ? -80 : -80,
//             transform: isMobile ? 'translateX(-50%)' : 'none',
//             zIndex: 2
//           }}>
//             <Badge
//               overlap="circular"
//               anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
//               badgeContent={
//                 <IconButton
//                   component="label"
//                   sx={{
//                     bgcolor: 'primary.main',
//                     color: 'common.white',
//                     '&:hover': {
//                       bgcolor: 'primary.dark'
//                     }
//                   }}
//                 >
//                   <input
//                     type="file"
//                     accept="image/*"
//                     hidden
//                     onChange={(e) => handleFileChange(e, 'profile')}
//                     ref={profileInputRef}
//                   />
//                   <CameraIcon fontSize="small" />
//                 </IconButton>
//               }
//             >
//               <Avatar
//                 src={profileImage}
//                 alt={fullName}
//                 sx={{
//                   width: isMobile ? 120 : 160,
//                   height: isMobile ? 120 : 160,
//                   border: '4px solid',
//                   borderColor: 'background.paper',
//                   boxShadow: 3,
//                   fontSize: isMobile ? 60 : 80,
//                   bgcolor: 'primary.main',
//                   color: 'common.white'
//                 }}
//               >
//                 {!profileImage && fullName 
//                   ? fullName.split(' ').map(n => n[0]).join('').toUpperCase()
//                   : null}
//               </Avatar>
//             </Badge>
//           </Box>
//         </Box>
        
//         {/* Main Content Container */}
//         <Box sx={{ 
//           maxWidth: 'lg', 
//           mx: 'auto', 
//           px: { xs: 2, sm: 3, md: 4 },
//           mt: isMobile ? 10 : 6
//         }}>
//           {/* Profile Header */}
//           <Box sx={{ 
//             textAlign: isMobile ? 'center' : 'left',
//             mb: 4,
//             ml: isMobile ? 0 : 24
//           }}>
//             <Typography variant="h3" component="h1" sx={{ fontWeight: 700 }}>
//               {fullName}
//               {isVerified && (
//                 <VerifiedIcon 
//                   color="primary" 
//                   sx={{ 
//                     ml: 1, 
//                     verticalAlign: 'middle',
//                     fontSize: 'inherit'
//                   }} 
//                 />
//               )}
//             </Typography>
            
//             {location && (
//               <Typography variant="subtitle1" color="text.secondary" sx={{ mt: 1 }}>
//                 <LocationIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
//                 {location}
//               </Typography>
//             )}
            
//             {website && (
//               <Link 
//                 href={website.startsWith('http') ? website : `https://${website}`}
//                 target="_blank"
//                 rel="noopener noreferrer"
//                 color="primary"
//                 sx={{ 
//                   display: 'inline-flex', 
//                   alignItems: 'center', 
//                   mt: 1,
//                   textDecoration: 'none',
//                   '&:hover': {
//                     textDecoration: 'underline'
//                   }
//                 }}
//               >
//                 <GlobeIcon fontSize="small" sx={{ mr: 0.5 }} />
//                 {formatWebsite(website)}
//               </Link>
//             )}
//           </Box>
          
//           {/* Back Button */}
//           <Button
//             variant="outlined"
//             startIcon={<ArrowBackIcon />}
//             onClick={() => navigate(-1)}
//             sx={{
//               position: 'absolute',
//               top: 16,
//               left: 16,
//               zIndex: 10
//             }}
//           >
//             Back
//           </Button>
          
//           {/* Stats Section */}
//           <Grid container spacing={2} sx={{ mb: 4 }}>
//             <Grid item xs={4}>
//               <StatItem 
//                 count={postsCount} 
//                 label="Posts" 
//                 icon={<NotesIcon color="primary" />}
//                 color="primary"
//               />
//             </Grid>
//             <Grid item xs={4}>
//               <StatItem 
//                 count={friendsCount} 
//                 label="Connections" 
//                 icon={<GroupsIcon color="secondary" />}
//                 color="secondary"
//               />
//             </Grid>
//             <Grid item xs={4}>
//               <StatItem 
//                 count={viewsCount} 
//                 label="Profile Views" 
//                 icon={<PersonIcon color="info" />}
//                 color="info"
//               />
//             </Grid>
//           </Grid>
          
//           {/* Main Content Grid */}
//           <Grid container spacing={3}>
//             {/* Left Column - Profile Info */}
//             <Grid item xs={12} md={4}>
//               <Card sx={{ borderRadius: 3, boxShadow: 3, mb: 3 }}>
//                 <Box sx={{ p: 3 }}>
//                   <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
//                     About
//                   </Typography>
//                   <Typography variant="body1" paragraph>
//                     {bio}
//                   </Typography>
                  
//                   <Divider sx={{ my: 2 }} />
                  
//                   <Box sx={{ '& > div': { mb: 2 } }}>
//                     <Box sx={{ display: 'flex', alignItems: 'center' }}>
//                       <EmailIcon color="action" sx={{ mr: 1.5 }} />
//                       <Box>
//                         <Typography variant="caption" color="text.secondary">Email</Typography>
//                         <Typography>{email}</Typography>
//                       </Box>
//                     </Box>
                    
//                     <Box sx={{ display: 'flex', alignItems: 'center' }}>
//                       <PhoneIcon color="action" sx={{ mr: 1.5 }} />
//                       <Box>
//                         <Typography variant="caption" color="text.secondary">Phone</Typography>
//                         <Typography>{phone}</Typography>
//                       </Box>
//                     </Box>
                    
//                     <Box sx={{ display: 'flex', alignItems: 'center' }}>
//                       <CalendarIcon color="action" sx={{ mr: 1.5 }} />
//                       <Box>
//                         <Typography variant="caption" color="text.secondary">Member Since</Typography>
//                         <Typography>{formatDate(createdAt)}</Typography>
//                       </Box>
//                     </Box>
//                   </Box>
//                 </Box>
//               </Card>
//             </Grid>
            
//             {/* Right Column - Content Tabs */}
//             <Grid item xs={12} md={8}>
//               <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
//                 <Tabs 
//                   value={tabValue} 
//                   onChange={handleTabChange} 
//                   variant="scrollable"
//                   scrollButtons="auto"
//                   sx={{ 
//                     borderBottom: 1, 
//                     borderColor: 'divider',
//                     '& .MuiTab-root': { 
//                       minWidth: 120,
//                       py: 1.5,
//                       textTransform: 'none',
//                       fontWeight: 500
//                     }
//                   }}
//                 >
//                   <Tab label="Profile" icon={<PersonIcon />} iconPosition="start" />
//                   <Tab label="Media" icon={<PhotoLibraryIcon />} iconPosition="start" />
//                   <Tab label="Tools" icon={<CalculateIcon />} iconPosition="start" />
//                   <Tab label="Professional" icon={<WorkIcon />} iconPosition="start" />
//                   <Tab label="Privacy" icon={<LockIcon />} iconPosition="start" />
//                 </Tabs>

//                 <Box sx={{ p: 3 }}>
//                   {/* Profile Tab */}
//                   {tabValue === 0 && (
//                     <Grid container spacing={2}>
//                       {profileActions.map((action, index) => (
//                         <Grid item xs={12} sm={6} key={index}>
//                           <Fade in timeout={(index + 1) * 300}>
//                             <Paper elevation={2} sx={{ p: 2, borderRadius: 2 }}>
//                               <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
//                                 <Avatar sx={{ 
//                                   bgcolor: `${action.color}.main`, 
//                                   mr: 2,
//                                   width: 40,
//                                   height: 40,
//                                   color: 'common.white'
//                                 }}>
//                                   {action.icon}
//                                 </Avatar>
//                                 <Typography variant="subtitle1">{action.title}</Typography>
//                               </Box>
//                               <Button
//                                 variant="outlined"
//                                 color={action.color}
//                                 fullWidth
//                                 onClick={() => navigate(action.path)}
//                                 size="small"
//                               >
//                                 Open
//                               </Button>
//                             </Paper>
//                           </Fade>
//                         </Grid>
//                       ))}
//                     </Grid>
//                   )}

//                   {/* Media Tab */}
//                   {tabValue === 1 && (
//                     <Grid container spacing={2}>
//                       {mediaActions.map((action, index) => (
//                         <Grid item xs={12} sm={6} md={4} key={index}>
//                           <Fade in timeout={(index + 1) * 300}>
//                             <Paper elevation={2} sx={{ p: 2, borderRadius: 2 }}>
//                               <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
//                                 <Avatar sx={{ 
//                                   bgcolor: `${action.color}.main`, 
//                                   mr: 2,
//                                   width: 40,
//                                   height: 40,
//                                   color: 'common.white'
//                                 }}>
//                                   {action.icon}
//                                 </Avatar>
//                                 <Typography variant="subtitle1">{action.title}</Typography>
//                               </Box>
//                               <Button
//                                 variant="outlined"
//                                 color={action.color}
//                                 fullWidth
//                                 onClick={() => navigate(action.path)}
//                                 size="small"
//                               >
//                                 View
//                               </Button>
//                             </Paper>
//                           </Fade>
//                         </Grid>
//                       ))}
//                     </Grid>
//                   )}

//                   {/* Tools Tab */}
//                   {tabValue === 2 && (
//                     <Grid container spacing={2}>
//                       {productivityTools.map((action, index) => (
//                         <Grid item xs={12} sm={6} md={4} key={index}>
//                           <Fade in timeout={(index + 1) * 300}>
//                             <Paper elevation={2} sx={{ p: 2, borderRadius: 2 }}>
//                               <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
//                                 <Avatar sx={{ 
//                                   bgcolor: `${action.color}.main`, 
//                                   mr: 2,
//                                   width: 40,
//                                   height: 40,
//                                   color: 'common.white'
//                                 }}>
//                                   {action.icon}
//                                 </Avatar>
//                                 <Typography variant="subtitle1">{action.title}</Typography>
//                               </Box>
//                               <Button
//                                 variant="outlined"
//                                 color={action.color}
//                                 fullWidth
//                                 onClick={() => navigate(action.path)}
//                                 size="small"
//                               >
//                                 Open Tool
//                               </Button>
//                             </Paper>
//                           </Fade>
//                         </Grid>
//                       ))}
//                     </Grid>
//                   )}

//                   {/* Professional Tab */}
//                   {tabValue === 3 && (
//                     <Grid container spacing={2}>
//                       {professionalSection.map((action, index) => (
//                         <Grid item xs={12} sm={6} key={index}>
//                           <Fade in timeout={(index + 1) * 300}>
//                             <Paper elevation={2} sx={{ p: 2, borderRadius: 2 }}>
//                               <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
//                                 <Avatar sx={{ 
//                                   bgcolor: `${action.color}.main`, 
//                                   mr: 2,
//                                   width: 40,
//                                   height: 40,
//                                   color: 'common.white'
//                                 }}>
//                                   {action.icon}
//                                 </Avatar>
//                                 <Typography variant="subtitle1">{action.title}</Typography>
//                               </Box>
//                               <Button
//                                 variant="outlined"
//                                 color={action.color}
//                                 fullWidth
//                                 onClick={() => navigate(action.path)}
//                                 size="small"
//                               >
//                                 Manage
//                               </Button>
//                             </Paper>
//                           </Fade>
//                         </Grid>
//                       ))}
//                     </Grid>
//                   )}

//                   {/* Privacy Tab */}
//                   {tabValue === 4 && (
//                     <Box>
//                       <Typography variant="h6" gutterBottom>Privacy Settings</Typography>
//                       <Divider sx={{ mb: 3 }} />
                      
//                       <Grid container spacing={2}>
//                         <Grid item xs={12} md={6}>
//                           <FormControl fullWidth sx={{ mb: 2 }}>
//                             <InputLabel>Profile Visibility</InputLabel>
//                             <Select
//                               value={privacy.profileVisibility}
//                               onChange={(e) => handlePrivacyChange('profileVisibility', e.target.value)}
//                               label="Profile Visibility"
//                             >
//                               <MenuItem value="public">Public</MenuItem>
//                               <MenuItem value="friends">Friends Only</MenuItem>
//                               <MenuItem value="private">Private</MenuItem>
//                             </Select>
//                           </FormControl>
//                         </Grid>
                        
//                         <Grid item xs={12} md={6}>
//                           <FormControl fullWidth sx={{ mb: 2 }}>
//                             <InputLabel>Email Visibility</InputLabel>
//                             <Select
//                               value={privacy.emailVisibility}
//                               onChange={(e) => handlePrivacyChange('emailVisibility', e.target.value)}
//                               label="Email Visibility"
//                             >
//                               <MenuItem value="public">Public</MenuItem>
//                               <MenuItem value="friends">Friends Only</MenuItem>
//                               <MenuItem value="private">Private</MenuItem>
//                             </Select>
//                           </FormControl>
//                         </Grid>
                        
//                         <Grid item xs={12} md={6}>
//                           <FormControl fullWidth sx={{ mb: 2 }}>
//                             <InputLabel>Phone Visibility</InputLabel>
//                             <Select
//                               value={privacy.phoneVisibility}
//                               onChange={(e) => handlePrivacyChange('phoneVisibility', e.target.value)}
//                               label="Phone Visibility"
//                             >
//                               <MenuItem value="friends">Friends Only</MenuItem>
//                               <MenuItem value="private">Private</MenuItem>
//                             </Select>
//                           </FormControl>
//                         </Grid>
//                       </Grid>
                      
//                       <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
//                         <Button
//                           variant="contained"
//                           color="primary"
//                           onClick={handleSavePrivacy}
//                           disabled={!privacyChanged}
//                         >
//                           Save Changes
//                         </Button>
                        
//                         <Button
//                           variant="outlined"
//                           color="error"
//                           onClick={handleDeleteAccount}
//                           startIcon={<DeleteIcon />}
//                         >
//                           Delete Account
//                         </Button>
//                       </Box>
//                     </Box>
//                   )}
//                 </Box>
//               </Card>
//             </Grid>
//           </Grid>
//         </Box>

//         {/* Delete Account Confirmation Dialog */}
//         <Dialog
//           open={deleteDialogOpen}
//           onClose={() => setDeleteDialogOpen(false)}
//           aria-labelledby="alert-dialog-title"
//           aria-describedby="alert-dialog-description"
//         >
//           <DialogTitle id="alert-dialog-title">
//             {"Confirm Account Deletion"}
//           </DialogTitle>
//           <DialogContent>
//             <DialogContentText id="alert-dialog-description">
//               Are you sure you want to delete your account? This action cannot be undone. 
//               All your data will be permanently removed from our servers.
//             </DialogContentText>
//           </DialogContent>
//           <DialogActions>
//             <Button onClick={() => setDeleteDialogOpen(false)} color="primary">
//               Cancel
//             </Button>
//             <Button onClick={confirmDeleteAccount} color="error" autoFocus startIcon={<DeleteIcon />}>
//               Delete Account
//             </Button>
//           </DialogActions>
//         </Dialog>

//         {/* Cover Image Upload Dialog */}
//         <Dialog
//           open={coverImageDialogOpen}
//           onClose={() => setCoverImageDialogOpen(false)}
//           maxWidth="md"
//           fullWidth
//         >
//           <DialogTitle>
//             <Box display="flex" justifyContent="space-between" alignItems="center">
//               <Typography variant="h6">Update Cover Photo</Typography>
//               <IconButton onClick={() => setCoverImageDialogOpen(false)} disabled={isUploading}>
//                 <CloseIcon />
//               </IconButton>
//             </Box>
//           </DialogTitle>
//           <DialogContent>
//             <Box sx={{ mt: 2, mb: 4 }}>
//               {selectedImage && (
//                 <Box
//                   component="img"
//                   src={URL.createObjectURL(selectedImage)}
//                   alt="Cover preview"
//                   sx={{
//                     width: '100%',
//                     maxHeight: 300,
//                     objectFit: 'contain',
//                     borderRadius: 2,
//                     mb: 2
//                   }}
//                 />
//               )}
//             </Box>
//           </DialogContent>
//           <DialogActions>
//             <Button onClick={() => setCoverImageDialogOpen(false)} color="secondary">
//               Cancel
//             </Button>
//             <Button
//               onClick={() => handleImageUpload('cover')}
//               color="primary"
//               variant="contained"
//               disabled={!selectedImage || isUploading}
//               startIcon={isUploading ? <CircularProgress size={20} color="inherit" /> : null}
//             >
//               {isUploading ? 'Uploading...' : 'Upload'}
//             </Button>
//           </DialogActions>
//         </Dialog>

//         {/* Profile Image Upload Dialog */}
//         <Dialog
//           open={profileImageDialogOpen}
//           onClose={() => setProfileImageDialogOpen(false)}
//           maxWidth="md"
//           fullWidth
//         >
//           <DialogTitle>
//             <Box display="flex" justifyContent="space-between" alignItems="center">
//               <Typography variant="h6">Update Profile Picture</Typography>
//               <IconButton onClick={() => setProfileImageDialogOpen(false)} disabled={isUploading}>
//                 <CloseIcon />
//               </IconButton>
//             </Box>
//           </DialogTitle>
//           <DialogContent>
//             <Box sx={{ mt: 2, mb: 4 }}>
//               {selectedImage && (
//                 <Box
//                   component="img"
//                   src={URL.createObjectURL(selectedImage)}
//                   alt="Profile preview"
//                   sx={{
//                     width: '100%',
//                     maxHeight: 300,
//                     objectFit: 'contain',
//                     borderRadius: '50%',
//                     mb: 2
//                   }}
//                 />
//               )}
//             </Box>
//           </DialogContent>
//           <DialogActions>
//             <Button onClick={() => setProfileImageDialogOpen(false)} color="secondary">
//               Cancel
//             </Button>
//             <Button
//               onClick={() => handleImageUpload('profile')}
//               color="primary"
//               variant="contained"
//               disabled={!selectedImage || isUploading}
//               startIcon={isUploading ? <CircularProgress size={20} color="inherit" /> : null}
//             >
//               {isUploading ? 'Uploading...' : 'Upload'}
//             </Button>
//           </DialogActions>
//         </Dialog>

//         {/* Hidden file inputs */}
//         <input
//           type="file"
//           ref={coverInputRef}
//           onChange={(e) => handleFileChange(e, 'cover')}
//           accept="image/*"
//           style={{ display: 'none' }}
//         />
//         <input
//           type="file"
//           ref={profileInputRef}
//           onChange={(e) => handleFileChange(e, 'profile')}
//           accept="image/*"
//           style={{ display: 'none' }}
//         />
//       </Box>
//     </ThemeProvider>
//   );
// };

// export default PrivateProfilePage;









//! curent
// import {
//   Alarm as AlarmIcon,
//   ArrowBack as ArrowBackIcon,
//   Calculate as CalculateIcon,
//   CalendarToday as CalendarIcon,
//   Delete as DeleteIcon,
//   Edit as EditIcon,
//   Groups as GroupsIcon,
//   Link as LinkIcon,
//   Lock as LockIcon,
//   MusicNote as MusicIcon,
//   Notes as NotesIcon,
//   Person as PersonIcon,
//   PhotoLibrary as PhotoLibraryIcon,
//   School as SchoolIcon,
//   VideoLibrary as VideoLibraryIcon,
//   Work as WorkIcon
// } from '@mui/icons-material';
// import {
//   Avatar,
//   Badge,
//   Box,
//   Button,
//   Card,
//   Chip,
//   CircularProgress,
//   Dialog,
//   DialogActions,
//   DialogContent,
//   DialogContentText,
//   DialogTitle,
//   Divider,
//   Fade,
//   FormControl,
//   Grid,
//   IconButton,
//   InputLabel,
//   Link,
//   MenuItem,
//   Paper,
//   Select,
//   Tab,
//   Tabs,
//   Typography
// } from '@mui/material';
// import { ThemeProvider } from '@mui/material/styles';
// import { useEffect, useState } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { Link as RouterLink, useNavigate } from 'react-router-dom';
// import { showSnackbar } from '../../features/snackbar/snackbarSlice';
// import { fetchUserProfile, logoutUser } from '../../features/user/userSlice';
// import theme from '../../theme';

// const PrivateProfilePage = () => {
//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const { profile, loading } = useSelector((state) => state.user);
//   const [tabValue, setTabValue] = useState(0);
//   const [privacy, setPrivacy] = useState({
//     profileVisibility: 'public',
//     emailVisibility: 'friends',
//     phoneVisibility: 'private'
//   });
//   const [privacyChanged, setPrivacyChanged] = useState(false);
//   const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

//   useEffect(() => {
//     // Fetch user profile on component mount
//     dispatch(fetchUserProfile());
//   }, [dispatch]);

  
//   const handleTabChange = (event, newValue) => {
//     setTabValue(newValue);
//   };

//   const handlePrivacyChange = (field, value) => {
//     setPrivacy({ ...privacy, [field]: value });
//     setPrivacyChanged(true);
//   };

//   const handleSavePrivacy = () => {
//     dispatch(showSnackbar({
//       message: 'Privacy settings saved successfully',
//       severity: 'success'
//     }));
//     setPrivacyChanged(false);
//   };

//   const handleDeleteAccount = () => {
//     setDeleteDialogOpen(true);
//   };

//   const confirmDeleteAccount = () => {
//     dispatch(logoutUser());
//     dispatch(showSnackbar({
//       message: 'Account deleted successfully',
//       severity: 'success'
//     }));
//     navigate('/');
//     setDeleteDialogOpen(false);
//   };

//   const cancelDeleteAccount = () => {
//     setDeleteDialogOpen(false);
//   };

//   if (loading || !profile) {
//     return (
//       <Box sx={{ 
//         display: 'flex', 
//         justifyContent: 'center', 
//         alignItems: 'center', 
//         height: '100vh' 
//       }}>
//         <CircularProgress size={60} />
//       </Box>
//     );
//   }

//   // Safely access profile data with fallbacks
//   const userData = profile.user || profile;
//   const userId = userData._id || userData.id || 'me';
//   const fullName = `${userData.firstName || ''} ${userData.lastName || ''}`.trim();
//   const email = userData.email || 'No email provided';
//   const phone = userData.phone || 'No phone provided';
//   const createdAt = userData.createdAt || new Date();
//   const updatedAt = userData.updatedAt || new Date();
//   const isVerified = userData.isVerified || false;
//   const profileImage = userData.profileImage || '/default-avatar.png';

//   const formatDate = (date) => {
//     try {
//       return new Date(date).toLocaleDateString('en-US', {
//         year: 'numeric',
//         month: 'long',
//         day: 'numeric'
//       });
//     } catch (e) {
//       return 'Unknown date';
//     }
//   };

//   // Grouped action cards
//   const profileActions = [
//     { icon: <PersonIcon />, title: 'Update Profile', path: '/my-profile-update', color: 'primary' },
//     { icon: <LockIcon />, title: 'Update Password', path: '/update-password', color: 'secondary' }
//   ];

//   const mediaActions = [
//     { icon: <PhotoLibraryIcon />, title: 'Photo Library', path: '/photos', color: 'warning' },
//     { icon: <VideoLibraryIcon />, title: 'Video Library', path: '/videos', color: 'error' },
//     { icon: <MusicIcon />, title: 'Music Library', path: '/music', color: 'success' }
//   ];

//   const productivityTools = [
//     { icon: <CalendarIcon />, title: 'Calendar', path: '/calendar', color: 'info' },
//     { icon: <NotesIcon />, title: 'Notes', path: '/notes', color: 'info' },
//     { icon: <AlarmIcon />, title: 'Reminders', path: '/reminders', color: 'info' }
//   ];

//   const professionalSection = [
//     { icon: <WorkIcon />, title: 'Work Experience', path: '/work', color: 'primary' },
//     { icon: <SchoolIcon />, title: 'Education', path: '/education', color: 'primary' },
//     { icon: <GroupsIcon />, title: 'Groups', path: '/groups', color: 'primary' },
//     { icon: <LinkIcon />, title: 'Portfolio Links', path: '/links', color: 'primary' }
//   ];

//   return (
//     <ThemeProvider theme={theme}>
//       <Box sx={{ padding: 4, backgroundColor: 'background.default', minHeight: '100vh' }}>
//         {/* Header with Back Button */}
//         <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3,mt:8 }}>
//           <Button
//             variant="contained"
//             color="primary"
//             startIcon={<ArrowBackIcon />}
//             onClick={() => navigate(-1)}
//             sx={{
//               borderRadius: '8px',
//               '&:hover': { backgroundColor: 'secondary.main' }
//             }}
//           >
//             Back
//           </Button>
//           <Typography variant="h4" color="text.primary">
//             My Profile
//           </Typography>
//           <Box sx={{ width: 150 }} /> {/* Spacer for alignment */}
//         </Box>

//         {/* Main Content Grid */}
//         <Grid container spacing={3}>
//           {/* Left Column - Profile Card */}
//           <Grid item xs={12} md={4}>
//             <Fade in timeout={800}>
//               <Link
//                 component={RouterLink}
//                            to={`/profile/public/${userId}`}
//                 underline="none"
//                 color="inherit"
//               >
//                 <Card 
//                   sx={{ 
//                     borderRadius: 3, 
//                     boxShadow: 3,
//                     transition: 'transform 0.3s, box-shadow 0.3s',
//                     '&:hover': {
//                       transform: 'translateY(-4px)',
//                       boxShadow: 6
//                     }
//                   }}
//                 >
//                   <Box sx={{ p: 3, textAlign: 'center' }}>
//                     <Badge
//                       overlap="circular"
//                       anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
//                       badgeContent={
//                         <IconButton 
//                           component={RouterLink}
//                           to="/my-profile-update"
//                           sx={{ 
//                             bgcolor: 'secondary.main',
//                             '&:hover': { bgcolor: 'secondary.dark' }
//                           }}
//                         >
//                           <EditIcon fontSize="small" sx={{ color: 'white' }} />
//                         </IconButton>
//                       }
//                     >
//                       <Avatar
//                         src={profileImage}
//                         alt={fullName}
//                         sx={{
//                           width: 150,
//                           height: 150,
//                           border: '4px solid',
//                           borderColor: 'secondary.main',
//                           mb: 2,
//                           cursor: 'pointer',
//                           transition: 'transform 0.3s',
//                           '&:hover': {
//                             transform: 'scale(1.05)'
//                           }
//                         }}
//                       />
//                     </Badge>
//                     <Typography 
//                       variant="h5" 
//                       gutterBottom
//                       sx={{
//                         cursor: 'pointer',
//                         '&:hover': {
//                           textDecoration: 'underline',
//                           color: 'primary.main'
//                         }
//                       }}
//                     >
//                       {fullName || 'Anonymous User'}
//                     </Typography>
//                     <Chip 
//                       label={isVerified ? "Verified" : "Not Verified"} 
//                       color={isVerified ? "success" : "default"} 
//                       size="small" 
//                       sx={{ mb: 2 }}
//                     />
                    
//                     <Divider sx={{ my: 2 }} />
                    
//                     <Box sx={{ textAlign: 'left' }}>
//                       <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
//                         <strong>Email:</strong> {email}
//                       </Typography>
//                       <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
//                         <strong>Phone:</strong> {phone}
//                       </Typography>
//                       <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
//                         <strong>Member since:</strong> {formatDate(createdAt)}
//                       </Typography>
//                       <Typography variant="body2" color="text.secondary">
//                         <strong>Last updated:</strong> {formatDate(updatedAt)}
//                       </Typography>
//                     </Box>
//                   </Box>
//                 </Card>
//               </Link>
//             </Fade>
//           </Grid>

//           {/* Right Column - Content Tabs */}
//           <Grid item xs={12} md={8}>
//             <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
//               <Tabs 
//                 value={tabValue} 
//                 onChange={handleTabChange} 
//                 variant="scrollable"
//                 scrollButtons="auto"
//                 sx={{ 
//                   borderBottom: 1, 
//                   borderColor: 'divider',
//                   '& .MuiTab-root': { minWidth: 120 }
//                 }}
//               >
//                 <Tab label="Profile" icon={<PersonIcon />} iconPosition="start" />
//                 <Tab label="Media" icon={<PhotoLibraryIcon />} iconPosition="start" />
//                 <Tab label="Tools" icon={<CalculateIcon />} iconPosition="start" />
//                 <Tab label="Professional" icon={<WorkIcon />} iconPosition="start" />
//                 <Tab label="Privacy" icon={<LockIcon />} iconPosition="start" />
//               </Tabs>

//               <Box sx={{ p: 3 }}>
//                 {/* Profile Tab */}
//                 {tabValue === 0 && (
//                   <Grid container spacing={2}>
//                     {profileActions.map((action, index) => (
//                       <Grid item xs={12} sm={6} key={index}>
//                         <Fade in timeout={(index + 1) * 300}>
//                           <Paper elevation={2} sx={{ p: 2, borderRadius: 2 }}>
//                             <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
//                               <Avatar sx={{ 
//                                 bgcolor: `${action.color}.main`, 
//                                 mr: 2,
//                                 width: 40,
//                                 height: 40
//                               }}>
//                                 {action.icon}
//                               </Avatar>
//                               <Typography variant="subtitle1">{action.title}</Typography>
//                             </Box>
//                             <Button
//                               variant="outlined"
//                               color={action.color}
//                               fullWidth
//                               onClick={() => navigate(action.path)}
//                               size="small"
//                             >
//                               Open
//                             </Button>
//                           </Paper>
//                         </Fade>
//                       </Grid>
//                     ))}
//                   </Grid>
//                 )}

//                 {/* Media Tab */}
//                 {tabValue === 1 && (
//                   <Grid container spacing={2}>
//                     {mediaActions.map((action, index) => (
//                       <Grid item xs={12} sm={6} md={4} key={index}>
//                         <Fade in timeout={(index + 1) * 300}>
//                           <Paper elevation={2} sx={{ p: 2, borderRadius: 2 }}>
//                             <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
//                               <Avatar sx={{ 
//                                 bgcolor: `${action.color}.main`, 
//                                 mr: 2,
//                                 width: 40,
//                                 height: 40
//                               }}>
//                                 {action.icon}
//                               </Avatar>
//                               <Typography variant="subtitle1">{action.title}</Typography>
//                             </Box>
//                             <Button
//                               variant="outlined"
//                               color={action.color}
//                               fullWidth
//                               onClick={() => navigate(action.path)}
//                               size="small"
//                             >
//                               View
//                             </Button>
//                           </Paper>
//                         </Fade>
//                       </Grid>
//                     ))}
//                   </Grid>
//                 )}

//                 {/* Tools Tab */}
//                 {tabValue === 2 && (
//                   <Grid container spacing={2}>
//                     {productivityTools.map((action, index) => (
//                       <Grid item xs={12} sm={6} md={4} key={index}>
//                         <Fade in timeout={(index + 1) * 300}>
//                           <Paper elevation={2} sx={{ p: 2, borderRadius: 2 }}>
//                             <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
//                               <Avatar sx={{ 
//                                 bgcolor: `${action.color}.main`, 
//                                 mr: 2,
//                                 width: 40,
//                                 height: 40
//                               }}>
//                                 {action.icon}
//                               </Avatar>
//                               <Typography variant="subtitle1">{action.title}</Typography>
//                             </Box>
//                             <Button
//                               variant="outlined"
//                               color={action.color}
//                               fullWidth
//                               onClick={() => navigate(action.path)}
//                               size="small"
//                             >
//                               Open Tool
//                             </Button>
//                           </Paper>
//                         </Fade>
//                       </Grid>
//                     ))}
//                   </Grid>
//                 )}

//                 {/* Professional Tab */}
//                 {tabValue === 3 && (
//                   <Grid container spacing={2}>
//                     {professionalSection.map((action, index) => (
//                       <Grid item xs={12} sm={6} key={index}>
//                         <Fade in timeout={(index + 1) * 300}>
//                           <Paper elevation={2} sx={{ p: 2, borderRadius: 2 }}>
//                             <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
//                               <Avatar sx={{ 
//                                 bgcolor: `${action.color}.main`, 
//                                 mr: 2,
//                                 width: 40,
//                                 height: 40
//                               }}>
//                                 {action.icon}
//                               </Avatar>
//                               <Typography variant="subtitle1">{action.title}</Typography>
//                             </Box>
//                             <Button
//                               variant="outlined"
//                               color={action.color}
//                               fullWidth
//                               onClick={() => navigate(action.path)}
//                               size="small"
//                             >
//                               Manage
//                             </Button>
//                           </Paper>
//                         </Fade>
//                       </Grid>
//                     ))}
//                   </Grid>
//                 )}

//                 {/* Privacy Tab */}
//                 {tabValue === 4 && (
//                   <Box>
//                     <Typography variant="h6" gutterBottom>Privacy Settings</Typography>
//                     <Divider sx={{ mb: 3 }} />
                    
//                     <Grid container spacing={2}>
//                       <Grid item xs={12} md={6}>
//                         <FormControl fullWidth sx={{ mb: 2 }}>
//                           <InputLabel>Profile Visibility</InputLabel>
//                           <Select
//                             value={privacy.profileVisibility}
//                             onChange={(e) => handlePrivacyChange('profileVisibility', e.target.value)}
//                             label="Profile Visibility"
//                           >
//                             <MenuItem value="public">Public</MenuItem>
//                             <MenuItem value="friends">Friends Only</MenuItem>
//                             <MenuItem value="private">Private</MenuItem>
//                           </Select>
//                         </FormControl>
//                       </Grid>
                      
//                       <Grid item xs={12} md={6}>
//                         <FormControl fullWidth sx={{ mb: 2 }}>
//                           <InputLabel>Email Visibility</InputLabel>
//                           <Select
//                             value={privacy.emailVisibility}
//                             onChange={(e) => handlePrivacyChange('emailVisibility', e.target.value)}
//                             label="Email Visibility"
//                           >
//                             <MenuItem value="public">Public</MenuItem>
//                             <MenuItem value="friends">Friends Only</MenuItem>
//                             <MenuItem value="private">Private</MenuItem>
//                           </Select>
//                         </FormControl>
//                       </Grid>
                      
//                       <Grid item xs={12} md={6}>
//                         <FormControl fullWidth sx={{ mb: 2 }}>
//                           <InputLabel>Phone Visibility</InputLabel>
//                           <Select
//                             value={privacy.phoneVisibility}
//                             onChange={(e) => handlePrivacyChange('phoneVisibility', e.target.value)}
//                             label="Phone Visibility"
//                           >
//                             <MenuItem value="friends">Friends Only</MenuItem>
//                             <MenuItem value="private">Private</MenuItem>
//                           </Select>
//                         </FormControl>
//                       </Grid>
//                     </Grid>
                    
//                     <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
//                       <Button
//                         variant="contained"
//                         color="primary"
//                         onClick={handleSavePrivacy}
//                         disabled={!privacyChanged}
//                       >
//                         Save Changes
//                       </Button>
                      
//                       <Button
//                         variant="outlined"
//                         color="error"
//                         onClick={handleDeleteAccount}
//                         startIcon={<DeleteIcon />}
//                       >
//                         Delete Account
//                       </Button>
//                     </Box>
//                   </Box>
//                 )}
//               </Box>
//             </Card>
//           </Grid>
//         </Grid>

//         {/* Delete Account Confirmation Dialog */}
//         <Dialog
//           open={deleteDialogOpen}
//           onClose={cancelDeleteAccount}
//           aria-labelledby="alert-dialog-title"
//           aria-describedby="alert-dialog-description"
//         >
//           <DialogTitle id="alert-dialog-title">
//             {"Confirm Account Deletion"}
//           </DialogTitle>
//           <DialogContent>
//             <DialogContentText id="alert-dialog-description">
//               Are you sure you want to delete your account? This action cannot be undone. 
//               All your data will be permanently removed from our servers.
//             </DialogContentText>
//           </DialogContent>
//           <DialogActions>
//             <Button onClick={cancelDeleteAccount} color="primary">
//               Cancel
//             </Button>
//             <Button onClick={confirmDeleteAccount} color="error" autoFocus startIcon={<DeleteIcon />}>
//               Delete Account
//             </Button>
//           </DialogActions>
//         </Dialog>
//       </Box>
//     </ThemeProvider>
//   );
// };

// export default PrivateProfilePage;

//! new
// import {
//   Alarm as AlarmIcon,
//   ArrowBack as ArrowBackIcon,
//   Calculate as CalculateIcon,
//   CalendarToday as CalendarIcon,
//   Delete as DeleteIcon,
//   Edit as EditIcon,
//   Groups as GroupsIcon,
//   Link as LinkIcon,
//   Lock as LockIcon,
//   MusicNote as MusicIcon,
//   Notes as NotesIcon,
//   Person as PersonIcon,
//   PhotoLibrary as PhotoLibraryIcon,
//   School as SchoolIcon,
//   VideoLibrary as VideoLibraryIcon,
//   Work as WorkIcon,
//   AddPhotoAlternate as AddPhotoIcon,
//   Close as CloseIcon,
//   CameraAlt as CameraIcon,
//   LocationOn as LocationIcon,
//   Public as GlobeIcon,
//   Email as EmailIcon,
//   Phone as PhoneIcon,
//   VerifiedUser as VerifiedIcon,
//   Crop as CropIcon,
//   Check as CheckIcon
// } from '@mui/icons-material';
// import {
//   Avatar,
//   Badge,
//   Box,
//   Button,
//   Card,
//   Chip,
//   CircularProgress,
//   Dialog,
//   DialogActions,
//   DialogContent,
//   DialogContentText,
//   DialogTitle,
//   Divider,
//   Fade,
//   FormControl,
//   Grid,
//   IconButton,
//   InputLabel,
//   Link,
//   MenuItem,
//   Paper,
//   Select,
//   Slider,
//   Tab,
//   Tabs,
//   Typography,
//   useMediaQuery,
//   useTheme
// } from '@mui/material';
// import { ThemeProvider } from '@mui/material/styles';
// import { useEffect, useState, useRef } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { Link as RouterLink, useNavigate } from 'react-router-dom';
// // import AvatarEditor from 'react-avatar-editor';
// import { showSnackbar } from '../../features/snackbar/snackbarSlice';
// import { fetchUserProfile, logoutUser, updatePrivateProfile } from '../../features/user/userSlice';
// import theme from '../../theme';

// const PrivateProfilePage = () => {
//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const muiTheme = useTheme();
//   const isMobile = useMediaQuery(muiTheme.breakpoints.down('sm'));
//   const { profile, loading } = useSelector((state) => state.user);
//   const [tabValue, setTabValue] = useState(0);
//   const [privacy, setPrivacy] = useState({
//     profileVisibility: 'public',
//     emailVisibility: 'friends',
//     phoneVisibility: 'private'
//   });
//   const [privacyChanged, setPrivacyChanged] = useState(false);
//   const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
//   const [coverImageDialogOpen, setCoverImageDialogOpen] = useState(false);
//   const [selectedCoverImage, setSelectedCoverImage] = useState(null);
//   const [coverImagePreview, setCoverImagePreview] = useState(null);
//   const [profileImageDialogOpen, setProfileImageDialogOpen] = useState(false);
//   const [selectedProfileImage, setSelectedProfileImage] = useState(null);
//   const [profileImagePreview, setProfileImagePreview] = useState(null);
//   const [scale, setScale] = useState(1);
//   const [isUploading, setIsUploading] = useState(false);
//   const editorRef = useRef(null);

//   useEffect(() => {
//     dispatch(fetchUserProfile());
//   }, [dispatch]);

//   // Safely access profile data with fallbacks
//   const userData = profile?.user || profile || {};
//   const userId = userData._id || userData.id || 'me';
//   const fullName = `${userData.firstName || ''} ${userData.lastName || ''}`.trim();
//   const email = userData.email || 'No email provided';
//   const phone = userData.phone || 'No phone provided';
//   const location = userData.location || 'Location not specified';
//   const website = userData.website || null;
//   const createdAt = userData.createdAt || new Date();
//   const updatedAt = userData.updatedAt || new Date();
//   const isVerified = userData.isVerified || false;
//   const profileImage = userData.profileImage || '/default-avatar.png';
//   const coverImage = userData.coverImage || '/default-cover.jpg';
//   const bio = userData.bio || 'No bio provided yet';
//   const postsCount = userData.postsCount || 0;
//   const friendsCount = userData.friendsCount || 0;
//   const viewsCount = userData.viewsCount || 0;

//   const formatDate = (date) => {
//     try {
//       return new Date(date).toLocaleDateString('en-US', {
//         year: 'numeric',
//         month: 'long',
//         day: 'numeric'
//       });
//     } catch (e) {
//       return 'Unknown date';
//     }
//   };

//   const formatWebsite = (url) => {
//     if (!url) return '';
//     return url.replace(/(^\w+:|^)\/\//, '');
//   };

//   const handleTabChange = (event, newValue) => {
//     setTabValue(newValue);
//   };

//   const handlePrivacyChange = (field, value) => {
//     setPrivacy({ ...privacy, [field]: value });
//     setPrivacyChanged(true);
//   };

//   const handleSavePrivacy = () => {
//     dispatch(showSnackbar({
//       message: 'Privacy settings saved successfully',
//       severity: 'success'
//     }));
//     setPrivacyChanged(false);
//   };

//   const handleDeleteAccount = () => {
//     setDeleteDialogOpen(true);
//   };

//   const confirmDeleteAccount = () => {
//     dispatch(logoutUser());
//     dispatch(showSnackbar({
//       message: 'Account deleted successfully',
//       severity: 'success'
//     }));
//     navigate('/');
//     setDeleteDialogOpen(false);
//   };

//   const cancelDeleteAccount = () => {
//     setDeleteDialogOpen(false);
//   };

//   const handleCoverImageClick = () => {
//     setCoverImageDialogOpen(true);
//   };

//   const handleCoverImageChange = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       setSelectedCoverImage(file);
//       const reader = new FileReader();
//       reader.onloadend = () => {
//         setCoverImagePreview(reader.result);
//       };
//       reader.readAsDataURL(file);
//     }
//   };

//   const handleCoverImageUpload = async () => {
//     if (!selectedCoverImage) return;

//     setIsUploading(true);
//     try {
//       const formData = new FormData();
//       formData.append('coverImage', selectedCoverImage);

//       await dispatch(updatePrivateProfile(formData)).unwrap();
      
//       dispatch(showSnackbar({
//         message: 'Cover image updated successfully',
//         severity: 'success'
//       }));
//       setCoverImageDialogOpen(false);
//       setSelectedCoverImage(null);
//       setCoverImagePreview(null);
//     } catch (error) {
//       dispatch(showSnackbar({
//         message: 'Failed to update cover image',
//         severity: 'error'
//       }));
//     } finally {
//       setIsUploading(false);
//     }
//   };

//   const cancelCoverImageUpload = () => {
//     setCoverImageDialogOpen(false);
//     setSelectedCoverImage(null);
//     setCoverImagePreview(null);
//   };

//   const handleProfileImageChange = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       setSelectedProfileImage(file);
//       const reader = new FileReader();
//       reader.onloadend = () => {
//         setProfileImagePreview(reader.result);
//       };
//       reader.readAsDataURL(file);
//       setProfileImageDialogOpen(true);
//     }
//   };

//   const handleProfileImageUpload = async () => {
//     if (editorRef.current) {
//       setIsUploading(true);
      
//       try {
//         // Get the canvas from the editor
//         const canvas = editorRef.current.getImageScaledToCanvas();
        
//         // Convert canvas to blob
//         canvas.toBlob(async (blob) => {
//           const formData = new FormData();
//           formData.append('profileImage', blob, 'profile-image.png');

//           await dispatch(updatePrivateProfile(formData)).unwrap();
          
//           dispatch(showSnackbar({
//             message: 'Profile image updated successfully',
//             severity: 'success'
//           }));
//           setProfileImageDialogOpen(false);
//           setSelectedProfileImage(null);
//           setProfileImagePreview(null);
//         }, 'image/png');
//       } catch (error) {
//         dispatch(showSnackbar({
//           message: 'Failed to update profile image',
//           severity: 'error'
//         }));
//       } finally {
//         setIsUploading(false);
//       }
//     }
//   };

//   const ProfileAvatar = () => (
//     <Badge
//       overlap="circular"
//       anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
//       badgeContent={
//         <IconButton
//           component="label"
//           sx={{
//             bgcolor: 'primary.main',
//             color: 'common.white',
//             '&:hover': {
//               bgcolor: 'primary.dark'
//             }
//           }}
//         >
//           <CameraIcon fontSize="small" />
//           <input
//             type="file"
//             accept="image/*"
//             hidden
//             onChange={handleProfileImageChange}
//           />
//         </IconButton>
//       }
//     >
//       <Avatar
//         src={profileImage}
//         alt={fullName}
//         sx={{
//           width: isMobile ? 120 : 160,
//           height: isMobile ? 120 : 160,
//           border: '4px solid',
//           borderColor: 'background.paper',
//           boxShadow: 3,
//           fontSize: isMobile ? 60 : 80,
//           bgcolor: 'primary.main',
//           color: 'common.white'
//         }}
//       >
//         {!profileImage && fullName 
//           ? fullName.split(' ').map(n => n[0]).join('').toUpperCase()
//           : null}
//       </Avatar>
//     </Badge>
//   );

//   const StatItem = ({ count, label, icon, color = 'primary' }) => (
//     <Box sx={{ 
//       p: 2, 
//       textAlign: 'center',
//       borderRadius: 2,
//       bgcolor: 'background.paper',
//       boxShadow: 1,
//       transition: 'all 0.3s ease',
//       '&:hover': {
//         transform: 'translateY(-4px)',
//         boxShadow: 3,
//         bgcolor: `${color}.light`
//       }
//     }}>
//       <Box sx={{ color: `${color}.main`, mb: 1 }}>{icon}</Box>
//       <Typography variant="h5" fontWeight="bold">{count}</Typography>
//       <Typography variant="caption" color="text.secondary">{label}</Typography>
//     </Box>
//   );

//   // Grouped action cards
//   const profileActions = [
//     { icon: <PersonIcon />, title: 'Update Profile', path: '/my-profile-update', color: 'primary' },
//     { icon: <LockIcon />, title: 'Update Password', path: '/update-password', color: 'secondary' }
//   ];

//   const mediaActions = [
//     { icon: <PhotoLibraryIcon />, title: 'Photo Library', path: '/photos', color: 'warning' },
//     { icon: <VideoLibraryIcon />, title: 'Video Library', path: '/videos', color: 'error' },
//     { icon: <MusicIcon />, title: 'Music Library', path: '/music', color: 'success' }
//   ];

//   const productivityTools = [
//     { icon: <CalendarIcon />, title: 'Calendar', path: '/calendar', color: 'info' },
//     { icon: <NotesIcon />, title: 'Notes', path: '/notes', color: 'info' },
//     { icon: <AlarmIcon />, title: 'Reminders', path: '/reminders', color: 'info' }
//   ];

//   const professionalSection = [
//     { icon: <WorkIcon />, title: 'Work Experience', path: '/work', color: 'primary' },
//     { icon: <SchoolIcon />, title: 'Education', path: '/education', color: 'primary' },
//     { icon: <GroupsIcon />, title: 'Groups', path: '/groups', color: 'primary' },
//     { icon: <LinkIcon />, title: 'Portfolio Links', path: '/links', color: 'primary' }
//   ];

//   if (loading || !profile) {
//     return (
//       <Box sx={{ 
//         display: 'flex', 
//         justifyContent: 'center', 
//         alignItems: 'center', 
//         height: '100vh' 
//       }}>
//         <CircularProgress size={60} />
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
//         {/* Modern Cover Image Section */}
//         <Box sx={{ 
//           position: 'relative', 
//           width: '100%', 
//           height: isMobile ? '40vh' : '50vh',
//           maxHeight: 500,
//           bgcolor: 'grey.200',
//           overflow: 'hidden'
//         }}>
//           {/* Cover Image with Gradient Overlay */}
//           <Box
//             component="img"
//             src={coverImage}
//             alt={`${fullName}'s cover`}
//             sx={{
//               width: '100%',
//               height: '100%',
//               objectFit: 'cover',
//               objectPosition: 'center'
//             }}
//           />
          
//           {/* Gradient Overlay */}
//           <Box sx={{
//             position: 'absolute',
//             inset: 0,
//             background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 50%, transparent 100%)'
//           }} />
          
//           {/* Cover Image Edit Button */}
//           <IconButton
//             onClick={handleCoverImageClick}
//             sx={{
//               position: 'absolute',
//               top: 16,
//               right: 16,
//               bgcolor: 'background.paper',
//               '&:hover': {
//                 bgcolor: 'primary.main',
//                 color: 'common.white'
//               }
//             }}
//           >
//             <CameraIcon />
//           </IconButton>
          
//           {/* Profile Picture */}
//           <Box sx={{
//             position: 'absolute',
//             left: isMobile ? '50%' : 32,
//             bottom: isMobile ? -80 : -80,
//             transform: isMobile ? 'translateX(-50%)' : 'none',
//             zIndex: 2
//           }}>
//             <ProfileAvatar />
//           </Box>
//         </Box>
        
//         {/* Main Content Container */}
//         <Box sx={{ 
//           maxWidth: 'lg', 
//           mx: 'auto', 
//           px: { xs: 2, sm: 3, md: 4 },
//           mt: isMobile ? 10 : 6
//         }}>
//           {/* Profile Header */}
//           <Box sx={{ 
//             textAlign: isMobile ? 'center' : 'left',
//             mb: 4,
//             ml: isMobile ? 0 : 24
//           }}>
//             <Typography variant="h3" component="h1" sx={{ fontWeight: 700 }}>
//               {fullName || 'Anonymous User'}
//               {isVerified && (
//                 <VerifiedIcon 
//                   color="primary" 
//                   sx={{ 
//                     ml: 1, 
//                     verticalAlign: 'middle',
//                     fontSize: 'inherit'
//                   }} 
//                 />
//               )}
//             </Typography>
            
//             {location && (
//               <Typography variant="subtitle1" color="text.secondary" sx={{ mt: 1 }}>
//                 <LocationIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
//                 {location}
//               </Typography>
//             )}
            
//             {website && (
//               <Link 
//                 href={website.startsWith('http') ? website : `https://${website}`}
//                 target="_blank"
//                 rel="noopener noreferrer"
//                 color="primary"
//                 sx={{ 
//                   display: 'inline-flex', 
//                   alignItems: 'center', 
//                   mt: 1,
//                   textDecoration: 'none',
//                   '&:hover': {
//                     textDecoration: 'underline'
//                   }
//                 }}
//               >
//                 <GlobeIcon fontSize="small" sx={{ mr: 0.5 }} />
//                 {formatWebsite(website)}
//               </Link>
//             )}
//           </Box>
          
//           {/* Back Button */}
//           <Button
//             variant="outlined"
//             startIcon={<ArrowBackIcon />}
//             onClick={() => navigate(-1)}
//             sx={{
//               position: 'absolute',
//               top: 16,
//               left: 16,
//               zIndex: 10
//             }}
//           >
//             Back
//           </Button>
          
//           {/* Stats Section */}
//           <Grid container spacing={2} sx={{ mb: 4 }}>
//             <Grid item xs={4}>
//               <StatItem 
//                 count={postsCount} 
//                 label="Posts" 
//                 icon={<NotesIcon color="primary" />}
//                 color="primary"
//               />
//             </Grid>
//             <Grid item xs={4}>
//               <StatItem 
//                 count={friendsCount} 
//                 label="Connections" 
//                 icon={<GroupsIcon color="secondary" />}
//                 color="secondary"
//               />
//             </Grid>
//             <Grid item xs={4}>
//               <StatItem 
//                 count={viewsCount} 
//                 label="Profile Views" 
//                 icon={<PersonIcon color="info" />}
//                 color="info"
//               />
//             </Grid>
//           </Grid>
          
//           {/* Main Content Grid */}
//           <Grid container spacing={3}>
//             {/* Left Column - Profile Info */}
//             <Grid item xs={12} md={4}>
//               <Card sx={{ borderRadius: 3, boxShadow: 3, mb: 3 }}>
//                 <Box sx={{ p: 3 }}>
//                   <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
//                     About
//                   </Typography>
//                   <Typography variant="body1" paragraph>
//                     {bio}
//                   </Typography>
                  
//                   <Divider sx={{ my: 2 }} />
                  
//                   <Box sx={{ '& > div': { mb: 2 } }}>
//                     <Box sx={{ display: 'flex', alignItems: 'center' }}>
//                       <EmailIcon color="action" sx={{ mr: 1.5 }} />
//                       <Box>
//                         <Typography variant="caption" color="text.secondary">Email</Typography>
//                         <Typography>{email}</Typography>
//                       </Box>
//                     </Box>
                    
//                     <Box sx={{ display: 'flex', alignItems: 'center' }}>
//                       <PhoneIcon color="action" sx={{ mr: 1.5 }} />
//                       <Box>
//                         <Typography variant="caption" color="text.secondary">Phone</Typography>
//                         <Typography>{phone}</Typography>
//                       </Box>
//                     </Box>
                    
//                     <Box sx={{ display: 'flex', alignItems: 'center' }}>
//                       <CalendarIcon color="action" sx={{ mr: 1.5 }} />
//                       <Box>
//                         <Typography variant="caption" color="text.secondary">Member Since</Typography>
//                         <Typography>{formatDate(createdAt)}</Typography>
//                       </Box>
//                     </Box>
//                   </Box>
//                 </Box>
//               </Card>
//             </Grid>
            
//             {/* Right Column - Content Tabs */}
//             <Grid item xs={12} md={8}>
//               <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
//                 <Tabs 
//                   value={tabValue} 
//                   onChange={handleTabChange} 
//                   variant="scrollable"
//                   scrollButtons="auto"
//                   sx={{ 
//                     borderBottom: 1, 
//                     borderColor: 'divider',
//                     '& .MuiTab-root': { 
//                       minWidth: 120,
//                       py: 1.5,
//                       textTransform: 'none',
//                       fontWeight: 500
//                     }
//                   }}
//                 >
//                   <Tab label="Profile" icon={<PersonIcon />} iconPosition="start" />
//                   <Tab label="Media" icon={<PhotoLibraryIcon />} iconPosition="start" />
//                   <Tab label="Tools" icon={<CalculateIcon />} iconPosition="start" />
//                   <Tab label="Professional" icon={<WorkIcon />} iconPosition="start" />
//                   <Tab label="Privacy" icon={<LockIcon />} iconPosition="start" />
//                 </Tabs>

//                 <Box sx={{ p: 3 }}>
//                   {/* Profile Tab */}
//                   {tabValue === 0 && (
//                     <Grid container spacing={2}>
//                       {profileActions.map((action, index) => (
//                         <Grid item xs={12} sm={6} key={index}>
//                           <Fade in timeout={(index + 1) * 300}>
//                             <Paper elevation={2} sx={{ p: 2, borderRadius: 2 }}>
//                               <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
//                                 <Avatar sx={{ 
//                                   bgcolor: `${action.color}.main`, 
//                                   mr: 2,
//                                   width: 40,
//                                   height: 40,
//                                   color: 'common.white'
//                                 }}>
//                                   {action.icon}
//                                 </Avatar>
//                                 <Typography variant="subtitle1">{action.title}</Typography>
//                               </Box>
//                               <Button
//                                 variant="outlined"
//                                 color={action.color}
//                                 fullWidth
//                                 onClick={() => navigate(action.path)}
//                                 size="small"
//                               >
//                                 Open
//                               </Button>
//                             </Paper>
//                           </Fade>
//                         </Grid>
//                       ))}
//                     </Grid>
//                   )}

//                   {/* Media Tab */}
//                   {tabValue === 1 && (
//                     <Grid container spacing={2}>
//                       {mediaActions.map((action, index) => (
//                         <Grid item xs={12} sm={6} md={4} key={index}>
//                           <Fade in timeout={(index + 1) * 300}>
//                             <Paper elevation={2} sx={{ p: 2, borderRadius: 2 }}>
//                               <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
//                                 <Avatar sx={{ 
//                                   bgcolor: `${action.color}.main`, 
//                                   mr: 2,
//                                   width: 40,
//                                   height: 40,
//                                   color: 'common.white'
//                                 }}>
//                                   {action.icon}
//                                 </Avatar>
//                                 <Typography variant="subtitle1">{action.title}</Typography>
//                               </Box>
//                               <Button
//                                 variant="outlined"
//                                 color={action.color}
//                                 fullWidth
//                                 onClick={() => navigate(action.path)}
//                                 size="small"
//                               >
//                                 View
//                               </Button>
//                             </Paper>
//                           </Fade>
//                         </Grid>
//                       ))}
//                     </Grid>
//                   )}

//                   {/* Tools Tab */}
//                   {tabValue === 2 && (
//                     <Grid container spacing={2}>
//                       {productivityTools.map((action, index) => (
//                         <Grid item xs={12} sm={6} md={4} key={index}>
//                           <Fade in timeout={(index + 1) * 300}>
//                             <Paper elevation={2} sx={{ p: 2, borderRadius: 2 }}>
//                               <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
//                                 <Avatar sx={{ 
//                                   bgcolor: `${action.color}.main`, 
//                                   mr: 2,
//                                   width: 40,
//                                   height: 40,
//                                   color: 'common.white'
//                                 }}>
//                                   {action.icon}
//                                 </Avatar>
//                                 <Typography variant="subtitle1">{action.title}</Typography>
//                               </Box>
//                               <Button
//                                 variant="outlined"
//                                 color={action.color}
//                                 fullWidth
//                                 onClick={() => navigate(action.path)}
//                                 size="small"
//                               >
//                                 Open Tool
//                               </Button>
//                             </Paper>
//                           </Fade>
//                         </Grid>
//                       ))}
//                     </Grid>
//                   )}

//                   {/* Professional Tab */}
//                   {tabValue === 3 && (
//                     <Grid container spacing={2}>
//                       {professionalSection.map((action, index) => (
//                         <Grid item xs={12} sm={6} key={index}>
//                           <Fade in timeout={(index + 1) * 300}>
//                             <Paper elevation={2} sx={{ p: 2, borderRadius: 2 }}>
//                               <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
//                                 <Avatar sx={{ 
//                                   bgcolor: `${action.color}.main`, 
//                                   mr: 2,
//                                   width: 40,
//                                   height: 40,
//                                   color: 'common.white'
//                                 }}>
//                                   {action.icon}
//                                 </Avatar>
//                                 <Typography variant="subtitle1">{action.title}</Typography>
//                               </Box>
//                               <Button
//                                 variant="outlined"
//                                 color={action.color}
//                                 fullWidth
//                                 onClick={() => navigate(action.path)}
//                                 size="small"
//                               >
//                                 Manage
//                               </Button>
//                             </Paper>
//                           </Fade>
//                         </Grid>
//                       ))}
//                     </Grid>
//                   )}

//                   {/* Privacy Tab */}
//                   {tabValue === 4 && (
//                     <Box>
//                       <Typography variant="h6" gutterBottom>Privacy Settings</Typography>
//                       <Divider sx={{ mb: 3 }} />
                      
//                       <Grid container spacing={2}>
//                         <Grid item xs={12} md={6}>
//                           <FormControl fullWidth sx={{ mb: 2 }}>
//                             <InputLabel>Profile Visibility</InputLabel>
//                             <Select
//                               value={privacy.profileVisibility}
//                               onChange={(e) => handlePrivacyChange('profileVisibility', e.target.value)}
//                               label="Profile Visibility"
//                             >
//                               <MenuItem value="public">Public</MenuItem>
//                               <MenuItem value="friends">Friends Only</MenuItem>
//                               <MenuItem value="private">Private</MenuItem>
//                             </Select>
//                           </FormControl>
//                         </Grid>
                        
//                         <Grid item xs={12} md={6}>
//                           <FormControl fullWidth sx={{ mb: 2 }}>
//                             <InputLabel>Email Visibility</InputLabel>
//                             <Select
//                               value={privacy.emailVisibility}
//                               onChange={(e) => handlePrivacyChange('emailVisibility', e.target.value)}
//                               label="Email Visibility"
//                             >
//                               <MenuItem value="public">Public</MenuItem>
//                               <MenuItem value="friends">Friends Only</MenuItem>
//                               <MenuItem value="private">Private</MenuItem>
//                             </Select>
//                           </FormControl>
//                         </Grid>
                        
//                         <Grid item xs={12} md={6}>
//                           <FormControl fullWidth sx={{ mb: 2 }}>
//                             <InputLabel>Phone Visibility</InputLabel>
//                             <Select
//                               value={privacy.phoneVisibility}
//                               onChange={(e) => handlePrivacyChange('phoneVisibility', e.target.value)}
//                               label="Phone Visibility"
//                             >
//                               <MenuItem value="friends">Friends Only</MenuItem>
//                               <MenuItem value="private">Private</MenuItem>
//                             </Select>
//                           </FormControl>
//                         </Grid>
//                       </Grid>
                      
//                       <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
//                         <Button
//                           variant="contained"
//                           color="primary"
//                           onClick={handleSavePrivacy}
//                           disabled={!privacyChanged}
//                         >
//                           Save Changes
//                         </Button>
                        
//                         <Button
//                           variant="outlined"
//                           color="error"
//                           onClick={handleDeleteAccount}
//                           startIcon={<DeleteIcon />}
//                         >
//                           Delete Account
//                         </Button>
//                       </Box>
//                     </Box>
//                   )}
//                 </Box>
//               </Card>
//             </Grid>
//           </Grid>
//         </Box>

//         {/* Delete Account Confirmation Dialog */}
//         <Dialog
//           open={deleteDialogOpen}
//           onClose={cancelDeleteAccount}
//           aria-labelledby="alert-dialog-title"
//           aria-describedby="alert-dialog-description"
//         >
//           <DialogTitle id="alert-dialog-title">
//             {"Confirm Account Deletion"}
//           </DialogTitle>
//           <DialogContent>
//             <DialogContentText id="alert-dialog-description">
//               Are you sure you want to delete your account? This action cannot be undone. 
//               All your data will be permanently removed from our servers.
//             </DialogContentText>
//           </DialogContent>
//           <DialogActions>
//             <Button onClick={cancelDeleteAccount} color="primary">
//               Cancel
//             </Button>
//             <Button onClick={confirmDeleteAccount} color="error" autoFocus startIcon={<DeleteIcon />}>
//               Delete Account
//             </Button>
//           </DialogActions>
//         </Dialog>

//         {/* Cover Image Upload Dialog */}
//         <Dialog
//           open={coverImageDialogOpen}
//           onClose={cancelCoverImageUpload}
//           maxWidth="sm"
//           fullWidth
//         >
//           <DialogTitle>
//             <Box display="flex" justifyContent="space-between" alignItems="center">
//               <Typography variant="h6">Update Cover Image</Typography>
//               <IconButton onClick={cancelCoverImageUpload}>
//                 <CloseIcon />
//               </IconButton>
//             </Box>
//           </DialogTitle>
//           <DialogContent>
//             <Box sx={{ mt: 2, mb: 4 }}>
//               {coverImagePreview ? (
//                 <Box
//                   component="img"
//                   src={coverImagePreview}
//                   alt="Cover preview"
//                   sx={{
//                     width: '100%',
//                     maxHeight: 300,
//                     objectFit: 'contain',
//                     borderRadius: 2,
//                     mb: 2
//                   }}
//                 />
//               ) : (
//                 <Box
//                   sx={{
//                     width: '100%',
//                     height: 200,
//                     bgcolor: 'grey.100',
//                     display: 'flex',
//                     flexDirection: 'column',
//                     justifyContent: 'center',
//                     alignItems: 'center',
//                     borderRadius: 2,
//                     mb: 2,
//                     border: '2px dashed',
//                     borderColor: 'grey.400'
//                   }}
//                 >
//                   <AddPhotoIcon fontSize="large" color="action" />
//                   <Typography color="textSecondary" sx={{ mt: 1 }}>
//                     No image selected
//                   </Typography>
//                 </Box>
//               )}
              
//               <input
//                 accept="image/*"
//                 style={{ display: 'none' }}
//                 id="cover-image-upload"
//                 type="file"
//                 onChange={handleCoverImageChange}
//               />
//               <label htmlFor="cover-image-upload">
//                 <Button
//                   variant="contained"
//                   component="span"
//                   fullWidth
//                   startIcon={<AddPhotoIcon />}
//                 >
//                   {selectedCoverImage ? 'Change Image' : 'Select Image'}
//                 </Button>
//               </label>
//             </Box>
//           </DialogContent>
//           <DialogActions>
//             <Button onClick={cancelCoverImageUpload} color="secondary">
//               Cancel
//             </Button>
//             <Button
//               onClick={handleCoverImageUpload}
//               color="primary"
//               variant="contained"
//               disabled={!selectedCoverImage || isUploading}
//               startIcon={isUploading ? <CircularProgress size={20} color="inherit" /> : null}
//             >
//               {isUploading ? 'Uploading...' : 'Upload'}
//             </Button>
//           </DialogActions>
//         </Dialog>

//         {/* Profile Image Editor Dialog */}
//         <Dialog
//           open={profileImageDialogOpen}
//           onClose={() => setProfileImageDialogOpen(false)}
//           maxWidth="sm"
//           fullWidth
//         >
//           <DialogTitle>
//             <Box display="flex" justifyContent="space-between" alignItems="center">
//               <Typography variant="h6">Edit Profile Picture</Typography>
//               <IconButton onClick={() => setProfileImageDialogOpen(false)}>
//                 <CloseIcon />
//               </IconButton>
//             </Box>
//           </DialogTitle>
//           <DialogContent>
//             <Box sx={{ 
//               display: 'flex', 
//               flexDirection: 'column', 
//               alignItems: 'center',
//               mt: 2,
//               mb: 4
//             }}>
//               {profileImagePreview && (
//                 <>
//                   <AvatarEditor
//                     ref={editorRef}
//                     image={profileImagePreview}
//                     width={250}
//                     height={250}
//                     border={50}
//                     borderRadius={125}
//                     color={[255, 255, 255, 0.6]} // RGBA
//                     scale={scale}
//                     rotate={0}
//                   />
//                   <Box sx={{ width: '100%', mt: 2 }}>
//                     <Typography gutterBottom>Zoom</Typography>
//                     <Slider
//                       value={scale}
//                       onChange={(e, newValue) => setScale(newValue)}
//                       min={1}
//                       max={3}
//                       step={0.1}
//                       aria-labelledby="zoom-slider"
//                     />
//                   </Box>
//                 </>
//               )}
//             </Box>
//           </DialogContent>
//           <DialogActions>
//             <Button 
//               onClick={() => setProfileImageDialogOpen(false)} 
//               color="secondary"
//             >
//               Cancel
//             </Button>
//             <Button
//               onClick={handleProfileImageUpload}
//               color="primary"
//               variant="contained"
//               disabled={!selectedProfileImage || isUploading}
//               startIcon={isUploading ? <CircularProgress size={20} color="inherit" /> : <CheckIcon />}
//             >
//               {isUploading ? 'Uploading...' : 'Save Changes'}
//             </Button>
//           </DialogActions>
//         </Dialog>
//       </Box>
//     </ThemeProvider>
//   );
// };

// export default PrivateProfilePage;






//! original
// import {
//   Alarm as AlarmIcon,
//   ArrowBack as ArrowBackIcon,
//   Calculate as CalculateIcon,
//   CalendarToday as CalendarIcon,
//   Delete as DeleteIcon,
//   Edit as EditIcon,
//   Groups as GroupsIcon,
//   Link as LinkIcon,
//   Lock as LockIcon,
//   MusicNote as MusicIcon,
//   Notes as NotesIcon,
//   Person as PersonIcon,
//   PhotoLibrary as PhotoLibraryIcon,
//   School as SchoolIcon,
//   VideoLibrary as VideoLibraryIcon,
//   Work as WorkIcon
// } from '@mui/icons-material';
// import {
//   Avatar,
//   Badge,
//   Box,
//   Button,
//   Card,
//   Chip,
//   CircularProgress,
//   Dialog,
//   DialogActions,
//   DialogContent,
//   DialogContentText,
//   DialogTitle,
//   Divider,
//   Fade,
//   FormControl,
//   Grid,
//   IconButton,
//   InputLabel,
//   Link,
//   MenuItem,
//   Paper,
//   Select,
//   Tab,
//   Tabs,
//   Typography
// } from '@mui/material';
// import { ThemeProvider } from '@mui/material/styles';
// import { useEffect, useState } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { Link as RouterLink, useNavigate } from 'react-router-dom';
// import { showSnackbar } from '../../features/snackbar/snackbarSlice';
// import { fetchUserProfile, logoutUser } from '../../features/user/userSlice';
// import theme from '../../theme';

// const PrivateProfilePage = () => {
//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const { profile, loading } = useSelector((state) => state.user);
//   const [tabValue, setTabValue] = useState(0);
//   const [privacy, setPrivacy] = useState({
//     profileVisibility: 'public',
//     emailVisibility: 'friends',
//     phoneVisibility: 'private'
//   });
//   const [privacyChanged, setPrivacyChanged] = useState(false);
//   const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

//   useEffect(() => {
//     // Fetch user profile on component mount
//     dispatch(fetchUserProfile());
//   }, [dispatch]);

  
//   const handleTabChange = (event, newValue) => {
//     setTabValue(newValue);
//   };

//   const handlePrivacyChange = (field, value) => {
//     setPrivacy({ ...privacy, [field]: value });
//     setPrivacyChanged(true);
//   };

//   const handleSavePrivacy = () => {
//     dispatch(showSnackbar({
//       message: 'Privacy settings saved successfully',
//       severity: 'success'
//     }));
//     setPrivacyChanged(false);
//   };

//   const handleDeleteAccount = () => {
//     setDeleteDialogOpen(true);
//   };

//   const confirmDeleteAccount = () => {
//     dispatch(logoutUser());
//     dispatch(showSnackbar({
//       message: 'Account deleted successfully',
//       severity: 'success'
//     }));
//     navigate('/');
//     setDeleteDialogOpen(false);
//   };

//   const cancelDeleteAccount = () => {
//     setDeleteDialogOpen(false);
//   };

//   if (loading || !profile) {
//     return (
//       <Box sx={{ 
//         display: 'flex', 
//         justifyContent: 'center', 
//         alignItems: 'center', 
//         height: '100vh' 
//       }}>
//         <CircularProgress size={60} />
//       </Box>
//     );
//   }

//   // Safely access profile data with fallbacks
//   const userData = profile.user || profile;
//   const userId = userData._id || userData.id || 'me';
//   const fullName = `${userData.firstName || ''} ${userData.lastName || ''}`.trim();
//   const email = userData.email || 'No email provided';
//   const phone = userData.phone || 'No phone provided';
//   const createdAt = userData.createdAt || new Date();
//   const updatedAt = userData.updatedAt || new Date();
//   const isVerified = userData.isVerified || false;
//   const profileImage = userData.profileImage || '/default-avatar.png';

//   const formatDate = (date) => {
//     try {
//       return new Date(date).toLocaleDateString('en-US', {
//         year: 'numeric',
//         month: 'long',
//         day: 'numeric'
//       });
//     } catch (e) {
//       return 'Unknown date';
//     }
//   };

//   // Grouped action cards
//   const profileActions = [
//     { icon: <PersonIcon />, title: 'Update Profile', path: '/private-profile-update', color: 'primary' },
//     { icon: <LockIcon />, title: 'Update Password', path: '/update-password', color: 'secondary' }
//   ];

//   const mediaActions = [
//     { icon: <PhotoLibraryIcon />, title: 'Photo Library', path: '/photos', color: 'warning' },
//     { icon: <VideoLibraryIcon />, title: 'Video Library', path: '/videos', color: 'error' },
//     { icon: <MusicIcon />, title: 'Music Library', path: '/music', color: 'success' }
//   ];

//   const productivityTools = [
//     { icon: <CalendarIcon />, title: 'Calendar', path: '/calendar', color: 'info' },
//     { icon: <NotesIcon />, title: 'Notes', path: '/notes', color: 'info' },
//     { icon: <AlarmIcon />, title: 'Reminders', path: '/reminders', color: 'info' }
//   ];

//   const professionalSection = [
//     { icon: <WorkIcon />, title: 'Work Experience', path: '/work', color: 'primary' },
//     { icon: <SchoolIcon />, title: 'Education', path: '/education', color: 'primary' },
//     { icon: <GroupsIcon />, title: 'Groups', path: '/groups', color: 'primary' },
//     { icon: <LinkIcon />, title: 'Portfolio Links', path: '/links', color: 'primary' }
//   ];

//   return (
//     <ThemeProvider theme={theme}>
//       <Box sx={{ padding: 4, backgroundColor: 'background.default', minHeight: '100vh' }}>
//         {/* Header with Back Button */}
//         <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3,mt:8 }}>
//           <Button
//             variant="contained"
//             color="primary"
//             startIcon={<ArrowBackIcon />}
//             onClick={() => navigate(-1)}
//             sx={{
//               borderRadius: '8px',
//               '&:hover': { backgroundColor: 'secondary.main' }
//             }}
//           >
//             Back
//           </Button>
//           <Typography variant="h4" color="text.primary">
//             My Profile
//           </Typography>
//           <Box sx={{ width: 150 }} /> {/* Spacer for alignment */}
//         </Box>

//         {/* Main Content Grid */}
//         <Grid container spacing={3}>
//           {/* Left Column - Profile Card */}
//           <Grid item xs={12} md={4}>
//             <Fade in timeout={800}>
//               <Link
//                 component={RouterLink}
//                            to={`/profile/public/${userId}`}
//                 underline="none"
//                 color="inherit"
//               >
//                 <Card 
//                   sx={{ 
//                     borderRadius: 3, 
//                     boxShadow: 3,
//                     transition: 'transform 0.3s, box-shadow 0.3s',
//                     '&:hover': {
//                       transform: 'translateY(-4px)',
//                       boxShadow: 6
//                     }
//                   }}
//                 >
//                   <Box sx={{ p: 3, textAlign: 'center' }}>
//                     <Badge
//                       overlap="circular"
//                       anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
//                       badgeContent={
//                         <IconButton 
//                           component={RouterLink}
//                           to="/private-profile-update"
//                           sx={{ 
//                             bgcolor: 'secondary.main',
//                             '&:hover': { bgcolor: 'secondary.dark' }
//                           }}
//                         >
//                           <EditIcon fontSize="small" sx={{ color: 'white' }} />
//                         </IconButton>
//                       }
//                     >
//                       <Avatar
//                         src={profileImage}
//                         alt={fullName}
//                         sx={{
//                           width: 150,
//                           height: 150,
//                           border: '4px solid',
//                           borderColor: 'secondary.main',
//                           mb: 2,
//                           cursor: 'pointer',
//                           transition: 'transform 0.3s',
//                           '&:hover': {
//                             transform: 'scale(1.05)'
//                           }
//                         }}
//                       />
//                     </Badge>
//                     <Typography 
//                       variant="h5" 
//                       gutterBottom
//                       sx={{
//                         cursor: 'pointer',
//                         '&:hover': {
//                           textDecoration: 'underline',
//                           color: 'primary.main'
//                         }
//                       }}
//                     >
//                       {fullName || 'Anonymous User'}
//                     </Typography>
//                     <Chip 
//                       label={isVerified ? "Verified" : "Not Verified"} 
//                       color={isVerified ? "success" : "default"} 
//                       size="small" 
//                       sx={{ mb: 2 }}
//                     />
                    
//                     <Divider sx={{ my: 2 }} />
                    
//                     <Box sx={{ textAlign: 'left' }}>
//                       <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
//                         <strong>Email:</strong> {email}
//                       </Typography>
//                       <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
//                         <strong>Phone:</strong> {phone}
//                       </Typography>
//                       <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
//                         <strong>Member since:</strong> {formatDate(createdAt)}
//                       </Typography>
//                       <Typography variant="body2" color="text.secondary">
//                         <strong>Last updated:</strong> {formatDate(updatedAt)}
//                       </Typography>
//                     </Box>
//                   </Box>
//                 </Card>
//               </Link>
//             </Fade>
//           </Grid>

//           {/* Right Column - Content Tabs */}
//           <Grid item xs={12} md={8}>
//             <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
//               <Tabs 
//                 value={tabValue} 
//                 onChange={handleTabChange} 
//                 variant="scrollable"
//                 scrollButtons="auto"
//                 sx={{ 
//                   borderBottom: 1, 
//                   borderColor: 'divider',
//                   '& .MuiTab-root': { minWidth: 120 }
//                 }}
//               >
//                 <Tab label="Profile" icon={<PersonIcon />} iconPosition="start" />
//                 <Tab label="Media" icon={<PhotoLibraryIcon />} iconPosition="start" />
//                 <Tab label="Tools" icon={<CalculateIcon />} iconPosition="start" />
//                 <Tab label="Professional" icon={<WorkIcon />} iconPosition="start" />
//                 <Tab label="Privacy" icon={<LockIcon />} iconPosition="start" />
//               </Tabs>

//               <Box sx={{ p: 3 }}>
//                 {/* Profile Tab */}
//                 {tabValue === 0 && (
//                   <Grid container spacing={2}>
//                     {profileActions.map((action, index) => (
//                       <Grid item xs={12} sm={6} key={index}>
//                         <Fade in timeout={(index + 1) * 300}>
//                           <Paper elevation={2} sx={{ p: 2, borderRadius: 2 }}>
//                             <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
//                               <Avatar sx={{ 
//                                 bgcolor: `${action.color}.main`, 
//                                 mr: 2,
//                                 width: 40,
//                                 height: 40
//                               }}>
//                                 {action.icon}
//                               </Avatar>
//                               <Typography variant="subtitle1">{action.title}</Typography>
//                             </Box>
//                             <Button
//                               variant="outlined"
//                               color={action.color}
//                               fullWidth
//                               onClick={() => navigate(action.path)}
//                               size="small"
//                             >
//                               Open
//                             </Button>
//                           </Paper>
//                         </Fade>
//                       </Grid>
//                     ))}
//                   </Grid>
//                 )}

//                 {/* Media Tab */}
//                 {tabValue === 1 && (
//                   <Grid container spacing={2}>
//                     {mediaActions.map((action, index) => (
//                       <Grid item xs={12} sm={6} md={4} key={index}>
//                         <Fade in timeout={(index + 1) * 300}>
//                           <Paper elevation={2} sx={{ p: 2, borderRadius: 2 }}>
//                             <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
//                               <Avatar sx={{ 
//                                 bgcolor: `${action.color}.main`, 
//                                 mr: 2,
//                                 width: 40,
//                                 height: 40
//                               }}>
//                                 {action.icon}
//                               </Avatar>
//                               <Typography variant="subtitle1">{action.title}</Typography>
//                             </Box>
//                             <Button
//                               variant="outlined"
//                               color={action.color}
//                               fullWidth
//                               onClick={() => navigate(action.path)}
//                               size="small"
//                             >
//                               View
//                             </Button>
//                           </Paper>
//                         </Fade>
//                       </Grid>
//                     ))}
//                   </Grid>
//                 )}

//                 {/* Tools Tab */}
//                 {tabValue === 2 && (
//                   <Grid container spacing={2}>
//                     {productivityTools.map((action, index) => (
//                       <Grid item xs={12} sm={6} md={4} key={index}>
//                         <Fade in timeout={(index + 1) * 300}>
//                           <Paper elevation={2} sx={{ p: 2, borderRadius: 2 }}>
//                             <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
//                               <Avatar sx={{ 
//                                 bgcolor: `${action.color}.main`, 
//                                 mr: 2,
//                                 width: 40,
//                                 height: 40
//                               }}>
//                                 {action.icon}
//                               </Avatar>
//                               <Typography variant="subtitle1">{action.title}</Typography>
//                             </Box>
//                             <Button
//                               variant="outlined"
//                               color={action.color}
//                               fullWidth
//                               onClick={() => navigate(action.path)}
//                               size="small"
//                             >
//                               Open Tool
//                             </Button>
//                           </Paper>
//                         </Fade>
//                       </Grid>
//                     ))}
//                   </Grid>
//                 )}

//                 {/* Professional Tab */}
//                 {tabValue === 3 && (
//                   <Grid container spacing={2}>
//                     {professionalSection.map((action, index) => (
//                       <Grid item xs={12} sm={6} key={index}>
//                         <Fade in timeout={(index + 1) * 300}>
//                           <Paper elevation={2} sx={{ p: 2, borderRadius: 2 }}>
//                             <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
//                               <Avatar sx={{ 
//                                 bgcolor: `${action.color}.main`, 
//                                 mr: 2,
//                                 width: 40,
//                                 height: 40
//                               }}>
//                                 {action.icon}
//                               </Avatar>
//                               <Typography variant="subtitle1">{action.title}</Typography>
//                             </Box>
//                             <Button
//                               variant="outlined"
//                               color={action.color}
//                               fullWidth
//                               onClick={() => navigate(action.path)}
//                               size="small"
//                             >
//                               Manage
//                             </Button>
//                           </Paper>
//                         </Fade>
//                       </Grid>
//                     ))}
//                   </Grid>
//                 )}

//                 {/* Privacy Tab */}
//                 {tabValue === 4 && (
//                   <Box>
//                     <Typography variant="h6" gutterBottom>Privacy Settings</Typography>
//                     <Divider sx={{ mb: 3 }} />
                    
//                     <Grid container spacing={2}>
//                       <Grid item xs={12} md={6}>
//                         <FormControl fullWidth sx={{ mb: 2 }}>
//                           <InputLabel>Profile Visibility</InputLabel>
//                           <Select
//                             value={privacy.profileVisibility}
//                             onChange={(e) => handlePrivacyChange('profileVisibility', e.target.value)}
//                             label="Profile Visibility"
//                           >
//                             <MenuItem value="public">Public</MenuItem>
//                             <MenuItem value="friends">Friends Only</MenuItem>
//                             <MenuItem value="private">Private</MenuItem>
//                           </Select>
//                         </FormControl>
//                       </Grid>
                      
//                       <Grid item xs={12} md={6}>
//                         <FormControl fullWidth sx={{ mb: 2 }}>
//                           <InputLabel>Email Visibility</InputLabel>
//                           <Select
//                             value={privacy.emailVisibility}
//                             onChange={(e) => handlePrivacyChange('emailVisibility', e.target.value)}
//                             label="Email Visibility"
//                           >
//                             <MenuItem value="public">Public</MenuItem>
//                             <MenuItem value="friends">Friends Only</MenuItem>
//                             <MenuItem value="private">Private</MenuItem>
//                           </Select>
//                         </FormControl>
//                       </Grid>
                      
//                       <Grid item xs={12} md={6}>
//                         <FormControl fullWidth sx={{ mb: 2 }}>
//                           <InputLabel>Phone Visibility</InputLabel>
//                           <Select
//                             value={privacy.phoneVisibility}
//                             onChange={(e) => handlePrivacyChange('phoneVisibility', e.target.value)}
//                             label="Phone Visibility"
//                           >
//                             <MenuItem value="friends">Friends Only</MenuItem>
//                             <MenuItem value="private">Private</MenuItem>
//                           </Select>
//                         </FormControl>
//                       </Grid>
//                     </Grid>
                    
//                     <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
//                       <Button
//                         variant="contained"
//                         color="primary"
//                         onClick={handleSavePrivacy}
//                         disabled={!privacyChanged}
//                       >
//                         Save Changes
//                       </Button>
                      
//                       <Button
//                         variant="outlined"
//                         color="error"
//                         onClick={handleDeleteAccount}
//                         startIcon={<DeleteIcon />}
//                       >
//                         Delete Account
//                       </Button>
//                     </Box>
//                   </Box>
//                 )}
//               </Box>
//             </Card>
//           </Grid>
//         </Grid>

//         {/* Delete Account Confirmation Dialog */}
//         <Dialog
//           open={deleteDialogOpen}
//           onClose={cancelDeleteAccount}
//           aria-labelledby="alert-dialog-title"
//           aria-describedby="alert-dialog-description"
//         >
//           <DialogTitle id="alert-dialog-title">
//             {"Confirm Account Deletion"}
//           </DialogTitle>
//           <DialogContent>
//             <DialogContentText id="alert-dialog-description">
//               Are you sure you want to delete your account? This action cannot be undone. 
//               All your data will be permanently removed from our servers.
//             </DialogContentText>
//           </DialogContent>
//           <DialogActions>
//             <Button onClick={cancelDeleteAccount} color="primary">
//               Cancel
//             </Button>
//             <Button onClick={confirmDeleteAccount} color="error" autoFocus startIcon={<DeleteIcon />}>
//               Delete Account
//             </Button>
//           </DialogActions>
//         </Dialog>
//       </Box>
//     </ThemeProvider>
//   );
// };

// export default PrivateProfilePage;


//! refactor
// import {
//   Alarm as AlarmIcon,
//   CalendarToday as CalendarIcon,
//   Delete as DeleteIcon,
//   Groups as GroupsIcon,
//   Link as LinkIcon,
//   MusicNote as MusicIcon,
//   Note as NotesIcon,
//   School as SchoolIcon,
//   VideoLibrary as VideoLibraryIcon,
//   Work as WorkIcon
// } from '@mui/icons-material';
// import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';
// import {
//   Avatar,
//   Box,
//   Button,
//   Card,
//   CircularProgress,
//   Dialog,
//   DialogActions,
//   DialogContent,
//   DialogContentText,
//   DialogTitle,
//   Divider,
//   Fade,
//   FormControl,
//   Grid,
//   InputLabel,
//   MenuItem,
//   Paper,
//   Select,
//   Typography,
//   useMediaQuery
// } from '@mui/material';
// import { ThemeProvider } from '@mui/material/styles';
// import { useEffect, useState } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { useNavigate } from 'react-router-dom';
// import { showSnackbar } from '../../features/snackbar/snackbarSlice';
// import { fetchUserProfile, logoutUser } from '../../features/user/userSlice';
// import theme from '../../theme';
// import PrivateProfileHeader from './PrivateProfileHeader';

// const PrivateProfilePage = () => {
//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
//   const { profile, loading } = useSelector((state) => state.user);
//   const [tabValue, setTabValue] = useState(0);
//   const [privacy, setPrivacy] = useState({
//     profileVisibility: 'public',
//     emailVisibility: 'friends',
//     phoneVisibility: 'private'
//   });
//   const [privacyChanged, setPrivacyChanged] = useState(false);
//   const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

//   useEffect(() => {
//     dispatch(fetchUserProfile());
//   }, [dispatch]);

//   const handleTabChange = (event, newValue) => {
//     setTabValue(newValue);
//   };

//   const handlePrivacyChange = (field, value) => {
//     setPrivacy({ ...privacy, [field]: value });
//     setPrivacyChanged(true);
//   };

//   const handleSavePrivacy = () => {
//     dispatch(showSnackbar({
//       message: 'Privacy settings saved successfully',
//       severity: 'success'
//     }));
//     setPrivacyChanged(false);
//   };

//   const handleDeleteAccount = () => {
//     setDeleteDialogOpen(true);
//   };

//   const confirmDeleteAccount = () => {
//     dispatch(logoutUser());
//     dispatch(showSnackbar({
//       message: 'Account deleted successfully',
//       severity: 'success'
//     }));
//     navigate('/');
//     setDeleteDialogOpen(false);
//   };

//   const cancelDeleteAccount = () => {
//     setDeleteDialogOpen(false);
//   };

//   if (loading || !profile) {
//     return (
//       <Box sx={{ 
//         display: 'flex', 
//         justifyContent: 'center', 
//         alignItems: 'center', 
//         height: '100vh' 
//       }}>
//         <CircularProgress size={60} />
//       </Box>
//     );
//   }

//   const userData = profile.user || profile;
//   const createdAt = userData.createdAt || new Date();
//   const updatedAt = userData.updatedAt || new Date();
//   const email = userData.email || 'No email provided';
//   const phone = userData.phone || 'No phone provided';

//   const formatDate = (date) => {
//     try {
//       return new Date(date).toLocaleDateString('en-US', {
//         year: 'numeric',
//         month: 'long',
//         day: 'numeric'
//       });
//     } catch (e) {
//       return 'Unknown date';
//     }
//   };

//   const mediaActions = [
//     { icon: <PhotoLibraryIcon />, title: 'Photo Library', path: '/photos', color: 'warning' },
//     { icon: <VideoLibraryIcon />, title: 'Video Library', path: '/videos', color: 'error' },
//     { icon: <MusicIcon />, title: 'Music Library', path: '/music', color: 'success' }
//   ];

//   const productivityTools = [
//     { icon: <CalendarIcon />, title: 'Calendar', path: '/calendar', color: 'info' },
//     { icon: <NotesIcon />, title: 'Notes', path: '/notes', color: 'info' },
//     { icon: <AlarmIcon />, title: 'Reminders', path: '/reminders', color: 'info' }
//   ];

//   const professionalSection = [
//     { icon: <WorkIcon />, title: 'Work Experience', path: '/work', color: 'primary' },
//     { icon: <SchoolIcon />, title: 'Education', path: '/education', color: 'primary' },
//     { icon: <GroupsIcon />, title: 'Groups', path: '/groups', color: 'primary' },
//     { icon: <LinkIcon />, title: 'Portfolio Links', path: '/links', color: 'primary' }
//   ];

//   return (
//     <ThemeProvider theme={theme}>
//       <Box sx={{ padding: isMobile ? 2 : 4, backgroundColor: 'background.default', minHeight: '100vh' }}>
//         <PrivateProfileHeader 
//           profile={profile} 
//           tabValue={tabValue} 
//           handleTabChange={handleTabChange}
//           isMobile={isMobile}
//         />

//         <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
//           <Box sx={{ p: 3 }}>
//             {tabValue === 0 && (
//               <Grid container spacing={2}>
//                 <Grid item xs={12} md={6}>
//                   <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
//                     <Typography variant="h6" gutterBottom>Personal Information</Typography>
//                     <Divider sx={{ mb: 2 }} />
//                     <Box sx={{ mb: 2 }}>
//                       <Typography variant="body2" color="text.secondary">
//                         <strong>Email:</strong> {email}
//                       </Typography>
//                     </Box>
//                     <Box sx={{ mb: 2 }}>
//                       <Typography variant="body2" color="text.secondary">
//                         <strong>Phone:</strong> {phone}
//                       </Typography>
//                     </Box>
//                     <Box sx={{ mb: 2 }}>
//                       <Typography variant="body2" color="text.secondary">
//                         <strong>Member since:</strong> {formatDate(createdAt)}
//                       </Typography>
//                     </Box>
//                     <Box>
//                       <Typography variant="body2" color="text.secondary">
//                         <strong>Last updated:</strong> {formatDate(updatedAt)}
//                       </Typography>
//                     </Box>
//                   </Paper>
//                 </Grid>
//               </Grid>
//             )}

//             {tabValue === 1 && (
//               <Grid container spacing={2}>
//                 {mediaActions.map((action, index) => (
//                   <Grid item xs={12} sm={6} md={4} key={index}>
//                     <Fade in timeout={(index + 1) * 300}>
//                       <Paper elevation={2} sx={{ p: 2, borderRadius: 2 }}>
//                         <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
//                           <Avatar sx={{ 
//                             bgcolor: `${action.color}.main`, 
//                             mr: 2,
//                             width: 40,
//                             height: 40
//                           }}>
//                             {action.icon}
//                           </Avatar>
//                           <Typography variant="subtitle1">{action.title}</Typography>
//                         </Box>
//                         <Button
//                           variant="outlined"
//                           color={action.color}
//                           fullWidth
//                           onClick={() => navigate(action.path)}
//                           size="small"
//                         >
//                           View
//                         </Button>
//                       </Paper>
//                     </Fade>
//                   </Grid>
//                 ))}
//               </Grid>
//             )}

//             {tabValue === 2 && (
//               <Grid container spacing={2}>
//                 {productivityTools.map((action, index) => (
//                   <Grid item xs={12} sm={6} md={4} key={index}>
//                     <Fade in timeout={(index + 1) * 300}>
//                       <Paper elevation={2} sx={{ p: 2, borderRadius: 2 }}>
//                         <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
//                           <Avatar sx={{ 
//                             bgcolor: `${action.color}.main`, 
//                             mr: 2,
//                             width: 40,
//                             height: 40
//                           }}>
//                             {action.icon}
//                           </Avatar>
//                           <Typography variant="subtitle1">{action.title}</Typography>
//                         </Box>
//                         <Button
//                           variant="outlined"
//                           color={action.color}
//                           fullWidth
//                           onClick={() => navigate(action.path)}
//                           size="small"
//                         >
//                           Open Tool
//                         </Button>
//                       </Paper>
//                     </Fade>
//                   </Grid>
//                 ))}
//               </Grid>
//             )}

//             {tabValue === 3 && (
//               <Grid container spacing={2}>
//                 {professionalSection.map((action, index) => (
//                   <Grid item xs={12} sm={6} key={index}>
//                     <Fade in timeout={(index + 1) * 300}>
//                       <Paper elevation={2} sx={{ p: 2, borderRadius: 2 }}>
//                         <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
//                           <Avatar sx={{ 
//                             bgcolor: `${action.color}.main`, 
//                             mr: 2,
//                             width: 40,
//                             height: 40
//                           }}>
//                             {action.icon}
//                           </Avatar>
//                           <Typography variant="subtitle1">{action.title}</Typography>
//                         </Box>
//                         <Button
//                           variant="outlined"
//                           color={action.color}
//                           fullWidth
//                           onClick={() => navigate(action.path)}
//                           size="small"
//                         >
//                           Manage
//                         </Button>
//                       </Paper>
//                     </Fade>
//                   </Grid>
//                 ))}
//               </Grid>
//             )}

//             {tabValue === 4 && (
//               <Box>
//                 <Typography variant="h6" gutterBottom>Privacy Settings</Typography>
//                 <Divider sx={{ mb: 3 }} />
//                 <Grid container spacing={2}>
//                   <Grid item xs={12} md={6}>
//                     <FormControl fullWidth sx={{ mb: 2 }}>
//                       <InputLabel>Profile Visibility</InputLabel>
//                       <Select
//                         value={privacy.profileVisibility}
//                         onChange={(e) => handlePrivacyChange('profileVisibility', e.target.value)}
//                         label="Profile Visibility"
//                       >
//                         <MenuItem value="public">Public</MenuItem>
//                         <MenuItem value="friends">Friends Only</MenuItem>
//                         <MenuItem value="private">Private</MenuItem>
//                       </Select>
//                     </FormControl>
//                   </Grid>
//                   <Grid item xs={12} md={6}>
//                     <FormControl fullWidth sx={{ mb: 2 }}>
//                       <InputLabel>Email Visibility</InputLabel>
//                       <Select
//                         value={privacy.emailVisibility}
//                         onChange={(e) => handlePrivacyChange('emailVisibility', e.target.value)}
//                         label="Email Visibility"
//                       >
//                         <MenuItem value="public">Public</MenuItem>
//                         <MenuItem value="friends">Friends Only</MenuItem>
//                         <MenuItem value="private">Private</MenuItem>
//                       </Select>
//                     </FormControl>
//                   </Grid>
//                   <Grid item xs={12} md={6}>
//                     <FormControl fullWidth sx={{ mb: 2 }}>
//                       <InputLabel>Phone Visibility</InputLabel>
//                       <Select
//                         value={privacy.phoneVisibility}
//                         onChange={(e) => handlePrivacyChange('phoneVisibility', e.target.value)}
//                         label="Phone Visibility"
//                       >
//                         <MenuItem value="friends">Friends Only</MenuItem>
//                         <MenuItem value="private">Private</MenuItem>
//                       </Select>
//                     </FormControl>
//                   </Grid>
//                 </Grid>
//                 <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
//                   <Button
//                     variant="contained"
//                     color="primary"
//                     onClick={handleSavePrivacy}
//                     disabled={!privacyChanged}
//                   >
//                     Save Changes
//                   </Button>
//                   <Button
//                     variant="outlined"
//                     color="error"
//                     onClick={handleDeleteAccount}
//                     startIcon={<DeleteIcon />}
//                   >
//                     Delete Account
//                   </Button>
//                 </Box>
//               </Box>
//             )}
//           </Box>
//         </Card>

//         <Dialog
//           open={deleteDialogOpen}
//           onClose={cancelDeleteAccount}
//           aria-labelledby="alert-dialog-title"
//           aria-describedby="alert-dialog-description"
//         >
//           <DialogTitle id="alert-dialog-title">
//             {"Confirm Account Deletion"}
//           </DialogTitle>
//           <DialogContent>
//             <DialogContentText id="alert-dialog-description">
//               Are you sure you want to delete your account? This action cannot be undone. 
//               All your data will be permanently removed from our servers.
//             </DialogContentText>
//           </DialogContent>
//           <DialogActions>
//             <Button onClick={cancelDeleteAccount} color="primary">
//               Cancel
//             </Button>
//             <Button onClick={confirmDeleteAccount} color="error" autoFocus startIcon={<DeleteIcon />}>
//               Delete Account
//             </Button>
//           </DialogActions>
//         </Dialog>
//       </Box>
//     </ThemeProvider>
//   );
// };

// export default PrivateProfilePage;









