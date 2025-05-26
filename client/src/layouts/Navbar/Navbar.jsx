// /* =============================
//    File: src/layouts/Navbar.jsx
//    ============================= */
// import React, { useState } from 'react';
// import { Link } from 'react-router-dom';
// import {
//   AppBar,
//   Toolbar,
//   IconButton,
//   Box,
//   useMediaQuery,
//   useTheme
// } from '@mui/material';
// import { Menu as MenuIcon, Search as SearchIcon, Notifications } from '@mui/icons-material';
// import { useDispatch, useSelector } from 'react-redux';
// import { showSnackbar } from '../../features/snackbar/snackbarSlice';
// import { fetchUserProfile, logoutUser } from '../../features/user/userSlice';

// // import DrawerMenu from './DrawerMenu';
// import SearchBar from '../../components/SearchBar/SearchBar';
// import UserSearchResults from '../../components/SearchBar/UserSearchResults';
// import ThemeToggle from './ThemeToggle';
// import ProfileAvatar from './ProfileAvatar';
// import DrawerMenu from './DrawerMenu';

// const Navbar = () => {
//   const dispatch = useDispatch();
//   const theme = useTheme();
//   const isMobile = useMediaQuery(theme.breakpoints.down('md'));
//   const { profile, loggedIn, isAdmin } = useSelector(state => state.user);

//   const [drawerOpen, setDrawerOpen] = useState(false);
//   const [searchOpen, setSearchOpen] = useState(false);
//   const [searchInput, setSearchInput] = useState('');
//   const [searchResults, setSearchResults] = useState([]);

//   React.useEffect(() => {
//     if (!profile && localStorage.getItem('accessToken')) {
//       dispatch(fetchUserProfile());
//     }
//   }, [dispatch, profile]);

//   // debounce search
//   React.useEffect(() => {
//     const id = setTimeout(() => {
//       if (searchInput) {
//         dispatch(fetchAllUsers({ search: searchInput, page: 1, limit: 5 }))
//           .then(res => setSearchResults(res.payload?.users || []));
//       } else setSearchResults([]);
//     }, 300);
//     return () => clearTimeout(id);
//   }, [dispatch, searchInput]);

//   const handleToggleTheme = () => {
//     // dispatch theme toggle action
//     dispatch({ type: 'theme/toggle' });
//   };
//   const handleLogout = () => {
//     dispatch(logoutUser());
//     dispatch(showSnackbar({ message: 'Logged out', severity: 'info' }));
//   };

//   return (
//     <>
//       <AppBar position="sticky">
//         <Toolbar>
//           <IconButton edge="start" color="inherit" onClick={() => setDrawerOpen(true)}>
//             <MenuIcon />
//           </IconButton>

//           {!isMobile && (
//             <Box sx={{ flex: 1, mx: 2 }}>
//               <SearchBar
//                 value={searchInput}
//                 onChange={setSearchInput}
//                 onFocus={() => setSearchOpen(true)}
//                 onBlur={() => setTimeout(() => setSearchOpen(false), 200)}
//               />
//               {searchOpen && searchResults.length > 0 && (
//                 <UserSearchResults results={searchResults} onResultClick={() => setSearchOpen(false)} />
//               )}
//             </Box>
//           )}

//           <ThemeToggle onToggle={handleToggleTheme} />

//           <IconButton color="inherit">
//             <Notifications />
//           </IconButton>

//           <ProfileAvatar src={profile?.user?.profileImage} onClick={() => {/* open profile menu */}} />

//           {isMobile && (
//             <IconButton color="inherit" onClick={() => setSearchOpen(prev => !prev)}>
//               <SearchIcon />
//             </IconButton>
//           )}
//         </Toolbar>
//       </AppBar>

//       <DrawerMenu
//         user={profile?.user}
//         isAdmin={isAdmin}
//         onLogout={handleLogout}
//         onClose={() => setDrawerOpen(false)}
//         open={drawerOpen}
//       />
//     </>
//   );
// };

// export default Navbar;








//! running
// import { useState, useEffect } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { Link, useNavigate } from 'react-router-dom';
// import {
//   AppBar,
//   Avatar,
//   Badge,
//   Box,
//   Button,
//   Divider,
//   Drawer,
//   IconButton,
//   List,
//   ListItem,
//   ListItemIcon,
//   ListItemText,
//   Menu,
//   MenuItem,
//   Paper,
//   Toolbar,
//   Typography,
//   useMediaQuery
// } from '@mui/material';
// import {
//   AccountCircle,
//   ContactMail,
//   ExitToApp,
//   People,
//   Group,
//   Home,
//   Login,
//   Store,
//   Menu as MenuIcon,
//   Notifications,
//   Search as SearchIcon,
//   ArrowBack
// } from '@mui/icons-material';

// import { fetchUserProfile, logoutUser, logoutUserReducer, fetchAllUsers } from '../features/user/userSlice';
// import { showSnackbar } from '../features/snackbar/snackbarSlice';
//   import SearchBar from '../components/SearchBar/SearchBar';
//   import UserSearchResults from '../components/SearchBar/UserSearchResults';
// const NAV_ITEMS = [
//   { name: 'Home', icon: Home, path: '/', color: '#1877F2' },
//   { name: 'Friends', icon: People, path: '/friends', color: '#1B74E4' },
//   { name: 'Groups', icon: Group, path: '/groups', color: '#E44D2E' },
//   { name: 'Marketplace', icon: Store, path: '/marketplace', color: '#42B72A' },
// ];

// const Navbar = () => {
//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const isMobile = useMediaQuery('(max-width:899px)');
//   const { profile, loggedIn, isAdmin } = useSelector((state) => state.user);

//   const [drawerOpen, setDrawerOpen] = useState(false);
//   const [anchorEl, setAnchorEl] = useState(null);
//   const [searchInput, setSearchInput] = useState('');
//   const [searchResults, setSearchResults] = useState([]);
//   const [searchFocused, setSearchFocused] = useState(false);
//   const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

//   const userData = {
//     firstName: profile?.user?.firstName || 'User',
//     lastName: profile?.user?.lastName || '',
//     image: profile?.user?.profileImage || '/default-avatar.png',
//     email: profile?.user?.email || '',
//   };

//   useEffect(() => {
//     const token = localStorage.getItem('accessToken');
//     if (token && !profile) {
//       dispatch(fetchUserProfile());
//     }
//   }, [dispatch, profile]);

//   useEffect(() => {
//     const delay = setTimeout(() => {
//       if (searchInput.trim()) {
//         dispatch(fetchAllUsers({ search: searchInput, page: 1, limit: 5, excludeCurrent: true }))
//           .then((res) => {
//             if (res.payload?.users) setSearchResults(res.payload.users);
//           });
//       } else {
//         setSearchResults([]);
//       }
//     }, 300);
//     return () => clearTimeout(delay);
//   }, [dispatch, searchInput]);

//   // Handlers
//   const handleDrawerToggle = (open) => () => {
//     setDrawerOpen(open);
//     if (!open) setMobileSearchOpen(false);
//   };

//   const handleMenuOpen = (e) => setAnchorEl(e.currentTarget);
//   const handleMenuClose = () => setAnchorEl(null);

//   const handleLogout = () => {
//     localStorage.removeItem('accessToken');
//     localStorage.removeItem('refreshToken');
//     dispatch(logoutUser());
//     dispatch(logoutUserReducer());
//     dispatch(showSnackbar({ message: 'Successfully logged out', severity: 'success' }));
//     handleMenuClose();
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

//   // Render Sections
//   const renderLogo = () => (
//     <Typography component={Link} to="/" variant="h5" sx={{ fontWeight: 'bold', textDecoration: 'none', color: '#1877F2', mr: 2 }}>
//       SocialApp
//     </Typography>
//   );

//   const renderNavButtons = () => (
//     <Box sx={{ display: 'flex', gap: 1 }}>
//       {NAV_ITEMS.map(({ name, icon: Icon, path, color }) => (
//         <Button
//           key={name}
//           component={Link}
//           to={path}
//           sx={{ minWidth: 110, height: 48, borderRadius: 2, '&:hover': { backgroundColor: '#E7F3FF' } }}
//         >
//           <Icon sx={{ color, fontSize: 28, mr: 1 }} />
//           <Typography variant="body2" sx={{ color: 'text.primary' }}>{name}</Typography>
//         </Button>
//       ))}
//     </Box>
//   );

//   const renderUserMenu = () => (
//     <Menu anchorEl={anchorEl} open={!!anchorEl} onClose={handleMenuClose}>
//       <MenuItem sx={{ pointerEvents: 'none' }}>
//         <Avatar src={userData.image} sx={{ width: 40, height: 40, mr: 2 }} />
//         <Box>
//           <Typography>{userData.firstName} {userData.lastName}</Typography>
//           <Typography variant="body2" color="text.secondary">{userData.email}</Typography>
//         </Box>
//       </MenuItem>
//       <Divider />
//       <MenuItem component={Link} to="/profile/me" onClick={handleMenuClose}>
//         <AccountCircle sx={{ mr: 1 }} /> My Profile
//       </MenuItem>
//       {isAdmin && (
//         <MenuItem component={Link} to="/admin" onClick={handleMenuClose}>
//           <AccountCircle sx={{ mr: 1, color: 'secondary.main' }} /> Admin Panel
//         </MenuItem>
//       )}
//       <Divider />
//       <MenuItem onClick={handleLogout}>
//         <ExitToApp sx={{ mr: 1, color: 'error.main' }} /> Logout
//       </MenuItem>
//     </Menu>
//   );

//   const renderSearch = () => (
//     <Box sx={{ position: 'relative', width: 240, mr: 2 }}>
//       <SearchBar value={searchInput} onChange={handleSearchChange} onFocus={handleSearchFocus} onBlur={handleSearchBlur} />
//       {searchFocused && searchResults.length > 0 && (
//         <Paper sx={{ position: 'absolute', top: '100%', left: 0, right: 0, mt: 1, zIndex: 1200, maxHeight: 300, overflow: 'auto' }}>
//           <UserSearchResults results={searchResults} onResultClick={handleResultClick} />
//         </Paper>
//       )}
//     </Box>
//   );

//   const renderMobileSearch = () => (
//     <Box sx={{ position: 'fixed', top: 0, left: 0, right: 0, bgcolor: 'background.paper', p: 1, boxShadow: 1, zIndex: 1300 }}>
//       <IconButton onClick={() => setMobileSearchOpen(false)}><ArrowBack /></IconButton>
//       <Box sx={{ flexGrow: 1, mx: 1 }}>
//         <SearchBar
//           value={searchInput}
//           onChange={handleSearchChange}
//           onFocus={handleSearchFocus}
//           onBlur={handleSearchBlur}
//           autoFocus
//         />
//       </Box>
//       {searchFocused && searchResults.length > 0 && (
//         <Paper sx={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 1400, maxHeight: '60vh', overflow: 'auto' }}>
//           <UserSearchResults results={searchResults} onResultClick={handleResultClick} />
//         </Paper>
//       )}
//     </Box>
//   );

//   const renderDrawer = () => (
//     <Drawer anchor="left" open={drawerOpen} onClose={handleDrawerToggle(false)}>
//       <Box sx={{ width: 250 }} role="presentation">
//         <List>
//           {loggedIn && (
//             <ListItem component={Link} to="/profile/me" onClick={handleDrawerToggle(false)}>
//               <Avatar src={userData.image} sx={{ width: 40, height: 40, mr: 2 }} />
//               <Typography>{userData.firstName} {userData.lastName}</Typography>
//             </ListItem>
//           )}
//           {NAV_ITEMS.map(({ name, icon: Icon, path, color }) => (
//             <ListItem key={name} component={Link} to={path} onClick={handleDrawerToggle(false)}>
//               <ListItemIcon><Icon sx={{ color }} /></ListItemIcon>
//               <ListItemText primary={name} />
//             </ListItem>
//           ))}
//           <ListItem component={Link} to="/contact-us" onClick={handleDrawerToggle(false)}>
//             <ListItemIcon><ContactMail color="info" /></ListItemIcon>
//             <ListItemText primary="Contact Us" />
//           </ListItem>
//           {!loggedIn && (
//             <ListItem component={Link} to="/login" onClick={handleDrawerToggle(false)}>
//               <ListItemIcon><Login color="success" /></ListItemIcon>
//               <ListItemText primary="Login" />
//             </ListItem>
//           )}
//         </List>
//       </Box>
//     </Drawer>
//   );

//   return (
//     <>
//       <AppBar position="sticky" color="inherit" sx={{ boxShadow: 1 }}>
//         <Toolbar sx={{ justifyContent: 'space-between' }}>
//           <Box sx={{ display: 'flex', alignItems: 'center' }}>
//             <IconButton edge="start" onClick={handleDrawerToggle(true)} sx={{ mr: 1 }}>
//               <MenuIcon />
//             </IconButton>
//             {renderLogo()}
//           </Box>

//           {!isMobile && renderNavButtons()}
//           {!isMobile && renderSearch()}

//           <Box sx={{ display: 'flex', alignItems: 'center' }}>
//             {isMobile && (
//               <IconButton onClick={() => setMobileSearchOpen(true)}>
//                 <SearchIcon />
//               </IconButton>
//             )}
//             <IconButton>
//               <Badge badgeContent={4} color="error">
//                 <Notifications />
//               </Badge>
//             </IconButton>
//             {loggedIn ? (
//               <IconButton onClick={handleMenuOpen}>
//                 <Avatar src={userData.image} />
//               </IconButton>
//             ) : (
//               <Button component={Link} to="/login" variant="outlined" sx={{ ml: 1 }}>Login</Button>
//             )}
//           </Box>
//         </Toolbar>
//       </AppBar>

//       {renderDrawer()}
//       {renderUserMenu()}
//       {mobileSearchOpen && renderMobileSearch()}
//     </>
//   );
// };

// export default Navbar;



//! final
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Avatar,
  Badge,
  Box,
  Button,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Paper,
  Toolbar,
  Typography,
  useMediaQuery
} from '@mui/material';
import {
  AccountCircle,
  ContactMail,
  ExitToApp,
  People,
  Group,
  Home,
  Login,
  Store,
  Menu as MenuIcon,
  Notifications,
  Search as SearchIcon,
  ArrowBack
} from '@mui/icons-material';
import { showSnackbar } from '../../features/snackbar/snackbarSlice';
import { fetchUserProfile, logoutUser, logoutUserReducer, refreshAccessToken, fetchAllUsers } from '../../features/user/userSlice';
 import SearchBar from '../../components/SearchBar/SearchBar';
 import UserSearchResults from '../../components/SearchBar/UserSearchResults';

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
  const userData = {
    firstName: profile?.user?.firstName || 'User',
    lastName: profile?.user?.lastName || '',
    image: profile?.user?.profileImage || '/default-avatar.png',
    email: profile?.user?.email
  };

  // Effects
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token && !profile) {
      dispatch(fetchUserProfile());
    }
  }, [dispatch, profile]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchInput.trim()) {
        dispatch(fetchAllUsers({
          search: searchInput,
          page: 1,
          limit: 5,
          excludeCurrent: true
        })).then((action) => {
          if (action.payload?.users) setSearchResults(action.payload.users);
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
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    dispatch(logoutUser());
    dispatch(logoutUserReducer());
    dispatch(showSnackbar({ message: 'Successfully logged out', severity: 'success' }));
    handleMenuClose();
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

  // Components
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

  const renderDesktopSearch = () => (
    <Box sx={{ position: 'relative', width: 240, mr: 2 }}>
      <SearchBar
        value={searchInput}
        onChange={handleSearchChange}
        onFocus={handleSearchFocus}
        onBlur={handleSearchBlur}
      />
      {searchFocused && searchResults.length > 0 && (
        <Paper sx={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          zIndex: 1200,
          mt: 1,
          maxHeight: 300,
          overflow: 'auto'
        }}>
          <UserSearchResults results={searchResults} onResultClick={handleResultClick} />
        </Paper>
      )}
    </Box>
  );

  const renderMobileSearch = () => (
    <Box sx={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 1300,
      bgcolor: 'background.paper',
      p: 1,
      boxShadow: 1,
      display: 'flex',
      alignItems: 'center'
    }}>
      <IconButton onClick={toggleMobileSearch}>
        <ArrowBack />
      </IconButton>
      <Box sx={{ flexGrow: 1, mx: 1 }}>
        <SearchBar
          value={searchInput}
          onChange={handleSearchChange}
          onFocus={handleSearchFocus}
          onBlur={handleSearchBlur}
          autoFocus
        />
      </Box>
      {searchFocused && searchResults.length > 0 && (
        <Paper sx={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          zIndex: 1400,
          mt: 1,
          maxHeight: '60vh',
          overflow: 'auto'
        }}>
          <UserSearchResults results={searchResults} onResultClick={handleResultClick} />
        </Paper>
      )}
    </Box>
  );

  const renderNavItems = () => (
    <Box sx={{ display: 'flex', gap: 1 }}>
      {NAV_ITEMS.map((item) => (
        <Button
          key={item.name}
          component={Link}
          to={item.path}
          sx={{
            minWidth: '110px',
            height: '48px',
            borderRadius: '8px',
            '&:hover': { backgroundColor: '#E7F3FF' }
          }}
        >
          <item.icon sx={{ color: item.color, fontSize: '28px', mr: 1 }} />
          <Typography variant="body2" sx={{ color: 'text.primary' }}>
            {item.name}
          </Typography>
        </Button>
      ))}
    </Box>
  );

  const renderUserMenu = () => (
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

  const renderDrawerContent = () => (
    <Box sx={{ width: 250 }} role="presentation">
      <List>
        {loggedIn && (
          <ListItem 
            component={Link} 
            to="/profile/me"
            onClick={toggleDrawer(false)}
            sx={{ '&:hover': { backgroundColor: '#E7F3FF' } }}
          >
            <Avatar src={userData.image} sx={{ width: 40, height: 40, mr: 2 }} />
            <Typography variant="body1">
              {userData.firstName} {userData.lastName}
            </Typography>
          </ListItem>
        )}

        {NAV_ITEMS.map((item) => (
          <ListItem
            key={item.name}
            component={Link}
            to={item.path}
            onClick={toggleDrawer(false)}
            sx={{ '&:hover': { backgroundColor: '#E7F3FF' } }}
          >
            <ListItemIcon>
              <item.icon sx={{ color: item.color }} />
            </ListItemIcon>
            <ListItemText primary={item.name} />
          </ListItem>
        ))}

        <ListItem 
          component={Link} 
          to="/contact-us"
          onClick={toggleDrawer(false)}
        >
          <ListItemIcon>
            <ContactMail color="info" />
          </ListItemIcon>
          <ListItemText primary="Contact Us" />
        </ListItem>

        {!loggedIn && (
          <ListItem 
            component={Link} 
            to="/login"
            onClick={toggleDrawer(false)}
          >
            <ListItemIcon>
              <Login color="success" />
            </ListItemIcon>
            <ListItemText primary="Login" />
          </ListItem>
        )}
      </List>
    </Box>
  );

  return (
    <>
      {isMobile && mobileSearchOpen && renderMobileSearch()}

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
              {renderNavItems()}
            </Box>
          )}

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {loggedIn && !isMobile && renderDesktopSearch()}
            
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
                {renderUserMenu()}
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
        {renderDrawerContent()}
      </Drawer>
    </>
  );
};

export default Navbar;










//! old

// import {
//   AccountCircle as AccountCircleIcon,
//   ContactMail as ContactMailIcon,
//   ExitToApp as ExitToAppIcon,
//   People as FriendsIcon,
//   Group as GroupsIcon,
//   Home as HomeIcon,
//   Login as LoginIcon,
//   Store as MarketplaceIcon,
//   Menu as MenuIcon,
//   Notifications as NotificationsIcon,
// } from '@mui/icons-material';
// import {
//   AppBar,
//   Avatar,
//   Badge,
//   Box,
//   Button,
//   Divider,
//   Drawer,
//   IconButton,
//   List,
//   ListItem,
//   ListItemIcon,
//   ListItemText,
//   Menu,
//   MenuItem,
//   Paper,
//   Toolbar,
//   Typography
// } from '@mui/material';
// import { ArrowBack } from '@mui/icons-material';
// import { useEffect, useState } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { Link, useNavigate } from 'react-router-dom';
// import { showSnackbar } from '../features/snackbar/snackbarSlice';
// import {
//   fetchUserProfile,
//   logoutUser,
//   logoutUserReducer,
//   refreshAccessToken,
//   fetchAllUsers
// } from '../features/user/userSlice';
// import SearchBar from '../components/SearchBar/SearchBar';
// import UserSearchResults from '../components/SearchBar/UserSearchResults';

// const Navbar = () => {
//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const { profile, loggedIn, isAdmin } = useSelector((state) => state.user);
//   const [drawerOpen, setDrawerOpen] = useState(false);
//   const [anchorEl, setAnchorEl] = useState(null);
//   const [searchInput, setSearchInput] = useState('');
//   const [searchResults, setSearchResults] = useState([]);
//   const [searchFocused, setSearchFocused] = useState(false);
//   const isMenuOpen = Boolean(anchorEl);

//   const facebookBlue = '#1877F2';
//   const bgGray = '#F0F2F5';
//   const activeColor = '#1877F2';
//   const hoverColor = '#E7F3FF';

//   const navItems = [
//     { name: 'Home', icon: HomeIcon, path: '/', color: activeColor },
//     { name: 'Table', icon: HomeIcon, path: '/user-table', color: activeColor },
//     { name: 'Friends', icon: FriendsIcon, path: '/friends', color: '#1B74E4' },
//     { name: 'Groups', icon: GroupsIcon, path: '/groups', color: '#E44D2E' },
//     { name: 'Marketplace', icon: MarketplaceIcon, path: '/marketplace', color: '#42B72A' },
//   ];

//   // Search functionality
//   useEffect(() => {
//     const delayDebounceFn = setTimeout(() => {
//       if (searchInput.trim()) {
//         dispatch(fetchAllUsers({
//           search: searchInput,
//           page: 1,
//           limit: 5,
//           excludeCurrent: true
//         }))
//         .then((action) => {
//           if (action.payload?.users) {
//             setSearchResults(action.payload.users);
//           }
//         });
//       } else {
//         setSearchResults([]);
//       }
//     }, 300);

//     return () => clearTimeout(delayDebounceFn);
//   }, [dispatch, searchInput]);

//   const handleSearchChange = (value) => {
//     setSearchInput(value);
//   };

//   const handleSearchFocus = () => {
//     setSearchFocused(true);
//   };

//   const handleSearchBlur = () => {
//     setTimeout(() => setSearchFocused(false), 200);
//   };

//   const handleResultClick = () => {
//     setSearchInput('');
//     setSearchFocused(false);
//   };

//   const toggleDrawer = (open) => (event) => {
//     if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
//       return;
//     }
//     setDrawerOpen(open);
//   };

//   const handleMenuOpen = (event) => {
//     setAnchorEl(event.currentTarget);
//   };

//   const handleMenuClose = () => {
//     setAnchorEl(null);
//   };

//   const handleLogout = () => {
//     localStorage.removeItem('accessToken');
//     localStorage.removeItem('refreshToken');
//     dispatch(logoutUser());
//     dispatch(logoutUserReducer());
//     dispatch(showSnackbar({ message: 'Successfully logged out', severity: 'success' }));
//     handleMenuClose();
//   };

//   // Get user data from profile or use defaults
//   const userFirstName = profile?.user?.firstName || 'User';
//   const userLastName = profile?.user?.lastName || 'Unknown';
//   const userImage = profile?.user?.profileImage || '/default-avatar.png';

//   return (
//     <>
//       <AppBar position="fixed" sx={{ bgcolor: 'white', color: 'black', boxShadow: 'none' }}>
//         <Toolbar sx={{ justifyContent: 'space-between', height: '56px' }}>
//           <Box sx={{ display: 'flex', alignItems: 'center' }}>
//             <IconButton
//               edge="start"
//               color="inherit"
//               aria-label="menu"
//               onClick={toggleDrawer(true)}
//               sx={{ display: { xs: 'block', md: 'none' }, mr: 1 }}
//             >
//               <MenuIcon />
//             </IconButton>
//             <Typography
//               variant="h5"
//               component={Link}
//               to="/"
//               sx={{ fontWeight: 'bold', color: facebookBlue, textDecoration: 'none', mr: 2 }}
//             >
//               SocialApp
//             </Typography>
//           </Box>

//           {loggedIn && (
//             <Box sx={{ display: { xs: 'none', md: 'flex' }, flexGrow: 1, justifyContent: 'center', gap: 1, maxWidth: '600px' }}>
//               {navItems.map((item) => (
//                 <Button
//                   key={item.name}
//                   component={Link}
//                   to={item.path}
//                   sx={{ minWidth: '110px', height: '48px', borderRadius: '8px', '&:hover': { backgroundColor: hoverColor } }}
//                 >
//                   <item.icon sx={{ color: item.color, fontSize: '28px', mr: 1 }} />
//                   <Typography variant="body2" sx={{ color: 'text.primary' }}>{item.name}</Typography>
//                 </Button>
//               ))}
//             </Box>
//           )}

//           <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
//             {loggedIn && (
//               <Box sx={{ 
//                 display: { xs: 'none', md: 'flex' }, 
//                 alignItems: 'center', 
//                 position: 'relative',
//                 width: '240px',
//                 mr: 2
//               }}>
//                 <SearchBar 
//                   value={searchInput}
//                   onChange={handleSearchChange}
//                   onFocus={handleSearchFocus}
//                   onBlur={handleSearchBlur}
//                 />
//                 {searchFocused && searchResults.length > 0 && (
//                   <Paper sx={{
//                     position: 'absolute',
//                     top: '100%',
//                     left: 0,
//                     right: 0,
//                     zIndex: 1200,
//                     mt: 1,
//                     maxHeight: 300,
//                     overflow: 'auto'
//                   }}>
//                     <UserSearchResults 
//                       results={searchResults} 
//                       onResultClick={handleResultClick}
//                     />
//                   </Paper>
//                 )}
//               </Box>
//             )}
//             {loggedIn && (
//               <IconButton color="inherit" component={Link} to="/notifications">
//                 <Badge badgeContent={4} color="error">
//                   <NotificationsIcon />
//                 </Badge>
//               </IconButton>
//             )}
//             {loggedIn ? (
//               <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
//                 <Typography variant="body1" sx={{ display: { xs: 'none', md: 'block' } }}>{userFirstName} {userLastName}</Typography>
//                 <IconButton edge="end" aria-controls="menu-appbar" aria-haspopup="true" onClick={handleMenuOpen} color="inherit">
//                   <Avatar 
//                     src={userImage} 
//                     alt={`${userFirstName} ${userLastName}`}
//                     sx={{ 
//                       width: 40, 
//                       height: 40,
//                       border: '2px solid #fff',
//                       boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
//                     }}
//                   />
//                 </IconButton>
//                 <Menu 
//                   id="menu-appbar" 
//                   anchorEl={anchorEl} 
//                   open={isMenuOpen} 
//                   onClose={handleMenuClose}
//                   anchorOrigin={{
//                     vertical: 'bottom',
//                     horizontal: 'right',
//                   }}
//                   transformOrigin={{
//                     vertical: 'top',
//                     horizontal: 'right',
//                   }}
//                 >
//                   <MenuItem sx={{ pointerEvents: 'none' }}>
//                     <Avatar 
//                       src={userImage} 
//                       sx={{ width: 40, height: 40, mr: 2 }}
//                     />
//                     <Box>
//                       <Typography variant="subtitle1">{userFirstName} {userLastName}</Typography>
//                       <Typography variant="body2" color="text.secondary">
//                         {profile?.user?.email}
//                       </Typography>
//                     </Box>
//                   </MenuItem>
//                   <Divider />
//                   <MenuItem component={Link} to="/profile/me" onClick={handleMenuClose}>
//                     <AccountCircleIcon sx={{ mr: 1, color: 'primary.main' }} />
//                     My Profile
//                   </MenuItem>
//                   {isAdmin && (
//                     <MenuItem component={Link} to="/admin" onClick={handleMenuClose}>
//                       <AccountCircleIcon sx={{ mr: 1, color: 'secondary.main' }} />
//                       Admin Panel
//                     </MenuItem>
//                   )}
//                   <Divider />
//                   <MenuItem onClick={handleLogout}>
//                     <ExitToAppIcon sx={{ mr: 1, color: 'error.main' }} />
//                     Logout
//                   </MenuItem>
//                 </Menu>
//               </Box>
//             ) : (
//               <Button 
//                 color="inherit" 
//                 component={Link} 
//                 to="/login"
//                 sx={{
//                   backgroundColor: facebookBlue,
//                   color: 'white',
//                   '&:hover': {
//                     backgroundColor: '#166FE5'
//                   }
//                 }}
//               >
//                 <LoginIcon sx={{ mr: 1 }} />
//                 Login
//               </Button>
//             )}
//           </Box>
//         </Toolbar>
//       </AppBar>

//       <Drawer anchor="left" open={drawerOpen} onClose={toggleDrawer(false)}>
//         <Box sx={{ width: 250 }} role="presentation" onClick={toggleDrawer(false)} onKeyDown={toggleDrawer(false)}>
//           <List>
//             {loggedIn && (
//               <ListItem>
//                 <Box sx={{ position: 'relative', width: '100%' }}>
//                   <SearchBar 
//                     value={searchInput}
//                     onChange={handleSearchChange}
//                     onFocus={handleSearchFocus}
//                     onBlur={handleSearchBlur}
//                   />
//                   {searchFocused && searchResults.length > 0 && (
//                     <Paper sx={{
//                       position: 'absolute',
//                       top: '100%',
//                       left: 0,
//                       right: 0,
//                       zIndex: 1200,
//                       mt: 1,
//                       maxHeight: 300,
//                       overflow: 'auto'
//                     }}>
//                       <UserSearchResults 
//                         results={searchResults} 
//                         onResultClick={handleResultClick}
//                       />
//                     </Paper>
//                   )}
//                 </Box>
//               </ListItem>
//             )}
//             {loggedIn && (
//               <ListItem component={Link} to="/profile/me" sx={{ '&:hover': { backgroundColor: hoverColor } }}>
//                 <Avatar 
//                   src={userImage} 
//                   sx={{ width: 40, height: 40, mr: 2 }}
//                 />
//                 <Typography variant="body1">{userFirstName} {userLastName}</Typography>
//               </ListItem>
//             )}
//             {loggedIn && navItems.map((item) => (
//               <ListItem key={item.name} component={Link} to={item.path} sx={{ '&:hover': { backgroundColor: hoverColor } }}>
//                 <ListItemIcon>
//                   <item.icon sx={{ color: item.color }} />
//                 </ListItemIcon>
//                 <ListItemText primary={item.name} />
//               </ListItem>
//             ))}
//             <ListItem component={Link} to="/contact-us">
//               <ListItemIcon>
//                 <ContactMailIcon color="info" />
//               </ListItemIcon>
//               <ListItemText primary="Contact Us" />
//             </ListItem>

//             {!loggedIn && (
//               <ListItem component={Link} to="/login">
//                 <ListItemIcon>
//                   <LoginIcon color="success" />
//                 </ListItemIcon>
//                 <ListItemText primary="Login" />
//               </ListItem>
//             )}
//           </List>
//         </Box>
//       </Drawer>
//     </>
//   );
// };

// export default Navbar;








//! original
// import {
//   AccountCircle as AccountCircleIcon,
//   ContactMail as ContactMailIcon,
//   ExitToApp as ExitToAppIcon,
//   People as FriendsIcon,
//   Group as GroupsIcon,
//   Home as HomeIcon,
//   Login as LoginIcon,
//   Store as MarketplaceIcon,
//   Menu as MenuIcon,
//   Notifications as NotificationsIcon,
//   Search as SearchIcon
// } from '@mui/icons-material';
// import {
//   AppBar,
//   Avatar,
//   Badge,
//   Box,
//   Button,
//   Divider,
//   Drawer,
//   IconButton,
//   InputBase,
//   List,
//   ListItem,
//   ListItemIcon,
//   ListItemText,
//   Menu,
//   MenuItem,
//   Toolbar,
//   Typography
// } from '@mui/material';
// import { useEffect, useState } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { Link, useNavigate } from 'react-router-dom';
// import { showSnackbar } from '../features/snackbar/snackbarSlice';
// import {
//   fetchUserProfile,
//   logoutUser,
//   logoutUserReducer,
//   refreshAccessToken,
// } from '../features/user/userSlice';

// const Navbar = () => {
//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const { profile, loggedIn, isAdmin } = useSelector((state) => state.user);
//   const [drawerOpen, setDrawerOpen] = useState(false);
//   const [anchorEl, setAnchorEl] = useState(null);
//   const [searchQuery, setSearchQuery] = useState('');
//   const isMenuOpen = Boolean(anchorEl);

//   const facebookBlue = '#1877F2';
//   const bgGray = '#F0F2F5';
//   const activeColor = '#1877F2';
//   const hoverColor = '#E7F3FF';

//   const navItems = [
//     { name: 'Home', icon: HomeIcon, path: '/', color: activeColor },
//      { name: 'Table', icon: HomeIcon, path: '/user-table', color: activeColor },
//     { name: 'Friends', icon: FriendsIcon, path: '/friends', color: '#1B74E4' },
//     { name: 'Groups', icon: GroupsIcon, path: '/groups', color: '#E44D2E' },
//     { name: 'Marketplace', icon: MarketplaceIcon, path: '/marketplace', color: '#42B72A' },
   
//   ];

//   const toggleDrawer = (open) => (event) => {
//     if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
//       return;
//     }
//     setDrawerOpen(open);
//   };

//   const handleMenuOpen = (event) => {
//     setAnchorEl(event.currentTarget);
//   };
//   const handleMenuClose = () => {
//     setAnchorEl(null);
//   };

//   const handleLogout = () => {
//     localStorage.removeItem('accessToken');
//     localStorage.removeItem('refreshToken');
//     dispatch(logoutUser());
//     dispatch(logoutUserReducer());
//     dispatch(showSnackbar({ message: 'Successfully logged out', severity: 'success' }));
//     handleMenuClose();
//   };

//   const handleSearch = (e) => {
//     e.preventDefault();
//     if (searchQuery.trim()) {
//       navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
//       setSearchQuery('');
//     }
//   };

//   useEffect(() => {
//     const token = localStorage.getItem('accessToken');
//     if (token) {
//       if (loggedIn && !profile) {
//         dispatch(fetchUserProfile());
//       } else if (!loggedIn) {
//         dispatch(refreshAccessToken())
//           .unwrap()
//           .then(() => {
//             dispatch(fetchUserProfile());
//           })
//           .catch((error) => {
//             console.error('Failed to refresh token', error);
//             dispatch(logoutUser());
//           });
//       }
//     }
//   }, [loggedIn, profile, dispatch]);

//   // Get user data from profile or use defaults
//   const userFirstName = profile?.user?.firstName || 'User';
//   const userLastName = profile?.user?.lastName || 'Unknown';
//   const userImage = profile?.user?.profileImage || '/default-avatar.png';

//   return (
//     <>
//       <AppBar position="fixed" sx={{ bgcolor: 'white', color: 'black', boxShadow: 'none' }}>
//         <Toolbar sx={{ justifyContent: 'space-between', height: '56px' }}>
//           <Box sx={{ display: 'flex', alignItems: 'center' }}>
//             <IconButton
//               edge="start"
//               color="inherit"
//               aria-label="menu"
//               onClick={toggleDrawer(true)}
//               sx={{ display: { xs: 'block', md: 'none' }, mr: 1 }}
//             >
//               <MenuIcon />
//             </IconButton>
//             <Typography
//               variant="h5"
//               component={Link}
//               to="/"
//               sx={{ fontWeight: 'bold', color: facebookBlue, textDecoration: 'none', mr: 2 }}
//             >
//               SocialApp
//             </Typography>
//           </Box>

//           {loggedIn && (
//             <Box sx={{ display: { xs: 'none', md: 'flex' }, flexGrow: 1, justifyContent: 'center', gap: 1, maxWidth: '600px' }}>
//               {navItems.map((item) => (
//                 <Button
//                   key={item.name}
//                   component={Link}
//                   to={item.path}
//                   sx={{ minWidth: '110px', height: '48px', borderRadius: '8px', '&:hover': { backgroundColor: hoverColor } }}
//                 >
//                   <item.icon sx={{ color: item.color, fontSize: '28px', mr: 1 }} />
//                   <Typography variant="body2" sx={{ color: 'text.primary' }}>{item.name}</Typography>
//                 </Button>
//               ))}
//             </Box>
//           )}

//           <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
//             {loggedIn && (
//               <Box component="form" onSubmit={handleSearch} sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', borderRadius: '50px', backgroundColor: bgGray, '&:hover': { backgroundColor: '#E4E6E9' }, width: '240px', height: '40px', mr: 2 }}>
//                 <IconButton type="submit" sx={{ p: '8px', color: 'text.secondary' }}>
//                   <SearchIcon />
//                 </IconButton>
//                 <InputBase placeholder="Search SocialApp" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} sx={{ ml: 1, flex: 1 }} />
//               </Box>
//             )}
//             {loggedIn && (
//               <IconButton color="inherit" component={Link} to="/notifications">
//                 <Badge badgeContent={4} color="error">
//                   <NotificationsIcon />
//                 </Badge>
//               </IconButton>
//             )}
//             {loggedIn ? (
//               <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
//                 <Typography variant="body1" sx={{ display: { xs: 'none', md: 'block' } }}>{userFirstName} {userLastName}</Typography>
//                 <IconButton edge="end" aria-controls="menu-appbar" aria-haspopup="true" onClick={handleMenuOpen} color="inherit">
//                   <Avatar 
//                     src={userImage} 
//                     alt={`${userFirstName} ${userLastName}`}
//                     sx={{ 
//                       width: 40, 
//                       height: 40,
//                       border: '2px solid #fff',
//                       boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
//                     }}
//                   />
//                 </IconButton>
//                 <Menu 
//                   id="menu-appbar" 
//                   anchorEl={anchorEl} 
//                   open={isMenuOpen} 
//                   onClose={handleMenuClose}
//                   anchorOrigin={{
//                     vertical: 'bottom',
//                     horizontal: 'right',
//                   }}
//                   transformOrigin={{
//                     vertical: 'top',
//                     horizontal: 'right',
//                   }}
//                 >
//                   <MenuItem sx={{ pointerEvents: 'none' }}>
//                     <Avatar 
//                       src={userImage} 
//                       sx={{ width: 40, height: 40, mr: 2 }}
//                     />
//                     <Box>
//                       <Typography variant="subtitle1">{userFirstName} {userLastName}</Typography>
//                       <Typography variant="body2" color="text.secondary">
//                         {profile?.user?.email}
//                       </Typography>
//                     </Box>
//                   </MenuItem>
//                   <Divider />
//                                  <MenuItem component={Link} to="/profile/me" onClick={handleMenuClose}>
//                     <AccountCircleIcon sx={{ mr: 1, color: 'primary.main' }} />
//                     My Profile
//                   </MenuItem>
//                   {isAdmin && (
//                     <MenuItem component={Link} to="/admin" onClick={handleMenuClose}>
//                       <AccountCircleIcon sx={{ mr: 1, color: 'secondary.main' }} />
//                       Admin Panel
//                     </MenuItem>
//                   )}
//                   <Divider />
//                   <MenuItem onClick={handleLogout}>
//                     <ExitToAppIcon sx={{ mr: 1, color: 'error.main' }} />
//                     Logout
//                   </MenuItem>
//                 </Menu>
//               </Box>
//             ) : (
//               <Button 
//                 color="inherit" 
//                 component={Link} 
//                 to="/login"
//                 sx={{
//                   backgroundColor: facebookBlue,
//                   color: 'white',
//                   '&:hover': {
//                     backgroundColor: '#166FE5'
//                   }
//                 }}
//               >
//                 <LoginIcon sx={{ mr: 1 }} />
//                 Login
//               </Button>
//             )}
//           </Box>
//         </Toolbar>
//       </AppBar>

//       <Drawer anchor="left" open={drawerOpen} onClose={toggleDrawer(false)}>
//         <Box sx={{ width: 250 }} role="presentation" onClick={toggleDrawer(false)} onKeyDown={toggleDrawer(false)}>
//           <List>
//             {loggedIn && (
//               <ListItem>
//                 <Box component="form" onSubmit={handleSearch} sx={{ display: 'flex', alignItems: 'center', width: '100%', borderRadius: '50px', backgroundColor: bgGray, p: '4px 8px' }}>
//                   <IconButton type="submit" size="small">
//                     <SearchIcon />
//                   </IconButton>
//                   <InputBase placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} sx={{ ml: 1, flex: 1 }} />
//                 </Box>
//               </ListItem>
//             )}
//             {loggedIn && (
//               <ListItem component={Link} to="/profile/me" sx={{ '&:hover': { backgroundColor: hoverColor } }}>
//                 <Avatar 
//                   src={userImage} 
//                   sx={{ width: 40, height: 40, mr: 2 }}
//                 />
//                 <Typography variant="body1">{userFirstName} {userLastName}</Typography>
//               </ListItem>
//             )}
//             {loggedIn && navItems.map((item) => (
//               <ListItem key={item.name} component={Link} to={item.path} sx={{ '&:hover': { backgroundColor: hoverColor } }}>
//                 <ListItemIcon>
//                   <item.icon sx={{ color: item.color }} />
//                 </ListItemIcon>
//                 <ListItemText primary={item.name} />
//               </ListItem>
//             ))}
//             <ListItem component={Link} to="/contact-us">
//               <ListItemIcon>
//                 <ContactMailIcon color="info" />
//               </ListItemIcon>
//               <ListItemText primary="Contact Us" />
//             </ListItem>

          
//             {!loggedIn && (
//               <ListItem component={Link} to="/login">
//                 <ListItemIcon>
//                   <LoginIcon color="success" />
//                 </ListItemIcon>
//                 <ListItemText primary="Login" />
//               </ListItem>
//             )}
//           </List>
//         </Box>
//       </Drawer>
//     </>
//   );
// };

// export default Navbar;










