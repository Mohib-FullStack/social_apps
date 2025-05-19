import {
  ArrowBack as ArrowBackIcon,
  Lock as LockIcon,
  Person as PersonIcon,
  PhotoLibrary as PhotoLibraryIcon,
  VideoLibrary as VideoLibraryIcon,
  Delete as DeleteIcon,
  CalendarToday as CalendarIcon,
  Notes as NotesIcon,
  Alarm as AlarmIcon,
  Calculate as CalculateIcon,
  MusicNote as MusicIcon,
  Work as WorkIcon,
  School as SchoolIcon,
  Groups as GroupsIcon,
  Link as LinkIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import {
  Avatar,
  Box,
  Button,
  Card,
  Chip,
  CircularProgress,
  Divider,
  Fade,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Typography,
  Tabs,
  Tab,
  Badge,
  Link,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText
} from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import theme from '../../theme';
import { fetchUserProfile, logoutUser } from '../../features/user/userSlice';
import { showSnackbar } from '../../features/snackbar/snackbarSlice';

const PrivateProfilePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { profile, loading } = useSelector((state) => state.user);
  const [tabValue, setTabValue] = useState(0);
  const [privacy, setPrivacy] = useState({
    profileVisibility: 'public',
    emailVisibility: 'friends',
    phoneVisibility: 'private'
  });
  const [privacyChanged, setPrivacyChanged] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    // Fetch user profile on component mount
    dispatch(fetchUserProfile());
  }, [dispatch]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handlePrivacyChange = (field, value) => {
    setPrivacy({ ...privacy, [field]: value });
    setPrivacyChanged(true);
  };

  const handleSavePrivacy = () => {
    dispatch(showSnackbar({
      message: 'Privacy settings saved successfully',
      severity: 'success'
    }));
    setPrivacyChanged(false);
  };

  const handleDeleteAccount = () => {
    setDeleteDialogOpen(true);
  };

  const confirmDeleteAccount = () => {
    dispatch(logoutUser());
    dispatch(showSnackbar({
      message: 'Account deleted successfully',
      severity: 'success'
    }));
    navigate('/');
    setDeleteDialogOpen(false);
  };

  const cancelDeleteAccount = () => {
    setDeleteDialogOpen(false);
  };

  if (loading || !profile) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  // Safely access profile data with fallbacks
  const userData = profile.user || profile;
  const userId = userData._id || userData.id || 'me';
  const fullName = `${userData.firstName || ''} ${userData.lastName || ''}`.trim();
  const email = userData.email || 'No email provided';
  const phone = userData.phone || 'No phone provided';
  const createdAt = userData.createdAt || new Date();
  const updatedAt = userData.updatedAt || new Date();
  const isVerified = userData.isVerified || false;
  const profileImage = userData.profileImage || '/default-avatar.png';

  const formatDate = (date) => {
    try {
      return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (e) {
      return 'Unknown date';
    }
  };

  // Grouped action cards
  const profileActions = [
    { icon: <PersonIcon />, title: 'Update Profile', path: '/update-profile', color: 'primary' },
    { icon: <LockIcon />, title: 'Update Password', path: '/update-password', color: 'secondary' }
  ];

  const mediaActions = [
    { icon: <PhotoLibraryIcon />, title: 'Photo Library', path: '/photos', color: 'warning' },
    { icon: <VideoLibraryIcon />, title: 'Video Library', path: '/videos', color: 'error' },
    { icon: <MusicIcon />, title: 'Music Library', path: '/music', color: 'success' }
  ];

  const productivityTools = [
    { icon: <CalendarIcon />, title: 'Calendar', path: '/calendar', color: 'info' },
    { icon: <NotesIcon />, title: 'Notes', path: '/notes', color: 'info' },
    { icon: <AlarmIcon />, title: 'Reminders', path: '/reminders', color: 'info' }
  ];

  const professionalSection = [
    { icon: <WorkIcon />, title: 'Work Experience', path: '/work', color: 'primary' },
    { icon: <SchoolIcon />, title: 'Education', path: '/education', color: 'primary' },
    { icon: <GroupsIcon />, title: 'Groups', path: '/groups', color: 'primary' },
    { icon: <LinkIcon />, title: 'Portfolio Links', path: '/links', color: 'primary' }
  ];

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ padding: 4, backgroundColor: 'background.default', minHeight: '100vh' }}>
        {/* Header with Back Button */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(-1)}
            sx={{
              borderRadius: '8px',
              '&:hover': { backgroundColor: 'secondary.main' }
            }}
          >
            Back
          </Button>
          <Typography variant="h4" color="text.primary">
            My Profile
          </Typography>
          <Box sx={{ width: 150 }} /> {/* Spacer for alignment */}
        </Box>

        {/* Main Content Grid */}
        <Grid container spacing={3}>
          {/* Left Column - Profile Card */}
          <Grid item xs={12} md={4}>
            <Fade in timeout={800}>
              <Link
                component={RouterLink}
                to={`/profile/public/${userId}`}
                underline="none"
                color="inherit"
              >
                <Card 
                  sx={{ 
                    borderRadius: 3, 
                    boxShadow: 3,
                    transition: 'transform 0.3s, box-shadow 0.3s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 6
                    }
                  }}
                >
                  <Box sx={{ p: 3, textAlign: 'center' }}>
                    <Badge
                      overlap="circular"
                      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                      badgeContent={
                        <IconButton 
                          component={RouterLink}
                          to="/update-profile"
                          sx={{ 
                            bgcolor: 'secondary.main',
                            '&:hover': { bgcolor: 'secondary.dark' }
                          }}
                        >
                          <EditIcon fontSize="small" sx={{ color: 'white' }} />
                        </IconButton>
                      }
                    >
                      <Avatar
                        src={profileImage}
                        alt={fullName}
                        sx={{
                          width: 150,
                          height: 150,
                          border: '4px solid',
                          borderColor: 'secondary.main',
                          mb: 2,
                          cursor: 'pointer',
                          transition: 'transform 0.3s',
                          '&:hover': {
                            transform: 'scale(1.05)'
                          }
                        }}
                      />
                    </Badge>
                    <Typography 
                      variant="h5" 
                      gutterBottom
                      sx={{
                        cursor: 'pointer',
                        '&:hover': {
                          textDecoration: 'underline',
                          color: 'primary.main'
                        }
                      }}
                    >
                      {fullName || 'Anonymous User'}
                    </Typography>
                    <Chip 
                      label={isVerified ? "Verified" : "Not Verified"} 
                      color={isVerified ? "success" : "default"} 
                      size="small" 
                      sx={{ mb: 2 }}
                    />
                    
                    <Divider sx={{ my: 2 }} />
                    
                    <Box sx={{ textAlign: 'left' }}>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        <strong>Email:</strong> {email}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        <strong>Phone:</strong> {phone}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        <strong>Member since:</strong> {formatDate(createdAt)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        <strong>Last updated:</strong> {formatDate(updatedAt)}
                      </Typography>
                    </Box>
                  </Box>
                </Card>
              </Link>
            </Fade>
          </Grid>

          {/* Right Column - Content Tabs */}
          <Grid item xs={12} md={8}>
            <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
              <Tabs 
                value={tabValue} 
                onChange={handleTabChange} 
                variant="scrollable"
                scrollButtons="auto"
                sx={{ 
                  borderBottom: 1, 
                  borderColor: 'divider',
                  '& .MuiTab-root': { minWidth: 120 }
                }}
              >
                <Tab label="Profile" icon={<PersonIcon />} iconPosition="start" />
                <Tab label="Media" icon={<PhotoLibraryIcon />} iconPosition="start" />
                <Tab label="Tools" icon={<CalculateIcon />} iconPosition="start" />
                <Tab label="Professional" icon={<WorkIcon />} iconPosition="start" />
                <Tab label="Privacy" icon={<LockIcon />} iconPosition="start" />
              </Tabs>

              <Box sx={{ p: 3 }}>
                {/* Profile Tab */}
                {tabValue === 0 && (
                  <Grid container spacing={2}>
                    {profileActions.map((action, index) => (
                      <Grid item xs={12} sm={6} key={index}>
                        <Fade in timeout={(index + 1) * 300}>
                          <Paper elevation={2} sx={{ p: 2, borderRadius: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                              <Avatar sx={{ 
                                bgcolor: `${action.color}.main`, 
                                mr: 2,
                                width: 40,
                                height: 40
                              }}>
                                {action.icon}
                              </Avatar>
                              <Typography variant="subtitle1">{action.title}</Typography>
                            </Box>
                            <Button
                              variant="outlined"
                              color={action.color}
                              fullWidth
                              onClick={() => navigate(action.path)}
                              size="small"
                            >
                              Open
                            </Button>
                          </Paper>
                        </Fade>
                      </Grid>
                    ))}
                  </Grid>
                )}

                {/* Media Tab */}
                {tabValue === 1 && (
                  <Grid container spacing={2}>
                    {mediaActions.map((action, index) => (
                      <Grid item xs={12} sm={6} md={4} key={index}>
                        <Fade in timeout={(index + 1) * 300}>
                          <Paper elevation={2} sx={{ p: 2, borderRadius: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                              <Avatar sx={{ 
                                bgcolor: `${action.color}.main`, 
                                mr: 2,
                                width: 40,
                                height: 40
                              }}>
                                {action.icon}
                              </Avatar>
                              <Typography variant="subtitle1">{action.title}</Typography>
                            </Box>
                            <Button
                              variant="outlined"
                              color={action.color}
                              fullWidth
                              onClick={() => navigate(action.path)}
                              size="small"
                            >
                              View
                            </Button>
                          </Paper>
                        </Fade>
                      </Grid>
                    ))}
                  </Grid>
                )}

                {/* Tools Tab */}
                {tabValue === 2 && (
                  <Grid container spacing={2}>
                    {productivityTools.map((action, index) => (
                      <Grid item xs={12} sm={6} md={4} key={index}>
                        <Fade in timeout={(index + 1) * 300}>
                          <Paper elevation={2} sx={{ p: 2, borderRadius: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                              <Avatar sx={{ 
                                bgcolor: `${action.color}.main`, 
                                mr: 2,
                                width: 40,
                                height: 40
                              }}>
                                {action.icon}
                              </Avatar>
                              <Typography variant="subtitle1">{action.title}</Typography>
                            </Box>
                            <Button
                              variant="outlined"
                              color={action.color}
                              fullWidth
                              onClick={() => navigate(action.path)}
                              size="small"
                            >
                              Open Tool
                            </Button>
                          </Paper>
                        </Fade>
                      </Grid>
                    ))}
                  </Grid>
                )}

                {/* Professional Tab */}
                {tabValue === 3 && (
                  <Grid container spacing={2}>
                    {professionalSection.map((action, index) => (
                      <Grid item xs={12} sm={6} key={index}>
                        <Fade in timeout={(index + 1) * 300}>
                          <Paper elevation={2} sx={{ p: 2, borderRadius: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                              <Avatar sx={{ 
                                bgcolor: `${action.color}.main`, 
                                mr: 2,
                                width: 40,
                                height: 40
                              }}>
                                {action.icon}
                              </Avatar>
                              <Typography variant="subtitle1">{action.title}</Typography>
                            </Box>
                            <Button
                              variant="outlined"
                              color={action.color}
                              fullWidth
                              onClick={() => navigate(action.path)}
                              size="small"
                            >
                              Manage
                            </Button>
                          </Paper>
                        </Fade>
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
                        startIcon={<DeleteIcon />}
                      >
                        Delete Account
                      </Button>
                    </Box>
                  </Box>
                )}
              </Box>
            </Card>
          </Grid>
        </Grid>

        {/* Delete Account Confirmation Dialog */}
        <Dialog
          open={deleteDialogOpen}
          onClose={cancelDeleteAccount}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">
            {"Confirm Account Deletion"}
          </DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              Are you sure you want to delete your account? This action cannot be undone. 
              All your data will be permanently removed from our servers.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={cancelDeleteAccount} color="primary">
              Cancel
            </Button>
            <Button onClick={confirmDeleteAccount} color="error" autoFocus startIcon={<DeleteIcon />}>
              Delete Account
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </ThemeProvider>
  );
};

export default PrivateProfilePage;









//! without public
// import {
//   ArrowBack as ArrowBackIcon,
//   Lock as LockIcon,
//   Person as PersonIcon,
//   PhotoLibrary as PhotoLibraryIcon,
//   VideoLibrary as VideoLibraryIcon,
//   Delete as DeleteIcon,
//   CalendarToday as CalendarIcon,
//   Notes as NotesIcon,
//   Alarm as AlarmIcon,
//   Calculate as CalculateIcon,
//   MusicNote as MusicIcon,
//   Work as WorkIcon,
//   School as SchoolIcon,
//   Groups as GroupsIcon,
//   Link as LinkIcon,
//   Edit as EditIcon
// } from '@mui/icons-material';
// import {
//   Avatar,
//   Box,
//   Button,
//   Card,
//   Chip,
//   CircularProgress,
//   Divider,
//   Fade,
//   FormControl,
//   Grid,
//   InputLabel,
//   MenuItem,
//   Paper,
//   Select,
//   Typography,
//   Tabs,
//   Tab,
//   Badge,
//   Link,
//   IconButton,
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   DialogContentText
// } from '@mui/material';
// import { ThemeProvider } from '@mui/material/styles';
// import { useEffect, useState } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { Link as RouterLink, useNavigate } from 'react-router-dom';
// import theme from '../../theme';
// import { fetchUserProfile, logoutUser } from '../../features/user/userSlice';
// import { showSnackbar } from '../../features/snackbar/snackbarSlice';


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
//     // Here you would typically make an API call to save privacy settings
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
//     // Here you would typically make an API call to delete the account
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
//     { icon: <PersonIcon />, title: 'Update Profile', path: '/update-profile', color: 'primary' },
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
//         <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
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
//               <Card 
//                 sx={{ 
//                   borderRadius: 3, 
//                   boxShadow: 3,
//                   transition: 'transform 0.3s, box-shadow 0.3s',
//                   '&:hover': {
//                     transform: 'translateY(-4px)',
//                     boxShadow: 6
//                   }
//                 }}
//               >
//                 <Box sx={{ p: 3, textAlign: 'center' }}>
//                   <Badge
//                     overlap="circular"
//                     anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
//                     badgeContent={
//                       <IconButton 
//                         component={RouterLink}
//                         to="/update-profile"
//                         sx={{ 
//                           bgcolor: 'secondary.main',
//                           '&:hover': { bgcolor: 'secondary.dark' }
//                         }}
//                       >
//                         <EditIcon fontSize="small" sx={{ color: 'white' }} />
//                       </IconButton>
//                     }
//                   >
//                     <Avatar
//                       src={profileImage}
//                       alt={fullName}
//                       sx={{
//                         width: 150,
//                         height: 150,
//                         border: '4px solid',
//                         borderColor: 'secondary.main',
//                         mb: 2
//                       }}
//                     />
//                   </Badge>
//                   <Typography variant="h5" gutterBottom>
//                     {fullName || 'Anonymous User'}
//                   </Typography>
//                   <Chip 
//                     label={isVerified ? "Verified" : "Not Verified"} 
//                     color={isVerified ? "success" : "default"} 
//                     size="small" 
//                     sx={{ mb: 2 }}
//                   />
                  
//                   <Divider sx={{ my: 2 }} />
                  
//                   <Box sx={{ textAlign: 'left' }}>
//                     <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
//                       <strong>Email:</strong> {email}
//                     </Typography>
//                     <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
//                       <strong>Phone:</strong> {phone}
//                     </Typography>
//                     <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
//                       <strong>Member since:</strong> {formatDate(createdAt)}
//                     </Typography>
//                     <Typography variant="body2" color="text.secondary">
//                       <strong>Last updated:</strong> {formatDate(updatedAt)}
//                     </Typography>
//                   </Box>
//                 </Box>
//               </Card>
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
//             <Button onClick={confirmDeleteAccount} color="error" autoFocus>
//               Delete Account
//             </Button>
//           </DialogActions>
//         </Dialog>
//       </Box>
//     </ThemeProvider>
//   );
// };

// export default PrivateProfilePage;




//! curent with public
// import {
//   ArrowBack as ArrowBackIcon,
//   Favorite as FavoriteIcon,
//   Lock as LockIcon,
//   Payment as PaymentIcon,
//   Person as PersonIcon,
//   ShoppingCart as ShoppingCartIcon,
//   PhotoLibrary as PhotoLibraryIcon,
//   VideoLibrary as VideoLibraryIcon,
//   Delete as DeleteIcon,
//   CalendarToday as CalendarIcon,
//   Notes as NotesIcon,
//   Alarm as AlarmIcon,
//   Calculate as CalculateIcon,
//   MusicNote as MusicIcon,
//   Work as WorkIcon,
//   School as SchoolIcon,
//   Groups as GroupsIcon,
//   Link as LinkIcon,
//   Star as StarIcon
// } from '@mui/icons-material';
// import {
//   Avatar,
//   Box,
//   Button,
//   Card,
//   CardContent,
//   Chip,
//   Divider,
//   Fade,
//   FormControl,
//   Grid,
//   InputLabel,
//   MenuItem,
//   Paper,
//   Select,
//   Typography,
//   Tabs,
//   Tab,
//   Badge,
//   Link
// } from '@mui/material';
// import { ThemeProvider } from '@mui/material/styles';
// import { useState } from 'react';
// import { useSelector } from 'react-redux';
// import { Link as RouterLink, useNavigate } from 'react-router-dom';
// import theme from '../../theme';

// const PrivateProfilePage = () => {
//   const { profile } = useSelector((state) => state.user);
//   const navigate = useNavigate();
//   const [tabValue, setTabValue] = useState(0);
//   const [privacy, setPrivacy] = useState({
//     profileVisibility: 'public',
//     emailVisibility: 'friends',
//     phoneVisibility: 'private'
//   });
//   const [privacyChanged, setPrivacyChanged] = useState(false);

//   const handleTabChange = (event, newValue) => {
//     setTabValue(newValue);
//   };

//   const handlePrivacyChange = (field, value) => {
//     setPrivacy({ ...privacy, [field]: value });
//     setPrivacyChanged(true);
//   };

//   const handleSavePrivacy = () => {
//     console.log('Saving privacy settings:', privacy);
//     setPrivacyChanged(false);
//     // Add API call here
//   };

//   const handleDeleteAccount = () => {
//     console.log('Delete account clicked');
//     // Add confirmation dialog and API call
//   };

//   if (!profile) {
//     return <div>Loading...</div>;
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
//   const image = userData.image || '';

//   const formatDate = (date) => {
//     try {
//       return new Date(date).toLocaleString();
//     } catch (e) {
//       return new Date().toLocaleString();
//     }
//   };

//   // Grouped action cards
//   const profileActions = [
//     { icon: <PersonIcon />, title: 'Update Profile', path: '/update-user-profile', color: 'primary' },
//     { icon: <LockIcon />, title: 'Update Password', path: '/update-password', color: 'secondary' }
//   ];

//   const mediaActions = [
//     { icon: <PhotoLibraryIcon />, title: 'Photo Library', path: '/photo-library', color: 'warning' },
//     { icon: <DeleteIcon />, title: 'Deleted Photos', path: '/delete-photo', color: 'warning' },
//     { icon: <VideoLibraryIcon />, title: 'Video Library', path: '/video', color: 'error' },
//     { icon: <DeleteIcon />, title: 'Deleted Videos', path: '/delete-video', color: 'error' },
//     { icon: <MusicIcon />, title: 'Music Library', path: '/music', color: 'success' }
//   ];

//   const productivityTools = [
//     { icon: <CalendarIcon />, title: 'Calendar', path: '/calendar', color: 'info' },
//     { icon: <NotesIcon />, title: 'Notes', path: '/notes', color: 'info' },
//     { icon: <AlarmIcon />, title: 'Reminders', path: '/reminders', color: 'info' },
//     { icon: <CalculateIcon />, title: 'Calculator', path: '/calculator', color: 'info' }
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
//         <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
//           <Button
//             variant="contained"
//             color="primary"
//             startIcon={<ArrowBackIcon />}
//             onClick={() => navigate('/chat')}
//             sx={{
//               borderRadius: '8px',
//               '&:hover': { backgroundColor: 'secondary.main' }
//             }}
//           >
//             Back to Chat
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
//                 to={`/profile/public/${userId}`}
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
//                         <Avatar sx={{ 
//                           width: 32, 
//                           height: 32, 
//                           bgcolor: 'secondary.main',
//                           cursor: 'pointer'
//                         }}>
//                           <PersonIcon fontSize="small" />
//                         </Avatar>
//                       }
//                     >
//                       <Avatar
//                         src={image}
//                         alt={fullName}
//                         sx={{
//                           width: 150,
//                           height: 150,
//                           border: '4px solid',
//                           borderColor: 'secondary.main',
//                           mb: 2
//                         }}
//                       />
//                     </Badge>
//                     <Typography variant="h5" gutterBottom>
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
//       </Box>
//     </ThemeProvider>
//   );
// };

// export default PrivateProfilePage;




//! running Good
// import {
//   ArrowBack as ArrowBackIcon,
//   Favorite as FavoriteIcon,
//   Lock as LockIcon,
//   Payment as PaymentIcon,
//   Person as PersonIcon,
//   ShoppingCart as ShoppingCartIcon,
//   PhotoLibrary as PhotoLibraryIcon,
//   VideoLibrary as VideoLibraryIcon,
//   Delete as DeleteIcon,
//   CalendarToday as CalendarIcon,
//   Notes as NotesIcon,
//   Alarm as AlarmIcon,
//   Calculate as CalculateIcon,
//   MusicNote as MusicIcon,
//   Work as WorkIcon,
//   School as SchoolIcon,
//   Groups as GroupsIcon,
//   Link as LinkIcon,
//   Star as StarIcon
// } from '@mui/icons-material';
// import {
//   Avatar,
//   Box,
//   Button,
//   Card,
//   CardContent,
//   Chip,
//   Divider,
//   Fade,
//   FormControl,
//   Grid,
//   InputLabel,
//   MenuItem,
//   Paper,
//   Select,
//   Typography,
//   Tabs,
//   Tab,
//   Badge
// } from '@mui/material';
// import { ThemeProvider } from '@mui/material/styles';
// import { useState } from 'react';
// import { useSelector } from 'react-redux';
// import { useNavigate } from 'react-router-dom';
// import theme from '../../theme';

// const PrivateProfilePage = () => {
//   const { profile } = useSelector((state) => state.user);
//   const navigate = useNavigate();
//   const [tabValue, setTabValue] = useState(0);
//   const [privacy, setPrivacy] = useState({
//     profileVisibility: 'public',
//     emailVisibility: 'friends',
//     phoneVisibility: 'private'
//   });
//   const [privacyChanged, setPrivacyChanged] = useState(false);

//   const handleTabChange = (event, newValue) => {
//     setTabValue(newValue);
//   };

//   const handlePrivacyChange = (field, value) => {
//     setPrivacy({ ...privacy, [field]: value });
//     setPrivacyChanged(true);
//   };

//   const handleSavePrivacy = () => {
//     console.log('Saving privacy settings:', privacy);
//     setPrivacyChanged(false);
//     // Add API call here
//   };

//   const handleDeleteAccount = () => {
//     console.log('Delete account clicked');
//     // Add confirmation dialog and API call
//   };

//   if (!profile) {
//     return <div>Loading...</div>;
//   }

//   const formatDate = (date) => new Date(date).toLocaleString();

//   // Grouped action cards
//   const profileActions = [
//     { icon: <PersonIcon />, title: 'Update Profile', path: '/update-user-profile', color: 'primary' },
//     { icon: <LockIcon />, title: 'Update Password', path: '/update-password', color: 'secondary' }
//   ];

//   const mediaActions = [
//     { icon: <PhotoLibraryIcon />, title: 'Photo Library', path: '/photo-library', color: 'warning' },
//     { icon: <DeleteIcon />, title: 'Deleted Photos', path: '/delete-photo', color: 'warning' },
//     { icon: <VideoLibraryIcon />, title: 'Video Library', path: '/video', color: 'error' },
//     { icon: <DeleteIcon />, title: 'Deleted Videos', path: '/delete-video', color: 'error' },
//     { icon: <MusicIcon />, title: 'Music Library', path: '/music', color: 'success' }
//   ];

//   const productivityTools = [
//     { icon: <CalendarIcon />, title: 'Calendar', path: '/calendar', color: 'info' },
//     { icon: <NotesIcon />, title: 'Notes', path: '/notes', color: 'info' },
//     { icon: <AlarmIcon />, title: 'Reminders', path: '/reminders', color: 'info' },
//     { icon: <CalculateIcon />, title: 'Calculator', path: '/calculator', color: 'info' }
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
//         <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
//           <Button
//             variant="contained"
//             color="primary"
//             startIcon={<ArrowBackIcon />}
//             onClick={() => navigate('/chat')}
//             sx={{
//               borderRadius: '8px',
//               '&:hover': { backgroundColor: 'secondary.main' }
//             }}
//           >
//             Back to Chat
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
//               <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
//                 <Box sx={{ p: 3, textAlign: 'center' }}>
//                   <Badge
//                     overlap="circular"
//                     anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
//                     badgeContent={
//                       <Avatar sx={{ 
//                         width: 32, 
//                         height: 32, 
//                         bgcolor: 'secondary.main',
//                         cursor: 'pointer'
//                       }}>
//                         <PersonIcon fontSize="small" />
//                       </Avatar>
//                     }
//                   >
//                     <Avatar
//                       src={profile.user.image}
//                       alt={`${profile.user.firstName} ${profile.user.lastName}`}
//                       sx={{
//                         width: 150,
//                         height: 150,
//                         border: '4px solid',
//                         borderColor: 'secondary.main',
//                         mb: 2
//                       }}
//                     />
//                   </Badge>
//                   <Typography variant="h5" gutterBottom>
//                     {profile.user.firstName} {profile.user.lastName}
//                   </Typography>
//                   <Chip 
//                     label={profile.isVerified ? "Verified" : "Not Verified"} 
//                     color={profile.isVerified ? "success" : "default"} 
//                     size="small" 
//                     sx={{ mb: 2 }}
//                   />
                  
//                   <Divider sx={{ my: 2 }} />
                  
//                   <Box sx={{ textAlign: 'left' }}>
//                     <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
//                       <strong>Email:</strong> {profile.user.email}
//                     </Typography>
//                     <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
//                       <strong>Phone:</strong> {profile.user.phone}
//                     </Typography>
//                     <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
//                       <strong>Member since:</strong> {formatDate(profile.user.createdAt)}
//                     </Typography>
//                     <Typography variant="body2" color="text.secondary">
//                       <strong>Last updated:</strong> {formatDate(profile.user.updatedAt)}
//                     </Typography>
//                   </Box>
//                 </Box>
//               </Card>
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
//       </Box>
//     </ThemeProvider>
//   );
// };

// export default PrivateProfilePage;










//! with card
// import {
//   ArrowBack as ArrowBackIcon,
//   Favorite as FavoriteIcon,
//   Lock as LockIcon,
//   Payment as PaymentIcon,
//   Person as PersonIcon,
//   ShoppingCart as ShoppingCartIcon,
// } from '@mui/icons-material';
// import {
//   Avatar,
//   Box,
//   Button,
//   Card,
//   CardContent,
//   Divider,
//   Fade,
//   FormControl,
//   Grid,
//   InputLabel,
//   MenuItem,
//   Paper,
//   Select,
//   Typography,
// } from '@mui/material';
// import { ThemeProvider } from '@mui/material/styles';
// import { useState } from 'react';
// import { useSelector } from 'react-redux';
// import { useNavigate } from 'react-router-dom';
// import theme from '../../theme'; // import your custom theme

// const PrivateProfilePage = () => {
//   const { profile } = useSelector((state) => state.user);
//   const navigate = useNavigate();

//   const [privacy, setPrivacy] = useState({
//     profileVisibility: 'public',
//   });
//   const [privacyChanged, setPrivacyChanged] = useState(false);

//   const handlePrivacyChange = (field, value) => {
//     setPrivacy({ ...privacy, [field]: value });
//     setPrivacyChanged(true);
//   };

//   const handleSavePrivacy = () => {
//     // TODO: send `privacy` data to backend (e.g., via Redux or API call)
//     console.log('Saving privacy settings:', privacy);
//     setPrivacyChanged(false);
//   };

//   const handleDeleteAccount = () => {
//     // TODO: open confirmation dialog and then dispatch account deletion
//     console.log('Delete account clicked');
//   };

//   if (!profile) {
//     return <div>Loading...</div>;
//   }

//   const formatDate = (date) => new Date(date).toLocaleString();

//   return (
//     <ThemeProvider theme={theme}>
//       <Box sx={{ padding: 4, backgroundColor: 'background.default', minHeight: '100vh' }}>
//         {/* Back to Chat Button */}
//         <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 2 }}>
//           <Button
//             variant="contained"
//             color="primary"
//             startIcon={<ArrowBackIcon />}
//             onClick={() => navigate('/chat')}
//             sx={{
//               marginTop: 6,
//               borderRadius: '8px',
//               transition: '0.3s',
//               '&:hover': {
//                 backgroundColor: 'secondary.main',
//                 color: 'white',
//               },
//             }}
//           >
//             Back to Chat
//           </Button>
//         </Box>

//         <Grid container spacing={3} maxWidth="lg" sx={{ marginTop: 4 }}>
//           {/* Profile Card */}
//           <Grid item xs={12} md={4}>
//             <Fade in timeout={1000}>
//               <Card
//                 sx={{
//                   backgroundColor: 'background.paper',
//                   borderRadius: '20px',
//                   boxShadow: 3,
//                   padding: 3,
//                   textAlign: 'center',
//                 }}
//               >
//                 <Avatar
//                   src={profile.user.image}
//                   alt={`${profile.user.firstName} ${profile.user.lastName}`}
//                   sx={{
//                     width: 150,
//                     height: 150,
//                     margin: 'auto',
//                     border: '4px solid',
//                     borderColor: 'secondary.main',
//                     mb: 2,
//                   }}
//                 />
//                 <Typography variant="h4" color="secondary.main">
//                   {profile.user.firstName} {profile.user.lastName}
//                 </Typography>
//                 <Typography color="text.secondary" variant="subtitle1">
//                   ID: {profile.user.id}
//                 </Typography>
//                 <CardContent>
//                   <Typography><strong>Email:</strong> {profile.user.email}</Typography>
//                   <Typography><strong>Phone:</strong> {profile.user.phone}</Typography>
//                   <Typography><strong>Address:</strong> {profile.user.address}</Typography>
//                   <Typography><strong>Created At:</strong> {formatDate(profile.user.createdAt)}</Typography>
//                   <Typography><strong>Updated At:</strong> {formatDate(profile.user.updatedAt)}</Typography>
//                 </CardContent>
//               </Card>
//             </Fade>
//           </Grid>

//           {/* Action Cards + New Sections */}
//           <Grid item xs={12} md={8}>
//             <Grid container spacing={3}>
//               {/* Action Cards */}
//               {[
//                 {
//                   icon: <PersonIcon />,
//                   title: 'Update Profile',
//                   path: '/update-user-profile',
//                   color: 'primary',
//                   delay: 1500,
//                 },
//                 {
//                   icon: <LockIcon />,
//                   title: 'Update Password',
//                   path: '/update-password',
//                   color: 'secondary',
//                   delay: 2000,
//                 },
//                 {
//                   icon: <ShoppingCartIcon />,
//                   title: 'PhotoLibrary',
//                   path: '/photo-library',
//                   color: 'warning',
//                   delay: 2500,
//                 },

//                 {
//                   icon: <ShoppingCartIcon />,
//                   title: 'All Deleted Photo',
//                   path: '/delete-photo',
//                   color: 'warning',
//                   delay: 2500,
//                 },
//                 {
//                   icon: <PaymentIcon />,
//                   title: 'Payment Methods',
//                   path: '/payment-methods',
//                   color: 'info',
//                   delay: 3000,
//                 },
//                 {
//                   icon: <FavoriteIcon />,
//                   title: 'VideoLibrary',
//                   path: '/video',
//                   color: 'error',
//                   delay: 3500,
//                 },

//                   {
//                   icon: <FavoriteIcon />,
//                   title: 'All Deleted Video',
//                   path: '/delete-video',
//                   color: 'error',
//                   delay: 3500,
//                 },
//               ].map(({ icon, title, path, color, delay }, index) => (
//                 <Grid item xs={12} md={6} key={index}>
//                   <Fade in timeout={delay}>
//                     <Paper
//                       elevation={3}
//                       sx={{
//                         padding: 2,
//                         backgroundColor: 'background.paper',
//                         borderRadius: '15px',
//                         transition: 'transform 0.3s ease',
//                         '&:hover': {
//                           transform: 'scale(1.03)',
//                           boxShadow: 6,
//                         },
//                       }}
//                     >
//                       <CardContent>
//                         <Avatar sx={{ bgcolor: `${color}.main`, mb: 2 }}>{icon}</Avatar>
//                         <Typography variant="h6" gutterBottom>{title}</Typography>
//                         <Button
//                           variant="contained"
//                           color={color}
//                           fullWidth
//                           onClick={() => navigate(path)}
//                         >
//                           {title}
//                         </Button>
//                       </CardContent>
//                     </Paper>
//                   </Fade>
//                 </Grid>
//               ))}

//               {/* Privacy Settings */}
//               <Grid item xs={12}>
//                 <Card sx={{ borderRadius: 3 }}>
//                   <CardContent>
//                     <Typography variant="h6" gutterBottom>Privacy Settings</Typography>
//                     <Divider sx={{ mb: 2 }} />
//                     <FormControl fullWidth sx={{ mb: 2 }}>
//                       <InputLabel>Profile Visibility</InputLabel>
//                       <Select
//                         value={privacy.profileVisibility}
//                         onChange={(e) => handlePrivacyChange('profileVisibility', e.target.value)}
//                       >
//                         <MenuItem value="public">Public</MenuItem>
//                         <MenuItem value="friends">Friends Only</MenuItem>
//                         <MenuItem value="private">Private</MenuItem>
//                       </Select>
//                     </FormControl>
//                     <Button
//                       variant="contained"
//                       onClick={handleSavePrivacy}
//                       disabled={!privacyChanged}
//                     >
//                       Save Privacy Settings
//                     </Button>
//                   </CardContent>
//                 </Card>
//               </Grid>

//               {/* Account Management */}
//               <Grid item xs={12}>
//                 <Card sx={{ borderRadius: 3 }}>
//                   <CardContent>
//                     <Typography variant="h6" gutterBottom>Account Management</Typography>
//                     <Divider sx={{ mb: 2 }} />
//                     <Button
//                       variant="outlined"
//                       color="error"
//                       onClick={() => navigate('/update-password')}
//                       sx={{ mr: 2 }}
//                     >
//                       Change Password
//                     </Button>
//                     <Button
//                       variant="outlined"
//                       color="error"
//                       onClick={handleDeleteAccount}
//                     >
//                       Delete Account
//                     </Button>
//                   </CardContent>
//                 </Card>
//               </Grid>
//             </Grid>
//           </Grid>
//         </Grid>
//       </Box>
//     </ThemeProvider>
//   );
// };

// export default PrivateProfilePage;



//! old
// import {
//   ArrowBack as ArrowBackIcon,
//   Favorite as FavoriteIcon,
//   Lock as LockIcon,
//   Payment as PaymentIcon,
//   Person as PersonIcon,
//   ShoppingCart as ShoppingCartIcon,
// } from '@mui/icons-material';
// import {
//   Avatar,
//   Box,
//   Button,
//   Card,
//   CardContent,
//   Fade,
//   Grid,
//   Paper,
//   Typography,
// } from '@mui/material';
// import { ThemeProvider } from '@mui/material/styles';
// import { useSelector } from 'react-redux';
// import { useNavigate } from 'react-router-dom';
// import theme from '../../theme'; // import your custom theme

// const PrivateProfilePage = () => {
//   const { profile } = useSelector((state) => state.user);
//   const navigate = useNavigate();

//   if (!profile) {
//     return <div>Loading...</div>;
//   }

//   // Custom function to format dates
//   const formatDate = (date) => new Date(date).toLocaleString();

//   return (
//     <ThemeProvider theme={theme}>
//       <Box
//         sx={{
//           padding: 4,
//           backgroundColor: 'background.default',
//           minHeight: '100vh',
//         }}
//       >
//         {/* Back to Chat Button */}
//         <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 2 }}>
//           <Button
//             variant="contained" // Changed to contained for more impact
//             color="primary" // Set the button color to primary
//             startIcon={<ArrowBackIcon />}
//             onClick={() => navigate('/chat')}
//             sx={{
//               marginTop: 6,
//               borderRadius: '8px',
//               transition: '0.3s',
//               '&:hover': {
//                 backgroundColor: 'secondary.main', // Optional hover color change
//                 color: 'white',
//               },
//             }}
//           >
//             Back to Chat
//           </Button>
//         </Box>

//         <Grid container spacing={3} maxWidth="lg" sx={{ marginTop: 4 }}>
//           {/* Profile Card */}
//           <Grid item xs={12} md={4}>
//             <Fade in={true} timeout={1000}>
//               <Card
//                 sx={{
//                   backgroundColor: 'background.paper',
//                   borderRadius: '20px',
//                   boxShadow: 3,
//                   padding: 3,
//                   textAlign: 'center',
//                 }}
//               >
//                 <Avatar
//                   src={profile.user.image}
//                   alt={`${profile.user.firstName} ${profile.user.lastName}`}
//                   sx={{
//                     width: 150,
//                     height: 150,
//                     margin: 'auto',
//                     border: '4px solid',
//                     borderColor: 'secondary.main',
//                     mb: 2,
//                   }}
//                 />
//                 <Typography variant="h4" component="div" color="secondary.main">
//                   {profile.user.firstName} {profile.user.lastName}
//                 </Typography>
//                 <Typography color="text.secondary" variant="subtitle1">
//                   ID: {profile.user.id}
//                 </Typography>

//                 <CardContent>
//                   <Typography color="text.primary">
//                     <strong>Email:</strong> {profile.user.email}
//                   </Typography>
//                   <Typography color="text.primary">
//                     <strong>Phone:</strong> {profile.user.phone}
//                   </Typography>
//                   <Typography color="text.primary">
//                     <strong>Address:</strong> {profile.user.address}
//                   </Typography>
//                   <Typography color="text.primary">
//                     <strong>Created At:</strong>{' '}
//                     {formatDate(profile.user.createdAt)}
//                   </Typography>
//                   <Typography color="text.primary">
//                     <strong>Updated At:</strong>{' '}
//                     {formatDate(profile.user.updatedAt)}
//                   </Typography>
//                 </CardContent>
//               </Card>
//             </Fade>
//           </Grid>

//           {/* Actionable Cards */}
//           <Grid item xs={12} md={8}>
//             <Grid container spacing={3}>
//               <Grid item xs={12} md={6}>
//                 <Fade in={true} timeout={1500}>
//                   <Paper
//                     elevation={3}
//                     sx={{
//                       padding: 2,
//                       backgroundColor: 'background.paper',
//                       borderRadius: '15px',
//                       transition: 'transform 0.3s ease',
//                       '&:hover': {
//                         transform: 'scale(1.03)',
//                         boxShadow: 6,
//                       },
//                     }}
//                   >
//                     <CardContent>
//                       <Avatar sx={{ bgcolor: 'primary.main', mb: 2 }}>
//                         <PersonIcon />
//                       </Avatar>
//                       <Typography variant="h6" gutterBottom>
//                         Update Profile
//                       </Typography>
//                       <Button
//                         variant="contained"
//                         color="primary"
//                         fullWidth
//                         onClick={() => navigate('/update-user-profile')}
//                       >
//                         Update Profile
//                       </Button>
//                     </CardContent>
//                   </Paper>
//                 </Fade>
//               </Grid>

//               <Grid item xs={12} md={6}>
//                 <Fade in={true} timeout={2000}>
//                   <Paper
//                     elevation={3}
//                     sx={{
//                       padding: 2,
//                       backgroundColor: 'background.paper',
//                       borderRadius: '15px',
//                       transition: 'transform 0.3s ease',
//                       '&:hover': {
//                         transform: 'scale(1.03)',
//                         boxShadow: 6,
//                       },
//                     }}
//                   >
//                     <CardContent>
//                       <Avatar sx={{ bgcolor: 'secondary.main', mb: 2 }}>
//                         <LockIcon />
//                       </Avatar>
//                       <Typography variant="h6" gutterBottom>
//                         Update Password
//                       </Typography>
//                       <Button
//                         variant="contained"
//                         color="secondary"
//                         fullWidth
//                         onClick={() => navigate('/update-password')}
//                       >
//                         Change Password
//                       </Button>
//                     </CardContent>
//                   </Paper>
//                 </Fade>
//               </Grid>

//               <Grid item xs={12} md={6}>
//                 <Fade in={true} timeout={2500}>
//                   <Paper
//                     elevation={3}
//                     sx={{
//                       padding: 2,
//                       backgroundColor: 'background.paper',
//                       borderRadius: '15px',
//                       transition: 'transform 0.3s ease',
//                       '&:hover': {
//                         transform: 'scale(1.03)',
//                         boxShadow: 6,
//                       },
//                     }}
//                   >
//                     <CardContent>
//                       <Avatar sx={{ bgcolor: 'warning.main', mb: 2 }}>
//                         <ShoppingCartIcon />
//                       </Avatar>
//                       <Typography variant="h6" gutterBottom>
//                         Demo
//                       </Typography>
//                       <Button
//                         variant="contained"
//                         color="warning"
//                         fullWidth
//                         onClick={() => navigate('/demo')}
//                       >
//                         View Demo History
//                       </Button>
//                     </CardContent>
//                   </Paper>
//                 </Fade>
//               </Grid>

//               <Grid item xs={12} md={6}>
//                 <Fade in={true} timeout={3000}>
//                   <Paper
//                     elevation={3}
//                     sx={{
//                       padding: 2,
//                       backgroundColor: 'background.paper',
//                       borderRadius: '15px',
//                       transition: 'transform 0.3s ease',
//                       '&:hover': {
//                         transform: 'scale(1.03)',
//                         boxShadow: 6,
//                       },
//                     }}
//                   >
//                     <CardContent>
//                       <Avatar sx={{ bgcolor: 'info.main', mb: 2 }}>
//                         <PaymentIcon />
//                       </Avatar>
//                       <Typography variant="h6" gutterBottom>
//                         Payment Methods
//                       </Typography>
//                       <Button
//                         variant="contained"
//                         color="info"
//                         fullWidth
//                         onClick={() => navigate('/payment-methods')}
//                       >
//                         Manage Payments
//                       </Button>
//                     </CardContent>
//                   </Paper>
//                 </Fade>
//               </Grid>

//               <Grid item xs={12} md={6}>
//                 <Fade in={true} timeout={3500}>
//                   <Paper
//                     elevation={3}
//                     sx={{
//                       padding: 2,
//                       backgroundColor: 'background.paper',
//                       borderRadius: '15px',
//                       transition: 'transform 0.3s ease',
//                       '&:hover': {
//                         transform: 'scale(1.03)',
//                         boxShadow: 6,
//                       },
//                     }}
//                   >
//                     <CardContent>
//                       <Avatar sx={{ bgcolor: 'error.main', mb: 2 }}>
//                         <FavoriteIcon />
//                       </Avatar>
//                       <Typography variant="h6" gutterBottom>
//                         Demo
//                       </Typography>
//                       <Button
//                         variant="contained"
//                         color="error"
//                         fullWidth
//                         onClick={() => navigate('/demo-1')}
//                       >
//                         View Demo
//                       </Button>
//                     </CardContent>
//                   </Paper>
//                 </Fade>
//               </Grid>
//             </Grid>
//           </Grid>
//         </Grid>
//       </Box>
//     </ThemeProvider>
//   );
// };

// export default PrivateProfilePage;
