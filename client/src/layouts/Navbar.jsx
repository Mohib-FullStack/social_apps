import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Box,
  IconButton,
  Button,
  Avatar,
  Typography,
  Menu,
  MenuItem,
  InputBase,
  Badge,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  AccountCircle as AccountCircleIcon,
  Dashboard as DashboardIcon,
  ExitToApp as ExitToAppIcon,
  Home as HomeIcon,
  Login as LoginIcon,
  Menu as MenuIcon,
  VpnKey as PasswordIcon,
  ContactMail as ContactMailIcon,
  Search as SearchIcon,
  Notifications as NotificationsIcon,
  Chat as ChatIcon,
  Group as GroupsIcon,
  Store as MarketplaceIcon,
  People as FriendsIcon
} from '@mui/icons-material';
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

  // Color scheme
  const facebookBlue = '#1877F2';
  const bgGray = '#F0F2F5';
  const activeColor = '#1877F2';
  const hoverColor = '#E7F3FF';

  // Navigation items with icons and colors
  const navItems = [
    { name: 'Home', icon: HomeIcon, path: '/', color: activeColor },
    { name: 'Friends', icon: FriendsIcon, path: '/friends', color: '#1B74E4' },
    { name: 'Groups', icon: GroupsIcon, path: '/groups', color: '#E44D2E' },
    { name: 'Marketplace', icon: MarketplaceIcon, path: '/marketplace', color: '#42B72A' }
  ];

  // Original toggle functions
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

  const userFirstName = profile?.user?.firstName || 'User';
  const userLastName = profile?.user?.lastName || 'Unknown';
  const userImage = profile?.user?.image || '/assets/images/default-avatar.png';

  return (
    <>
      <AppBar position="fixed" sx={{ bgcolor: 'white', color: 'black', boxShadow: 'none' }}>
        <Toolbar sx={{ justifyContent: 'space-between', height: '56px' }}>
          {/* Left Section - Logo & Mobile Menu */}
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
              sx={{
                fontWeight: 'bold',
                color: facebookBlue,
                textDecoration: 'none',
                mr: 2
              }}
            >
              SocialApp
            </Typography>
          </Box>

          {/* Center Section - Navigation Items (Visible only when logged in) */}
          {loggedIn && (
            <Box sx={{ 
              display: { xs: 'none', md: 'flex' },
              flexGrow: 1,
              justifyContent: 'center',
              gap: 1,
              maxWidth: '600px'
            }}>
              {navItems.map((item) => (
                <Button
                  key={item.name}
                  component={Link}
                  to={item.path}
                  sx={{
                    minWidth: '110px',
                    height: '48px',
                    borderRadius: '8px',
                    '&:hover': {
                      backgroundColor: hoverColor
                    }
                  }}
                >
                  <item.icon sx={{ 
                    color: item.color,
                    fontSize: '28px',
                    mr: 1
                  }} />
                  <Typography variant="body2" sx={{ color: 'text.primary' }}>
                    {item.name}
                  </Typography>
                </Button>
              ))}
            </Box>
          )}

          {/* Right Section - Search, Notifications & User */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {/* Search Bar (Desktop) - Visible only when logged in */}
            {loggedIn && (
              <Box 
                component="form"
                onSubmit={handleSearch}
                sx={{
                  display: { xs: 'none', md: 'flex' },
                  alignItems: 'center',
                  borderRadius: '50px',
                  backgroundColor: bgGray,
                  '&:hover': { backgroundColor: '#E4E6E9' },
                  width: '240px',
                  height: '40px',
                  mr: 2
                }}
              >
                <IconButton type="submit" sx={{ p: '8px', color: 'text.secondary' }}>
                  <SearchIcon />
                </IconButton>
                <InputBase
                  placeholder="Search SocialApp"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  sx={{ ml: 1, flex: 1 }}
                />
              </Box>
            )}

            {/* Notification Icon */}
            {loggedIn && (
              <IconButton color="inherit" component={Link} to="/notifications">
                <Badge badgeContent={4} color="error">
                  <NotificationsIcon />
                </Badge>
              </IconButton>
            )}

            {/* User Profile Section */}
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
                    <AccountCircleIcon sx={{ mr: 1 }} />
                    My Profile
                  </MenuItem>
                  <MenuItem onClick={handleLogout}>
                    <ExitToAppIcon sx={{ mr: 1 }} />
                    Logout
                  </MenuItem>
                </Menu>
              </Box>
            ) : (
              <Button color="inherit" component={Link} to="/login">
                <LoginIcon sx={{ mr: 1 }} />
                Login
              </Button>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer anchor="left" open={drawerOpen} onClose={toggleDrawer(false)}>
        <Box
          sx={{ width: 250 }}
          role="presentation"
          onClick={toggleDrawer(false)}
          onKeyDown={toggleDrawer(false)}
        >
          <List>
            {/* Mobile Search Bar */}
            {loggedIn && (
              <ListItem>
                <Box 
                  component="form"
                  onSubmit={handleSearch}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    width: '100%',
                    borderRadius: '50px',
                    backgroundColor: bgGray,
                    p: '4px 8px'
                  }}
                >
                  <IconButton type="submit" size="small">
                    <SearchIcon />
                  </IconButton>
                  <InputBase
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    sx={{ ml: 1, flex: 1 }}
                  />
                </Box>
              </ListItem>
            )}

            {/* Navigation Items in Drawer */}
            {loggedIn && navItems.map((item) => (
              <ListItem 
                key={item.name} 
                component={Link} 
                to={item.path}
                sx={{
                  '&:hover': {
                    backgroundColor: hoverColor
                  }
                }}
              >
                <ListItemIcon>
                  <item.icon sx={{ color: item.color }} />
                </ListItemIcon>
                <ListItemText primary={item.name} />
              </ListItem>
            ))}

            {/* Original Drawer Content */}
            <ListItem component={Link} to="/contact-us">
              <ListItemIcon>
                <ContactMailIcon color="info" />
              </ListItemIcon>
              <ListItemText primary="Contact Us" />
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


//! last
// import React, { useState, useEffect } from 'react';
// import {
//   AppBar,
//   Toolbar,
//   Box,
//   IconButton,
//   Button,
//   Avatar,
//   Typography,
//   Menu,
//   MenuItem,
//   InputBase,
//   Badge,
//   Drawer,
//   List,
//   ListItem,
//   ListItemIcon,
//   ListItemText
// } from '@mui/material';
// import {
//   AccountCircle as AccountCircleIcon,
//   Dashboard as DashboardIcon,
//   ExitToApp as ExitToAppIcon,
//   Home as HomeIcon,
//   Login as LoginIcon,
//   Menu as MenuIcon,
//   VpnKey as PasswordIcon,
//   ContactMail as ContactMailIcon,
//   Search as SearchIcon,
//   Notifications as NotificationsIcon,
//   Chat as ChatIcon
// } from '@mui/icons-material';
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

//   // Facebook-style colors
//   const facebookBlue = '#1877F2';
//   const bgGray = '#F0F2F5';

//   // Original toggle functions
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

//   const userFirstName = profile?.user?.firstName || 'User';
//   const userLastName = profile?.user?.lastName || 'Unknown';
//   const userImage = profile?.user?.image || '/assets/images/default-avatar.png';

//   return (
//     <>
//       <AppBar position="fixed" sx={{ bgcolor: 'white', color: 'black', boxShadow: 'none' }}>
//         <Toolbar sx={{ justifyContent: 'space-between' }}>
//           {/* Left Section - Logo & Mobile Menu */}
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
//               sx={{
//                 fontWeight: 'bold',
//                 color: facebookBlue,
//                 textDecoration: 'none',
//                 mr: 2
//               }}
//             >
//               SocialApp
//             </Typography>
//           </Box>

//           {/* Center Section - Search Bar (Desktop) */}
//           <Box sx={{ 
//             display: { xs: 'none', md: 'flex' },
//             flexGrow: 0.5,
//             maxWidth: '500px'
//           }}>
//             <Box 
//               component="form"
//               onSubmit={handleSearch}
//               sx={{
//                 display: 'flex',
//                 alignItems: 'center',
//                 width: '100%',
//                 borderRadius: '50px',
//                 backgroundColor: bgGray,
//                 '&:hover': { backgroundColor: '#E4E6E9' }
//               }}
//             >
//               <IconButton type="submit" sx={{ p: '8px', color: 'text.secondary' }}>
//                 <SearchIcon />
//               </IconButton>
//               <InputBase
//                 placeholder="Search SocialApp"
//                 value={searchQuery}
//                 onChange={(e) => setSearchQuery(e.target.value)}
//                 sx={{ ml: 1, flex: 1 }}
//               />
//             </Box>
//           </Box>

//           {/* Right Section - Navigation & User (EXACTLY AS IN ORIGINAL) */}
//           <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
//             {/* Notification Icon (New Addition) */}
//             {loggedIn && (
//               <IconButton color="inherit" component={Link} to="/notifications">
//                 <Badge badgeContent={4} color="error">
//                   <NotificationsIcon />
//                 </Badge>
//               </IconButton>
//             )}

//             {/* EXACT COPY OF YOUR ORIGINAL USER PROFILE SECTION */}
//             {loggedIn ? (
//               <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
//                 {isAdmin && (
//                   <Button 
//                     color="inherit" 
//                     component={Link} 
//                     to="/admin-dashboard"
//                     sx={{ display: { xs: 'none', md: 'flex' } }}
//                   >
//                     <DashboardIcon sx={{ mr: 1 }} />
//                     Admin Dashboard
//                   </Button>
//                 )}
//                 <Typography
//                   variant="body1"
//                   sx={{ display: { xs: 'none', md: 'block' } }}
//                 >
//                   {userFirstName} {userLastName}
//                 </Typography>
//                 <IconButton
//                   edge="end"
//                   aria-controls="menu-appbar"
//                   aria-haspopup="true"
//                   onClick={handleMenuOpen}
//                   color="inherit"
//                 >
//                   <Avatar
//                     src={userImage}
//                     alt={`${userFirstName} ${userLastName}`}
//                   />
//                 </IconButton>
//                 <Menu
//                   id="menu-appbar"
//                   anchorEl={anchorEl}
//                   open={isMenuOpen}
//                   onClose={handleMenuClose}
//                 >
//                   <MenuItem>{`Hello, ${userFirstName} ${userLastName}`}</MenuItem>
//                   <MenuItem component={Link} to="/profile">
//                     <AccountCircleIcon sx={{ mr: 1 }} />
//                     My Profile
//                   </MenuItem>
//                   <MenuItem onClick={handleLogout}>
//                     <ExitToAppIcon sx={{ mr: 1 }} />
//                     Logout
//                   </MenuItem>
//                 </Menu>
//               </Box>
//             ) : (
//               <Button color="inherit" component={Link} to="/login">
//                 <LoginIcon sx={{ mr: 1 }} />
//                 Login
//               </Button>
//             )}
//           </Box>
//         </Toolbar>
//       </AppBar>

//       {/* EXACT COPY OF YOUR ORIGINAL DRAWER CONTENT */}
//       <Drawer anchor="left" open={drawerOpen} onClose={toggleDrawer(false)}>
//         <Box
//           sx={{ width: 250 }}
//           role="presentation"
//           onClick={toggleDrawer(false)}
//           onKeyDown={toggleDrawer(false)}
//         >
//           <List>
//             {/* Mobile Search Bar (New Addition) */}
//             <ListItem>
//               <Box 
//                 component="form"
//                 onSubmit={handleSearch}
//                 sx={{
//                   display: 'flex',
//                   alignItems: 'center',
//                   width: '100%',
//                   borderRadius: '50px',
//                   backgroundColor: bgGray,
//                   p: '4px 8px'
//                 }}
//               >
//                 <IconButton type="submit" size="small">
//                   <SearchIcon />
//                 </IconButton>
//                 <InputBase
//                   placeholder="Search..."
//                   value={searchQuery}
//                   onChange={(e) => setSearchQuery(e.target.value)}
//                   sx={{ ml: 1, flex: 1 }}
//                 />
//               </Box>
//             </ListItem>

//             <ListItem component={Link} to="/">
//               <ListItemIcon>
//                 <HomeIcon color="primary" />
//               </ListItemIcon>
//               <ListItemText primary="Home" />
//             </ListItem>

//             <ListItem component={Link} to="/user-table">
//               <ListItemIcon>
//                 <AccountCircleIcon color="primary" />
//               </ListItemIcon>
//               <ListItemText primary="UserTable" />
//             </ListItem>

//             <ListItem component={Link} to="/contact-us">
//               <ListItemIcon>
//                 <ContactMailIcon color="info" />
//               </ListItemIcon>
//               <ListItemText primary="Contact Us" />
//             </ListItem>

//             {loggedIn && (
//               <>
//                 <ListItem component={Link} to="/profile">
//                   <ListItemIcon>
//                     <AccountCircleIcon color="info" />
//                   </ListItemIcon>
//                   <ListItemText primary="Profile" />
//                 </ListItem>
//                 <ListItem component={Link} to="/update-password">
//                   <ListItemIcon>
//                     <PasswordIcon color="warning" />
//                   </ListItemIcon>
//                   <ListItemText primary="Update Password" />
//                 </ListItem>
//                 <ListItem onClick={handleLogout}>
//                   <ListItemIcon>
//                     <ExitToAppIcon color="error" />
//                   </ListItemIcon>
//                   <ListItemText primary="Logout" />
//                 </ListItem>
//               </>
//             )}
//           </List>
//         </Box>
//       </Drawer>
//     </>
//   );
// };

// export default Navbar;





// import React, { useState } from 'react';
// import {
//   AppBar,
//   Toolbar,
//   Box,
//   IconButton,
//   Button,
//   Avatar,
//   Typography,
//   Menu,
//   MenuItem,
//   InputBase,
//   alpha,
//   Badge,
//   Drawer,
// } from '@mui/material';
// import {
//   Menu as MenuIcon,
//   Home as HomeIcon,
//   Chat as ChatIcon,
//   Notifications as NotificationsIcon,
//   Search as SearchIcon,
//   AccountCircle as AccountCircleIcon,
//   Dashboard as DashboardIcon,
// } from '@mui/icons-material';
// import { People as PeopleIcon } from '@mui/icons-material';
// import { Link, useNavigate } from 'react-router-dom';

// const Navbar = () => {
//   const [anchorEl, setAnchorEl] = useState(null);
//   const [searchQuery, setSearchQuery] = useState('');
//   const navigate = useNavigate();

//   // 🔵 Facebook Blue Color Palette
//   const facebookBlue = '#1877F2';
//   const hoverBlue = '#166FE5';
//   const bgGray = '#F0F2F5';
//   const hoverGray = '#E4E6E9';

//   // 🍔 Mobile Menu Toggle
//   const [mobileOpen, setMobileOpen] = useState(false);

//   // 👤 Profile Menu Handlers
//   const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
//   const handleMenuClose = () => setAnchorEl(null);

//   // 🔍 Search Handler
//   const handleSearch = (e) => {
//     e.preventDefault();
//     if (searchQuery.trim()) {
//       navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
//       setSearchQuery('');
//     }
//   };

//   return (
//     <AppBar 
//       position="fixed" 
//       sx={{ 
//         bgcolor: 'white', 
//         color: 'black',
//         boxShadow: 'none',
//         borderBottom: '1px solid #dddfe2'
//       }}
//     >
//       <Toolbar sx={{ 
//         justifyContent: 'space-between',
//         padding: '0 16px',
//         height: '56px'
//       }}>
//         {/* ================== */}
//         {/* 🅱️ LEFT SECTION - LOGO & SEARCH */}
//         {/* ================== */}
//         <Box sx={{ 
//           display: 'flex', 
//           alignItems: 'center',
//           gap: { xs: 1, sm: 2 }
//         }}>
//           {/* Facebook Logo (Replace with your logo) */}
//           <Typography 
//             variant="h5" 
//             component={Link} 
//             to="/"
//             sx={{
//               fontWeight: 'bold',
//               color: facebookBlue,
//               textDecoration: 'none',
//               mr: 1
//             }}
//           >
//             SocialApp
//           </Typography>

//           {/* 🔍 SEARCH BAR (Facebook Style) */}
//           <Box 
//             component="form" 
//             onSubmit={handleSearch}
//             sx={{
//               display: { xs: 'none', md: 'flex' },
//               position: 'relative',
//               borderRadius: '50px',
//               backgroundColor: bgGray,
//               '&:hover': { backgroundColor: hoverGray },
//               width: '240px',
//               height: '40px'
//             }}
//           >
//             <IconButton 
//               type="submit" 
//               sx={{ 
//                 position: 'absolute',
//                 left: '8px',
//                 color: 'text.secondary',
//                 p: '8px'
//               }}
//             >
//               <SearchIcon />
//             </IconButton>
//             <InputBase
//               placeholder="Search SocialApp"
//               value={searchQuery}
//               onChange={(e) => setSearchQuery(e.target.value)}
//               sx={{
//                 pl: '40px',
//                 pr: '16px',
//                 width: '100%',
//                 '& input': {
//                   py: '8px'
//                 }
//               }}
//             />
//           </Box>
//         </Box>

//         {/* ================== */}
//         {/* 🏠 CENTER SECTION - NAV ICONS */}
//         {/* ================== */}
//         <Box sx={{ 
//           display: { xs: 'none', sm: 'flex' },
//           justifyContent: 'center',
//           flex: 1,
//           maxWidth: '600px',
//           gap: { sm: 1, md: 2 }
//         }}>
//           {/* Home Button */}
//           <Button 
//             component={Link} 
//             to="/"
//             sx={{
//               minWidth: '80px',
//               height: '48px',
//               borderRadius: '8px',
//               '&:hover': { 
//                 backgroundColor: alpha(facebookBlue, 0.1) 
//               }
//             }}
//           >
//             <HomeIcon sx={{ fontSize: '28px', color: facebookBlue }} />
//           </Button>

//           {/* Friends Button */}
//           <Button 
//             component={Link} 
//             to="/friends"
//             sx={{
//               minWidth: '80px',
//               height: '48px',
//               borderRadius: '8px',
//               '&:hover': { 
//                 backgroundColor: alpha(facebookBlue, 0.1) 
//               }
//             }}
//           >
//             <PeopleIcon sx={{ fontSize: '28px', color: 'text.secondary' }} />
//           </Button>

//           {/* Chat Button */}
//           <Button 
//             component={Link} 
//             to="/chat"
//             sx={{
//               minWidth: '80px',
//               height: '48px',
//               borderRadius: '8px',
//               '&:hover': { 
//                 backgroundColor: alpha(facebookBlue, 0.1) 
//               }
//             }}
//           >
//             <ChatIcon sx={{ fontSize: '28px', color: 'text.secondary' }} />
//           </Button>

//           {/* Notifications Button */}
//           <Button 
//             component={Link} 
//             to="/notifications"
//             sx={{
//               minWidth: '80px',
//               height: '48px',
//               borderRadius: '8px',
//               '&:hover': { 
//                 backgroundColor: alpha(facebookBlue, 0.1) 
//               }
//             }}
//           >
//             <Badge badgeContent={4} color="error">
//               <NotificationsIcon sx={{ fontSize: '28px', color: 'text.secondary' }} />
//             </Badge>
//           </Button>
//         </Box>

//         {/* ================== */}
//         {/* 👤 RIGHT SECTION - USER MENU */}
//         {/* ================== */}
//         <Box sx={{ 
//           display: 'flex', 
//           alignItems: 'center',
//           gap: 1
//         }}>
//           {/* Mobile Menu Button */}
//           <IconButton
//             size="large"
//             edge="start"
//             color="inherit"
//             aria-label="menu"
//             sx={{ 
//               display: { sm: 'none' },
//               mr: 1
//             }}
//             onClick={() => setMobileOpen(!mobileOpen)}
//           >
//             <MenuIcon />
//           </IconButton>

//           {/* User Profile Button */}
//           <IconButton
//             size="small"
//             onClick={handleMenuOpen}
//             sx={{ 
//               p: 0,
//               '&:hover': { 
//                 opacity: 0.9 
//               }
//             }}
//           >
//             <Avatar 
//               alt="User Name" 
//               src="/path/to/avatar.jpg" 
//               sx={{ 
//                 width: 36, 
//                 height: 36,
//                 border: `2px solid ${facebookBlue}`
//               }}
//             />
//           </IconButton>

//           {/* Profile Dropdown Menu */}
//           <Menu
//             anchorEl={anchorEl}
//             open={Boolean(anchorEl)}
//             onClose={handleMenuClose}
//             sx={{ 
//               mt: '40px',
//               '& .MuiPaper-root': {
//                 width: '360px',
//                 borderRadius: '10px',
//                 boxShadow: '0 12px 28px 0 rgba(0, 0, 0, 0.2)',
//                 border: '1px solid #dddfe2'
//               }
//             }}
//           >
//             <MenuItem onClick={handleMenuClose} component={Link} to="/profile">
//               <Box sx={{ display: 'flex', alignItems: 'center', p: 1 }}>
//                 <Avatar 
//                   src="/path/to/avatar.jpg" 
//                   sx={{ width: 40, height: 40, mr: 2 }}
//                 />
//                 <Typography variant="body1">Your Profile</Typography>
//               </Box>
//             </MenuItem>
//             <MenuItem onClick={handleMenuClose}>Settings</MenuItem>
//             <MenuItem onClick={handleMenuClose}>Log Out</MenuItem>
//           </Menu>
//         </Box>
//       </Toolbar>

//       {/* ================== */}
//       {/* 📱 MOBILE MENU (Drawer) */}
//       {/* ================== */}
//       <Drawer
//         anchor="left"
//         open={mobileOpen}
//         onClose={() => setMobileOpen(false)}
//         sx={{
//           '& .MuiDrawer-paper': {
//             width: '280px',
//             boxSizing: 'border-box',
//             p: 2
//           }
//         }}
//       >
//         {/* Mobile Search Bar */}
//         <Box 
//           component="form" 
//           onSubmit={handleSearch}
//           sx={{
//             display: 'flex',
//             alignItems: 'center',
//             mb: 2,
//             borderRadius: '50px',
//             backgroundColor: bgGray,
//             '&:hover': { backgroundColor: hoverGray },
//             width: '100%',
//             height: '40px'
//           }}
//         >
//           <IconButton 
//             type="submit" 
//             sx={{ 
//               color: 'text.secondary',
//               p: '8px'
//             }}
//           >
//             <SearchIcon />
//           </IconButton>
//           <InputBase
//             placeholder="Search..."
//             value={searchQuery}
//             onChange={(e) => setSearchQuery(e.target.value)}
//             sx={{
//               pl: '8px',
//               pr: '16px',
//               width: '100%',
//               '& input': {
//                 py: '8px'
//               }
//             }}
//           />
//         </Box>

//         {/* Mobile Menu Items */}
//         <MenuItem component={Link} to="/" onClick={() => setMobileOpen(false)}>
//           <HomeIcon sx={{ mr: 2 }} /> Home
//         </MenuItem>
//         <MenuItem component={Link} to="/friends" onClick={() => setMobileOpen(false)}>
//           <PeopleIcon sx={{ mr: 2 }} /> Friends
//         </MenuItem>
//         <MenuItem component={Link} to="/chat" onClick={() => setMobileOpen(false)}>
//           <ChatIcon sx={{ mr: 2 }} /> Chat
//         </MenuItem>
//         <MenuItem component={Link} to="/profile" onClick={() => setMobileOpen(false)}>
//           <AccountCircleIcon sx={{ mr: 2 }} /> Profile
//         </MenuItem>
//       </Drawer>
//     </AppBar>
//   );
// };

// export default Navbar;








//! original
// import {
//   AccountCircle as AccountCircleIcon,
//   ContactMail as ContactMailIcon,
//   Dashboard as DashboardIcon,
//   ExitToApp as ExitToAppIcon,
//   Home as HomeIcon,
//   Login as LoginIcon,
//   Menu as MenuIcon,
//   VpnKey as PasswordIcon,
// } from '@mui/icons-material';
// import ChatIcon from '@mui/icons-material/Chat';
// import {
//   AppBar,
//   Avatar,
//   Box,
//   Button,
//   Drawer,
//   IconButton,
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
//   const isMenuOpen = Boolean(anchorEl);

//   const toggleDrawer = (open) => (event) => {
//     if (
//       event.type === 'keydown' &&
//       (event.key === 'Tab' || event.key === 'Shift')
//     ) {
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
//     dispatch(
//       showSnackbar({ message: 'Successfully logged out', severity: 'success' })
//     );
//     handleMenuClose();
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

//   const userFirstName = profile?.user?.firstName || 'User';
// const userLastName = profile?.user?.lastName || 'Unknown';
//  const userImage = profile?.user?.image || '/assets/images/default-avatar.png';

//   // const { items: cartItems } = useSelector((state) => state.cart);
//   // const cartCount = Array.isArray(cartItems)
//   //   ? cartItems.reduce((total, item) => total + (item.quantity || 0), 0)
//   //   : 0;

//   return (
//     <>


// <AppBar position="fixed">
//   <Toolbar sx={{ justifyContent: 'space-between' }}>
//     {/* Menu Icon for Small Screens */}
//     <Box sx={{ display: { xs: 'block', md: 'none' } }}>
//       <IconButton
//         edge="start"
//         color="inherit"
//         aria-label="menu"
//         onClick={toggleDrawer(true)}
//       >
//         <MenuIcon />
//       </IconButton>
//     </Box>

//     {/* Centered buttons (Home, Cart, Product) */}
//     <Box sx={{ 
//         display: { xs: 'none', sm: 'none', md: 'flex' }, 
//         justifyContent: 'center', 
//         flexGrow: 1, 
//         gap: 2 
//       }}>
//       <Button color="inherit" component={Link} to="/">
//         <HomeIcon />
//         Home
//       </Button>

//        {/* Add to your navigation buttons */}
// <Button color="inherit" component={Link} to="/chat">
//   <ChatIcon />
//   chatRoom
// </Button>

// <Button color="inherit" component={Link} to="/user-table">
//   <ChatIcon />
//   UserTable
// </Button>

//       {/* <Button color="inherit" component={Link} to="/cart-page">
//         <Badge badgeContent={cartCount} color="secondary">
//           <ShoppingCartIcon />
//         </Badge>
//         Cart
//       </Button> */}

//       {/* <Button color="inherit" component={Link} to="/product-display">
//         <ShoppingCartIcon />
//         Product
//       </Button> */}
//     </Box>

//     {/* Admin Dashboard Button (conditionally displayed for admin) */}
//     {isAdmin && (
//       <Button color="inherit" component={Link} to="/admin-dashboard">
//         <DashboardIcon />
//         Admin Dashboard
//       </Button>
//     )}

//     {/* User Authentication (Login/Logout and Profile) */}
//     {loggedIn ? (
//       <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
//         <Typography
//           variant="body1"
//           sx={{ display: { xs: 'none', md: 'block' } }}
//         >
//           {userFirstName} {userLastName}
//         </Typography>
//         <IconButton
//           edge="end"
//           aria-controls="menu-appbar"
//           aria-haspopup="true"
//           onClick={handleMenuOpen}
//           color="inherit"
//         >
//           <Avatar
//             src={userImage}
//             alt={`${userFirstName} ${userLastName}`}
//           />
//         </IconButton>
//         <Menu
//           id="menu-appbar"
//           anchorEl={anchorEl}
//           open={isMenuOpen}
//           onClose={handleMenuClose}
//         >
//           <MenuItem>{`Hello, ${userFirstName} ${userLastName}`}</MenuItem>
//           <MenuItem component={Link} to="/profile">
//             <AccountCircleIcon />
//             My Profile
//           </MenuItem>
//           <MenuItem onClick={handleLogout}>
//             <ExitToAppIcon />
//             Logout
//           </MenuItem>
//         </Menu>
//       </Box>
//     ) : (
//       <Button color="inherit" component={Link} to="/login">
//         <LoginIcon />
//         Login
//       </Button>
//     )}
//   </Toolbar>
// </AppBar>



//       <Drawer anchor="left" open={drawerOpen} onClose={toggleDrawer(false)}>
//         <Box
//           sx={{ width: 250 }}
//           role="presentation"
//           onClick={toggleDrawer(false)}
//           onKeyDown={toggleDrawer(false)}
//         >
//           <List>
//             <ListItem component={Link} to="/">
//               <ListItemIcon>
//                 <HomeIcon color="primary" />
//               </ListItemIcon>
//               <ListItemText primary="Home" />
//             </ListItem>

//             <ListItem component={Link} to="/user-table">
//               <ListItemIcon>
//                 <HomeIcon color="primary" />
//               </ListItemIcon>
//               <ListItemText primary="UserTable" />
//             </ListItem>

//             {/* <ListItem component={Link} to="/cart-page">
//               <ListItemIcon>
//                 <ShoppingCartIcon color="secondary" />
//               </ListItemIcon>
//               <ListItemText primary={`Cart (${cartCount})`} />
//             </ListItem> */}

//             <ListItem component={Link} to="/contact-us">
//               <ListItemIcon>
//                 <ContactMailIcon color="info" />
//               </ListItemIcon>
//               <ListItemText primary="Contact Us" />
//             </ListItem>

//             <ListItem component={Link} to="/dashboard">
//               <ListItemIcon>
//                 <DashboardIcon color="success" />
//               </ListItemIcon>
//               <ListItemText primary="Dashboard" />
//             </ListItem>

//             {loggedIn && (
//               <>
//                 <ListItem component={Link} to="/profile">
//                   <ListItemIcon>
//                     <AccountCircleIcon color="info" />
//                   </ListItemIcon>
//                   <ListItemText primary="Profile" />
//                 </ListItem>
//                 <ListItem component={Link} to="/update-password">
//                   <ListItemIcon>
//                     <PasswordIcon color="warning" />
//                   </ListItemIcon>
//                   <ListItemText primary="Update Password" />
//                 </ListItem>
//                 <ListItem onClick={handleLogout}>
//                   <ListItemIcon>
//                     <ExitToAppIcon color="error" />
//                   </ListItemIcon>
//                   <ListItemText primary="Logout" />
//                 </ListItem>
//               </>
//             )}
//           </List>
//         </Box>
//       </Drawer>
//     </>
//   );
// };

// export default Navbar;


