import {
  AccountCircle as AccountCircleIcon,
  ContactMail as ContactMailIcon,
  Dashboard as DashboardIcon,
  ExitToApp as ExitToAppIcon,
  Home as HomeIcon,
  Login as LoginIcon,
  Menu as MenuIcon,
  VpnKey as PasswordIcon,
  // ShoppingCart as ShoppingCartIcon,
} from '@mui/icons-material';
import ChatIcon from '@mui/icons-material/Chat';
import {
  AppBar,
  Avatar,
  Badge,
  Box,
  Button,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
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
  const isMenuOpen = Boolean(anchorEl);

  const toggleDrawer = (open) => (event) => {
    if (
      event.type === 'keydown' &&
      (event.key === 'Tab' || event.key === 'Shift')
    ) {
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
    dispatch(
      showSnackbar({ message: 'Successfully logged out', severity: 'success' })
    );
    handleMenuClose();
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

  const userFirstName = profile?.user?.firstName || 'User';
const userLastName = profile?.user?.lastName || 'Unknown';
 const userImage = profile?.user?.image || '/assets/images/default-avatar.png';

  // const { items: cartItems } = useSelector((state) => state.cart);
  // const cartCount = Array.isArray(cartItems)
  //   ? cartItems.reduce((total, item) => total + (item.quantity || 0), 0)
  //   : 0;

  return (
    <>


<AppBar position="fixed">
  <Toolbar sx={{ justifyContent: 'space-between' }}>
    {/* Menu Icon for Small Screens */}
    <Box sx={{ display: { xs: 'block', md: 'none' } }}>
      <IconButton
        edge="start"
        color="inherit"
        aria-label="menu"
        onClick={toggleDrawer(true)}
      >
        <MenuIcon />
      </IconButton>
    </Box>

    {/* Centered buttons (Home, Cart, Product) */}
    <Box sx={{ 
        display: { xs: 'none', sm: 'none', md: 'flex' }, 
        justifyContent: 'center', 
        flexGrow: 1, 
        gap: 2 
      }}>
      <Button color="inherit" component={Link} to="/">
        <HomeIcon />
        Home
      </Button>

       {/* Add to your navigation buttons */}
<Button color="inherit" component={Link} to="/chat">
  <ChatIcon />
  Messages
</Button>

      {/* <Button color="inherit" component={Link} to="/cart-page">
        <Badge badgeContent={cartCount} color="secondary">
          <ShoppingCartIcon />
        </Badge>
        Cart
      </Button> */}

      {/* <Button color="inherit" component={Link} to="/product-display">
        <ShoppingCartIcon />
        Product
      </Button> */}
    </Box>

    {/* Admin Dashboard Button (conditionally displayed for admin) */}
    {isAdmin && (
      <Button color="inherit" component={Link} to="/admin-dashboard">
        <DashboardIcon />
        Admin Dashboard
      </Button>
    )}

    {/* User Authentication (Login/Logout and Profile) */}
    {loggedIn ? (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography
          variant="body1"
          sx={{ display: { xs: 'none', md: 'block' } }}
        >
          {userFirstName} {userLastName}
        </Typography>
        <IconButton
          edge="end"
          aria-controls="menu-appbar"
          aria-haspopup="true"
          onClick={handleMenuOpen}
          color="inherit"
        >
          <Avatar
            src={userImage}
            alt={`${userFirstName} ${userLastName}`}
          />
        </IconButton>
        <Menu
          id="menu-appbar"
          anchorEl={anchorEl}
          open={isMenuOpen}
          onClose={handleMenuClose}
        >
          <MenuItem>{`Hello, ${userFirstName} ${userLastName}`}</MenuItem>
          <MenuItem component={Link} to="/profile">
            <AccountCircleIcon />
            My Profile
          </MenuItem>
          <MenuItem onClick={handleLogout}>
            <ExitToAppIcon />
            Logout
          </MenuItem>
        </Menu>
      </Box>
    ) : (
      <Button color="inherit" component={Link} to="/login">
        <LoginIcon />
        Login
      </Button>
    )}
  </Toolbar>
</AppBar>



      <Drawer anchor="left" open={drawerOpen} onClose={toggleDrawer(false)}>
        <Box
          sx={{ width: 250 }}
          role="presentation"
          onClick={toggleDrawer(false)}
          onKeyDown={toggleDrawer(false)}
        >
          <List>
            <ListItem component={Link} to="/">
              <ListItemIcon>
                <HomeIcon color="primary" />
              </ListItemIcon>
              <ListItemText primary="Home" />
            </ListItem>

            {/* <ListItem component={Link} to="/product-display">
              <ListItemIcon>
                <HomeIcon color="primary" />
              </ListItemIcon>
              <ListItemText primary="Product" />
            </ListItem> */}

            {/* <ListItem component={Link} to="/cart-page">
              <ListItemIcon>
                <ShoppingCartIcon color="secondary" />
              </ListItemIcon>
              <ListItemText primary={`Cart (${cartCount})`} />
            </ListItem> */}

            <ListItem component={Link} to="/contact-us">
              <ListItemIcon>
                <ContactMailIcon color="info" />
              </ListItemIcon>
              <ListItemText primary="Contact Us" />
            </ListItem>

            <ListItem component={Link} to="/dashboard">
              <ListItemIcon>
                <DashboardIcon color="success" />
              </ListItemIcon>
              <ListItemText primary="Dashboard" />
            </ListItem>

            {loggedIn && (
              <>
                <ListItem component={Link} to="/profile">
                  <ListItemIcon>
                    <AccountCircleIcon color="info" />
                  </ListItemIcon>
                  <ListItemText primary="Profile" />
                </ListItem>
                <ListItem component={Link} to="/update-password">
                  <ListItemIcon>
                    <PasswordIcon color="warning" />
                  </ListItemIcon>
                  <ListItemText primary="Update Password" />
                </ListItem>
                <ListItem onClick={handleLogout}>
                  <ListItemIcon>
                    <ExitToAppIcon color="error" />
                  </ListItemIcon>
                  <ListItemText primary="Logout" />
                </ListItem>
              </>
            )}
          </List>
        </Box>
      </Drawer>
    </>
  );
};

export default Navbar;

//! Ecommerce
