import { ArrowBack, CameraAlt, PersonAdd } from '@mui/icons-material';
import { Avatar, Badge, Box, Button, CircularProgress, IconButton } from '@mui/material';

const ProfileHeader = ({ 
  userData, 
  isMobile, 
  navigate,
  onCoverPhotoEdit,
  onProfilePhotoEdit,
  coverImageLoading,
  handleAddFriend
}) => {
  return (
    <Box sx={{ 
      position: 'relative', 
      width: '100%', 
      height: isMobile ? '45vh' : '55vh',
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
      
      {/* Back button */}
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
      >
        <ArrowBack />
      </IconButton>
      
      {/* Cover photo edit button */}
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
      >
        <input
          hidden
          accept="image/*"
          type="file"
          onChange={onCoverPhotoEdit}
        />
        <CameraAlt />
      </IconButton>
      
      {/* Profile Image */}
      <Box sx={{
        position: 'absolute',
        left: isMobile ? '50%' : 32,
        bottom: isMobile ? -80 : -100,
        transform: isMobile ? 'translateX(-50%)' : 'none',
        zIndex: 2,
        mb: 12
      }}>
        <Badge
          overlap="circular"
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          badgeContent={
            <IconButton
              component="label"
              sx={{
                bgcolor: 'primary.main',
                color: 'common.white',
                '&:hover': {
                  bgcolor: 'primary.dark'
                }
              }}
            >
              <input
                hidden
                accept="image/*"
                type="file"
                onChange={onProfilePhotoEdit}
              />
              <CameraAlt fontSize="small" />
            </IconButton>
          }
        >
          <Avatar
            src={userData.profileImage}
            sx={{
              width: isMobile ? 120 : 150,
              height: isMobile ? 120 : 150,
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

      {/* Add Friend Button */}
      {!userData.isCurrentUser && (
        <Button
          variant="contained"
          color="primary"
          startIcon={<PersonAdd />}
          onClick={handleAddFriend}
          sx={{
            position: 'absolute',
            bottom: isMobile ? 16 : 32,
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

export default ProfileHeader;










//! with carousel
// import { ArrowBack, PersonAdd } from '@mui/icons-material';
// import { Avatar, Badge, Box, Button, IconButton } from '@mui/material';
// import CoverImageCarousel from '../CoverImageCarousel/CoverImageCarousel';


// const ProfileHeader = ({ 
//   userData, 
//   isMobile, 
//   navigate,
//   onCoverPhotoEdit,
//   onProfilePhotoEdit,
//   coverImageLoading,
//   handleAddFriend,
//   isCurrentUser
// }) => {
//   return (
//     <Box sx={{ position: 'relative', mt: 8 }}>
//       {/* Cover Photo Carousel */}
//       <CoverImageCarousel
//         images={userData.coverImages || [userData.coverImage]}
//         isMobile={isMobile}
//         isLoading={coverImageLoading}
//         isEditable={isCurrentUser}
//         onImagesChange={(newImages) => {
//           // Handle the new images array (you'll need to implement the upload logic)
//           console.log('New cover images:', newImages);
//         }}
//       />
      
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
//           },
//           zIndex: 2
//         }}
//       >
//         <ArrowBack />
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
//             isCurrentUser && (
//               <IconButton
//                 component="label"
//                 sx={{
//                   bgcolor: 'primary.main',
//                   color: 'common.white',
//                   '&:hover': {
//                     bgcolor: 'primary.dark'
//                   }
//                 }}
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
//       {!isCurrentUser && (
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








