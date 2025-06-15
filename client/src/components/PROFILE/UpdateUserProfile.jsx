// import { Email, Home, Person, Phone, PhotoCamera } from '@mui/icons-material';
// import {
//   Avatar,
//   Box,
//   Button,
//   Card,
//   CardContent,
//   CircularProgress,
//   Grid,
//   IconButton,
//   TextField,
//   Typography,
// } from '@mui/material';
// import { ThemeProvider } from '@mui/material/styles';
// import { useEffect, useState } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { useNavigate } from 'react-router-dom';
// import { showSnackbar } from '../../features/snackbar/snackbarSlice'; // Import the snackbar action
// import {
//   fetchUserProfile,
//   updateUserProfile,
// } from '../../features/user/userSlice';
// import theme from '../../theme'; // import your custom theme

// const UpdateUserProfile = () => {
//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const { profile, loading } = useSelector((state) => state.user);

//   const [formData, setFormData] = useState({
//     firstName: '',
//     lastName: '',
//     phone: '',
//     address: '',
//     image: '',
//   });

//   const [emailWarning, setEmailWarning] = useState(false);
//   const [imagePreview, setImagePreview] = useState('');

//   useEffect(() => {
//     if (profile && profile.user) {
//       setFormData({
//         firstName: profile.user.firstName || '',
//         lastName: profile.user.lastName || '',
//         phone: profile.user.phone || '',
//         address: profile.user.address || '',
//         image: profile.user.image || '',
//       });
//       setImagePreview(profile.user.image || '');
//     }
//   }, [profile]);

//   const handleChange = (e) => {
//     setFormData({
//       ...formData,
//       [e.target.name]: e.target.value,
//     });

//     if (e.target.name === 'email' && e.target.value !== profile?.user?.email) {
//       setEmailWarning(true);
//     } else {
//       setEmailWarning(false);
//     }
//   };

//   const handleImageChange = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       const reader = new FileReader();
//       reader.onload = () => {
//         setImagePreview(reader.result);
//         setFormData((prevFormData) => ({
//           ...prevFormData,
//           image: file,
//         }));
//       };
//       reader.readAsDataURL(file);
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (emailWarning) {
//       dispatch(
//         showSnackbar({
//           message: 'Email updates are not allowed for security reasons.',
//           severity: 'error',
//         })
//       );
//       return;
//     }

//     const data = new FormData();
//     data.append('firstName', formData.firstName);
//     data.append('lastName', formData.lastName);
//     data.append('phone', formData.phone);
//     data.append('address', formData.address);
//     if (formData.image) {
//       data.append('image', formData.image);
//     }

//     try {
//       const result = await dispatch(updateUserProfile(data)).unwrap();

//       if (result.message === 'Profile updated successfully') {
//         dispatch(
//           showSnackbar({
//             message: result.message,
//             severity: 'success',
//           })
//         );
//         await dispatch(fetchUserProfile());
//         setTimeout(() => navigate('/profile'), 1500);
//       } else {
//         dispatch(
//           showSnackbar({
//             message: result.message || 'Failed to update profile.',
//             severity: 'error',
//           })
//         );
//       }
//     } catch (error) {
//       dispatch(
//         showSnackbar({
//           message: error.message || 'Failed to update profile.',
//           severity: 'error',
//         })
//       );
//     }
//   };

//   const handleReturn = () => {
//     navigate('/profile');
//   };

//   if (loading || !profile || !profile.user) {
//     return (
//       <Box
//         sx={{
//           display: 'flex',
//           justifyContent: 'center',
//           alignItems: 'center',
//           height: '100vh',
//         }}
//       >
//         <CircularProgress color="secondary" />
//       </Box>
//     );
//   }

//   return (
//     <ThemeProvider theme={theme}>
//       <Box
//         sx={{
//           display: 'flex',
//           justifyContent: 'center',
//           alignItems: 'center',
//           height: '100vh',
//           marginTop: 8,
//           backgroundColor: 'background.default',
//         }}
//       >
//         <Card
//           sx={{
//             maxWidth: 500,
//             padding: 4,
//             backgroundColor: 'background.paper',
//             borderRadius: '12px',
//             boxShadow: 4,
//             transition: 'transform 0.3s ease',
//             '&:hover': {
//               transform: 'scale(1.02)',
//             },
//           }}
//         >
//           <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
//             <Avatar
//               src={imagePreview}
//               alt={`${profile?.user?.firstName || ''} ${
//                 profile?.user?.lastName || ''
//               }`}
//               sx={{
//                 width: 100,
//                 height: 100,
//                 border: '3px solid',
//                 borderColor: 'secondary.main',
//               }}
//             />
//           </Box>

//           <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
//             <IconButton color="primary" component="label">
//               <input
//                 hidden
//                 accept="image/*"
//                 type="file"
//                 onChange={handleImageChange}
//               />
//               <PhotoCamera fontSize="large" />
//             </IconButton>
//           </Box>

//           <Typography
//             variant="h5"
//             color="secondary"
//             sx={{ mb: 3, textAlign: 'center' }}
//           >
//             Update Your Profile
//           </Typography>

//           <CardContent>
//             <form onSubmit={handleSubmit}>
//               <Grid container spacing={2}>
//                 <Grid item xs={12} sm={6}>
//                   <TextField
//                     label="First Name"
//                     name="firstName"
//                     value={formData.firstName}
//                     onChange={handleChange}
//                     fullWidth
//                     variant="outlined"
//                     InputProps={{
//                       startAdornment: (
//                         <Person fontSize="small" sx={{ mr: 1 }} />
//                       ),
//                     }}
//                   />
//                 </Grid>
//                 <Grid item xs={12} sm={6}>
//                   <TextField
//                     label="Last Name"
//                     name="lastName"
//                     value={formData.lastName}
//                     onChange={handleChange}
//                     fullWidth
//                     variant="outlined"
//                     InputProps={{
//                       startAdornment: (
//                         <Person fontSize="small" sx={{ mr: 1 }} />
//                       ),
//                     }}
//                   />
//                 </Grid>
//                 <Grid item xs={12} sm={6}>
//                   <TextField
//                     label="Phone"
//                     name="phone"
//                     value={formData.phone}
//                     onChange={handleChange}
//                     fullWidth
//                     variant="outlined"
//                     InputProps={{
//                       startAdornment: <Phone fontSize="small" sx={{ mr: 1 }} />,
//                     }}
//                   />
//                 </Grid>
//                 <Grid item xs={12} sm={6}>
//                   <TextField
//                     label="Address"
//                     name="address"
//                     value={formData.address}
//                     onChange={handleChange}
//                     fullWidth
//                     variant="outlined"
//                     InputProps={{
//                       startAdornment: <Home fontSize="small" sx={{ mr: 1 }} />,
//                     }}
//                   />
//                 </Grid>
//               </Grid>

//               <Box sx={{ mt: 2 }}>
//                 <TextField
//                   label="Email"
//                   value={profile?.user?.email || ''}
//                   fullWidth
//                   disabled
//                   InputProps={{
//                     startAdornment: <Email fontSize="small" sx={{ mr: 1 }} />,
//                   }}
//                 />
//               </Box>

//               <Box
//                 sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}
//               >
//                 <Button
//                   type="submit"
//                   variant="contained"
//                   color="primary"
//                   sx={{ width: '48%' }}
//                 >
//                   Update Profile
//                 </Button>
//                 <Button
//                   onClick={handleReturn}
//                   variant="outlined"
//                   color="secondary"
//                   sx={{ width: '48%' }}
//                 >
//                   Return
//                 </Button>
//               </Box>
//             </form>
//           </CardContent>
//         </Card>
//       </Box>
//     </ThemeProvider>
//   );
// };

// export default UpdateUserProfile;








