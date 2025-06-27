// Updated PrivateProfilePage.jsx with centralized loading and snackbar

import { Box, Button, ThemeProvider, Typography, useMediaQuery } from '@mui/material';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import theme from '../../../theme';

import { showSnackbar } from '../../../features/snackbar/snackbarSlice';
import {
  fetchUserProfile,
  updateCoverImage,
  updatePrivateProfile,
} from '../../../features/user/userSlice';

import { startLoading, stopLoading } from '../../../features/loading/loadingSlice';
import Dashboard from '../../DASHBOARD/Dashboard';
import ProfileHeader from './ProfileHeader';
import ProfileSkeleton from './ProfileSkeleton';

const DEFAULT_PROFILE_IMAGE = '/default-avatar.png';
const DEFAULT_COVER_IMAGE = '/default-cover.jpg';

const PrivateProfilePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { profile, loading, error } = useSelector((state) => state.user);

  const [state, setState] = useState({
    coverImageLoading: false,
    profileImageLoading: false,
    isHoveringCover: false,
  });

  const handleStateChange = useCallback((updates) => {
    setState((prev) => ({ ...prev, ...updates }));
  }, []);

  const userData = useMemo(() => {
    const user = profile?.user || profile || {};
    return {
      id: user.id || 'me',
      fullName: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
      email: user.email || 'No email provided',
      phone: user.phone || 'No phone provided',
      profileImage: user.profileImage || DEFAULT_PROFILE_IMAGE,
      coverImage: user.coverImage || DEFAULT_COVER_IMAGE,
      createdAt: user.createdAt || new Date(),
      updatedAt: user.updatedAt || new Date(),
      isCurrentUser: true,
    };
  }, [profile]);

  useEffect(() => {
    dispatch(fetchUserProfile());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      dispatch(showSnackbar({ message: error, severity: 'error' }));
    }
  }, [error, dispatch]);

  const validateImage = (file, maxSize, label) => {
    if (!file) return { valid: false, message: `${label} not selected.` };
    if (!file.type.startsWith('image/')) {
      return { valid: false, message: 'Only image files are allowed' };
    }
    if (file.size > maxSize) {
      return {
        valid: false,
        message: `${label} must be less than ${maxSize / (1024 * 1024)}MB`,
      };
    }
    return { valid: true };
  };

  const handleImageUpload = async (file, fieldName, updateAction, loadingKey) => {
    const maxSize = fieldName === 'coverImage' ? 5 * 1024 * 1024 : 2 * 1024 * 1024;
    const label = fieldName === 'coverImage' ? 'Cover image' : 'Profile image';

    const { valid, message } = validateImage(file, maxSize, label);
    if (!valid) {
      dispatch(showSnackbar({ message, severity: 'error' }));
      return;
    }

    dispatch(startLoading({ message: `Updating ${label.toLowerCase()}...`, animationType: 'wave' }));
    handleStateChange({ [loadingKey]: true });

    try {
      const formData = new FormData();
      formData.append(fieldName, file);
      await dispatch(updateAction(formData)).unwrap();

      dispatch(showSnackbar({
        message: `${label} updated successfully!`,
        severity: 'success',
        duration: 6000,
      }));
      dispatch(fetchUserProfile());
    } catch (err) {
      dispatch(showSnackbar({
        message: err.message || `Failed to update ${label.toLowerCase()}`,
        severity: 'error',
        duration: 6000,
      }));
    } finally {
      dispatch(stopLoading());
      handleStateChange({ [loadingKey]: false });
    }
  };

  const handleCoverPhotoUpdate = useCallback((e) => {
    const file = e.target.files[0];
    handleImageUpload(file, 'coverImage', updateCoverImage, 'coverImageLoading');
    e.target.value = '';
  }, [dispatch]);

  const handleProfilePhotoUpdate = useCallback((e) => {
    const file = e.target.files[0];
    handleImageUpload(file, 'profileImage', updatePrivateProfile, 'profileImageLoading');
    e.target.value = '';
  }, [dispatch]);

  const renderErrorState = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: 2 }}>
      <Typography variant="h6" color="error">Failed to load profile</Typography>
      <Button variant="contained" onClick={() => dispatch(fetchUserProfile())}>Retry</Button>
    </Box>
  );

  if (loading || !profile) return <ProfileSkeleton />;
  if (error) return renderErrorState();

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ backgroundColor: 'background.default', minHeight: '100vh', pb: 6 }}>
        <ProfileHeader
          userData={userData}
          isMobile={isMobile}
          onCoverPhotoEdit={handleCoverPhotoUpdate}
          onProfilePhotoEdit={handleProfilePhotoUpdate}
          coverImageLoading={state.coverImageLoading}
          profileImageLoading={state.profileImageLoading}
          isHoveringCover={state.isHoveringCover}
          setIsHoveringCover={(val) => handleStateChange({ isHoveringCover: val })}
        />

        <Box sx={{ maxWidth: 'lg', mx: 'auto', px: { xs: 2, sm: 3, md: 4 }, mt: 4 }}>
          <Dashboard userData={userData} navigate={navigate} />
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default PrivateProfilePage;









//! original
// import { Box, ThemeProvider, Typography, useMediaQuery } from '@mui/material';
// import { useCallback, useEffect, useMemo, useState } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { useNavigate } from 'react-router-dom';
// import theme from '../../../theme';

// import { showSnackbar } from '../../../features/snackbar/snackbarSlice';
// import {
//   fetchUserProfile,
//   updateCoverImage,
//   updatePrivateProfile,
// } from '../../../features/user/userSlice';

// import Dashboard from '../../DASHBOARD/Dashboard';
// import ProfileHeader from './ProfileHeader';
// import ProfileSkeleton from './ProfileSkeleton';

// const DEFAULT_PROFILE_IMAGE = '/default-avatar.png';
// const DEFAULT_COVER_IMAGE = '/default-cover.jpg';

// const PrivateProfilePage = () => {
//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
//   const { profile, loading, error } = useSelector((state) => state.user);

//   const [state, setState] = useState({
//     coverImageLoading: false,
//     profileImageLoading: false,
//     isHoveringCover: false,
//   });

//   const handleStateChange = useCallback((updates) => {
//     setState((prev) => ({ ...prev, ...updates }));
//   }, []);

//   const userData = useMemo(() => {
//     const user = profile?.user || profile || {};
//     return {
//       id: user.id || 'me',
//       fullName: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
//       email: user.email || 'No email provided',
//       phone: user.phone || 'No phone provided',
//       profileImage: user.profileImage || DEFAULT_PROFILE_IMAGE,
//       coverImage: user.coverImage || DEFAULT_COVER_IMAGE,
//       createdAt: user.createdAt || new Date(),
//       updatedAt: user.updatedAt || new Date(),
//       isCurrentUser: true,
//     };
//   }, [profile]);

//   useEffect(() => {
//     dispatch(fetchUserProfile());
//   }, [dispatch]);

//   useEffect(() => {
//     if (error) {
//       dispatch(showSnackbar({ message: error, severity: 'error' }));
//     }
//   }, [error, dispatch]);

//   const validateImage = (file, maxSize, label) => {
//     if (!file) return { valid: false, message: `${label} not selected.` };

//     if (!file.type.startsWith('image/')) {
//       return { valid: false, message: 'Only image files are allowed' };
//     }

//     if (file.size > maxSize) {
//       return {
//         valid: false,
//         message: `${label} must be less than ${maxSize / (1024 * 1024)}MB`,
//       };
//     }

//     return { valid: true };
//   };

//   const handleImageUpload = async (
//     file,
//     fieldName,
//     updateAction,
//     loadingKey
//   ) => {
//     const maxSize =
//       fieldName === 'coverImage' ? 5 * 1024 * 1024 : 2 * 1024 * 1024;
//     const label = fieldName === 'coverImage' ? 'Cover image' : 'Profile image';

//     const { valid, message } = validateImage(file, maxSize, label);
//     if (!valid) {
//       dispatch(showSnackbar({ message, severity: 'error' }));
//       return;
//     }

//     handleStateChange({ [loadingKey]: true });

//     try {
//       const formData = new FormData();
//       formData.append(fieldName, file);
//       await dispatch(updateAction(formData)).unwrap();
//       dispatch(
//         showSnackbar({
//           message: `${label} updated successfully!`,
//           severity: 'success',
//         })
//       );
//       dispatch(fetchUserProfile());
//     } catch (err) {
//       dispatch(
//         showSnackbar({
//           message: err.message || `Failed to update ${label.toLowerCase()}`,
//           severity: 'error',
//         })
//       );
//     } finally {
//       handleStateChange({ [loadingKey]: false });
//     }
//   };

//   const handleCoverPhotoUpdate = useCallback(
//     (e) => {
//       const file = e.target.files[0];
//       handleImageUpload(
//         file,
//         'coverImage',
//         updateCoverImage,
//         'coverImageLoading'
//       );
//       e.target.value = '';
//     },
//     [dispatch]
//   );

//   const handleProfilePhotoUpdate = useCallback(
//     (e) => {
//       const file = e.target.files[0];
//       handleImageUpload(
//         file,
//         'profileImage',
//         updatePrivateProfile,
//         'profileImageLoading'
//       );
//       e.target.value = '';
//     },
//     [dispatch]
//   );

//   const renderErrorState = () => (
//     <Box
//       sx={{
//         display: 'flex',
//         flexDirection: 'column',
//         alignItems: 'center',
//         justifyContent: 'center',
//         minHeight: '100vh',
//         gap: 2,
//       }}
//     >
//       <Typography variant="h6" color="error">
//         Failed to load profile
//       </Typography>
//       <Button variant="contained" onClick={() => dispatch(fetchUserProfile())}>
//         Retry
//       </Button>
//     </Box>
//   );

//   if (loading || !profile) return <ProfileSkeleton />;
//   if (error) return renderErrorState();

//   return (
//     <ThemeProvider theme={theme}>
//       <Box
//         sx={{
//           backgroundColor: 'background.default',
//           minHeight: '100vh',
//           pb: 6,
//         }}
//       >
//         <ProfileHeader
//           userData={userData}
//           isMobile={isMobile}
//           onCoverPhotoEdit={handleCoverPhotoUpdate}
//           onProfilePhotoEdit={handleProfilePhotoUpdate}
//           coverImageLoading={state.coverImageLoading}
//           profileImageLoading={state.profileImageLoading}
//           isHoveringCover={state.isHoveringCover}
//           setIsHoveringCover={(val) =>
//             handleStateChange({ isHoveringCover: val })
//           }
//         />

//         <Box
//           sx={{
//             maxWidth: 'lg',
//             mx: 'auto',
//             px: { xs: 2, sm: 3, md: 4 },
//             mt: 4,
//           }}
//         >
//           <Dashboard userData={userData} navigate={navigate} />
//         </Box>
//       </Box>
//     </ThemeProvider>
//   );
// };

// export default PrivateProfilePage;
