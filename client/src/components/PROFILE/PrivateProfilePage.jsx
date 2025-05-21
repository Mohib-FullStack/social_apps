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










