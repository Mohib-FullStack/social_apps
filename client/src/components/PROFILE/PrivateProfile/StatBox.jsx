import { Box, Paper, Typography } from '@mui/material';

const StatBox = ({ icon, count, label }) => (
  <Paper elevation={0} sx={{ 
    p: 2, 
    textAlign: 'center',
    borderRadius: 2,
    bgcolor: 'background.paper',
    transition: 'all 0.3s ease',
    '&:hover': {
      transform: 'translateY(-4px)',
      boxShadow: 3,
    }
  }}>
    <Box sx={{ color: 'primary.main', fontSize: 32, mb: 1 }}>{icon}</Box>
    <Typography variant="h5" fontWeight="bold">{count}</Typography>
    <Typography variant="body2" color="text.secondary">{label}</Typography>
  </Paper>
);

export default StatBox;