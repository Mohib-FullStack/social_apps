import {
    PersonAdd as AddFriendIcon,
    Check as CheckIcon,
    Close as CloseIcon,
    ChatBubbleOutline as CommentIcon,
    Event as EventIcon,
    SportsEsports as GamesIcon,
    Group as GroupIcon,
    Home as HomeIcon,
    Message as MessageIcon,
    Mood as MoodIcon,
    MoreVert as MoreIcon,
    Notifications as NotificationsIcon,
    Person as PersonIcon,
    PhotoLibrary as PhotoLibraryIcon,
    Search as SearchIcon,
    Share as ShareIcon,
    Store as StoreIcon,
    ThumbUp,
    
    Videocam as VideocamIcon
} from '@mui/icons-material';
import {
    AppBar,
    Avatar,
    Badge,
    Box,
    Button,
    Card,
    CardActions,
    CardContent,
    CardHeader,
    Container,
    Divider,
    Grid,
    IconButton,
    InputBase,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Paper,
    styled,
    Toolbar,
    Typography
} from '@mui/material';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Profile from './Profile';


// Styled components
const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: '20ch',
    },
    backgroundColor: theme.palette.grey[100],
    borderRadius: theme.shape.borderRadius,
  },
}));

const ProfileHomePage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [posts, setPosts] = useState([]);
  const [friends, setFriends] = useState([]);
  const [friendRequests, setFriendRequests] = useState(3);

  // Mock data initialization
  useEffect(() => {
    const mockPosts = [
      {
        id: 1,
        user: {
          name: 'John Doe',
          avatar: '/static/images/avatar/1.jpg',
        },
        time: '3 hrs ago',
        content: 'Just finished my new project! So excited to share it with everyone.',
        likes: 24,
        comments: 8,
        shares: 2,
      },
      {
        id: 2,
        user: {
          name: 'Jane Smith',
          avatar: '/static/images/avatar/2.jpg',
        },
        time: '5 hrs ago',
        content: 'Beautiful day for a hike! Nature always helps me clear my mind.',
        image: '/static/images/hike.jpg',
        likes: 56,
        comments: 12,
        shares: 5,
      },
    ];

    const mockFriends = [
      { id: 1, name: 'Alex Johnson', mutualFriends: 4, status: 'friend' },
      { id: 2, name: 'Sarah Williams', mutualFriends: 10, status: 'friend' },
      { id: 3, name: 'Mike Brown', mutualFriends: 2, status: 'pending' },
      { id: 4, name: 'Emily Davis', mutualFriends: 7, status: 'pending' },
    ];

    setPosts(mockPosts);
    setFriends(mockFriends);
  }, []);

  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    if (query.length > 2) {
      const results = [
        { id: 1, name: 'Alex Johnson', avatar: '/static/images/avatar/3.jpg', mutualFriends: 4 },
        { id: 2, name: 'Sarah Williams', avatar: '/static/images/avatar/4.jpg', mutualFriends: 10 },
        { id: 3, name: 'Michael Chen', avatar: '/static/images/avatar/5.jpg', mutualFriends: 3 },
      ].filter(user => user.name.toLowerCase().includes(query.toLowerCase()));
      
      setSearchResults(results);
      setShowSearchResults(true);
    } else {
      setShowSearchResults(false);
    }
  };

  const handleFriendAction = (userId, action) => {
    if (action === 'add') {
      setFriends(friends.map(friend => 
        friend.id === userId ? { ...friend, status: 'pending' } : friend
      ));
      setFriendRequests(prev => prev + 1);
    } else if (action === 'confirm') {
      setFriends(friends.map(friend => 
        friend.id === userId ? { ...friend, status: 'friend' } : friend
      ));
      setFriendRequests(prev => prev - 1);
    } else if (action === 'delete') {
      setFriends(friends.filter(friend => friend.id !== userId));
      setFriendRequests(prev => prev - 1);
    }
  };

  const handleLogout = () => {
    // In a real app, you would clear auth tokens/user data here
    navigate('/login');
  };

  const handleCreatePost = () => {
    // In a real app, this would open a post creation dialog
    console.log('Create post clicked');
  };

  return (
    <Box sx={{ flexGrow: 1, bgcolor: 'background.default' }}>
      {/* Header/Navbar */}
      <AppBar position="sticky" color="inherit" elevation={1}>
        <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 1, sm: 2 } }}>
          {/* Left side - Logo and Search */}
          <Box sx={{ display: 'flex', alignItems: 'center', flex: 1, maxWidth: 600 }}>
            <Typography 
              variant="h6" 
              component="div" 
              sx={{ 
                fontWeight: 700, 
                color: 'primary.main',
                mr: 2,
                display: { xs: 'none', sm: 'block' }
              }}
            >
              SocialApp
            </Typography>
            
            <Box sx={{ position: 'relative', flex: 1 }}>
              <Box sx={{ 
                position: 'absolute', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                left: 12,
                top: '50%',
                transform: 'translateY(-50%)',
                zIndex: 1,
                color: 'text.secondary'
              }}>
                <SearchIcon />
              </Box>
              <StyledInputBase
                placeholder="Search SocialApp"
                inputProps={{ 'aria-label': 'search' }}
                value={searchQuery}
                onChange={handleSearch}
                sx={{ width: '100%' }}
              />
              
              {/* Search results dropdown */}
              {showSearchResults && searchResults.length > 0 && (
                <Paper 
                  sx={{ 
                    position: 'absolute', 
                    top: '100%', 
                    left: 0, 
                    right: 0, 
                    mt: 1, 
                    zIndex: 10,
                    maxHeight: 400,
                    overflow: 'auto',
                    boxShadow: 3
                  }}
                >
                  <List>
                    {searchResults.map((user) => (
                      <ListItem 
                        key={user.id} 
                        button
                        onClick={() => {
                          setShowSearchResults(false);
                          setSearchQuery('');
                          // In a real app, navigate to user profile
                        }}
                        sx={{ '&:hover': { bgcolor: 'action.hover' } }}
                      >
                        <ListItemAvatar>
                          <Avatar src={user.avatar} />
                        </ListItemAvatar>
                        <ListItemText 
                          primary={user.name} 
                          secondary={`${user.mutualFriends} mutual friends`} 
                        />
                        <Button 
                          size="small" 
                          variant="contained" 
                          startIcon={<AddFriendIcon />}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleFriendAction(user.id, 'add');
                          }}
                          sx={{ whiteSpace: 'nowrap' }}
                        >
                          Add Friend
                        </Button>
                      </ListItem>
                    ))}
                  </List>
                </Paper>
              )}
            </Box>
          </Box>
          
          {/* Middle - Navigation icons (hidden on small screens) */}
          <Box sx={{ 
            display: { xs: 'none', md: 'flex' }, 
            gap: 0.5,
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)'
          }}>
            <IconButton size="large" color="inherit" sx={{ p: 2 }}>
              <HomeIcon color="primary" fontSize="medium" />
            </IconButton>
            <IconButton size="large" color="inherit" sx={{ p: 2 }}>
              <GroupIcon fontSize="medium" />
            </IconButton>
            <IconButton size="large" color="inherit" sx={{ p: 2 }}>
              <StoreIcon fontSize="medium" />
            </IconButton>
            <IconButton size="large" color="inherit" sx={{ p: 2 }}>
              <GamesIcon fontSize="medium" />
            </IconButton>
          </Box>
          
          {/* Right side - User controls */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 0.5,
            justifyContent: 'flex-end',
            flex: 1,
            maxWidth: 600
          }}>
            <IconButton size="large" color="inherit">
              <Badge badgeContent={friendRequests} color="error">
                <NotificationsIcon fontSize="medium" />
              </Badge>
            </IconButton>
            <IconButton size="large" color="inherit">
              <MessageIcon fontSize="medium" />
            </IconButton>
            <IconButton 
              size="large" 
              color="inherit" 
              onClick={handleLogout}
              sx={{ p: 0.5 }}
            >
              <Avatar 
                src="/static/images/avatar/5.jpg" 
                sx={{ width: 32, height: 32 }} 
              />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Container maxWidth="lg" sx={{ mt: 2, pb: 3 }}>
        <Grid container spacing={2}>
          {/* Left Sidebar */}
          <Grid item xs={12} md={3}>
            <Card sx={{ mb: 2, borderRadius: 2 }}>
              <CardHeader
                avatar={
                  <Avatar 
                    src="/static/images/avatar/5.jpg" 
                    sx={{ width: 56, height: 56 }} 
                  />
                }
                title="Your Name"
                subheader="See your profile"
                sx={{ '& .MuiCardHeader-subheader': { color: 'text.secondary' } }}
              />
            </Card>
            
            <Card sx={{ mb: 2, borderRadius: 2 }}>
              <List>
                <ListItem button sx={{ borderRadius: 1 }}>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'primary.light' }}>
                      <PersonIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText 
                    primary="Friends" 
                    primaryTypographyProps={{ fontWeight: 'medium' }}
                  />
                </ListItem>
                <ListItem button sx={{ borderRadius: 1 }}>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'secondary.light' }}>
                      <GroupIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText 
                    primary="Groups" 
                    primaryTypographyProps={{ fontWeight: 'medium' }}
                  />
                </ListItem>
                <ListItem button sx={{ borderRadius: 1 }}>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'success.light' }}>
                      <StoreIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText 
                    primary="Marketplace" 
                    primaryTypographyProps={{ fontWeight: 'medium' }}
                  />
                </ListItem>
              </List>
            </Card>
            
            <Card sx={{ borderRadius: 2 }}>
              <CardHeader
                title="Your Shortcuts"
                titleTypographyProps={{ variant: 'subtitle1', fontWeight: 'bold' }}
                action={
                  <IconButton size="small">
                    <MoreIcon />
                  </IconButton>
                }
                sx={{ py: 1.5 }}
              />
              <List>
                <ListItem button sx={{ borderRadius: 1 }}>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'warning.light' }}>
                      <GamesIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText 
                    primary="Gaming" 
                    primaryTypographyProps={{ fontWeight: 'medium' }}
                  />
                </ListItem>
                <ListItem button sx={{ borderRadius: 1 }}>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'info.light' }}>
                      <EventIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText 
                    primary="Events" 
                    primaryTypographyProps={{ fontWeight: 'medium' }}
                  />
                </ListItem>
              </List>
            </Card>
          </Grid>
          
          {/* Middle - Feed */}
          <Grid item xs={12} md={6}>
            {/* Create Post */}
            <Card sx={{ mb: 2, borderRadius: 2 }}>
              <CardContent sx={{ py: 2, px: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar 
                    src="/static/images/avatar/5.jpg" 
                    sx={{ mr: 1.5, width: 40, height: 40 }} 
                  />
                  <InputBase
                    fullWidth
                    placeholder="What's on your mind?"
                    onClick={handleCreatePost}
                    sx={{
                      backgroundColor: 'grey.100',
                      borderRadius: '20px',
                      px: 2,
                      py: 1,
                      '&:hover': { backgroundColor: 'grey.200' }
                    }}
                  />
                </Box>
              </CardContent>
              <Divider />
              <CardActions sx={{ justifyContent: 'space-around', py: 0.5 }}>
                <Button 
                  startIcon={<VideocamIcon color="error" />}
                  sx={{ color: 'text.secondary', fontWeight: 'medium' }}
                >
                  Live Video
                </Button>
                <Button 
                  startIcon={<PhotoLibraryIcon color="success" />}
                  sx={{ color: 'text.secondary', fontWeight: 'medium' }}
                >
                  Photo/Video
                </Button>
                <Button 
                  startIcon={<MoodIcon color="warning" />}
                  sx={{ color: 'text.secondary', fontWeight: 'medium' }}
                >
                  Feeling/Activity
                </Button>
              </CardActions>
            </Card>
            
            {/* Posts Feed */}
            {posts.map((post) => (
              <Card key={post.id} sx={{ mb: 2, borderRadius: 2 }}>
                <CardHeader
                  avatar={<Avatar src={post.user.avatar} />}
                  action={
                    <IconButton>
                      <MoreIcon />
                    </IconButton>
                  }
                  title={post.user.name}
                  subheader={post.time}
                  sx={{ '& .MuiCardHeader-subheader': { color: 'text.secondary' } }}
                />
                <CardContent sx={{ py: 0 }}>
                  <Typography variant="body1" paragraph>
                    {post.content}
                  </Typography>
                  {post.image && (
                    <Box 
                      component="img"
                      src={post.image}
                      alt="Post content"
                      sx={{ 
                        width: '100%', 
                        borderRadius: 1,
                        maxHeight: 500,
                        objectFit: 'cover',
                        mt: 1
                      }}
                    />
                  )}
                </CardContent>
                <CardContent sx={{ py: 1 }}>
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <ThumbUp color="primary" fontSize="small" />
                      <Typography variant="body2" color="text.secondary" sx={{ ml: 0.5 }}>
                        {post.likes}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {post.comments} comments • {post.shares} shares
                    </Typography>
                  </Box>
                </CardContent>
                <Divider />
                <CardActions sx={{ justifyContent: 'space-around', py: 0.5 }}>
                  <Button 
                    startIcon={<ThumbUp />}
                    sx={{ color: 'text.secondary', fontWeight: 'medium' }}
                  >
                    Like
                  </Button>
                  <Button 
                    startIcon={<CommentIcon />}
                    sx={{ color: 'text.secondary', fontWeight: 'medium' }}
                  >
                    Comment
                  </Button>
                  <Button 
                    startIcon={<ShareIcon />}
                    sx={{ color: 'text.secondary', fontWeight: 'medium' }}
                  >
                    Share
                  </Button>
                </CardActions>
              </Card>
            ))}
          </Grid>
          
          {/* Right Sidebar - Contacts/Sponsored */}
          <Grid item xs={12} md={3}>
            <Card sx={{ mb: 2, borderRadius: 2 }}>
              <CardHeader
                title="Friend Requests"
                titleTypographyProps={{ variant: 'subtitle1', fontWeight: 'bold' }}
                action={
                  <IconButton size="small">
                    <MoreIcon />
                  </IconButton>
                }
                sx={{ py: 1.5 }}
              />
              <List>
                {friends.filter(f => f.status === 'pending').map((friend) => (
                  <ListItem key={friend.id} sx={{ py: 1 }}>
                    <ListItemAvatar>
                      <Avatar src={`/static/images/avatar/${friend.id + 5}.jpg`} />
                    </ListItemAvatar>
                    <ListItemText 
                      primary={friend.name}
                      primaryTypographyProps={{ fontWeight: 'medium' }}
                      secondary={`${friend.mutualFriends} mutual friends`}
                      sx={{ mr: 1 }}
                    />
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <IconButton 
                        size="small"
                        color="primary"
                        onClick={() => handleFriendAction(friend.id, 'confirm')}
                        sx={{ bgcolor: 'primary.light' }}
                      >
                        <CheckIcon fontSize="small" />
                      </IconButton>
                      <IconButton 
                        size="small"
                        color="error"
                        onClick={() => handleFriendAction(friend.id, 'delete')}
                        sx={{ bgcolor: 'error.light' }}
                      >
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </ListItem>
                ))}
              </List>
              <Button fullWidth sx={{ color: 'primary.main' }}>See All</Button>
            </Card>
            
            <Card sx={{ borderRadius: 2 }}>
              <CardHeader
                title="Contacts"
                titleTypographyProps={{ variant: 'subtitle1', fontWeight: 'bold' }}
                action={
                  <IconButton size="small">
                    <MoreIcon />
                  </IconButton>
                }
                sx={{ py: 1.5 }}
              />
              <List sx={{ py: 0 }}>
                {friends.filter(f => f.status === 'friend').map((friend) => (
                  <ListItem 
                    button 
                    key={friend.id} 
                    sx={{ 
                      py: 1,
                      borderRadius: 1,
                      '&:hover': { bgcolor: 'action.hover' }
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar src={`/static/images/avatar/${friend.id + 5}.jpg`} />
                    </ListItemAvatar>
                    <ListItemText 
                      primary={friend.name}
                      primaryTypographyProps={{ fontWeight: 'medium' }}
                    />
                  </ListItem>
                ))}
              </List>
            </Card>
          </Grid>
        </Grid>
      </Container>
      <Profile/>
    </Box>
    
  );
};

export default ProfileHomePage;