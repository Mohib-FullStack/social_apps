// src/features/snackbar/SnackbarMessage.jsx
import { Alert, Avatar, Box, Typography } from '@mui/material';

const SnackbarMessage = ({ message, severity, onClose, username, avatarUrl }) => {
  return (
    <Alert
      severity={severity}
      onClose={onClose}
      variant="filled"
      icon={false}
      sx={{
        width: 'auto',
        minWidth: 340,
        px: 2,
        py: 1.5,
        borderRadius: 3,
        boxShadow: 4,
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        background: severity === 'success'
          ? 'linear-gradient(135deg, #43cea2 0%, #185a9d 100%)'
          : severity === 'error'
          ? 'linear-gradient(135deg, #ff416c 0%, #ff4b2b 100%)'
          : severity === 'warning'
          ? 'linear-gradient(135deg, #f7971e 0%, #ffd200 100%)'
          : 'linear-gradient(135deg, #1c92d2 0%, #f2fcfe 100%)',
        color: '#fff',
      }}
    >
      {username ? (
        <>
          <Avatar
            src={avatarUrl}
            alt={username}
            sx={{
              width: 42,
              height: 42,
              border: '2px solid #fff',
              boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
            }}
          />
          <Box>
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 600, color: '#fff', lineHeight: 1.2 }}
            >
              {message}
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: 'rgba(255,255,255,0.85)' }}
            >
              {username}
            </Typography>
          </Box>
        </>
      ) : (
        <Typography variant="body2">{message}</Typography>
      )}
    </Alert>
  );
};

export default SnackbarMessage;
