import {
  ChatBubble as CommentIcon,
  Favorite as LikeIcon,
  MoreVert as MoreIcon,
  Share as ShareIcon
} from '@mui/icons-material';
import { Avatar, Box, Button, Card, CardContent, CardHeader, Divider, IconButton, Typography } from '@mui/material';
import PropTypes from 'prop-types';

const PostCard = ({ author, content, date, likes, comments, shares, image, profileImage }) => (
  <Card sx={{ 
    mb: 3, 
    borderRadius: 3, 
    boxShadow: 2,
    '&:hover': {
      boxShadow: 4
    }
  }}>
    <CardHeader
      avatar={<Avatar src={profileImage} />}
      title={<Typography fontWeight="600">{author}</Typography>}
      subheader={date}
      action={
        <IconButton>
          <MoreIcon />
        </IconButton>
      }
    />
    <CardContent sx={{ pt: 0 }}>
      <Typography paragraph sx={{ mb: 2 }}>{content}</Typography>
      {image && (
        <Box sx={{ 
          borderRadius: 2, 
          overflow: 'hidden', 
          mb: 2,
          boxShadow: 1
        }}>
          <img 
            src={image} 
            alt="Post" 
            style={{ 
              width: '100%', 
              maxHeight: 400, 
              objectFit: 'cover' 
            }} 
          />
        </Box>
      )}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', color: 'text.secondary' }}>
        <Typography variant="body2">
          {likes} reactions • {comments} comments • {shares} shares
        </Typography>
      </Box>
      <Divider sx={{ my: 1.5 }} />
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-around',
        '& .MuiButton-root': {
          borderRadius: 2,
          textTransform: 'none'
        }
      }}>
        <Button 
          startIcon={<LikeIcon color="error" />}
          sx={{ color: 'text.secondary' }}
        >
          Like
        </Button>
        <Button 
          startIcon={<CommentIcon color="info" />}
          sx={{ color: 'text.secondary' }}
        >
          Comment
        </Button>
        <Button 
          startIcon={<ShareIcon color="success" />}
          sx={{ color: 'text.secondary' }}
        >
          Share
        </Button>
      </Box>
    </CardContent>
  </Card>
);

PostCard.propTypes = {
  author: PropTypes.string.isRequired,
  content: PropTypes.string.isRequired,
  date: PropTypes.string.isRequired,
  likes: PropTypes.number.isRequired,
  comments: PropTypes.number.isRequired,
  shares: PropTypes.number.isRequired,
  image: PropTypes.string,
  profileImage: PropTypes.string.isRequired
};

export default PostCard;










