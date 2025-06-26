// features/loading/LoadingOverlay.jsx
// ===============================
// 2️⃣ Overlay Loader: LoadingOverlay.jsx
// ===============================

// src/features/loading/LoadingOverlay.jsx
// import { Box, styled } from '@mui/material';
// import { useSelector } from 'react-redux';

// const bounce = {
//   '0%, 80%, 100%': { transform: 'scale(0)' },
//   '40%': { transform: 'scale(1)' },
// };

// const Dot = styled('span')(({ theme, index }) => ({
//   width: 10,
//   height: 10,
//   margin: '0 5px',
//   borderRadius: '50%',
//   backgroundColor: theme.palette.primary.main,
//   display: 'inline-block',
//   animation: 'bounce 1.4s infinite ease-in-out',
//   animationDelay: `${index * 0.2}s`,
//   '@keyframes bounce': bounce
// }));

// const OverlayWrapper = styled(Box)(({ theme }) => ({
//   position: 'absolute',
//   top: 0,
//   left: 0,
//   right: 0,
//   bottom: 0,
//   backgroundColor: theme.palette.background.paper + 'cc',
//   backdropFilter: 'blur(2px)',
//   display: 'flex',
//   alignItems: 'center',
//   justifyContent: 'center',
//   zIndex: 10,
//   borderRadius: theme.shape.borderRadius
// }));

// const LoadingOverlay = ({ loadingId, label = '', children, height = 'auto' }) => {
//   const item = useSelector((state) => state.loading.items.find(i => i.id === loadingId));
//   const isLoading = !!item;

//   return (
//     <Box position="relative" minHeight={height}>
//       {isLoading && (
//         <OverlayWrapper>
//           <Box display="flex" flexDirection="column" alignItems="center">
//             <Box>
//               {[0, 1, 2].map(i => <Dot key={i} index={i} />)}
//             </Box>
//             {label && <Box mt={1} fontSize="0.875rem">{label}</Box>}
//           </Box>
//         </OverlayWrapper>
//       )}
//       {children}
//     </Box>
//   );
// };

// export default LoadingOverlay;







//! original
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
          backdropFilter: 'blur(4px)',
        }}
        open={isLoading}
      >
        <CircularProgress color="inherit" />
        {message && (
          <Typography variant="subtitle1" sx={{ mt: 2 }}>
            {message}
            <Box
              component="span"
              sx={{
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
                  '&:nth-of-type(3)': { animationDelay: '0.4s' },
                },
              }}
            >
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
