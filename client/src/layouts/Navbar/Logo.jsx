// src/layouts/Navbar/Logo.jsx
import { Link } from 'react-router-dom';
import { Typography } from '@mui/material';

const Logo = () => (
  <Typography
    variant="h5"
    component={Link}
    to="/"
    sx={{
      fontWeight: 'bold',
      color: '#1877F2',
      textDecoration: 'none',
      mr: 2
    }}
  >
    SocialApp
  </Typography>
);

export default Logo;