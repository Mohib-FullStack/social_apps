import { Box, Button, Card, Typography } from '@mui/material';
import PropTypes from 'prop-types';

const FriendCard = ({ friend }) => (
  <Card sx={{ borderRadius: 2, overflow: 'hidden', boxShadow: 2 }}>
    <Box sx={{ position: 'relative', paddingTop: '75%' }}>
      <img 
        src={friend.avatar} 
        alt={friend.name} 
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
      <Typography fontWeight="600">{friend.name}</Typography>
      {friend.mutual > 0 && (
        <Typography variant="caption" color="text.secondary">
          {friend.mutual} mutual friend{friend.mutual !== 1 ? 's' : ''}
        </Typography>
      )}
      <Button 
        variant="contained" 
        size="small" 
        fullWidth 
        sx={{ mt: 1 }}
      >
        {friend.mutual > 0 ? 'Add Friend' : 'Follow'}
      </Button>
    </Box>
  </Card>
);

FriendCard.propTypes = {
  friend: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    avatar: PropTypes.string.isRequired,
    mutual: PropTypes.number.isRequired
  }).isRequired
};

export default FriendCard;