//! curent
import {
  Alarm as AlarmIcon,
  ArrowBack as ArrowBackIcon,
  Calculate as CalculateIcon,
  CalendarToday as CalendarIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Groups as GroupsIcon,
  Link as LinkIcon,
  Lock as LockIcon,
  MusicNote as MusicIcon,
  Notes as NotesIcon,
  Person as PersonIcon,
  PhotoLibrary as PhotoLibraryIcon,
  School as SchoolIcon,
  VideoLibrary as VideoLibraryIcon,
  Work as WorkIcon
} from '@mui/icons-material';
import {
  Avatar,
  Badge,
  Box,
  Button,
  Card,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Fade,
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
  Typography
} from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { showSnackbar } from '../../features/snackbar/snackbarSlice';
import { fetchUserProfile, logoutUser } from '../../features/user/userSlice';
import theme from '../../theme';

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
    { icon: <PersonIcon />, title: 'Update Profile', path: '/my-profile-update', color: 'primary' },
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
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3,mt:8 }}>
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
                          to="/my-profile-update"
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









