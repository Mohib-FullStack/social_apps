// // features/loading/LoadingBar.jsx
// import { Box, keyframes, styled } from '@mui/material';
// import { useSelector } from 'react-redux';

// // Animation keyframes
// const waveAnimation = keyframes`
//   0% { transform: translateY(0) scaleY(1); }
//   25% { transform: translateY(-5px) scaleY(0.7); }
//   50% { transform: translateY(0) scaleY(1.2); }
//   75% { transform: translateY(3px) scaleY(0.9); }
//   100% { transform: translateY(0) scaleY(1); }
// `;

// const pulseAnimation = keyframes`
//   0% { width: 0%; left: 0; }
//   50% { width: 100%; left: 0; }
//   100% { width: 0%; left: 100%; }
// `;

// const barAnimation = keyframes`
//   0% { transform: scaleX(0); transform-origin: left; }
//   50% { transform: scaleX(1); transform-origin: left; }
//   100% { transform: scaleX(0); transform-origin: right; }
// `;

// const LoadingBarContainer = styled(Box)({
//   position: 'fixed',
//   top: 0,
//   left: 0,
//   width: '100%',
//   height: '4px',
//   zIndex: 1400,
//   overflow: 'hidden'
// });

// const WaveBar = styled(Box)(({ theme }) => ({
//   position: 'absolute',
//   top: 0,
//   left: 0,
//   width: '100%',
//   height: '100%',
//   backgroundColor: theme.palette.primary.main,
//   animation: `${waveAnimation} 1.5s infinite ease-in-out`,
//   transformOrigin: 'center bottom'
// }));

// const PulseBar = styled(Box)(({ theme }) => ({
//   position: 'absolute',
//   top: 0,
//   left: 0,
//   width: '100%',
//   height: '100%',
//   '&:before': {
//     content: '""',
//     position: 'absolute',
//     height: '100%',
//     backgroundColor: theme.palette.primary.main,
//     animation: `${pulseAnimation} 2s infinite ease-out`
//   }
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
//     backgroundColor: theme.palette.primary.dark,
//     animation: `${barAnimation} 1.5s infinite linear`,
//     opacity: 0.6
//   }
// }));

// const LoadingBar = () => {
//   const { isLoading, progress, variant, animationType } = useSelector((state) => state.loading);

//   if (!isLoading) return null;

//   return (
//     <LoadingBarContainer>
//       {animationType === 'wave' && variant === 'indeterminate' && <WaveBar />}
//       {animationType === 'pulse' && variant === 'indeterminate' && <PulseBar />}
//       {variant === 'determinate' && (
//         <ProgressBar sx={{ width: `${progress}%` }} />
//       )}
//     </LoadingBarContainer>
//   );
// };

// export default LoadingBar;

//! new
// features/loading/LoadingBar.jsx
import { Box, keyframes, styled } from '@mui/material';
import { useSelector } from 'react-redux';

// Animation keyframes
const waveAnimation = keyframes`
  0% { height: 4px; transform: translateY(0px); }
  25% { height: 6px; transform: translateY(-3px); }
  50% { height: 4px; transform: translateY(0px); }
  75% { height: 6px; transform: translateY(3px); }
  100% { height: 4px; transform: translateY(0px); }
`;

const progressAnimation = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const LoadingBarContainer = styled(Box)({
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100%',
  height: '4px',
  zIndex: 1400,
  overflow: 'hidden',
  backgroundColor: 'rgba(0, 0, 0, 0.1)'
});

const WaveBar = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.primary.light}, ${theme.palette.primary.main})`,
  backgroundSize: '200% 100%',
  animation: `${waveAnimation} 1s infinite ease-in-out, ${progressAnimation} 2s infinite linear`,
}));

const ProgressBar = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  height: '100%',
  backgroundColor: theme.palette.primary.main,
  transition: 'width 0.3s ease',
  '&:after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: `linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)`,
    animation: `${progressAnimation} 1.5s infinite linear`,
  }
}));

const LoadingBar = () => {
  const { isLoading, progress, variant, animationType } = useSelector((state) => state.loading);

  if (!isLoading) return null;

  return (
    <LoadingBarContainer>
      {animationType === 'wave' && (
        <WaveBar />
      )}
      {animationType === 'bar' && variant === 'determinate' && (
        <ProgressBar sx={{ width: `${progress}%` }} />
      )}
      {animationType === 'bar' && variant === 'indeterminate' && (
        <Box sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          height: '100%',
          width: '100%',
          '&:before': {
            content: '""',
            position: 'absolute',
            height: '100%',
            width: '50%',
            backgroundColor: 'primary.main',
            animation: `${progressAnimation} 1.5s infinite linear`,
            background: `linear-gradient(90deg, transparent, primary.main, transparent)`
          }
        }} />
      )}
    </LoadingBarContainer>
  );
};

export default LoadingBar;