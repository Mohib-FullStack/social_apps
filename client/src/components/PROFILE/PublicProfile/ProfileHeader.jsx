import { useState } from 'react';
import {
  Avatar,
  Box,
  IconButton,
  CircularProgress
} from '@mui/material';
import { CameraAlt } from '@mui/icons-material';
import PropTypes from 'prop-types';

const ProfileHeader = ({
  coverImage,
  profileImage,
  isOwnProfile,
  onCoverPhotoEdit,
  onProfilePhotoEdit,
  coverImageLoading,
  profileImageLoading,
  isMobile
}) => {
  const [coverPreview, setCoverPreview] = useState(coverImage);
  const [profilePreview, setProfilePreview] = useState(profileImage);

  const handleCoverChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => setCoverPreview(reader.result);
    reader.readAsDataURL(file);
    onCoverPhotoEdit(e);
  };

  const handleProfileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => setProfilePreview(reader.result);
    reader.readAsDataURL(file);
    onProfilePhotoEdit(e);
  };

  return (
    <Box>
      {/* Cover Section */}
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          height: isMobile ? 200 : 350,
          backgroundColor: 'grey.200',
          overflow: 'hidden',
          borderRadius: 2
        }}
      >
        {coverImageLoading ? (
          <Box
            sx={{
              width: '100%',
              height: '100%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            <CircularProgress size={60} />
          </Box>
        ) : (
          <img
            src={coverPreview || coverImage}
            alt="Cover"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        )}

        {/* Cover Edit */}
        {isOwnProfile && (
          <IconButton
            component="label"
            sx={{
              position: 'absolute',
              top: 16,
              right: 16,
              backgroundColor: 'background.paper',
              '&:hover': {
                backgroundColor: 'primary.main',
                color: 'common.white'
              }
            }}
          >
            <input
              hidden
              accept="image/*"
              type="file"
              onChange={handleCoverChange}
            />
            <CameraAlt />
          </IconButton>
        )}

        {/* Profile Avatar */}
        <Box
          sx={{
            position: 'absolute',
            left: isMobile ? '50%' : 32,
            bottom: isMobile ? -60 : -80,
            transform: isMobile ? 'translateX(-50%)' : 'none'
          }}
        >
          <Avatar
            src={profilePreview || profileImage}
            sx={{
              width: isMobile ? 120 : 168,
              height: isMobile ? 120 : 168,
              border: '4px solid',
              borderColor: 'background.paper',
              boxShadow: 3
            }}
          />
          {isOwnProfile && (
            <IconButton
              component="label"
              sx={{
                position: 'absolute',
                bottom: 8,
                right: 8,
                backgroundColor: 'primary.main',
                color: 'white',
                '&:hover': {
                  backgroundColor: 'primary.dark'
                }
              }}
            >
              <input
                hidden
                accept="image/*"
                type="file"
                onChange={handleProfileChange}
              />
              <CameraAlt fontSize="small" />
            </IconButton>
          )}
        </Box>
      </Box>
    </Box>
  );
};

ProfileHeader.propTypes = {
  coverImage: PropTypes.string.isRequired,
  profileImage: PropTypes.string.isRequired,
  isOwnProfile: PropTypes.bool.isRequired,
  onCoverPhotoEdit: PropTypes.func,
  onProfilePhotoEdit: PropTypes.func,
  coverImageLoading: PropTypes.bool,
  profileImageLoading: PropTypes.bool,
  isMobile: PropTypes.bool
};

ProfileHeader.defaultProps = {
  onCoverPhotoEdit: () => {},
  onProfilePhotoEdit: () => {},
  coverImageLoading: false,
  profileImageLoading: false,
  isMobile: false
};

export default ProfileHeader;









//! with button
// import { useState } from 'react';
// import { Avatar, Box, IconButton, CircularProgress } from '@mui/material';
// import { 
//   CameraAlt,
//   Add as AddIcon,
//   ArrowForwardIos as ArrowForwardIosIcon,
//   Check,
//   MoreHoriz as MoreHorizIcon,
//   PersonAdd,
//   Send as SendIcon 
// } from '@mui/icons-material';
// import PropTypes from 'prop-types';

// const ProfileHeader = ({ 
//   coverImage,
//   profileImage,
//   isOwnProfile,
//   onCoverPhotoEdit,
//   onProfilePhotoEdit,
//   coverImageLoading,
//   profileImageLoading,
//   isMobile,
//   ...otherProps
// }) => {
//   const [coverPreview, setCoverPreview] = useState(coverImage);
//   const [profilePreview, setProfilePreview] = useState(profileImage);

//   const handleCoverChange = (e) => {
//     const file = e.target.files[0];
//     if (!file) return;
    
//     const reader = new FileReader();
//     reader.onloadend = () => {
//       setCoverPreview(reader.result);
//     };
//     reader.readAsDataURL(file);
    
//     onCoverPhotoEdit(e);
//   };

//   const handleProfileChange = (e) => {
//     const file = e.target.files[0];
//     if (!file) return;
    
//     const reader = new FileReader();
//     reader.onloadend = () => {
//       setProfilePreview(reader.result);
//     };
//     reader.readAsDataURL(file);
    
//     onProfilePhotoEdit(e);
//   };

//   return (
//     <Box sx={{ 
//       position: 'relative', 
//       width: '100%', 
//       height: isMobile ? 200 : 350,
//       backgroundColor: 'grey.200',
//       overflow: 'hidden',
//       borderRadius: 2
//     }}>
//       {/* Cover Photo Section */}
//       {coverImageLoading ? (
//         <Box sx={{
//           width: '100%',
//           height: '100%',
//           display: 'flex',
//           justifyContent: 'center',
//           alignItems: 'center'
//         }}>
//           <CircularProgress size={60} />
//         </Box>
//       ) : (
//         <img
//           src={coverPreview || coverImage}
//           alt="Cover"
//           style={{
//             width: '100%',
//             height: '100%',
//             objectFit: 'cover'
//           }}
//         />
//       )}
      
//       {/* Cover Photo Edit Button */}
//       {isOwnProfile && (
//         <IconButton
//           component="label"
//           sx={{
//             position: 'absolute',
//             top: 16,
//             right: 16,
//             backgroundColor: 'background.paper',
//             '&:hover': {
//               backgroundColor: 'primary.main',
//               color: 'common.white'
//             }
//           }}
//         >
//           <input
//             hidden
//             accept="image/*"
//             type="file"
//             onChange={handleCoverChange}
//           />
//           <CameraAlt />
//         </IconButton>
//       )}
      
//       {/* Profile Image Section */}
//       <Box sx={{
//         position: 'absolute',
//         left: isMobile ? '50%' : 32,
//         bottom: isMobile ? -60 : -80,
//         transform: isMobile ? 'translateX(-50%)' : 'none'
//       }}>
//         <Avatar
//           src={profilePreview || profileImage}
//           sx={{
//             width: isMobile ? 120 : 168,
//             height: isMobile ? 120 : 168,
//             border: '4px solid',
//             borderColor: 'background.paper',
//             boxShadow: 3
//           }}
//         />
//         {isOwnProfile && (
//           <IconButton
//             component="label"
//             sx={{
//               position: 'absolute',
//               bottom: 8,
//               right: 8,
//               backgroundColor: 'primary.main',
//               color: 'white',
//               '&:hover': {
//                 backgroundColor: 'primary.dark'
//               }
//             }}
//           >
//             <input
//               hidden
//               accept="image/*"
//               type="file"
//               onChange={handleProfileChange}
//             />
//             <CameraAlt fontSize="small" />
//           </IconButton>
//         )}
//       </Box>

//       {/* Profile Actions Section */}
//       {otherProps.ProfileActions && (
//         <Box sx={{ 
//           position: 'absolute', 
//           bottom: isMobile ? -100 : -120,
//           left: 0,
//           right: 0,
//           px: 2
//         }}>
//           <otherProps.ProfileActions 
//             isOwnProfile={isOwnProfile}
//             {...otherProps}
//           />
//         </Box>
//       )}
//     </Box>
//   );
// };

// ProfileHeader.propTypes = {
//   coverImage: PropTypes.string.isRequired,
//   profileImage: PropTypes.string.isRequired,
//   isOwnProfile: PropTypes.bool.isRequired,
//   onCoverPhotoEdit: PropTypes.func,
//   onProfilePhotoEdit: PropTypes.func,
//   coverImageLoading: PropTypes.bool,
//   profileImageLoading: PropTypes.bool,
//   isMobile: PropTypes.bool,
//   ProfileActions: PropTypes.elementType
// };

// ProfileHeader.defaultProps = {
//   onCoverPhotoEdit: () => {},
//   onProfilePhotoEdit: () => {},
//   coverImageLoading: false,
//   profileImageLoading: false,
//   isMobile: false
// };

// export default ProfileHeader;








// ! old
// import { Avatar, Box, IconButton } from '@mui/material';
// import { CameraAlt } from '@mui/icons-material';
// import PropTypes from 'prop-types';

// const ProfileHeader = ({ 
//   coverImage,
//   profileImage,
//   isOwnProfile,
//   onCoverPhotoEdit,
//   onProfilePhotoEdit,
//   coverImageLoading,
//   isMobile
// }) => {
//   return (
//     <Box sx={{ 
//       position: 'relative', 
//       width: '100%', 
//       height: isMobile ? 200 : 350,
//       backgroundColor: 'grey.200',
//       overflow: 'hidden',
//       borderRadius: 2
//     }}>
//       {/* Cover Photo */}
//       {coverImageLoading ? (
//         <Box sx={{
//           width: '100%',
//           height: '100%',
//           display: 'flex',
//           justifyContent: 'center',
//           alignItems: 'center'
//         }}>
//           <CircularProgress size={60} />
//         </Box>
//       ) : (
//         <img
//           src={coverImage}
//           alt="Cover"
//           style={{
//             width: '100%',
//             height: '100%',
//             objectFit: 'cover'
//           }}
//         />
//       )}
      
//       {/* Cover photo edit button (only for own profile) */}
//       {isOwnProfile && (
//         <IconButton
//           component="label"
//           sx={{
//             position: 'absolute',
//             top: 16,
//             right: 16,
//             backgroundColor: 'background.paper',
//             '&:hover': {
//               backgroundColor: 'primary.main',
//               color: 'common.white'
//             }
//           }}
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
//         bottom: isMobile ? -60 : -80,
//         transform: isMobile ? 'translateX(-50%)' : 'none'
//       }}>
//         <Avatar
//           src={profileImage}
//           sx={{
//             width: isMobile ? 120 : 168,
//             height: isMobile ? 120 : 168,
//             border: '4px solid',
//             borderColor: 'background.paper',
//             boxShadow: 3
//           }}
//         />
//         {isOwnProfile && (
//           <IconButton
//             component="label"
//             sx={{
//               position: 'absolute',
//               bottom: 8,
//               right: 8,
//               backgroundColor: 'primary.main',
//               color: 'white',
//               '&:hover': {
//                 backgroundColor: 'primary.dark'
//               }
//             }}
//           >
//             <input
//               hidden
//               accept="image/*"
//               type="file"
//               onChange={onProfilePhotoEdit}
//             />
//             <CameraAlt fontSize="small" />
//           </IconButton>
//         )}
//       </Box>
//     </Box>
//   );
// };

// ProfileHeader.propTypes = {
//   coverImage: PropTypes.string.isRequired,
//   profileImage: PropTypes.string.isRequired,
//   isOwnProfile: PropTypes.bool.isRequired,
//   onCoverPhotoEdit: PropTypes.func,
//   onProfilePhotoEdit: PropTypes.func,
//   coverImageLoading: PropTypes.bool,
//   isMobile: PropTypes.bool
// };

// export default ProfileHeader;


//! running
// import { Box, Button, IconButton, Typography, useTheme, Avatar } from '@mui/material';
// import { 
//   Edit as EditIcon, 
//   Add as AddIcon, 
//   MoreVert as MoreIcon,
//   PersonAdd as AddContactIcon,
//   Send as MessageIcon
// } from '@mui/icons-material';
// import VerifiedIcon from '@mui/icons-material/Verified';
// import PropTypes from 'prop-types';

// const ProfileHeader = ({
//   profileData,
//   isMobile,
//   onProfileEdit,
//   onConnect,
//   isLoading
// }) => {
//   const theme = useTheme();
//   const isCurrentUser = profileData?.isCurrentUser;

//   return (
//     <Box sx={{ position: 'relative', width: '100%', mb: 8 }}>
//       {/* Cover Photo */}
//       <Box
//         sx={{
//           height: isMobile ? 200 : 350,
//           width: '100%',
//           position: 'relative',
//           backgroundColor: theme.palette.grey[300],
//           overflow: 'hidden',
//           borderRadius: 2
//         }}
//       >
//         <img
//           src={profileData.coverImage}
//           alt="Cover"
//           style={{
//             width: '100%',
//             height: '100%',
//             objectFit: 'cover',
//             filter: isLoading ? 'blur(5px)' : 'none',
//             transition: 'filter 0.3s ease'
//           }}
//         />
//       </Box>

//       {/* Profile Info Section */}
//       <Box
//         sx={{
//           display: 'flex',
//           flexDirection: isMobile ? 'column' : 'row',
//           alignItems: isMobile ? 'center' : 'flex-end',
//           justifyContent: 'space-between',
//           px: isMobile ? 2 : 4,
//           mt: isMobile ? -6 : -10,
//           position: 'relative',
//           zIndex: 1
//         }}
//       >
//         {/* Profile Avatar */}
//         <Box sx={{ position: 'relative' }}>
//           <Avatar
//             src={profileData.profileImage}
//             sx={{
//               width: isMobile ? 120 : 168,
//               height: isMobile ? 120 : 168,
//               border: '4px solid',
//               borderColor: theme.palette.background.paper,
//               boxShadow: theme.shadows[4]
//             }}
//           />
//           {isCurrentUser && (
//             <IconButton
//               sx={{
//                 position: 'absolute',
//                 bottom: 8,
//                 right: 8,
//                 backgroundColor: theme.palette.primary.main,
//                 color: 'white',
//                 '&:hover': {
//                   backgroundColor: theme.palette.primary.dark
//                 }
//               }}
//               onClick={onProfileEdit}
//             >
//               <EditIcon fontSize="small" />
//             </IconButton>
//           )}
//         </Box>

//         {/* User Info and Actions */}
//         <Box
//           sx={{
//             display: 'flex',
//             flexDirection: isMobile ? 'column' : 'row',
//             alignItems: 'center',
//             gap: 3,
//             mt: isMobile ? 2 : 0,
//             ml: isMobile ? 0 : 4
//           }}
//         >
//           <Box sx={{ textAlign: isMobile ? 'center' : 'left' }}>
//             <Typography
//               variant={isMobile ? 'h5' : 'h4'}
//               component="h1"
//               sx={{ 
//                 fontWeight: 700, 
//                 display: 'flex', 
//                 alignItems: 'center',
//                 color: theme.palette.text.primary
//               }}
//             >
//               {profileData.fullName}
//               {profileData.isVerified && (
//                 <VerifiedIcon
//                   color="primary"
//                   sx={{ ml: 1, fontSize: 'inherit' }}
//                 />
//               )}
//             </Typography>
//             <Typography variant="subtitle1" color="text.secondary">
//               {profileData.headline || 'SocialSphere Member'}
//             </Typography>
//           </Box>

//           <Box sx={{ display: 'flex', gap: 2 }}>
//             {isCurrentUser ? (
//               <>
//                 <Button
//                   variant="contained"
//                   startIcon={<AddIcon />}
//                   sx={{
//                     background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
//                     color: 'white',
//                     fontWeight: 600
//                   }}
//                 >
//                   Create Story
//                 </Button>
//                 <Button
//                   variant="outlined"
//                   startIcon={<EditIcon />}
//                   sx={{ fontWeight: 600 }}
//                 >
//                   Edit Profile
//                 </Button>
//               </>
//             ) : (
//               <>

            
//                  <Button
//                   variant="contained"
//                   startIcon={<AddContactIcon />}
//                   onClick={onConnect}
//                   sx={{
//                     background: `linear-gradient(135deg, ${theme.palette.success.main}, ${theme.palette.success.dark})`,
//                     color: 'white',
//                     fontWeight: 600
//                   }}
//                 >
//                   Connect
//                 </Button>
//                  <Button
//                   variant="outlined"
//                   startIcon={<MessageIcon />}
//                   sx={{ fontWeight: 600 }}
//                 >
//                   Message
//                 </Button>
//               </>
//             )}
//             <IconButton
//               sx={{
//                 backgroundColor: theme.palette.action.hover,
//                 color: theme.palette.text.primary
//               }}
//             >
//               <MoreIcon />
//             </IconButton>
//           </Box>
//         </Box>
//       </Box>
//     </Box>
//   );
// };

// ProfileHeader.propTypes = {
//   profileData: PropTypes.shape({
//     coverImage: PropTypes.string.isRequired,
//     profileImage: PropTypes.string.isRequired,
//     fullName: PropTypes.string.isRequired,
//     headline: PropTypes.string,
//     isVerified: PropTypes.bool,
//     isCurrentUser: PropTypes.bool
//   }).isRequired,
//   isMobile: PropTypes.bool,
//   onProfileEdit: PropTypes.func,
//   onConnect: PropTypes.func,
//   isLoading: PropTypes.bool
// };

// export default ProfileHeader;



//! running
// import { Avatar, Box, Button, IconButton, Typography, useTheme } from '@mui/material';
// import { Edit, Add, MoreVert } from '@mui/icons-material';
// import { useNavigate } from 'react-router-dom';
// import VerifiedIcon from '@mui/icons-material/Verified';
// import PropTypes from 'prop-types';

// const ProfileHeader = ({
//   userData,
//   isMobile,
//   navigate,
//   onCoverPhotoEdit,
//   onProfilePhotoEdit,
//   coverImageLoading,
//   handleAddFriend,
//   handleMessage
// }) => {
//   const theme = useTheme();
//   const isCurrentUser = userData?.isCurrentUser;

//   const actionButtons = [
//     ...(isCurrentUser
//       ? [
//           {
//             label: 'Add to story',
//             icon: <Add />,
//             variant: 'contained',
//             sx: { background: theme.palette.primary.gradient, color: 'white' },
//             onClick: () => navigate('/stories/create')
//           },
//           {
//             label: 'Edit profile',
//             icon: <Edit />,
//             variant: 'contained',
//             sx: { backgroundColor: 'background.default', color: 'text.primary' },
//             onClick: () => navigate('/profile/edit')
//           }
//         ]
//       : [
//           {
//             label: 'Add Friend',
//             icon: null,
//             variant: 'contained',
//             color: 'primary',
//             onClick: handleAddFriend,
//             show: !!handleAddFriend
//           },
//           {
//             label: 'Message',
//             icon: null,
//             variant: 'contained',
//             sx: { backgroundColor: 'background.default', color: 'text.primary' },
//             onClick: handleMessage,
//             show: !!handleMessage
//           }
//         ])
//   ].filter(button => button.show !== false);

//   return (
//     <Box sx={{ position: 'relative', width: '100%' }}>
//       <CoverPhoto 
//         coverImage={userData.coverImage} 
//         loading={coverImageLoading}
//         onEdit={onCoverPhotoEdit}
//         isMobile={isMobile}
//       />

//       <ProfileInfoSection 
//         userData={userData}
//         isMobile={isMobile}
//         onProfilePhotoEdit={onProfilePhotoEdit}
//         actionButtons={actionButtons}
//       />
//     </Box>
//   );
// };

// const CoverPhoto = ({ coverImage, loading, onEdit, isMobile }) => {
//   const theme = useTheme();
  
//   return (
//     <Box
//       sx={{
//         height: isMobile ? 200 : 350,
//         width: '100%',
//         position: 'relative',
//         backgroundColor: theme.palette.grey[300],
//         overflow: 'hidden'
//       }}
//     >
//       <img
//         src={coverImage}
//         alt="Cover"
//         style={{
//           width: '100%',
//           height: '100%',
//           objectFit: 'cover',
//           filter: loading ? 'blur(5px)' : 'none',
//           transition: 'filter 0.3s ease'
//         }}
//       />
      
//       {onEdit && (
//         <Button
//           variant="contained"
//           startIcon={<Edit />}
//           sx={{
//             position: 'absolute',
//             bottom: 16,
//             right: 16,
//             backgroundColor: 'rgba(0,0,0,0.5)',
//             '&:hover': { backgroundColor: 'rgba(0,0,0,0.7)' }
//           }}
//           onClick={onEdit}
//         >
//           Edit Cover
//         </Button>
//       )}
//     </Box>
//   );
// };

// const ProfileInfoSection = ({ userData, isMobile, onProfilePhotoEdit, actionButtons }) => {
//   return (
//     <Box
//       sx={{
//         display: 'flex',
//         flexDirection: isMobile ? 'column' : 'row',
//         alignItems: isMobile ? 'center' : 'flex-end',
//         justifyContent: 'space-between',
//         px: isMobile ? 2 : 4,
//         mt: isMobile ? -8 : -10,
//         mb: 2,
//         position: 'relative',
//         zIndex: 1
//       }}
//     >
//       <ProfileAvatar 
//         profileImage={userData.profileImage} 
//         onEdit={onProfilePhotoEdit} 
//         isMobile={isMobile}
//       />

//       <UserInfoAndActions 
//         userData={userData}
//         isMobile={isMobile}
//         actionButtons={actionButtons}
//       />
//     </Box>
//   );
// };

// const ProfileAvatar = ({ profileImage, onEdit, isMobile }) => {
//   const theme = useTheme();
  
//   return (
//     <Box sx={{ position: 'relative' }}>
//       <Avatar
//         src={profileImage}
//         sx={{
//           width: isMobile ? 120 : 168,
//           height: isMobile ? 120 : 168,
//           border: '4px solid',
//           borderColor: theme.palette.background.paper,
//           boxShadow: theme.shadows[3]
//         }}
//       />
      
//       {onEdit && (
//         <IconButton
//           sx={{
//             position: 'absolute',
//             bottom: 8,
//             right: 8,
//             backgroundColor: theme.palette.grey[200],
//             '&:hover': { backgroundColor: theme.palette.grey[300] }
//           }}
//           onClick={onEdit}
//         >
//           <Edit fontSize="small" />
//         </IconButton>
//       )}
//     </Box>
//   );
// };

// const UserInfoAndActions = ({ userData, isMobile, actionButtons }) => {
//   return (
//     <Box
//       sx={{
//         display: 'flex',
//         flexDirection: isMobile ? 'column' : 'row',
//         alignItems: 'center',
//         gap: 2,
//         mt: isMobile ? 2 : 0,
//         mb: isMobile ? 2 : 0,
//         ml: isMobile ? 0 : 4
//       }}
//     >
//       <UserInfo userData={userData} isMobile={isMobile} />
//       <ActionButtons actionButtons={actionButtons} />
//     </Box>
//   );
// };

// const UserInfo = ({ userData, isMobile }) => {
//   return (
//     <Box sx={{ textAlign: isMobile ? 'center' : 'left' }}>
//       <Typography
//         variant={isMobile ? 'h5' : 'h4'}
//         component="h1"
//         sx={{ fontWeight: 700, display: 'flex', alignItems: 'center' }}
//       >
//         {userData.fullName}
//         {userData.isVerified && (
//           <VerifiedIcon
//             color="primary"
//             sx={{ ml: 1, fontSize: 'inherit' }}
//           />
//         )}
//       </Typography>
//       <Typography variant="subtitle1" color="text.secondary">
//         {isMobile ? `${userData.friendCount?.toLocaleString() || '0'} friends` : ''}
//       </Typography>
//     </Box>
//   );
// };

// const ActionButtons = ({ actionButtons }) => {
//   return (
//     <Box sx={{ display: 'flex', gap: 1 }}>
//       {actionButtons.map((button, index) => (
//         <Button
//           key={index}
//           variant={button.variant}
//           color={button.color}
//           startIcon={button.icon}
//           sx={button.sx}
//           onClick={button.onClick}
//         >
//           {button.label}
//         </Button>
//       ))}
//       <IconButton
//         sx={{
//           backgroundColor: 'background.default',
//           color: 'text.primary'
//         }}
//       >
//         <MoreVert />
//       </IconButton>
//     </Box>
//   );
// };

// ProfileHeader.propTypes = {
//   userData: PropTypes.shape({
//     coverImage: PropTypes.string.isRequired,
//     profileImage: PropTypes.string.isRequired,
//     fullName: PropTypes.string.isRequired,
//     isVerified: PropTypes.bool,
//     isCurrentUser: PropTypes.bool,
//     friendCount: PropTypes.number
//   }).isRequired,
//   isMobile: PropTypes.bool,
//   navigate: PropTypes.func.isRequired,
//   onCoverPhotoEdit: PropTypes.func,
//   onProfilePhotoEdit: PropTypes.func,
//   coverImageLoading: PropTypes.bool,
//   handleAddFriend: PropTypes.func,
//   handleMessage: PropTypes.func
// };

// export default ProfileHeader;


//! 1st with is with back Icon and edit option
// import { ArrowBack, CameraAlt, PersonAdd } from '@mui/icons-material';
// import { Avatar, Badge, Box, Button, CircularProgress, IconButton } from '@mui/material';

// const ProfileHeader = ({ 
//   userData, 
//   isMobile, 
//   navigate,
//   onCoverPhotoEdit,
//   onProfilePhotoEdit,
//   coverImageLoading,
//   handleAddFriend
// }) => {
//   return (
//     <Box sx={{ 
//       position: 'relative', 
//       width: '100%', 
//       height: isMobile ? '45vh' : '55vh',
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
//       >
//         <ArrowBack />
//       </IconButton>
      
//       {/* Cover photo edit button */}
//       <IconButton
//         component="label"
//         sx={{
//           position: 'absolute',
//           top: 16,
//           right: 16,
//           bgcolor: 'background.paper',
//           '&:hover': {
//             bgcolor: 'primary.main',
//             color: 'common.white'
//           }
//         }}
//       >
//         <input
//           hidden
//           accept="image/*"
//           type="file"
//           onChange={onCoverPhotoEdit}
//         />
//         <CameraAlt />
//       </IconButton>
      
//       {/* Profile Image */}
//       <Box sx={{
//         position: 'absolute',
//         left: isMobile ? '50%' : 32,
//         bottom: isMobile ? -80 : -100,
//         transform: isMobile ? 'translateX(-50%)' : 'none',
//         zIndex: 2,
//         mb: 12
//       }}>
//         <Badge
//           overlap="circular"
//           anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
//           badgeContent={
//             <IconButton
//               component="label"
//               sx={{
//                 bgcolor: 'primary.main',
//                 color: 'common.white',
//                 '&:hover': {
//                   bgcolor: 'primary.dark'
//                 }
//               }}
//             >
//               <input
//                 hidden
//                 accept="image/*"
//                 type="file"
//                 onChange={onProfilePhotoEdit}
//               />
//               <CameraAlt fontSize="small" />
//             </IconButton>
//           }
//         >
//           <Avatar
//             src={userData.profileImage}
//             sx={{
//               width: isMobile ? 120 : 150,
//               height: isMobile ? 120 : 150,
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
//       {!userData.isCurrentUser && (
//         <Button
//           variant="contained"
//           color="primary"
//           startIcon={<PersonAdd />}
//           onClick={handleAddFriend}
//           sx={{
//             position: 'absolute',
//             bottom: isMobile ? 16 : 32,
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

// export default ProfileHeader;