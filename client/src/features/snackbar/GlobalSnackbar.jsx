// src/features/snackbar/GlobalSnackbar.jsx
// import { Alert, Snackbar } from '@mui/material'
// import { useDispatch, useSelector } from 'react-redux'
// import { hideSnackbar } from './snackbarSlice'

// const GlobalSnackbar = () => {
//   const dispatch = useDispatch()
//   const { open, message, severity } = useSelector((state) => state.snackbar)

//   const handleClose = () => {
//     dispatch(hideSnackbar())
//   }

//   return (
//     <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
//       <Alert onClose={handleClose} severity={severity} sx={{ width: '100%' }}>
//         {message}
//       </Alert>
//     </Snackbar>
//   )
// }

// export default GlobalSnackbar

//! Refactor
// import { Alert, Slide, Snackbar } from '@mui/material';
// import { useDispatch, useSelector } from 'react-redux';
// import { removeSnackbar } from './snackbarSlice';

// const SlideTransition = (props) => <Slide {...props} direction="down" />; // Changed direction to 'down'

// const GlobalSnackbar = () => {
//   const dispatch = useDispatch();
//   const snackbars = useSelector((state) => state.snackbar.messages);

//   return (
//     <>
//       {snackbars.map(({ id, message, severity, duration }) => (
//         <Snackbar
//           key={id}
//           open
//           autoHideDuration={duration}
//           onClose={() => dispatch(removeSnackbar(id))}
//           TransitionComponent={SlideTransition}
//           anchorOrigin={{ vertical: 'top', horizontal: 'center' }} // Changed horizontal to 'center'
//           sx={{
//             mt: 1,
//             width: '100%',
//             '& .MuiSnackbar-root': {
//               justifyContent: 'center',
//             },
//           }}
//         >
//           <Alert
//             severity={severity}
//             onClose={() => dispatch(removeSnackbar(id))}
//             variant="filled"
//             sx={{
//               width: 'auto',
//               minWidth: '300px',
//               borderRadius: 2,
//               boxShadow: 3,
//               backgroundColor:
//                 severity === 'success'
//                   ? '#2e7d32'
//                   : severity === 'error'
//                   ? '#c62828'
//                   : severity === 'warning'
//                   ? '#ed6c02'
//                   : '#0288d1',
//             }}
//           >
//             {message}
//           </Alert>
//         </Snackbar>
//       ))}
//     </>
//   );
// };

// export default GlobalSnackbar;

//! new
// src/components/GlobalSnackbar/GlobalSnackbar.jsx
// import { Close as CloseIcon, Error, Favorite, Info, Warning } from '@mui/icons-material';
// import { Avatar, Box, IconButton, Slide, Snackbar, Typography } from '@mui/material';
// import { motion } from 'framer-motion';
// import { useDispatch, useSelector } from 'react-redux';
// import { removeSnackbar } from './snackbarSlice';

// const SlideTransition = (props) => <Slide {...props} direction="down" />;

// const getIcon = (severity) => {
//   switch (severity) {
//     case 'success':
//       return <Favorite sx={{ color: '#f50057' }} />;
//     case 'error':
//       return <Error sx={{ color: '#c62828' }} />;
//     case 'warning':
//       return <Warning sx={{ color: '#ed6c02' }} />;
//     default:
//       return <Info sx={{ color: '#0288d1' }} />;
//   }
// };

// const GlobalSnackbar = () => {
//   const dispatch = useDispatch();
//   const snackbars = useSelector((state) => state.snackbar.messages);

//   return (
//     <>
//       {snackbars.map(({ id, message, severity, duration }) => (
//         <Snackbar
//           key={id}
//           open
//           autoHideDuration={duration}
//           onClose={() => dispatch(removeSnackbar(id))}
//           TransitionComponent={SlideTransition}
//           anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
//           sx={{
//             mt: 2,
//             zIndex: 9999,
//             maxWidth: '90%',
//           }}
//         >
//           <motion.div
//             initial={{ opacity: 0, y: -10 }}
//             animate={{ opacity: 1, y: 0 }}
//             exit={{ opacity: 0, scale: 0.95 }}
//             transition={{ duration: 0.3 }}
//           >
//             <Box
//               sx={{
//                 display: 'flex',
//                 alignItems: 'center',
//                 gap: 2,
//                 bgcolor: 'background.paper',
//                 boxShadow: 6,
//                 borderRadius: 3,
//                 px: 2,
//                 py: 1.5,
//                 minWidth: 320,
//                 borderLeft: `6px solid ${
//                   severity === 'success'
//                     ? '#4caf50'
//                     : severity === 'error'
//                     ? '#f44336'
//                     : severity === 'warning'
//                     ? '#ff9800'
//                     : '#2196f3'
//                 }`,
//               }}
//             >
//               <Avatar
//                 sx={{
//                   bgcolor:
//                     severity === 'success'
//                       ? '#4caf50'
//                       : severity === 'error'
//                       ? '#f44336'
//                       : severity === 'warning'
//                       ? '#ff9800'
//                       : '#2196f3',
//                   width: 40,
//                   height: 40,
//                 }}
//               >
//                 {getIcon(severity)}
//               </Avatar>

//               <Box sx={{ flex: 1 }}>
//                 <Typography fontWeight={600} fontSize="1rem" lineHeight="1.2">
//                   {severity === 'success'
//                     ? 'Action Completed 🎉'
//                     : severity === 'error'
//                     ? 'Oops! Something went wrong'
//                     : severity === 'warning'
//                     ? 'Heads up! Warning'
//                     : 'FYI'}
//                 </Typography>
//                 <Typography variant="body2" color="text.secondary" mt={0.5}>
//                   {message}
//                 </Typography>
//               </Box>

//               <IconButton
//                 onClick={() => dispatch(removeSnackbar(id))}
//                 size="small"
//                 sx={{ color: 'text.secondary' }}
//               >
//                 <CloseIcon fontSize="small" />
//               </IconButton>
//             </Box>
//           </motion.div>
//         </Snackbar>
//       ))}
//     </>
//   );
// };

// export default GlobalSnackbar;

//! new
// src/components/GlobalSnackbar.jsx
// import { Close as CloseIcon, Error, Favorite, Info, Warning } from '@mui/icons-material';
// import { Avatar, Box, IconButton, Slide, Snackbar, Typography } from '@mui/material';
// import { motion } from 'framer-motion';
// import { useDispatch, useSelector } from 'react-redux';
// import { removeSnackbar } from './snackbarSlice';

// const SlideTransition = (props) => <Slide {...props} direction="down" />;

// const getIcon = (severity) => {
//   switch (severity) {
//     case 'success':
//       return <Favorite sx={{ color: '#f50057' }} />;
//     case 'error':
//       return <Error sx={{ color: '#c62828' }} />;
//     case 'warning':
//       return <Warning sx={{ color: '#ed6c02' }} />;
//     default:
//       return <Info sx={{ color: '#0288d1' }} />;
//   }
// };

// const GlobalSnackbar = () => {
//   const dispatch = useDispatch();
//   const snackbars = useSelector((state) => state.snackbar.messages);

//   return (
//     <>
//       {snackbars.map(({ id, message, severity, duration }) => (
//         <Snackbar
//           key={id}
//           open
//           autoHideDuration={duration}
//           onClose={() => dispatch(removeSnackbar(id))}
//           TransitionComponent={SlideTransition}
//           anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
//           sx={{
//             mt: 2,
//             zIndex: 1400,
//             maxWidth: '90%',
//           }}
//         >
//           <motion.div
//             initial={{ opacity: 0, y: -15 }}
//             animate={{ opacity: 1, y: 0 }}
//             exit={{ opacity: 0, y: -10 }}
//             transition={{ duration: 0.3 }}
//           >
//             <Box
//               sx={{
//                 display: 'flex',
//                 alignItems: 'center',
//                 gap: 2,
//                 bgcolor: 'background.paper',
//                 boxShadow: 6,
//                 borderRadius: 3,
//                 px: 2,
//                 py: 1.5,
//                 minWidth: 320,
//                 borderLeft: `6px solid ${
//                   severity === 'success'
//                     ? '#4caf50'
//                     : severity === 'error'
//                     ? '#f44336'
//                     : severity === 'warning'
//                     ? '#ff9800'
//                     : '#2196f3'
//                 }`,
//               }}
//             >
//               <Avatar
//                 sx={{
//                   bgcolor:
//                     severity === 'success'
//                       ? '#4caf50'
//                       : severity === 'error'
//                       ? '#f44336'
//                       : severity === 'warning'
//                       ? '#ff9800'
//                       : '#2196f3',
//                   width: 40,
//                   height: 40,
//                 }}
//               >
//                 {getIcon(severity)}
//               </Avatar>

//               <Box sx={{ flex: 1 }}>
//                 <Typography fontWeight={600} fontSize="1rem">
//                   {severity === 'success'
//                     ? '✅ Success!'
//                     : severity === 'error'
//                     ? '❌ Error!'
//                     : severity === 'warning'
//                     ? '⚠️ Warning!'
//                     : 'ℹ️ Info'}
//                 </Typography>
//                 <Typography variant="body2" color="text.secondary" mt={0.5}>
//                   {message}
//                 </Typography>
//               </Box>

//               <IconButton
//                 onClick={() => dispatch(removeSnackbar(id))}
//                 size="small"
//                 sx={{ color: 'text.secondary' }}
//               >
//                 <CloseIcon fontSize="small" />
//               </IconButton>
//             </Box>
//           </motion.div>
//         </Snackbar>
//       ))}
//     </>
//   );
// };

// export default GlobalSnackbar;

//! robust
// src/components/GlobalSnackbar.jsx
// import {
//   Close as CloseIcon,
//   ErrorOutline,
//   Favorite,
//   InfoOutlined,
//   WarningAmber,
// } from '@mui/icons-material';
// import { Avatar, Box, IconButton, Slide, Snackbar, Typography } from '@mui/material';
// import { motion } from 'framer-motion';
// import { useDispatch, useSelector } from 'react-redux';
// import { removeSnackbar } from './snackbarSlice';

// // Slide transition
// const SlideTransition = (props) => <Slide {...props} direction="down" />;

// // Icon & color mapper
// const getConfig = (severity) => {
//   switch (severity) {
//     case 'success':
//       return {
//         icon: <Favorite />,
//         color: '#22c55e', // emerald-500
//         bg: '#dcfce7',     // emerald-100
//         title: 'Success',
//         emoji: '🎉',
//       };
//     case 'error':
//       return {
//         icon: <ErrorOutline />,
//         color: '#ef4444', // red-500
//         bg: '#fee2e2',     // red-100
//         title: 'Error',
//         emoji: '❌',
//       };
//     case 'warning':
//       return {
//         icon: <WarningAmber />,
//         color: '#f59e0b', // amber-500
//         bg: '#fef3c7',     // amber-100
//         title: 'Warning',
//         emoji: '⚠️',
//       };
//     default:
//       return {
//         icon: <InfoOutlined />,
//         color: '#3b82f6', // blue-500
//         bg: '#dbeafe',     // blue-100
//         title: 'Notice',
//         emoji: '💡',
//       };
//   }
// };

// const GlobalSnackbar = () => {
//   const dispatch = useDispatch();
//   const snackbars = useSelector((state) => state.snackbar.messages);

//   return (
//     <>
//       {snackbars.map(({ id, message, severity, duration }) => {
//         const { icon, color, bg, title, emoji } = getConfig(severity);

//         return (
//           <Snackbar
//             key={id}
//             open
//             autoHideDuration={duration}
//             onClose={() => dispatch(removeSnackbar(id))}
//             TransitionComponent={SlideTransition}
//             anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
//             sx={{ mt: 2, zIndex: 1400 }}
//           >
//             <motion.div
//               initial={{ opacity: 0, y: -10 }}
//               animate={{ opacity: 1, y: 0 }}
//               exit={{ opacity: 0, scale: 0.95 }}
//               transition={{ duration: 0.25 }}
//             >
//               <Box
//                 sx={{
//                   display: 'flex',
//                   alignItems: 'center',
//                   gap: 2,
//                   backgroundColor: bg,
//                   boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
//                   borderLeft: `6px solid ${color}`,
//                   px: 2,
//                   py: 1.5,
//                   minWidth: 340,
//                   borderRadius: 3,
//                 }}
//               >
//                 <Avatar
//                   sx={{
//                     bgcolor: color,
//                     color: 'white',
//                     width: 40,
//                     height: 40,
//                     fontSize: 22,
//                   }}
//                 >
//                   {icon}
//                 </Avatar>

//                 <Box sx={{ flex: 1 }}>
//                   <Typography
//                     fontWeight={600}
//                     fontSize="1rem"
//                     sx={{ color }}
//                   >
//                     {emoji} {title}
//                   </Typography>
//                   <Typography variant="body2" color="text.primary" mt={0.5}>
//                     {message}
//                   </Typography>
//                 </Box>

//                 <IconButton
//                   onClick={() => dispatch(removeSnackbar(id))}
//                   size="small"
//                   sx={{ color: 'text.secondary' }}
//                 >
//                   <CloseIcon fontSize="small" />
//                 </IconButton>
//               </Box>
//             </motion.div>
//           </Snackbar>
//         );
//       })}
//     </>
//   );
// };

// export default GlobalSnackbar;

//! with avatar
// src/components/GlobalSnackbar.jsx
// import {
//   Close as CloseIcon,
//   ErrorOutline,
//   Favorite,
//   InfoOutlined,
//   Person,
//   WarningAmber,
// } from '@mui/icons-material';
// import { Avatar, Box, IconButton, Slide, Snackbar, Typography } from '@mui/material';
// import { motion } from 'framer-motion';
// import { useDispatch, useSelector } from 'react-redux';
// import { removeSnackbar } from './snackbarSlice';

// // Slide transition
// const SlideTransition = (props) => <Slide {...props} direction="down" />;

// // Icon & color mapper
// const getConfig = (severity) => {
//   switch (severity) {
//     case 'success':
//       return {
//         icon: <Favorite />,
//         color: '#22c55e', // green
//         bg: '#dcfce7',
//         emoji: '🎉',
//       };
//     case 'error':
//       return {
//         icon: <ErrorOutline />,
//         color: '#ef4444', // red
//         bg: '#fee2e2',
//         emoji: '❌',
//       };
//     case 'warning':
//       return {
//         icon: <WarningAmber />,
//         color: '#f59e0b', // amber
//         bg: '#fef3c7',
//         emoji: '⚠️',
//       };
//     default:
//       return {
//         icon: <InfoOutlined />,
//         color: '#3b82f6', // blue
//         bg: '#dbeafe',
//         emoji: '💡',
//       };
//   }
// };

// const GlobalSnackbar = () => {
//   const dispatch = useDispatch();
//   const snackbars = useSelector((state) => state.snackbar.messages);

//   return (
//     <>
//       {snackbars.map(({ id, message, severity, duration, username, avatarUrl }) => {
//         const { icon, color, bg, emoji } = getConfig(severity);

//         return (
//           <Snackbar
//             key={id}
//             open
//             autoHideDuration={duration}
//             onClose={() => dispatch(removeSnackbar(id))}
//             TransitionComponent={SlideTransition}
//             anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
//             sx={{ mt: 2, zIndex: 1400 }}
//           >
//             <motion.div
//               initial={{ opacity: 0, y: -10 }}
//               animate={{ opacity: 1, y: 0 }}
//               exit={{ opacity: 0, scale: 0.95 }}
//               transition={{ duration: 0.25 }}
//             >
//               <Box
//                 sx={{
//                   display: 'flex',
//                   alignItems: 'center',
//                   gap: 2,
//                   backgroundColor: bg,
//                   boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
//                   borderLeft: `6px solid ${color}`,
//                   px: 2,
//                   py: 1.5,
//                   minWidth: 340,
//                   borderRadius: 3,
//                 }}
//               >
//                 <Avatar
//                   src={avatarUrl}
//                   sx={{
//                     bgcolor: color,
//                     width: 40,
//                     height: 40,
//                     fontSize: 22,
//                   }}
//                 >
//                   {!avatarUrl && <Person />}
//                 </Avatar>

//                 <Box sx={{ flex: 1 }}>
//                   <Typography fontWeight={600} fontSize="0.95rem">
//                     {emoji} {username ? `${username}` : 'System'}
//                   </Typography>
//                   <Typography variant="body2" color="text.secondary" mt={0.3}>
//                     {message}
//                   </Typography>
//                 </Box>

//                 <IconButton
//                   onClick={() => dispatch(removeSnackbar(id))}
//                   size="small"
//                   sx={{ color: 'text.secondary' }}
//                 >
//                   <CloseIcon fontSize="small" />
//                 </IconButton>
//               </Box>
//             </motion.div>
//           </Snackbar>
//         );
//       })}
//     </>
//   );
// };

// export default GlobalSnackbar;

// !name
// src/components/GlobalSnackbar.jsx
// import {
//   Close as CloseIcon,
//   ErrorOutline,
//   Favorite,
//   InfoOutlined,
//   Person,
//   WarningAmber,
// } from '@mui/icons-material';
// import {
//   Avatar,
//   Box,
//   Button,
//   IconButton,
//   Slide,
//   Snackbar,
//   Typography,
// } from '@mui/material';
// import { motion } from 'framer-motion';
// import { useDispatch, useSelector } from 'react-redux';
// import { removeSnackbar } from './snackbarSlice';

// const SlideTransition = (props) => <Slide {...props} direction="down" />;

// const getConfig = (severity) => {
//   switch (severity) {
//     case 'success':
//       return {
//         icon: <Favorite />,
//         color: '#22c55e',
//         bg: '#dcfce7',
//         emoji: '🎉',
//       };
//     case 'error':
//       return {
//         icon: <ErrorOutline />,
//         color: '#ef4444',
//         bg: '#fee2e2',
//         emoji: '❌',
//       };
//     case 'warning':
//       return {
//         icon: <WarningAmber />,
//         color: '#f59e0b',
//         bg: '#fef3c7',
//         emoji: '⚠️',
//       };
//     default:
//       return {
//         icon: <InfoOutlined />,
//         color: '#3b82f6',
//         bg: '#dbeafe',
//         emoji: '💡',
//       };
//   }
// };

// const GlobalSnackbar = () => {
//   const dispatch = useDispatch();
//   const snackbars = useSelector((state) => state.snackbar.messages);

//   return (
//     <>
//       {snackbars.map(({ id, message, severity, duration, username, avatarUrl, actions = [] }) => {
//         const { icon, color, bg, emoji } = getConfig(severity);

//         return (
//           <Snackbar
//             key={id}
//             open
//             autoHideDuration={duration}
//             onClose={() => dispatch(removeSnackbar(id))}
//             TransitionComponent={SlideTransition}
//             anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
//             sx={{ mt: 2, zIndex: 1400 }}
//           >
//             <motion.div
//               initial={{ opacity: 0, y: -10 }}
//               animate={{ opacity: 1, y: 0 }}
//               exit={{ opacity: 0, scale: 0.95 }}
//               transition={{ duration: 0.25 }}
//             >
//               <Box
//                 sx={{
//                   display: 'flex',
//                   flexDirection: 'column',
//                   bgcolor: bg,
//                   boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
//                   borderLeft: `6px solid ${color}`,
//                   px: 2,
//                   py: 1.5,
//                   minWidth: 340,
//                   borderRadius: 3,
//                 }}
//               >
//                 <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
//                   <Avatar
//                     src={avatarUrl}
//                     sx={{
//                       bgcolor: color,
//                       width: 40,
//                       height: 40,
//                       fontSize: 22,
//                     }}
//                   >
//                     {!avatarUrl && <Person />}
//                   </Avatar>

//                   <Box sx={{ flex: 1 }}>
//                     <Typography fontWeight={600} fontSize="0.95rem">
//                       {emoji} {username || 'System'}
//                     </Typography>
//                     <Typography variant="body2" color="text.secondary" mt={0.3}>
//                       {message}
//                     </Typography>
//                   </Box>

//                   <IconButton
//                     onClick={() => dispatch(removeSnackbar(id))}
//                     size="small"
//                     sx={{ color: 'text.secondary' }}
//                   >
//                     <CloseIcon fontSize="small" />
//                   </IconButton>
//                 </Box>

//                 {actions.length > 0 && (
//                   <Box
//                     sx={{
//                       display: 'flex',
//                       gap: 1,
//                       mt: 1,
//                       justifyContent: 'flex-end',
//                       flexWrap: 'wrap',
//                     }}
//                   >
//                     {actions.map((action, index) => (
//                       <Button
//                         key={index}
//                         size="small"
//                         variant="text"
//                         onClick={() => {
//                           action.onClick();
//                           dispatch(removeSnackbar(id)); // Optional auto-close on action
//                         }}
//                         sx={{
//                           textTransform: 'none',
//                           color: color,
//                           fontWeight: 500,
//                         }}
//                       >
//                         {action.label}
//                       </Button>
//                     ))}
//                   </Box>
//                 )}
//               </Box>
//             </motion.div>
//           </Snackbar>
//         );
//       })}
//     </>
//   );
// };

// export default GlobalSnackbar;


//! with real name FINAL
// import { Alert, Avatar, Box, Slide, Snackbar, Typography } from '@mui/material';
// import { useDispatch, useSelector } from 'react-redux';
// import { removeSnackbar } from './snackbarSlice';

// const SlideTransition = (props) => <Slide {...props} direction="down" />;

// const GlobalSnackbar = () => {
//   const dispatch = useDispatch();
//   const snackbars = useSelector((state) => state.snackbar.messages);
//   const userProfile = useSelector((state) => state.user.profile);

//   // Get username and avatar from your user profile state
//   const username = userProfile ? `${userProfile.firstName || ''} ${userProfile.lastName || ''}`.trim() : null;
//   const avatarUrl = userProfile?.profileImage || '/default-avatar.png';

//   return (
//     <>
//       {snackbars.map(({ id, message, severity, duration }) => (
//         <Snackbar
//           key={id}
//           open
//           autoHideDuration={duration}
//           onClose={() => dispatch(removeSnackbar(id))}
//           TransitionComponent={SlideTransition}
//           anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
//           sx={{ mt: 1, width: '100%' }}
//         >
//           <Alert
//             severity={severity}
//             onClose={() => dispatch(removeSnackbar(id))}
//             variant="filled"
//             sx={{
//               width: 'auto',
//               minWidth: '320px',
//               borderRadius: 2,
//               boxShadow: 3,
//               backgroundColor:
//                 severity === 'success'
//                   ? '#2e7d32'
//                   : severity === 'error'
//                   ? '#c62828'
//                   : severity === 'warning'
//                   ? '#ed6c02'
//                   : '#0288d1',
//               display: 'flex',
//               alignItems: 'center',
//               gap: 2,
//             }}
//           >
//             {/* Show avatar and username only for success messages */}
//             {severity === 'success' && username ? (
//               <>
//                 <Avatar
//                   src={avatarUrl}
//                   alt={username}
//                   sx={{ width: 36, height: 36, border: '2px solid #fff' }}
//                 />
//                 <Box>
//                   <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
//                     {username}
//                   </Typography>
//                   <Typography variant="body2">{message}</Typography>
//                 </Box>
//               </>
//             ) : (
//               message
//             )}
//           </Alert>
//         </Snackbar>
//       ))}
//     </>
//   );
// };

// export default GlobalSnackbar;



//! Final
// src/features/snackbar/GlobalSnackbar.jsx
// import { Alert, Avatar, Box, Slide, Snackbar, Typography } from '@mui/material';
// import { useDispatch, useSelector } from 'react-redux';
// import { removeSnackbar } from './snackbarSlice';

// const SlideTransition = (props) => <Slide {...props} direction="down" />;

// const GlobalSnackbar = () => {
//   const dispatch = useDispatch();
//   const snackbars = useSelector((state) => state.snackbar.messages);

//   return (
//     <>
//       {snackbars.map(({ id, message, severity, duration, username, avatarUrl }) => (
//         <Snackbar
//           key={id}
//           open
//           autoHideDuration={duration}
//           onClose={() => dispatch(removeSnackbar(id))}
//           TransitionComponent={SlideTransition}
//           anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
//           sx={{ mt: 1, width: '100%' }}
//         >
//           <Alert
//             severity={severity}
//             onClose={() => dispatch(removeSnackbar(id))}
//             variant="filled"
//             sx={{
//               width: 'auto',
//               minWidth: '320px',
//               borderRadius: 2,
//               boxShadow: 3,
//               backgroundColor:
//                 severity === 'success'
//                   ? '#2e7d32'
//                   : severity === 'error'
//                   ? '#c62828'
//                   : severity === 'warning'
//                   ? '#ed6c02'
//                   : '#0288d1',
//               display: 'flex',
//               alignItems: 'center',
//               gap: 2,
//             }}
//           >
//             {severity === 'success' && username ? (
//               <>
//                 <Avatar
//                   src={avatarUrl}
//                   alt={username}
//                   sx={{ width: 36, height: 36, border: '2px solid #fff' }}
//                 />
//                 <Box>
//                   <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
//                     {username}
//                   </Typography>
//                   <Typography variant="body2">{message}</Typography>
//                 </Box>
//               </>
//             ) : (
//               <Typography variant="body2">{message}</Typography>
//             )}
//           </Alert>
//         </Snackbar>
//       ))}
//     </>
//   );
// };

// export default GlobalSnackbar;
//!  with friendly message
// src/features/snackbar/GlobalSnackbar.jsx
import { Alert, Avatar, Box, Slide, Snackbar, Typography } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { removeSnackbar } from './snackbarSlice';

const SlideTransition = (props) => <Slide {...props} direction="down" />;

const GlobalSnackbar = () => {
  const dispatch = useDispatch();
  const snackbars = useSelector((state) => state.snackbar.messages);

  return (
    <>
      {snackbars.map(({ id, message, severity, duration, username, avatarUrl }) => (
        <Snackbar
          key={id}
          open
          autoHideDuration={duration}
          onClose={() => dispatch(removeSnackbar(id))}
          TransitionComponent={SlideTransition}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          sx={{ mt: 2, width: '100%' }}
        >
          <Alert
            onClose={() => dispatch(removeSnackbar(id))}
            variant="filled"
            icon={false}
            sx={{
              width: 'auto',
              minWidth: 340,
              px: 2,
              py: 1.5,
              borderRadius: 3,
              boxShadow: 4,
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              background: severity === 'success'
                ? 'linear-gradient(135deg, #43cea2 0%, #185a9d 100%)'
                : severity === 'error'
                ? 'linear-gradient(135deg, #ff416c 0%, #ff4b2b 100%)'
                : severity === 'warning'
                ? 'linear-gradient(135deg, #f7971e 0%, #ffd200 100%)'
                : 'linear-gradient(135deg, #1c92d2 0%, #f2fcfe 100%)',
              color: '#fff',
            }}
          >
            {username ? (
              <>
                <Avatar
                  src={avatarUrl}
                  alt={username}
                  sx={{
                    width: 42,
                    height: 42,
                    border: '2px solid #fff',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                  }}
                />
                <Box>
                  <Typography
                    variant="subtitle1"
                    sx={{ fontWeight: 600, color: '#fff', lineHeight: 1.2 }}
                  >
                    {message}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{ color: 'rgba(255,255,255,0.85)' }}
                  >
                    {username}
                  </Typography>
                </Box>
              </>
            ) : (
              <Typography variant="body2">{message}</Typography>
            )}
          </Alert>
        </Snackbar>
      ))}
    </>
  );
};

export default GlobalSnackbar;


