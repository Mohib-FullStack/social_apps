import { Grid } from '@mui/material';
import StatBox from './StatBox';
import { PostAdd, People, Visibility } from '@mui/icons-material';

const ProfileStats = ({ userData }) => {
  return (
    <Grid container spacing={2} sx={{ mb: 4 }}>
      <Grid item xs={4}>
        <StatBox 
          icon={<PostAdd />} 
          count={userData.postsCount} 
          label="Posts" 
        />
      </Grid>
      <Grid item xs={4}>
        <StatBox 
          icon={<People />} 
          count={userData.friendsCount} 
          label="Friends" 
        />
      </Grid>
      <Grid item xs={4}>
        <StatBox 
          icon={<Visibility />} 
          count={userData.viewsCount} 
          label="Profile Views" 
        />
      </Grid>
    </Grid>
  );
};

export default ProfileStats;