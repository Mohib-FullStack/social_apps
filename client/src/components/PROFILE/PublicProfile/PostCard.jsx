import {
  ChatBubble as CommentIcon,
  Favorite as LikeIcon,
  MoreVert as MoreIcon,
  Share as ShareIcon
} from '@mui/icons-material';
import { Avatar, Box, Button, Card, CardContent, CardHeader, Divider, Typography,IconButton } from '@mui/material';
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
          React
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










// import { Avatar, Box, Button, Card, CardContent, CardHeader, Divider, Typography,IconButton } from '@mui/material';
// import PropTypes from 'prop-types';
// import { Comment, MoreVert, Share, ThumbUp } from '@mui/icons-material';

// const PostCard = ({ post, profileImage }) => (
//   <Card sx={{ mb: 3, borderRadius: 3, boxShadow: 2 }}>
//     <CardHeader
//       avatar={<Avatar src={profileImage} />}
//       title={<Typography fontWeight="600">{post.author}</Typography>}
//       subheader={post.date}
//       action={
//         <IconButton>
//           <MoreVert />
//         </IconButton>
//       }
//     />
//     <CardContent sx={{ pt: 0 }}>
//       <Typography paragraph>{post.content}</Typography>
//       {post.image && (
//         <Box sx={{ 
//           borderRadius: 2, 
//           overflow: 'hidden', 
//           mb: 2,
//           boxShadow: 1
//         }}>
//           <img 
//             src={post.image} 
//             alt="Post" 
//             style={{ 
//               width: '100%', 
//               maxHeight: 400, 
//               objectFit: 'cover' 
//             }} 
//           />
//         </Box>
//       )}
//       <Box sx={{ display: 'flex', justifyContent: 'space-between', color: 'text.secondary' }}>
//         <Typography variant="body2">
//           {post.likes} likes • {post.comments} comments • {post.shares} shares
//         </Typography>
//       </Box>
//       <Divider sx={{ my: 1.5 }} />
//       <Box sx={{ display: 'flex', justifyContent: 'space-around' }}>
//         <Button startIcon={<ThumbUp />} sx={{ color: 'text.secondary' }}>Like</Button>
//         <Button startIcon={<Comment />} sx={{ color: 'text.secondary' }}>Comment</Button>
//         <Button startIcon={<Share />} sx={{ color: 'text.secondary' }}>Share</Button>
//       </Box>
//     </CardContent>
//   </Card>
// );

// PostCard.propTypes = {
//   post: PropTypes.shape({
//     id: PropTypes.number.isRequired,
//     author: PropTypes.string.isRequired,
//     content: PropTypes.string.isRequired,
//     date: PropTypes.string.isRequired,
//     likes: PropTypes.number.isRequired,
//     comments: PropTypes.number.isRequired,
//     shares: PropTypes.number.isRequired,
//     image: PropTypes.string
//   }).isRequired,
//   profileImage: PropTypes.string.isRequired
// };

// export default PostCard;