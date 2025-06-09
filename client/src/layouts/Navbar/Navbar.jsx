import {
  Mail as FriendRequestsIcon,
  Group,
  Home,
  Login,
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  People,
  Search as SearchIcon,
  Store
} from '@mui/icons-material';
import {
  AppBar,
  Avatar,
  Badge,
  Box,
  Button,
  Drawer,
  IconButton,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Toolbar,
  Typography,
  useMediaQuery
} from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import NotificationPanel from '../../features/notification/NotificationPanel';
import { fetchUnreadCount } from '../../features/notification/notificationSlice';
import { showSnackbar } from '../../features/snackbar/snackbarSlice';
import { fetchAllUsers, fetchUserProfile, logoutUser } from '../../features/user/userSlice';
import DesktopSearch from './DesktopSearch';
import DrawerContent from './DrawerContent';
import MobileSearch from './MobileSearch';
import NavItems from './NavItems';
import UserMenu from './UserMenu';

const NAV_ITEMS = [
  { name: 'Home', icon: Home, path: '/', color: '#1877F2' },
  { name: 'Friends', icon: People, path: '/friends', color: '#1B74E4' },
  { name: 'Groups', icon: Group, path: '/groups', color: '#E44D2E' },
  { name: 'Marketplace', icon: Store, path: '/marketplace', color: '#42B72A' },
];

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isMobile = useMediaQuery('(max-width:899px)');
  
  // Redux state
  const { profile, loggedIn, isAdmin } = useSelector((state) => state.user);
  const { unreadCount } = useSelector(state => state.notifications);
  const pendingRequestsCount = useSelector(state => state.friendship.pendingRequests?.length || 0);

  // Local state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [notificationDrawerOpen, setNotificationDrawerOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [searchInput, setSearchInput] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchFocused, setSearchFocused] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  // User data
  const userData = {
    id: profile?.id || profile?.user?.id,
    firstName: profile?.firstName || profile?.user?.firstName || 'User',
    lastName: profile?.lastName || profile?.user?.lastName || '',
    image: profile?.profileImage || profile?.user?.profileImage || '/default-avatar.png',
    email: profile?.email || profile?.user?.email
  };

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token && !profile) {
      dispatch(fetchUserProfile())
        .unwrap()
        .catch(error => {
          console.error('Failed to fetch user profile:', error);
          dispatch(showSnackbar({
            message: 'Failed to load user data',
            severity: 'error'
          }));
        });
    }
  }, [dispatch, loggedIn, profile]);

  useEffect(() => {
    if (loggedIn) {
      dispatch(fetchUnreadCount());
    }
  }, [dispatch, loggedIn]);

  const handleSearch = useCallback(async (query) => {
    try {
      const result = await dispatch(fetchAllUsers({
        search: query,
        page: 1,
        limit: 5,
        excludeCurrent: true
      })).unwrap();
      
      if (result?.users) {
        setSearchResults(result.users);
      }
    } catch (error) {
      console.error('Search failed:', error);
      setSearchResults([]);
    }
  }, [dispatch]);

  const toggleDrawer = (open) => (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) return;
    setDrawerOpen(open);
    if (!open) setMobileSearchOpen(false);
  };

  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      dispatch(showSnackbar({ 
        message: 'Successfully logged out', 
        severity: 'success' 
      }));
      navigate('/login');
      setTimeout(() => {
        window.location.reload();
      }, 100);
    } catch (error) {
      console.error('Logout failed:', error);
      dispatch(showSnackbar({
        message: 'Failed to logout',
        severity: 'error'
      }));
    } finally {
      handleMenuClose();
    }
  };

  const handleSearchChange = (value) => {
    setSearchInput(value);
    if (value.trim()) {
      handleSearch(value);
    } else {
      setSearchResults([]);
    }
  };

  const renderLogo = () => (
    <Typography
      variant="h5"
      component={Link}
      to="/"
      sx={{
        fontWeight: 'bold',
        color: '#1877F2',
        textDecoration: 'none',
        mr: 2,
        '&:hover': { opacity: 0.9 }
      }}
    >
      SocialApp
    </Typography>
  );

  const renderFriendRequests = () => (
    <MenuItem component={Link} to="/friend-requests" onClick={handleMenuClose}>
      <ListItemIcon>
        <Badge badgeContent={pendingRequestsCount} color="error">
          <FriendRequestsIcon fontSize="small" />
        </Badge>
      </ListItemIcon>
      <ListItemText>Friend Requests</ListItemText>
    </MenuItem>
  );

  const renderNotificationIcon = () => (
    <IconButton 
      color="inherit" 
      onClick={() => setNotificationDrawerOpen(!notificationDrawerOpen)}
      sx={{ position: 'relative' }}
    >
      <Badge 
        badgeContent={unreadCount} 
        color="error" 
        max={9}
        invisible={unreadCount === 0}
      >
        <NotificationsIcon />
      </Badge>
    </IconButton>
  );

  const renderAuthButtons = () => (
    loggedIn ? (
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
              cursor: 'pointer'
            }}
          />
        </IconButton>
        <UserMenu
          anchorEl={anchorEl}
          userData={userData}
          isAdmin={isAdmin}
          handleMenuClose={handleMenuClose}
          handleLogout={handleLogout}
          renderFriendRequests={renderFriendRequests}
        />
      </Box>
    ) : (
      <Button
        variant="contained"
        component={Link}
        to="/login"
        startIcon={<Login />}
        sx={{
          backgroundColor: '#1877F2',
          '&:hover': { backgroundColor: '#166FE5' },
          textTransform: 'none',
          borderRadius: 2,
          px: 2
        }}
      >
        Login
      </Button>
    )
  );

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
          transition: 'top 0.3s ease'
        }}
      >
        <Toolbar sx={{ 
          justifyContent: 'space-between', 
          height: '56px',
          px: { xs: 1, sm: 2 }
        }}>
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
            <Box sx={{ 
              display: 'flex', 
              flexGrow: 1, 
              justifyContent: 'center',
              maxWidth: '600px'
            }}>
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
                handleSearchBlur={() => setTimeout(() => setSearchFocused(false), 200)}
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
            boxShadow: '1px 0 5px rgba(0, 0, 0, 0.1)'
          }
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

      {/* Notification Panel */}
      <NotificationPanel 
        open={notificationDrawerOpen}
        onClose={() => setNotificationDrawerOpen(false)}
      />
    </>
  );
};

export default Navbar;







//! running
// import { useState, useEffect, useCallback } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { Link, useNavigate } from 'react-router-dom';
// import {
//   AppBar,
//   Avatar,
//   Badge,
//   Box,
//   Button,
//   Drawer,
//   IconButton,
//   Toolbar,
//   Typography,
//   useMediaQuery,
//   MenuItem,
//   ListItemIcon,
//   ListItemText
// } from '@mui/material';
// import {
//   Menu as MenuIcon,
//   Home,
//   People,
//   Group,
//   Store,
//   Search as SearchIcon,
//   Login,
//   Mail as FriendRequestsIcon,
//   Notifications as NotificationsIcon
// } from '@mui/icons-material';
// import { showSnackbar } from '../../features/snackbar/snackbarSlice';
// import { fetchUserProfile, logoutUser, logout, refreshAccessToken, fetchAllUsers } from '../../features/user/userSlice';
// import { fetchUnreadCount } from '../../features/notification/notificationSlice';
// import DesktopSearch from './DesktopSearch';
// import MobileSearch from './MobileSearch';
// import NavItems from './NavItems';
// import UserMenu from './UserMenu';
// import DrawerContent from './DrawerContent';

// // Constants
// const NAV_ITEMS = [
//   { name: 'Home', icon: Home, path: '/', color: '#1877F2' },
//   { name: 'Friends', icon: People, path: '/friends', color: '#1B74E4' },
//   { name: 'Groups', icon: Group, path: '/groups', color: '#E44D2E' },
//   { name: 'Marketplace', icon: Store, path: '/marketplace', color: '#42B72A' },
// ];

// const Navbar = () => {
//   // Hooks
//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const isMobile = useMediaQuery('(max-width:899px)');
  
//   // Redux state
//   const { profile, loggedIn, isAdmin } = useSelector((state) => state.user);
//   const { unreadCount } = useSelector(state => state.notifications);
//   const pendingRequestsCount = useSelector(state => state.friendship.pendingRequests?.length || 0);

//   // Local state
//   const [drawerOpen, setDrawerOpen] = useState(false);
//   const [anchorEl, setAnchorEl] = useState(null);
//   const [searchInput, setSearchInput] = useState('');
//   const [searchResults, setSearchResults] = useState([]);
//   const [searchFocused, setSearchFocused] = useState(false);
//   const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

//   // Derived state
//   const userData = {
//     id: profile?.id || profile?.user?.id,
//     firstName: profile?.firstName || profile?.user?.firstName || 'User',
//     lastName: profile?.lastName || profile?.user?.lastName || '',
//     image: profile?.profileImage || profile?.user?.profileImage || '/default-avatar.png',
//     email: profile?.email || profile?.user?.email
//   };

//   // Effects
//   useEffect(() => {
//     const token = localStorage.getItem('accessToken');
//     if (token && !profile) {
//       dispatch(fetchUserProfile())
//         .unwrap()
//         .catch(error => {
//           console.error('Failed to fetch user profile:', error);
//           dispatch(showSnackbar({
//             message: 'Failed to load user data',
//             severity: 'error'
//           }));
//         });
//     }
//   }, [dispatch, loggedIn, profile]);

//   useEffect(() => {
//     if (loggedIn) {
//       dispatch(fetchUnreadCount());
//     }
//   }, [dispatch, loggedIn]);

//   useEffect(() => {
//     const delayDebounceFn = setTimeout(() => {
//       if (searchInput.trim()) {
//         handleSearch(searchInput);
//       } else {
//         setSearchResults([]);
//       }
//     }, 300);

//     return () => clearTimeout(delayDebounceFn);
//   }, [searchInput]);

//   // Handlers
//   const handleSearch = useCallback(async (query) => {
//     try {
//       const result = await dispatch(fetchAllUsers({
//         search: query,
//         page: 1,
//         limit: 5,
//         excludeCurrent: true
//       })).unwrap();
      
//       if (result?.users) {
//         setSearchResults(result.users);
//       }
//     } catch (error) {
//       console.error('Search failed:', error);
//       setSearchResults([]);
//     }
//   }, [dispatch]);

//   const toggleDrawer = (open) => (event) => {
//     if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) return;
//     setDrawerOpen(open);
//     if (!open) setMobileSearchOpen(false);
//   };

//   const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
//   const handleMenuClose = () => setAnchorEl(null);

//   const handleLogout = async () => {
//   try {
//     // Dispatch logoutUser and wait for it to complete
//     await dispatch(logoutUser()).unwrap();
    
//     // Show success message
//     dispatch(showSnackbar({ 
//       message: 'Successfully logged out', 
//       severity: 'success' 
//     }));
    
//     // Navigate to login page
//     navigate('/login');
    
//     // Force a small delay and refresh to ensure clean state
//     setTimeout(() => {
//       window.location.reload();
//     }, 100);
    
//   } catch (error) {
//     console.error('Logout failed:', error);
//     dispatch(showSnackbar({
//       message: 'Failed to logout',
//       severity: 'error'
//     }));
//   } finally {
//     handleMenuClose();
//   }
// };

//   const handleSearchChange = (value) => setSearchInput(value);
//   const handleSearchFocus = () => setSearchFocused(true);
//   const handleSearchBlur = () => setTimeout(() => setSearchFocused(false), 200);
//   const handleResultClick = () => {
//     setSearchInput('');
//     setSearchFocused(false);
//     setMobileSearchOpen(false);
//     setDrawerOpen(false);
//   };
//   const toggleMobileSearch = () => setMobileSearchOpen(!mobileSearchOpen);

//   // Render helpers
//   const renderLogo = () => (
//     <Typography
//       variant="h5"
//       component={Link}
//       to="/"
//       sx={{
//         fontWeight: 'bold',
//         color: '#1877F2',
//         textDecoration: 'none',
//         mr: 2,
//         '&:hover': {
//           opacity: 0.9
//         }
//       }}
//     >
//       SocialApp
//     </Typography>
//   );

//   const renderFriendRequests = () => (
//     <MenuItem 
//       component={Link} 
//       to="/friend-requests"
//       onClick={handleMenuClose}
//     >
//       <ListItemIcon>
//         <Badge badgeContent={pendingRequestsCount} color="error">
//           <FriendRequestsIcon fontSize="small" />
//         </Badge>
//       </ListItemIcon>
//       <ListItemText>Friend Requests</ListItemText>
//     </MenuItem>
//   );

//   const renderNotificationIcon = () => (
//     // <IconButton 
//     //   color="inherit" 
//     //   component={Link} 
//     //   to="/notifications"
//     //   sx={{ position: 'relative' }}
//     // >
//     //   <Badge 
//     //     badgeContent={unreadCount} 
//     //     color="error" 
//     //     max={9}
//     //     invisible={unreadCount === 0}
//     //   >
//     //     <NotificationsIcon />
//     //   </Badge>
//     // </IconButton>

//     // Change the notification icon to toggle the drawer instead of navigating
// <IconButton 
//   color="inherit" 
//   onClick={() => navigate('/notifications')}
//   sx={{ position: 'relative' }}
// >
//   <Badge 
//     badgeContent={unreadCount} 
//     color="error" 
//     max={9}
//     invisible={unreadCount === 0}
//   >
//     <NotificationsIcon />
//   </Badge>
// </IconButton>
//   );

//   const renderAuthButtons = () => (
//     loggedIn ? (
//       <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
//         {!isMobile && (
//           <Typography variant="body1" sx={{ fontWeight: 500 }}>
//             {userData.firstName} {userData.lastName}
//           </Typography>
//         )}
//         {isMobile && (
//           <IconButton onClick={toggleMobileSearch}>
//             <SearchIcon />
//           </IconButton>
//         )}
//         <IconButton onClick={handleMenuOpen} color="inherit">
//           <Avatar 
//             src={userData.image}
//             sx={{
//               width: 40,
//               height: 40,
//               border: '2px solid #fff',
//               boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
//               cursor: 'pointer'
//             }}
//           />
//         </IconButton>
//         <UserMenu
//           anchorEl={anchorEl}
//           userData={userData}
//           isAdmin={isAdmin}
//           handleMenuClose={handleMenuClose}
//           handleLogout={handleLogout}
//           renderFriendRequests={renderFriendRequests}
//         />
//       </Box>
//     ) : (
//       <Button
//         variant="contained"
//         component={Link}
//         to="/login"
//         startIcon={<Login />}
//         sx={{
//           backgroundColor: '#1877F2',
//           '&:hover': { backgroundColor: '#166FE5' },
//           textTransform: 'none',
//           borderRadius: 2,
//           px: 2
//         }}
//       >
//         Login
//       </Button>
//     )
//   );

//   return (
//     <>
//       <MobileSearch
//         mobileSearchOpen={mobileSearchOpen}
//         searchInput={searchInput}
//         searchResults={searchResults}
//         searchFocused={searchFocused}
//         toggleMobileSearch={toggleMobileSearch}
//         handleSearchChange={handleSearchChange}
//         handleSearchFocus={handleSearchFocus}
//         handleSearchBlur={handleSearchBlur}
//         handleResultClick={handleResultClick}
//       />

//       <AppBar 
//         position="fixed" 
//         sx={{ 
//           bgcolor: 'background.paper', 
//           color: 'text.primary',
//           boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
//           zIndex: (theme) => theme.zIndex.drawer + 1,
//           top: isMobile && mobileSearchOpen ? '56px' : 0,
//           transition: 'top 0.3s ease'
//         }}
//       >
//         <Toolbar sx={{ 
//           justifyContent: 'space-between', 
//           height: '56px',
//           px: { xs: 1, sm: 2 }
//         }}>
//           <Box sx={{ display: 'flex', alignItems: 'center' }}>
//             <IconButton
//               edge="start"
//               color="inherit"
//               onClick={toggleDrawer(true)}
//               sx={{ display: { xs: 'flex', md: 'none' }, mr: 1 }}
//             >
//               <MenuIcon />
//             </IconButton>
//             {renderLogo()}
//           </Box>

//           {loggedIn && !isMobile && (
//             <Box sx={{ 
//               display: 'flex', 
//               flexGrow: 1, 
//               justifyContent: 'center',
//               maxWidth: '600px'
//             }}>
//               <NavItems items={NAV_ITEMS} />
//             </Box>
//           )}

//           <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
//             {loggedIn && !isMobile && (
//               <DesktopSearch
//                 searchInput={searchInput}
//                 searchResults={searchResults}
//                 searchFocused={searchFocused}
//                 handleSearchChange={handleSearchChange}
//                 handleSearchFocus={handleSearchFocus}
//                 handleSearchBlur={handleSearchBlur}
//                 handleResultClick={handleResultClick}
//               />
//             )}
            
//             {loggedIn && renderNotificationIcon()}
//             {renderAuthButtons()}
//           </Box>
//         </Toolbar>
//       </AppBar>

//       <Drawer 
//         anchor="left" 
//         open={drawerOpen} 
//         onClose={toggleDrawer(false)}
//         sx={{
//           '& .MuiDrawer-paper': {
//             width: 280,
//             boxSizing: 'border-box',
//             top: isMobile && mobileSearchOpen ? '112px' : '56px',
//             borderRight: 'none',
//             boxShadow: '1px 0 5px rgba(0, 0, 0, 0.1)'
//           }
//         }}
//       >
//         <DrawerContent
//           navItems={NAV_ITEMS}
//           userData={userData}
//           loggedIn={loggedIn}
//           toggleDrawer={toggleDrawer}
//           pendingRequestsCount={pendingRequestsCount}
//         />
//       </Drawer>
//     </>
//   );
// };

// export default Navbar;




















