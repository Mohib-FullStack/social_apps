// ===============================
// 4️⃣ Inline Button Loader (optional): LoadingDots.jsx
// ===============================

// src/features/loading/LoadingDots.jsx
import { Box, styled } from '@mui/material';
import { useSelector } from 'react-redux';

const SmallDot = styled('span')(({ theme, index }) => ({
  width: 6,
  height: 6,
  margin: '0 2px',
  borderRadius: '50%',
  backgroundColor: theme.palette.primary.main,
  display: 'inline-block',
  animation: 'bounce 1.4s infinite ease-in-out',
  animationDelay: `${index * 0.2}s`,
  '@keyframes bounce': {
    '0%, 80%, 100%': { transform: 'scale(0)' },
    '40%': { transform: 'scale(1)' }
  }
}));

const LoadingDots = ({ loadingId }) => {
  const isLoading = useSelector(state =>
    state.loading.items.some(i => i.id === loadingId)
  );
  return isLoading ? (
    <Box display="inline-flex" ml={1}>
      {[0, 1, 2].map(i => <SmallDot key={i} index={i} />)}
    </Box>
  ) : null;
};

export default LoadingDots;
