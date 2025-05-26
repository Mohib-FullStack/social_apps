// src/components/SearchBar/UserSearchResults.jsx
// import { Avatar, List, ListItem, ListItemAvatar, ListItemText, Paper } from '@mui/material';
// import { useNavigate } from 'react-router-dom';

// const UserSearchResults = ({ users = [], onSelect }) => {
//   const navigate = useNavigate();

//   return (
//     <Paper elevation={3} sx={{ 
//       position: 'absolute',
//       width: '100%',
//       maxWidth: 400,
//       maxHeight: 400,
//       overflow: 'auto',
//       zIndex: 1200,
//       mt: 1
//     }}>
//       <List dense>
//         {users.map((user) => (
//           <ListItem 
//             key={user.id} 
//             button 
//             onClick={() => {
//               navigate(`/profile/public/${user.id}`);
//               onSelect();
//             }}
//           >
//             <ListItemAvatar>
//               <Avatar src={user.profileImage} />
//             </ListItemAvatar>
//             <ListItemText
//               primary={`${user.firstName} ${user.lastName}`}
//               secondary={`@${user.username || `user${user.id}`}`}
//             />
//           </ListItem>
//         ))}
//       </List>
//     </Paper>
//   );
// };

// export default UserSearchResults;

//! new

/*
File: components/PROFILE/UserSearchResults.jsx
*/
// import { Box, Avatar, Typography } from '@mui/material';
// import { useNavigate } from 'react-router-dom';

// const DEFAULT_PROFILE_IMAGE = '/default-avatar.png';

// const UserSearchResults = ({ results, onResultClick }) => {
//   const navigate = useNavigate();

//   const handleClick = (userId) => {
//     onResultClick();
//     navigate(`/profile/public/${userId}`);
//   };

//   return (
//     <Box>
//       {results.map((user) => (
//         <Box
//           key={user._id}
//           sx={{ p: 2, display: 'flex', alignItems: 'center', cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
//           onClick={() => handleClick(user._id)}
//         >
//           <Avatar src={user.profileImage || DEFAULT_PROFILE_IMAGE} sx={{ width: 40, height: 40, mr: 2 }} />
//           <Box>
//             <Typography variant="subtitle1">{user.firstName} {user.lastName}</Typography>
//             <Typography variant="body2" color="text.secondary">{user.email}</Typography>
//           </Box>
//         </Box>
//       ))}
//     </Box>
//   );
// };

// export default UserSearchResults;

//! last
// import { Avatar, Box, Typography } from '@mui/material';
// import { useNavigate } from 'react-router-dom';

// const DEFAULT_PROFILE_IMAGE = '/default-avatar.png';

// const UserSearchResults = ({ results, onResultClick }) => {
//   const navigate = useNavigate();

//   const handleClick = (userId) => {
//     onResultClick();
//     navigate(`/profile/public/${userId}`);
//   };

//   return (
//     <Box>
//       {results.map((user) => (
//         <Box
//           key={user._id}
//           sx={{ p: 2, display: 'flex', alignItems: 'center', cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
//           onClick={() => handleClick(user._id)}
//         >
//           <Avatar src={user.profileImage || DEFAULT_PROFILE_IMAGE} sx={{ width: 40, height: 40, mr: 2 }} />
//           <Box>
//             <Typography variant="subtitle1">{user.firstName} {user.lastName}</Typography>
//             <Typography variant="body2" color="text.secondary">{user.email}</Typography>
//           </Box>
//         </Box>
//       ))}
//     </Box>
//   );
// };

// export default UserSearchResults;

//! depseek
import { Avatar, Box, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const UserSearchResults = ({ results, onResultClick }) => {
  const navigate = useNavigate();

  const handleClick = (userId) => {
    onResultClick();
    navigate(`/profile/public/${userId}`);
  };

  return (
    <Box>
      {results.map((user) => (
        <Box 
          key={user._id} 
          sx={{ 
            p: 2, 
            display: 'flex', 
            alignItems: 'center', 
            cursor: 'pointer',
            '&:hover': { 
              bgcolor: 'action.hover' 
            }
          }}
          onClick={() => handleClick(user._id)}
        >
          <Avatar 
            src={user.profileImage || '/default-avatar.png'} 
            sx={{ width: 40, height: 40, mr: 2 }}
          />
          <Box>
            <Typography variant="subtitle1">
              {user.firstName} {user.lastName}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {user.email}
            </Typography>
          </Box>
        </Box>
      ))}
    </Box>
  );
};

export default UserSearchResults;