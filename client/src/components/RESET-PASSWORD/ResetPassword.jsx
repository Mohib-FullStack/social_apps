import { Visibility, VisibilityOff } from '@mui/icons-material';
import {
  Box,
  Button,
  Card,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  TextField,
} from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom'; // For routing
import { showSnackbar } from '../../features/snackbar/snackbarSlice'; // Snackbar import
import { resetPassword } from '../../features/user/userSlice';
import theme from '../../theme';

const ResetPassword = () => {
  const dispatch = useDispatch();
  const { status, error } = useSelector((state) => state.user);
  const { token } = useParams(); // Capture token from URL
  const navigate = useNavigate(); // To redirect after success

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [newPasswordError, setNewPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (!token) {
      dispatch(
        showSnackbar({
          message: 'Invalid or expired reset link.',
          severity: 'error',
        })
      );
      navigate('/'); // Redirect to home page if no token is found
    }
  }, [token, dispatch, navigate]);

  const validateNewPassword = (password) => {
    const minLength = 6;
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/;
    if (!password) {
      return 'New password is required';
    }
    if (password.length < minLength) {
      return `Password should be at least ${minLength} characters long`;
    }
    if (!regex.test(password)) {
      return 'Password should contain one uppercase letter, one lowercase letter, one number, and one special character';
    }
    return '';
  };

  const validateConfirmPassword = (password, confirmPassword) => {
    if (!confirmPassword) {
      return 'Please confirm your new password';
    }
    if (password !== confirmPassword) {
      return 'Passwords do not match';
    }
    return '';
  };

  const handleNewPasswordChange = (e) => {
    const value = e.target.value;
    setNewPassword(value);
    const error = validateNewPassword(value);
    setNewPasswordError(error);
  };

  const handleConfirmPasswordChange = (e) => {
    const value = e.target.value;
    setConfirmPassword(value);
    const error = validateConfirmPassword(newPassword, value);
    setConfirmPasswordError(error);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newPasswordError = validateNewPassword(newPassword);
    const confirmPasswordError = validateConfirmPassword(
      newPassword,
      confirmPassword
    );

    setNewPasswordError(newPasswordError);
    setConfirmPasswordError(confirmPasswordError);

    if (newPasswordError || confirmPasswordError) {
      return;
    }

    const result = await dispatch(
      resetPassword({ token, password: newPassword })
    );

    if (result.type === 'user/resetPassword/fulfilled') {
      dispatch(
        showSnackbar({
          message: 'Password reset successfully!',
          severity: 'success',
        })
      );
      setNewPassword('');
      setConfirmPassword('');
      navigate('/login'); // Redirect to login page after successful reset
    } else {
      dispatch(
        showSnackbar({
          message: error || 'Something went wrong. Please try again.',
          severity: 'error',
        })
      );
    }
  };

  const handleClickShowNewPassword = () => setShowNewPassword((prev) => !prev);
  const handleClickShowConfirmPassword = () =>
    setShowConfirmPassword((prev) => !prev);

  return (
    <ThemeProvider theme={theme}>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Dialog
          open={true}
          onClose={() => {}}
          maxWidth="xs"
          fullWidth
          PaperProps={{
            sx: { borderRadius: '20px', padding: 2 },
          }}
        >
          <DialogTitle>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              style={{ textAlign: 'center', fontWeight: 'bold' }}
            >
              Reset Password
            </motion.div>
          </DialogTitle>

          <DialogContent>
            <Card
              sx={{
                borderRadius: '20px',
                boxShadow: 3,
                padding: 2,
                backgroundColor: 'background.paper',
              }}
            >
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
                {/* New Password Field */}
                <TextField
                  fullWidth
                  variant="outlined"
                  label="New Password"
                  type={showNewPassword ? 'text' : 'password'}
                  required
                  value={newPassword}
                  onChange={handleNewPasswordChange}
                  error={!!newPasswordError}
                  helperText={newPasswordError}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={handleClickShowNewPassword}
                          edge="end"
                        >
                          {showNewPassword ? <VisibilityOff /> : <Visibility />}
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

                {/* Confirm Password Field */}
                <TextField
                  fullWidth
                  variant="outlined"
                  label="Confirm Password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={handleConfirmPasswordChange}
                  error={!!confirmPasswordError}
                  helperText={confirmPasswordError}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={handleClickShowConfirmPassword}
                          edge="end"
                        >
                          {showConfirmPassword ? (
                            <VisibilityOff />
                          ) : (
                            <Visibility />
                          )}
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
              </Box>
            </Card>
          </DialogContent>

          <DialogActions>
            <Button
              onClick={() => navigate('/login')} // Option to go back to login if they cancel
              color="error"
              sx={{
                borderRadius: '10px',
                textTransform: 'capitalize',
              }}
            >
              Cancel
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
        </Dialog>
      </motion.div>
    </ThemeProvider>
  );
};

export default ResetPassword;

