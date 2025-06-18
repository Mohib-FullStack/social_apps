// // features/loading/LoadingOverlay.jsx
// import { Backdrop, CircularProgress, Typography } from '@mui/material';
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
//           backdropFilter: 'blur(4px)'
//         }}
//         open={isLoading}
//       >
//         <CircularProgress color="inherit" />
//         {message && (
//           <Typography variant="subtitle1" sx={{ mt: 2 }}>
//             {message}
//           </Typography>
//         )}
//       </Backdrop>
//     </>
//   );
// };

// export default LoadingOverlay;

//! new
// features/loading/LoadingOverlay.jsx
import { Backdrop, Box, CircularProgress, Typography } from '@mui/material';
import { useSelector } from 'react-redux';
import LoadingBar from './LoadingBar';

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
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(4px)'
        }}
        open={isLoading}
      >
        <CircularProgress color="inherit" />
        {message && (
          <Typography variant="subtitle1" sx={{ mt: 2 }}>
            {message}
            <Box component="span" sx={{ 
              display: 'inline-flex',
              ml: 1,
              '& > span': {
                display: 'inline-block',
                width: '4px',
                height: '4px',
                bgcolor: 'currentColor',
                borderRadius: '50%',
                mx: 0.5,
                animation: 'pulse 0.6s infinite ease-in-out',
                '&:nth-of-type(2)': { animationDelay: '0.2s' },
                '&:nth-of-type(3)': { animationDelay: '0.4s' }
              }
            }}>
              <span></span>
              <span></span>
              <span></span>
            </Box>
          </Typography>
        )}
      </Backdrop>
    </>
  );
};

export default LoadingOverlay;