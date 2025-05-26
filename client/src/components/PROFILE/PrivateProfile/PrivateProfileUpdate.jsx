import {
  Cake,
  CheckBox,
  CheckBoxOutlineBlank,
  Phone,
  PhotoCamera,
  Transgender,
} from '@mui/icons-material';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  CircularProgress,
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { showSnackbar } from '../../../features/snackbar/snackbarSlice';
import {
  fetchUserProfile,
  updatePrivateProfile,
} from '../../../features/user/userSlice';
import theme from '../../../theme';

const PrivateProfileUpdate = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { profile, loading, status } = useSelector((state) => state.user);

  const [formData, setFormData] = useState({
    phone: '',
    birthDate: '',
    gender: '',
    profileImage: null,
    phoneVisibility: false,
    genderVisibility: false,
  });

  const [imagePreview, setImagePreview] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (profile?.user) {
      setFormData({
        phone: profile.user.phone || '',
        birthDate: profile.user.birthDate
          ? new Date(profile.user.birthDate).toISOString().split('T')[0]
          : '',
        gender: profile.user.gender || '',
        profileImage: null,
        phoneVisibility: profile.user.phoneVisibility || false,
        genderVisibility: profile.user.genderVisibility || false,
      });
      setImagePreview(profile.user.profileImage || '');
    }
  }, [profile]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleCheckboxChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.checked,
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.match('image.*')) {
        dispatch(
          showSnackbar({
            message: 'Only image files are allowed',
            severity: 'error',
          })
        );
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        dispatch(
          showSnackbar({
            message: 'Image size must be less than 5MB',
            severity: 'error',
          })
        );
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result);
        setFormData((prev) => ({
          ...prev,
          profileImage: file,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsUploading(true);

    const data = new FormData();
    data.append('phone', formData.phone);
    data.append('birthDate', formData.birthDate);
    data.append('gender', formData.gender);
    data.append('phoneVisibility', formData.phoneVisibility);
    data.append('genderVisibility', formData.genderVisibility);

    if (formData.profileImage) {
      data.append('profileImage', formData.profileImage);
    }

    try {
      const result = await dispatch(updatePrivateProfile(data)).unwrap();

      dispatch(
        showSnackbar({
          message: result.message || 'Private profile updated successfully',
          severity: 'success',
        })
      );

      await dispatch(fetchUserProfile());
      navigate('/profile/me');
    } catch (error) {
      dispatch(
        showSnackbar({
          message: error.message || 'Failed to update private profile',
          severity: 'error',
        })
      );
    } finally {
      setIsUploading(false);
    }
  };

  if (loading || !profile) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{ p: 4, backgroundColor: 'background.default', minHeight: '100vh' }}
      >
        <Card sx={{ maxWidth: 800, mx: 'auto', p: 3, borderRadius: 3 }}>
          <Typography
            variant="h4"
            gutterBottom
            sx={{ mb: 3, textAlign: 'center' }}
          >
            Update Private Information
          </Typography>

          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              mb: 3,
              position: 'relative',
            }}
          >
            <Avatar
              src={imagePreview}
              sx={{
                width: 120,
                height: 120,
                border: '3px solid',
                borderColor: 'primary.main',
              }}
            />
            <IconButton
              component="label"
              sx={{
                position: 'absolute',
                bottom: 0,
                right: 'calc(50% - 80px)',
                bgcolor: 'primary.main',
                '&:hover': {
                  bgcolor: 'primary.dark',
                  transform: 'scale(1.1)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              <input
                hidden
                accept="image/*"
                type="file"
                onChange={handleImageChange}
                disabled={isUploading}
              />
              <PhotoCamera sx={{ color: 'white' }} />
            </IconButton>
          </Box>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ textAlign: 'center', mb: 3 }}
          >
            Click the camera icon to update your profile picture
          </Typography>

          <CardContent>
            <form onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Phone sx={{ mr: 1, color: 'action.active' }} />
                    <TextField
                      fullWidth
                      label="Phone Number"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          name="phoneVisibility"
                          checked={formData.phoneVisibility}
                          onChange={handleCheckboxChange}
                          icon={<CheckBoxOutlineBlank />}
                          checkedIcon={<CheckBox />}
                        />
                      }
                      label="Visible"
                      sx={{ ml: 2 }}
                    />
                  </Box>
                </Grid>

                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Transgender sx={{ mr: 1, color: 'action.active' }} />
                    <FormControl fullWidth>
                      <InputLabel>Gender</InputLabel>
                      <Select
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                        label="Gender"
                      >
                        <MenuItem value="male">Male</MenuItem>
                        <MenuItem value="female">Female</MenuItem>
                        <MenuItem value="other">Other</MenuItem>
                      </Select>
                    </FormControl>
                    <FormControlLabel
                      control={
                        <Checkbox
                          name="genderVisibility"
                          checked={formData.genderVisibility}
                          onChange={handleCheckboxChange}
                          icon={<CheckBoxOutlineBlank />}
                          checkedIcon={<CheckBox />}
                        />
                      }
                      label="Visible"
                      sx={{ ml: 2 }}
                    />
                  </Box>
                </Grid>

                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Cake sx={{ mr: 1, color: 'action.active' }} />
                    <TextField
                      fullWidth
                      label="Birth Date"
                      name="birthDate"
                      type="date"
                      value={formData.birthDate}
                      onChange={handleChange}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Box>
                </Grid>
              </Grid>

              <Box
                sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}
              >
                <Button
                  variant="outlined"
                  onClick={() => navigate('/profile/me')}
                  sx={{ width: '48%' }}
                  disabled={isUploading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  sx={{ width: '48%' }}
                  disabled={isUploading || status === 'loading'}
                >
                  {isUploading || status === 'loading' ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    'Save Changes'
                  )}
                </Button>
              </Box>
            </form>
          </CardContent>
        </Card>
      </Box>
    </ThemeProvider>
  );
};

export default PrivateProfileUpdate;





//! final
// import {
//   Cake,
//   CheckBox,
//   CheckBoxOutlineBlank,
//   Phone,
//   PhotoCamera,
//   Transgender,
// } from '@mui/icons-material';
// import {
//   Avatar,
//   Box,
//   Button,
//   Card,
//   CardContent,
//   Checkbox,
//   CircularProgress,
//   FormControl,
//   FormControlLabel,
//   Grid,
//   IconButton,
//   InputLabel,
//   MenuItem,
//   Select,
//   TextField,
//   Typography,
// } from '@mui/material';
// import { ThemeProvider } from '@mui/material/styles';
// import { useEffect, useState } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { useNavigate } from 'react-router-dom';
// import { showSnackbar } from '../../features/snackbar/snackbarSlice';
// import {
//   fetchUserProfile,
//   updatePrivateProfile,
// } from '../../features/user/userSlice';
// import theme from '../../theme';

// const PrivateProfileUpdate = () => {
//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const { profile, loading, status } = useSelector((state) => state.user);

//   const [formData, setFormData] = useState({
//     phone: '',
//     birthDate: '',
//     gender: '',
//     profileImage: null,
//     phoneVisibility: false,
//     genderVisibility: false,
//   });

//   const [imagePreview, setImagePreview] = useState('');
//   const [isUploading, setIsUploading] = useState(false);

//   useEffect(() => {
//     if (profile?.user) {
//       setFormData({
//         phone: profile.user.phone || '',
//         birthDate: profile.user.birthDate
//           ? new Date(profile.user.birthDate).toISOString().split('T')[0]
//           : '',
//         gender: profile.user.gender || '',
//         profileImage: null,
//         phoneVisibility: profile.user.phoneVisibility || false,
//         genderVisibility: profile.user.genderVisibility || false,
//       });
//       setImagePreview(profile.user.profileImage || '');
//     }
//   }, [profile]);

//   const handleChange = (e) => {
//     setFormData({
//       ...formData,
//       [e.target.name]: e.target.value,
//     });
//   };

//   const handleCheckboxChange = (e) => {
//     setFormData({
//       ...formData,
//       [e.target.name]: e.target.checked,
//     });
//   };

//   const handleImageChange = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       if (!file.type.match('image.*')) {
//         dispatch(
//           showSnackbar({
//             message: 'Only image files are allowed',
//             severity: 'error',
//           })
//         );
//         return;
//       }

//       if (file.size > 5 * 1024 * 1024) {
//         dispatch(
//           showSnackbar({
//             message: 'Image size must be less than 5MB',
//             severity: 'error',
//           })
//         );
//         return;
//       }

//       const reader = new FileReader();
//       reader.onload = () => {
//         setImagePreview(reader.result);
//         setFormData((prev) => ({
//           ...prev,
//           profileImage: file,
//         }));
//       };
//       reader.readAsDataURL(file);
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setIsUploading(true);

//     const data = new FormData();
//     data.append('phone', formData.phone);
//     data.append('birthDate', formData.birthDate);
//     data.append('gender', formData.gender);
//     data.append('phoneVisibility', formData.phoneVisibility);
//     data.append('genderVisibility', formData.genderVisibility);

//     if (formData.profileImage) {
//       data.append('profileImage', formData.profileImage);
//     }

//     try {
//       const result = await dispatch(updatePrivateProfile(data)).unwrap();

//       dispatch(
//         showSnackbar({
//           message: result.message || 'Private profile updated successfully',
//           severity: 'success',
//         })
//       );

//       await dispatch(fetchUserProfile());
//       navigate('/profile/me');
//     } catch (error) {
//       dispatch(
//         showSnackbar({
//           message: error.message || 'Failed to update private profile',
//           severity: 'error',
//         })
//       );
//     } finally {
//       setIsUploading(false);
//     }
//   };

//   if (loading || !profile) {
//     return (
//       <Box
//         sx={{
//           display: 'flex',
//           justifyContent: 'center',
//           alignItems: 'center',
//           height: '100vh',
//         }}
//       >
//         <CircularProgress />
//       </Box>
//     );
//   }

//   return (
//     <ThemeProvider theme={theme}>
//       <Box
//         sx={{ p: 4, backgroundColor: 'background.default', minHeight: '100vh' }}
//       >
//         <Card sx={{ maxWidth: 800, mx: 'auto', p: 3, borderRadius: 3 }}>
//           <Typography
//             variant="h4"
//             gutterBottom
//             sx={{ mb: 3, textAlign: 'center' }}
//           >
//             Update Private Information
//           </Typography>

//           <Box
//             sx={{
//               display: 'flex',
//               justifyContent: 'center',
//               mb: 3,
//               position: 'relative',
//             }}
//           >
//             <Avatar
//               src={imagePreview}
//               sx={{
//                 width: 120,
//                 height: 120,
//                 border: '3px solid',
//                 borderColor: 'primary.main',
//               }}
//             />
//             <IconButton
//               component="label"
//               sx={{
//                 position: 'absolute',
//                 bottom: 0,
//                 right: 'calc(50% - 80px)',
//                 bgcolor: 'primary.main',
//                 '&:hover': {
//                   bgcolor: 'primary.dark',
//                   transform: 'scale(1.1)',
//                 },
//                 transition: 'all 0.3s ease',
//               }}
//             >
//               <input
//                 hidden
//                 accept="image/*"
//                 type="file"
//                 onChange={handleImageChange}
//                 disabled={isUploading}
//               />
//               <PhotoCamera sx={{ color: 'white' }} />
//             </IconButton>
//           </Box>

//           <Typography
//             variant="body2"
//             color="text.secondary"
//             sx={{ textAlign: 'center', mb: 3 }}
//           >
//             Click the camera icon to update your profile picture
//           </Typography>

//           <CardContent>
//             <form onSubmit={handleSubmit}>
//               <Grid container spacing={3}>
//                 <Grid item xs={12}>
//                   <Box sx={{ display: 'flex', alignItems: 'center' }}>
//                     <Phone sx={{ mr: 1, color: 'action.active' }} />
//                     <TextField
//                       fullWidth
//                       label="Phone Number"
//                       name="phone"
//                       value={formData.phone}
//                       onChange={handleChange}
//                     />
//                     <FormControlLabel
//                       control={
//                         <Checkbox
//                           name="phoneVisibility"
//                           checked={formData.phoneVisibility}
//                           onChange={handleCheckboxChange}
//                           icon={<CheckBoxOutlineBlank />}
//                           checkedIcon={<CheckBox />}
//                         />
//                       }
//                       label="Visible"
//                       sx={{ ml: 2 }}
//                     />
//                   </Box>
//                 </Grid>

//                 <Grid item xs={12}>
//                   <Box sx={{ display: 'flex', alignItems: 'center' }}>
//                     <Transgender sx={{ mr: 1, color: 'action.active' }} />
//                     <FormControl fullWidth>
//                       <InputLabel>Gender</InputLabel>
//                       <Select
//                         name="gender"
//                         value={formData.gender}
//                         onChange={handleChange}
//                         label="Gender"
//                       >
//                         <MenuItem value="male">Male</MenuItem>
//                         <MenuItem value="female">Female</MenuItem>
//                         <MenuItem value="other">Other</MenuItem>
//                       </Select>
//                     </FormControl>
//                     <FormControlLabel
//                       control={
//                         <Checkbox
//                           name="genderVisibility"
//                           checked={formData.genderVisibility}
//                           onChange={handleCheckboxChange}
//                           icon={<CheckBoxOutlineBlank />}
//                           checkedIcon={<CheckBox />}
//                         />
//                       }
//                       label="Visible"
//                       sx={{ ml: 2 }}
//                     />
//                   </Box>
//                 </Grid>

//                 <Grid item xs={12}>
//                   <Box sx={{ display: 'flex', alignItems: 'center' }}>
//                     <Cake sx={{ mr: 1, color: 'action.active' }} />
//                     <TextField
//                       fullWidth
//                       label="Birth Date"
//                       name="birthDate"
//                       type="date"
//                       value={formData.birthDate}
//                       onChange={handleChange}
//                       InputLabelProps={{ shrink: true }}
//                     />
//                   </Box>
//                 </Grid>
//               </Grid>

//               <Box
//                 sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}
//               >
//                 <Button
//                   variant="outlined"
//                   onClick={() => navigate('/profile/me')}
//                   sx={{ width: '48%' }}
//                   disabled={isUploading}
//                 >
//                   Cancel
//                 </Button>
//                 <Button
//                   type="submit"
//                   variant="contained"
//                   sx={{ width: '48%' }}
//                   disabled={isUploading || status === 'loading'}
//                 >
//                   {isUploading || status === 'loading' ? (
//                     <CircularProgress size={24} color="inherit" />
//                   ) : (
//                     'Save Changes'
//                   )}
//                 </Button>
//               </Box>
//             </form>
//           </CardContent>
//         </Card>
//       </Box>
//     </ThemeProvider>
//   );
// };

// export default PrivateProfileUpdate;

//! running
// import {
//   Cake,
//   Phone,
//   PhotoCamera,
//   Transgender
// } from '@mui/icons-material';
// import {
//   Avatar,
//   Box,
//   Button,
//   Card,
//   CardContent,
//   CircularProgress,
//   FormControl,
//   Grid,
//   IconButton,
//   InputLabel,
//   MenuItem,
//   Select,
//   TextField,
//   Typography
// } from '@mui/material';
// import { ThemeProvider } from '@mui/material/styles';
// import { useEffect, useState } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { useNavigate } from 'react-router-dom';
// import { showSnackbar } from '../../features/snackbar/snackbarSlice';
// import { fetchUserProfile, updatePrivateProfile } from '../../features/user/userSlice';
// import theme from '../../theme';

// const PrivateProfileUpdate = () => {
//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const { profile, loading, status } = useSelector((state) => state.user);

//   const [formData, setFormData] = useState({
//     phone: '',
//     birthDate: '',
//     gender: '',
//     profileImage: null
//   });

//   const [imagePreview, setImagePreview] = useState('');
//   const [isUploading, setIsUploading] = useState(false);

//   useEffect(() => {
//     if (profile?.user) {
//       setFormData({
//         phone: profile.user.phone || '',
//         birthDate: profile.user.birthDate ? new Date(profile.user.birthDate).toISOString().split('T')[0] : '',
//         gender: profile.user.gender || '',
//         profileImage: null // Keep as null, we'll handle the file separately
//       });
//       setImagePreview(profile.user.profileImage || '');
//     }
//   }, [profile]);

//   const handleChange = (e) => {
//     setFormData({
//       ...formData,
//       [e.target.name]: e.target.value,
//     });
//   };

//   const handleImageChange = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       // Validate file type and size
//       if (!file.type.match('image.*')) {
//         dispatch(showSnackbar({
//           message: 'Only image files are allowed',
//           severity: 'error'
//         }));
//         return;
//       }

//       if (file.size > 5 * 1024 * 1024) { // 5MB limit
//         dispatch(showSnackbar({
//           message: 'Image size must be less than 5MB',
//           severity: 'error'
//         }));
//         return;
//       }

//       const reader = new FileReader();
//       reader.onload = () => {
//         setImagePreview(reader.result);
//         setFormData(prev => ({
//           ...prev,
//           profileImage: file
//         }));
//       };
//       reader.readAsDataURL(file);
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setIsUploading(true);

//     const data = new FormData();
//     data.append('phone', formData.phone);
//     data.append('birthDate', formData.birthDate);
//     data.append('gender', formData.gender);

//     if (formData.profileImage) {
//       data.append('profileImage', formData.profileImage);
//     }

//     try {
//       const result = await dispatch(updatePrivateProfile(data)).unwrap();

//       dispatch(showSnackbar({
//         message: result.message || 'Private profile updated successfully',
//         severity: 'success'
//       }));

//       // Refresh the profile data
//       await dispatch(fetchUserProfile());
//       navigate('/profile/me');
//     } catch (error) {
//       dispatch(showSnackbar({
//         message: error.message || 'Failed to update private profile',
//         severity: 'error'
//       }));
//     } finally {
//       setIsUploading(false);
//     }
//   };

//   if (loading || !profile) {
//     return (
//       <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
//         <CircularProgress />
//       </Box>
//     );
//   }

//   return (
//     <ThemeProvider theme={theme}>
//       <Box sx={{ p: 4, backgroundColor: 'background.default', minHeight: '100vh' }}>
//         <Card sx={{ maxWidth: 800, mx: 'auto', p: 3, borderRadius: 3 }}>
//           <Typography variant="h4" gutterBottom sx={{ mb: 3, textAlign: 'center' }}>
//             Update Private Information
//           </Typography>

//           <Box sx={{
//             display: 'flex',
//             justifyContent: 'center',
//             mb: 3,
//             position: 'relative'
//           }}>
//             <Avatar
//               src={imagePreview}
//               sx={{
//                 width: 120,
//                 height: 120,
//                 border: '3px solid',
//                 borderColor: 'primary.main'
//               }}
//             />
//             <IconButton
//               component="label"
//               sx={{
//                 position: 'absolute',
//                 bottom: 0,
//                 right: 'calc(50% - 80px)',
//                 bgcolor: 'primary.main',
//                 '&:hover': {
//                   bgcolor: 'primary.dark',
//                   transform: 'scale(1.1)'
//                 },
//                 transition: 'all 0.3s ease'
//               }}
//             >
//               <input
//                 hidden
//                 accept="image/*"
//                 type="file"
//                 onChange={handleImageChange}
//                 disabled={isUploading}
//               />
//               <PhotoCamera sx={{ color: 'white' }} />
//             </IconButton>
//           </Box>

//           <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mb: 3 }}>
//             Click the camera icon to update your profile picture
//           </Typography>

//           <CardContent>
//             <form onSubmit={handleSubmit}>
//               <Grid container spacing={3}>
//                 <Grid item xs={12} md={6}>
//                   <TextField
//                     fullWidth
//                     label="Phone Number"
//                     name="phone"
//                     value={formData.phone}
//                     onChange={handleChange}
//                     InputProps={{
//                       startAdornment: <Phone sx={{ mr: 1, color: 'action.active' }} />
//                     }}
//                   />
//                 </Grid>

//                 <Grid item xs={12} md={6}>
//                   <TextField
//                     fullWidth
//                     label="Birth Date"
//                     name="birthDate"
//                     type="date"
//                     value={formData.birthDate}
//                     onChange={handleChange}
//                     InputLabelProps={{ shrink: true }}
//                     InputProps={{
//                       startAdornment: <Cake sx={{ mr: 1, color: 'action.active' }} />
//                     }}
//                   />
//                 </Grid>

//                 <Grid item xs={12}>
//                   <FormControl fullWidth>
//                     <InputLabel>Gender</InputLabel>
//                     <Select
//                       name="gender"
//                       value={formData.gender}
//                       onChange={handleChange}
//                       startAdornment={<Transgender sx={{ mr: 1 }} />}
//                     >
//                       <MenuItem value="male">Male</MenuItem>
//                       <MenuItem value="female">Female</MenuItem>
//                       <MenuItem value="other">Other</MenuItem>
//                     </Select>
//                   </FormControl>
//                 </Grid>
//               </Grid>

//               <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
//                 <Button
//                   variant="outlined"
//                   onClick={() => navigate('/profile/me')}
//                   sx={{ width: '48%' }}
//                   disabled={isUploading}
//                 >
//                   Cancel
//                 </Button>
//                 <Button
//                   type="submit"
//                   variant="contained"
//                   sx={{ width: '48%' }}
//                   disabled={isUploading || status === 'loading'}
//                 >
//                   {isUploading || status === 'loading' ? (
//                     <CircularProgress size={24} color="inherit" />
//                   ) : (
//                     'Save Changes'
//                   )}
//                 </Button>
//               </Box>
//             </form>
//           </CardContent>
//         </Card>
//       </Box>
//     </ThemeProvider>
//   );
// };

// export default PrivateProfileUpdate;

//! old
// import {
//   Cake,
//   Phone,
//   PhotoCamera,
//   Transgender
// } from '@mui/icons-material';
// import {
//   Avatar,
//   Box,
//   Button,
//   Card,
//   CardContent,
//   CircularProgress,
//   FormControl,
//   Grid,
//   IconButton,
//   InputLabel,
//   MenuItem,
//   Select,
//   TextField,
//   Typography
// } from '@mui/material';
// import { ThemeProvider } from '@mui/material/styles';
// import { useEffect, useState } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { useNavigate } from 'react-router-dom';
// import { showSnackbar } from '../../features/snackbar/snackbarSlice';
// import { fetchUserProfile, updatePrivateProfile } from '../../features/user/userSlice';
// import theme from '../../theme';

// const PrivateProfileUpdate = () => {
//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const { profile, loading } = useSelector((state) => state.user);

//   const [formData, setFormData] = useState({
//     phone: '',
//     birthDate: '',
//     gender: '',
//     profileImage: null
//   });

//   const [imagePreview, setImagePreview] = useState('');

//   useEffect(() => {
//     if (profile?.user) {
//       setFormData({
//         phone: profile.user.phone || '',
//         birthDate: profile.user.birthDate ? new Date(profile.user.birthDate).toISOString().split('T')[0] : '',
//         gender: profile.user.gender || '',
//       });
//       setImagePreview(profile.user.profileImage || '');
//     }
//   }, [profile]);

//   const handleChange = (e) => {
//     setFormData({
//       ...formData,
//       [e.target.name]: e.target.value,
//     });
//   };

//   const handleImageChange = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       const reader = new FileReader();
//       reader.onload = () => {
//         setImagePreview(reader.result);
//         setFormData(prev => ({
//           ...prev,
//           profileImage: file
//         }));
//       };
//       reader.readAsDataURL(file);
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     const data = new FormData();
//     data.append('phone', formData.phone);
//     data.append('birthDate', formData.birthDate);
//     data.append('gender', formData.gender);
//     if (formData.profileImage) {
//       data.append('profileImage', formData.profileImage);
//     }

//     try {
//       const result = await dispatch(updatePrivateProfile(data)).unwrap();

//       dispatch(showSnackbar({
//         message: result.message || 'Private profile updated successfully',
//         severity: 'success'
//       }));

//       await dispatch(fetchUserProfile());
//       navigate('/profile/private');
//     } catch (error) {
//       dispatch(showSnackbar({
//         message: error.message || 'Failed to update private profile',
//         severity: 'error'
//       }));
//     }
//   };

//   if (loading || !profile) {
//     return (
//       <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
//         <CircularProgress />
//       </Box>
//     );
//   }

//   return (
//     <ThemeProvider theme={theme}>
//       <Box sx={{ p: 4, backgroundColor: 'background.default', minHeight: '100vh' }}>
//         <Card sx={{ maxWidth: 800, mx: 'auto', p: 3, borderRadius: 3 }}>
//           <Typography variant="h4" gutterBottom sx={{ mb: 3, textAlign: 'center' }}>
//             Update Private Information
//           </Typography>

//           <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
//             <Avatar
//               src={imagePreview}
//               sx={{ width: 120, height: 120, position: 'relative' }}
//             >
//               <IconButton
//                 component="label"
//                 sx={{
//                   position: 'absolute',
//                   bottom: 0,
//                   right: 0,
//                   bgcolor: 'primary.main',
//                   '&:hover': { bgcolor: 'primary.dark' }
//                 }}
//               >
//                 <input hidden accept="image/*" type="file" onChange={handleImageChange} />
//                 <PhotoCamera sx={{ color: 'white' }} />
//               </IconButton>
//             </Avatar>
//           </Box>

//           <CardContent>
//             <form onSubmit={handleSubmit}>
//               <Grid container spacing={3}>
//                 <Grid item xs={12} md={6}>
//                   <TextField
//                     fullWidth
//                     label="Phone Number"
//                     name="phone"
//                     value={formData.phone}
//                     onChange={handleChange}
//                     InputProps={{
//                       startAdornment: <Phone sx={{ mr: 1, color: 'action.active' }} />
//                     }}
//                   />
//                 </Grid>

//                 <Grid item xs={12} md={6}>
//                   <TextField
//                     fullWidth
//                     label="Birth Date"
//                     name="birthDate"
//                     type="date"
//                     value={formData.birthDate}
//                     onChange={handleChange}
//                     InputLabelProps={{ shrink: true }}
//                     InputProps={{
//                       startAdornment: <Cake sx={{ mr: 1, color: 'action.active' }} />
//                     }}
//                   />
//                 </Grid>

//                 <Grid item xs={12}>
//                   <FormControl fullWidth>
//                     <InputLabel>Gender</InputLabel>
//                     <Select
//                       name="gender"
//                       value={formData.gender}
//                       onChange={handleChange}
//                       startAdornment={<Transgender sx={{ mr: 1 }} />}
//                     >
//                       <MenuItem value="male">Male</MenuItem>
//                       <MenuItem value="female">Female</MenuItem>
//                       <MenuItem value="other">Other</MenuItem>
//                     </Select>
//                   </FormControl>
//                 </Grid>
//               </Grid>

//               <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
//                 <Button
//                   variant="outlined"
//                   onClick={() => navigate('/profile/private')}
//                   sx={{ width: '48%' }}
//                 >
//                   Cancel
//                 </Button>
//                 <Button
//                   type="submit"
//                   variant="contained"
//                   sx={{ width: '48%' }}
//                 >
//                   Save Changes
//                 </Button>
//               </Box>
//             </form>
//           </CardContent>
//         </Card>
//       </Box>
//     </ThemeProvider>
//   );
// };

// export default PrivateProfileUpdate;
