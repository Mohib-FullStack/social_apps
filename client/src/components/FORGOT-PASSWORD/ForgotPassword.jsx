import {
  Box,
  Button,
  Card,
  CircularProgress,
  DialogActions,
  DialogContent,
  DialogTitle,
  Snackbar,
  TextField
} from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { showSnackbar } from '../../features/snackbar/snackbarSlice';
import { forgotPassword } from '../../features/user/userSlice';
import theme from '../../theme';

const ForgotPassword = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { error } = useSelector((state) => state.user);
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [snackbarState, setSnackbarState] = useState({
    open: false,
    message: '',
    severity: 'success',
  });
  const [loading, setLoading] = useState(false); // Loading state

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    setEmailError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setEmailError('Email is required');
      return;
    }

    setLoading(true); // Set loading to true
    const result = await dispatch(forgotPassword({ email }));
    setLoading(false); // Reset loading to false

    if (result.type === 'users/forgotPassword/fulfilled') {
      dispatch(
        showSnackbar({
          message: 'Password reset link sent to your email!',
          severity: 'success',
        })
      );
      setEmail('');
      setSnackbarState({
        open: true,
        message: 'Password reset link sent!',
        severity: 'success',
      });
    } else {
      setSnackbarState({
        open: true,
        message: error || 'Something went wrong. Please try again.',
        severity: 'error',
      });
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarState((prevState) => ({ ...prevState, open: false }));
  };

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          backgroundColor: 'background.default',
        }}
      >
        <Card
          sx={{
            width: 600,
            backgroundColor: 'background.paper',
            borderRadius: '20px',
            boxShadow: 3,
            textAlign: 'center',
            padding: 2,
            marginTop: 6,
            transition: 'transform 0.3s ease',
            '&:hover': {
              transform: 'scale(1.05)',
            },
          }}
        >
          <DialogTitle>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              style={{ textAlign: 'center', fontWeight: 'bold' }}
            >
              Forgot Password
            </motion.div>
          </DialogTitle>

          <DialogContent>
            <Box
              component="form"
              onSubmit={handleSubmit}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
                textAlign: 'center',
              }}
            >
              {/* Email Field */}
              <TextField
                fullWidth
                variant="outlined"
                label="Email"
                type="email"
                required
                value={email}
                onChange={handleEmailChange}
                error={!!emailError}
                helperText={emailError}
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
              {loading && <CircularProgress color="secondary" />}{' '}
              {/* Loading indicator */}
            </Box>
          </DialogContent>

          <DialogActions sx={{ justifyContent: 'center', gap: 2 }}>
            <Button
              onClick={() => navigate('/login')}
              color="error"
              sx={{
                borderRadius: '10px',
                textTransform: 'capitalize',
              }}
            >
              Back to Profile
            </Button>
            <Button
              type="submit"
              onClick={handleSubmit}
              color="primary"
              variant="contained"
              sx={{
                borderRadius: '10px',
                textTransform: 'capitalize',
              }}
            >
              Submit
            </Button>
          </DialogActions>
                 </Card>
      </Box>

      <Snackbar
        open={snackbarState.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        message={snackbarState.message}
      />
    </ThemeProvider>
  );
};

export default ForgotPassword;


