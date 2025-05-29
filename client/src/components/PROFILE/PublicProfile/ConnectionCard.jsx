import { Box, Button, Card, Typography } from '@mui/material';
import PropTypes from 'prop-types';

const ConnectionCard = ({ name, avatar, mutual }) => (
  <Card sx={{ 
    borderRadius: 2, 
    overflow: 'hidden', 
    boxShadow: 2,
    transition: 'transform 0.2s',
    '&:hover': {
      transform: 'translateY(-4px)'
    }
  }}>
    <Box sx={{ position: 'relative', paddingTop: '100%' }}>
      <img 
        src={avatar} 
        alt={name} 
        style={{ 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          width: '100%', 
          height: '100%', 
          objectFit: 'cover' 
        }} 
      />
    </Box>
    <Box sx={{ p: 1.5 }}>
      <Typography fontWeight="600" noWrap>{name}</Typography>
      {mutual > 0 && (
        <Typography variant="caption" color="text.secondary">
          {mutual} mutual connection{mutual !== 1 ? 's' : ''}
        </Typography>
      )}
      <Button 
        variant="contained" 
        size="small" 
        fullWidth 
        sx={{ 
          mt: 1,
          background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
          color: 'white'
        }}
      >
        {mutual > 0 ? 'Connect' : 'Follow'}
      </Button>
    </Box>
  </Card>
);

ConnectionCard.propTypes = {
  name: PropTypes.string.isRequired,
  avatar: PropTypes.string.isRequired,
  mutual: PropTypes.number.isRequired
};

export default ConnectionCard;