import { Box, Card, Typography } from '@mui/material';
import PropTypes from 'prop-types';
import { ThumbUp } from '@mui/icons-material';

const PhotoCard = ({ photo }) => (
  <Card sx={{ borderRadius: 2, overflow: 'hidden', boxShadow: 2 }}>
    <Box sx={{ position: 'relative', paddingTop: '100%' }}>
      <img 
        src={photo.url} 
        alt={photo.caption} 
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
      <Typography variant="subtitle2">{photo.caption}</Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
        <ThumbUp fontSize="small" color="action" />
        <Typography variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>
          {photo.likes}
        </Typography>
      </Box>
    </Box>
  </Card>
);

PhotoCard.propTypes = {
  photo: PropTypes.shape({
    id: PropTypes.number.isRequired,
    url: PropTypes.string.isRequired,
    caption: PropTypes.string.isRequired,
    likes: PropTypes.number.isRequired
  }).isRequired
};

export default PhotoCard;