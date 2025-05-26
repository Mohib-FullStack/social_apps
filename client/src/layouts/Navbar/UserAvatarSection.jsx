// src/layouts/Navbar/UserAvatarSection.jsx
import { Box, IconButton, Typography, Avatar, Badge } from '@mui/material';
import { Search as SearchIcon, Notifications } from '@mui/icons-material';
import { Link } from 'react-router-dom';

const UserAvatarSection = ({
  isMobile,
  userData,
  handleMenuOpen,
  toggleMobileSearch,
  loggedIn
}) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
    {loggedIn && (
      <IconButton color="inherit" component={Link} to="/notifications">
        <Badge badgeContent={4} color="error">
          <Notifications />
        </Badge>
      </IconButton>
    )}

    {loggedIn && (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {!isMobile && (
          <Typography variant="body1">
            {userData.firstName} {userData.lastName}
          </Typography>
        )}
        {isMobile && (
          <IconButton onClick={toggleMobileSearch}>
            <SearchIcon />
          </IconButton>
        )}
        <IconButton onClick={handleMenuOpen} color="inherit">
          <Avatar 
            src={userData.image}
            sx={{
              width: 40,
              height: 40,
              border: '2px solid #fff',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
          />
        </IconButton>
      </Box>
    )}
  </Box>
);

export default UserAvatarSection;