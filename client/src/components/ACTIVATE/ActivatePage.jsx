// src/components/ACTIVATE/ActivatePage.jsx
import CelebrationIcon from '@mui/icons-material/Celebration';
import { Box, Button, CircularProgress, Paper, Typography } from '@mui/material';
import axios from 'axios';
import { useEffect, useState } from 'react';
import Confetti from 'react-confetti';
import { useDispatch } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import useWindowSize from 'react-use/lib/useWindowSize';
import { showSnackbar } from '../../features/snackbar/snackbarSlice';

const ActivatePage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [userName, setUserName] = useState('');
  const { width, height } = useWindowSize();

  const query = new URLSearchParams(location.search);
  const token = query.get('token');

  useEffect(() => {
    if (token) {
      axios
        .post('http://localhost:3030/api/users/activate', { token })
        .then((res) => {
          setSuccess(true);
          setLoading(false);

          const { firstName, lastName } = res.data.payload.user;
          setUserName(`${firstName} ${lastName}`);

          dispatch(
            showSnackbar({
              message: 'Registration successfully completed. Please log in.',
              severity: 'success',
            })
          );

          setTimeout(() => {
            navigate('/login');
          }, 5000);
        })
        .catch((error) => {
          dispatch(
            showSnackbar({
              message: error.response?.data?.message || 'Activation failed',
              severity: 'error',
            })
          );
          setLoading(false);
        });
    }
  }, [token, dispatch, navigate]);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        bgcolor: '#f5f7fa',
        px: 2,
      }}
    >
      {success && (
        <Confetti
          width={width}
          height={height}
          recycle={false}
          numberOfPieces={400}
          gravity={0.2}
        />
      )}

      <Paper
        elevation={6}
        sx={{
          p: 6,
          borderRadius: '20px',
          textAlign: 'center',
          bgcolor: 'white',
          maxWidth: 600,
          width: '100%',
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
        }}
      >
        <CelebrationIcon sx={{ fontSize: 60, color: '#ff9800', mb: 2 }} />

        <Typography variant="h4" fontWeight="bold" color="primary" gutterBottom>
          {loading
            ? 'Activating Your Account...'
            : success
            ? `🎉 Welcome, ${userName}! 🎉`
            : 'Activation Error'}
        </Typography>

        {loading && <CircularProgress sx={{ mt: 3 }} />}

        {success && (
          <>
            <Typography variant="h5" color="text.secondary" sx={{ mt: 2 }}>
              Your account is now <strong>active</strong>!
            </Typography>

            <Typography variant="body1" sx={{ mt: 1, mb: 4 }}>
              Enjoy all the features of our platform. You’ll be redirected shortly.
            </Typography>

            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate('/login')}
            >
              Go to Login
            </Button>
          </>
        )}
      </Paper>
    </Box>
  );
};

export default ActivatePage;





