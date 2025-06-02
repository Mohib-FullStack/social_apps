import { Skeleton, Box } from '@mui/material';

const ProfileSkeleton = () => {
  return (
    <Box sx={{ width: '100%' }}>
      {/* Cover Photo Skeleton */}
      <Skeleton 
        variant="rectangular" 
        width="100%" 
        height={200} 
        sx={{ bgcolor: 'grey.300' }} 
      />
      
      {/* Profile Info Section Skeleton */}
      <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Skeleton 
          variant="circular" 
          width={120} 
          height={120} 
          sx={{ 
            bgcolor: 'grey.300',
            mt: -6,
            mb: 2
          }} 
        />
        <Skeleton variant="text" width="60%" height={40} sx={{ bgcolor: 'grey.300' }} />
        <Skeleton variant="text" width="40%" height={30} sx={{ bgcolor: 'grey.300', mt: 1 }} />
      </Box>
      
      {/* Stats Skeleton */}
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 4, mb: 3 }}>
        <Skeleton variant="text" width={60} height={50} sx={{ bgcolor: 'grey.300' }} />
        <Skeleton variant="text" width={60} height={50} sx={{ bgcolor: 'grey.300' }} />
        <Skeleton variant="text" width={60} height={50} sx={{ bgcolor: 'grey.300' }} />
      </Box>
      
      {/* Tabs Skeleton */}
      <Box sx={{ p: 2 }}>
        <Skeleton variant="rectangular" width="100%" height={300} sx={{ bgcolor: 'grey.300' }} />
      </Box>
    </Box>
  );
};

export default ProfileSkeleton;