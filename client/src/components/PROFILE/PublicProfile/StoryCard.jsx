import { Avatar, Box, Button, Card, CardContent, Divider } from '@mui/material';
import PropTypes from 'prop-types';
import {
  AddReaction as MoodIcon,
  Videocam as VideoIcon,
  PhotoCamera as PhotoIcon
} from '@mui/icons-material';

const StoryCard = ({ profileImage, onPostClick }) => (
  <Card sx={{ 
    mb: 3, 
    borderRadius: 3, 
    boxShadow: 2,
    overflow: 'visible'
  }}>
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Avatar src={profileImage} sx={{ mr: 2 }} />
        <Button 
          fullWidth 
          variant="outlined" 
          sx={{ 
            justifyContent: 'flex-start',
            borderRadius: 3,
            backgroundColor: 'background.paper',
            textTransform: 'none',
            color: 'text.primary',
            '&:hover': {
              backgroundColor: 'action.hover'
            }
          }}
          onClick={onPostClick}
        >
          Share your thoughts...
        </Button>
      </Box>
      <Divider />
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-around', 
        pt: 1,
        '& .MuiButton-root': {
          borderRadius: 2,
          textTransform: 'none'
        }
      }}>
        <Button 
          startIcon={<PhotoIcon color="success" />}
          sx={{ color: 'text.secondary' }}
        >
          Photo
        </Button>
        <Button 
          startIcon={<VideoIcon color="error" />}
          sx={{ color: 'text.secondary' }}
        >
          Video
        </Button>
        <Button 
          startIcon={<MoodIcon color="warning" />}
          sx={{ color: 'text.secondary' }}
        >
          Feeling
        </Button>
      </Box>
    </CardContent>
  </Card>
);

StoryCard.propTypes = {
  profileImage: PropTypes.string.isRequired,
  onPostClick: PropTypes.func.isRequired
};

export default StoryCard;