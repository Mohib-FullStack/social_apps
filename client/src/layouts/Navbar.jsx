import {
  AccountCircle as AccountCircleIcon,
  ContactMail as ContactMailIcon,
  ExitToApp as ExitToAppIcon,
  People as FriendsIcon,
  Group as GroupsIcon,
  Home as HomeIcon,
  Login as LoginIcon,
  Store as MarketplaceIcon,
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import {
  AppBar,
  Avatar,
  Badge,
  Box,
  Button,
  Divider,
  Drawer,
  IconButton,
  InputBase,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Toolbar,
  Typography
} from '@mui/material';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { showSnackbar } from '../features/snackbar/snackbarSlice';
import {
  fetchUserProfile,
  logoutUser,
  logoutUserReducer,
  refreshAccessToken,
} from '../features/user/userSlice';

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { profile, loggedIn, isAdmin } = useSelector((state) => state.user);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const isMenuOpen = Boolean(anchorEl);

  const facebookBlue = '#1877F2';
  const bgGray = '#F0F2F5';
  const activeColor = '#1877F2';
  const hoverColor = '#E7F3FF';

  const navItems = [
    { name: 'Home', icon: HomeIcon, path: '/', color: activeColor },
    { name: 'Friends', icon: FriendsIcon, path: '/friends', color: '#1B74E4' },
    { name: 'Groups', icon: GroupsIcon, path: '/groups', color: '#E44D2E' },
    { name: 'Marketplace', icon: MarketplaceIcon, path: '/marketplace', color: '#42B72A' }
  ];

  const toggleDrawer = (open) => (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    setDrawerOpen(open);
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    dispatch(logoutUser());
    dispatch(logoutUserReducer());
    dispatch(showSnackbar({ message: 'Successfully logged out', severity: 'success' }));
    handleMenuClose();
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      if (loggedIn && !profile) {
        dispatch(fetchUserProfile());
      } else if (!loggedIn) {
        dispatch(refreshAccessToken())
          .unwrap()
          .then(() => {
            dispatch(fetchUserProfile());
          })
          .catch((error) => {
            console.error('Failed to refresh token', error);
            dispatch(logoutUser());
          });
      }
    }
  }, [loggedIn, profile, dispatch]);

  // Get user data from profile or use defaults
  const userFirstName = profile?.user?.firstName || 'User';
  const userLastName = profile?.user?.lastName || 'Unknown';
  const userImage = profile?.user?.profileImage || '/default-avatar.png';

  return (
    <>
      <AppBar position="fixed" sx={{ bgcolor: 'white', color: 'black', boxShadow: 'none' }}>
        <Toolbar sx={{ justifyContent: 'space-between', height: '56px' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={toggleDrawer(true)}
              sx={{ display: { xs: 'block', md: 'none' }, mr: 1 }}
            >
              <MenuIcon />
            </IconButton>
            <Typography
              variant="h5"
              component={Link}
              to="/"
              sx={{ fontWeight: 'bold', color: facebookBlue, textDecoration: 'none', mr: 2 }}
            >
              SocialApp
            </Typography>
          </Box>

          {loggedIn && (
            <Box sx={{ display: { xs: 'none', md: 'flex' }, flexGrow: 1, justifyContent: 'center', gap: 1, maxWidth: '600px' }}>
              {navItems.map((item) => (
                <Button
                  key={item.name}
                  component={Link}
                  to={item.path}
                  sx={{ minWidth: '110px', height: '48px', borderRadius: '8px', '&:hover': { backgroundColor: hoverColor } }}
                >
                  <item.icon sx={{ color: item.color, fontSize: '28px', mr: 1 }} />
                  <Typography variant="body2" sx={{ color: 'text.primary' }}>{item.name}</Typography>
                </Button>
              ))}
            </Box>
          )}

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {loggedIn && (
              <Box component="form" onSubmit={handleSearch} sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', borderRadius: '50px', backgroundColor: bgGray, '&:hover': { backgroundColor: '#E4E6E9' }, width: '240px', height: '40px', mr: 2 }}>
                <IconButton type="submit" sx={{ p: '8px', color: 'text.secondary' }}>
                  <SearchIcon />
                </IconButton>
                <InputBase placeholder="Search SocialApp" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} sx={{ ml: 1, flex: 1 }} />
              </Box>
            )}
            {loggedIn && (
              <IconButton color="inherit" component={Link} to="/notifications">
                <Badge badgeContent={4} color="error">
                  <NotificationsIcon />
                </Badge>
              </IconButton>
            )}
            {loggedIn ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body1" sx={{ display: { xs: 'none', md: 'block' } }}>{userFirstName} {userLastName}</Typography>
                <IconButton edge="end" aria-controls="menu-appbar" aria-haspopup="true" onClick={handleMenuOpen} color="inherit">
                  <Avatar 
                    src={userImage} 
                    alt={`${userFirstName} ${userLastName}`}
                    sx={{ 
                      width: 40, 
                      height: 40,
                      border: '2px solid #fff',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}
                  />
                </IconButton>
                <Menu 
                  id="menu-appbar" 
                  anchorEl={anchorEl} 
                  open={isMenuOpen} 
                  onClose={handleMenuClose}
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                  }}
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                >
                  <MenuItem sx={{ pointerEvents: 'none' }}>
                    <Avatar 
                      src={userImage} 
                      sx={{ width: 40, height: 40, mr: 2 }}
                    />
                    <Box>
                      <Typography variant="subtitle1">{userFirstName} {userLastName}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {profile?.user?.email}
                      </Typography>
                    </Box>
                  </MenuItem>
                  <Divider />
                  <MenuItem component={Link} to="/profile/private" onClick={handleMenuClose}>
                    <AccountCircleIcon sx={{ mr: 1, color: 'primary.main' }} />
                    My Profile
                  </MenuItem>
                  {isAdmin && (
                    <MenuItem component={Link} to="/admin" onClick={handleMenuClose}>
                      <AccountCircleIcon sx={{ mr: 1, color: 'secondary.main' }} />
                      Admin Panel
                    </MenuItem>
                  )}
                  <Divider />
                  <MenuItem onClick={handleLogout}>
                    <ExitToAppIcon sx={{ mr: 1, color: 'error.main' }} />
                    Logout
                  </MenuItem>
                </Menu>
              </Box>
            ) : (
              <Button 
                color="inherit" 
                component={Link} 
                to="/login"
                sx={{
                  backgroundColor: facebookBlue,
                  color: 'white',
                  '&:hover': {
                    backgroundColor: '#166FE5'
                  }
                }}
              >
                <LoginIcon sx={{ mr: 1 }} />
                Login
              </Button>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      <Drawer anchor="left" open={drawerOpen} onClose={toggleDrawer(false)}>
        <Box sx={{ width: 250 }} role="presentation" onClick={toggleDrawer(false)} onKeyDown={toggleDrawer(false)}>
          <List>
            {loggedIn && (
              <ListItem>
                <Box component="form" onSubmit={handleSearch} sx={{ display: 'flex', alignItems: 'center', width: '100%', borderRadius: '50px', backgroundColor: bgGray, p: '4px 8px' }}>
                  <IconButton type="submit" size="small">
                    <SearchIcon />
                  </IconButton>
                  <InputBase placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} sx={{ ml: 1, flex: 1 }} />
                </Box>
              </ListItem>
            )}
            {loggedIn && (
              <ListItem component={Link} to="/profile/private" sx={{ '&:hover': { backgroundColor: hoverColor } }}>
                <Avatar 
                  src={userImage} 
                  sx={{ width: 40, height: 40, mr: 2 }}
                />
                <Typography variant="body1">{userFirstName} {userLastName}</Typography>
              </ListItem>
            )}
            {loggedIn && navItems.map((item) => (
              <ListItem key={item.name} component={Link} to={item.path} sx={{ '&:hover': { backgroundColor: hoverColor } }}>
                <ListItemIcon>
                  <item.icon sx={{ color: item.color }} />
                </ListItemIcon>
                <ListItemText primary={item.name} />
              </ListItem>
            ))}
            <ListItem component={Link} to="/contact-us">
              <ListItemIcon>
                <ContactMailIcon color="info" />
              </ListItemIcon>
              <ListItemText primary="Contact Us" />
            </ListItem>
            {!loggedIn && (
              <ListItem component={Link} to="/login">
                <ListItemIcon>
                  <LoginIcon color="success" />
                </ListItemIcon>
                <ListItemText primary="Login" />
              </ListItem>
            )}
          </List>
        </Box>
      </Drawer>
    </>
  );
};

export default Navbar;










