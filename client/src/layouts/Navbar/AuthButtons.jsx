// src/layouts/Navbar/AuthButtons.jsx
import { Button } from '@mui/material';
import { Login } from '@mui/icons-material';
import { Link } from 'react-router-dom';

const AuthButtons = () => (
  <Button
    variant="contained"
    component={Link}
    to="/login"
    startIcon={<Login />}
    sx={{
      backgroundColor: '#1877F2',
      '&:hover': { backgroundColor: '#166FE5' }
    }}
  >
    Login
  </Button>
);

export default AuthButtons;