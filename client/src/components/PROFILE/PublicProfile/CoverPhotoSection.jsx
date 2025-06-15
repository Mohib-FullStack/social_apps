// import { Box, Typography } from '@mui/material';
// import PropTypes from 'prop-types';
// import { CameraAlt } from '@mui/icons-material';

// const CoverPhotoSection = ({ 
//   coverImage, 
//   isOwnProfile, 
//   onCoverClick, 
//   coverHover 
// }) => (
//   <Box sx={{ position: 'relative', mb: 10 }}>
//     <Box
//       sx={{
//         height: 350,
//         backgroundImage: `url(${coverImage})`,
//         backgroundSize: 'cover',
//         backgroundPosition: 'center',
//         backgroundColor: 'grey.200',
//         borderRadius: '8px 8px 0 0',
//         position: 'relative',
//         cursor: isOwnProfile ? 'pointer' : 'default',
//       }}
//       onClick={onCoverClick}
//     >
//       {coverHover && isOwnProfile && (
//         <Box
//           sx={{
//             position: 'absolute',
//             bottom: 16,
//             right: 16,
//             backgroundColor: 'rgba(0,0,0,0.6)',
//             borderRadius: 1,
//             p: 1,
//             display: 'flex',
//             alignItems: 'center',
//             transition: 'opacity 0.3s'
//           }}
//         >
//           <CameraAlt sx={{ color: 'white', mr: 1, fontSize: 20 }} />
//           <Typography variant="body2" color="white" fontWeight="500">
//             Edit cover photo
//           </Typography>
//         </Box>
//       )}
//     </Box>
//   </Box>
// );

// CoverPhotoSection.propTypes = {
//   coverImage: PropTypes.string.isRequired,
//   isOwnProfile: PropTypes.bool.isRequired,
//   onCoverClick: PropTypes.func.isRequired,
//   coverHover: PropTypes.bool.isRequired
// };

// export default CoverPhotoSection;