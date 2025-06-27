 // features/loading/LoadingBar.jsx
// features/loading/LoadingBar.jsx
import { Box, styled } from '@mui/material';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';

const LoadingBarContainer = styled(Box)({
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100%',
  height: '6px',
  zIndex: 1400,
  overflow: 'hidden',
});

const LoadingBar = () => {
  const { isLoading, animationType } = useSelector((state) => state.loading);

  if (!isLoading) return null;

  return (
    <LoadingBarContainer>
      <motion.div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          height: '100%',
          width: '100%',
          background: animationType === 'wave' 
            ? 'linear-gradient(90deg, #FF008C, #D309E1, #9C1AFF, #7700FF, #4400FF, #FF008C)'
            : 'linear-gradient(90deg, #00F2FE, #4FACFE)',
          backgroundSize: animationType === 'wave' ? '400% 100%' : '200% 100%',
        }}
        animate={{
          backgroundPosition: animationType === 'wave' 
            ? ['0% 50%', '100% 50%'] 
            : ['0% 0%', '100% 100%']
        }}
        transition={{
          repeat: Infinity,
          repeatType: "loop",
          duration: animationType === 'wave' ? 3 : 2,
          ease: "linear"
        }}
      >
        {animationType === 'wave' && (
          <motion.div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background: 'rgba(255,255,255,0.2)',
            }}
            animate={{
              x: ['-100%', '100%'],
            }}
            transition={{
              repeat: Infinity,
              repeatType: "loop",
              duration: 1.5,
              ease: "easeInOut"
            }}
          />
        )}
      </motion.div>
    </LoadingBarContainer>
  );
};

export default LoadingBar;

//! WAVE
// import { Box, styled } from '@mui/material';
// import { motion } from 'framer-motion';
// import { useSelector } from 'react-redux';

// const LoadingBarContainer = styled(Box)({
//   position: 'fixed',
//   top: 0,
//   left: 0,
//   width: '100%',
//   height: '4px',
//   zIndex: 1400,
//   overflow: 'hidden',
//   backgroundColor: 'rgba(0, 0, 0, 0.1)',
// });

// const WaveBar = styled(Box)(({ theme }) => ({
//   position: 'absolute',
//   top: 0,
//   left: 0,
//   width: '300%',
//   height: '100%',
//   background: `linear-gradient(
//     90deg, 
//     transparent,
//     ${theme.palette.primary.main},
//     ${theme.palette.primary.light},
//     ${theme.palette.primary.main},
//     transparent
//   )`,
//   animation: 'wave 2s linear infinite',
//   '@keyframes wave': {
//     '0%': { transform: 'translateX(-100%)' },
//     '100%': { transform: 'translateX(0%)' },
//   },
// }));

// const LoadingBar = () => {
//   const { isLoading, animationType } = useSelector((state) => state.loading);

//   if (!isLoading) return null;

//   return (
//     <LoadingBarContainer>
//       {animationType === 'wave' && <WaveBar />}
//       {animationType === 'bar' && (
//         <motion.div
//           style={{
//             position: 'absolute',
//             top: 0,
//             left: 0,
//             height: '100%',
//             width: '100%',
//             backgroundColor: 'primary.main',
//           }}
//           initial={{ x: '-100%' }}
//           animate={{ x: ['-100%', '100%'] }}
//           transition={{
//             repeat: Infinity,
//             repeatType: "loop",
//             duration: 2,
//             ease: "linear"
//           }}
//         />
//       )}
//     </LoadingBarContainer>
//   );
// };

// export default LoadingBar;


// ! original
// import { Box, keyframes, styled } from '@mui/material';
// import { useSelector } from 'react-redux';

// // Animation keyframes
// const waveAnimation = keyframes`
//   0% { height: 4px; transform: translateY(0px); }
//   25% { height: 6px; transform: translateY(-3px); }
//   50% { height: 4px; transform: translateY(0px); }
//   75% { height: 6px; transform: translateY(3px); }
//   100% { height: 4px; transform: translateY(0px); }
// `;

// const progressAnimation = keyframes`
//   0% { background-position: 0% 50%; }
//   50% { background-position: 100% 50%; }
//   100% { background-position: 0% 50%; }
// `;

// const LoadingBarContainer = styled(Box)({
//   position: 'fixed',
//   top: 0,
//   left: 0,
//   width: '100%',
//   height: '4px',
//   zIndex: 1400,
//   overflow: 'hidden',
//   backgroundColor: 'rgba(0, 0, 0, 0.1)',
// });

// const WaveBar = styled(Box)(({ theme }) => ({
//   position: 'absolute',
//   top: 0,
//   left: 0,
//   width: '100%',
//   height: '100%',
//   background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.primary.light}, ${theme.palette.primary.main})`,
//   backgroundSize: '200% 100%',
//   animation: `${waveAnimation} 1s infinite ease-in-out, ${progressAnimation} 2s infinite linear`,
// }));

// const ProgressBar = styled(Box)(({ theme }) => ({
//   position: 'absolute',
//   top: 0,
//   left: 0,
//   height: '100%',
//   backgroundColor: theme.palette.primary.main,
//   transition: 'width 0.3s ease',
//   '&:after': {
//     content: '""',
//     position: 'absolute',
//     top: 0,
//     left: 0,
//     right: 0,
//     bottom: 0,
//     background: `linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)`,
//     animation: `${progressAnimation} 1.5s infinite linear`,
//   },
// }));

// const LoadingBar = () => {
//   const { isLoading, progress, variant, animationType } = useSelector(
//     (state) => state.loading
//   );

//   if (!isLoading) return null;

//   return (
//     <LoadingBarContainer>
//       {animationType === 'wave' && <WaveBar />}
//       {animationType === 'bar' && variant === 'determinate' && (
//         <ProgressBar sx={{ width: `${progress}%` }} />
//       )}
//       {animationType === 'bar' && variant === 'indeterminate' && (
//         <Box
//           sx={{
//             position: 'absolute',
//             top: 0,
//             left: 0,
//             height: '100%',
//             width: '100%',
//             '&:before': {
//               content: '""',
//               position: 'absolute',
//               height: '100%',
//               width: '50%',
//               backgroundColor: 'primary.main',
//               animation: `${progressAnimation} 1.5s infinite linear`,
//               background: `linear-gradient(90deg, transparent, primary.main, transparent)`,
//             },
//           }}
//         />
//       )}
//     </LoadingBarContainer>
//   );
// };

// export default LoadingBar;
