import { Box, Skeleton } from '@mui/material';

const NotificationSkeleton = () => {
  return (
    <Box sx={{ display: 'flex', gap: 2, p: 2 }}>
      <Skeleton variant="circular" width={40} height={40} />
      <Box sx={{ flexGrow: 1 }}>
        <Skeleton variant="text" width="80%" height={20} />
        <Skeleton variant="text" width="60%" height={16} sx={{ mt: 1 }} />
        <Skeleton variant="rectangular" width="100%" height={100} sx={{ mt: 1, borderRadius: 1 }} />
      </Box>
    </Box>
  );
};

export default NotificationSkeleton;