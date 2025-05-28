import { Box, Typography } from '@mui/material';
import PropTypes from 'prop-types';

const StatBox = ({ icon, count, label }) => (
  <Box sx={{ 
    display: 'flex', 
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    p: 1.5,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.1)',
    minWidth: 80,
    backdropFilter: 'blur(5px)',
    boxShadow: 1,
    transition: 'transform 0.2s',
    '&:hover': {
      transform: 'translateY(-3px)'
    }
  }}>
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
      {icon}
      <Typography variant="h6" fontWeight="bold" sx={{ ml: 0.5 }}>{count}</Typography>
    </Box>
    <Typography variant="caption" color="text.secondary">{label}</Typography>
  </Box>
);

StatBox.propTypes = {
  icon: PropTypes.node.isRequired,
  count: PropTypes.number.isRequired,
  label: PropTypes.string.isRequired
};

export default StatBox;