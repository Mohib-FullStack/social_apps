import { Box, Card, Typography } from '@mui/material';
import PropTypes from 'prop-types';
import { Favorite as LikeIcon } from '@mui/icons-material';

const MediaCard = ({ imageUrl, likes }) => (
  <Card sx={{ 
    borderRadius: 2, 
    overflow: 'hidden', 
    boxShadow: 2,
    position: 'relative',
    '&:hover': {
      '& .media-overlay': {
        opacity: 1
      }
    }
  }}>
    <Box sx={{ position: 'relative', paddingTop: '100%' }}>
      <img 
        src={imageUrl} 
        alt="Media" 
        style={{ 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          width: '100%', 
          height: '100%', 
          objectFit: 'cover' 
        }} 
      />
      <Box 
        className="media-overlay"
        sx={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          bgcolor: 'rgba(0,0,0,0.5)',
          color: 'white',
          p: 1,
          opacity: 0,
          transition: 'opacity 0.3s'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <LikeIcon fontSize="small" sx={{ color: 'error.main' }} />
          <Typography variant="caption" sx={{ ml: 0.5 }}>
            {likes}
          </Typography>
        </Box>
      </Box>
    </Box>
  </Card>
);

MediaCard.propTypes = {
  imageUrl: PropTypes.string.isRequired,
  likes: PropTypes.number.isRequired
};

export default MediaCard;