 // features/loading/LoadingOverlay.jsx
 // features/loading/LoadingOverlay.jsx
import { Backdrop, Box, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import LoadingBar from './LoadingBar';

const waveColors = [
  '#FF008C', // Pink
  '#D309E1', // Purple
  '#9C1AFF', // Violet
  '#7700FF', // Blue
  '#4400FF'  // Dark Blue
];

const LoadingOverlay = () => {
  const { isLoading, message } = useSelector((state) => state.loading);

  if (!isLoading) return null;

  return (
    <>
      <LoadingBar />
      <Backdrop
        sx={{
          color: '#fff',
          zIndex: (theme) => theme.zIndex.drawer + 1300,
          flexDirection: 'column',
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(8px)',
        }}
        open={isLoading}
      >
        {message && (
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'center',
            mb: 3,
            gap: 2
          }}>
            <Typography variant="h6" sx={{ 
              fontWeight: 600,
              background: 'linear-gradient(90deg, #FF008C, #7700FF)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 2
            }}>
              {message}
            </Typography>
            
            <Box
              component={motion.div}
              initial="hidden"
              animate="visible"
              sx={{
                display: 'flex',
                alignItems: 'flex-end',
                height: 40,
                gap: 1
              }}
            >
              {waveColors.map((color, i) => (
                <Box
                  key={i}
                  component={motion.div}
                  initial={{ height: 10 }}
                  animate={{
                    height: [10, 40, 10],
                    backgroundColor: [color, waveColors[(i + 1) % waveColors.length], color],
                  }}
                  transition={{
                    repeat: Infinity,
                    repeatType: "reverse",
                    duration: 1.2,
                    delay: i * 0.15,
                    ease: "easeInOut"
                  }}
                  sx={{
                    width: 8,
                    borderRadius: 4,
                  }}
                />
              ))}
            </Box>
          </Box>
        )}
      </Backdrop>
    </>
  );
};

export default LoadingOverlay;
 //! WAVE
// import { Backdrop, Box, Typography } from '@mui/material';
// import { motion } from 'framer-motion';
// import { useSelector } from 'react-redux';
// import LoadingBar from './LoadingBar';

// const waveAnimation = {
//   animate: {
//     x: [0, 100, 0],
//     transition: {
//       x: {
//         repeat: Infinity,
//         repeatType: "loop",
//         duration: 1.5,
//         ease: "easeInOut"
//       }
//     }
//   }
// };

// const LoadingOverlay = () => {
//   const { isLoading, message } = useSelector((state) => state.loading);

//   if (!isLoading) return null;

//   return (
//     <>
//       <LoadingBar />
//       <Backdrop
//         sx={{
//           color: '#fff',
//           zIndex: (theme) => theme.zIndex.drawer + 1300,
//           flexDirection: 'column',
//           backgroundColor: 'rgba(0, 0, 0, 0.5)',
//           backdropFilter: 'blur(4px)',
//         }}
//         open={isLoading}
//       >
//         {message && (
//           <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
//             <Typography variant="subtitle1" sx={{ mr: 2 }}>
//               {message}
//             </Typography>
//             <Box
//               component={motion.div}
//               initial={{ x: 0 }}
//               animate="animate"
//               variants={waveAnimation}
//               sx={{
//                 display: 'flex',
//                 alignItems: 'flex-end',
//                 height: 24,
//               }}
//             >
//               {[0, 1, 2, 3, 4].map((i) => (
//                 <Box
//                   key={i}
//                   component={motion.div}
//                   animate={{
//                     height: [8, 24, 8],
//                     transition: {
//                       repeat: Infinity,
//                       repeatType: "reverse",
//                       duration: 1.5,
//                       delay: i * 0.2
//                     }
//                   }}
//                   sx={{
//                     width: 4,
//                     backgroundColor: 'currentColor',
//                     borderRadius: 2,
//                     mx: 0.5,
//                   }}
//                 />
//               ))}
//             </Box>
//           </Box>
//         )}
//       </Backdrop>
//     </>
//   );
// };

// export default LoadingOverlay;
//! original
// import { Backdrop, Box, CircularProgress, Typography } from '@mui/material';
// import { useSelector } from 'react-redux';
// import LoadingBar from './LoadingBar';

// const LoadingOverlay = () => {
//   const { isLoading, message } = useSelector((state) => state.loading);

//   if (!isLoading) return null;

//   return (
//     <>
//       <LoadingBar />
//       <Backdrop
//         sx={{
//           color: '#fff',
//           zIndex: (theme) => theme.zIndex.drawer + 1300,
//           flexDirection: 'column',
//           backgroundColor: 'rgba(0, 0, 0, 0.5)',
//           backdropFilter: 'blur(4px)',
//         }}
//         open={isLoading}
//       >
//         <CircularProgress color="inherit" />
//         {message && (
//           <Typography variant="subtitle1" sx={{ mt: 2 }}>
//             {message}
//             <Box
//               component="span"
//               sx={{
//                 display: 'inline-flex',
//                 ml: 1,
//                 '& > span': {
//                   display: 'inline-block',
//                   width: '4px',
//                   height: '4px',
//                   bgcolor: 'currentColor',
//                   borderRadius: '50%',
//                   mx: 0.5,
//                   animation: 'pulse 0.6s infinite ease-in-out',
//                   '&:nth-of-type(2)': { animationDelay: '0.2s' },
//                   '&:nth-of-type(3)': { animationDelay: '0.4s' },
//                 },
//               }}
//             >
//               <span></span>
//               <span></span>
//               <span></span>
//             </Box>
//           </Typography>
//         )}
//       </Backdrop>
//     </>
//   );
// };

// export default LoadingOverlay;
