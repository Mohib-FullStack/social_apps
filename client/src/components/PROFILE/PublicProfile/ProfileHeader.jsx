// import { Avatar, Badge, Box, Button, CircularProgress, IconButton, Tooltip } from '@mui/material';
// import { ArrowBack, CameraAlt, PersonAdd } from '@mui/icons-material';
// import PropTypes from 'prop-types';
// import { useNavigate } from 'react-router-dom';

// const ProfileHeader = ({ 
//   userData, 
//   isMobile = false, 
//   onCoverPhotoEdit,
//   onProfilePhotoEdit,
//   onAddFriend,
//   coverImageLoading = false
// }) => {
//   const navigate = useNavigate();
  
//   // Constants for consistent styling
//   const AVATAR_SIZE = isMobile ? 120 : 150;
//   const AVATAR_BOTTOM = isMobile ? -80 : -100;
//   const BUTTON_BOTTOM = isMobile ? 16 : 32;
//   const CONTAINER_HEIGHT = isMobile ? '45vh' : '55vh';
//   const isCurrentUser = userData?.isCurrentUser;

//   return (
//     <Box sx={{ 
//       position: 'relative', 
//       width: '100%', 
//       height: CONTAINER_HEIGHT,
//       maxHeight: 500,
//       bgcolor: 'grey.200',
//       overflow: 'hidden',
//       mt: 8
//     }}>
//       {/* Cover Photo */}
//       {coverImageLoading ? (
//         <Box sx={{
//           width: '100%',
//           height: '100%',
//           display: 'flex',
//           justifyContent: 'center',
//           alignItems: 'center',
//           bgcolor: 'background.paper'
//         }}>
//           <CircularProgress size={60} />
//         </Box>
//       ) : (
//         <Box
//           component="img"
//           src={userData.coverImage}
//           alt={`${userData.fullName}'s cover`}
//           sx={{
//             width: '100%',
//             height: '100%',
//             objectFit: 'cover',
//             objectPosition: 'center'
//           }}
//         />
//       )}
      
//       {/* Dark overlay gradient */}
//       <Box sx={{
//         position: 'absolute',
//         inset: 0,
//         background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.5) 50%, transparent 100%)'
//       }} />
      
//       {/* Back button */}
//       <Tooltip title="Go back">
//         <IconButton
//           onClick={() => navigate(-1)}
//           sx={{
//             position: 'absolute',
//             top: 16,
//             left: 16,
//             bgcolor: 'background.paper',
//             '&:hover': {
//               bgcolor: 'primary.main',
//               color: 'common.white'
//             }
//           }}
//         >
//           <ArrowBack />
//         </IconButton>
//       </Tooltip>
      
//       {/* Cover photo edit button (only for current user) */}
//       {isCurrentUser && onCoverPhotoEdit && (
//         <Tooltip title="Edit cover photo">
//           <IconButton
//             component="label"
//             sx={{
//               position: 'absolute',
//               top: 16,
//               right: 16,
//               bgcolor: 'background.paper',
//               '&:hover': {
//                 bgcolor: 'primary.main',
//                 color: 'common.white'
//               }
//             }}
//           >
//             <input hidden accept="image/*" type="file" onChange={onCoverPhotoEdit} />
//             <CameraAlt />
//           </IconButton>
//         </Tooltip>
//       )}
      
//       {/* Profile Image */}
//       <Box sx={{
//         position: 'absolute',
//         left: isMobile ? '50%' : 32,
//         bottom: AVATAR_BOTTOM,
//         transform: isMobile ? 'translateX(-50%)' : 'none',
//         zIndex: 2
//       }}>
//         <Badge
//           overlap="circular"
//           anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
//           badgeContent={
//             isCurrentUser && onProfilePhotoEdit && (
//               <Tooltip title="Edit profile photo">
//                 <IconButton
//                   component="label"
//                   sx={{
//                     bgcolor: 'primary.main',
//                     color: 'common.white',
//                     '&:hover': {
//                       bgcolor: 'primary.dark'
//                     }
//                   }}
//                 >
//                   <input hidden accept="image/*" type="file" onChange={onProfilePhotoEdit} />
//                   <CameraAlt fontSize="small" />
//                 </IconButton>
//               </Tooltip>
//             )
//           }
//         >
//           <Avatar
//             src={userData.profileImage}
//             alt={userData.fullName}
//             sx={{
//               width: AVATAR_SIZE,
//               height: AVATAR_SIZE,
//               border: '4px solid',
//               borderColor: 'background.paper',
//               boxShadow: 3,
//               bgcolor: 'primary.main',
//             }}
//           >
//             {userData.fullName?.charAt(0) || ''}
//           </Avatar>
//         </Badge>
//       </Box>

//       {/* Add Friend Button (only for non-current users) */}
//       {!isCurrentUser && onAddFriend && (
//         <Tooltip title="Add friend">
//           <Button
//             variant="contained"
//             color="primary"
//             startIcon={<PersonAdd />}
//             onClick={onAddFriend}
//             sx={{
//               position: 'absolute',
//               bottom: BUTTON_BOTTOM,
//               right: 32,
//               zIndex: 2,
//               borderRadius: '20px',
//               boxShadow: 2,
//               '&:hover': {
//                 boxShadow: 4
//               }
//             }}
//           >
//             Add Friend
//           </Button>
//         </Tooltip>
//       )}
//     </Box>
//   );
// };

// ProfileHeader.propTypes = {
//   userData: PropTypes.shape({
//     coverImage: PropTypes.string,
//     profileImage: PropTypes.string,
//     fullName: PropTypes.string,
//     id: PropTypes.string,
//     isCurrentUser: PropTypes.bool
//   }).isRequired,
//   isMobile: PropTypes.bool,
//   onCoverPhotoEdit: PropTypes.func,
//   onProfilePhotoEdit: PropTypes.func,
//   onAddFriend: PropTypes.func,
//   coverImageLoading: PropTypes.bool
// };

// export default ProfileHeader;





//! curent
import { ArrowBack, CameraAlt, PersonAdd } from '@mui/icons-material';
import { Avatar, Badge, Box, Button, CircularProgress, IconButton } from '@mui/material';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';

const ProfileHeader = ({ 
  userData, 
  isMobile = false, 
  onCoverPhotoEdit,
  onProfilePhotoEdit,
  coverImageLoading = false,
  handleAddFriend,
  isOwnProfile = false
}) => {
  const navigate = useNavigate(); // Using useNavigate hook directly
  
  // Constants for consistent styling
  const AVATAR_SIZE = isMobile ? 120 : 150;
  const AVATAR_BOTTOM_POSITION = isMobile ? -80 : -100;
  const BUTTON_BOTTOM_POSITION = isMobile ? 16 : 32;
  const CONTAINER_HEIGHT = isMobile ? '45vh' : '55vh';
  
  return (
    <Box sx={{ 
      position: 'relative', 
      width: '100%', 
      height: CONTAINER_HEIGHT,
      maxHeight: 500,
      bgcolor: 'grey.200',
      overflow: 'hidden',
      mt: 8
    }}>
      {/* Cover Photo */}
      {coverImageLoading ? (
        <Box sx={{
          width: '100%',
          height: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          bgcolor: 'background.paper'
        }}>
          <CircularProgress size={60} />
        </Box>
      ) : (
        <Box
          component="img"
          src={userData.coverImage}
          alt={`${userData.fullName}'s cover`}
          sx={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center'
          }}
        />
      )}
      
      {/* Dark overlay gradient */}
      <Box sx={{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.5) 50%, transparent 100%)'
      }} />
      
      {/* Back button - now properly using useNavigate */}
      <IconButton
        onClick={() => navigate(-1)}
        sx={{
          position: 'absolute',
          top: 16,
          left: 16,
          bgcolor: 'background.paper',
          '&:hover': {
            bgcolor: 'primary.main',
            color: 'common.white'
          }
        }}
        aria-label="Go back"
      >
        <ArrowBack />
      </IconButton>
      
      {/* Cover photo edit button */}
      {isOwnProfile && (
        <IconButton
          component="label"
          sx={{
            position: 'absolute',
            top: 16,
            right: 16,
            bgcolor: 'background.paper',
            '&:hover': {
              bgcolor: 'primary.main',
              color: 'common.white'
            }
          }}
          aria-label="Edit cover photo"
        >
          <input
            hidden
            accept="image/*"
            type="file"
            onChange={onCoverPhotoEdit}
          />
          <CameraAlt />
        </IconButton>
      )}
      
      {/* Profile Image */}
      <Box sx={{
        position: 'absolute',
        left: isMobile ? '50%' : 32,
        bottom: AVATAR_BOTTOM_POSITION,
        transform: isMobile ? 'translateX(-50%)' : 'none',
        zIndex: 2,
        mb: 12
      }}>
        <Badge
          overlap="circular"
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          badgeContent={
            isOwnProfile && (
              <IconButton
                component="label"
                sx={{
                  bgcolor: 'primary.main',
                  color: 'common.white',
                  '&:hover': {
                    bgcolor: 'primary.dark'
                  }
                }}
                aria-label="Edit profile photo"
              >
                <input
                  hidden
                  accept="image/*"
                  type="file"
                  onChange={onProfilePhotoEdit}
                />
                <CameraAlt fontSize="small" />
              </IconButton>
            )
          }
        >
          <Avatar
            src={userData.profileImage}
            alt={`${userData.fullName}'s profile`}
            sx={{
              width: AVATAR_SIZE,
              height: AVATAR_SIZE,
              border: '4px solid',
              borderColor: 'background.paper',
              boxShadow: 3,
              bgcolor: 'primary.main',
            }}
          >
            {userData.fullName?.charAt(0) || ''}
          </Avatar>
        </Badge>
      </Box>

      {/* Add Friend Button - Only shown if not own profile */}
      {!isOwnProfile && (
        <Button
          variant="contained"
          color="primary"
          startIcon={<PersonAdd />}
          onClick={handleAddFriend}
          sx={{
            position: 'absolute',
            bottom: BUTTON_BOTTOM_POSITION,
            right: 32,
            zIndex: 2
          }}
        >
          Add Friend
        </Button>
      )}
    </Box>
  );
};

ProfileHeader.propTypes = {
  userData: PropTypes.shape({
    coverImage: PropTypes.string,
    profileImage: PropTypes.string,
    fullName: PropTypes.string,
    id: PropTypes.string // Added ID to propTypes
  }).isRequired,
  isMobile: PropTypes.bool,
  onCoverPhotoEdit: PropTypes.func,
  onProfilePhotoEdit: PropTypes.func,
  coverImageLoading: PropTypes.bool,
  handleAddFriend: PropTypes.func,
  isOwnProfile: PropTypes.bool
};

export default ProfileHeader;







//! old
// import { ArrowBack, CameraAlt, PersonAdd } from '@mui/icons-material';
// import { Avatar, Badge, Box, Button, CircularProgress, IconButton } from '@mui/material';
// import PropTypes from 'prop-types';

// const ProfileHeader = ({ 
//   userData, 
//   isMobile = false, 
//   navigate,
//   onCoverPhotoEdit,
//   onProfilePhotoEdit,
//   coverImageLoading = false,
//   handleAddFriend,
//   isOwnProfile = false
// }) => {
//   // Constants for consistent styling
//   const AVATAR_SIZE = isMobile ? 120 : 150;
//   const AVATAR_BOTTOM_POSITION = isMobile ? -80 : -100;
//   const BUTTON_BOTTOM_POSITION = isMobile ? 16 : 32;
//   const CONTAINER_HEIGHT = isMobile ? '45vh' : '55vh';
  
//   return (
//     <Box sx={{ 
//       position: 'relative', 
//       width: '100%', 
//       height: CONTAINER_HEIGHT,
//       maxHeight: 500,
//       bgcolor: 'grey.200',
//       overflow: 'hidden',
//       mt: 8
//     }}>
//       {/* Cover Photo */}
//       {coverImageLoading ? (
//         <Box sx={{
//           width: '100%',
//           height: '100%',
//           display: 'flex',
//           justifyContent: 'center',
//           alignItems: 'center',
//           bgcolor: 'background.paper'
//         }}>
//           <CircularProgress size={60} />
//         </Box>
//       ) : (
//         <Box
//           component="img"
//           src={userData.coverImage}
//           alt={`${userData.fullName}'s cover`}
//           sx={{
//             width: '100%',
//             height: '100%',
//             objectFit: 'cover',
//             objectPosition: 'center'
//           }}
//         />
//       )}
      
//       {/* Dark overlay gradient */}
//       <Box sx={{
//         position: 'absolute',
//         inset: 0,
//         background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.5) 50%, transparent 100%)'
//       }} />
      
//       {/* Back button */}
//       <IconButton
//         onClick={() => navigate(-1)}
//         sx={{
//           position: 'absolute',
//           top: 16,
//           left: 16,
//           bgcolor: 'background.paper',
//           '&:hover': {
//             bgcolor: 'primary.main',
//             color: 'common.white'
//           }
//         }}
//         aria-label="Go back"
//       >
//         <ArrowBack />
//       </IconButton>
      
//       {/* Cover photo edit button */}
//       {isOwnProfile && (
//         <IconButton
//           component="label"
//           sx={{
//             position: 'absolute',
//             top: 16,
//             right: 16,
//             bgcolor: 'background.paper',
//             '&:hover': {
//               bgcolor: 'primary.main',
//               color: 'common.white'
//             }
//           }}
//           aria-label="Edit cover photo"
//         >
//           <input
//             hidden
//             accept="image/*"
//             type="file"
//             onChange={onCoverPhotoEdit}
//           />
//           <CameraAlt />
//         </IconButton>
//       )}
      
//       {/* Profile Image */}
//       <Box sx={{
//         position: 'absolute',
//         left: isMobile ? '50%' : 32,
//         bottom: AVATAR_BOTTOM_POSITION,
//         transform: isMobile ? 'translateX(-50%)' : 'none',
//         zIndex: 2,
//         mb: 12
//       }}>
//         <Badge
//           overlap="circular"
//           anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
//           badgeContent={
//             isOwnProfile && (
//               <IconButton
//                 component="label"
//                 sx={{
//                   bgcolor: 'primary.main',
//                   color: 'common.white',
//                   '&:hover': {
//                     bgcolor: 'primary.dark'
//                   }
//                 }}
//                 aria-label="Edit profile photo"
//               >
//                 <input
//                   hidden
//                   accept="image/*"
//                   type="file"
//                   onChange={onProfilePhotoEdit}
//                 />
//                 <CameraAlt fontSize="small" />
//               </IconButton>
//             )
//           }
//         >
//           <Avatar
//             src={userData.profileImage}
//             alt={`${userData.fullName}'s profile`}
//             sx={{
//               width: AVATAR_SIZE,
//               height: AVATAR_SIZE,
//               border: '4px solid',
//               borderColor: 'background.paper',
//               boxShadow: 3,
//               bgcolor: 'primary.main',
//             }}
//           >
//             {userData.fullName?.charAt(0) || ''}
//           </Avatar>
//         </Badge>
//       </Box>

//       {/* Add Friend Button */}
//       {!isOwnProfile && (
//         <Button
//           variant="contained"
//           color="primary"
//           startIcon={<PersonAdd />}
//           onClick={handleAddFriend}
//           sx={{
//             position: 'absolute',
//             bottom: BUTTON_BOTTOM_POSITION,
//             right: 32,
//             zIndex: 2
//           }}
//         >
//           Add Friend
//         </Button>
//       )}
//     </Box>
//   );
// };

// ProfileHeader.propTypes = {
//   userData: PropTypes.shape({
//     coverImage: PropTypes.string,
//     profileImage: PropTypes.string,
//     fullName: PropTypes.string,
//     isCurrentUser: PropTypes.bool
//   }).isRequired,
//   isMobile: PropTypes.bool,
//   navigate: PropTypes.func.isRequired,
//   onCoverPhotoEdit: PropTypes.func,
//   onProfilePhotoEdit: PropTypes.func,
//   coverImageLoading: PropTypes.bool,
//   handleAddFriend: PropTypes.func,
//   isOwnProfile: PropTypes.bool
// };

// export default ProfileHeader;









