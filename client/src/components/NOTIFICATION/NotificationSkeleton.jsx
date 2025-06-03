// NotificationSkeleton.jsx
import { Box, Skeleton } from '@mui/material';

const NotificationSkeleton = ({ dense = false }) => {
  return (
    <Box sx={{ display: 'flex', gap: 2, p: dense ? 1 : 2 }}>
      <Skeleton 
        variant="circular" 
        width={dense ? 32 : 40} 
        height={dense ? 32 : 40} 
      />
      <Box sx={{ flexGrow: 1 }}>
        <Skeleton variant="text" width="80%" height={20} />
        <Skeleton variant="text" width="60%" height={16} sx={{ mt: 1 }} />
        {!dense && (
          <Skeleton variant="rectangular" width="100%" height={60} sx={{ mt: 1, borderRadius: 1 }} />
        )}
      </Box>
    </Box>
  );
};

export default NotificationSkeleton;