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
import { fetchUserProfile, loginUser } from '../../features/user/userSlice'
import theme from '../../theme'

const Login = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { status } = useSelector((state) => state.user || { status: 'idle' })

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  const [formErrors, setFormErrors] = useState({
    email: '',
    password: '',
  })

  const [showPassword, setShowPassword] = useState(false)

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
    setShowPassword((prev) => !prev)
  }

  const validate = () => {
    const errors = {}

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!formData.email.trim()) {
      errors.email = 'Email is required.'
    } else if (!emailRegex.test(formData.email)) {
      errors.email = 'Invalid email address.'
    }

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/
    if (!formData.password.trim()) {
      errors.password = 'Password is required.'
    } else if (!passwordRegex.test(formData.password)) {
      errors.password =
        'Must contain uppercase, lowercase, number, and special character.'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleChange = (field) => (e) => {
    setFormData({ ...formData, [field]: e.target.value })

    // Live validation on input change
    setFormErrors((prevErrors) => ({
      ...prevErrors,
      [field]: '',
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const isValid = validate()

    if (!isValid) return

    try {
      const result = await dispatch(loginUser(formData))
      if (loginUser.fulfilled.match(result)) {
        // After successful login, fetch the user profile
        const profileResult = await dispatch(fetchUserProfile())
        
        if (fetchUserProfile.fulfilled.match(profileResult)) {
          dispatch(
            showSnackbar({
              message: 'Login successful!',
              severity: 'success',
            })
          )
          navigate('/profile/me')
        } else {
          dispatch(
            showSnackbar({
              message: 'Logged in but failed to load profile.',
              severity: 'warning',
            })
          )
        }
      } 
    } catch (error) {
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
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
              <LockOutlinedIcon
                sx={{
                  fontSize: 40,
                  color: '#0055A4',
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
              sx={{ color: '#0055A4', fontWeight: 600, mb: 1, fontSize: '1.8rem' }}
            >
              Login
            </Typography>
            <Typography
              variant="subtitle1"
              sx={{ color: '#006A4E', mb: 3, fontSize: '1rem' }}
            >
              Welcome to our social app
            </Typography>

            <Box component="form" onSubmit={handleSubmit} noValidate>
              <TextField
                label="Enter mobile or email"
                fullWidth
                margin="normal"
                variant="outlined"
                value={formData.email}
                onChange={handleChange('email')}
                error={!!formErrors.email}
                helperText={formErrors.email}
                autoComplete="email"
                autoFocus
                sx={{
                  '& .MuiInputBase-root': {
                    borderRadius: '8px',
                    backgroundColor: '#FFFFFF',
                  },
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: '#0055A4' },
                    '&:hover fieldset': { borderColor: '#EF3340' },
                    '&.Mui-focused fieldset': { borderColor: '#006A4E' },
                  },
                }}
              />
              <TextField
                label="Enter password"
                fullWidth
                margin="normal"
                variant="outlined"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleChange('password')}
                error={!!formErrors.password}
                helperText={formErrors.password}
                autoComplete="current-password"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={handleTogglePasswordVisibility} edge="end" sx={{ color: '#0055A4' }}>
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
                    '& fieldset': { borderColor: '#0055A4' },
                    '&:hover fieldset': { borderColor: '#EF3340' },
                    '&.Mui-focused fieldset': { borderColor: '#006A4E' },
                  },
                }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={status === 'loading'}
                sx={{
                  mt: 3,
                  mb: 2,
                  backgroundColor: '#0055A4',
                  '&:hover': { backgroundColor: '#EF3340' },
                  height: '48px',
                  borderRadius: '8px',
                  fontSize: '1rem',
                }}
              >
                {status === 'loading' ? (
                  <CircularProgress size={24} sx={{ color: '#FFFFFF' }} />
                ) : (
                  'Login'
                )}
              </Button>
            </Box>

            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center', gap: 2 }}>
              <Link
                href="/register"
                variant="body2"
                sx={{
                  color: '#0055A4',
                  fontWeight: 500,
                  textDecoration: 'none',
                  '&:hover': { color: '#EF3340', textDecoration: 'underline' },
                }}
              >
                Create account
              </Link>
              <Link
                href="/forgot-password"
                variant="body2"
                sx={{
                  color: '#006A4E',
                  fontWeight: 500,
                  textDecoration: 'none',
                  '&:hover': { color: '#EF3340', textDecoration: 'underline' },
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










