import { Avatar, Box, Typography, List, ListItem, ListItemAvatar, ListItemText } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types'; // Add this import

const UserSearchResults = ({ 
  results = [], 
  onResultClick = () => {}, 
  isLoading = false 
}) => {
  const navigate = useNavigate();
  const currentUserId = useSelector((state) => state.user.profile?.id);

  const handleClick = (user) => {
    if (!user?.id) {
      console.error('Invalid user object:', user);
      return;
    }

    onResultClick();
    navigate(user.id === currentUserId ? '/profile/me' : `/profile/${user.id}`);
  };

  if (isLoading) {
    return (
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Loading...
        </Typography>
      </Box>
    );
  }

  if (results.length === 0) {
    return (
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          No users found
        </Typography>
      </Box>
    );
  }

  return (
    <List sx={{ maxHeight: 300, overflowY: 'auto', py: 0 }}>
      {results.map((user) => (
        <ListItem 
          key={user.id}
          button
          onClick={() => handleClick(user)}
          sx={{
            '&:hover': { 
              backgroundColor: 'action.hover' 
            },
            transition: 'background-color 0.2s ease',
            px: 2,
            py: 1.5
          }}
          aria-label={`View profile of ${user.firstName} ${user.lastName}`}
          data-testid={`user-result-${user.id}`}
        >
          <ListItemAvatar>
            <Avatar 
              src={user.profileImage || '/default-avatar.png'} 
              alt={`${user.firstName}'s profile`}
              sx={{ 
                width: 40, 
                height: 40,
                backgroundColor: 'primary.light',
                color: 'primary.contrastText'
              }}
            />
          </ListItemAvatar>
          <ListItemText
            primary={`${user.firstName} ${user.lastName}`}
            secondary={user.email}
            primaryTypographyProps={{
              variant: 'subtitle1',
              noWrap: true,
              component: 'div'
            }}
            secondaryTypographyProps={{
              variant: 'body2',
              color: 'text.secondary',
              noWrap: true,
              component: 'div'
            }}
            sx={{ overflow: 'hidden' }}
          />
        </ListItem>
      ))}
    </List>
  );
};

UserSearchResults.propTypes = {
  results: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      firstName: PropTypes.string.isRequired,
      lastName: PropTypes.string.isRequired,
      email: PropTypes.string.isRequired,
      profileImage: PropTypes.string,
    })
  ),
  onResultClick: PropTypes.func,
  isLoading: PropTypes.bool,
};

export default UserSearchResults;







//! old
// import { Avatar, Box, Typography } from '@mui/material';
// import PropTypes from 'prop-types';
// import { useNavigate } from 'react-router-dom';

// const UserSearchResults = ({ results = [], onResultClick = () => {} }) => {
//   const navigate = useNavigate();

//   const handleClick = (user) => {
//     onResultClick();
    
//     if (!user?.id) {
//       console.error('Invalid user object:', user);
//       return;
//     }

//     navigate(`/profile/${user.id}`);
//   };

//   if (results.length === 0) {
//     return (
//       <Box sx={{ p: 2, textAlign: 'center' }}>
//         <Typography variant="body2" color="text.secondary">
//           No users found
//         </Typography>
//       </Box>
//     );
//   }

//   return (
//     <Box sx={{ maxHeight: 300, overflowY: 'auto' }}>
//       {results.map((user) => (
//         <Box 
//           key={user.id}
//           sx={{ 
//             p: 2, 
//             display: 'flex', 
//             alignItems: 'center', 
//             cursor: 'pointer',
//             '&:hover': { 
//               backgroundColor: 'action.hover' 
//             },
//             transition: 'background-color 0.2s ease'
//           }}
//           onClick={() => handleClick(user)}
//           aria-label={`View profile of ${user.firstName} ${user.lastName}`}
//         >
//           <Avatar 
//             src={user.profileImage || '/default-avatar.png'} 
//             alt={`${user.firstName}'s profile`}
//             sx={{ 
//               width: 40, 
//               height: 40, 
//               mr: 2,
//               backgroundColor: 'primary.light',
//               color: 'primary.contrastText'
//             }}
//           />
//           <Box sx={{ overflow: 'hidden' }}>
//             <Typography variant="subtitle1" noWrap>
//               {user.firstName} {user.lastName}
//             </Typography>
//             <Typography 
//               variant="body2" 
//               color="text.secondary"
//               noWrap
//             >
//               {user.email}
//             </Typography>
//           </Box>
//         </Box>
//       ))}
//     </Box>
//   );
// };

// UserSearchResults.propTypes = {
//   results: PropTypes.arrayOf(
//     PropTypes.shape({
//       id: PropTypes.string.isRequired,
//       firstName: PropTypes.string.isRequired,
//       lastName: PropTypes.string.isRequired,
//       email: PropTypes.string.isRequired,
//       profileImage: PropTypes.string,
//     })
//   ),
//   onResultClick: PropTypes.func,
// };

// export default UserSearchResults;