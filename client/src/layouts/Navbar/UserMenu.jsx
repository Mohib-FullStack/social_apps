import { Menu, MenuItem, Avatar, Box, Typography, Divider } from '@mui/material';
import { AccountCircle, ExitToApp } from '@mui/icons-material';
import { Link } from 'react-router-dom';

const UserMenu = ({ 
  anchorEl, 
  userData, 
  isAdmin,
  handleMenuClose,
  handleLogout
}) => {
  return (
    <Menu
      anchorEl={anchorEl}
      open={Boolean(anchorEl)}
      onClose={handleMenuClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
    >
      <MenuItem sx={{ pointerEvents: 'none' }}>
        <Avatar src={userData.image} sx={{ width: 40, height: 40, mr: 2 }} />
        <Box>
          <Typography variant="subtitle1">
            {userData.firstName} {userData.lastName}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {userData.email}
          </Typography>
        </Box>
      </MenuItem>
      <Divider />
      <MenuItem component={Link} to="/profile/me" onClick={handleMenuClose}>
        <AccountCircle sx={{ mr: 1, color: 'primary.main' }} />
        My Profile
      </MenuItem>
      {isAdmin && (
        <MenuItem component={Link} to="/admin" onClick={handleMenuClose}>
          <AccountCircle sx={{ mr: 1, color: 'secondary.main' }} />
          Admin Panel
        </MenuItem>
      )}
      <Divider />
      <MenuItem onClick={handleLogout}>
        <ExitToApp sx={{ mr: 1, color: 'error.main' }} />
        Logout
      </MenuItem>
    </Menu>
  );
};

export default UserMenu;