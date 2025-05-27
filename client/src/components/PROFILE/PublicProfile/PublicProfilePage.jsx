//! refactored
import {
  Add,
  Cake,
  CameraAlt,
  Comment,
  Edit,
  Email,
  Feed as FeedIcon,
  Groups,
  Info as InfoIcon,
  Link as LinkIcon,
  LocationOn,
  MoreVert,
  People as PeopleIcon,
  PhotoLibrary as PhotoLibraryIcon,
  PostAdd as PostIcon,
  Share,
  ThumbUp,
  Verified as VerifiedIcon,
  VideoLibrary as VideoLibraryIcon,
  Work
} from '@mui/icons-material';
import {
  Avatar,
  Backdrop,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  Link,
  Menu,
  MenuItem,
  Tab,
  Tabs,
  Typography,
  useTheme
} from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchPublicProfile } from '../../../features/user/userSlice';

// Reusable components
const StatBox = ({ icon, count, label, theme }) => (
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
    boxShadow: theme.shadows[1],
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

const InfoItem = ({ icon, label, value, isLink = false }) => (
  <Box sx={{ display: 'flex', mb: 2 }}>
    <Box sx={{ mr: 2, color: 'text.secondary' }}>{icon}</Box>
    <Box>
      <Typography variant="subtitle2" color="text.secondary">{label}</Typography>
      {isLink ? (
        <Link href={value.startsWith('http') ? value : `https://${value}`} target="_blank" rel="noopener">
          {value}
        </Link>
      ) : (
        <Typography variant="body1">{value}</Typography>
      )}
    </Box>
  </Box>
);

const PostCard = ({ post, profileImage, theme }) => (
  <Card sx={{ mb: 3, borderRadius: 3, boxShadow: theme.shadows[2] }}>
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
          boxShadow: theme.shadows[1]
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

const PhotoCard = ({ photo, theme }) => (
  <Card sx={{ borderRadius: 2, overflow: 'hidden', boxShadow: theme.shadows[2] }}>
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

const FriendCard = ({ friend, theme }) => (
  <Card sx={{ borderRadius: 2, overflow: 'hidden', boxShadow: theme.shadows[2] }}>
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

const PublicProfilePage = () => {
  const theme = useTheme();
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const {
    publicProfile,
    publicProfileStatus: status,
    publicProfileError: error,
    updatePhotoStatus
  } = useSelector((state) => state.user);
  
  const { user } = useSelector((state) => state.user);
  const [tabValue, setTabValue] = useState(0);
  const [coverHover, setCoverHover] = useState(false);
  const [profileHover, setProfileHover] = useState(false);
  const [showCoverDialog, setShowCoverDialog] = useState(false);
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const [imageToCrop, setImageToCrop] = useState(null);
  const [croppedImage, setCroppedImage] = useState(null);
  const [uploadType, setUploadType] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const coverInputRef = useRef(null);
  const profileInputRef = useRef(null);

  // Add this safety check to prevent rare edge cases
  useEffect(() => {
    if (!id || id === 'undefined') {
      navigate(user?.id ? `/profile/public/${user.id}` : '/');
      return;
    }
    
    if (id === 'me' && user?.id) {
      navigate(`/profile/public/${user.id}`, { replace: true });
      return;
    }

    // Only fetch if ID is a positive number
    if (/^\d+$/.test(id)) {
      dispatch(fetchPublicProfile(id));
    } else {
      navigate('/error/invalid-profile');
    }
  }, [id, user?.id, dispatch, navigate]);

  useEffect(() => {
    if (error && error.status === 400 && error.message.includes('Invalid user ID')) {
      if (user?.id) {
        navigate(`/profile/public/${user.id}`, { replace: true });
      } else {
        navigate('/');
      }
    }
  }, [error, navigate, user?.id]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleRetry = () => {
    dispatch(fetchPublicProfile(id));
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleCoverPhotoClick = () => {
    if (isOwnProfile) {
      coverInputRef.current.click();
    }
  };

  const handleProfilePhotoClick = () => {
    if (isOwnProfile) {
      profileInputRef.current.click();
    }
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      setUploadType(type);
      const reader = new FileReader();
      reader.onload = () => {
        setImageToCrop(reader.result);
        if (type === 'cover') {
          setShowCoverDialog(true);
        } else {
          setShowProfileDialog(true);
        }
      };
      reader.readAsDataURL(file);
    }
    e.target.value = null;
  };

  if (status === 'loading') {
    return (
      <Backdrop open={true} sx={{ zIndex: theme.zIndex.drawer + 1, color: '#fff' }}>
        <CircularProgress color="inherit" />
      </Backdrop>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Card sx={{ 
          backgroundColor: 'error.light', 
          p: 3, 
          borderRadius: 2,
          mb: 3,
          boxShadow: theme.shadows[4]
        }}>
          <Typography variant="h6" color="error.contrastText">Failed to load profile</Typography>
          <Typography color="error.contrastText">Error: {error.message || 'Unknown error'}</Typography>
        </Card>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant="contained" onClick={() => navigate('/')}>
            Go Home
          </Button>
          <Button variant="outlined" onClick={handleRetry}>
            Try Again
          </Button>
        </Box>
      </Container>
    );
  }

  if (!publicProfile) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Card sx={{ 
          backgroundColor: 'warning.light', 
          p: 3, 
          borderRadius: 2,
          mb: 3,
          boxShadow: theme.shadows[3]
        }}>
          <Typography variant="h6" color="warning.contrastText">Profile not found</Typography>
        </Card>
        <Button variant="contained" onClick={() => navigate('/')}>
          Return Home
        </Button>
      </Container>
    );
  }

  const isOwnProfile = user?.id === publicProfile.id;
  const formattedDate = publicProfile.birthDate
    ? new Date(publicProfile.birthDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : null;

  const profileImage = publicProfile.profileImage || '/default-avatar.png';
  const coverImage = publicProfile.coverImage || '/default-cover.jpg';

  // Mock data
  const posts = [
    { 
      id: 1, 
      author: `${publicProfile.firstName} ${publicProfile.lastName}`,
      content: "Just visited the new art museum!", 
      date: "2 hours ago", 
      likes: 24, 
      comments: 5,
      shares: 2,
      image: '/post1.jpg'
    },
    { 
      id: 2, 
      author: `${publicProfile.firstName} ${publicProfile.lastName}`,
      content: "Working on a new project", 
      date: "1 day ago", 
      likes: 12, 
      comments: 3,
      shares: 0
    }
  ];

  const photos = [
    { id: 1, url: "/photo1.jpg", caption: "Vacation", likes: 15 },
    { id: 2, url: "/photo2.jpg", caption: "Friends", likes: 23 },
    { id: 3, url: "/photo3.jpg", caption: "Conference", likes: 8 }
  ];

  const friends = Array(8).fill(0).map((_, i) => ({
    id: i + 1,
    name: `Friend ${i + 1}`,
    avatar: `/avatar${(i % 3) + 1}.jpg`,
    mutual: i % 2 === 0 ? Math.floor(Math.random() * 10) + 1 : 0
  }));

  const aboutInfo = [
    { icon: <Work />, label: "Works at", value: publicProfile.company || "Not specified" },
    { icon: <LocationOn />, label: "Lives in", value: publicProfile.location || "Not specified" },
    { icon: <Email />, label: "Email", value: publicProfile.email || "Not specified" },
    { icon: <LinkIcon />, label: "Website", value: publicProfile.website || "Not specified", isLink: true },
    { icon: <Cake />, label: "Birthday", value: formattedDate || "Not specified" }
  ];

  return (
    <ThemeProvider theme={theme}>
      <Container maxWidth="lg" sx={{ mt: 0, mb: 4 }}>
        {/* Hidden file inputs */}
        <input
          type="file"
          ref={coverInputRef}
          onChange={(e) => handleFileChange(e, 'cover')}
          accept="image/*"
          style={{ display: 'none' }}
        />
        <input
          type="file"
          ref={profileInputRef}
          onChange={(e) => handleFileChange(e, 'profile')}
          accept="image/*"
          style={{ display: 'none' }}
        />

        {/* Cover Photo Section */}
        <Box sx={{ position: 'relative', mb: 10 }}>
          <Box
            sx={{
              height: 350,
              backgroundImage: `url(${coverImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundColor: 'grey.200',
              borderRadius: '8px 8px 0 0',
              position: 'relative',
              cursor: isOwnProfile ? 'pointer' : 'default',
            }}
            onMouseEnter={() => isOwnProfile && setCoverHover(true)}
            onMouseLeave={() => isOwnProfile && setCoverHover(false)}
            onClick={handleCoverPhotoClick}
          >
            {coverHover && isOwnProfile && (
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 16,
                  right: 16,
                  backgroundColor: 'rgba(0,0,0,0.6)',
                  borderRadius: 1,
                  p: 1,
                  display: 'flex',
                  alignItems: 'center',
                  transition: 'opacity 0.3s'
                }}
              >
                <CameraAlt sx={{ color: 'white', mr: 1, fontSize: 20 }} />
                <Typography variant="body2" color="white" fontWeight="500">
                  Edit cover photo
                </Typography>
              </Box>
            )}
          </Box>
          
          {/* Profile Avatar and Info Section */}
          <Box sx={{ 
            position: 'absolute', 
            bottom: -60, 
            left: 16,
            right: 16,
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between'
          }}>
            {/* Left Side - Profile Picture and Name */}
            <Box sx={{ display: 'flex', alignItems: 'flex-end' }}>
              <Box 
                sx={{ position: 'relative', mr: 2 }}
                onMouseEnter={() => isOwnProfile && setProfileHover(true)}
                onMouseLeave={() => isOwnProfile && setProfileHover(false)}
              >
                <Avatar
                  src={profileImage}
                  sx={{
                    width: 168,
                    height: 168,
                    border: '4px solid white',
                    boxShadow: 3,
                    cursor: isOwnProfile ? 'pointer' : 'default',
                  }}
                  onClick={handleProfilePhotoClick}
                />
                {profileHover && isOwnProfile && (
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      backgroundColor: 'rgba(0,0,0,0.6)',
                      color: 'white',
                      textAlign: 'center',
                      py: 1,
                      borderBottomLeftRadius: 84,
                      borderBottomRightRadius: 84
                    }}
                  >
                    <CameraAlt fontSize="small" />
                    <Typography variant="caption">Update</Typography>
                  </Box>
                )}
              </Box>
              
              <Box>
                <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 0.5 }}>
                  {publicProfile.firstName} {publicProfile.lastName}
                  {publicProfile.isVerified && (
                    <VerifiedIcon color="primary" sx={{ ml: 1, fontSize: 'inherit' }} />
                  )}
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, mb: 1 }}>
                  <StatBox 
                    icon={<PeopleIcon fontSize="small" />} 
                    count={publicProfile.friendsCount || 0} 
                    label="Friends" 
                    theme={theme}
                  />
                  <StatBox 
                    icon={<PostIcon fontSize="small" />} 
                    count={posts.length} 
                    label="Posts" 
                    theme={theme}
                  />
                  <StatBox 
                    icon={<PhotoLibraryIcon fontSize="small" />} 
                    count={photos.length} 
                    label="Photos" 
                    theme={theme}
                  />
                </Box>
              </Box>
            </Box>
            
            {/* Right Side - Action Buttons */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
              {isOwnProfile ? (
                <>
                  <Button 
                    variant="contained" 
                    startIcon={<Add />}
                    sx={{ 
                      background: 'linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366)',
                      color: 'white',
                      '&:hover': {
                        background: 'linear-gradient(45deg, #e6683c, #dc2743, #cc2366, #bc1888)'
                      }
                    }}
                  >
                    Add to story
                  </Button>
                  <Button 
                    variant="contained" 
                    startIcon={<Edit />}
                    sx={{ 
                      backgroundColor: '#e4e6eb', 
                      color: '#050505',
                      '&:hover': {
                        backgroundColor: '#d8dadf'
                      }
                    }}
                    onClick={() => navigate(`/public-profile-update/${publicProfile.id}`)}
                  >
                    Edit profile
                  </Button>
                </>
              ) : (
                <>
                  <Button 
                    variant="contained" 
                    color="primary"
                    sx={{ 
                      fontWeight: 600,
                      boxShadow: 'none',
                      '&:hover': {
                        boxShadow: 'none',
                        backgroundColor: theme.palette.primary.dark
                      }
                    }}
                  >
                    {publicProfile.isFriend ? "Friends" : "Add Friend"}
                  </Button>
                  <Button 
                    variant="contained" 
                    sx={{ 
                      backgroundColor: '#e4e6eb', 
                      color: '#050505',
                      fontWeight: 600,
                      boxShadow: 'none',
                      '&:hover': {
                        backgroundColor: '#d8dadf',
                        boxShadow: 'none'
                      }
                    }}
                  >
                    Message
                  </Button>
                </>
              )}
              <IconButton 
                sx={{ 
                  backgroundColor: '#e4e6eb',
                  '&:hover': {
                    backgroundColor: '#d8dadf'
                  }
                }}
                onClick={handleMenuOpen}
              >
                <MoreVert sx={{ color: '#050505' }} />
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
              >
                <MenuItem onClick={() => {
                  handleMenuClose();
                  navigate('/about');
                }}>
                  About
                </MenuItem>
                <MenuItem onClick={handleMenuClose}>Report</MenuItem>
                {isOwnProfile && (
                  <MenuItem onClick={handleMenuClose}>Activity Log</MenuItem>
                )}
              </Menu>
            </Box>
          </Box>
        </Box>

        {/* Tabs Section */}
        <Box sx={{ 
          borderBottom: 1, 
          borderColor: 'divider', 
          mb: 3,
          '& .MuiTabs-indicator': {
            backgroundColor: theme.palette.primary.main,
            height: 3
          }
        }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            textColor="primary"
            sx={{
              '& .MuiTab-root': {
                minWidth: 120,
                fontWeight: 600,
                textTransform: 'none',
                fontSize: '0.9375rem',
                '&.Mui-selected': {
                  color: theme.palette.primary.main
                }
              }
            }}
          >
            <Tab label="Timeline" icon={<FeedIcon />} iconPosition="start" />
            <Tab label="About" icon={<InfoIcon />} iconPosition="start" />
            <Tab label="Friends" icon={<PeopleIcon />} iconPosition="start" />
            <Tab label="Photos" icon={<PhotoLibraryIcon />} iconPosition="start" />
            <Tab label="Videos" icon={<VideoLibraryIcon />} iconPosition="start" />
          </Tabs>
        </Box>

        {/* Main Content */}
        <Grid container spacing={3}>
          {/* Left Column */}
          <Grid item xs={12} md={4}>
            {/* Intro Card */}
            <Card sx={{ 
              mb: 3, 
              borderRadius: 2,
              boxShadow: theme.shadows[2]
            }}>
              <CardHeader 
                title="Intro" 
                titleTypographyProps={{ 
                  variant: 'h6',
                  fontWeight: 600
                }}
              />
              <CardContent>
                {aboutInfo.map((item, index) => (
                  <InfoItem 
                    key={index}
                    icon={item.icon}
                    label={item.label}
                    value={item.value}
                    isLink={item.isLink}
                  />
                ))}
                {isOwnProfile && (
                  <Button 
                    variant="outlined" 
                    fullWidth 
                    startIcon={<Edit />}
                    sx={{ mt: 1 }}
                  >
                    Edit Details
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Photos Card */}
            <Card sx={{ 
              mb: 3, 
              borderRadius: 2,
              boxShadow: theme.shadows[2]
            }}>
              <CardHeader 
                title="Photos" 
                titleTypographyProps={{ 
                  variant: 'h6',
                  fontWeight: 600
                }}
                action={
                  <Button color="primary">See All</Button>
                }
              />
              <CardContent>
                <Grid container spacing={1}>
                  {photos.slice(0, 6).map((photo) => (
                    <Grid item xs={4} key={photo.id}>
                      <PhotoCard photo={photo} theme={theme} />
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>

            {/* Friends Card */}
            <Card sx={{ 
              mb: 3, 
              borderRadius: 2,
              boxShadow: theme.shadows[2]
            }}>
              <CardHeader 
                title="Friends" 
                titleTypographyProps={{ 
                  variant: 'h6',
                  fontWeight: 600
                }}
                subheader={`${friends.length} friends`}
                action={
                  <Button color="primary">See All</Button>
                }
              />
              <CardContent>
                <Grid container spacing={2}>
                  {friends.slice(0, 6).map((friend) => (
                    <Grid item xs={6} key={friend.id}>
                      <FriendCard friend={friend} theme={theme} />
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Right Column */}
          <Grid item xs={12} md={8}>
            {/* Create Post Card (only for own profile) */}
            {isOwnProfile && (
              <Card sx={{ 
                mb: 3, 
                borderRadius: 2,
                boxShadow: theme.shadows[2]
              }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar src={profileImage} sx={{ mr: 2 }} />
                    <Button 
                      fullWidth 
                      variant="outlined" 
                      sx={{ 
                        justifyContent: 'flex-start',
                        borderRadius: 20,
                        backgroundColor: '#f0f2f5',
                        textTransform: 'none',
                        color: '#65676b'
                      }}
                      onClick={() => navigate('/create-post')}
                    >
                      What's on your mind?
                    </Button>
                  </Box>
                  <Divider />
                  <Box sx={{ display: 'flex', justifyContent: 'space-around', pt: 1 }}>
                    <Button 
                      startIcon={<VideoLibraryIcon color="error" />}
                      sx={{ color: '#65676b', textTransform: 'none' }}
                    >
                      Live Video
                    </Button>
                    <Button 
                      startIcon={<PhotoLibraryIcon color="success" />}
                      sx={{ color: '#65676b', textTransform: 'none' }}
                    >
                      Photo/Video
                    </Button>
                    <Button 
                      startIcon={<Groups color="warning" />}
                      sx={{ color: '#65676b', textTransform: 'none' }}
                    >
                      Feeling/Activity
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            )}

            {/* Posts */}
            {posts.length > 0 ? (
              posts.map((post) => (
                <PostCard 
                  key={post.id} 
                  post={post} 
                  profileImage={profileImage}
                  theme={theme}
                />
              ))
            ) : (
              <Card sx={{ 
                mb: 3, 
                borderRadius: 2,
                boxShadow: theme.shadows[2],
                textAlign: 'center',
                p: 4
              }}>
                <PhotoLibraryIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  {isOwnProfile ? "You haven't posted anything yet" : "No posts yet"}
                </Typography>
                <Typography color="text.secondary" sx={{ mb: 2 }}>
                  {isOwnProfile 
                    ? "Share your first post with your friends!" 
                    : "When this user posts, you'll see it here."}
                </Typography>
                {isOwnProfile && (
                  <Button 
                    variant="contained" 
                    startIcon={<Add />}
                    onClick={() => navigate('/create-post')}
                  >
                    Create Post
                  </Button>
                )}
              </Card>
            )}
          </Grid>
        </Grid>

        {/* Image Upload Dialogs */}
        <Dialog open={showCoverDialog} onClose={() => setShowCoverDialog(false)}>
          <DialogTitle>Edit Cover Photo</DialogTitle>
          <DialogContent>
            <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography>Image cropper would appear here</Typography>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowCoverDialog(false)}>Cancel</Button>
            <Button 
              variant="contained" 
              onClick={() => {
                setShowCoverDialog(false);
                // Handle cover photo update
              }}
            >
              Save
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog open={showProfileDialog} onClose={() => setShowProfileDialog(false)}>
          <DialogTitle>Edit Profile Photo</DialogTitle>
          <DialogContent>
            <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography>Image cropper would appear here</Typography>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowProfileDialog(false)}>Cancel</Button>
            <Button 
              variant="contained" 
              onClick={() => {
                setShowProfileDialog(false);
                // Handle profile photo update
              }}
            >
              Save
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </ThemeProvider>
  );
};

export default PublicProfilePage;







//! final
// import {
//   Add,
//   Cake,
//   CameraAlt,
//   Comment,
//   Edit,
//   Email,
//   Feed as FeedIcon,
//   Groups,
//   Info as InfoIcon,
//   Link as LinkIcon,
//   LocationOn,
//   MoreVert,
//   People as PeopleIcon,
//   PhotoLibrary as PhotoLibraryIcon,
//   PostAdd as PostIcon,
//   Share,
//   ThumbUp,
//   Verified as VerifiedIcon,
//   VideoLibrary as VideoLibraryIcon,
//   Work
// } from '@mui/icons-material';
// import {
//   Avatar,
//   Backdrop,
//   Box,
//   Button,
//   Card,
//   CardContent,
//   CardHeader,
//   CircularProgress,
//   Container,
//   Dialog,
//   DialogActions,
//   DialogContent,
//   DialogTitle,
//   Divider,
//   Grid,
//   IconButton,
//   Link,
//   Menu,
//   MenuItem,
//   Tab,
//   Tabs,
//   Typography,
//   useTheme
// } from '@mui/material';
// import { ThemeProvider } from '@mui/material/styles';
// import { useEffect, useRef, useState } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { useNavigate, useParams } from 'react-router-dom';
// import { fetchPublicProfile } from '../../../features/user/userSlice';

// const PublicProfilePage = () => {
//   const theme = useTheme();
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const dispatch = useDispatch();
  
//   const {
//     publicProfile,
//     publicProfileStatus: status,
//     publicProfileError: error,
//     updatePhotoStatus
//   } = useSelector((state) => state.user);
  
//   const { user } = useSelector((state) => state.user);
//   const [tabValue, setTabValue] = useState(0);
//   const [coverHover, setCoverHover] = useState(false);
//   const [profileHover, setProfileHover] = useState(false);
//   const [showCoverDialog, setShowCoverDialog] = useState(false);
//   const [showProfileDialog, setShowProfileDialog] = useState(false);
//   const [imageToCrop, setImageToCrop] = useState(null);
//   const [croppedImage, setCroppedImage] = useState(null);
//   const [uploadType, setUploadType] = useState(null);
//   const [anchorEl, setAnchorEl] = useState(null);
//   const coverInputRef = useRef(null);
//   const profileInputRef = useRef(null);

//   useEffect(() => {
//     console.log('Profile ID from params:', id);
//     console.log('User object:', user);
//     console.log('Public profile object:', publicProfile);
    
//     if (!id || id === 'undefined') {
//       navigate('/profile/public/me');
//       return;
//     }

//     if (id === 'me') {
//       // Only redirect if we have the logged-in user's ID
//       if (user?.id) {
//         navigate(`/profile/public/${user.id}`, { replace: true });
//       } else {
//         // If no user ID available, go to home or show error
//         navigate('/');
//       }
//       return;
//     }

//     dispatch(fetchPublicProfile(id));
//   }, [id, dispatch, navigate, user?.id]);

//   useEffect(() => {
//     if (error && error.status === 400 && error.message.includes('Invalid user ID')) {
//       // If we get the "invalid ID" error, redirect to their own public profile
//       if (user?.id) {
//         navigate(`/profile/public/${user.id}`, { replace: true });
//       } else {
//         navigate('/');
//       }
//     }
//   }, [error, navigate, user?.id]);

//   const handleTabChange = (event, newValue) => {
//     setTabValue(newValue);
//   };

//   const handleRetry = () => {
//     dispatch(fetchPublicProfile(id));
//   };

//   const handleMenuOpen = (event) => {
//     setAnchorEl(event.currentTarget);
//   };

//   const handleMenuClose = () => {
//     setAnchorEl(null);
//   };

//   const handleCoverPhotoClick = () => {
//     if (isOwnProfile) {
//       coverInputRef.current.click();
//     }
//   };

//   const handleProfilePhotoClick = () => {
//     if (isOwnProfile) {
//       profileInputRef.current.click();
//     }
//   };

//   const handleFileChange = (e, type) => {
//     const file = e.target.files[0];
//     if (file) {
//       setUploadType(type);
//       const reader = new FileReader();
//       reader.onload = () => {
//         setImageToCrop(reader.result);
//         if (type === 'cover') {
//           setShowCoverDialog(true);
//         } else {
//           setShowProfileDialog(true);
//         }
//       };
//       reader.readAsDataURL(file);
//     }
//     e.target.value = null;
//   };

//   if (status === 'loading') {
//     return (
//       <Backdrop open={true} sx={{ zIndex: theme.zIndex.drawer + 1, color: '#fff' }}>
//         <CircularProgress color="inherit" />
//       </Backdrop>
//     );
//   }

//   if (error) {
//     return (
//       <Container maxWidth="lg" sx={{ mt: 4 }}>
//         <Card sx={{ 
//           backgroundColor: 'error.light', 
//           p: 3, 
//           borderRadius: 2,
//           mb: 3,
//           boxShadow: theme.shadows[4]
//         }}>
//           <Typography variant="h6" color="error.contrastText">Failed to load profile</Typography>
//           <Typography color="error.contrastText">Error: {error.message || 'Unknown error'}</Typography>
//         </Card>
//         <Box sx={{ display: 'flex', gap: 2 }}>
//           <Button variant="contained" onClick={() => navigate('/')}>
//             Go Home
//           </Button>
//           <Button variant="outlined" onClick={handleRetry}>
//             Try Again
//           </Button>
//         </Box>
//       </Container>
//     );
//   }

//   if (!publicProfile) {
//     return (
//       <Container maxWidth="lg" sx={{ mt: 4 }}>
//         <Card sx={{ 
//           backgroundColor: 'warning.light', 
//           p: 3, 
//           borderRadius: 2,
//           mb: 3,
//           boxShadow: theme.shadows[3]
//         }}>
//           <Typography variant="h6" color="warning.contrastText">Profile not found</Typography>
//         </Card>
//         <Button variant="contained" onClick={() => navigate('/')}>
//           Return Home
//         </Button>
//       </Container>
//     );
//   }

//   const isOwnProfile = user?.id === publicProfile.id;
//   const formattedDate = publicProfile.birthDate
//     ? new Date(publicProfile.birthDate).toLocaleDateString('en-US', {
//         year: 'numeric',
//         month: 'long',
//         day: 'numeric'
//       })
//     : null;

//   const profileImage = publicProfile.profileImage || '/default-avatar.png';
//   const coverImage = publicProfile.coverImage || '/default-cover.jpg';

//   // Mock data
//   const posts = [
//     { 
//       id: 1, 
//       content: "Just visited the new art museum!", 
//       date: "2 hours ago", 
//       likes: 24, 
//       comments: 5,
//       shares: 2,
//       image: '/post1.jpg'
//     },
//     { 
//       id: 2, 
//       content: "Working on a new project", 
//       date: "1 day ago", 
//       likes: 12, 
//       comments: 3,
//       shares: 0
//     }
//   ];

//   const photos = [
//     { id: 1, url: "/photo1.jpg", caption: "Vacation", likes: 15 },
//     { id: 2, url: "/photo2.jpg", caption: "Friends", likes: 23 },
//     { id: 3, url: "/photo3.jpg", caption: "Conference", likes: 8 }
//   ];

//   const friends = Array(8).fill(0).map((_, i) => ({
//     id: i + 1,
//     name: `Friend ${i + 1}`,
//     avatar: `/avatar${(i % 3) + 1}.jpg`,
//     mutual: i % 2 === 0 ? Math.floor(Math.random() * 10) + 1 : 0
//   }));

//   const aboutInfo = [
//     { icon: <Work />, label: "Works at", value: publicProfile.company || "Not specified" },
//     { icon: <LocationOn />, label: "Lives in", value: publicProfile.location || "Not specified" },
//     { icon: <Email />, label: "Email", value: publicProfile.email || "Not specified" },
//     { icon: <LinkIcon />, label: "Website", value: publicProfile.website || "Not specified", isLink: true },
//     { icon: <Cake />, label: "Birthday", value: formattedDate || "Not specified" }
//   ];

//   // Reusable components
//   const StatBox = ({ icon, count, label }) => (
//     <Box sx={{ 
//       display: 'flex', 
//       flexDirection: 'column',
//       alignItems: 'center',
//       justifyContent: 'center',
//       p: 1.5,
//       borderRadius: 2,
//       backgroundColor: 'rgba(255,255,255,0.1)',
//       minWidth: 80,
//       backdropFilter: 'blur(5px)',
//       boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
//       transition: 'transform 0.2s',
//       '&:hover': {
//         transform: 'translateY(-3px)'
//       }
//     }}>
//       <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
//         {icon}
//         <Typography variant="h6" fontWeight="bold" sx={{ ml: 0.5 }}>{count}</Typography>
//       </Box>
//       <Typography variant="caption" color="text.secondary">{label}</Typography>
//     </Box>
//   );

//   const InfoItem = ({ icon, label, value, isLink = false }) => (
//     <Box sx={{ display: 'flex', mb: 2 }}>
//       <Box sx={{ mr: 2, color: 'text.secondary' }}>{icon}</Box>
//       <Box>
//         <Typography variant="subtitle2" color="text.secondary">{label}</Typography>
//         {isLink ? (
//           <Link href={value.startsWith('http') ? value : `https://${value}`} target="_blank" rel="noopener">
//             {value}
//           </Link>
//         ) : (
//           <Typography variant="body1">{value}</Typography>
//         )}
//       </Box>
//     </Box>
//   );

//   const PostCard = ({ post }) => (
//     <Card sx={{ mb: 3, borderRadius: 3, boxShadow: theme.shadows[2] }}>
//       <CardHeader
//         avatar={<Avatar src={profileImage} />}
//         title={<Typography fontWeight="600">{publicProfile.firstName} {publicProfile.lastName}</Typography>}
//         subheader={post.date}
//         action={
//           <IconButton>
//             <MoreVert />
//           </IconButton>
//         }
//       />
//       <CardContent sx={{ pt: 0 }}>
//         <Typography paragraph>{post.content}</Typography>
//         {post.image && (
//           <Box sx={{ 
//             borderRadius: 2, 
//             overflow: 'hidden', 
//             mb: 2,
//             boxShadow: theme.shadows[1]
//           }}>
//             <img 
//               src={post.image} 
//               alt="Post" 
//               style={{ 
//                 width: '100%', 
//                 maxHeight: 400, 
//                 objectFit: 'cover' 
//               }} 
//             />
//           </Box>
//         )}
//         <Box sx={{ display: 'flex', justifyContent: 'space-between', color: 'text.secondary' }}>
//           <Typography variant="body2">
//             {post.likes} likes • {post.comments} comments • {post.shares} shares
//           </Typography>
//         </Box>
//         <Divider sx={{ my: 1.5 }} />
//         <Box sx={{ display: 'flex', justifyContent: 'space-around' }}>
//           <Button startIcon={<ThumbUp />} sx={{ color: 'text.secondary' }}>Like</Button>
//           <Button startIcon={<Comment />} sx={{ color: 'text.secondary' }}>Comment</Button>
//           <Button startIcon={<Share />} sx={{ color: 'text.secondary' }}>Share</Button>
//         </Box>
//       </CardContent>
//     </Card>
//   );

//   const PhotoCard = ({ photo }) => (
//     <Card sx={{ borderRadius: 2, overflow: 'hidden', boxShadow: 3 }}>
//       <Box sx={{ position: 'relative', paddingTop: '100%' }}>
//         <img 
//           src={photo.url} 
//           alt={photo.caption} 
//           style={{ 
//             position: 'absolute', 
//             top: 0, 
//             left: 0, 
//             width: '100%', 
//             height: '100%', 
//             objectFit: 'cover' 
//           }} 
//         />
//       </Box>
//       <Box sx={{ p: 1.5 }}>
//         <Typography variant="subtitle2">{photo.caption}</Typography>
//         <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
//           <ThumbUp fontSize="small" color="action" />
//           <Typography variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>
//             {photo.likes}
//           </Typography>
//         </Box>
//       </Box>
//     </Card>
//   );

//   const FriendCard = ({ friend }) => (
//     <Card sx={{ borderRadius: 2, overflow: 'hidden', boxShadow: 3 }}>
//       <Box sx={{ position: 'relative', paddingTop: '75%' }}>
//         <img 
//           src={friend.avatar} 
//           alt={friend.name} 
//           style={{ 
//             position: 'absolute', 
//             top: 0, 
//             left: 0, 
//             width: '100%', 
//             height: '100%', 
//             objectFit: 'cover' 
//           }} 
//         />
//       </Box>
//       <Box sx={{ p: 1.5 }}>
//         <Typography fontWeight="600">{friend.name}</Typography>
//         {friend.mutual > 0 && (
//           <Typography variant="caption" color="text.secondary">
//             {friend.mutual} mutual friend{friend.mutual !== 1 ? 's' : ''}
//           </Typography>
//         )}
//         <Button 
//           variant="contained" 
//           size="small" 
//           fullWidth 
//           sx={{ mt: 1 }}
//         >
//           {friend.mutual > 0 ? 'Add Friend' : 'Follow'}
//         </Button>
//       </Box>
//     </Card>
//   );

//   return (
//     <ThemeProvider theme={theme}>
//       <Container maxWidth="lg" sx={{ mt: 0, mb: 4 }}>
//         {/* Hidden file inputs */}
//         <input
//           type="file"
//           ref={coverInputRef}
//           onChange={(e) => handleFileChange(e, 'cover')}
//           accept="image/*"
//           style={{ display: 'none' }}
//         />
//         <input
//           type="file"
//           ref={profileInputRef}
//           onChange={(e) => handleFileChange(e, 'profile')}
//           accept="image/*"
//           style={{ display: 'none' }}
//         />

//         {/* Cover Photo Section */}
//         <Box sx={{ position: 'relative', mb: 10 }}>
//           <Box
//             sx={{
//               height: 350,
//               backgroundImage: `url(${coverImage})`,
//               backgroundSize: 'cover',
//               backgroundPosition: 'center',
//               backgroundColor: 'grey.200',
//               borderRadius: '8px 8px 0 0',
//               position: 'relative',
//               cursor: isOwnProfile ? 'pointer' : 'default',
//             }}
//             onMouseEnter={() => isOwnProfile && setCoverHover(true)}
//             onMouseLeave={() => isOwnProfile && setCoverHover(false)}
//             onClick={handleCoverPhotoClick}
//           >
//             {coverHover && isOwnProfile && (
//               <Box
//                 sx={{
//                   position: 'absolute',
//                   bottom: 16,
//                   right: 16,
//                   backgroundColor: 'rgba(0,0,0,0.6)',
//                   borderRadius: 1,
//                   p: 1,
//                   display: 'flex',
//                   alignItems: 'center',
//                   transition: 'opacity 0.3s'
//                 }}
//               >
//                 <CameraAlt sx={{ color: 'white', mr: 1, fontSize: 20 }} />
//                 <Typography variant="body2" color="white" fontWeight="500">
//                   Edit cover photo
//                 </Typography>
//               </Box>
//             )}
//           </Box>
          
//           {/* Profile Avatar and Info Section */}
//           <Box sx={{ 
//             position: 'absolute', 
//             bottom: -60, 
//             left: 16,
//             right: 16,
//             display: 'flex',
//             alignItems: 'flex-end',
//             justifyContent: 'space-between'
//           }}>
//             {/* Left Side - Profile Picture and Name */}
//             <Box sx={{ display: 'flex', alignItems: 'flex-end' }}>
//               <Box 
//                 sx={{ position: 'relative', mr: 2 }}
//                 onMouseEnter={() => isOwnProfile && setProfileHover(true)}
//                 onMouseLeave={() => isOwnProfile && setProfileHover(false)}
//               >
//                 <Avatar
//                   src={profileImage}
//                   sx={{
//                     width: 168,
//                     height: 168,
//                     border: '4px solid white',
//                     boxShadow: 3,
//                     cursor: isOwnProfile ? 'pointer' : 'default',
//                   }}
//                   onClick={handleProfilePhotoClick}
//                 />
//                 {profileHover && isOwnProfile && (
//                   <Box
//                     sx={{
//                       position: 'absolute',
//                       bottom: 0,
//                       left: 0,
//                       right: 0,
//                       backgroundColor: 'rgba(0,0,0,0.6)',
//                       color: 'white',
//                       textAlign: 'center',
//                       py: 1,
//                       borderBottomLeftRadius: 84,
//                       borderBottomRightRadius: 84
//                     }}
//                   >
//                     <CameraAlt fontSize="small" />
//                     <Typography variant="caption">Update</Typography>
//                   </Box>
//                 )}
//               </Box>
              
//               <Box>
//                 <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 0.5 }}>
//                   {publicProfile.firstName} {publicProfile.lastName}
//                   {publicProfile.isVerified && (
//                     <VerifiedIcon color="primary" sx={{ ml: 1, fontSize: 'inherit' }} />
//                   )}
//                 </Typography>
//                 <Box sx={{ display: 'flex', gap: 2, mb: 1 }}>
//                   <StatBox 
//                     icon={<PeopleIcon fontSize="small" />} 
//                     count={publicProfile.friendsCount || 0} 
//                     label="Friends" 
//                   />
//                   <StatBox 
//                     icon={<PostIcon fontSize="small" />} 
//                     count={posts.length} 
//                     label="Posts" 
//                   />
//                   <StatBox 
//                     icon={<PhotoLibraryIcon fontSize="small" />} 
//                     count={photos.length} 
//                     label="Photos" 
//                   />
//                 </Box>
//               </Box>
//             </Box>
            
//             {/* Right Side - Action Buttons */}
//             <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
//               {isOwnProfile ? (
//                 <>
//                   <Button 
//                     variant="contained" 
//                     startIcon={<Add />}
//                     sx={{ 
//                       background: 'linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366)',
//                       color: 'white',
//                       '&:hover': {
//                         background: 'linear-gradient(45deg, #e6683c, #dc2743, #cc2366, #bc1888)'
//                       }
//                     }}
//                   >
//                     Add to story
//                   </Button>
//                   <Button 
//                     variant="contained" 
//                     startIcon={<Edit />}
//                     sx={{ 
//                       backgroundColor: '#e4e6eb', 
//                       color: '#050505',
//                       '&:hover': {
//                         backgroundColor: '#d8dadf'
//                       }
//                     }}
//                     onClick={() => navigate(`/public-profile-update/${publicProfile.id}`)}
//                   >
//                     Edit profile
//                   </Button>
//                 </>
//               ) : (
//                 <>
//                   <Button 
//                     variant="contained" 
//                     color="primary"
//                     sx={{ 
//                       fontWeight: 600,
//                       boxShadow: 'none',
//                       '&:hover': {
//                         boxShadow: 'none',
//                         backgroundColor: theme.palette.primary.dark
//                       }
//                     }}
//                   >
//                     {publicProfile.isFriend ? "Friends" : "Add Friend"}
//                   </Button>
//                   <Button 
//                     variant="contained" 
//                     sx={{ 
//                       backgroundColor: '#e4e6eb', 
//                       color: '#050505',
//                       fontWeight: 600,
//                       boxShadow: 'none',
//                       '&:hover': {
//                         backgroundColor: '#d8dadf',
//                         boxShadow: 'none'
//                       }
//                     }}
//                   >
//                     Message
//                   </Button>
//                 </>
//               )}
//               <IconButton 
//                 sx={{ 
//                   backgroundColor: '#e4e6eb',
//                   '&:hover': {
//                     backgroundColor: '#d8dadf'
//                   }
//                 }}
//                 onClick={handleMenuOpen}
//               >
//                 <MoreVert sx={{ color: '#050505' }} />
//               </IconButton>
//               <Menu
//                 anchorEl={anchorEl}
//                 open={Boolean(anchorEl)}
//                 onClose={handleMenuClose}
//                 anchorOrigin={{
//                   vertical: 'bottom',
//                   horizontal: 'right',
//                 }}
//                 transformOrigin={{
//                   vertical: 'top',
//                   horizontal: 'right',
//                 }}
//               >
//                 <MenuItem onClick={() => {
//                   handleMenuClose();
//                   navigate('/about');
//                 }}>
//                   About
//                 </MenuItem>
//                 <MenuItem onClick={handleMenuClose}>Report</MenuItem>
//                 {isOwnProfile && (
//                   <MenuItem onClick={handleMenuClose}>Activity Log</MenuItem>
//                 )}
//               </Menu>
//             </Box>
//           </Box>
//         </Box>

//         {/* Tabs Section */}
//         <Box sx={{ 
//           borderBottom: 1, 
//           borderColor: 'divider', 
//           mb: 3,
//           '& .MuiTabs-indicator': {
//             backgroundColor: theme.palette.primary.main,
//             height: 3
//           }
//         }}>
//           <Tabs 
//             value={tabValue} 
//             onChange={handleTabChange}
//             variant="scrollable"
//             scrollButtons="auto"
//             textColor="primary"
//             sx={{
//               '& .MuiTab-root': {
//                 minWidth: 120,
//                 fontWeight: 600,
//                 textTransform: 'none',
//                 fontSize: '0.9375rem',
//                 '&.Mui-selected': {
//                   color: theme.palette.primary.main
//                 }
//               }
//             }}
//           >
//             <Tab label="Timeline" icon={<FeedIcon />} iconPosition="start" />
//             <Tab label="About" icon={<InfoIcon />} iconPosition="start" />
//             <Tab label="Friends" icon={<PeopleIcon />} iconPosition="start" />
//             <Tab label="Photos" icon={<PhotoLibraryIcon />} iconPosition="start" />
//             <Tab label="Videos" icon={<VideoLibraryIcon />} iconPosition="start" />
//           </Tabs>
//         </Box>

//         {/* Main Content */}
//         <Grid container spacing={3}>
//           {/* Left Column */}
//           <Grid item xs={12} md={4}>
//             {/* Intro Card */}
//             <Card sx={{ 
//               mb: 3, 
//               borderRadius: 2,
//               boxShadow: theme.shadows[2]
//             }}>
//               <CardHeader 
//                 title="Intro" 
//                 titleTypographyProps={{ 
//                   variant: 'h6',
//                   fontWeight: 600
//                 }}
//               />
//               <CardContent>
//                 {aboutInfo.map((item, index) => (
//                   <InfoItem 
//                     key={index}
//                     icon={item.icon}
//                     label={item.label}
//                     value={item.value}
//                     isLink={item.isLink}
//                   />
//                 ))}
//                 {isOwnProfile && (
//                   <Button 
//                     variant="outlined" 
//                     fullWidth 
//                     startIcon={<Edit />}
//                     sx={{ mt: 1 }}
//                   >
//                     Edit Details
//                   </Button>
//                 )}
//               </CardContent>
//             </Card>

//             {/* Photos Card */}
//             <Card sx={{ 
//               mb: 3, 
//               borderRadius: 2,
//               boxShadow: theme.shadows[2]
//             }}>
//               <CardHeader 
//                 title="Photos" 
//                 titleTypographyProps={{ 
//                   variant: 'h6',
//                   fontWeight: 600
//                 }}
//                 action={
//                   <Button color="primary">See All</Button>
//                 }
//               />
//               <CardContent>
//                 <Grid container spacing={1}>
//                   {photos.slice(0, 6).map((photo) => (
//                     <Grid item xs={4} key={photo.id}>
//                       <PhotoCard photo={photo} />
//                     </Grid>
//                   ))}
//                 </Grid>
//               </CardContent>
//             </Card>

//             {/* Friends Card */}
//             <Card sx={{ 
//               mb: 3, 
//               borderRadius: 2,
//               boxShadow: theme.shadows[2]
//             }}>
//               <CardHeader 
//                 title="Friends" 
//                 titleTypographyProps={{ 
//                   variant: 'h6',
//                   fontWeight: 600
//                 }}
//                 subheader={`${friends.length} friends`}
//                 action={
//                   <Button color="primary">See All</Button>
//                 }
//               />
//               <CardContent>
//                 <Grid container spacing={2}>
//                   {friends.slice(0, 6).map((friend) => (
//                     <Grid item xs={6} key={friend.id}>
//                       <FriendCard friend={friend} />
//                     </Grid>
//                   ))}
//                 </Grid>
//               </CardContent>
//             </Card>
//           </Grid>

//           {/* Right Column */}
//           <Grid item xs={12} md={8}>
//             {/* Create Post Card (only for own profile) */}
//             {isOwnProfile && (
//               <Card sx={{ 
//                 mb: 3, 
//                 borderRadius: 2,
//                 boxShadow: theme.shadows[2]
//               }}>
//                 <CardContent>
//                   <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
//                     <Avatar src={profileImage} sx={{ mr: 2 }} />
//                     <Button 
//                       fullWidth 
//                       variant="outlined" 
//                       sx={{ 
//                         justifyContent: 'flex-start',
//                         borderRadius: 20,
//                         backgroundColor: '#f0f2f5',
//                         textTransform: 'none',
//                         color: '#65676b'
//                       }}
//                       onClick={() => navigate('/create-post')}
//                     >
//                       What's on your mind?
//                     </Button>
//                   </Box>
//                   <Divider />
//                   <Box sx={{ display: 'flex', justifyContent: 'space-around', pt: 1 }}>
//                     <Button 
//                       startIcon={<VideoLibraryIcon color="error" />}
//                       sx={{ color: '#65676b', textTransform: 'none' }}
//                     >
//                       Live Video
//                     </Button>
//                     <Button 
//                       startIcon={<PhotoLibraryIcon color="success" />}
//                       sx={{ color: '#65676b', textTransform: 'none' }}
//                     >
//                       Photo/Video
//                     </Button>
//                     <Button 
//                       startIcon={<Groups color="warning" />}
//                       sx={{ color: '#65676b', textTransform: 'none' }}
//                     >
//                       Feeling/Activity
//                     </Button>
//                   </Box>
//                 </CardContent>
//               </Card>
//             )}

//             {/* Posts */}
//             {posts.length > 0 ? (
//               posts.map((post) => (
//                 <PostCard key={post.id} post={post} />
//               ))
//             ) : (
//               <Card sx={{ 
//                 mb: 3, 
//                 borderRadius: 2,
//                 boxShadow: theme.shadows[2],
//                 textAlign: 'center',
//                 p: 4
//               }}>
//                 <PhotoLibraryIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
//                 <Typography variant="h6" gutterBottom>
//                   {isOwnProfile ? "You haven't posted anything yet" : "No posts yet"}
//                 </Typography>
//                 <Typography color="text.secondary" sx={{ mb: 2 }}>
//                   {isOwnProfile 
//                     ? "Share your first post with your friends!" 
//                     : "When this user posts, you'll see it here."}
//                 </Typography>
//                 {isOwnProfile && (
//                   <Button 
//                     variant="contained" 
//                     startIcon={<Add />}
//                     onClick={() => navigate('/create-post')}
//                   >
//                     Create Post
//                   </Button>
//                 )}
//               </Card>
//             )}
//           </Grid>
//         </Grid>

//         {/* Image Upload Dialogs */}
//         <Dialog open={showCoverDialog} onClose={() => setShowCoverDialog(false)}>
//           <DialogTitle>Edit Cover Photo</DialogTitle>
//           <DialogContent>
//             {/* Image cropper would go here */}
//             <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
//               <Typography>Image cropper would appear here</Typography>
//             </Box>
//           </DialogContent>
//           <DialogActions>
//             <Button onClick={() => setShowCoverDialog(false)}>Cancel</Button>
//             <Button 
//               variant="contained" 
//               onClick={() => {
//                 setShowCoverDialog(false);
//                 // Handle cover photo update
//               }}
//             >
//               Save
//             </Button>
//           </DialogActions>
//         </Dialog>

//         <Dialog open={showProfileDialog} onClose={() => setShowProfileDialog(false)}>
//           <DialogTitle>Edit Profile Photo</DialogTitle>
//           <DialogContent>
//             {/* Image cropper would go here */}
//             <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
//               <Typography>Image cropper would appear here</Typography>
//             </Box>
//           </DialogContent>
//           <DialogActions>
//             <Button onClick={() => setShowProfileDialog(false)}>Cancel</Button>
//             <Button 
//               variant="contained" 
//               onClick={() => {
//                 setShowProfileDialog(false);
//                 // Handle profile photo update
//               }}
//             >
//               Save
//             </Button>
//           </DialogActions>
//         </Dialog>
//       </Container>
//     </ThemeProvider>
//   );
// };

// export default PublicProfilePage;







































