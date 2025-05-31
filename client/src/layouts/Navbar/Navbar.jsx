// src/layouts/Navbar/Navbar.jsx
// import {
//   Group,
//   Home,
//   Menu as MenuIcon,
//   People,
//   Store
// } from '@mui/icons-material';
// import {
//   AppBar,
//   Box,
//   Drawer,
//   IconButton,
//   Toolbar,
//   useMediaQuery
// } from '@mui/material';
// import { useEffect, useState } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { useNavigate } from 'react-router-dom';
// import { showSnackbar } from '../../features/snackbar/snackbarSlice';
// // import { fetchAllUsers, fetchUserProfile, logoutUser, logoutUserReducer } from '../../features/user/userSlice';
// import { fetchAllUsers, fetchUserProfile, logoutUser } from '../../features/user/userSlice';
// import AuthButtons from './AuthButtons';
// import DesktopSearch from './DesktopSearch';
// import DrawerContent from './DrawerContent';
// import Logo from './Logo';
// import MobileSearch from './MobileSearch';
// import NavItems from './NavItems';
// import UserAvatarSection from './UserAvatarSection';
// import UserMenu from './UserMenu';

// // Constants
// const NAV_ITEMS = [
//   { name: 'Home', icon: Home, path: '/', color: '#1877F2' },
//     { name: 'UserTable', icon: Home, path: '/user-table', color: '#1877F2' },
//   { name: 'Friends', icon: People, path: '/friends', color: '#1B74E4' },
//   { name: 'Groups', icon: Group, path: '/groups', color: '#E44D2E' },
//   { name: 'Marketplace', icon: Store, path: '/marketplace', color: '#42B72A' },
// ];


// const Navbar = () => {
//   // Hooks
//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const isMobile = useMediaQuery('(max-width:899px)');
//   const { profile, loggedIn, isAdmin } = useSelector((state) => state.user);

//   // State
//   const [drawerOpen, setDrawerOpen] = useState(false);
//   const [anchorEl, setAnchorEl] = useState(null);
//   const [searchInput, setSearchInput] = useState('');
//   const [searchResults, setSearchResults] = useState([]);
//   const [searchFocused, setSearchFocused] = useState(false);
//   const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

//   // Derived state
//   const userData = {
//     firstName: profile?.user?.firstName || 'User',
//     lastName: profile?.user?.lastName || '',
//     image: profile?.user?.profileImage || '/default-avatar.png',
//     email: profile?.user?.email
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
//   }, [dispatch, profile]);

//   useEffect(() => {
//     const delayDebounceFn = setTimeout(() => {
//       if (searchInput.trim()) {
//         dispatch(fetchAllUsers({
//           search: searchInput,
//           page: 1,
//           limit: 5,
//           excludeCurrent: true
//         }))
//           .unwrap()
//           .then((action) => {
//             if (action?.users) setSearchResults(action.users);
//           })
//           .catch(error => {
//             console.error('Search failed:', error);
//             setSearchResults([]);
//           });
//       } else {
//         setSearchResults([]);
//       }
//     }, 300);

//     return () => clearTimeout(delayDebounceFn);
//   }, [dispatch, searchInput]);

//   // Handlers
//   const toggleDrawer = (open) => (event) => {
//     if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) return;
//     setDrawerOpen(open);
//     if (!open) setMobileSearchOpen(false);
//   };

//   const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
//   const handleMenuClose = () => setAnchorEl(null);

//   // const handleLogout = () => {
//   //   try {
//   //     localStorage.removeItem('accessToken');
//   //     localStorage.removeItem('refreshToken');
//   //     dispatch(logoutUser());
//   //     dispatch(logoutUserReducer());
//   //     dispatch(showSnackbar({ 
//   //       message: 'Successfully logged out', 
//   //       severity: 'success' 
//   //     }));
//   //   } catch (error) {
//   //     console.error('Logout failed:', error);
//   //     dispatch(showSnackbar({
//   //       message: 'Failed to logout',
//   //       severity: 'error'
//   //     }));
//   //   } finally {
//   //     handleMenuClose();
//   //   }
//   // };

//   const handleLogout = () => {
//   try {
//     localStorage.removeItem('accessToken');
//     localStorage.removeItem('refreshToken');
//     dispatch(logoutUser());  // This should be enough
//     dispatch(showSnackbar({ 
//       message: 'Successfully logged out', 
//       severity: 'success' 
//     }));
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
//           boxShadow: 'none',
//           zIndex: (theme) => theme.zIndex.drawer + 1,
//           top: isMobile && mobileSearchOpen ? '56px' : 0
//         }}
//       >
//         <Toolbar sx={{ justifyContent: 'space-between', height: '56px' }}>
//           <Box sx={{ display: 'flex', alignItems: 'center' }}>
//             <IconButton
//               edge="start"
//               color="inherit"
//               onClick={toggleDrawer(true)}
//               sx={{ display: { xs: 'flex', md: 'none' }, mr: 1 }}
//             >
//               <MenuIcon />
//             </IconButton>
//             <Logo />
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
            
//             <UserAvatarSection
//               isMobile={isMobile}
//               userData={userData}
//               handleMenuOpen={handleMenuOpen}
//               toggleMobileSearch={toggleMobileSearch}
//               loggedIn={loggedIn}
//             />

//             {!loggedIn && <AuthButtons />}

//             {loggedIn && (
//               <UserMenu
//                 anchorEl={anchorEl}
//                 userData={userData}
//                 isAdmin={isAdmin}
//                 handleMenuClose={handleMenuClose}
//                 handleLogout={handleLogout}
//               />
//             )}
//           </Box>
//         </Toolbar>
//       </AppBar>

//       <Drawer 
//         anchor="left" 
//         open={drawerOpen} 
//         onClose={toggleDrawer(false)}
//         sx={{
//           '& .MuiDrawer-paper': {
//             width: 250,
//             boxSizing: 'border-box',
//             top: isMobile && mobileSearchOpen ? '112px' : '56px'
//           }
//         }}
//       >
//         <DrawerContent
//           navItems={NAV_ITEMS}
//           userData={userData}
//           loggedIn={loggedIn}
//           toggleDrawer={toggleDrawer}
//         />
//       </Drawer>
//     </>
//   );
// };

// export default Navbar;







//! colorful but search bar type is not working.

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
//   useTheme,
//   alpha
// } from '@mui/material';
// import {
//   Menu as MenuIcon,
//   Home,
//   People,
//   Groups as GroupIcon,
//   Store,
//   Notifications,
//   Search as SearchIcon,
//   Login,
//   Close
// } from '@mui/icons-material';
// import { showSnackbar } from '../../features/snackbar/snackbarSlice';
// import { fetchUserProfile, logoutUser, fetchAllUsers } from '../../features/user/userSlice';
// import DesktopSearch from './DesktopSearch';
// import MobileSearch from './MobileSearch';
// import NavItems from './NavItems';
// import UserMenu from './UserMenu';
// import DrawerContent from './DrawerContent';

// // Constants
// const NAV_ITEMS = [
//   { name: 'Home', icon: Home, path: '/', color: '#1877F2' },
//   { name: 'Friends', icon: People, path: '/friends', color: '#1B74E4' },
//   { name: 'Groups', icon: GroupIcon, path: '/groups', color: '#E44D2E' },
//   { name: 'Marketplace', icon: Store, path: '/marketplace', color: '#42B72A' },
// ];

// const Navbar = () => {
//   // Hooks
//   const theme = useTheme();
//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const isMobile = useMediaQuery(theme.breakpoints.down('md'));
//   const { profile, loggedIn, isAdmin } = useSelector((state) => state.user);

//   // State
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
//     if (loggedIn && !profile) {
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

//   const handleSearch = useCallback(
//     debounce((input) => {
//       if (input.trim()) {
//         dispatch(fetchAllUsers({
//           search: input,
//           page: 1,
//           limit: 5,
//           excludeCurrent: true
//         }))
//           .unwrap()
//           .then((action) => {
//             if (action?.users) setSearchResults(action.users);
//           })
//           .catch(() => setSearchResults([]));
//       } else {
//         setSearchResults([]);
//       }
//     }, 300),
//     [dispatch]
//   );

//   useEffect(() => {
//     handleSearch(searchInput);
//     return () => handleSearch.cancel();
//   }, [searchInput, handleSearch]);

//   // Handlers
//   const toggleDrawer = (open) => (event) => {
//     if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) return;
//     setDrawerOpen(open);
//     if (!open) setMobileSearchOpen(false);
//   };

//   const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
//   const handleMenuClose = () => setAnchorEl(null);

//   const handleLogout = async () => {
//     try {
//       await dispatch(logoutUser()).unwrap();
//       dispatch(showSnackbar({ 
//         message: 'Successfully logged out', 
//         severity: 'success' 
//       }));
//       navigate('/login');
//     } catch (error) {
//       dispatch(showSnackbar({
//         message: 'Failed to logout',
//         severity: 'error'
//       }));
//     } finally {
//       handleMenuClose();
//     }
//   };

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

//   // Components
//   const Logo = () => (
//     <Typography
//       variant="h5"
//       component={Link}
//       to="/"
//       sx={{
//         fontWeight: 800,
//         color: theme.palette.primary.main,
//         textDecoration: 'none',
//         mr: 2,
//         fontFamily: '"Segoe UI", sans-serif',
//         '&:hover': {
//           opacity: 0.9
//         }
//       }}
//     >
//       SocialApp
//     </Typography>
//   );

//   const NotificationButton = () => (
//     <IconButton 
//       color="inherit" 
//       component={Link} 
//       to="/notifications"
//       sx={{
//         color: theme.palette.text.secondary,
//         '&:hover': {
//           backgroundColor: alpha(theme.palette.primary.main, 0.1),
//           color: theme.palette.primary.main
//         }
//       }}
//     >
//       <Badge badgeContent={4} color="error">
//         <Notifications />
//       </Badge>
//     </IconButton>
//   );

//   const ProfileButton = () => (
//     <IconButton 
//       onClick={handleMenuOpen} 
//       sx={{
//         p: 0,
//         ml: 1,
//         '&:hover': {
//           opacity: 0.9
//         }
//       }}
//     >
//       <Avatar 
//         src={userData.image}
//         sx={{
//           width: 36,
//           height: 36,
//           border: `2px solid ${theme.palette.background.paper}`,
//           boxShadow: theme.shadows[1]
//         }}
//       />
//     </IconButton>
//   );

//   const MobileSearchButton = () => (
//     <IconButton 
//       onClick={toggleMobileSearch}
//       sx={{
//         color: mobileSearchOpen ? theme.palette.primary.main : theme.palette.text.secondary,
//         mr: 1
//       }}
//     >
//       {mobileSearchOpen ? <Close /> : <SearchIcon />}
//     </IconButton>
//   );

//   const LoginButton = () => (
//     <Button
//       variant="contained"
//       component={Link}
//       to="/login"
//       startIcon={<Login />}
//       sx={{
//         backgroundColor: theme.palette.primary.main,
//         color: theme.palette.primary.contrastText,
//         '&:hover': {
//           backgroundColor: theme.palette.primary.dark
//         }
//       }}
//     >
//       Login
//     </Button>
//   );

//   return (
//     <>
//       <MobileSearch
//         open={mobileSearchOpen}
//         searchInput={searchInput}
//         searchResults={searchResults}
//         searchFocused={searchFocused}
//         onClose={toggleMobileSearch}
//         onSearchChange={handleSearchChange}
//         onSearchFocus={handleSearchFocus}
//         onSearchBlur={handleSearchBlur}
//         onResultClick={handleResultClick}
//       />

//       <AppBar 
//         position="fixed" 
//         elevation={0}
//         sx={{ 
//           bgcolor: theme.palette.background.default,
//           color: theme.palette.text.primary,
//           borderBottom: `1px solid ${theme.palette.divider}`,
//           zIndex: theme.zIndex.drawer + 1,
//           backdropFilter: 'blur(8px)',
//           backgroundColor: alpha(theme.palette.background.default, 0.8)
//         }}
//       >
//         <Toolbar sx={{ 
//           justifyContent: 'space-between',
//           height: '64px',
//           px: { xs: 2, sm: 3 }
//         }}>
//           {/* Left Section */}
//           <Box sx={{ display: 'flex', alignItems: 'center' }}>
//             <IconButton
//               edge="start"
//               color="inherit"
//               onClick={toggleDrawer(true)}
//               sx={{ 
//                 display: { xs: 'flex', md: 'none' },
//                 mr: 1
//               }}
//             >
//               <MenuIcon />
//             </IconButton>
//             <Logo />
//           </Box>

//           {/* Center Section */}
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

//           {/* Right Section */}
//           <Box sx={{ 
//             display: 'flex', 
//             alignItems: 'center',
//             gap: { xs: 0.5, sm: 1 }
//           }}>
//             {loggedIn && !isMobile && (
//               <DesktopSearch
//                 searchInput={searchInput}
//                 searchResults={searchResults}
//                 searchFocused={searchFocused}
//                 onSearchChange={handleSearchChange}
//                 onSearchFocus={handleSearchFocus}
//                 onSearchBlur={handleSearchBlur}
//                 onResultClick={handleResultClick}
//               />
//             )}
            
//             {loggedIn && (
//               <>
//                 {isMobile && <MobileSearchButton />}
//                 <NotificationButton />
//                 <ProfileButton />
//                 <UserMenu
//                   anchorEl={anchorEl}
//                   userData={userData}
//                   isAdmin={isAdmin}
//                   onClose={handleMenuClose}
//                   onLogout={handleLogout}
//                 />
//               </>
//             )}

//             {!loggedIn && <LoginButton />}
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
//             top: '64px',
//             height: 'calc(100% - 64px)',
//             borderRight: 'none',
//             backgroundColor: theme.palette.background.paper
//           }
//         }}
//       >
//         <DrawerContent
//           navItems={NAV_ITEMS}
//           userData={userData}
//           loggedIn={loggedIn}
//           onClose={toggleDrawer(false)}
//         />
//       </Drawer>
//     </>
//   );
// };

// // Helper function
// function debounce(func, wait) {
//   let timeout;
//   return function(...args) {
//     const context = this;
//     clearTimeout(timeout);
//     timeout = setTimeout(() => func.apply(context, args), wait);
//   };
// }

// export default Navbar;


//! update
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import {
  AppBar,
    Avatar,
  Badge,
  Box,
  Button,
  Drawer,
  IconButton,
  Toolbar,
  Typography,
  useMediaQuery
} from '@mui/material';
import {
  Menu as MenuIcon,
  Home,
  People,
  Group,
  Store,
  Notifications,
  Search as SearchIcon,
  Login
} from '@mui/icons-material';
import { showSnackbar } from '../../features/snackbar/snackbarSlice';
import { fetchUserProfile, logoutUser, logout, refreshAccessToken, fetchAllUsers } from '../../features/user/userSlice';
import DesktopSearch from './DesktopSearch';
import MobileSearch from './MobileSearch';
import NavItems from './NavItems';
import UserMenu from './UserMenu';
import DrawerContent from './DrawerContent';

// Constants
const NAV_ITEMS = [
  { name: 'Home', icon: Home, path: '/', color: '#1877F2' },
  { name: 'Friends', icon: People, path: '/friends', color: '#1B74E4' },
  { name: 'Groups', icon: Group, path: '/groups', color: '#E44D2E' },
  { name: 'Marketplace', icon: Store, path: '/marketplace', color: '#42B72A' },
];

const Navbar = () => {
  // Hooks
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isMobile = useMediaQuery('(max-width:899px)');
  const { profile, loggedIn, isAdmin } = useSelector((state) => state.user);

  // State
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [searchInput, setSearchInput] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchFocused, setSearchFocused] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  // Derived state
  // const userData = {
  //   firstName: profile?.user?.firstName || 'User',
  //   lastName: profile?.user?.lastName || '',
  //   image: profile?.user?.profileImage || '/default-avatar.png',
  //   email: profile?.user?.email
  // };
  const userData = {
  id: profile?.id || profile?.user?.id,
  firstName: profile?.firstName || profile?.user?.firstName || 'User',
  lastName: profile?.lastName || profile?.user?.lastName || '',
  image: profile?.profileImage || profile?.user?.profileImage || '/default-avatar.png',
  email: profile?.email || profile?.user?.email
};

  // Effects
  // useEffect(() => {
  //   const token = localStorage.getItem('accessToken');
  //   if (token && !profile) {
  //     dispatch(fetchUserProfile())
  //       .unwrap()
  //       .catch(error => {
  //         console.error('Failed to fetch user profile:', error);
  //         dispatch(showSnackbar({
  //           message: 'Failed to load user data',
  //           severity: 'error'
  //         }));
  //       });
  //   }
  // }, [dispatch, profile]);
  useEffect(() => {
  const token = localStorage.getItem('accessToken');
  if (token && !profile) {
    console.log('Fetching user profile...'); // Debug log
    dispatch(fetchUserProfile())
      .unwrap()
      .then((profileData) => {
        console.log('Profile fetched:', profileData); // Debug log
      })
      .catch(error => {
        console.error('Failed to fetch user profile:', error);
        dispatch(showSnackbar({
          message: 'Failed to load user data',
          severity: 'error'
        }));
      });
  }
}, [dispatch, loggedIn]); // Changed dependency to loggedIn instead of profile

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchInput.trim()) {
        dispatch(fetchAllUsers({
          search: searchInput,
          page: 1,
          limit: 5,
          excludeCurrent: true
        }))
          .unwrap()
          .then((action) => {
            if (action?.users) setSearchResults(action.users);
          })
          .catch(error => {
            console.error('Search failed:', error);
            setSearchResults([]);
          });
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [dispatch, searchInput]);

  // Handlers
  const toggleDrawer = (open) => (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) return;
    setDrawerOpen(open);
    if (!open) setMobileSearchOpen(false);
  };

  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleLogout = () => {
    try {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      dispatch(logoutUser());
      dispatch(logout());
      dispatch(showSnackbar({ 
        message: 'Successfully logged out', 
        severity: 'success' 
      }));
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

  const handleSearchChange = (value) => setSearchInput(value);
  const handleSearchFocus = () => setSearchFocused(true);
  const handleSearchBlur = () => setTimeout(() => setSearchFocused(false), 200);
  const handleResultClick = () => {
    setSearchInput('');
    setSearchFocused(false);
    setMobileSearchOpen(false);
    setDrawerOpen(false);
  };
  const toggleMobileSearch = () => setMobileSearchOpen(!mobileSearchOpen);

  // Render
  const renderLogo = () => (
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

  return (
    <>
      <MobileSearch
        mobileSearchOpen={mobileSearchOpen}
        searchInput={searchInput}
        searchResults={searchResults}
        searchFocused={searchFocused}
        toggleMobileSearch={toggleMobileSearch}
        handleSearchChange={handleSearchChange}
        handleSearchFocus={handleSearchFocus}
        handleSearchBlur={handleSearchBlur}
        handleResultClick={handleResultClick}
      />

      <AppBar 
        position="fixed" 
        sx={{ 
          bgcolor: 'background.paper', 
          color: 'text.primary',
          boxShadow: 'none',
          zIndex: (theme) => theme.zIndex.drawer + 1,
          top: isMobile && mobileSearchOpen ? '56px' : 0
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between', height: '56px' }}>
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
                handleSearchFocus={handleSearchFocus}
                handleSearchBlur={handleSearchBlur}
                handleResultClick={handleResultClick}
              />
            )}
            
            {loggedIn && (
              <IconButton color="inherit" component={Link} to="/notifications">
                <Badge badgeContent={4} color="error">
                  <Notifications />
                </Badge>
              </IconButton>
            )}

            {loggedIn ? (
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
                <UserMenu
                  anchorEl={anchorEl}
                  userData={userData}
                  isAdmin={isAdmin}
                  handleMenuClose={handleMenuClose}
                  handleLogout={handleLogout}
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
                  '&:hover': { backgroundColor: '#166FE5' }
                }}
              >
                Login
              </Button>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      <Drawer 
        anchor="left" 
        open={drawerOpen} 
        onClose={toggleDrawer(false)}
        sx={{
          '& .MuiDrawer-paper': {
            width: 250,
            boxSizing: 'border-box',
            top: isMobile && mobileSearchOpen ? '112px' : '56px'
          }
        }}
      >
        <DrawerContent
          navItems={NAV_ITEMS}
          userData={userData}
          loggedIn={loggedIn}
          toggleDrawer={toggleDrawer}
        />
      </Drawer>
    </>
  );
};

export default Navbar;














