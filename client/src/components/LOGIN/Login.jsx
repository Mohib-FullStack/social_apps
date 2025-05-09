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
        navigate('/')
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
        <Container maxWidth="xs" sx={{ mt: 15, mb: 5 }}>
          <Card
            sx={{
              borderRadius: '20px',
              boxShadow: 3,
              padding: 4,
              textAlign: 'center',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                mb: 2,
              }}
            >
              <LockOutlinedIcon
                sx={{
                  fontSize: 50,
                  color: theme.palette.secondary.main,
                  backgroundColor: theme.palette.primary.light,
                  borderRadius: '50%',
                  padding: 1,
                }}
              />
            </Box>

            <Typography
              component="h1"
              variant="h5"
              sx={{ color: theme.palette.text.primary, fontWeight: 600 }}
            >
              Welcome Back
            </Typography>
            <Typography
              component="h3"
              variant="h5"
              sx={{ color: 'primary.contrastText' }}
            >
              Please log in to your account.
            </Typography>
            <Box component="form" onSubmit={handleLogin} sx={{ mt: 2 }}>
              <TextField
                variant="outlined"
                margin="normal"
                required
                fullWidth
                label="Email Address"
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
                  '& .MuiInputBase-root': { borderRadius: '10px' },
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: 'secondary.main',
                    },
                    '&:hover fieldset': {
                      borderColor: 'secondary.main',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'secondary.main',
                    },
                  },
                }}
              />
              <TextField
                variant="outlined"
                margin="normal"
                required
                fullWidth
                label="Password"
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
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiInputBase-root': { borderRadius: '10px' },
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: 'secondary.main',
                    },
                    '&:hover fieldset': {
                      borderColor: 'secondary.main',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'secondary.main',
                    },
                  },
                }}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="secondary"
                sx={{ mt: 2 }}
                disabled={
                  status === 'loading' || !!emailError || !!passwordError
                }
              >
                {status === 'loading' ? (
                  <CircularProgress size={24} />
                ) : (
                  'Login'
                )}
              </Button>
            </Box>
            <Box sx={{ mt: 2 }}>
              <Link
                href="/register"
                variant="body2"
                color="primary.contrastText"
              >
                New user? Create an account
              </Link>
              <Link
                href="/forgot-password"
                variant="body2"
                sx={{ ml: 2, color: 'primary.contrastText' }}
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
