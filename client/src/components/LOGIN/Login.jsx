//! new
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'
import {
  Box,
  Button,
  Card,
  CircularProgress,
  Container,
  IconButton,
  InputAdornment,
  Link,
  TextField,
  Typography,
} from '@mui/material'
import { ThemeProvider } from '@mui/material/styles'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { showSnackbar } from '../../features/snackbar/snackbarSlice'
import { loginUser } from '../../features/user/userSlice'
import theme from '../../theme'

const Login = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { status } = useSelector((state) => state.user || { status: 'idle' })

  // State variables
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')

  useEffect(() => {
    if (status === 'failed') {
      dispatch(
        showSnackbar({
          message: 'Login failed. Please check your credentials.',
          severity: 'error',
        })
      )
    }
  }, [status, dispatch])

  const handleTogglePasswordVisibility = () => {
    setShowPassword((prevShowPassword) => !prevShowPassword)
  }

  const validateEmail = (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!value.trim()) {
      setEmailError('Email is required. Enter your email address')
    } else if (!emailRegex.test(value)) {
      setEmailError('Invalid email address')
    } else {
      setEmailError('')
    }
  }

  const validatePassword = (value) => {
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/
    if (!value.trim()) {
      setPasswordError('Password is required')
    } else if (value.length < 6) {
      setPasswordError('Password should be at least 6 characters long')
    } else if (!passwordRegex.test(value)) {
      setPasswordError(
        'Password should contain at least one uppercase letter, one lowercase letter, one number, and one special character'
      )
    } else {
      setPasswordError('')
    }
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    validateEmail(email)
    validatePassword(password)
    if (emailError || passwordError) return

    try {
      const resultAction = await dispatch(loginUser({ email, password }))
      if (loginUser.fulfilled.match(resultAction)) {
        dispatch(
          showSnackbar({ message: 'Login successful!', severity: 'success' })
        )
        navigate('/chat')
      }
    } catch (err) {
      console.error('Failed to log in:', err)
      dispatch(
        showSnackbar({
          message: 'Login failed. Please try again.',
          severity: 'error',
        })
      )
    }
  }

  return (
    <ThemeProvider theme={theme}>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Container maxWidth="xs" sx={{ mt: 8, mb: 5 }}>
          <Card
            sx={{
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
              padding: 4,
              textAlign: 'center',
              background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                mb: 3,
              }}
            >
              <LockOutlinedIcon
                sx={{
                  fontSize: 40,
                  color: '#0055A4', // French blue
                  backgroundColor: '#F8F9FA',
                  borderRadius: '50%',
                  padding: 2,
                  border: '2px solid #0055A4',
                }}
              />
            </Box>

            <Typography
              component="h1"
              variant="h5"
              sx={{ 
                color: '#0055A4', // French blue
                fontWeight: 600,
                mb: 1,
                fontSize: '1.8rem'
              }}
            >
              Login
            </Typography>
            <Typography
              component="h3"
              variant="subtitle1"
              sx={{ 
                color: '#006A4E', // Bangladesh green
                mb: 3,
                fontSize: '1rem'
              }}
            >
              Welcome to our social app
            </Typography>
            <Box component="form" onSubmit={handleLogin} sx={{ mt: 1 }}>
              <TextField
                variant="outlined"
                margin="normal"
                required
                fullWidth
                label="Enter mobile or email"
                autoComplete="email"
                autoFocus
                value={email}
                error={!!emailError}
                helperText={emailError}
                onChange={(e) => {
                  setEmail(e.target.value)
                  validateEmail(e.target.value)
                }}
                sx={{
                  '& .MuiInputBase-root': { 
                    borderRadius: '8px',
                    backgroundColor: '#FFFFFF',
                  },
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: '#0055A4', // French blue
                    },
                    '&:hover fieldset': {
                      borderColor: '#EF3340', // French red
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#006A4E', // Bangladesh green
                    },
                  },
                  mb: 2
                }}
              />
              <TextField
                variant="outlined"
                margin="normal"
                required
                fullWidth
                label="Enter password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                error={!!passwordError}
                helperText={passwordError}
                onChange={(e) => {
                  setPassword(e.target.value)
                  validatePassword(e.target.value)
                }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleTogglePasswordVisibility}
                        edge="end"
                        sx={{ color: '#0055A4' }} // French blue
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiInputBase-root': { 
                    borderRadius: '8px',
                    backgroundColor: '#FFFFFF',
                  },
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: '#0055A4', // French blue
                    },
                    '&:hover fieldset': {
                      borderColor: '#EF3340', // French red
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#006A4E', // Bangladesh green
                    },
                  },
                  mb: 2
                }}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ 
                  mt: 3,
                  mb: 2,
                  backgroundColor: '#0055A4', // French blue
                  '&:hover': {
                    backgroundColor: '#EF3340', // French red
                  },
                  height: '48px',
                  borderRadius: '8px',
                  fontSize: '1rem'
                }}
                disabled={
                  status === 'loading' || !!emailError || !!passwordError
                }
              >
                {status === 'loading' ? (
                  <CircularProgress size={24} sx={{ color: '#FFFFFF' }} />
                ) : (
                  'Login'
                )}
              </Button>
            </Box>
            <Box sx={{ 
              mt: 3,
              display: 'flex',
              justifyContent: 'center',
              gap: 2
            }}>
              <Link
                href="/register"
                variant="body2"
                sx={{ 
                  color: '#0055A4', // French blue
                  fontWeight: 500,
                  textDecoration: 'none',
                  '&:hover': {
                    color: '#EF3340', // French red
                    textDecoration: 'underline'
                  }
                }}
              >
                Create account
              </Link>
              <Link
                href="/forgot-password"
                variant="body2"
                sx={{ 
                  color: '#006A4E', // Bangladesh green
                  fontWeight: 500,
                  textDecoration: 'none',
                  '&:hover': {
                    color: '#EF3340', // French red
                    textDecoration: 'underline'
                  }
                }}
              >
                Forgot Password?
              </Link>
            </Box>
          </Card>
        </Container>
      </motion.div>
    </ThemeProvider>
  )
}

export default Login

// import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
// import Visibility from '@mui/icons-material/Visibility';
// import VisibilityOff from '@mui/icons-material/VisibilityOff';
// import {
//   Avatar,
//   Box,
//   Button,
//   Card,
//   CircularProgress,
//   Container,
//   Divider,
//   Grid,
//   IconButton,
//   InputAdornment,
//   Link,
//   TextField,
//   Typography
// } from '@mui/material';
// import { ThemeProvider, createTheme } from '@mui/material/styles';
// import { motion } from 'framer-motion';
// import { useEffect, useState } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { useNavigate } from 'react-router-dom';
// import { showSnackbar } from '../../features/snackbar/snackbarSlice';
// import { loginUser } from '../../features/user/userSlice';

// // Custom theme with French (blue/white/red) and Bangladeshi (green/red) colors
// const theme = createTheme({
//   palette: {
//     primary: {
//       main: '#0055A4', // French blue
//     },
//     secondary: {
//       main: '#006A4E', // Bangladesh green
//     },
//     error: {
//       main: '#EF3340', // French red
//     },
//     background: {
//       default: '#f0f2f5', // Facebook-like background
//     },
//   },
//   typography: {
//     fontFamily: [
//       '-apple-system',
//       'BlinkMacSystemFont',
//       '"Segoe UI"',
//       'Roboto',
//       '"Helvetica Neue"',
//       'Arial',
//       'sans-serif',
//       '"Apple Color Emoji"',
//       '"Segoe UI Emoji"',
//       '"Segoe UI Symbol"',
//     ].join(','),
//   },
// });

// const Login = () => {
//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const { status } = useSelector((state) => state.user || { status: 'idle' });

//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [showPassword, setShowPassword] = useState(false);
//   const [emailError, setEmailError] = useState('');
//   const [passwordError, setPasswordError] = useState('');

//   useEffect(() => {
//     if (status === 'failed') {
//       dispatch(
//         showSnackbar({
//           message: 'Login failed. Please check your credentials.',
//           severity: 'error',
//         })
//       );
//     }
//   }, [status, dispatch]);

//   const handleTogglePasswordVisibility = () => {
//     setShowPassword((prev) => !prev);
//   };

//   const validateEmail = (value) => {
//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     if (!value.trim()) {
//       setEmailError('Email is required');
//     } else if (!emailRegex.test(value)) {
//       setEmailError('Please enter a valid email');
//     } else {
//       setEmailError('');
//     }
//   };

//   const validatePassword = (value) => {
//     if (!value.trim()) {
//       setPasswordError('Password is required');
//     } else if (value.length < 6) {
//       setPasswordError('Password must be at least 6 characters');
//     } else {
//       setPasswordError('');
//     }
//   };

//   const handleLogin = async (e) => {
//     e.preventDefault();
//     validateEmail(email);
//     validatePassword(password);
//     if (emailError || passwordError) return;

//     try {
//       const resultAction = await dispatch(loginUser({ email, password }));
//       if (loginUser.fulfilled.match(resultAction)) {
//         dispatch(
//           showSnackbar({ message: 'Login successful!', severity: 'success' })
//         );
//         navigate('/');
//       }
//     } catch (err) {
//       console.error('Failed to log in:', err);
//       dispatch(
//         showSnackbar({
//           message: 'Login failed. Please try again.',
//           severity: 'error',
//         })
//       );
//     }
//   };

//   return (
//     <ThemeProvider theme={theme}>
//       <Box
//         sx={{
//           minHeight: '100vh',
//           background: 'linear-gradient(135deg, #f0f2f5 0%, #e9ecef 100%)',
//           display: 'flex',
//           alignItems: 'center',
//           justifyContent: 'center',
//           py: 4,
//         }}
//       >
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.5 }}
//         >
//           <Container maxWidth="md">
//             <Grid container spacing={4} alignItems="center">
//               {/* Left side - App Introduction */}
//               <Grid item xs={12} md={6}>
//                 <Box
//                   sx={{
//                     textAlign: { xs: 'center', md: 'left' },
//                     color: '#0055A4',
//                   }}
//                 >
//                   <Typography
//                     variant="h3"
//                     sx={{
//                       fontWeight: 700,
//                       mb: 2,
//                       background: 'linear-gradient(to right, #0055A4, #006A4E)',
//                       WebkitBackgroundClip: 'text',
//                       WebkitTextFillColor: 'transparent',
//                     }}
//                   >
//                     SocialSphere
//                   </Typography>
//                   <Typography variant="h5" sx={{ mb: 3 }}>
//                     Connect with friends and the world around you.
//                   </Typography>
//                   <Box sx={{ display: 'flex', justifyContent: { xs: 'center', md: 'flex-start' }, gap: 2 }}>
//                     <Box
//                       sx={{
//                         width: 40,
//                         height: 40,
//                         borderRadius: '50%',
//                         bgcolor: '#0055A4',
//                         display: 'flex',
//                         alignItems: 'center',
//                         justifyContent: 'center',
//                       }}
//                     >
//                       <Typography color="white">FR</Typography>
//                     </Box>
//                     <Box
//                       sx={{
//                         width: 40,
//                         height: 40,
//                         borderRadius: '50%',
//                         bgcolor: '#006A4E',
//                         display: 'flex',
//                         alignItems: 'center',
//                         justifyContent: 'center',
//                       }}
//                     >
//                       <Typography color="white">BD</Typography>
//                     </Box>
//                   </Box>
//                 </Box>
//               </Grid>

//               {/* Right side - Login Form */}
//               <Grid item xs={12} md={6}>
//                 <Card
//                   sx={{
//                     borderRadius: 3,
//                     boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
//                     p: 4,
//                     background: 'white',
//                     borderTop: '4px solid #0055A4',
//                   }}
//                 >
//                   <Box sx={{ textAlign: 'center', mb: 3 }}>
//                     <Avatar
//                       sx={{
//                         bgcolor: '#0055A4',
//                         width: 56,
//                         height: 56,
//                         mb: 2,
//                         mx: 'auto',
//                       }}
//                     >
//                       <LockOutlinedIcon />
//                     </Avatar>
//                     <Typography variant="h5" sx={{ fontWeight: 600 }}>
//                       Log In to SocialSphere
//                     </Typography>
//                   </Box>

//                   <Box component="form" onSubmit={handleLogin}>
//                     <TextField
//                       fullWidth
//                       label="Email or Phone Number"
//                       variant="outlined"
//                       margin="normal"
//                       value={email}
//                       error={!!emailError}
//                       helperText={emailError}
//                       onChange={(e) => {
//                         setEmail(e.target.value);
//                         validateEmail(e.target.value);
//                       }}
//                       sx={{
//                         '& .MuiOutlinedInput-root': {
//                           borderRadius: 2,
//                           '&.Mui-focused fieldset': {
//                             borderColor: '#0055A4',
//                           },
//                         },
//                       }}
//                     />
//                     <TextField
//                       fullWidth
//                       label="Password"
//                       type={showPassword ? 'text' : 'password'}
//                       variant="outlined"
//                       margin="normal"
//                       value={password}
//                       error={!!passwordError}
//                       helperText={passwordError}
//                       onChange={(e) => {
//                         setPassword(e.target.value);
//                         validatePassword(e.target.value);
//                       }}
//                       InputProps={{
//                         endAdornment: (
//                           <InputAdornment position="end">
//                             <IconButton
//                               onClick={handleTogglePasswordVisibility}
//                               edge="end"
//                               sx={{ color: '#0055A4' }}
//                             >
//                               {showPassword ? <VisibilityOff /> : <Visibility />}
//                             </IconButton>
//                           </InputAdornment>
//                         ),
//                       }}
//                       sx={{
//                         '& .MuiOutlinedInput-root': {
//                           borderRadius: 2,
//                           '&.Mui-focused fieldset': {
//                             borderColor: '#0055A4',
//                           },
//                         },
//                       }}
//                     />
//                     <Button
//                       fullWidth
//                       variant="contained"
//                       size="large"
//                       type="submit"
//                       sx={{
//                         mt: 3,
//                         py: 1.5,
//                         borderRadius: 2,
//                         bgcolor: '#0055A4',
//                         '&:hover': {
//                           bgcolor: '#003f7a',
//                         },
//                       }}
//                       disabled={status === 'loading'}
//                     >
//                       {status === 'loading' ? (
//                         <CircularProgress size={24} color="inherit" />
//                       ) : (
//                         'Log In'
//                       )}
//                     </Button>
//                     <Box sx={{ textAlign: 'center', mt: 2 }}>
//                       <Link
//                         href="/forgot-password"
//                         sx={{
//                           color: '#006A4E',
//                           textDecoration: 'none',
//                           '&:hover': {
//                             textDecoration: 'underline',
//                           },
//                         }}
//                       >
//                         Forgot Password?
//                       </Link>
//                     </Box>
//                     <Divider sx={{ my: 3 }} />
//                     <Button
//                       fullWidth
//                       variant="contained"
//                       size="large"
//                       sx={{
//                         bgcolor: '#006A4E',
//                         py: 1.5,
//                         borderRadius: 2,
//                         '&:hover': {
//                           bgcolor: '#005542',
//                         },
//                       }}
//                       onClick={() => navigate('/register')}
//                     >
//                       Create New Account
//                     </Button>
//                   </Box>
//                 </Card>
//                 <Typography variant="body2" sx={{ mt: 3, textAlign: 'center' }}>
//                   <strong>SocialSphere</strong> — Connecting people with{' '}
//                   <Box component="span" sx={{ color: '#0055A4' }}>
//                     French
//                   </Box>{' '}
//                   charm and{' '}
//                   <Box component="span" sx={{ color: '#006A4E' }}>
//                     Bangladeshi
//                   </Box>{' '}
//                   warmth.
//                 </Typography>
//               </Grid>
//             </Grid>
//           </Container>
//         </motion.div>
//       </Box>
//     </ThemeProvider>
//   );
// };

// export default Login;


//! test
// import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
// import MessageIcon from '@mui/icons-material/Message'
// import Visibility from '@mui/icons-material/Visibility'
// import VisibilityOff from '@mui/icons-material/VisibilityOff'
// import {
//   Box,
//   Button,
//   Card,
//   CircularProgress,
//   Container,
//   Grid,
//   IconButton,
//   InputAdornment,
//   Link,
//   TextField,
//   Typography
// } from '@mui/material'
// import { ThemeProvider } from '@mui/material/styles'
// import { motion } from 'framer-motion'
// import { useEffect, useState } from 'react'
// import { useDispatch, useSelector } from 'react-redux'
// import { useNavigate } from 'react-router-dom'
// import { showSnackbar } from '../../features/snackbar/snackbarSlice'
// import { loginUser } from '../../features/user/userSlice'
// import theme from '../../theme'

// const Login = () => {
//   const dispatch = useDispatch()
//   const navigate = useNavigate()
//   const { status } = useSelector((state) => state.user || { status: 'idle' })

//   // State variables
//   const [email, setEmail] = useState('')
//   const [password, setPassword] = useState('')
//   const [showPassword, setShowPassword] = useState(false)
//   const [emailError, setEmailError] = useState('')
//   const [passwordError, setPasswordError] = useState('')

//   useEffect(() => {
//     if (status === 'failed') {
//       dispatch(
//         showSnackbar({
//           message: 'Login failed. Please check your credentials.',
//           severity: 'error',
//         })
//       )
//     }
//   }, [status, dispatch])

//   const handleTogglePasswordVisibility = () => {
//     setShowPassword((prevShowPassword) => !prevShowPassword)
//   }

//   const validateEmail = (value) => {
//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
//     if (!value.trim()) {
//       setEmailError('Email is required. Enter your email address')
//     } else if (!emailRegex.test(value)) {
//       setEmailError('Invalid email address')
//     } else {
//       setEmailError('')
//     }
//   }

//   const validatePassword = (value) => {
//     const passwordRegex =
//       /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/
//     if (!value.trim()) {
//       setPasswordError('Password is required')
//     } else if (value.length < 6) {
//       setPasswordError('Password should be at least 6 characters long')
//     } else if (!passwordRegex.test(value)) {
//       setPasswordError(
//         'Password should contain at least one uppercase letter, one lowercase letter, one number, and one special character'
//       )
//     } else {
//       setPasswordError('')
//     }
//   }

//   const handleLogin = async (e) => {
//     e.preventDefault()
//     validateEmail(email)
//     validatePassword(password)
//     if (emailError || passwordError) return

//     try {
//       const resultAction = await dispatch(loginUser({ email, password }))
//       if (loginUser.fulfilled.match(resultAction)) {
//         dispatch(
//           showSnackbar({ message: 'Login successful!', severity: 'success' })
//         )
//         navigate('/')
//       }
//     } catch (err) {
//       console.error('Failed to log in:', err)
//       dispatch(
//         showSnackbar({
//           message: 'Login failed. Please try again.',
//           severity: 'error',
//         })
//       )
//     }
//   }

//   return (
//     <ThemeProvider theme={theme}>
//       <motion.div
//         initial={{ opacity: 0, y: 50 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.5 }}
//       >
//         <Container maxWidth="sm" sx={{ mt: 8, mb: 5 }}>
//           <Grid container spacing={2}>
//             {/* Left side with message icon */}
//             <Grid item xs={12} md={4} sx={{
//               display: 'flex',
//               justifyContent: 'center',
//               alignItems: 'center',
//             }}>
//               <Box sx={{
//                 backgroundColor: '#0055A4',
//                 borderRadius: '50%',
//                 width: 100,
//                 height: 100,
//                 display: 'flex',
//                 justifyContent: 'center',
//                 alignItems: 'center',
//                 boxShadow: 3,
//               }}>
//                 <MessageIcon sx={{
//                   fontSize: 50,
//                   color: '#FFFFFF',
//                 }} />
//               </Box>
//             </Grid>

//             {/* Right side with login form */}
//             <Grid item xs={12} md={8}>
//               <Card
//                 sx={{
//                   borderRadius: '12px',
//                   boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
//                   padding: 4,
//                   textAlign: 'center',
//                   background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
//                 }}
//               >
//                 <Box
//                   sx={{
//                     display: 'flex',
//                     justifyContent: 'center',
//                     alignItems: 'center',
//                     mb: 3,
//                   }}
//                 >
//                   <LockOutlinedIcon
//                     sx={{
//                       fontSize: 40,
//                       color: '#0055A4',
//                       backgroundColor: '#F8F9FA',
//                       borderRadius: '50%',
//                       padding: 2,
//                       border: '2px solid #0055A4',
//                     }}
//                   />
//                 </Box>

//                 <Typography
//                   component="h1"
//                   variant="h5"
//                   sx={{ 
//                     color: '#0055A4',
//                     fontWeight: 600,
//                     mb: 1,
//                     fontSize: '1.8rem'
//                   }}
//                 >
//                   Login
//                 </Typography>
//                 <Typography
//                   component="h3"
//                   variant="subtitle1"
//                   sx={{ 
//                     color: '#006A4E',
//                     mb: 3,
//                     fontSize: '1rem'
//                   }}
//                 >
//                   Welcome to our social app
//                 </Typography>
//                 <Box component="form" onSubmit={handleLogin} sx={{ mt: 1 }}>
//                   <TextField
//                     variant="outlined"
//                     margin="normal"
//                     required
//                     fullWidth
//                     label="Enter mobile or email"
//                     autoComplete="email"
//                     autoFocus
//                     value={email}
//                     error={!!emailError}
//                     helperText={emailError}
//                     onChange={(e) => {
//                       setEmail(e.target.value)
//                       validateEmail(e.target.value)
//                     }}
//                     sx={{
//                       '& .MuiInputBase-root': { 
//                         borderRadius: '8px',
//                         backgroundColor: '#FFFFFF',
//                       },
//                       '& .MuiOutlinedInput-root': {
//                         '& fieldset': {
//                           borderColor: '#0055A4',
//                         },
//                         '&:hover fieldset': {
//                           borderColor: '#EF3340',
//                         },
//                         '&.Mui-focused fieldset': {
//                           borderColor: '#006A4E',
//                         },
//                       },
//                       mb: 2
//                     }}
//                   />
//                   <TextField
//                     variant="outlined"
//                     margin="normal"
//                     required
//                     fullWidth
//                     label="Enter password"
//                     type={showPassword ? 'text' : 'password'}
//                     autoComplete="current-password"
//                     value={password}
//                     error={!!passwordError}
//                     helperText={passwordError}
//                     onChange={(e) => {
//                       setPassword(e.target.value)
//                       validatePassword(e.target.value)
//                     }}
//                     InputProps={{
//                       endAdornment: (
//                         <InputAdornment position="end">
//                           <IconButton
//                             aria-label="toggle password visibility"
//                             onClick={handleTogglePasswordVisibility}
//                             edge="end"
//                             sx={{ color: '#0055A4' }}
//                           >
//                             {showPassword ? <VisibilityOff /> : <Visibility />}
//                           </IconButton>
//                         </InputAdornment>
//                       ),
//                     }}
//                     sx={{
//                       '& .MuiInputBase-root': { 
//                         borderRadius: '8px',
//                         backgroundColor: '#FFFFFF',
//                       },
//                       '& .MuiOutlinedInput-root': {
//                         '& fieldset': {
//                           borderColor: '#0055A4',
//                         },
//                         '&:hover fieldset': {
//                           borderColor: '#EF3340',
//                         },
//                         '&.Mui-focused fieldset': {
//                           borderColor: '#006A4E',
//                         },
//                       },
//                       mb: 2
//                     }}
//                   />
//                   <Button
//                     type="submit"
//                     fullWidth
//                     variant="contained"
//                     sx={{ 
//                       mt: 3,
//                       mb: 2,
//                       backgroundColor: '#0055A4',
//                       '&:hover': {
//                         backgroundColor: '#EF3340',
//                       },
//                       height: '48px',
//                       borderRadius: '8px',
//                       fontSize: '1rem'
//                     }}
//                     disabled={
//                       status === 'loading' || !!emailError || !!passwordError
//                     }
//                   >
//                     {status === 'loading' ? (
//                       <CircularProgress size={24} sx={{ color: '#FFFFFF' }} />
//                     ) : (
//                       'Login'
//                     )}
//                   </Button>
//                 </Box>
//                 <Box sx={{ 
//                   mt: 3,
//                   display: 'flex',
//                   justifyContent: 'center',
//                   gap: 2
//                 }}>
//                   <Link
//                     href="/register"
//                     variant="body2"
//                     sx={{ 
//                       color: '#0055A4',
//                       fontWeight: 500,
//                       textDecoration: 'none',
//                       '&:hover': {
//                         color: '#EF3340',
//                         textDecoration: 'underline'
//                       }
//                     }}
//                   >
//                     Create account
//                   </Link>
//                   <Link
//                     href="/forgot-password"
//                     variant="body2"
//                     sx={{ 
//                       color: '#006A4E',
//                       fontWeight: 500,
//                       textDecoration: 'none',
//                       '&:hover': {
//                         color: '#EF3340',
//                         textDecoration: 'underline'
//                       }
//                     }}
//                   >
//                     Forgot Password?
//                   </Link>
//                 </Box>
//               </Card>
//             </Grid>
//           </Grid>
//         </Container>
//       </motion.div>
//     </ThemeProvider>
//   )
// }

// export default Login






//! running
// import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
// import Visibility from '@mui/icons-material/Visibility'
// import VisibilityOff from '@mui/icons-material/VisibilityOff'
// import {
//   Box,
//   Button,
//   Card,
//   CircularProgress,
//   Container,
//   IconButton,
//   InputAdornment,
//   Link,
//   TextField,
//   Typography,
// } from '@mui/material'
// import { ThemeProvider } from '@mui/material/styles'
// import { motion } from 'framer-motion'
// import { useEffect, useState } from 'react'
// import { useDispatch, useSelector } from 'react-redux'
// import { useNavigate } from 'react-router-dom'
// import { showSnackbar } from '../../features/snackbar/snackbarSlice'
// import { loginUser } from '../../features/user/userSlice'
// import theme from '../../theme'

// const Login = () => {
//   const dispatch = useDispatch()
//   const navigate = useNavigate()
//   const { status } = useSelector((state) => state.user || { status: 'idle' })

//   // State variables
//   const [email, setEmail] = useState('')
//   const [password, setPassword] = useState('')
//   const [showPassword, setShowPassword] = useState(false)
//   const [emailError, setEmailError] = useState('')
//   const [passwordError, setPasswordError] = useState('')

//   useEffect(() => {
//     if (status === 'failed') {
//       dispatch(
//         showSnackbar({
//           message: 'Login failed. Please check your credentials.',
//           severity: 'error',
//         })
//       )
//     }
//   }, [status, dispatch])

//   const handleTogglePasswordVisibility = () => {
//     setShowPassword((prevShowPassword) => !prevShowPassword)
//   }

//   const validateEmail = (value) => {
//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
//     if (!value.trim()) {
//       setEmailError('Email is required. Enter your email address')
//     } else if (!emailRegex.test(value)) {
//       setEmailError('Invalid email address')
//     } else {
//       setEmailError('')
//     }
//   }

//   const validatePassword = (value) => {
//     const passwordRegex =
//       /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/
//     if (!value.trim()) {
//       setPasswordError('Password is required')
//     } else if (value.length < 6) {
//       setPasswordError('Password should be at least 6 characters long')
//     } else if (!passwordRegex.test(value)) {
//       setPasswordError(
//         'Password should contain at least one uppercase letter, one lowercase letter, one number, and one special character'
//       )
//     } else {
//       setPasswordError('')
//     }
//   }

//   const handleLogin = async (e) => {
//     e.preventDefault()
//     validateEmail(email)
//     validatePassword(password)
//     if (emailError || passwordError) return

//     try {
//       const resultAction = await dispatch(loginUser({ email, password }))
//       if (loginUser.fulfilled.match(resultAction)) {
//         dispatch(
//           showSnackbar({ message: 'Login successful!', severity: 'success' })
//         )
//         navigate('/')
//       }
//     } catch (err) {
//       console.error('Failed to log in:', err)
//       dispatch(
//         showSnackbar({
//           message: 'Login failed. Please try again.',
//           severity: 'error',
//         })
//       )
//     }
//   }

//   return (
//     <ThemeProvider theme={theme}>
//       <motion.div
//         initial={{ opacity: 0, y: 50 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.5 }}
//       >
//         <Container maxWidth="xs" sx={{ mt: 15, mb: 5 }}>
//           <Card
//             sx={{
//               borderRadius: '20px',
//               boxShadow: 3,
//               padding: 4,
//               textAlign: 'center',
//             }}
//           >
//             <Box
//               sx={{
//                 display: 'flex',
//                 justifyContent: 'center',
//                 alignItems: 'center',
//                 mb: 2,
//               }}
//             >
//               <LockOutlinedIcon
//                 sx={{
//                   fontSize: 50,
//                   color: theme.palette.secondary.main,
//                   backgroundColor: theme.palette.primary.light,
//                   borderRadius: '50%',
//                   padding: 1,
//                 }}
//               />
//             </Box>

//             <Typography
//               component="h1"
//               variant="h5"
//               sx={{ color: theme.palette.text.primary, fontWeight: 600 }}
//             >
//               Welcome Back
//             </Typography>
//             <Typography
//               component="h3"
//               variant="h5"
//               sx={{ color: 'primary.contrastText' }}
//             >
//               Please log in to your account.
//             </Typography>
//             <Box component="form" onSubmit={handleLogin} sx={{ mt: 2 }}>
//               <TextField
//                 variant="outlined"
//                 margin="normal"
//                 required
//                 fullWidth
//                 label="Email Address"
//                 autoComplete="email"
//                 autoFocus
//                 value={email}
//                 error={!!emailError}
//                 helperText={emailError}
//                 onChange={(e) => {
//                   setEmail(e.target.value)
//                   validateEmail(e.target.value)
//                 }}
//                 sx={{
//                   '& .MuiInputBase-root': { borderRadius: '10px' },
//                   '& .MuiOutlinedInput-root': {
//                     '& fieldset': {
//                       borderColor: 'secondary.main',
//                     },
//                     '&:hover fieldset': {
//                       borderColor: 'secondary.main',
//                     },
//                     '&.Mui-focused fieldset': {
//                       borderColor: 'secondary.main',
//                     },
//                   },
//                 }}
//               />
//               <TextField
//                 variant="outlined"
//                 margin="normal"
//                 required
//                 fullWidth
//                 label="Password"
//                 type={showPassword ? 'text' : 'password'}
//                 autoComplete="current-password"
//                 value={password}
//                 error={!!passwordError}
//                 helperText={passwordError}
//                 onChange={(e) => {
//                   setPassword(e.target.value)
//                   validatePassword(e.target.value)
//                 }}
//                 InputProps={{
//                   endAdornment: (
//                     <InputAdornment position="end">
//                       <IconButton
//                         aria-label="toggle password visibility"
//                         onClick={handleTogglePasswordVisibility}
//                         edge="end"
//                       >
//                         {showPassword ? <VisibilityOff /> : <Visibility />}
//                       </IconButton>
//                     </InputAdornment>
//                   ),
//                 }}
//                 sx={{
//                   '& .MuiInputBase-root': { borderRadius: '10px' },
//                   '& .MuiOutlinedInput-root': {
//                     '& fieldset': {
//                       borderColor: 'secondary.main',
//                     },
//                     '&:hover fieldset': {
//                       borderColor: 'secondary.main',
//                     },
//                     '&.Mui-focused fieldset': {
//                       borderColor: 'secondary.main',
//                     },
//                   },
//                 }}
//               />
//               <Button
//                 type="submit"
//                 fullWidth
//                 variant="contained"
//                 color="secondary"
//                 sx={{ mt: 2 }}
//                 disabled={
//                   status === 'loading' || !!emailError || !!passwordError
//                 }
//               >
//                 {status === 'loading' ? (
//                   <CircularProgress size={24} />
//                 ) : (
//                   'Login'
//                 )}
//               </Button>
//             </Box>
//             <Box sx={{ mt: 2 }}>
//               <Link
//                 href="/register"
//                 variant="body2"
//                 color="primary.contrastText"
//               >
//                 New user? Create an account
//               </Link>
//               <Link
//                 href="/forgot-password"
//                 variant="body2"
//                 sx={{ ml: 2, color: 'primary.contrastText' }}
//               >
//                 Forgot Password?
//               </Link>
//             </Box>
//           </Card>
//         </Container>
//       </motion.div>
//     </ThemeProvider>
//   )
// }

// export default Login
