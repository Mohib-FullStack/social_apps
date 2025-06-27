import {
  AccountBox,
  Article,
  Build,
  Cake,
  Chat,
  Delete,
  Edit,
  Email as EmailIcon,
  Event,
  Favorite,
  Lock,
  People,
  PhotoCamera,
  PhotoLibrary,
  Security,
  Visibility,
  Work,
} from '@mui/icons-material';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Tab,
  Tabs,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { useCallback, useState } from 'react';
import { useDispatch } from 'react-redux';
import { startLoading, stopLoading } from '../../features/loading/loadingSlice';
import { showSnackbar } from '../../features/snackbar/snackbarSlice';
import { logoutUser } from '../../features/user/userSlice';

const Dashboard = ({ userData, navigate }) => {
  const dispatch = useDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [tabValue, setTabValue] = useState(0);
  const [privacy, setPrivacy] = useState({
    profileVisibility: 'public',
    emailVisibility: 'friends',
    phoneVisibility: 'private',
  });
  const [privacyChanged, setPrivacyChanged] = useState(false);

  const handleTabChange = useCallback((_, newValue) => {
    setTabValue(newValue);
  }, []);

  const handlePrivacyChange = useCallback((field, value) => {
    setPrivacy((prev) => ({ ...prev, [field]: value }));
    setPrivacyChanged(true);
  }, []);

  const handleSavePrivacy = useCallback(() => {
    dispatch(startLoading({ message: 'Saving privacy settings...', animationType: 'wave' }));
    try {
      // Simulate API call
      setTimeout(() => {
        dispatch(showSnackbar({
          message: 'Privacy settings saved!',
          severity: 'success',
        }));
        setPrivacyChanged(false);
      }, 1000);
    } catch (error) {
      dispatch(showSnackbar({
        message: 'Failed to save privacy settings',
        severity: 'error',
      }));
    } finally {
      dispatch(stopLoading());
    }
  }, [dispatch]);

  const handleDeleteAccount = useCallback(() => {
    dispatch(startLoading({ message: 'Deleting account...', animationType: 'wave' }));
    try {
      // Simulate API call
      setTimeout(() => {
        dispatch(logoutUser());
        dispatch(showSnackbar({
          message: 'Account deleted successfully',
          severity: 'success',
        }));
        navigate('/');
      }, 1500);
    } catch (error) {
      dispatch(showSnackbar({
        message: 'Failed to delete account',
        severity: 'error',
      }));
    } finally {
      dispatch(stopLoading());
    }
  }, [dispatch, navigate]);

  const formatDate = useCallback((dateString) => {
    try {
      const date = new Date(dateString);
      return isNaN(date.getTime())
        ? 'Unknown date'
        : date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          });
    } catch {
      return 'Unknown date';
    }
  }, []);

  const cardStyle = (color) => ({
    height: '100%',
    background: `linear-gradient(135deg, ${color} 0%, ${theme.palette.background.paper} 100%)`,
    color: theme.palette.getContrastText(color),
    '&:hover': { transform: 'translateY(-4px)', boxShadow: 4 },
    transition: '0.3s',
    cursor: 'pointer',
  });

  const handleCardClick = useCallback((action) => {
    dispatch(startLoading({ message: 'Loading content...', animationType: 'wave' }));
    try {
      // Simulate loading time for the navigation
      setTimeout(() => {
        action();
        dispatch(stopLoading());
      }, 500);
    } catch (error) {
      dispatch(showSnackbar({
        message: 'Failed to load content',
        severity: 'error',
      }));
      dispatch(stopLoading());
    }
  }, [dispatch]);

  const renderCard = ({ title, icon, subtitle, color, action }, index) => (
    <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
      <Card sx={cardStyle(color)} onClick={() => handleCardClick(action)}>
        <CardContent sx={{ p: 2 }}>
          <Avatar
            sx={{
              bgcolor: 'rgba(255,255,255,0.2)',
              width: 48,
              height: 48,
              mb: 1,
            }}
          >
            {icon}
          </Avatar>
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom noWrap>
            {title}
          </Typography>
          <Typography variant="body2" noWrap>
            {subtitle}
          </Typography>
        </CardContent>
      </Card>
    </Grid>
  );

  // Social Features
  const socialCards = [
    {
      title: 'Social Feed',
      icon: <Article fontSize="large" />,
      subtitle: 'See latest posts',
      color: theme.palette.primary.main,
      action: () => navigate('/feed'),
    },
    {
      title: 'Profile Views',
      icon: <Visibility fontSize="large" />,
      subtitle: "Check who's viewed",
      color: theme.palette.success.main,
      action: () => navigate('/insights'),
    },
    {
      title: 'Friends',
      icon: <People fontSize="large" />,
      subtitle: 'Manage your connections',
      color: '#00bcd4',
      action: () => navigate('/friends'),
    },
    {
      title: 'Messages',
      icon: <Chat fontSize="large" />,
      subtitle: 'View conversations',
      color: theme.palette.info.main,
      action: () => navigate('/messages'),
    },
    {
      title: 'Events',
      icon: <Event fontSize="large" />,
      subtitle: 'Upcoming activities',
      color: theme.palette.error.main,
      action: () => navigate('/events'),
    },
    {
      title: 'Story Archive',
      icon: <PhotoCamera fontSize="large" />,
      subtitle: 'Relive old moments',
      color: '#9c27b0',
      action: () => navigate('/stories'),
    },
    {
      title: 'Likes',
      icon: <Favorite fontSize="large" />,
      subtitle: 'Content you liked',
      color: '#f44336',
      action: () => navigate('/likes'),
    },
  ];

  // Profile Management
  const profileActionCards = [
    {
      title: 'Edit Profile',
      icon: <Edit fontSize="large" />,
      subtitle: 'Update your information',
      color: '#4caf50',
      action: () => navigate('/my-profile-update'),
    },
    {
      title: 'View as Public',
      icon: <Visibility fontSize="large" />,
      subtitle: 'See your public profile',
      color: '#2196f3',
      action: () => window.open(`/profile/${userData?.id || 'me'}`, '_blank'),
    },
    {
      title: 'Update Password',
      icon: <Lock fontSize="large" />,
      subtitle: 'Change your credentials',
      color: '#ff9800',
      action: () => navigate('/update-password'),
    },
    {
      title: 'Personal Info',
      icon: <AccountBox fontSize="large" />,
      subtitle: 'Your email, phone & bio',
      color: '#3f51b5',
      action: () => navigate('/profile/private-update'),
    },
  ];

  // Media Section
  const mediaCards = [
    {
      title: 'Photo Library',
      icon: <PhotoLibrary fontSize="large" />,
      subtitle: 'Your uploaded photos',
      color: '#9c27b0',
      action: () => navigate('/photos'),
    },
    {
      title: 'Video Library',
      icon: <PhotoLibrary fontSize="large" />,
      subtitle: 'Your uploaded videos',
      color: '#f44336',
      action: () => navigate('/videos'),
    },
    {
      title: 'Music Library',
      icon: <PhotoLibrary fontSize="large" />,
      subtitle: 'Your music collection',
      color: '#00bcd4',
      action: () => navigate('/music'),
    },
  ];

  // Productivity Tools
  const productivityCards = [
    {
      title: 'Calendar',
      icon: <Event fontSize="large" />,
      subtitle: 'Manage your schedule',
      color: '#673ab7',
      action: () => navigate('/calendar'),
    },
    {
      title: 'Notes',
      icon: <Article fontSize="large" />,
      subtitle: 'Your personal notes',
      color: '#009688',
      action: () => navigate('/notes'),
    },
    {
      title: 'Posts',
      icon: <Article fontSize="large" />,
      subtitle: 'Create and manage posts',
      color: '#795548',
      action: () => navigate('/posts'),
    },
  ];

  // Professional Section
  const professionalCards = [
    {
      title: 'Work Experience',
      icon: <Work fontSize="large" />,
      subtitle: 'Add your work history',
      color: '#3f51b5',
      action: () => navigate('/work'),
    },
    {
      title: 'Education',
      icon: <Work fontSize="large" />,
      subtitle: 'Add your education',
      color: '#2196f3',
      action: () => navigate('/education'),
    },
    {
      title: 'Groups',
      icon: <People fontSize="large" />,
      subtitle: 'Join interest groups',
      color: '#4caf50',
      action: () => navigate('/groups'),
    },
    {
      title: 'Portfolio Links',
      icon: <Work fontSize="large" />,
      subtitle: 'Showcase your work',
      color: '#ff9800',
      action: () => navigate('/links'),
    },
  ];

  // Privacy Section
  const privacyCards = [
    {
      title: 'Privacy Settings',
      icon: <Security fontSize="large" />,
      subtitle: 'Control what others see',
      color: '#009688',
      action: () => setTabValue(4),
    },
    {
      title: 'Blocked Users',
      icon: <Security fontSize="large" />,
      subtitle: 'Users you blocked',
      color: '#607d8b',
      action: () => navigate('/profile/blocked-users'),
    },
    {
      title: 'Unblock Requests',
      icon: <Lock fontSize="large" />,
      subtitle: 'Pending unblock requests',
      color: '#9e9e9e',
      action: () => navigate('/profile/unblock-requests'),
    },
  ];

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
            fontWeight: 500,
          },
        }}
      >
        <Tab label="Social" icon={<People />} iconPosition="start" />
        <Tab label="Profile" icon={<AccountBox />} iconPosition="start" />
        <Tab label="Media" icon={<PhotoLibrary />} iconPosition="start" />
        <Tab label="Tools" icon={<Build />} iconPosition="start" />
        <Tab label="Professional" icon={<Work />} iconPosition="start" />
        <Tab label="Privacy" icon={<Lock />} iconPosition="start" />
      </Tabs>

      <Box sx={{ p: 3 }}>
        {/* Social Tab */}
        {tabValue === 0 && (
          <Grid container spacing={3}>
            {socialCards.map(renderCard)}
          </Grid>
        )}

        {/* Profile Tab */}
        {tabValue === 1 && (
          <Grid container spacing={3}>
            {profileActionCards.map(renderCard)}

            <Grid item xs={12}>
              <Card sx={{ borderRadius: 2, p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Personal Information
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <EmailIcon color="action" sx={{ mr: 1.5 }} />
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Email
                        </Typography>
                        <Typography>{userData.email}</Typography>
                      </Box>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Cake color="action" sx={{ mr: 1.5 }} />
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Member Since
                        </Typography>
                        <Typography>
                          {formatDate(userData.createdAt)}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <AccountBox color="action" sx={{ mr: 1.5 }} />
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Last Updated
                        </Typography>
                        <Typography>
                          {formatDate(userData.updatedAt)}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                </Grid>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Media Tab */}
        {tabValue === 2 && (
          <Grid container spacing={3}>
            {mediaCards.map(renderCard)}
          </Grid>
        )}

        {/* Tools Tab */}
        {tabValue === 3 && (
          <Grid container spacing={3}>
            {productivityCards.map(renderCard)}
          </Grid>
        )}

        {/* Professional Tab */}
        {tabValue === 4 && (
          <Grid container spacing={3}>
            {professionalCards.map(renderCard)}
          </Grid>
        )}

        {/* Privacy Tab */}
        {tabValue === 5 && (
          <Box>
            <Grid container spacing={3} sx={{ mb: 3 }}>
              {privacyCards.map(renderCard)}
            </Grid>

            <Typography variant="h6" gutterBottom>
              Privacy Settings
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Profile Visibility</InputLabel>
                  <Select
                    value={privacy.profileVisibility}
                    onChange={(e) =>
                      handlePrivacyChange('profileVisibility', e.target.value)
                    }
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
                    onChange={(e) =>
                      handlePrivacyChange('emailVisibility', e.target.value)
                    }
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
                    onChange={(e) =>
                      handlePrivacyChange('phoneVisibility', e.target.value)
                    }
                    label="Phone Visibility"
                  >
                    <MenuItem value="friends">Friends Only</MenuItem>
                    <MenuItem value="private">Private</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            <Box
              sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}
            >
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

      {isMobile && (
        <Box
          sx={{
            position: 'fixed',
            bottom: 20,
            left: 0,
            right: 0,
            display: 'flex',
            justifyContent: 'center',
            zIndex: 1000,
          }}
        >
          <Card sx={{ borderRadius: 50, boxShadow: 3, px: 2, py: 1 }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                '& .MuiTab-root': {
                  minWidth: 'unset',
                  px: 1.5,
                  py: 0.5,
                },
              }}
            >
              <Tab icon={<People />} aria-label="Social" />
              <Tab icon={<AccountBox />} aria-label="Profile" />
              <Tab icon={<PhotoLibrary />} aria-label="Media" />
              <Tab icon={<Build />} aria-label="Tools" />
              <Tab icon={<Work />} aria-label="Professional" />
              <Tab icon={<Lock />} aria-label="Privacy" />
            </Tabs>
          </Card>
        </Box>
      )}
    </Card>
  );
};

export default Dashboard;







//! original
// import {
//   AccountBox,
//   Article,
//   Build,
//   Cake,
//   Chat,
//   Delete,
//   // Base Icons
//   Edit,
//   Email as EmailIcon,
//   Event,
//   Favorite,
//   Lock,
//   People,
//   PhotoCamera,
//   PhotoLibrary,
//   Security,
//   Visibility,
//   Work,
// } from '@mui/icons-material';

// import {
//   Avatar,
//   Box,
//   Button,
//   Card,
//   CardContent,
//   Divider,
//   FormControl,
//   Grid,
//   InputLabel,
//   MenuItem,
//   Select,
//   Tab,
//   Tabs,
//   Typography,
//   useMediaQuery,
//   useTheme,
// } from '@mui/material';
// import { useCallback, useState } from 'react';
// import { useDispatch } from 'react-redux';
// import { showSnackbar } from '../../features/snackbar/snackbarSlice';
// import { logoutUser } from '../../features/user/userSlice';

// const Dashboard = ({ userData, navigate }) => {
//   const dispatch = useDispatch();
//   const theme = useTheme();
//   const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
//   const [tabValue, setTabValue] = useState(0);
//   const [privacy, setPrivacy] = useState({
//     profileVisibility: 'public',
//     emailVisibility: 'friends',
//     phoneVisibility: 'private',
//   });
//   const [privacyChanged, setPrivacyChanged] = useState(false);

//   const handleTabChange = useCallback((_, newValue) => {
//     setTabValue(newValue);
//   }, []);

//   const handlePrivacyChange = useCallback((field, value) => {
//     setPrivacy((prev) => ({ ...prev, [field]: value }));
//     setPrivacyChanged(true);
//   }, []);

//   const handleSavePrivacy = useCallback(() => {
//     dispatch(
//       showSnackbar({
//         message: 'Privacy settings saved!',
//         severity: 'success',
//       })
//     );
//     setPrivacyChanged(false);
//   }, [dispatch]);

//   const handleDeleteAccount = useCallback(() => {
//     dispatch(logoutUser());
//     dispatch(
//       showSnackbar({
//         message: 'Account deleted successfully',
//         severity: 'success',
//       })
//     );
//     navigate('/');
//   }, [dispatch, navigate]);

//   const formatDate = useCallback((dateString) => {
//     try {
//       const date = new Date(dateString);
//       return isNaN(date.getTime())
//         ? 'Unknown date'
//         : date.toLocaleDateString('en-US', {
//             year: 'numeric',
//             month: 'long',
//             day: 'numeric',
//           });
//     } catch {
//       return 'Unknown date';
//     }
//   }, []);

//   const cardStyle = (color) => ({
//     height: '100%',
//     background: `linear-gradient(135deg, ${color} 0%, ${theme.palette.background.paper} 100%)`,
//     color: theme.palette.getContrastText(color),
//     '&:hover': { transform: 'translateY(-4px)', boxShadow: 4 },
//     transition: '0.3s',
//     cursor: 'pointer',
//   });

//   const renderCard = ({ title, icon, subtitle, color, action }, index) => (
//     <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
//       <Card sx={cardStyle(color)} onClick={action}>
//         <CardContent sx={{ p: 2 }}>
//           <Avatar
//             sx={{
//               bgcolor: 'rgba(255,255,255,0.2)',
//               width: 48,
//               height: 48,
//               mb: 1,
//             }}
//           >
//             {icon}
//           </Avatar>
//           <Typography variant="subtitle1" fontWeight="bold" gutterBottom noWrap>
//             {title}
//           </Typography>
//           <Typography variant="body2" noWrap>
//             {subtitle}
//           </Typography>
//         </CardContent>
//       </Card>
//     </Grid>
//   );

//   // Social Features
//   const socialCards = [
//     {
//       title: 'Social Feed',
//       icon: <Article fontSize="large" />,
//       subtitle: 'See latest posts',
//       color: theme.palette.primary.main,
//       action: () => navigate('/feed'),
//     },
//     {
//       title: 'Profile Views',
//       icon: <Visibility fontSize="large" />,
//       subtitle: "Check who's viewed",
//       color: theme.palette.success.main,
//       action: () => navigate('/insights'),
//     },
//     {
//       title: 'Friends',
//       icon: <People fontSize="large" />,
//       subtitle: 'Manage your connections',
//       color: '#00bcd4',
//       action: () => navigate('/friends'),
//     },
//     {
//       title: 'Messages',
//       icon: <Chat fontSize="large" />,
//       subtitle: 'View conversations',
//       color: theme.palette.info.main,
//       action: () => navigate('/messages'),
//     },
//     {
//       title: 'Events',
//       icon: <Event fontSize="large" />,
//       subtitle: 'Upcoming activities',
//       color: theme.palette.error.main,
//       action: () => navigate('/events'),
//     },
//     {
//       title: 'Story Archive',
//       icon: <PhotoCamera fontSize="large" />,
//       subtitle: 'Relive old moments',
//       color: '#9c27b0',
//       action: () => navigate('/stories'),
//     },
//     {
//       title: 'Likes',
//       icon: <Favorite fontSize="large" />,
//       subtitle: 'Content you liked',
//       color: '#f44336',
//       action: () => navigate('/likes'),
//     },
//   ];

//   // Profile Management
//   const profileActionCards = [
//     {
//       title: 'Edit Profile',
//       icon: <Edit fontSize="large" />,
//       subtitle: 'Update your information',
//       color: '#4caf50',
//       action: () => navigate('/my-profile-update'),
//     },
//     {
//       title: 'View as Public',
//       icon: <Visibility fontSize="large" />,
//       subtitle: 'See your public profile',
//       color: '#2196f3',
//       action: () => window.open(`/profile/${userData?.id || 'me'}`, '_blank'),
//     },
//     {
//       title: 'Update Password',
//       icon: <Lock fontSize="large" />,
//       subtitle: 'Change your credentials',
//       color: '#ff9800',
//       action: () => navigate('/update-password'),
//     },
//     {
//       title: 'Personal Info',
//       icon: <AccountBox fontSize="large" />,
//       subtitle: 'Your email, phone & bio',
//       color: '#3f51b5',
//       action: () => navigate('/profile/private-update'),
//     },
//   ];

//   // Media Section
//   const mediaCards = [
//     {
//       title: 'Photo Library',
//       icon: <PhotoLibrary fontSize="large" />,
//       subtitle: 'Your uploaded photos',
//       color: '#9c27b0',
//       action: () => navigate('/photos'),
//     },
//     {
//       title: 'Video Library',
//       icon: <PhotoLibrary fontSize="large" />,
//       subtitle: 'Your uploaded videos',
//       color: '#f44336',
//       action: () => navigate('/videos'),
//     },
//     {
//       title: 'Music Library',
//       icon: <PhotoLibrary fontSize="large" />,
//       subtitle: 'Your music collection',
//       color: '#00bcd4',
//       action: () => navigate('/music'),
//     },
//   ];

//   // Productivity Tools
//   const productivityCards = [
//     {
//       title: 'Calendar',
//       icon: <Event fontSize="large" />,
//       subtitle: 'Manage your schedule',
//       color: '#673ab7',
//       action: () => navigate('/calendar'),
//     },
//     {
//       title: 'Notes',
//       icon: <Article fontSize="large" />,
//       subtitle: 'Your personal notes',
//       color: '#009688',
//       action: () => navigate('/notes'),
//     },
//     {
//       title: 'Posts',
//       icon: <Article fontSize="large" />,
//       subtitle: 'Create and manage posts',
//       color: '#795548',
//       action: () => navigate('/posts'),
//     },
//   ];

//   // Professional Section
//   const professionalCards = [
//     {
//       title: 'Work Experience',
//       icon: <Work fontSize="large" />,
//       subtitle: 'Add your work history',
//       color: '#3f51b5',
//       action: () => navigate('/work'),
//     },
//     {
//       title: 'Education',
//       icon: <Work fontSize="large" />,
//       subtitle: 'Add your education',
//       color: '#2196f3',
//       action: () => navigate('/education'),
//     },
//     {
//       title: 'Groups',
//       icon: <People fontSize="large" />,
//       subtitle: 'Join interest groups',
//       color: '#4caf50',
//       action: () => navigate('/groups'),
//     },
//     {
//       title: 'Portfolio Links',
//       icon: <Work fontSize="large" />,
//       subtitle: 'Showcase your work',
//       color: '#ff9800',
//       action: () => navigate('/links'),
//     },
//   ];

//   // Privacy Section
//   const privacyCards = [
//     {
//       title: 'Privacy Settings',
//       icon: <Security fontSize="large" />,
//       subtitle: 'Control what others see',
//       color: '#009688',
//       action: () => setTabValue(4),
//     },
//     {
//       title: 'Blocked Users',
//       icon: <Security fontSize="large" />,
//       subtitle: 'Users you blocked',
//       color: '#607d8b',
//       action: () => navigate('/profile/blocked-users'),
//     },
//     {
//       title: 'Unblock Requests',
//       icon: <Lock fontSize="large" />,
//       subtitle: 'Pending unblock requests',
//       color: '#9e9e9e',
//       action: () => navigate('/profile/unblock-requests'),
//     },
//   ];

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
//             fontWeight: 500,
//           },
//         }}
//       >
//         <Tab label="Social" icon={<People />} iconPosition="start" />
//         <Tab label="Profile" icon={<AccountBox />} iconPosition="start" />
//         <Tab label="Media" icon={<PhotoLibrary />} iconPosition="start" />
//         <Tab label="Tools" icon={<Build />} iconPosition="start" />
//         <Tab label="Professional" icon={<Work />} iconPosition="start" />
//         <Tab label="Privacy" icon={<Lock />} iconPosition="start" />
//       </Tabs>

//       <Box sx={{ p: 3 }}>
//         {/* Social Tab */}
//         {tabValue === 0 && (
//           <Grid container spacing={3}>
//             {socialCards.map(renderCard)}
//           </Grid>
//         )}

//         {/* Profile Tab */}
//         {tabValue === 1 && (
//           <Grid container spacing={3}>
//             {profileActionCards.map(renderCard)}

//             <Grid item xs={12}>
//               <Card sx={{ borderRadius: 2, p: 3 }}>
//                 <Typography variant="h6" gutterBottom>
//                   Personal Information
//                 </Typography>
//                 <Divider sx={{ mb: 2 }} />
//                 <Grid container spacing={2}>
//                   <Grid item xs={12} md={6}>
//                     <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
//                       <EmailIcon color="action" sx={{ mr: 1.5 }} />
//                       <Box>
//                         <Typography variant="caption" color="text.secondary">
//                           Email
//                         </Typography>
//                         <Typography>{userData.email}</Typography>
//                       </Box>
//                     </Box>
//                   </Grid>
//                   <Grid item xs={12} md={6}>
//                     <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
//                       <Cake color="action" sx={{ mr: 1.5 }} />
//                       <Box>
//                         <Typography variant="caption" color="text.secondary">
//                           Member Since
//                         </Typography>
//                         <Typography>
//                           {formatDate(userData.createdAt)}
//                         </Typography>
//                       </Box>
//                     </Box>
//                   </Grid>
//                   <Grid item xs={12} md={6}>
//                     <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
//                       <AccountBox color="action" sx={{ mr: 1.5 }} />
//                       <Box>
//                         <Typography variant="caption" color="text.secondary">
//                           Last Updated
//                         </Typography>
//                         <Typography>
//                           {formatDate(userData.updatedAt)}
//                         </Typography>
//                       </Box>
//                     </Box>
//                   </Grid>
//                 </Grid>
//               </Card>
//             </Grid>
//           </Grid>
//         )}

//         {/* Media Tab */}
//         {tabValue === 2 && (
//           <Grid container spacing={3}>
//             {mediaCards.map(renderCard)}
//           </Grid>
//         )}

//         {/* Tools Tab */}
//         {tabValue === 3 && (
//           <Grid container spacing={3}>
//             {productivityCards.map(renderCard)}
//           </Grid>
//         )}

//         {/* Professional Tab */}
//         {tabValue === 4 && (
//           <Grid container spacing={3}>
//             {professionalCards.map(renderCard)}
//           </Grid>
//         )}

//         {/* Privacy Tab */}
//         {tabValue === 5 && (
//           <Box>
//             <Grid container spacing={3} sx={{ mb: 3 }}>
//               {privacyCards.map(renderCard)}
//             </Grid>

//             <Typography variant="h6" gutterBottom>
//               Privacy Settings
//             </Typography>
//             <Divider sx={{ mb: 3 }} />

//             <Grid container spacing={2}>
//               <Grid item xs={12} md={6}>
//                 <FormControl fullWidth sx={{ mb: 2 }}>
//                   <InputLabel>Profile Visibility</InputLabel>
//                   <Select
//                     value={privacy.profileVisibility}
//                     onChange={(e) =>
//                       handlePrivacyChange('profileVisibility', e.target.value)
//                     }
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
//                     onChange={(e) =>
//                       handlePrivacyChange('emailVisibility', e.target.value)
//                     }
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
//                     onChange={(e) =>
//                       handlePrivacyChange('phoneVisibility', e.target.value)
//                     }
//                     label="Phone Visibility"
//                   >
//                     <MenuItem value="friends">Friends Only</MenuItem>
//                     <MenuItem value="private">Private</MenuItem>
//                   </Select>
//                 </FormControl>
//               </Grid>
//             </Grid>

//             <Box
//               sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}
//             >
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

//       {isMobile && (
//         <Box
//           sx={{
//             position: 'fixed',
//             bottom: 20,
//             left: 0,
//             right: 0,
//             display: 'flex',
//             justifyContent: 'center',
//             zIndex: 1000,
//           }}
//         >
//           <Card sx={{ borderRadius: 50, boxShadow: 3, px: 2, py: 1 }}>
//             <Tabs
//               value={tabValue}
//               onChange={handleTabChange}
//               variant="scrollable"
//               scrollButtons="auto"
//               sx={{
//                 '& .MuiTab-root': {
//                   minWidth: 'unset',
//                   px: 1.5,
//                   py: 0.5,
//                 },
//               }}
//             >
//               <Tab icon={<People />} aria-label="Social" />
//               <Tab icon={<AccountBox />} aria-label="Profile" />
//               <Tab icon={<PhotoLibrary />} aria-label="Media" />
//               <Tab icon={<Build />} aria-label="Tools" />
//               <Tab icon={<Work />} aria-label="Professional" />
//               <Tab icon={<Lock />} aria-label="Privacy" />
//             </Tabs>
//           </Card>
//         </Box>
//       )}
//     </Card>
//   );
// };

// export default Dashboard;
