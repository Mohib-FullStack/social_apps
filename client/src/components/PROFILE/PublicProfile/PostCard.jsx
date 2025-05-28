import { Avatar, Box, Button, Card, CardContent, CardHeader, Divider, Typography,IconButton } from '@mui/material';
import PropTypes from 'prop-types';
import { Comment, MoreVert, Share, ThumbUp } from '@mui/icons-material';

const PostCard = ({ post, profileImage }) => (
  <Card sx={{ mb: 3, borderRadius: 3, boxShadow: 2 }}>
    <CardHeader
      avatar={<Avatar src={profileImage} />}
      title={<Typography fontWeight="600">{post.author}</Typography>}
      subheader={post.date}
      action={
        <IconButton>
          <MoreVert />
        </IconButton>
      }
    />
    <CardContent sx={{ pt: 0 }}>
      <Typography paragraph>{post.content}</Typography>
      {post.image && (
        <Box sx={{ 
          borderRadius: 2, 
          overflow: 'hidden', 
          mb: 2,
          boxShadow: 1
        }}>
          <img 
            src={post.image} 
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
          {post.likes} likes • {post.comments} comments • {post.shares} shares
        </Typography>
      </Box>
      <Divider sx={{ my: 1.5 }} />
      <Box sx={{ display: 'flex', justifyContent: 'space-around' }}>
        <Button startIcon={<ThumbUp />} sx={{ color: 'text.secondary' }}>Like</Button>
        <Button startIcon={<Comment />} sx={{ color: 'text.secondary' }}>Comment</Button>
        <Button startIcon={<Share />} sx={{ color: 'text.secondary' }}>Share</Button>
      </Box>
    </CardContent>
  </Card>
);

PostCard.propTypes = {
  post: PropTypes.shape({
    id: PropTypes.number.isRequired,
    author: PropTypes.string.isRequired,
    content: PropTypes.string.isRequired,
    date: PropTypes.string.isRequired,
    likes: PropTypes.number.isRequired,
    comments: PropTypes.number.isRequired,
    shares: PropTypes.number.isRequired,
    image: PropTypes.string
  }).isRequired,
  profileImage: PropTypes.string.isRequired
};

export default PostCard;