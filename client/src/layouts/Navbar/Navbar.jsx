import {
  Mail as FriendRequestsIcon,
  Group,
  Home,
  Login as LoginIcon,
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  People,
  Search as SearchIcon,
  Store,
} from '@mui/icons-material';
import {
  AppBar,
  Avatar,
  Badge,
  Box,
  Button,
  ClickAwayListener,
  Divider,
  Drawer,
  Grow,
  IconButton,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Paper,
  styled,
  Toolbar,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import NotificationPanel from '../../features/notification/NotificationPanel';
import { fetchUnreadCount } from '../../features/notification/notificationSlice';
import { showSnackbar } from '../../features/snackbar/snackbarSlice';
import { fetchAllUsers } from '../../features/user/userSlice';

// Components
import DesktopSearch from './DesktopSearch';
import DrawerContent from './DrawerContent';
import MobileSearch from './MobileSearch';
import NavItems from './NavItems';
import UserMenu from './UserMenu';

// Constants
const NAV_ITEMS = [
  { name: 'Home', icon: Home, path: '/', color: '#1877F2' },
  { name: 'Friends', icon: People, path: '/friends', color: '#1B74E4' },
  { name: 'Groups', icon: Group, path: '/groups', color: '#E44D2E' },
  { name: 'Marketplace', icon: Store, path: '/marketplace', color: '#42B72A' },
];

// Styled Components
const PulseBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    backgroundColor: '#FF4081',
    color: 'white',
    fontWeight: 'bold',
    boxShadow: `0 0 8px ${theme.palette.secondary.main}`,
    animation: 'pulse 1.5s infinite',
    '@keyframes pulse': {
      '0%': { boxShadow: '0 0 0 0 rgba(255, 64, 129, 0.7)' },
      '70%': { boxShadow: '0 0 0 10px rgba(255, 64, 129, 0)' },
      '100%': { boxShadow: '0 0 0 0 rgba(255, 64, 129, 0)' },
    },
  },
}));

const WhatsNewTooltip = styled(Paper)(({ theme }) => ({
  position: 'absolute',
  top: '100%',
  right: 0,
  marginTop: theme.spacing(1),
  minWidth: 200,
  zIndex: 9999,
  padding: theme.spacing(1),
  background: 'linear-gradient(135deg, #FF4081 0%, #FF9100 100%)',
  color: 'white',
  borderRadius: '12px',
  boxShadow: theme.shadows[6],
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: '100%',
    right: 10,
    borderWidth: '8px',
    borderStyle: 'solid',
    borderColor: 'transparent transparent #FF4081 transparent',
  },
}));

const NotificationBadge = ({ count, onClick }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <Box
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      sx={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <IconButton
        color="inherit"
        onClick={onClick}
        sx={{
          position: 'relative',
          transition: 'all 0.3s ease',
          transform: hovered ? 'scale(1.1)' : 'scale(1)',
        }}
      >
        <PulseBadge
          badgeContent={count}
          color="error"
          max={99}
          invisible={count === 0}
        >
          <NotificationsIcon
            sx={{
              color: hovered ? '#FF4081' : 'inherit',
              transition: 'color 0.3s ease',
            }}
          />
        </PulseBadge>
      </IconButton>

      {hovered && count > 0 && (
        <Grow in={hovered}>
          <WhatsNewTooltip>
            <Typography
              variant="subtitle2"
              sx={{ fontWeight: 'bold', textAlign: 'center' }}
            >
              {count} new {count === 1 ? 'update' : 'updates'}!
            </Typography>
            <Divider sx={{ my: 0.5, bgcolor: 'rgba(255,255,255,0.3)' }} />
            <Typography
              variant="caption"
              sx={{ display: 'block', textAlign: 'center' }}
            >
              Click to see what's new
            </Typography>
          </WhatsNewTooltip>
        </Grow>
      )}
    </Box>
  );
};

const Navbar = ({ onLogout }) => {
  // Hooks
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isMobile = useMediaQuery('(max-width:899px)');

  // Redux State
  const { profile, loggedIn, isAdmin } = useSelector((state) => state.user);
  const { unreadCount } = useSelector((state) => state.notifications);
  const pendingRequestsCount = useSelector(
    (state) => state.friendship.pendingRequests?.length || 0
  );

  // Local State
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [notificationDrawerOpen, setNotificationDrawerOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [searchInput, setSearchInput] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchFocused, setSearchFocused] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  // Derived Data
  const userData = {
    id: profile?.id || profile?.user?.id,
    firstName: profile?.firstName || profile?.user?.firstName || 'User',
    lastName: profile?.lastName || profile?.user?.lastName || '',
    image:
      profile?.profileImage ||
      profile?.user?.profileImage ||
      '/default-avatar.png',
    email: profile?.email || profile?.user?.email,
  };

  // Effects
  useEffect(() => {
    if (loggedIn) {
      const interval = setInterval(() => {
        dispatch(fetchUnreadCount());
      }, 30000); // Poll every 30 seconds

      // Initial fetch
      dispatch(fetchUnreadCount());

      return () => clearInterval(interval);
    }
  }, [dispatch, loggedIn]);

  // Handlers
  const handleSearch = useCallback(
    async (query) => {
      if (!query.trim()) {
        setSearchResults([]);
        return;
      }

      try {
        const result = await dispatch(
          fetchAllUsers({
            search: query,
            page: 1,
            limit: 5,
            excludeCurrent: true,
          })
        ).unwrap();

        setSearchResults(result?.users || []);
      } catch (error) {
        console.error('Search failed:', error);
        setSearchResults([]);
      }
    },
    [dispatch]
  );

  const toggleDrawer = useCallback(
    (open) => (event) => {
      if (
        event.type === 'keydown' &&
        (event.key === 'Tab' || event.key === 'Shift')
      )
        return;
      setDrawerOpen(open);
      if (!open) setMobileSearchOpen(false);
    },
    []
  );

  const handleMenuOpen = useCallback(
    (event) => setAnchorEl(event.currentTarget),
    []
  );
  const handleMenuClose = useCallback(() => setAnchorEl(null), []);

  const handleLogoutClick = useCallback(async () => {
    try {
      await onLogout();
      handleMenuClose();
    } catch (error) {
      console.error('Logout failed:', error);
      dispatch(
        showSnackbar({ message: 'Failed to logout', severity: 'error' })
      );
    }
  }, [onLogout, handleMenuClose, dispatch]);

  const handleSearchChange = useCallback(
    (value) => {
      setSearchInput(value);
      handleSearch(value);
    },
    [handleSearch]
  );

  // Render Functions
  const renderLogo = useCallback(
    () => (
      <Typography
        variant="h5"
        component={Link}
        to="/"
        sx={{
          fontWeight: 'bold',
          color: '#1877F2',
          textDecoration: 'none',
          mr: 2,
          '&:hover': { opacity: 0.9 },
        }}
      >
        SocialApp
      </Typography>
    ),
    []
  );

  const renderFriendRequests = useCallback(
    () => (
      <MenuItem
        component={Link}
        to="/friend-requests"
        onClick={handleMenuClose}
      >
        <ListItemIcon>
          <Badge badgeContent={pendingRequestsCount} color="error">
            <FriendRequestsIcon fontSize="small" />
          </Badge>
        </ListItemIcon>
        <ListItemText>Friend Requests</ListItemText>
      </MenuItem>
    ),
    [handleMenuClose, pendingRequestsCount]
  );

  const renderNotificationIcon = useCallback(
    () => (
      <ClickAwayListener onClickAway={() => {}}>
        <Box>
          <NotificationBadge
            count={unreadCount}
            onClick={() => setNotificationDrawerOpen(!notificationDrawerOpen)}
          />
        </Box>
      </ClickAwayListener>
    ),
    [notificationDrawerOpen, unreadCount]
  );

  const renderAuthButtons = useCallback(() => {
    if (!loggedIn) {
      return (
        <Button
          variant="contained"
          component={Link}
          to="/login"
          startIcon={<LoginIcon />}
          sx={{
            backgroundColor: '#1877F2',
            '&:hover': { backgroundColor: '#166FE5' },
            textTransform: 'none',
            borderRadius: 2,
            px: 2,
          }}
        >
          Login
        </Button>
      );
    }

    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {!isMobile && (
          <Typography variant="body1" sx={{ fontWeight: 500 }}>
            {userData.firstName} {userData.lastName}
          </Typography>
        )}
        {isMobile && (
          <IconButton onClick={() => setMobileSearchOpen(!mobileSearchOpen)}>
            <SearchIcon />
          </IconButton>
        )}
        {renderNotificationIcon()}
        <IconButton onClick={handleMenuOpen} color="inherit">
          <Avatar
            src={userData.image}
            sx={{
              width: 40,
              height: 40,
              border: '2px solid #fff',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            }}
          />
        </IconButton>
        <UserMenu
          anchorEl={anchorEl}
          userData={userData}
          isAdmin={isAdmin}
          handleMenuClose={handleMenuClose}
          handleLogout={handleLogoutClick}
          renderFriendRequests={renderFriendRequests}
        />
      </Box>
    );
  }, [
    loggedIn,
    isMobile,
    userData,
    renderNotificationIcon,
    handleMenuOpen,
    anchorEl,
    isAdmin,
    handleMenuClose,
    handleLogoutClick,
    renderFriendRequests,
    mobileSearchOpen,
  ]);

  return (
    <>
      <MobileSearch
        mobileSearchOpen={mobileSearchOpen}
        searchInput={searchInput}
        searchResults={searchResults}
        searchFocused={searchFocused}
        toggleMobileSearch={() => setMobileSearchOpen(!mobileSearchOpen)}
        handleSearchChange={handleSearchChange}
        handleSearchFocus={() => setSearchFocused(true)}
        handleSearchBlur={() => setTimeout(() => setSearchFocused(false), 200)}
        handleResultClick={() => {
          setSearchInput('');
          setSearchFocused(false);
          setMobileSearchOpen(false);
          setDrawerOpen(false);
        }}
      />

      <AppBar
        position="fixed"
        sx={{
          bgcolor: 'background.paper',
          color: 'text.primary',
          boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
          zIndex: (theme) => theme.zIndex.drawer + 1,
          top: isMobile && mobileSearchOpen ? '56px' : 0,
          transition: 'top 0.3s ease',
        }}
      >
        <Toolbar
          sx={{
            justifyContent: 'space-between',
            height: '56px',
            px: { xs: 1, sm: 2 },
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton
              edge="start"
              color="inherit"
              onClick={toggleDrawer(true)}
              sx={{ display: { xs: 'flex', md: 'none' }, mr: 1 }}
            >
              <MenuIcon />
            </IconButton>
            {renderLogo()}
          </Box>

          {loggedIn && !isMobile && (
            <Box
              sx={{
                display: 'flex',
                flexGrow: 1,
                justifyContent: 'center',
                maxWidth: '600px',
              }}
            >
              <NavItems items={NAV_ITEMS} />
            </Box>
          )}

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {loggedIn && !isMobile && (
              <DesktopSearch
                searchInput={searchInput}
                searchResults={searchResults}
                searchFocused={searchFocused}
                handleSearchChange={handleSearchChange}
                handleSearchFocus={() => setSearchFocused(true)}
                handleSearchBlur={() =>
                  setTimeout(() => setSearchFocused(false), 200)
                }
                handleResultClick={() => {
                  setSearchInput('');
                  setSearchFocused(false);
                }}
              />
            )}
            {renderAuthButtons()}
          </Box>
        </Toolbar>
      </AppBar>

      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={toggleDrawer(false)}
        sx={{
          '& .MuiDrawer-paper': {
            width: 280,
            boxSizing: 'border-box',
            top: isMobile && mobileSearchOpen ? '112px' : '56px',
            borderRight: 'none',
            boxShadow: '1px 0 5px rgba(0, 0, 0, 0.1)',
          },
        }}
      >
        <DrawerContent
          navItems={NAV_ITEMS}
          userData={userData}
          loggedIn={loggedIn}
          toggleDrawer={toggleDrawer}
          pendingRequestsCount={pendingRequestsCount}
        />
      </Drawer>

      <NotificationPanel
        open={notificationDrawerOpen}
        onClose={() => setNotificationDrawerOpen(false)}
      />
    </>
  );
};

export default Navbar;
