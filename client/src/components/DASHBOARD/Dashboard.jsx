// import {
//   AdminPanelSettings as AdminIcon,
//   Category as CategoryIcon,
//   LocalShipping as InventoryIcon,
//   People as PeopleIcon,
//   Inventory as ProductIcon,
//   BarChart as SalesIcon,
//   SupportAgent as SupportIcon,
// } from '@mui/icons-material';
// import {
//   Avatar,
//   Box,
//   Button,
//   CardContent,
//   Fade,
//   Grid,
//   Paper,
//   Typography,
// } from '@mui/material';
// import { ThemeProvider } from '@mui/material/styles';
// import { useNavigate } from 'react-router-dom';
// import theme from '../../theme';

// const Dashboard = () => {
//   const navigate = useNavigate();

//   const cardStyle = {
//     padding: 2,
//     backgroundColor: 'background.paper',
//     borderRadius: '15px',
//     transition: 'transform 0.3s ease',
//     '&:hover': {
//       transform: 'scale(1.03)',
//       boxShadow: 6,
//     },
//   };

//   return (
//     <ThemeProvider theme={theme}>
//       <Box
//         sx={{
//           padding: 4,
//           backgroundColor: 'background.default',
//           minHeight: '100vh',
//         }}
//       >
//         {/* Ensure the title is visible by adding more margin on top */}
//         <Typography
//           variant="h3"
//           color="text.primary"
//           gutterBottom
//           sx={{ textAlign: 'center', fontWeight: 'bold', mt: 8, mb: 4 }}
//         >
//           Admin Dashboard
//         </Typography>

//         <Grid container spacing={3} maxWidth="lg" sx={{ margin: '0 auto' }}>
//           {[
//             {
//               title: 'Manage Categories',
//               icon: <CategoryIcon />,
//               color: 'primary.main',
//               path: '/category',
//             },
//             {
//               title: 'Manage Products',
//               icon: <ProductIcon />,
//               color: 'secondary.main',
//               path: '/product',
//             },
//             {
//               title: 'Orders Table',
//               icon: <ProductIcon />,
//               color: 'secondary.main',
//               path: '/order-table',
//             },
//             {
//               title: 'User Management',
//               icon: <PeopleIcon />,
//               color: 'warning.main',
//               path: '/user-table',
//             },
//             {
//               title: 'Admin Panel',
//               icon: <AdminIcon />,
//               color: 'error.main',
//               path: '/admin-panel',
//             },
//             {
//               title: 'Sales Reports',
//               icon: <SalesIcon />,
//               color: 'success.main',
//               path: '/sales-reports',
//             },
//             {
//               title: 'Customer Support',
//               icon: <SupportIcon />,
//               color: 'info.main',
//               path: '/customer-support',
//             },
//             {
//               title: 'Inventory Tracking',
//               icon: <InventoryIcon />,
//               color: 'primary.light',
//               path: '/inventory-tracking',
//             },
//           ].map((item, index) => (
//             <Grid item xs={12} md={4} key={index}>
//               <Fade in={true} timeout={1000 + index * 500}>
//                 <Paper elevation={3} sx={cardStyle}>
//                   <CardContent>
//                     <Avatar sx={{ bgcolor: item.color, mb: 2 }}>{item.icon}</Avatar>
//                     <Typography variant="h6" gutterBottom>
//                       {item.title}
//                     </Typography>
//                     <Button
//                       variant="contained"
//                       fullWidth
//                       color={item.color.split('.')[0]}
//                       onClick={() => navigate(item.path)}
//                     >
//                       Go to {item.title}
//                     </Button>
//                   </CardContent>
//                 </Paper>
//               </Fade>
//             </Grid>
//           ))}
//         </Grid>
//       </Box>
//     </ThemeProvider>
//   );
// };

// export default Dashboard;

//! test
// import {
//   Event as EventsIcon,
//   People as FriendsIcon,
//   Groups as GroupsIcon,
//   Favorite as LikesIcon,
//   Chat as MessagesIcon,
//   Article as PostsIcon,
//   Settings as SettingsIcon,
//   PhotoCamera as StoriesIcon,
//   Visibility as ViewsIcon
// } from '@mui/icons-material';
// import {
//   Avatar,
//   Box,
//   Button,
//   Card,
//   CardContent,
//   Container,
//   Grid,
//   Typography,
//   useTheme
// } from '@mui/material';
// import React from 'react';
// import { useSelector } from 'react-redux';
// import { useNavigate } from 'react-router-dom';

// const Dashboard = () => {
//   const navigate = useNavigate();
//   const theme = useTheme();
//   const { profile } = useSelector((state) => state.user);

//   // Dynamic stats - replace with real data
//   const socialStats = {
//     posts: { count: 42, new: 3 },
//     friends: { count: 128, mutual: 24 },
//     views: { count: '1.2K', trend: '↑ 12%' },
//     messages: { count: 15, unread: 2 },
//     groups: { count: 8, active: 3 },
//     events: { upcoming: 2 },
//     likes: { count: '3.5K', today: 24 }
//   };

//   // Feature Cards Configuration
//   const featureCards = [
//     {
//       title: "Social Feed",
//       icon: <PostsIcon fontSize="large" />,
//       count: socialStats.posts.count,
//       subtitle: `${socialStats.posts.new} new updates`,
//       color: theme.palette.primary.main,
//       action: () => navigate('/feed')
//     },
//     {
//       title: "My Network",
//       icon: <FriendsIcon fontSize="large" />,
//       count: socialStats.friends.count,
//       subtitle: `${socialStats.friends.mutual} mutual connections`,
//       color: theme.palette.secondary.main,
//       action: () => navigate('/network')
//     },
//     {
//       title: "Profile Views",
//       icon: <ViewsIcon fontSize="large" />,
//       count: socialStats.views.count,
//       subtitle: socialStats.views.trend,
//       color: theme.palette.success.main,
//       action: () => navigate('/insights')
//     },
//     {
//       title: "Messages",
//       icon: <MessagesIcon fontSize="large" />,
//       count: socialStats.messages.count,
//       subtitle: `${socialStats.messages.unread} unread`,
//       color: theme.palette.info.main,
//       action: () => navigate('/messages')
//     },
//     {
//       title: "My Groups",
//       icon: <GroupsIcon fontSize="large" />,
//       count: socialStats.groups.count,
//       subtitle: `${socialStats.groups.active} active now`,
//       color: theme.palette.warning.main,
//       action: () => navigate('/groups')
//     },
//     {
//       title: "Events",
//       icon: <EventsIcon fontSize="large" />,
//       count: socialStats.events.upcoming,
//       subtitle: "Upcoming events",
//       color: theme.palette.error.main,
//       action: () => navigate('/events')
//     },
//     {
//       title: "Story Archive",
//       icon: <StoriesIcon fontSize="large" />,
//       count: "24+",
//       subtitle: "Your memories",
//       color: "#9c27b0", // Purple
//       action: () => navigate('/stories')
//     },
//     {
//       title: "Likes",
//       icon: <LikesIcon fontSize="large" />,
//       count: socialStats.likes.count,
//       subtitle: `${socialStats.likes.today} today`,
//       color: "#f44336", // Red
//       action: () => navigate('/likes')
//     }
//   ];

//   return (
//     <Container maxWidth="xl" sx={{ py: 4 }}>
//       {/* Welcome Header */}
//       <Box sx={{ 
//         display: 'flex', 
//         justifyContent: 'space-between', 
//         alignItems: 'center',
//         mb: 4
//       }}>
//         <Box>
//           <Typography variant="h4" fontWeight="bold">
//             Welcome back, {profile?.firstName || 'Friend'}!
//           </Typography>
//           <Typography color="text.secondary">
//             Here's what's happening in your social world
//           </Typography>
//         </Box>
//         <Button 
//           variant="contained"
//           startIcon={<SettingsIcon />}
//           onClick={() => navigate('/settings')}
//           sx={{
//             bgcolor: 'background.paper',
//             color: 'text.primary',
//             '&:hover': { bgcolor: 'action.hover' }
//           }}
//         >
//           Customize
//         </Button>
//       </Box>

//       {/* Social Dashboard Grid */}
//       <Grid container spacing={3}>
//         {featureCards.map((card, index) => (
//           <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
//             <Card 
//               sx={{
//                 height: '100%',
//                 background: `linear-gradient(135deg, ${card.color} 0%, ${theme.palette.background.paper} 100%)`,
//                 color: theme.palette.getContrastText(card.color),
//                 transition: 'all 0.3s ease',
//                 '&:hover': {
//                   transform: 'translateY(-5px)',
//                   boxShadow: 6
//                 }
//               }}
//               onClick={card.action}
//             >
//               <CardContent sx={{ position: 'relative', height: '100%' }}>
//                 <Avatar sx={{ 
//                   bgcolor: 'rgba(255,255,255,0.2)', 
//                   width: 60, 
//                   height: 60,
//                   mb: 2
//                 }}>
//                   {card.icon}
//                 </Avatar>
//                 <Typography variant="h5" fontWeight="bold" gutterBottom>
//                   {card.title}
//                 </Typography>
//                 <Typography variant="h2" sx={{ my: 1 }}>
//                   {card.count}
//                 </Typography>
//                 <Typography variant="body2" sx={{ opacity: 0.9 }}>
//                   {card.subtitle}
//                 </Typography>
//                 <Button
//                   variant="outlined"
//                   size="small"
//                   sx={{
//                     mt: 2,
//                     color: 'inherit',
//                     borderColor: 'rgba(255,255,255,0.5)',
//                     '&:hover': {
//                       bgcolor: 'rgba(255,255,255,0.1)',
//                       borderColor: 'white'
//                     }
//                   }}
//                 >
//                   Explore
//                 </Button>
//               </CardContent>
//             </Card>
//           </Grid>
//         ))}
//       </Grid>

//       {/* Quick Actions Bar */}
//       <Box sx={{ 
//         position: 'fixed', 
//         bottom: 20, 
//         left: 0, 
//         right: 0,
//         display: 'flex',
//         justifyContent: 'center'
//       }}>
//         <Card sx={{ 
//           borderRadius: 50,
//           boxShadow: 3,
//           px: 2,
//           py: 1
//         }}>
//           <Box sx={{ display: 'flex', gap: 1 }}>
//             {featureCards.slice(0, 4).map((card, index) => (
//               <Button
//                 key={index}
//                 startIcon={React.cloneElement(card.icon, { fontSize: 'small' })}
//                 onClick={card.action}
//                 sx={{
//                   minWidth: 'unset',
//                   color: card.color,
//                   '&:hover': { bgcolor: `${card.color}10` }
//                 }}
//               />
//             ))}
//           </Box>
//         </Card>
//       </Box>
//     </Container>
//   );
// };

// export default Dashboard;

//! new
// import {
//   Event as EventsIcon,
//   People as FriendsIcon,
//   Groups as GroupsIcon,
//   Favorite as LikesIcon,
//   Chat as MessagesIcon,
//   Article as PostsIcon,
//   PhotoCamera as StoriesIcon,
//   Visibility as ViewsIcon
// } from '@mui/icons-material';
// import {
//   Avatar,
//   Box,
//   Button,
//   Card,
//   CardContent,
//   Container,
//   Grid,
//   Typography,
//   useMediaQuery,
//   useTheme
// } from '@mui/material';
// import React from 'react';
// import { useSelector } from 'react-redux';
// import { useNavigate } from 'react-router-dom';
// import ProfileHeader from '../PROFILE/PrivateProfile/ProfileHeader';

// const Dashboard = () => {
//   const navigate = useNavigate();
//   const theme = useTheme();
//   const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
//   const { profile } = useSelector((state) => state.user);

//   // Dynamic stats - replace with real data
//   const socialStats = {
//     posts: { count: 42, new: 3 },
//     friends: { count: 128, mutual: 24 },
//     views: { count: '1.2K', trend: '↑ 12%' },
//     messages: { count: 15, unread: 2 },
//     groups: { count: 8, active: 3 },
//     events: { upcoming: 2 },
//     likes: { count: '3.5K', today: 24 }
//   };

//   // Feature Cards Configuration
//   const featureCards = [
//     {
//       title: "Social Feed",
//       icon: <PostsIcon fontSize="large" />,
//       count: socialStats.posts.count,
//       subtitle: `${socialStats.posts.new} new updates`,
//       color: theme.palette.primary.main,
//       action: () => navigate('/feed')
//     },
//     {
//       title: "My Network",
//       icon: <FriendsIcon fontSize="large" />,
//       count: socialStats.friends.count,
//       subtitle: `${socialStats.friends.mutual} mutual connections`,
//       color: theme.palette.secondary.main,
//       action: () => navigate('/network')
//     },
//     {
//       title: "Profile Views",
//       icon: <ViewsIcon fontSize="large" />,
//       count: socialStats.views.count,
//       subtitle: socialStats.views.trend,
//       color: theme.palette.success.main,
//       action: () => navigate('/insights')
//     },
//     {
//       title: "Messages",
//       icon: <MessagesIcon fontSize="large" />,
//       count: socialStats.messages.count,
//       subtitle: `${socialStats.messages.unread} unread`,
//       color: theme.palette.info.main,
//       action: () => navigate('/messages')
//     },
//     {
//       title: "My Groups",
//       icon: <GroupsIcon fontSize="large" />,
//       count: socialStats.groups.count,
//       subtitle: `${socialStats.groups.active} active now`,
//       color: theme.palette.warning.main,
//       action: () => navigate('/groups')
//     },
//     {
//       title: "Events",
//       icon: <EventsIcon fontSize="large" />,
//       count: socialStats.events.upcoming,
//       subtitle: "Upcoming events",
//       color: theme.palette.error.main,
//       action: () => navigate('/events')
//     },
//     {
//       title: "Story Archive",
//       icon: <StoriesIcon fontSize="large" />,
//       count: "24+",
//       subtitle: "Your memories",
//       color: "#9c27b0", // Purple
//       action: () => navigate('/stories')
//     },
//     {
//       title: "Likes",
//       icon: <LikesIcon fontSize="large" />,
//       count: socialStats.likes.count,
//       subtitle: `${socialStats.likes.today} today`,
//       color: "#f44336", // Red
//       action: () => navigate('/likes')
//     }
//   ];

//   return (
//     <Container maxWidth="xl" sx={{ py: 4 }}>
//       {/* Welcome Header */}
//       <Box sx={{ 
//         display: 'flex', 
//         justifyContent: 'space-between', 
//         alignItems: 'center',
//         mb: 4
       
//       }}>
         

// <ProfileHeader 
//   userData={profile}
//   isMobile={isMobile}
//   navigate={navigate}
//   // You'll need to provide these handlers or remove them if not needed
//   onCoverPhotoEdit={() => {}}
//   onProfilePhotoEdit={() => {}}
//   coverImageLoading={false}
//   // handleAddFriend={() => {}}
// />
//       </Box>

//       {/* Social Dashboard Grid */}
//       <Grid container spacing={3}>
//         {featureCards.map((card, index) => (
//           <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
//             <Card 
//               sx={{
//                 height: '100%',
//                 background: `linear-gradient(135deg, ${card.color} 0%, ${theme.palette.background.paper} 100%)`,
//                 color: theme.palette.getContrastText(card.color),
//                 transition: 'all 0.3s ease',
//                 '&:hover': {
//                   transform: 'translateY(-5px)',
//                   boxShadow: 6
//                 }
//               }}
//               onClick={card.action}
//             >
//               <CardContent sx={{ position: 'relative', height: '100%' }}>
//                 <Avatar sx={{ 
//                   bgcolor: 'rgba(255,255,255,0.2)', 
//                   width: 60, 
//                   height: 60,
//                   mb: 2
//                 }}>
//                   {card.icon}
//                 </Avatar>
//                 <Typography variant="h5" fontWeight="bold" gutterBottom>
//                   {card.title}
//                 </Typography>
//                 <Typography variant="h2" sx={{ my: 1 }}>
//                   {card.count}
//                 </Typography>
//                 <Typography variant="body2" sx={{ opacity: 0.9 }}>
//                   {card.subtitle}
//                 </Typography>
//                 <Button
//                   variant="outlined"
//                   size="small"
//                   sx={{
//                     mt: 2,
//                     color: 'inherit',
//                     borderColor: 'rgba(255,255,255,0.5)',
//                     '&:hover': {
//                       bgcolor: 'rgba(255,255,255,0.1)',
//                       borderColor: 'white'
//                     }
//                   }}
//                 >
//                   Explore
//                 </Button>
//               </CardContent>
//             </Card>
//           </Grid>
//         ))}
//       </Grid>

//       {/* Quick Actions Bar - only shown on mobile */}
//       {isMobile && (
//         <Box sx={{ 
//           position: 'fixed', 
//           bottom: 20, 
//           left: 0, 
//           right: 0,
//           display: 'flex',
//           justifyContent: 'center',
//           zIndex: 1000
//         }}>
//           <Card sx={{ 
//             borderRadius: 50,
//             boxShadow: 3,
//             px: 2,
//             py: 1
//           }}>
//             <Box sx={{ display: 'flex', gap: 1 }}>
//               {featureCards.slice(0, 4).map((card, index) => (
//                 <Button
//                   key={index}
//                   startIcon={React.cloneElement(card.icon, { fontSize: 'small' })}
//                   onClick={card.action}
//                   sx={{
//                     minWidth: 'unset',
//                     color: card.color,
//                     '&:hover': { bgcolor: `${card.color}10` }
//                   }}
//                 />
//               ))}
//             </Box>
//           </Card>
//         </Box>
//       )}
//     </Container>
//   );
// };

// export default Dashboard;

// ! update
// Dashboard.jsx
// import {
//   Edit as EditIcon,
//   Event as EventsIcon,
//   People as FriendsIcon,
//   Groups as GroupsIcon,
//   AccountBox as InfoIcon,
//   Favorite as LikesIcon,
//   Lock as LockIcon,
//   PhotoLibrary as MediaIcon,
//   Chat as MessagesIcon,
//   Article as PostsIcon,
//   Security as PrivacyIcon,
//   BusinessCenter as ProfessionalIcon,
//   Visibility as PublicIcon,
//   PhotoCamera as StoriesIcon,
//   Build as ToolsIcon,
//   Visibility as ViewsIcon
// } from '@mui/icons-material';

// import {
//   Avatar,
//   Box,
//   Button,
//   Card,
//   CardContent,
//   Container,
//   Grid,
//   Typography,
//   useMediaQuery,
//   useTheme
// } from '@mui/material';

// import React from 'react';
// import { useSelector } from 'react-redux';
// import { useNavigate } from 'react-router-dom';
// import ProfileHeader from '../PROFILE/PrivateProfile/ProfileHeader';

// const Dashboard = () => {
//   const navigate = useNavigate();
//   const theme = useTheme();
//   const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
//   const { profile } = useSelector((state) => state.user);

//   const cardStyle = (color) => ({
//     height: '100%',
//     background: `linear-gradient(135deg, ${color} 0%, ${theme.palette.background.paper} 100%)`,
//     color: theme.palette.getContrastText(color),
//     '&:hover': { transform: 'translateY(-4px)', boxShadow: 4 },
//     transition: '0.3s'
//   });

//   const renderCard = ({ title, icon, subtitle, color, action }, index) => (
//     // <Grid item xs={12} sm={6} md={4} lg={2} key={index}>
//       <Grid item xs={12} sm={6} md={4} lg={3}>

//       <Card sx={cardStyle(color)} onClick={action}>
//         <CardContent sx={{ p: 2 }}>
//           <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 48, height: 48, mb: 1 }}>
//             {icon}
//           </Avatar>
//           <Typography variant="subtitle1" fontWeight="bold" gutterBottom noWrap>
//             {title}
//           </Typography>
//           <Typography variant="body2" noWrap>{subtitle}</Typography>
//         </CardContent>
//         <Box sx={{ px: 2, pb: 2 }}>
//           <Button
//             variant="outlined"
//             size="small"
//             fullWidth
//             sx={{
//               fontSize: '0.75rem',
//               py: 0.5,
//               color: 'inherit',
//               borderColor: 'rgba(255,255,255,0.5)',
//               '&:hover': {
//                 bgcolor: 'rgba(255,255,255,0.1)',
//                 borderColor: 'white'
//               }
//             }}
//           >
//             Explore
//           </Button>
//         </Box>
//       </Card>
//     </Grid>
//   );

//   const socialCards = [
//     {
//       title: "Social Feed",
//       icon: <PostsIcon fontSize="large" />,
//       subtitle: "See latest posts",
//       color: theme.palette.primary.main,
//       action: () => navigate('/feed')
//     },
//     {
//       title: "My Network",
//       icon: <FriendsIcon fontSize="large" />,
//       subtitle: "Friends & connections",
//       color: theme.palette.secondary.main,
//       action: () => navigate('/network')
//     },
//     {
//       title: "Profile Views",
//       icon: <ViewsIcon fontSize="large" />,
//       subtitle: "Check who's viewed",
//       color: theme.palette.success.main,
//       action: () => navigate('/insights')
//     },
//     {
//       title: "Messages",
//       icon: <MessagesIcon fontSize="large" />,
//       subtitle: "View conversations",
//       color: theme.palette.info.main,
//       action: () => navigate('/messages')
//     },
//     {
//       title: "My Groups",
//       icon: <GroupsIcon fontSize="large" />,
//       subtitle: "Participate & manage",
//       color: theme.palette.warning.main,
//       action: () => navigate('/groups')
//     },
//     {
//       title: "Events",
//       icon: <EventsIcon fontSize="large" />,
//       subtitle: "Upcoming activities",
//       color: theme.palette.error.main,
//       action: () => navigate('/events')
//     },
//     {
//       title: "Story Archive",
//       icon: <StoriesIcon fontSize="large" />,
//       subtitle: "Relive old moments",
//       color: "#9c27b0",
//       action: () => navigate('/stories')
//     },
//     {
//       title: "Likes",
//       icon: <LikesIcon fontSize="large" />,
//       subtitle: "Content you liked",
//       color: "#f44336",
//       action: () => navigate('/likes')
//     }
//   ];

//   const profileActionCards = [
//     {
//       title: "Edit Profile",
//       icon: <EditIcon fontSize="large" />,
//       subtitle: "Update your information",
//       color: "#4caf50",
//       action: () => navigate('/my-profile-update')
//     },
//     {
//       title: "View as Public",
//       icon: <PublicIcon fontSize="large" />,
//       subtitle: "See your public profile",
//       color: "#2196f3",
//       action: () => window.open(`/profile/${profile?.id || 'me'}`, '_blank')
//     },
//     {
//       title: "Update Password",
//       icon: <LockIcon fontSize="large" />,
//       subtitle: "Change your credentials",
//       color: "#ff9800",
//       action: () => navigate('/change-password')
//     },
//     {
//       title: "Personal Info",
//       icon: <InfoIcon fontSize="large" />,
//       subtitle: "Your email, phone & bio",
//       color: "#3f51b5",
//       action: () => navigate('/profile/private-update')
//     },
//     {
//       title: "Media",
//       icon: <MediaIcon fontSize="large" />,
//       subtitle: "Your uploaded content",
//       color: "#9c27b0",
//       action: () => navigate('/profile/media')
//     },
//     {
//       title: "Tools",
//       icon: <ToolsIcon fontSize="large" />,
//       subtitle: "Developer or creative tools",
//       color: "#607d8b",
//       action: () => navigate('/profile/tools')
//     },
//     {
//       title: "Professional",
//       icon: <ProfessionalIcon fontSize="large" />,
//       subtitle: "Job, career, portfolio",
//       color: "#795548",
//       action: () => navigate('/profile/professional')
//     },
//     {
//       title: "Privacy Settings",
//       icon: <PrivacyIcon fontSize="large" />,
//       subtitle: "Control what others see",
//       color: "#009688",
//       action: () => navigate('/profile/privacy')
//     }
//   ];

//   return (
//     <Container maxWidth="xl" sx={{ py: 4 }}>
//       {/* Header */}
//       <Box sx={{ mb: 4 }}>
//         <ProfileHeader
//           userData={profile}
//           isMobile={isMobile}
//           navigate={navigate}
//           onCoverPhotoEdit={() => {}}
//           onProfilePhotoEdit={() => {}}
//           coverImageLoading={false}
//         />
//       </Box>

//       {/* Social Cards */}
//       <Grid container spacing={3}>
//         {socialCards.map(renderCard)}
//       </Grid>

//       {/* Profile Settings Cards */}
//       <Typography variant="h5" sx={{ mt: 6, mb: 2 }}>Profile Settings</Typography>
//       <Grid container spacing={3}>
//         {profileActionCards.map(renderCard)}
//       </Grid>

//       {/* Mobile Quick Actions */}
//       {isMobile && (
//         <Box sx={{
//           position: 'fixed',
//           bottom: 20,
//           left: 0,
//           right: 0,
//           display: 'flex',
//           justifyContent: 'center',
//           zIndex: 1000
//         }}>
//           <Card sx={{ borderRadius: 50, boxShadow: 3, px: 2, py: 1 }}>
//             <Box sx={{ display: 'flex', gap: 1 }}>
//               {[...socialCards.slice(0, 2), ...profileActionCards.slice(0, 2)].map((card, index) => (
//                 <Button
//                   key={index}
//                   startIcon={React.cloneElement(card.icon, { fontSize: 'small' })}
//                   onClick={card.action}
//                   sx={{
//                     minWidth: 'unset',
//                     color: card.color,
//                     '&:hover': { bgcolor: `${card.color}10` }
//                   }}
//                 />
//               ))}
//             </Box>
//           </Card>
//         </Box>
//       )}
//     </Container>
//   );
// };

// export default Dashboard;




//! new
import {
  Edit as EditIcon,
  Event as EventsIcon,
  People as FriendsIcon,
  AccountBox as InfoIcon,
  Favorite as LikesIcon,
  Lock as LockIcon,
  PhotoLibrary as MediaIcon,
  Chat as MessagesIcon,
  Article as PostsIcon,
  Security as PrivacyIcon,
  BusinessCenter as ProfessionalIcon,
  Visibility as PublicIcon,
  PhotoCamera as StoriesIcon,
  Build as ToolsIcon,
  Visibility as ViewsIcon
} from '@mui/icons-material';

import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Grid,
  Typography,
  useMediaQuery,
  useTheme
} from '@mui/material';

import React from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import ProfileHeader from '../PROFILE/PrivateProfile/ProfileHeader';

const Dashboard = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { profile } = useSelector((state) => state.user);

  const cardStyle = (color) => ({
    height: '100%',
    background: `linear-gradient(135deg, ${color} 0%, ${theme.palette.background.paper} 100%)`,
    color: theme.palette.getContrastText(color),
    '&:hover': { transform: 'translateY(-4px)', boxShadow: 4 },
    transition: '0.3s'
  });

  const renderCard = ({ title, icon, subtitle, color, action }, index) => (
    <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
      <Card sx={cardStyle(color)} onClick={action}>
        <CardContent sx={{ p: 2 }}>
          <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 48, height: 48, mb: 1 }}>
            {icon}
          </Avatar>
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom noWrap>
            {title}
          </Typography>
          <Typography variant="body2" noWrap>{subtitle}</Typography>
        </CardContent>
        <Box sx={{ px: 2, pb: 2 }}>
          <Button
            variant="outlined"
            size="small"
            fullWidth
            sx={{
              fontSize: '0.75rem',
              py: 0.5,
              color: 'inherit',
              borderColor: 'rgba(255,255,255,0.5)',
              '&:hover': {
                bgcolor: 'rgba(255,255,255,0.1)',
                borderColor: 'white'
              }
            }}
          >
            Explore
          </Button>
        </Box>
      </Card>
    </Grid>
  );

  const socialCards = [
    {
      title: "Social Feed",
      icon: <PostsIcon fontSize="large" />,
      subtitle: "See latest posts",
      color: theme.palette.primary.main,
      action: () => navigate('/feed')
    },
    {
      title: "Profile Views",
      icon: <ViewsIcon fontSize="large" />,
      subtitle: "Check who's viewed",
      color: theme.palette.success.main,
      action: () => navigate('/insights')
    },
    {
      title: "Messages",
      icon: <MessagesIcon fontSize="large" />,
      subtitle: "View conversations",
      color: theme.palette.info.main,
      action: () => navigate('/messages')
    },
    {
      title: "Events",
      icon: <EventsIcon fontSize="large" />,
      subtitle: "Upcoming activities",
      color: theme.palette.error.main,
      action: () => navigate('/events')
    },
    {
      title: "Story Archive",
      icon: <StoriesIcon fontSize="large" />,
      subtitle: "Relive old moments",
      color: "#9c27b0",
      action: () => navigate('/stories')
    },
    {
      title: "Likes",
      icon: <LikesIcon fontSize="large" />,
      subtitle: "Content you liked",
      color: "#f44336",
      action: () => navigate('/likes')
    }
  ];

  const profileActionCards = [
    {
      title: "Edit Profile",
      icon: <EditIcon fontSize="large" />,
      subtitle: "Update your information",
      color: "#4caf50",
      action: () => navigate('/my-profile-update')
    },
    {
      title: "View as Public",
      icon: <PublicIcon fontSize="large" />,
      subtitle: "See your public profile",
      color: "#2196f3",
      action: () => window.open(`/profile/${profile?.id || 'me'}`, '_blank')
    },
    {
      title: "Update Password",
      icon: <LockIcon fontSize="large" />,
      subtitle: "Change your credentials",
      color: "#ff9800",
      action: () => navigate('/change-password')
    },
    {
      title: "Personal Info",
      icon: <InfoIcon fontSize="large" />,
      subtitle: "Your email, phone & bio",
      color: "#3f51b5",
      action: () => navigate('/profile/private-update')
    },
    {
      title: "Media",
      icon: <MediaIcon fontSize="large" />,
      subtitle: "Your uploaded content",
      color: "#9c27b0",
      action: () => navigate('/profile/media')
    },
    {
      title: "Tools",
      icon: <ToolsIcon fontSize="large" />,
      subtitle: "Developer or creative tools",
      color: "#607d8b",
      action: () => navigate('/profile/tools')
    },
    {
      title: "Professional",
      icon: <ProfessionalIcon fontSize="large" />,
      subtitle: "Job, career, portfolio",
      color: "#795548",
      action: () => navigate('/profile/professional')
    },
    {
      title: "Privacy Settings",
      icon: <PrivacyIcon fontSize="large" />,
      subtitle: "Control what others see",
      color: "#009688",
      action: () => navigate('/profile/privacy')
    },
    {
      title: "My Posts",
      icon: <PostsIcon fontSize="large" />,
      subtitle: "See all your posts",
      color: "#673ab7",
      action: () => navigate('/my-posts')
    },
    {
      title: "Friends",
      icon: <FriendsIcon fontSize="large" />,
      subtitle: "Manage your connections",
      color: "#00bcd4",
      action: () => navigate('/friends')
    },
    {
      title: "Blocked Users",
      icon: <PrivacyIcon fontSize="large" />,
      subtitle: "Users you blocked",
      color: "#607d8b",
      action: () => navigate('/profile/blocked-users')
    },
    {
      title: "Unblock Requests",
      icon: <LockIcon fontSize="large" />,
      subtitle: "Pending unblock requests",
      color: "#9e9e9e",
      action: () => navigate('/profile/unblock-requests')
    }
  ];

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <ProfileHeader
          userData={profile}
          isMobile={isMobile}
          navigate={navigate}
          onCoverPhotoEdit={() => {}}
          onProfilePhotoEdit={() => {}}
          coverImageLoading={false}
          //  hideAddFriendButton
        />
      </Box>

      <Grid container spacing={3}>
        {socialCards.map(renderCard)}
      </Grid>

      <Typography variant="h5" sx={{ mt: 6, mb: 2 }}>Profile Settings</Typography>
      <Grid container spacing={3}>
        {profileActionCards.map(renderCard)}
      </Grid>

      {isMobile && (
        <Box sx={{
          position: 'fixed',
          bottom: 20,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <Card sx={{ borderRadius: 50, boxShadow: 3, px: 2, py: 1 }}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {[...socialCards.slice(0, 2), ...profileActionCards.slice(0, 2)].map((card, index) => (
                <Button
                  key={index}
                  startIcon={React.cloneElement(card.icon, { fontSize: 'small' })}
                  onClick={card.action}
                  sx={{
                    minWidth: 'unset',
                    color: card.color,
                    '&:hover': { bgcolor: `${card.color}10` }
                  }}
                />
              ))}
            </Box>
          </Card>
        </Box>
      )}
    </Container>
  );
};

export default Dashboard;

