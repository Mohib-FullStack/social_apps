import { Visibility, VisibilityOff } from '@mui/icons-material';
import {
  Box,
  Button,
  Card,
  CircularProgress,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { showSnackbar } from '../../features/snackbar/snackbarSlice';
import { updatePassword } from '../../features/user/userSlice';
import theme from '../../theme';

const UpdatePassword = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleOldPasswordChange = (e) => {
    setOldPassword(e.target.value);
  };

  const handleNewPasswordChange = (e) => {
    setNewPassword(e.target.value);
  };

  const handleConfirmPasswordChange = (e) => {
    setConfirmPassword(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!oldPassword || !newPassword || !confirmPassword) {
      dispatch(
        showSnackbar({
          message: 'All fields are required.',
          severity: 'error',
        })
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      dispatch(
        showSnackbar({
          message: 'Passwords do not match.',
          severity: 'error',
        })
      );
      return;
    }

    setLoading(true);
    const result = await dispatch(
      updatePassword({ oldPassword, newPassword, confirmedPassword: confirmPassword })
    );
    setLoading(false);

    if (result.type === 'user/updatePassword/fulfilled') {
      dispatch(
        showSnackbar({
          message: 'Password updated successfully!',
          severity: 'success',
        })
      );

      // Clear input fields
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');

      // Navigate to Profile after a short delay
      setTimeout(() => navigate('/profile'), 1500);
    } else {
      dispatch(
        showSnackbar({
          message: result.payload?.message || 'Something went wrong.',
          severity: 'error',
        })
      );
    }
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
              Update Password
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
              <TextField
                fullWidth
                variant="outlined"
                label="Old Password"
                type={showOldPassword ? 'text' : 'password'}
                required
                value={oldPassword}
                onChange={handleOldPasswordChange}
                sx={{
                  '& .MuiInputBase-root': { borderRadius: '10px' },
                }}
                InputProps={{
                  endAdornment: (
                    <Button onClick={() => setShowOldPassword((prev) => !prev)}>
                      {showOldPassword ? <VisibilityOff /> : <Visibility />}
                    </Button>
                  ),
                }}
              />
              <TextField
                fullWidth
                variant="outlined"
                label="New Password"
                type={showNewPassword ? 'text' : 'password'}
                required
                value={newPassword}
                onChange={handleNewPasswordChange}
                sx={{
                  '& .MuiInputBase-root': { borderRadius: '10px' },
                }}
                InputProps={{
                  endAdornment: (
                    <Button onClick={() => setShowNewPassword((prev) => !prev)}>
                      {showNewPassword ? <VisibilityOff /> : <Visibility />}
                    </Button>
                  ),
                }}
              />
              <TextField
                fullWidth
                variant="outlined"
                label="Confirm New Password"
                type={showConfirmPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={handleConfirmPasswordChange}
                sx={{
                  '& .MuiInputBase-root': { borderRadius: '10px' },
                }}
                InputProps={{
                  endAdornment: (
                    <Button onClick={() => setShowConfirmPassword((prev) => !prev)}>
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </Button>
                  ),
                }}
              />
              {loading && <CircularProgress color="secondary" />}
            </Box>
          </DialogContent>

          <DialogActions sx={{ justifyContent: 'center', gap: 2 }}>
            <Button
              onClick={() => navigate('/profile')}
              color="error"
              sx={{ borderRadius: '10px', textTransform: 'capitalize' }}
            >
              Back to Profile
            </Button>
            <Button
              type="submit"
              onClick={handleSubmit}
              color="primary"
              variant="contained"
              sx={{ borderRadius: '10px', textTransform: 'capitalize' }}
            >
              Update Password
            </Button>
          </DialogActions>
        </Card>
      </Box>
    </ThemeProvider>
  );
};

export default UpdatePassword;
















