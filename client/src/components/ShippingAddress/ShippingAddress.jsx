import { Box, TextField, Typography } from '@mui/material';
import React from 'react';
import { useSelector } from 'react-redux';

const ShippingAddress = () => {
  const { profile } = useSelector((state) => state.user);

  // Debug profile object
  console.log('Profile Data:', profile);

  if (!profile || !profile.user) {
    return (
      <Typography variant="body1" color="textSecondary">
        Loading profile information...
      </Typography>
    );
  }

  const {
    firstName = 'No name provided',
    lastName = '',
    email = 'No email provided',
    address = 'No address provided',
    phone = 'No phone number provided',
  } = profile.user;

  return (
    <Box
      sx={{
        padding: 3,
        border: '3px solid',
        borderRadius: 2,
        borderImageSource: 'linear-gradient(to right, #f36, #4af)',
        borderImageSlice: 1,
      }}
    >
      <Typography variant="h6" sx={{ mb: 2 }}>
        Shipping Address
      </Typography>
      <TextField
        label="Name"
        fullWidth
        variant="outlined"
        sx={{ mb: 2 }}
        value={`${firstName} ${lastName}`.trim()}
        disabled
      />
      <TextField
        label="Email"
        fullWidth
        variant="outlined"
        sx={{ mb: 2 }}
        value={email}
        disabled
      />
      <TextField
        label="Address"
        fullWidth
        variant="outlined"
        sx={{ mb: 4 }}
        value={address}
        disabled
      />
      <TextField
        label="Phone Number"
        fullWidth
        variant="outlined"
        sx={{ mb: 4 }}
        value={phone}
        disabled
      />
    </Box>
  );
};

export default ShippingAddress;
