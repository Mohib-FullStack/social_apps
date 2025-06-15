/* =============================
   File: src/layouts/Navbar/DrawerMenu.jsx
   ============================= */
import {
  AdminPanelSettings,
  Group,
  Home,
  Logout,
  People,
  Store,
} from '@mui/icons-material';
import {
  Avatar,
  Box,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
} from '@mui/material';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const NAV_ITEMS = [
  { label: 'Home', path: '/', icon: <Home /> },
  { label: 'Friends', path: '/friends', icon: <People /> },
  { label: 'Groups', path: '/groups', icon: <Group /> },
  { label: 'Marketplace', path: '/marketplace', icon: <Store /> },
];

const DrawerMenu = ({ user, isAdmin, onLogout, onClose }) => {
  const image = user?.image || '';
  const firstName = user?.firstName || 'User';
  const lastName = user?.lastName || '';

  return (
    <Box sx={{ width: 250 }} role="presentation" onClick={onClose}>
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Avatar src={image} />
        <Typography variant="subtitle1">{firstName} {lastName}</Typography>
      </Box>
      <Divider />
      <List>
        {NAV_ITEMS.map((item) => (
          <motion.div key={item.label} whileHover={{ x: 8 }}>
            <ListItem button component={Link} to={item.path}>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItem>
          </motion.div>
        ))}
        {isAdmin && (
          <motion.div whileHover={{ x: 8 }}>
            <ListItem button component={Link} to="/admin">
              <ListItemIcon>
                <AdminPanelSettings />
              </ListItemIcon>
              <ListItemText primary="Admin Panel" />
            </ListItem>
          </motion.div>
        )}
        <Divider sx={{ my: 1 }} />
        <motion.div whileHover={{ x: 8 }}>
          <ListItem button onClick={onLogout}>
            <ListItemIcon>
              <Logout color="error" />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItem>
        </motion.div>
      </List>
    </Box>
  );
};

export default DrawerMenu;










// /* =============================
//    File: src/layouts/Navbar/DrawerMenu.jsx
//    ============================= */
// import {
//   AdminPanelSettings,
//   Group,
//   Home,
//   Logout,
//   People,
//   Store,
// } from '@mui/icons-material';
// import {
//   Avatar,
//   Box,
//   Divider,
//   List,
//   ListItem,
//   ListItemIcon,
//   ListItemText,
//   Typography,
// } from '@mui/material';
// import { motion } from 'framer-motion';
// import { Link } from 'react-router-dom';

// const NAV_ITEMS = [
//   { label: 'Home', path: '/', icon: <Home /> },
//   { label: 'Friends', path: '/friends', icon: <People /> },
//   { label: 'Groups', path: '/groups', icon: <Group /> },
//   { label: 'Marketplace', path: '/marketplace', icon: <Store /> },
// ];

// const DrawerMenu = ({ user = {}, isAdmin = false, onLogout, onClose }) => {
//   const {
//     image = '',
//     firstName = 'User',
//     lastName = '',
//   } = user || {};

//   return (
//     <Box sx={{ width: 250 }} role="presentation" onClick={onClose}>
//       <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
//         <Avatar src={image} />
//         <Typography variant="subtitle1">
//           {firstName} {lastName}
//         </Typography>
//       </Box>
//       <Divider />
//       <List>
//         {NAV_ITEMS.map((item) => (
//           <motion.div key={item.label} whileHover={{ x: 8 }}>
//             <ListItem button component={Link} to={item.path}>
//               <ListItemIcon>{item.icon}</ListItemIcon>
//               <ListItemText primary={item.label} />
//             </ListItem>
//           </motion.div>
//         ))}
//         {isAdmin && (
//           <motion.div whileHover={{ x: 8 }}>
//             <ListItem button component={Link} to="/admin">
//               <ListItemIcon>
//                 <AdminPanelSettings />
//               </ListItemIcon>
//               <ListItemText primary="Admin Panel" />
//             </ListItem>
//           </motion.div>
//         )}
//         <Divider sx={{ my: 1 }} />
//         <motion.div whileHover={{ x: 8 }}>
//           <ListItem button onClick={onLogout}>
//             <ListItemIcon>
//               <Logout color="error" />
//             </ListItemIcon>
//             <ListItemText primary="Logout" />
//           </ListItem>
//         </motion.div>
//       </List>
//     </Box>
//   );
// };

// export default DrawerMenu;
