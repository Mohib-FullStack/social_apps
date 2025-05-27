/**
 * PRIVATE PROFILE PAGE COMPONENT - REFACTORED
 * Enhanced with better error handling, safer data access, and improved structure
 */

import { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { ThemeProvider, useMediaQuery, ClickAwayListener } from '@mui/material';
import { Box, CircularProgress, Button } from '@mui/material';
import theme from '../../../theme';

// Redux actions
import { sendFriendRequest } from '../../../features/friendship/friendshipSlice';
import { showSnackbar } from '../../../features/snackbar/snackbarSlice';
import {
  fetchAllUsers,
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
import SearchBar from '../../SearchBar/SearchBar';
import UserSearchResults from '../../SearchBar/UserSearchResults';

// Constants
const DEFAULT_PROFILE_IMAGE = '/default-avatar.png';
const DEFAULT_COVER_IMAGE = '/default-cover.jpg';

const PrivateProfilePage = () => {
  // ====================== INITIALIZATION ======================
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { profile, loading } = useSelector((state) => state.user);

  // ====================== STATE MANAGEMENT ======================
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
  const [openDropdown, setOpenDropdown] = useState(false);

  // ====================== DERIVED VALUES ======================
  const userId = useMemo(() => {
    return profile?.user?.id || profile?.id || 'me';
  }, [profile]);

  const userData = useMemo(() => {
    const data = profile?.user || profile || {};
    return {
      id: userId,
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
      viewsCount: data.viewsCount || 0,
      isCurrentUser: true // Always true for private profile
    };
  }, [profile, userId]);

  // ====================== EFFECTS ======================
  useEffect(() => {
    dispatch(fetchUserProfile());
  }, [dispatch]);

  useEffect(() => {
    const searchUsers = async () => {
      if (!searchInput.trim()) {
        setSearchResults([]);
        setOpenDropdown(false);
        return;
      }

      try {
        const action = await dispatch(fetchAllUsers({
          search: searchInput,
          page: 1,
          limit: 5,
          excludeCurrent: true,
        }));
        
        const filteredResults = (action.payload?.users || [])
          .filter(user => user._id !== userId);
        
        setSearchResults(filteredResults);
        setOpenDropdown(filteredResults.length > 0);
      } catch (error) {
        console.error('Search failed:', error);
        setSearchResults([]);
        setOpenDropdown(false);
      }
    };

    const debounceTimer = setTimeout(searchUsers, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchInput, dispatch, userId]);

  // ====================== UTILITY FUNCTIONS ======================
  const formatDate = (dateString) => {
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
  };

  // ====================== EVENT HANDLERS ======================
  const handleSearchResultClick = (userId) => {
    setSearchInput('');
    setOpenDropdown(false);
    navigate(`/profile/public/${userId}`);
  };

  const handleAddFriend = async () => {
    try {
      await dispatch(sendFriendRequest({ targetUserId: userId })).unwrap();
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

  const handlePrivacyUpdate = (field, value) => {
    setPrivacy(prev => ({ ...prev, [field]: value }));
    setPrivacyChanged(true);
  };

  const handleCoverPhotoUpdate = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validation
    if (!file.type.startsWith('image/')) {
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

  const handleProfileNavigation = () => navigate('/my-profile-update');
  const handlePublicPreview = () => navigate(`/profile/public/${userId}`);

  // ====================== RENDER LOGIC ======================
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

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{
        backgroundColor: 'background.default',
        minHeight: '100vh',
        pb: 6
      }}>
        {/* Profile Header */}
        <ProfileHeader
          userData={userData}
          isMobile={isMobile}
          onCoverPhotoEdit={handleCoverPhotoUpdate}
          onProfilePhotoEdit={handleProfileNavigation}
          coverImageLoading={coverImageLoading}
        />

        {/* Public Preview Button */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <Button
            variant="contained"
            color="secondary"
            onClick={handlePublicPreview}
            sx={{
              borderRadius: '20px',
              boxShadow: 2,
              '&:hover': {
                boxShadow: 4,
                transform: 'translateY(-2px)'
              }
            }}
          >
            Preview Public Profile
          </Button>
        </Box>

        {/* Enhanced Search */}
        <ClickAwayListener onClickAway={() => setOpenDropdown(false)}>
          <Box sx={{
            p: 2,
            position: 'relative',
            width: '100%',
            maxWidth: 600,
            mx: 'auto'
          }}>
            <SearchBar
              value={searchInput}
              onChange={setSearchInput}
              onFocus={() => searchResults.length && setOpenDropdown(true)}
            />

            {openDropdown && (
              <UserSearchResults
                results={searchResults}
                onResultClick={handleSearchResultClick}
              />
            )}
          </Box>
        </ClickAwayListener>

        {/* Profile Sections */}
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

          <ProfileTabs
            tabValue={tabValue}
            handleTabChange={(_, val) => setTabValue(val)}
            privacy={privacy}
            privacyChanged={privacyChanged}
            handlePrivacyChange={handlePrivacyUpdate}
            onSavePrivacy={() => {
              dispatch(showSnackbar({
                message: 'Privacy settings saved',
                severity: 'success'
              }));
              setPrivacyChanged(false);
            }}
            onDeleteAccount={() => setDeleteDialogOpen(true)}
            userData={userData}
            formatDate={formatDate}
          />
        </Box>

        {/* Delete Account Dialog */}
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




//! Final
// /**
//  * PRIVATE PROFILE PAGE COMPONENT
//  * Displays the authenticated user's profile with editing capabilities
//  * Includes: Profile header, info section, stats, privacy controls, and enhanced search functionality
//  */

// import { useState, useEffect, useMemo } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { useNavigate } from 'react-router-dom';
// import { ThemeProvider, useMediaQuery, ClickAwayListener } from '@mui/material';
// import { Box, CircularProgress, Button } from '@mui/material';
// import theme from '../../../theme';

// // Redux actions
// import { sendFriendRequest } from '../../../features/friendship/friendshipSlice';
// import { showSnackbar } from '../../../features/snackbar/snackbarSlice';
// import {
//   fetchAllUsers,
//   fetchUserProfile,
//   logoutUser,
//   updateCoverImage
// } from '../../../features/user/userSlice';

// // Components
// import ProfileHeader from './ProfileHeader';
// import ProfileInfoSection from './ProfileInfoSection';
// import ProfileStats from './ProfileStats';
// import ProfileTabs from './ProfileTabs';
// import DeleteAccountDialog from './DeleteAccountDialog';
// import SearchBar from '../../SearchBar/SearchBar';
// import UserSearchResults from '../../SearchBar/UserSearchResults';

// const PrivateProfilePage = () => {
//   // ====================== INITIALIZATION ======================
//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
//   const { profile, loading } = useSelector((state) => state.user);

//   // ====================== STATE MANAGEMENT ======================
//   const [tabValue, setTabValue] = useState(0);
//   const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
//   const [coverImageLoading, setCoverImageLoading] = useState(false);
//   const [privacy, setPrivacy] = useState({
//     profileVisibility: 'public',
//     emailVisibility: 'friends',
//     phoneVisibility: 'private'
//   });
//   const [privacyChanged, setPrivacyChanged] = useState(false);
  
//   // Enhanced search state
//   const [searchInput, setSearchInput] = useState('');
//   const [searchResults, setSearchResults] = useState([]);
//   const [openDropdown, setOpenDropdown] = useState(false);

//   // ====================== DATA FETCHING ======================
//   useEffect(() => {
//     dispatch(fetchUserProfile());
//   }, [dispatch]);

//   // Enhanced search with debounce and filtering
//   useEffect(() => {
//     const timeout = setTimeout(() => {
//       if (searchInput.trim()) {
//         dispatch(fetchAllUsers({
//           search: searchInput,
//           page: 1,
//           limit: 5,
//           excludeCurrent: true,
//         })).then((action) => {
//           const meId = profile?.user?._id || profile?.user?.id || profile?._id;
//           const filtered = (action.payload?.users || []).filter(u => u._id !== meId);
//           setSearchResults(filtered);
//           setOpenDropdown(filtered.length > 0);
//         });
//       } else {
//         setSearchResults([]);
//         setOpenDropdown(false);
//       }
//     }, 300);

//     return () => clearTimeout(timeout);
//   }, [searchInput, dispatch, profile]);

//   // ====================== DATA TRANSFORMATION ======================
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
//       profileImage: data.profileImage || '/default-avatar.png',
//       coverImage: data.coverImage || '/default-cover.jpg',
//       createdAt: data.createdAt || new Date(),
//       updatedAt: data.updatedAt || new Date(),
//       postsCount: data.postsCount || 0,
//       friendsCount: data.friendsCount || 0,
//       viewsCount: data.viewsCount || 0,
//       isCurrentUser: data.isCurrentUser || true
//     };
//   }, [profile]);

//   // ====================== UTILITY FUNCTIONS ======================
//   const formatDate = (date) => {
//     try {
//       return new Date(date).toLocaleDateString('en-US', {
//         year: 'numeric',
//         month: 'long',
//         day: 'numeric'
//       });
//     } catch {
//       return 'Unknown date';
//     }
//   };

//   // ====================== EVENT HANDLERS ======================
//   const handleResultClick = (userId) => {
//     setSearchInput('');
//     setOpenDropdown(false);
//     navigate(`/profile/public/${userId}`);
//   };

//   const handleAddFriend = async () => {
//     try {
//       await dispatch(sendFriendRequest({ targetUserId: userData.id })).unwrap();
//       dispatch(showSnackbar({ 
//         message: 'Friend request sent successfully!', 
//         severity: 'success' 
//       }));
//     } catch (error) {
//       dispatch(showSnackbar({ 
//         message: error?.message || 'Failed to send friend request', 
//         severity: 'warning' 
//       }));
//     }
//   };

//   const handleTabChange = (_, newValue) => setTabValue(newValue);

//   const handlePrivacyChange = (field, value) => {
//     setPrivacy((prev) => ({ ...prev, [field]: value }));
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

//   const handleProfilePhotoEdit = () => navigate('/my-profile-update');
  
//   const handlePreviewPublicProfile = () => {
//     const userId = profile?.user?.id || profile?.id;
//     if (userId) {
//       navigate(`/profile/public/${userId}`);
//     } else {
//       console.error('No user ID available for public profile');
//       dispatch(showSnackbar({
//         message: 'Unable to preview public profile',
//         severity: 'error'
//       }));
//     }
//   };

//   // ====================== RENDER LOGIC ======================
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
//         <ProfileHeader
//           userData={userData}
//           isMobile={isMobile}
//           onCoverPhotoEdit={handleCoverPhotoEdit}
//           onProfilePhotoEdit={handleProfilePhotoEdit}
//           coverImageLoading={coverImageLoading}
//           handleAddFriend={handleAddFriend}
//         />

//         <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
//           <Button
//             variant="contained"
//             color="secondary"
//             onClick={handlePreviewPublicProfile}
//             sx={{
//               borderRadius: '20px',
//               boxShadow: 2,
//               '&:hover': {
//                 boxShadow: 4,
//                 transform: 'translateY(-2px)'
//               }
//             }}
//           >
//             Preview Public Profile
//           </Button>
//         </Box>

//         {/* Enhanced Search Section */}
//         <ClickAwayListener onClickAway={() => setOpenDropdown(false)}>
//           <Box sx={{ 
//             p: 2, 
//             position: 'relative',
//             width: '100%',
//             maxWidth: 600,
//             mx: 'auto'
//           }}>
//             <SearchBar
//               value={searchInput}
//               onChange={setSearchInput}
//               onFocus={() => { if (searchResults.length) setOpenDropdown(true); }}
//             />

//             {openDropdown && (
//               <UserSearchResults
//                 results={searchResults}
//                 onResultClick={handleResultClick}
//               />
//             )}
//           </Box>
//         </ClickAwayListener>

//         <ProfileInfoSection
//           userData={userData}
//           isMobile={isMobile}
//           formatDate={formatDate}
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
//             privacy={privacy}
//             privacyChanged={privacyChanged}
//             handlePrivacyChange={handlePrivacyChange}
//             handleSavePrivacy={handleSavePrivacy}
//             handleDeleteAccount={handleDeleteAccount}
//             navigate={navigate}
//             userData={userData}
//             formatDate={formatDate}
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


//! curent
// /**
//  * PRIVATE PROFILE PAGE COMPONENT
//  * Displays the authenticated user's profile with editing capabilities
//  * Includes: Profile header, info section, stats, privacy controls, and enhanced search functionality
//  */

// import { useState, useEffect, useMemo } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { useNavigate } from 'react-router-dom';
// import { ThemeProvider, useMediaQuery, ClickAwayListener } from '@mui/material';
// import { Box, CircularProgress, Button } from '@mui/material';
// import theme from '../../../theme';

// // Redux actions
// import { sendFriendRequest } from '../../../features/friendship/friendshipSlice';
// import { showSnackbar } from '../../../features/snackbar/snackbarSlice';
// import {
//   fetchAllUsers,
//   fetchUserProfile,
//   logoutUser,
//   updateCoverImage
// } from '../../../features/user/userSlice';

// // Components
// import ProfileHeader from './ProfileHeader';
// import ProfileInfoSection from './ProfileInfoSection';
// import ProfileStats from './ProfileStats';
// import ProfileTabs from './ProfileTabs';
// import DeleteAccountDialog from './DeleteAccountDialog';
// import SearchBar from '../../SearchBar/SearchBar';
// import UserSearchResults from '../../SearchBar/UserSearchResults';


// const PrivateProfilePage = () => {
//   // ====================== INITIALIZATION ======================
//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
//   const { profile, loading } = useSelector((state) => state.user);

//   // ====================== STATE MANAGEMENT ======================
//   const [tabValue, setTabValue] = useState(0);
//   const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
//   const [coverImageLoading, setCoverImageLoading] = useState(false);
//   const [privacy, setPrivacy] = useState({
//     profileVisibility: 'public',
//     emailVisibility: 'friends',
//     phoneVisibility: 'private'
//   });
//   const [privacyChanged, setPrivacyChanged] = useState(false);
  
//   // Enhanced search state
//   const [searchInput, setSearchInput] = useState('');
//   const [searchResults, setSearchResults] = useState([]);
//   const [openDropdown, setOpenDropdown] = useState(false);

//   // ====================== DATA FETCHING ======================
//   useEffect(() => {
//     dispatch(fetchUserProfile());
//   }, [dispatch]);

//   // Enhanced search with debounce and filtering
//   useEffect(() => {
//     const timeout = setTimeout(() => {
//       if (searchInput.trim()) {
//         dispatch(fetchAllUsers({
//           search: searchInput,
//           page: 1,
//           limit: 5,
//           excludeCurrent: true,
//         })).then((action) => {
//           // Additional client-side filtering
//           const meId = profile?.user?._id || profile?.user?.id || profile?._id;
//           const filtered = (action.payload?.users || []).filter(u => u._id !== meId);
//           setSearchResults(filtered);
//           setOpenDropdown(filtered.length > 0);
//         });
//       } else {
//         setSearchResults([]);
//         setOpenDropdown(false);
//       }
//     }, 300);

//     return () => clearTimeout(timeout);
//   }, [searchInput, dispatch, profile]);

//   // ====================== DATA TRANSFORMATION ======================
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
//       profileImage: data.profileImage || '/default-avatar.png',
//       coverImage: data.coverImage || '/default-cover.jpg',
//       createdAt: data.createdAt || new Date(),
//       updatedAt: data.updatedAt || new Date(),
//       postsCount: data.postsCount || 0,
//       friendsCount: data.friendsCount || 0,
//       viewsCount: data.viewsCount || 0,
//       isCurrentUser: data.isCurrentUser || true
//     };
//   }, [profile]);

//   // ====================== UTILITY FUNCTIONS ======================
//   const formatDate = (date) => {
//     try {
//       return new Date(date).toLocaleDateString('en-US', {
//         year: 'numeric',
//         month: 'long',
//         day: 'numeric'
//       });
//     } catch {
//       return 'Unknown date';
//     }
//   };

//   // ====================== EVENT HANDLERS ======================
//   const handleResultClick = (userId) => {
//     setSearchInput('');
//     setOpenDropdown(false);
//     navigate(`/profile/public/${userId}`);
//   };

//   const handleAddFriend = async () => {
//     try {
//       await dispatch(sendFriendRequest({ targetUserId: userData.id })).unwrap();
//       dispatch(showSnackbar({ 
//         message: 'Friend request sent successfully!', 
//         severity: 'success' 
//       }));
//     } catch (error) {
//       dispatch(showSnackbar({ 
//         message: error?.message || 'Failed to send friend request', 
//         severity: 'warning' 
//       }));
//     }
//   };

//   const handleTabChange = (_, newValue) => setTabValue(newValue);

//   const handlePrivacyChange = (field, value) => {
//     setPrivacy((prev) => ({ ...prev, [field]: value }));
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

//   const handleProfilePhotoEdit = () => navigate('/my-profile-update');
//   const handlePreviewPublicProfile = () => navigate(`/profile/public/${userData.id}`);

//   // ====================== RENDER LOGIC ======================
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
//         <ProfileHeader
//           userData={userData}
//           isMobile={isMobile}
//           onCoverPhotoEdit={handleCoverPhotoEdit}
//           onProfilePhotoEdit={handleProfilePhotoEdit}
//           coverImageLoading={coverImageLoading}
//           handleAddFriend={handleAddFriend}
//         />

//         <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
//           <Button
//             variant="contained"
//             color="secondary"
//             onClick={handlePreviewPublicProfile}
//             sx={{
//               borderRadius: '20px',
//               boxShadow: 2,
//               '&:hover': {
//                 boxShadow: 4,
//                 transform: 'translateY(-2px)'
//               }
//             }}
//           >
//             Preview Public Profile
//           </Button>
//         </Box>

//         {/* Enhanced Search Section */}
//         <ClickAwayListener onClickAway={() => setOpenDropdown(false)}>
//           <Box sx={{ 
//             p: 2, 
//             position: 'relative',
//             width: '100%',
//             maxWidth: 600,
//             mx: 'auto'
//           }}>
//             <SearchBar
//               value={searchInput}
//               onChange={setSearchInput}
//               onFocus={() => { if (searchResults.length) setOpenDropdown(true); }}
//             />

//             {openDropdown && (
//               <UserSearchResults
//                 results={searchResults}
//                 onResultClick={handleResultClick}
//               />
//             )}
//           </Box>
//         </ClickAwayListener>

//         <ProfileInfoSection
//           userData={userData}
//           isMobile={isMobile}
//           formatDate={formatDate}
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
//             privacy={privacy}
//             privacyChanged={privacyChanged}
//             handlePrivacyChange={handlePrivacyChange}
//             handleSavePrivacy={handleSavePrivacy}
//             handleDeleteAccount={handleDeleteAccount}
//             navigate={navigate}
//             userData={userData}
//             formatDate={formatDate}
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




//! final
// import { useEffect, useMemo, useState } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { useNavigate } from 'react-router-dom';
// import { ThemeProvider, useMediaQuery } from '@mui/material';
// import {
//   Box,
//   CircularProgress,
//   Button
// } from '@mui/material';
// import { sendFriendRequest } from '../../../features/friendship/friendshipSlice';
// import { showSnackbar } from '../../../features/snackbar/snackbarSlice';
// import {
//   fetchAllUsers,
//   fetchUserProfile,
//   logoutUser,
//   updateCoverImage
// } from '../../../features/user/userSlice';
// import theme from '../../../theme';
// import ProfileHeader from './ProfileHeader';
// import ProfileInfoSection from './ProfileInfoSection';
// import ProfileStats from './ProfileStats';
// import ProfileTabs from './ProfileTabs';
// import DeleteAccountDialog from './DeleteAccountDialog';

// const PrivateProfilePage = () => {
//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
//   const { profile, loading } = useSelector((state) => state.user);

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

//   useEffect(() => {
//     dispatch(fetchUserProfile());
//   }, [dispatch]);

//   useEffect(() => {
//     const delayDebounce = setTimeout(() => {
//       if (searchInput.trim()) {
//         dispatch(fetchAllUsers({ search: searchInput, page: 1, limit: 5, excludeCurrent: true }))
//           .then((action) => {
//             if (action.payload?.users) setSearchResults(action.payload.users);
//           });
//       } else {
//         setSearchResults([]);
//       }
//     }, 300);
//     return () => clearTimeout(delayDebounce);
//   }, [dispatch, searchInput]);

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
//       profileImage: data.profileImage || '/default-avatar.png',
//       coverImage: data.coverImage || '/default-cover.jpg',
//       createdAt: data.createdAt || new Date(),
//       updatedAt: data.updatedAt || new Date(),
//       postsCount: data.postsCount || 0,
//       friendsCount: data.friendsCount || 0,
//       viewsCount: data.viewsCount || 0,
//       isCurrentUser: data.isCurrentUser || true
//     };
//   }, [profile]);

//   const formatDate = (date) => {
//     try {
//       return new Date(date).toLocaleDateString('en-US', {
//         year: 'numeric',
//         month: 'long',
//         day: 'numeric'
//       });
//     } catch {
//       return 'Unknown date';
//     }
//   };

//   const handleAddFriend = async () => {
//     try {
//       await dispatch(sendFriendRequest({ targetUserId: userData.id })).unwrap();
//       dispatch(showSnackbar({ message: 'Friend request sent successfully!', severity: 'success' }));
//     } catch (error) {
//       dispatch(showSnackbar({ message: error?.message || 'Failed to send friend request', severity: 'warning' }));
//     }
//   };

//   const handleTabChange = (_, newValue) => setTabValue(newValue);

//   const handlePrivacyChange = (field, value) => {
//     setPrivacy((prev) => ({ ...prev, [field]: value }));
//     setPrivacyChanged(true);
//   };

//   const handleSavePrivacy = () => {
//     dispatch(showSnackbar({ message: 'Privacy settings saved successfully', severity: 'success' }));
//     setPrivacyChanged(false);
//   };

//   const handleDeleteAccount = () => setDeleteDialogOpen(true);
//   const confirmDeleteAccount = () => {
//     dispatch(logoutUser());
//     dispatch(showSnackbar({ message: 'Account deleted successfully', severity: 'success' }));
//     navigate('/');
//     setDeleteDialogOpen(false);
//   };
//   const cancelDeleteAccount = () => setDeleteDialogOpen(false);

//   const handleCoverPhotoEdit = async (e) => {
//     const file = e.target.files[0];
//     if (!file) return;

//     if (!file.type.match('image.*')) {
//       dispatch(showSnackbar({ message: 'Only image files are allowed', severity: 'error' }));
//       return;
//     }
//     if (file.size > 5 * 1024 * 1024) {
//       dispatch(showSnackbar({ message: 'Image size must be less than 5MB', severity: 'error' }));
//       return;
//     }

//     setCoverImageLoading(true);
//     try {
//       const formData = new FormData();
//       formData.append('coverImage', file);
//       await dispatch(updateCoverImage(formData)).unwrap();
//       dispatch(showSnackbar({ message: 'Cover image updated successfully', severity: 'success' }));
//       await dispatch(fetchUserProfile());
//     } catch (error) {
//       dispatch(showSnackbar({ message: error.message || 'Failed to update cover image', severity: 'error' }));
//     } finally {
//       setCoverImageLoading(false);
//       e.target.value = '';
//     }
//   };

//   const handleProfilePhotoEdit = () => navigate('/my-profile-update');
//   const handlePreviewPublicProfile = () => navigate(`/profile/public/${userData.id}`);

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
//         <ProfileHeader
//           userData={userData}
//           isMobile={isMobile}
//           navigate={navigate}
//           onCoverPhotoEdit={handleCoverPhotoEdit}
//           onProfilePhotoEdit={handleProfilePhotoEdit}
//           coverImageLoading={coverImageLoading}
//           handleAddFriend={handleAddFriend}
//         />

//         <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
//           <Button
//             variant="contained"
//             color="secondary"
//             onClick={handlePreviewPublicProfile}
//             sx={{
//               borderRadius: '20px',
//               boxShadow: 2,
//               '&:hover': {
//                 boxShadow: 4,
//                 transform: 'translateY(-2px)'
//               }
//             }}
//           >
//             Preview Public Profile
//           </Button>
//         </Box>

//         <ProfileInfoSection
//           userData={userData}
//           isMobile={isMobile}
//           formatDate={formatDate}
//         />

//         <Box sx={{ maxWidth: 'lg', mx: 'auto', px: { xs: 2, sm: 3, md: 4 } }}>
//           <ProfileStats userData={userData} />

//           <ProfileTabs
//             tabValue={tabValue}
//             handleTabChange={handleTabChange}
//             privacy={privacy}
//             privacyChanged={privacyChanged}
//             handlePrivacyChange={handlePrivacyChange}
//             handleSavePrivacy={handleSavePrivacy}
//             handleDeleteAccount={handleDeleteAccount}
//             navigate={navigate}
//             userData={userData}
//             formatDate={formatDate}
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




//! good
// import { useEffect, useMemo, useState } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { useNavigate } from 'react-router-dom';
// import { ThemeProvider, useMediaQuery } from '@mui/material';
// import { Box, CircularProgress, Paper, Button, Avatar, Badge, IconButton, Typography, Link as MuiLink } from '@mui/material';
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
// import { sendFriendRequest } from '../../../features/friendship/friendshipSlice';
// import { showSnackbar } from '../../../features/snackbar/snackbarSlice';
// import { fetchAllUsers, fetchUserProfile, logoutUser, updateCoverImage } from '../../../features/user/userSlice';
// import theme from '../../../theme';
// import ProfileHeader from './ProfileHeader';
// import ProfileInfoSection from './ProfileInfoSection';
// import ProfileStats from './ProfileStats';
// import ProfileTabs from './ProfileTabs';
// import DeleteAccountDialog from './DeleteAccountDialog';

// const PrivateProfilePage = () => {
//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
//   const { profile, loading } = useSelector((state) => state.user);
  
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
//       profileImage: data.profileImage || '/default-avatar.png',
//       coverImage: data.coverImage || '/default-cover.jpg',
//       createdAt: data.createdAt || new Date(),
//       updatedAt: data.updatedAt || new Date(),
//       postsCount: data.postsCount || 0,
//       friendsCount: data.friendsCount || 0,
//       viewsCount: data.viewsCount || 0,
//       isCurrentUser: data.isCurrentUser || true
//     };
//   }, [profile]);

//   // Format date helper
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
//       dispatch(showSnackbar({
//         message: error?.message || 'Failed to send friend request',
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

//   const handleProfilePhotoEdit = () => {
//     navigate('/my-profile-update');
//   };

//   const handlePreviewPublicProfile = () => {
//     navigate(`/profile/public/${userData.id}`);
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
//         {/* Preview Button - Added from second version */}
//         <Box sx={{ 
//           display: 'flex', 
//           justifyContent: 'flex-end', 
//           p: 2,
//           position: 'fixed',
//           top: 70,
//           right: 20,
//           zIndex: 1000
//         }}>
//           <Button
//             variant="contained"
//             color="secondary"
//             onClick={handlePreviewPublicProfile}
//             sx={{
//               borderRadius: '20px',
//               boxShadow: 2,
//               '&:hover': {
//                 boxShadow: 4,
//                 transform: 'translateY(-2px)'
//               }
//             }}
//           >
//             Preview Public Profile
//           </Button>
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
//           formatDate={formatDate}
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
//             privacy={privacy}
//             privacyChanged={privacyChanged}
//             handlePrivacyChange={handlePrivacyChange}
//             handleSavePrivacy={handleSavePrivacy}
//             handleDeleteAccount={handleDeleteAccount}
//             navigate={navigate}
//             userData={userData}
//             formatDate={formatDate}
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



//! final
// import { useEffect, useMemo, useState } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { useNavigate } from 'react-router-dom';
// import { ThemeProvider, useMediaQuery } from '@mui/material'; // Add useMediaQuery here
// import { Box, CircularProgress, Paper } from '@mui/material';
// import { sendFriendRequest } from '../../../features/friendship/friendshipSlice';
// import { showSnackbar } from '../../../features/snackbar/snackbarSlice';
// import { fetchAllUsers, fetchUserProfile, logoutUser, updateCoverImage } from '../../../features/user/userSlice';
// import theme from '../../../theme';
// import ProfileHeader from './ProfileHeader';
// import ProfileInfoSection from './ProfileInfoSection';
// import ProfileStats from './ProfileStats';
// import ProfileTabs from './ProfileTabs';
// import DeleteAccountDialog from './DeleteAccountDialog';

// const PrivateProfilePage = () => {
//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
//   const { profile, loading } = useSelector((state) => state.user);
  
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
//       profileImage: data.profileImage || '/default-avatar.png',
//       coverImage: data.coverImage || '/default-cover.jpg',
//       createdAt: data.createdAt || new Date(),
//       updatedAt: data.updatedAt || new Date(),
//       postsCount: data.postsCount || 0,
//       friendsCount: data.friendsCount || 0,
//       viewsCount: data.viewsCount || 0,
//       isCurrentUser: data.isCurrentUser || true
//     };
//   }, [profile]);

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
//       dispatch(showSnackbar({
//         message: error?.message || 'Failed to send friend request',
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

//   const handleProfilePhotoEdit = () => {
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

























//! original with preview
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
//  import { showSnackbar } from '../../../features/snackbar/snackbarSlice';
// import { fetchUserProfile, logoutUser } from '../../../features/user/userSlice';
// import theme from '../../../theme';

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










