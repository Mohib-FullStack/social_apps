//! final
import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { ThemeProvider, useMediaQuery } from '@mui/material'; // Add useMediaQuery here
import { Box, CircularProgress, Paper } from '@mui/material';
import { sendFriendRequest } from '../../../features/friendship/friendshipSlice';
import { showSnackbar } from '../../../features/snackbar/snackbarSlice';
import { fetchAllUsers, fetchUserProfile, logoutUser, updateCoverImage } from '../../../features/user/userSlice';
import theme from '../../../theme';
import ProfileHeader from './ProfileHeader';
import ProfileInfoSection from './ProfileInfoSection';
import ProfileStats from './ProfileStats';
import ProfileTabs from './ProfileTabs';
import DeleteAccountDialog from './DeleteAccountDialog';

const PrivateProfilePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { profile, loading } = useSelector((state) => state.user);
  
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
  const [searchResults, setSearchResults] = useState([]);
  const [searchFocused, setSearchFocused] = useState(false);

  // Fetch profile data
  useEffect(() => {
    dispatch(fetchUserProfile());
  }, [dispatch]);

  // Search effect
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchInput.trim()) {
        dispatch(fetchAllUsers({
          search: searchInput,
          page: 1,
          limit: 5,
          excludeCurrent: true
        }))
        .then((action) => {
          if (action.payload?.users) {
            setSearchResults(action.payload.users);
          }
        });
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [dispatch, searchInput]);

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
      profileImage: data.profileImage || '/default-avatar.png',
      coverImage: data.coverImage || '/default-cover.jpg',
      createdAt: data.createdAt || new Date(),
      updatedAt: data.updatedAt || new Date(),
      postsCount: data.postsCount || 0,
      friendsCount: data.friendsCount || 0,
      viewsCount: data.viewsCount || 0,
      isCurrentUser: data.isCurrentUser || true
    };
  }, [profile]);

  // Handler functions
  const handleSearchChange = (value) => {
    setSearchInput(value);
  };

  const handleSearchFocus = () => {
    setSearchFocused(true);
  };

  const handleSearchBlur = () => {
    setTimeout(() => setSearchFocused(false), 200);
  };

  const handleResultClick = () => {
    setSearchInput('');
    setSearchFocused(false);
  };

  const handleAddFriend = async () => {
    try {
      await dispatch(sendFriendRequest({ targetUserId: userData.id })).unwrap();
      dispatch(showSnackbar({
        message: 'Friend request sent successfully!',
        severity: 'success'
      }));
    } catch (error) {
      dispatch(showSnackbar({
        message: error?.message || 'Failed to send friend request',
        severity: 'warning'
      }));
    }
  };

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
      e.target.value = '';
    }
  };

  const handleProfilePhotoEdit = () => {
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
     
        {/* Profile Content */}
        <ProfileHeader
          userData={userData}
          isMobile={isMobile}
          navigate={navigate}
          onCoverPhotoEdit={handleCoverPhotoEdit}
          onProfilePhotoEdit={handleProfilePhotoEdit}
          coverImageLoading={coverImageLoading}
          handleAddFriend={handleAddFriend}
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






//! Final
// import {
//   ArrowBack,
//   Cake,
//   CameraAlt,
//   Close,
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
//   PersonAdd,
//   PhotoLibrary,
//   PostAdd,
//   School,
//   Search,
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
//   InputBase,
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
// import { sendFriendRequest } from '../../features/friendship/friendshipSlice';
// import { showSnackbar } from '../../features/snackbar/snackbarSlice';
// import { fetchAllUsers, fetchUserProfile, logoutUser, updateCoverImage } from '../../features/user/userSlice';
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

// const ActionCard = ({ icon, title, path, color, navigate, onClick }) => (
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
//       onClick={onClick ? onClick : () => navigate(path)}
//       size="small"
//       sx={{ mt: 'auto' }}
//     >
//       {onClick ? 'Action' : 'Open'}
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

// const SearchBar = ({ value, onChange, onFocus, onBlur }) => {
//   return (
//     <Paper
//       component="form"
//       sx={{
//         p: '2px 4px',
//         display: 'flex',
//         alignItems: 'center',
//         width: '100%',
//         maxWidth: 600,
//         borderRadius: 4,
//         boxShadow: 2
//       }}
//     >
//       <IconButton sx={{ p: '10px' }} aria-label="search">
//         <Search />
//       </IconButton>
//       <InputBase
//         sx={{ ml: 1, flex: 1 }}
//         placeholder="Search users..."
//         inputProps={{ 'aria-label': 'search users' }}
//         value={value}
//         onChange={(e) => onChange(e.target.value)}
//         onFocus={onFocus}
//         onBlur={onBlur}
//       />
//       {value && (
//         <IconButton onClick={() => onChange('')} sx={{ p: '10px' }}>
//           <Close />
//         </IconButton>
//       )}
//     </Paper>
//   );
// };

// const UserSearchResults = ({ results, onResultClick }) => {
//   const navigate = useNavigate();

//   const handleClick = (userId) => {
//     onResultClick();
//     navigate(`/profile/public/${userId}`);
//   };

//   return (
//     <Box>
//       {results.map((user) => (
//         <Box 
//           key={user._id} 
//           sx={{ 
//             p: 2, 
//             display: 'flex', 
//             alignItems: 'center', 
//             cursor: 'pointer',
//             '&:hover': { 
//               bgcolor: 'action.hover' 
//             }
//           }}
//           onClick={() => handleClick(user._id)}
//         >
//           <Avatar 
//             src={user.profileImage || DEFAULT_PROFILE_IMAGE} 
//             sx={{ width: 40, height: 40, mr: 2 }}
//           />
//           <Box>
//             <Typography variant="subtitle1">
//               {user.firstName} {user.lastName}
//             </Typography>
//             <Typography variant="body2" color="text.secondary">
//               {user.email}
//             </Typography>
//           </Box>
//         </Box>
//       ))}
//     </Box>
//   );
// };

// const ProfileHeader = ({ 
//   userData, 
//   isMobile, 
//   navigate,
//   onCoverPhotoEdit,
//   onProfilePhotoEdit,
//   coverImageLoading,
//   handleAddFriend
// }) => {
//   return (
//     <Box sx={{ 
//       position: 'relative', 
//       width: '100%', 
//       height: isMobile ? '45vh' : '55vh',
//       maxHeight: 500,
//       bgcolor: 'grey.200',
//       overflow: 'hidden',
//       mt: 8
//     }}>
//       {/* Cover Photo */}
//       {coverImageLoading ? (
//         <Box sx={{
//           width: '100%',
//           height: '100%',
//           display: 'flex',
//           justifyContent: 'center',
//           alignItems: 'center',
//           bgcolor: 'background.paper'
//         }}>
//           <CircularProgress size={60} />
//         </Box>
//       ) : (
//         <Box
//           component="img"
//           src={userData.coverImage}
//           alt={`${userData.fullName}'s cover`}
//           sx={{
//             width: '100%',
//             height: '100%',
//             objectFit: 'cover',
//             objectPosition: 'center'
//           }}
//         />
//       )}
      
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
//         component="label"
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
//         <input
//           hidden
//           accept="image/*"
//           type="file"
//           onChange={onCoverPhotoEdit}
//         />
//         <CameraAlt />
//       </IconButton>
      
//       {/* Profile Image */}
//       <Box sx={{
//         position: 'absolute',
//         left: isMobile ? '50%' : 32,
//         bottom: isMobile ? -80 : -100,
//         transform: isMobile ? 'translateX(-50%)' : 'none',
//         zIndex: 2,
//         mb: 12
//       }}>
//         <Badge
//           overlap="circular"
//           anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
//           badgeContent={
//             <IconButton
//               component="label"
//               sx={{
//                 bgcolor: 'primary.main',
//                 color: 'common.white',
//                 '&:hover': {
//                   bgcolor: 'primary.dark'
//                 }
//               }}
//             >
//               <input
//                 hidden
//                 accept="image/*"
//                 type="file"
//                 onChange={onProfilePhotoEdit}
//               />
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

//       {/* Add Friend Button */}
//       {!userData.isCurrentUser && (
//         <Button
//           variant="contained"
//           color="primary"
//           startIcon={<PersonAdd />}
//           onClick={handleAddFriend}
//           sx={{
//             position: 'absolute',
//             bottom: isMobile ? 16 : 32,
//             right: 32,
//             zIndex: 2
//           }}
//         >
//           Add Friend
//         </Button>
//       )}
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
//   const { profile, loading, status } = useSelector((state) => state.user);
  
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
//   const [searchResults, setSearchResults] = useState([]);
//   const [searchFocused, setSearchFocused] = useState(false);

//   // Fetch profile data
//   useEffect(() => {
//     dispatch(fetchUserProfile());
//   }, [dispatch]);

//   // Search effect
//   useEffect(() => {
//     const delayDebounceFn = setTimeout(() => {
//       if (searchInput.trim()) {
//         dispatch(fetchAllUsers({
//           search: searchInput,
//           page: 1,
//           limit: 5,
//           excludeCurrent: true
//         }))
//         .then((action) => {
//           if (action.payload?.users) {
//             setSearchResults(action.payload.users);
//           }
//         });
//       } else {
//         setSearchResults([]);
//       }
//     }, 300);

//     return () => clearTimeout(delayDebounceFn);
//   }, [dispatch, searchInput]);

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
//       viewsCount: data.viewsCount || 0,
//       isCurrentUser: data.isCurrentUser || true
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

//   // Handler functions
//   const handleSearchChange = (value) => {
//     setSearchInput(value);
//   };

//   const handleSearchFocus = () => {
//     setSearchFocused(true);
//   };

//   const handleSearchBlur = () => {
//     setTimeout(() => setSearchFocused(false), 200);
//   };

//   const handleResultClick = () => {
//     setSearchInput('');
//     setSearchFocused(false);
//   };

//   const handleAddFriend = async () => {
//     try {
//       await dispatch(sendFriendRequest({ targetUserId: userData.id })).unwrap();
      
//       dispatch(showSnackbar({
//         message: 'Friend request sent successfully!',
//         severity: 'success'
//       }));
//     } catch (error) {
//       const friendlyMessage = error?.message || 'Failed to send friend request';
//       dispatch(showSnackbar({
//         message: friendlyMessage,
//         severity: 'warning'
//       }));
//     }
//   };

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

//   const handleCoverPhotoEdit = async (e) => {
//     const file = e.target.files[0];
//     if (!file) return;

//     if (!file.type.match('image.*')) {
//       dispatch(showSnackbar({
//         message: 'Only image files are allowed',
//         severity: 'error'
//       }));
//       return;
//     }

//     if (file.size > 5 * 1024 * 1024) {
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
//         message: 'Cover image updated successfully',
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
//   };

//   const handleProfilePhotoEdit = (e) => {
//     navigate('/my-profile-update');
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
//         {/* Search Bar Section */}
//         <Box sx={{ 
//           position: 'sticky', 
//           top: 0, 
//           zIndex: 1100, 
//           bgcolor: 'background.paper',
//           p: 2,
//           boxShadow: 1,
//           display: 'flex',
//           justifyContent: 'center'
//         }}>
//           <Box sx={{ width: '100%', maxWidth: 800, position: 'relative' }}>
//             <SearchBar 
//               value={searchInput}
//               onChange={handleSearchChange}
//               onFocus={handleSearchFocus}
//               onBlur={handleSearchBlur}
//             />
//             {searchFocused && searchResults.length > 0 && (
//               <Paper sx={{
//                 position: 'absolute',
//                 top: '100%',
//                 left: 0,
//                 right: 0,
//                 zIndex: 1200,
//                 mt: 1,
//                 maxHeight: 300,
//                 overflow: 'auto'
//               }}>
//                 <UserSearchResults 
//                   results={searchResults} 
//                   onResultClick={handleResultClick}
//                 />
//               </Paper>
//             )}
//           </Box>
//         </Box>

//         {/* Profile Content */}
//         <ProfileHeader
//           userData={userData}
//           isMobile={isMobile}
//           navigate={navigate}
//           onCoverPhotoEdit={handleCoverPhotoEdit}
//           onProfilePhotoEdit={handleProfilePhotoEdit}
//           coverImageLoading={coverImageLoading}
//           handleAddFriend={handleAddFriend}
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











