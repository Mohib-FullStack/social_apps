import {
  Add,
  Cake,
  CameraAlt,
  Close,
  Comment,
  Edit,
  Event,
  Link as LinkIcon,
  LocationOn,
  MoreVert,
  PhotoLibrary,
  Share,
  ThumbUp,
  VideoLibrary,
  ArrowBack
} from '@mui/icons-material';
import {
  Alert,
  Avatar,
  Backdrop,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
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
  useTheme,
  useMediaQuery
} from '@mui/material';
import 'cropperjs/dist/cropper.css';
import { useEffect, useRef, useState } from 'react';
import Cropper from 'react-cropper';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchPublicProfile, updatePublicProfile } from '../../features/user/userSlice';

const PublicProfilePage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
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
  const [showCoverDialog, setShowCoverDialog] = useState(false);
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const [imageToCrop, setImageToCrop] = useState(null);
  const [croppedImage, setCroppedImage] = useState(null);
  const [uploadType, setUploadType] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const coverInputRef = useRef(null);
  const profileInputRef = useRef(null);
  const cropperRef = useRef(null);

  // Color scheme for cards
  const cardStyles = {
    intro: {
      background: 'linear-gradient(135deg, #e0f7fa, #b2ebf2)',
      borderLeft: '4px solid #00bcd4',
      headerBg: '#e0f7fa',
      headerBorder: '#b2ebf2'
    },
    photos: {
      background: 'linear-gradient(135deg, #f3e5f5, #e1bee7)',
      borderLeft: '4px solid #9c27b0',
      headerBg: '#f3e5f5',
      headerBorder: '#e1bee7'
    },
    friends: {
      background: 'linear-gradient(135deg, #e8f5e9, #c8e6c9)',
      borderLeft: '4px solid #4caf50',
      headerBg: '#e8f5e9',
      headerBorder: '#c8e6c9'
    },
    posts: {
      background: 'linear-gradient(135deg, #fff3e0, #ffe0b2)',
      borderLeft: '4px solid #ff9800',
      headerBg: '#fff3e0',
      headerBorder: '#ffe0b2'
    },
    createPost: {
      background: 'linear-gradient(135deg, #e3f2fd, #bbdefb)',
      borderLeft: '4px solid #2196f3',
      headerBg: '#e3f2fd',
      headerBorder: '#bbdefb'
    }
  };

  useEffect(() => {
    if (!id || id === 'undefined') {
      navigate('/profile/public/me');
      return;
    }

    if (id === 'me' && user?.id) {
      navigate(`/profile/public/${user.id}`, { replace: true });
      return;
    }

    dispatch(fetchPublicProfile(id));
  }, [id, dispatch, navigate, user?.id]);

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
      if (!file.type.match('image.*')) {
        console.error('Only image files are allowed');
        return;
      }

      const maxSize = type === 'cover' ? 10 * 1024 * 1024 : 5 * 1024 * 1024;
      if (file.size > maxSize) {
        console.error(`Image size must be less than ${maxSize / (1024 * 1024)}MB`);
        return;
      }

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

  const handleCrop = () => {
    if (cropperRef.current) {
      setCroppedImage(cropperRef.current.getCroppedCanvas().toDataURL());
    }
  };

  const handleSavePhoto = async () => {
    if (croppedImage) {
      try {
        const formData = new FormData();
        const blob = await fetch(croppedImage).then(r => r.blob());
        const file = new File([blob], `${uploadType}-${Date.now()}.jpg`, { type: 'image/jpeg' });
        
        formData.append(uploadType === 'cover' ? 'coverImage' : 'profileImage', file);
        
        await dispatch(updatePublicProfile({
          userId: publicProfile.id,
          formData
        })).unwrap();

        setShowCoverDialog(false);
        setShowProfileDialog(false);
        setImageToCrop(null);
        setCroppedImage(null);
      } catch (error) {
        console.error('Failed to update photo:', error);
      }
    }
  };

  if (status === 'loading') {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          <Typography variant="h6">Failed to load profile</Typography>
          <Typography>Error: {error.message || 'Unknown error'}</Typography>
        </Alert>
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
        <Alert severity="warning" sx={{ mb: 3 }}>
          Profile not found
        </Alert>
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
    { id: 1, content: "Just visited the new art museum!", date: "2 hours ago", likes: 24, comments: 5 },
    { id: 2, content: "Working on a new project", date: "1 day ago", likes: 12, comments: 3 }
  ];

  const photos = [
    { id: 1, url: "/photo1.jpg", caption: "Vacation" },
    { id: 2, url: "/photo2.jpg", caption: "Friends" }
  ];

  const friends = Array(8).fill(0).map((_, i) => ({
    id: i + 1,
    name: `Friend ${i + 1}`,
    avatar: `/avatar${(i % 3) + 1}.jpg`
  }));

  return (
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
      <Box sx={{ position: 'relative', mb: isMobile ? 15 : 10 }}>
        <Box
          sx={{
            height: isMobile ? 200 : 350,
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
                alignItems: 'center'
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
          bottom: isMobile ? -80 : -60, 
          left: isMobile ? '50%' : 16,
          right: isMobile ? undefined : 16,
          transform: isMobile ? 'translateX(-50%)' : 'none',
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: isMobile ? 'center' : 'space-between',
          width: isMobile ? 'auto' : 'calc(100% - 32px)',
          flexDirection: isMobile ? 'column' : 'row',
          textAlign: isMobile ? 'center' : 'left'
        }}>
          {/* Left Side - Profile Picture and Name */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'flex-end',
            flexDirection: isMobile ? 'column' : 'row',
            mb: isMobile ? 1 : 0
          }}>
            <Box sx={{ 
              position: 'relative', 
              mr: isMobile ? 0 : 2,
              '&:hover .edit-profile-button': {
                opacity: 1
              }
            }}>
              <Avatar
                src={profileImage}
                sx={{
                  width: isMobile ? 120 : 168,
                  height: isMobile ? 120 : 168,
                  border: '4px solid white',
                  boxShadow: 3,
                  cursor: isOwnProfile ? 'pointer' : 'default',
                }}
                onClick={handleProfilePhotoClick}
              />
              {isOwnProfile && (
                <IconButton
                  className="edit-profile-button"
                  sx={{
                    position: 'absolute',
                    bottom: 8,
                    right: 8,
                    backgroundColor: 'primary.main',
                    color: 'white',
                    width: 32,
                    height: 32,
                    opacity: 0.9,
                    transition: 'opacity 0.3s',
                    '&:hover': {
                      backgroundColor: 'primary.dark',
                      opacity: 1
                    }
                  }}
                  onClick={handleProfilePhotoClick}
                >
                  <CameraAlt fontSize="small" />
                </IconButton>
              )}
            </Box>
            
            <Box sx={{ mt: isMobile ? 1 : 0 }}>
              <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 0.5 }}>
                {publicProfile.firstName} {publicProfile.lastName}
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
                {publicProfile.friendsCount || 0} friends
              </Typography>
            </Box>
          </Box>
          
          {/* Right Side - Action Buttons */}
          {!isMobile && (
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
                    sx={{ backgroundColor: '#e4e6eb', color: '#050505' }}
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
                    sx={{ fontWeight: 600 }}
                  >
                    {publicProfile.isFriend ? "Friends" : "Add Friend"}
                  </Button>
                  <Button 
                    variant="contained" 
                    sx={{ 
                      backgroundColor: '#e4e6eb', 
                      color: '#050505',
                      fontWeight: 600
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
              >
                <MenuItem onClick={() => {
                  handleMenuClose();
                  navigate('/about');
                }}>
                  About
                </MenuItem>
                <MenuItem onClick={handleMenuClose}>Report</MenuItem>
              </Menu>
            </Box>
          )}
        </Box>
      </Box>

      {/* Mobile Action Buttons */}
      {isMobile && isOwnProfile && (
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mb: 2 }}>
          <Button 
            variant="contained" 
            startIcon={<Add />}
            size="small"
            sx={{ 
              background: 'linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366)',
              color: 'white',
            }}
          >
            Story
          </Button>
          <Button 
            variant="contained" 
            startIcon={<Edit />}
            size="small"
            sx={{ backgroundColor: '#e4e6eb', color: '#050505' }}
            onClick={() => navigate(`/public-profile-update/${publicProfile.id}`)}
          >
            Edit
          </Button>
        </Box>
      )}

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
          variant={isMobile ? "scrollable" : "standard"}
          scrollButtons="auto"
          textColor="primary"
        >
          <Tab label="Posts" sx={{ fontWeight: 600 }} />
          <Tab label="About" sx={{ fontWeight: 600 }} />
          <Tab label="Friends" sx={{ fontWeight: 600 }} />
          <Tab label="Photos" sx={{ fontWeight: 600 }} />
          <Tab label="Videos" sx={{ fontWeight: 600 }} />
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
            ...cardStyles.intro
          }}>
            <Box sx={{
              p: 2,
              backgroundColor: cardStyles.intro.headerBg,
              borderBottom: `1px solid ${cardStyles.intro.headerBorder}`
            }}>
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#00796b' }}>
                Intro
              </Typography>
            </Box>
            <CardContent>
              {publicProfile.bio && (
                <Typography paragraph sx={{ mb: 2 }}>
                  {publicProfile.bio}
                </Typography>
              )}
              
              <Box sx={{ '& > div': { mb: 2 } }}>
                {formattedDate && (
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Cake color="action" sx={{ mr: 1 }} />
                    <Typography>Born {formattedDate}</Typography>
                  </Box>
                )}
                
                {publicProfile.location && (
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <LocationOn color="action" sx={{ mr: 1 }} />
                    <Typography>{publicProfile.location}</Typography>
                  </Box>
                )}
                
                {publicProfile.website && (
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <LinkIcon color="action" sx={{ mr: 1 }} />
                    <Link href={publicProfile.website} target="_blank" rel="noopener">
                      {publicProfile.website.replace(/^https?:\/\//, '')}
                    </Link>
                  </Box>
                )}
              </Box>
              
              {isOwnProfile && (
                <Button 
                  variant="outlined" 
                  fullWidth
                  startIcon={<Edit />}
                  sx={{ mt: 1 }}
                  onClick={() => navigate('/public-profile-update')}
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
            ...cardStyles.photos
          }}>
            <Box sx={{
              p: 2,
              backgroundColor: cardStyles.photos.headerBg,
              borderBottom: `1px solid ${cardStyles.photos.headerBorder}`
            }}>
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#7b1fa2' }}>
                Photos
              </Typography>
            </Box>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Button color="primary" onClick={() => navigate('/photos')}>
                  See All Photos
                </Button>
              </Box>
              
              <Grid container spacing={1}>
                {photos.slice(0, 6).map((photo) => (
                  <Grid item xs={4} key={photo.id}>
                    <img 
                      src={photo.url} 
                      alt={photo.caption} 
                      style={{ 
                        width: '100%', 
                        height: 100, 
                        objectFit: 'cover',
                        borderRadius: 4
                      }}
                    />
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>

          {/* Friends Card */}
          <Card sx={{ 
            borderRadius: 2,
            ...cardStyles.friends
          }}>
            <Box sx={{
              p: 2,
              backgroundColor: cardStyles.friends.headerBg,
              borderBottom: `1px solid ${cardStyles.friends.headerBorder}`
            }}>
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#2e7d32' }}>
                Friends
              </Typography>
            </Box>
            <CardContent>
              <Typography color="text.secondary" sx={{ mb: 2 }}>
                {friends.length} friends
              </Typography>
              
              <Grid container spacing={1}>
                {friends.slice(0, 6).map((friend) => (
                  <Grid item xs={4} key={friend.id}>
                    <Box>
                      <img 
                        src={friend.avatar} 
                        alt={friend.name} 
                        style={{ 
                          width: '100%', 
                          height: 100, 
                          objectFit: 'cover',
                          borderRadius: 4
                        }}
                      />
                      <Typography variant="body2" sx={{ mt: 0.5 }}>
                        {friend.name}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Right Column - Posts */}
        <Grid item xs={12} md={8}>
          {/* Create Post (only for own profile) */}
          {isOwnProfile && (
            <Card sx={{ 
              mb: 3, 
              borderRadius: 2,
              ...cardStyles.createPost
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar src={profileImage} sx={{ mr: 1 }} />
                  <Button 
                    variant="outlined" 
                    fullWidth
                    sx={{ justifyContent: 'flex-start' }}
                    onClick={() => navigate('/create-post')}
                  >
                    What's on your mind?
                  </Button>
                </Box>
                <Divider sx={{ my: 1 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-around' }}>
                  <Button startIcon={<PhotoLibrary color="primary" />}>Photo</Button>
                  <Button startIcon={<VideoLibrary color="secondary" />}>Video</Button>
                  <Button startIcon={<Event color="success" />}>Event</Button>
                </Box>
              </CardContent>
            </Card>
          )}

          {/* Posts */}
          {posts.map((post) => (
            <Card key={post.id} sx={{ 
              mb: 3, 
              borderRadius: 2,
              ...cardStyles.posts
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar src={profileImage} sx={{ mr: 1 }} />
                  <Box>
                    <Typography fontWeight="500">
                      {publicProfile.firstName} {publicProfile.lastName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {post.date}
                    </Typography>
                  </Box>
                </Box>
                
                <Typography paragraph sx={{ mb: 2 }}>
                  {post.content}
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Chip 
                    label={`${post.likes} likes`}
                    size="small"
                    sx={{ mr: 1 }}
                  />
                  <Chip 
                    label={`${post.comments} comments`}
                    size="small"
                  />
                </Box>
                
                <Divider sx={{ my: 1 }} />
                
                <Box sx={{ display: 'flex', justifyContent: 'space-around' }}>
                  <Button startIcon={<ThumbUp />}>Like</Button>
                  <Button startIcon={<Comment />}>Comment</Button>
                  <Button startIcon={<Share />}>Share</Button>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Grid>
      </Grid>

      {/* Photo Upload Dialogs */}
      <PhotoUploadDialog
        open={showCoverDialog}
        onClose={() => setShowCoverDialog(false)}
        title="Update Cover Photo"
        aspectRatio={16/9}
        imageToCrop={imageToCrop}
        cropperRef={cropperRef}
        handleCrop={handleCrop}
        handleSave={handleSavePhoto}
        loading={updatePhotoStatus === 'loading'}
      />

      <PhotoUploadDialog
        open={showProfileDialog}
        onClose={() => setShowProfileDialog(false)}
        title="Update Profile Picture"
        aspectRatio={1}
        imageToCrop={imageToCrop}
        cropperRef={cropperRef}
        handleCrop={handleCrop}
        handleSave={handleSavePhoto}
        loading={updatePhotoStatus === 'loading'}
      />

      {/* Loading backdrop */}
      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={updatePhotoStatus === 'loading'}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </Container>
  );
};

// Reusable Photo Upload Dialog Component
const PhotoUploadDialog = ({
  open,
  onClose,
  title,
  aspectRatio,
  imageToCrop,
  cropperRef,
  handleCrop,
  handleSave,
  loading
}) => (
  <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
    <DialogTitle>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h6">{title}</Typography>
        <IconButton onClick={onClose} disabled={loading}>
          <Close />
        </IconButton>
      </Box>
    </DialogTitle>
    <DialogContent>
      <Box sx={{ height: 400 }}>
        {imageToCrop && (
          <Cropper
            src={imageToCrop}
            style={{ height: 400, width: '100%' }}
            initialAspectRatio={aspectRatio}
            guides={true}
            ref={cropperRef}
            viewMode={1}
            dragMode="move"
            cropBoxMovable={true}
            cropBoxResizable={true}
            toggleDragModeOnDblclick={false}
            crop={handleCrop}
          />
        )}
      </Box>
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose} disabled={loading}>
        Cancel
      </Button>
      <Button 
        variant="contained" 
        color="primary"
        onClick={handleSave}
        disabled={loading}
        startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
      >
        {loading ? 'Saving...' : 'Save Changes'}
      </Button>
    </DialogActions>
  </Dialog>
);

export default PublicProfilePage;











//! test
// import {
//   Add,
//   Cake,
//   CameraAlt,
//   ChatBubbleOutline,
//   Edit,
//   Event,
//   Link as LinkIcon,
//   LocationOn,
//   MoreHoriz,
//   PhotoLibrary,
//   Share,
//   ThumbUpOutlined,
//   Videocam,
//   PeopleAlt,
//   WorkOutline,
//   School,
//   FavoriteBorder,
//   Public,
//   Lock,
//   GroupAdd,
//   MailOutline,
//   Settings
// } from '@mui/icons-material';
// import {
//   Avatar,
//   Box,
//   Button,
//   Card,
//   CardContent,
//   Chip,
//   Container,
//   Divider,
//   Grid,
//   IconButton,
//   Link,
//   Typography,
//   useTheme,
//   useMediaQuery,
//   Tabs,
//   Tab,
//   Hidden,
//   Badge,
//   CircularProgress
// } from '@mui/material';
// import { useEffect, useState } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { useNavigate, useParams } from 'react-router-dom';
// import { fetchPublicProfile } from '../../features/user/userSlice';
// import { Helmet } from 'react-helmet';

// // Custom components
// const ProfileBadge = ({ icon, count }) => (
//   <Chip
//     icon={icon}
//     label={count}
//     variant="outlined"
//     size="small"
//     sx={{ 
//       mr: 1, 
//       '& .MuiChip-icon': { color: 'primary.main' },
//       bgcolor: 'background.paper'
//     }}
//   />
// );

// const SocialStats = ({ icon, count, label }) => (
//   <Box sx={{ textAlign: 'center', px: 1 }}>
//     <Typography variant="h6" fontWeight="bold" color="text.primary">
//       {count}
//     </Typography>
//     <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
//       {icon} {label}
//     </Typography>
//   </Box>
// );

// // Mock data with more realistic content for SEO
// const stories = [
//   { id: 1, name: 'Your Story', image: '/story1.jpg', alt: 'Add your story' },
//   { id: 2, name: 'Alex Johnson', image: '/story2.jpg', alt: 'Alex Johnson\'s story' },
//   { id: 3, name: 'Sarah Miller', image: '/story3.jpg', alt: 'Sarah Miller\'s travel story' },
//   { id: 4, name: 'Mike Chen', image: '/story4.jpg', alt: 'Mike Chen\'s work story' },
//   { id: 5, name: 'Emma Wilson', image: '/story5.jpg', alt: 'Emma Wilson\'s birthday story' }
// ];

// const friends = Array(8).fill(0).map((_, i) => ({
//   id: i + 1,
//   name: `Friend ${i + 1}`,
//   avatar: `/avatar${(i % 3) + 1}.jpg`,
//   alt: `Profile picture of Friend ${i + 1}`,
//   mutualFriends: Math.floor(Math.random() * 10) + 1,
//   mutualInterests: ['Travel', 'Photography', 'Music', 'Sports'][Math.floor(Math.random() * 4)]
// }));

// const suggestedConnections = Array(5).fill(0).map((_, i) => ({
//   id: i + 20,
//   name: `Suggested ${i + 1}`,
//   avatar: `/avatar${(i % 4) + 1}.jpg`,
//   alt: `Profile picture of Suggested Connection ${i + 1}`,
//   mutualFriends: Math.floor(Math.random() * 10) + 1,
//   commonInterests: Math.floor(Math.random() * 5) + 1
// }));

// const PublicProfilePage = () => {
//   const theme = useTheme();
//   const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
//   const { username } = useParams();
//   const navigate = useNavigate();
//   const dispatch = useDispatch();
//   const [tabValue, setTabValue] = useState(0);
  
//   const { publicProfile, publicProfileStatus: status } = useSelector((state) => state.user);
//   const { user } = useSelector((state) => state.user);

//   useEffect(() => {
//     if (!username || username === 'undefined') {
//       navigate('/profile/me');
//       return;
//     }

//     if (username === 'me' && user?.id) {
//       navigate(`/profile/${user.username}`, { replace: true });
//       return;
//     }

//     dispatch(fetchPublicProfile(username));
//   }, [username, dispatch, navigate, user?.id, user?.username]);

//   if (status === 'loading') {
//     return (
//       <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
//         <CircularProgress />
//       </Box>
//     );
//   }

//   if (!publicProfile) return null;

//   const isOwnProfile = user?.id === publicProfile.id;
//   const profileImage = publicProfile.profileImage || '/default-avatar.png';
//   const coverImage = publicProfile.coverImage || '/default-cover.jpg';
//   const fullName = `${publicProfile.firstName} ${publicProfile.lastName}`;

//   const handleTabChange = (event, newValue) => {
//     setTabValue(newValue);
//     // Add analytics tracking for tab changes
//   };

//   const renderProfileTabs = () => {
//     switch(tabValue) {
//       case 0: return <PostsTab profile={publicProfile} />;
//       case 1: return <AboutTab profile={publicProfile} />;
//       case 2: return <ConnectionsTab connections={friends} />;
//       case 3: return <MediaTab />;
//       default: return <PostsTab profile={publicProfile} />;
//     }
//   };

//   return (
//     <>
//       <Helmet>
//         <title>{fullName} | ConnectSocial Profile</title>
//         <meta name="description" content={`View ${fullName}'s profile on ConnectSocial. ${publicProfile.bio || 'Join to connect with them.'}`} />
//         <meta property="og:title" content={`${fullName} | ConnectSocial Profile`} />
//         <meta property="og:description" content={`${fullName}'s profile on ConnectSocial`} />
//         <meta property="og:image" content={profileImage} />
//       </Helmet>

//       <Container maxWidth="lg" disableGutters={isMobile} sx={{ 
//         mt: 0, 
//         mb: 4,
//         bgcolor: 'background.default',
//         p: isMobile ? 0 : 2
//       }}>
//         {/* Cover Photo Section with improved semantics */}
//         <Box component="header" sx={{ 
//           position: 'relative', 
//           height: isMobile ? 200 : 350,
//           mb: isMobile ? 10 : 6,
//           borderRadius: isMobile ? 0 : '12px 12px 0 0',
//           overflow: 'hidden',
//           boxShadow: 1
//         }}>
//           <img
//             src={coverImage}
//             alt={`Cover photo for ${fullName}`}
//             style={{
//               width: '100%',
//               height: '100%',
//               objectFit: 'cover',
//               backgroundColor: theme.palette.grey[200],
//             }}
//             loading="lazy"
//           />
          
//           {/* Profile Picture Floating Overlay */}
//           <Box sx={{
//             position: 'absolute',
//             bottom: isMobile ? -60 : -80,
//             left: isMobile ? '50%' : 32,
//             transform: isMobile ? 'translateX(-50%)' : 'none',
//             zIndex: 2
//           }}>
//             <Badge
//               overlap="circular"
//               anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
//               badgeContent={
//                 isOwnProfile ? (
//                   <IconButton sx={{ 
//                     bgcolor: 'primary.main', 
//                     color: 'white',
//                     '&:hover': { bgcolor: 'primary.dark' }
//                   }}>
//                     <CameraAlt fontSize="small" />
//                   </IconButton>
//                 ) : null
//               }
//             >
//               <Avatar
//                 src={profileImage}
//                 alt={`Profile picture of ${fullName}`}
//                 sx={{
//                   width: isMobile ? 120 : 168,
//                   height: isMobile ? 120 : 168,
//                   border: '4px solid white',
//                   boxShadow: 3,
//                 }}
//               />
//             </Badge>
//           </Box>
//         </Box>

//         {/* Profile Header Section */}
//         <Box component="section" sx={{ 
//           display: 'flex', 
//           flexDirection: isMobile ? 'column' : 'row',
//           justifyContent: 'space-between',
//           alignItems: isMobile ? 'center' : 'flex-end',
//           mt: isMobile ? 6 : 0,
//           mb: 3,
//           px: isMobile ? 2 : 0
//         }}>
//           <Box sx={{ 
//             textAlign: isMobile ? 'center' : 'left', 
//             mb: isMobile ? 2 : 0,
//             alignSelf: isMobile ? 'center' : 'flex-start'
//           }}>
//             <Typography variant="h1" sx={{ 
//               fontSize: isMobile ? '1.8rem' : '2.4rem',
//               fontWeight: 'bold',
//               color: 'text.primary',
//               mb: 0.5
//             }}>
//               {fullName}
//             </Typography>
            
//             <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: isMobile ? 'center' : 'flex-start' }}>
//               <ProfileBadge icon={<PeopleAlt fontSize="small" />} count={publicProfile.friendsCount || 243} />
//               <ProfileBadge icon={<FavoriteBorder fontSize="small" />} count={publicProfile.interestsCount || 15} />
//               <ProfileBadge icon={<Public fontSize="small" />} count={publicProfile.followersCount || 320} />
//             </Box>
//           </Box>
          
//           <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: isMobile ? 'center' : 'flex-end' }}>
//             {isOwnProfile ? (
//               <>
//                 <Button 
//                   variant="contained" 
//                   startIcon={<Add />}
//                   sx={{ 
//                     textTransform: 'none',
//                     fontWeight: '600',
//                     borderRadius: 2
//                   }}
//                 >
//                   Create Story
//                 </Button>
//                 <Button 
//                   variant="outlined"
//                   startIcon={<Edit />}
//                   sx={{ 
//                     textTransform: 'none',
//                     fontWeight: '600',
//                     borderRadius: 2
//                   }}
//                 >
//                   Edit Profile
//                 </Button>
//               </>
//             ) : (
//               <>
//                 <Button 
//                   variant="contained" 
//                   startIcon={<GroupAdd />}
//                   sx={{ 
//                     textTransform: 'none',
//                     fontWeight: '600',
//                     borderRadius: 2
//                   }}
//                 >
//                   Connect
//                 </Button>
//                 <Button 
//                   variant="outlined"
//                   startIcon={<MailOutline />}
//                   sx={{ 
//                     textTransform: 'none',
//                     fontWeight: '600',
//                     borderRadius: 2
//                   }}
//                 >
//                   Message
//                 </Button>
//               </>
//             )}
//             <IconButton sx={{ 
//               bgcolor: 'action.hover',
//               borderRadius: 2,
//               '&:hover': { bgcolor: 'action.selected' }
//             }}>
//               <MoreHoriz sx={{ color: 'text.primary' }} />
//             </IconButton>
//           </Box>
//         </Box>

//         {/* Navigation Tabs with semantic ARIA attributes */}
//         <Box component="nav" sx={{ 
//           borderBottom: 1, 
//           borderColor: 'divider',
//           mb: 3,
//           '& .MuiTabs-indicator': {
//             height: 3,
//             bgcolor: 'primary.main'
//           }
//         }}>
//           <Tabs 
//             value={tabValue} 
//             onChange={handleTabChange}
//             variant="scrollable"
//             scrollButtons="auto"
//             aria-label="Profile sections"
//           >
//             <Tab 
//               label="Posts" 
//               id="profile-tab-0"
//               aria-controls="profile-tabpanel-0"
//               sx={{ 
//                 fontWeight: 600,
//                 textTransform: 'none',
//                 fontSize: '0.9375rem',
//                 minWidth: 'unset',
//                 px: 2,
//               }} 
//             />
//             <Tab 
//               label="About" 
//               id="profile-tab-1"
//               aria-controls="profile-tabpanel-1"
//               sx={{ 
//                 fontWeight: 600,
//                 textTransform: 'none',
//                 fontSize: '0.9375rem',
//                 minWidth: 'unset',
//                 px: 2,
//               }} 
//             />
//             <Tab 
//               label="Connections" 
//               id="profile-tab-2"
//               aria-controls="profile-tabpanel-2"
//               sx={{ 
//                 fontWeight: 600,
//                 textTransform: 'none',
//                 fontSize: '0.9375rem',
//                 minWidth: 'unset',
//                 px: 2,
//               }} 
//             />
//             <Tab 
//               label="Media" 
//               id="profile-tab-3"
//               aria-controls="profile-tabpanel-3"
//               sx={{ 
//                 fontWeight: 600,
//                 textTransform: 'none',
//                 fontSize: '0.9375rem',
//                 minWidth: 'unset',
//                 px: 2,
//               }} 
//             />
//           </Tabs>
//         </Box>

//         {/* Main Content Area */}
//         <Grid container spacing={3}>
//           {/* Left Sidebar - Only on desktop */}
//           <Hidden smDown>
//             <Grid item md={4}>
//               {/* About Card */}
//               <Card sx={{ mb: 3, borderRadius: 2, boxShadow: 1 }}>
//                 <CardContent>
//                   <Typography variant="h6" fontWeight="bold" gutterBottom>
//                     About
//                   </Typography>
//                   {publicProfile.bio && (
//                     <Typography variant="body1" paragraph>
//                       {publicProfile.bio}
//                     </Typography>
//                   )}
                  
//                   <Divider sx={{ my: 2 }} />
                  
//                   <Box sx={{ '& > *:not(:last-child)': { mb: 1.5 } }}>
//                     {publicProfile.work && (
//                       <Box sx={{ display: 'flex' }}>
//                         <WorkOutline sx={{ mr: 1.5, color: 'text.secondary' }} />
//                         <Typography>{publicProfile.work}</Typography>
//                       </Box>
//                     )}
                    
//                     {publicProfile.education && (
//                       <Box sx={{ display: 'flex' }}>
//                         <School sx={{ mr: 1.5, color: 'text.secondary' }} />
//                         <Typography>{publicProfile.education}</Typography>
//                       </Box>
//                     )}
                    
//                     {publicProfile.location && (
//                       <Box sx={{ display: 'flex' }}>
//                         <LocationOn sx={{ mr: 1.5, color: 'text.secondary' }} />
//                         <Typography>{publicProfile.location}</Typography>
//                       </Box>
//                     )}
//                   </Box>
//                 </CardContent>
//               </Card>

//               {/* Social Stats Card */}
//               <Card sx={{ mb: 3, borderRadius: 2, boxShadow: 1 }}>
//                 <CardContent>
//                   <Typography variant="h6" fontWeight="bold" gutterBottom>
//                     Social Stats
//                   </Typography>
//                   <Box sx={{ display: 'flex', justifyContent: 'space-around', py: 1 }}>
//                     <SocialStats 
//                       icon={<PeopleAlt fontSize="small" sx={{ mr: 0.5 }} />} 
//                       count={publicProfile.friendsCount || 243} 
//                       label="Connections" 
//                     />
//                     <SocialStats 
//                       icon={<Public fontSize="small" sx={{ mr: 0.5 }} />} 
//                       count={publicProfile.followersCount || 320} 
//                       label="Followers" 
//                     />
//                     <SocialStats 
//                       icon={<FavoriteBorder fontSize="small" sx={{ mr: 0.5 }} />} 
//                       count={publicProfile.likesCount || 1.2 + 'K'} 
//                       label="Likes" 
//                     />
//                   </Box>
//                 </CardContent>
//               </Card>

//               {/* Photo Highlights */}
//               <Card sx={{ mb: 3, borderRadius: 2, boxShadow: 1 }}>
//                 <CardContent>
//                   <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
//                     <Typography variant="h6" fontWeight="bold">
//                       Photos
//                     </Typography>
//                     <Button 
//                       color="primary" 
//                       sx={{ 
//                         textTransform: 'none',
//                         fontSize: '0.9375rem',
//                         fontWeight: '600'
//                       }}
//                     >
//                       See all
//                     </Button>
//                   </Box>
                  
//                   <Grid container spacing={1}>
//                     {[1, 2, 3, 4, 5, 6].map((item) => (
//                       <Grid item xs={4} key={item}>
//                         <img 
//                           src={`/photo${item}.jpg`} 
//                           alt={`Photo ${item} from ${fullName}'s gallery`}
//                           style={{ 
//                             width: '100%', 
//                             aspectRatio: '1', 
//                             objectFit: 'cover',
//                             borderRadius: 8,
//                             cursor: 'pointer'
//                           }}
//                           loading="lazy"
//                         />
//                       </Grid>
//                     ))}
//                   </Grid>
//                 </CardContent>
//               </Card>
//             </Grid>
//           </Hidden>

//           {/* Main Content */}
//           <Grid item xs={12} md={8}>
//             {/* Stories Section - Mobile Only */}
//             {isMobile && (
//               <Card sx={{ mb: 3, borderRadius: 2, boxShadow: 1 }}>
//                 <CardContent sx={{ p: 1 }}>
//                   <Box sx={{ display: 'flex', gap: 1, overflowX: 'auto', py: 1 }}>
//                     {stories.map((story) => (
//                       <Box 
//                         key={story.id} 
//                         component="article"
//                         sx={{ 
//                           minWidth: 100, 
//                           height: 160, 
//                           position: 'relative',
//                           borderRadius: 1,
//                           overflow: 'hidden',
//                           cursor: 'pointer'
//                         }}
//                       >
//                         <img 
//                           src={story.image} 
//                           alt={story.alt}
//                           style={{ 
//                             width: '100%', 
//                             height: '100%', 
//                             objectFit: 'cover',
//                           }}
//                           loading="lazy"
//                         />
//                         <Box sx={{
//                           position: 'absolute',
//                           bottom: 0,
//                           left: 0,
//                           right: 0,
//                           p: 1,
//                           color: 'white',
//                           background: 'linear-gradient(transparent, rgba(0,0,0,0.6))'
//                         }}>
//                           <Typography variant="body2" fontWeight="500">
//                             {story.name}
//                           </Typography>
//                         </Box>
//                       </Box>
//                     ))}
//                   </Box>
//                 </CardContent>
//               </Card>
//             )}

//             {/* Tab Content */}
//             <Box component="main" role="tabpanel" id={`profile-tabpanel-${tabValue}`} aria-labelledby={`profile-tab-${tabValue}`}>
//               {renderProfileTabs()}
//             </Box>
//           </Grid>
//         </Grid>
//       </Container>
//     </>
//   );
// };

// // Tab Components
// const PostsTab = ({ profile }) => (
//   <Card sx={{ borderRadius: 2, boxShadow: 1 }}>
//     <CardContent>
//       <Typography variant="h6" gutterBottom>
//         {profile.firstName}'s Posts
//       </Typography>
//       <Box sx={{ textAlign: 'center', py: 4 }}>
//         <Typography color="text.secondary">
//           No posts to show yet
//         </Typography>
//         <Button variant="text" color="primary" sx={{ mt: 1 }}>
//           Create your first post
//         </Button>
//       </Box>
//     </CardContent>
//   </Card>
// );

// const AboutTab = ({ profile }) => (
//   <Card sx={{ borderRadius: 2, boxShadow: 1 }}>
//     <CardContent>
//       <Typography variant="h6" gutterBottom>
//         About {profile.firstName}
//       </Typography>
//       <Box sx={{ mb: 3 }}>
//         <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
//           Bio
//         </Typography>
//         <Typography paragraph>
//           {profile.bio || 'No bio added yet.'}
//         </Typography>
//       </Box>
      
//       <Divider sx={{ my: 2 }} />
      
//       <Box sx={{ mb: 3 }}>
//         <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
//           Work and Education
//         </Typography>
//         <Box sx={{ '& > *:not(:last-child)': { mb: 1.5 } }}>
//           {profile.work ? (
//             <Box sx={{ display: 'flex' }}>
//               <WorkOutline sx={{ mr: 1.5, color: 'text.secondary' }} />
//               <Typography>{profile.work}</Typography>
//             </Box>
//           ) : (
//             <Typography color="text.secondary">No work information</Typography>
//           )}
          
//           {profile.education ? (
//             <Box sx={{ display: 'flex' }}>
//               <School sx={{ mr: 1.5, color: 'text.secondary' }} />
//               <Typography>{profile.education}</Typography>
//             </Box>
//           ) : (
//             <Typography color="text.secondary">No education information</Typography>
//           )}
//         </Box>
//       </Box>
      
//       <Divider sx={{ my: 2 }} />
      
//       <Box>
//         <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
//           Places Lived
//         </Typography>
//         {profile.location ? (
//           <Box sx={{ display: 'flex' }}>
//             <LocationOn sx={{ mr: 1.5, color: 'text.secondary' }} />
//             <Typography>{profile.location}</Typography>
//           </Box>
//         ) : (
//           <Typography color="text.secondary">No location information</Typography>
//         )}
//       </Box>
//     </CardContent>
//   </Card>
// );

// const ConnectionsTab = ({ connections }) => (
//   <Card sx={{ borderRadius: 2, boxShadow: 1 }}>
//     <CardContent>
//       <Box sx={{ 
//         display: 'flex', 
//         justifyContent: 'space-between',
//         alignItems: 'center',
//         mb: 2
//       }}>
//         <Typography variant="h6" fontWeight="bold">
//           Connections
//         </Typography>
//         <Button 
//           color="primary" 
//           sx={{ 
//             textTransform: 'none',
//             fontSize: '0.9375rem',
//             fontWeight: '600'
//           }}
//         >
//           See all
//         </Button>
//       </Box>
      
//       <Grid container spacing={2}>
//         {connections.slice(0, 6).map((friend) => (
//           <Grid item xs={6} sm={4} key={friend.id}>
//             <Card sx={{ 
//               border: '1px solid',
//               borderColor: 'divider',
//               boxShadow: 'none',
//               '&:hover': { 
//                 boxShadow: 1,
//                 transition: 'box-shadow 0.3s ease'
//               }
//             }}>
//               <img 
//                 src={friend.avatar} 
//                 alt={friend.alt}
//                 style={{ 
//                   width: '100%', 
//                   height: 140, 
//                   objectFit: 'cover',
//                   borderTopLeftRadius: 'inherit',
//                   borderTopRightRadius: 'inherit'
//                 }}
//                 loading="lazy"
//               />
//               <CardContent>
//                 <Link 
//                   href="#" 
//                   underline="none" 
//                   color="text.primary" 
//                   fontWeight="500"
//                   sx={{ '&:hover': { textDecoration: 'underline' } }}
//                 >
//                   {friend.name}
//                 </Link>
//                 <Typography 
//                   variant="body2" 
//                   sx={{ 
//                     fontSize: '0.8125rem',
//                     color: 'text.secondary',
//                     mt: 0.5
//                   }}
//                 >
//                   {friend.mutualFriends} mutual connections
//                 </Typography>
//                 {friend.mutualInterests && (
//                   <Typography 
//                     variant="body2" 
//                     sx={{ 
//                       fontSize: '0.8125rem',
//                       color: 'text.secondary',
//                       mt: 0.5
//                     }}
//                   >
//                     Common interest: {friend.mutualInterests}
//                   </Typography>
//                 )}
//                 <Button 
//                   variant="outlined" 
//                   fullWidth
//                   size="small"
//                   sx={{ 
//                     mt: 1.5,
//                     textTransform: 'none',
//                     fontWeight: '600'
//                   }}
//                 >
//                   Connect
//                 </Button>
//               </CardContent>
//             </Card>
//           </Grid>
//         ))}
//       </Grid>
//     </CardContent>
//   </Card>
// );

// const MediaTab = () => (
//   <Card sx={{ borderRadius: 2, boxShadow: 1 }}>
//     <CardContent>
//       <Box sx={{ 
//         display: 'flex', 
//         justifyContent: 'space-between',
//         alignItems: 'center',
//         mb: 2
//       }}>
//         <Typography variant="h6" fontWeight="bold">
//           Photos & Videos
//         </Typography>
//         <Button 
//           color="primary" 
//           sx={{ 
//             textTransform: 'none',
//             fontSize: '0.9375rem',
//             fontWeight: '600'
//           }}
//         >
//           See all
//         </Button>
//       </Box>
      
//       <Grid container spacing={1}>
//         {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((item) => (
//           <Grid item xs={6} sm={4} key={item}>
//             <Box sx={{ 
//               position: 'relative',
//               borderRadius: 1,
//               overflow: 'hidden',
//               cursor: 'pointer',
//               '&:hover .media-overlay': {
//                 opacity: 1
//               }
//             }}>
//               <img 
//                 src={`/media${item}.jpg`} 
//                 alt={`Media item ${item}`}
//                 style={{ 
//                   width: '100%', 
//                   aspectRatio: item % 3 === 0 ? '16/9' : '1', // Mix of square and wide images
//                   objectFit: 'cover',
//                 }}
//                 loading="lazy"
//               />
//               <Box className="media-overlay" sx={{
//                 position: 'absolute',
//                 top: 0,
//                 left: 0,
//                 right: 0,
//                 bottom: 0,
//                 bgcolor: 'rgba(0,0,0,0.3)',
//                 display: 'flex',
//                 alignItems: 'center',
//                 justifyContent: 'center',
//                 opacity: 0,
//                 transition: 'opacity 0.3s ease'
//               }}>
//                 {item % 3 === 0 ? (
//                   <Videocam sx={{ color: 'white', fontSize: 40 }} />
//                 ) : (
//                   <PhotoLibrary sx={{ color: 'white', fontSize: 40 }} />
//                 )}
//               </Box>
//             </Box>
//           </Grid>
//         ))}
//       </Grid>
//     </CardContent>
//   </Card>
// );

// export default PublicProfilePage;

//! running this is selected







//! curent
// import {
//   Add,
//   Cake,
//   CameraAlt,
//   Close,
//   Comment,
//   Edit,
//   Event,
//   Link as LinkIcon,
//   LocationOn,
//   MoreVert,
//   PhotoLibrary,
//   Share,
//   ThumbUp,
//   VideoLibrary,
//   ArrowBack
// } from '@mui/icons-material';
// import {
//   Alert,
//   Avatar,
//   Backdrop,
//   Box,
//   Button,
//   Card,
//   CardContent,
//   Chip,
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
//   useTheme,
//   useMediaQuery
// } from '@mui/material';
// import 'cropperjs/dist/cropper.css';
// import { useEffect, useRef, useState } from 'react';
// import Cropper from 'react-cropper';
// import { useDispatch, useSelector } from 'react-redux';
// import { useNavigate, useParams } from 'react-router-dom';
// import { fetchPublicProfile, updatePublicProfile } from '../../features/user/userSlice';

// const PublicProfilePage = () => {
//   const theme = useTheme();
//   const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
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
//   const [showCoverDialog, setShowCoverDialog] = useState(false);
//   const [showProfileDialog, setShowProfileDialog] = useState(false);
//   const [imageToCrop, setImageToCrop] = useState(null);
//   const [croppedImage, setCroppedImage] = useState(null);
//   const [uploadType, setUploadType] = useState(null);
//   const [anchorEl, setAnchorEl] = useState(null);
//   const coverInputRef = useRef(null);
//   const profileInputRef = useRef(null);
//   const cropperRef = useRef(null);

//   // Color scheme for cards
//   const cardStyles = {
//     intro: {
//       background: 'linear-gradient(135deg, #e0f7fa, #b2ebf2)',
//       borderLeft: '4px solid #00bcd4',
//       headerBg: '#e0f7fa',
//       headerBorder: '#b2ebf2'
//     },
//     photos: {
//       background: 'linear-gradient(135deg, #f3e5f5, #e1bee7)',
//       borderLeft: '4px solid #9c27b0',
//       headerBg: '#f3e5f5',
//       headerBorder: '#e1bee7'
//     },
//     friends: {
//       background: 'linear-gradient(135deg, #e8f5e9, #c8e6c9)',
//       borderLeft: '4px solid #4caf50',
//       headerBg: '#e8f5e9',
//       headerBorder: '#c8e6c9'
//     },
//     posts: {
//       background: 'linear-gradient(135deg, #fff3e0, #ffe0b2)',
//       borderLeft: '4px solid #ff9800',
//       headerBg: '#fff3e0',
//       headerBorder: '#ffe0b2'
//     },
//     createPost: {
//       background: 'linear-gradient(135deg, #e3f2fd, #bbdefb)',
//       borderLeft: '4px solid #2196f3',
//       headerBg: '#e3f2fd',
//       headerBorder: '#bbdefb'
//     }
//   };

//   useEffect(() => {
//     if (!id || id === 'undefined') {
//       navigate('/profile/public/me');
//       return;
//     }

//     if (id === 'me' && user?.id) {
//       navigate(`/profile/public/${user.id}`, { replace: true });
//       return;
//     }

//     dispatch(fetchPublicProfile(id));
//   }, [id, dispatch, navigate, user?.id]);

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
//       // Validate file type and size
//       if (!file.type.match('image.*')) {
//         console.error('Only image files are allowed');
//         return;
//       }

//       const maxSize = type === 'cover' ? 10 * 1024 * 1024 : 5 * 1024 * 1024; // 10MB for cover, 5MB for profile
//       if (file.size > maxSize) {
//         console.error(`Image size must be less than ${maxSize / (1024 * 1024)}MB`);
//         return;
//       }

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

//   const handleCrop = () => {
//     if (cropperRef.current) {
//       setCroppedImage(cropperRef.current.getCroppedCanvas().toDataURL());
//     }
//   };

//   const handleSavePhoto = async () => {
//     if (croppedImage) {
//       try {
//         const formData = new FormData();
//         const blob = await fetch(croppedImage).then(r => r.blob());
//         const file = new File([blob], `${uploadType}-${Date.now()}.jpg`, { type: 'image/jpeg' });
        
//         formData.append(uploadType === 'cover' ? 'coverImage' : 'profileImage', file);
        
//         await dispatch(updatePublicProfile({
//           userId: publicProfile.id,
//           formData
//         })).unwrap();

//         setShowCoverDialog(false);
//         setShowProfileDialog(false);
//         setImageToCrop(null);
//         setCroppedImage(null);
//       } catch (error) {
//         console.error('Failed to update photo:', error);
//       }
//     }
//   };

//   if (status === 'loading') {
//     return (
//       <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
//         <CircularProgress size={60} />
//       </Box>
//     );
//   }

//   if (error) {
//     return (
//       <Container maxWidth="lg" sx={{ mt: 4 }}>
//         <Alert severity="error" sx={{ mb: 3 }}>
//           <Typography variant="h6">Failed to load profile</Typography>
//           <Typography>Error: {error.message || 'Unknown error'}</Typography>
//         </Alert>
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
//         <Alert severity="warning" sx={{ mb: 3 }}>
//           Profile not found
//         </Alert>
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
//     { id: 1, content: "Just visited the new art museum!", date: "2 hours ago", likes: 24, comments: 5 },
//     { id: 2, content: "Working on a new project", date: "1 day ago", likes: 12, comments: 3 }
//   ];

//   const photos = [
//     { id: 1, url: "/photo1.jpg", caption: "Vacation" },
//     { id: 2, url: "/photo2.jpg", caption: "Friends" }
//   ];

//   const friends = Array(8).fill(0).map((_, i) => ({
//     id: i + 1,
//     name: `Friend ${i + 1}`,
//     avatar: `/avatar${(i % 3) + 1}.jpg`
//   }));

//   return (
//     <Container maxWidth="lg" sx={{ mt: 0, mb: 4 }}>
//       {/* Hidden file inputs */}
//       <input
//         type="file"
//         ref={coverInputRef}
//         onChange={(e) => handleFileChange(e, 'cover')}
//         accept="image/*"
//         style={{ display: 'none' }}
//       />
//       <input
//         type="file"
//         ref={profileInputRef}
//         onChange={(e) => handleFileChange(e, 'profile')}
//         accept="image/*"
//         style={{ display: 'none' }}
//       />

//       {/* Cover Photo Section */}
//       <Box sx={{ position: 'relative', mb: isMobile ? 15 : 10 }}>
//         <Box
//           sx={{
//             height: isMobile ? 200 : 350,
//             backgroundImage: `url(${coverImage})`,
//             backgroundSize: 'cover',
//             backgroundPosition: 'center',
//             backgroundColor: 'grey.200',
//             borderRadius: '8px 8px 0 0',
//             position: 'relative',
//             cursor: isOwnProfile ? 'pointer' : 'default',
//           }}
//           onMouseEnter={() => isOwnProfile && setCoverHover(true)}
//           onMouseLeave={() => isOwnProfile && setCoverHover(false)}
//           onClick={handleCoverPhotoClick}
//         >
//           {coverHover && isOwnProfile && (
//             <Box
//               sx={{
//                 position: 'absolute',
//                 bottom: 16,
//                 right: 16,
//                 backgroundColor: 'rgba(0,0,0,0.6)',
//                 borderRadius: 1,
//                 p: 1,
//                 display: 'flex',
//                 alignItems: 'center'
//               }}
//             >
//               <CameraAlt sx={{ color: 'white', mr: 1, fontSize: 20 }} />
//               <Typography variant="body2" color="white" fontWeight="500">
//                 Edit cover photo
//               </Typography>
//             </Box>
//           )}
//         </Box>
        
//         {/* Profile Avatar and Info Section */}
//         <Box sx={{ 
//           position: 'absolute', 
//           bottom: isMobile ? -80 : -60, 
//           left: isMobile ? '50%' : 16,
//           right: isMobile ? undefined : 16,
//           transform: isMobile ? 'translateX(-50%)' : 'none',
//           display: 'flex',
//           alignItems: 'flex-end',
//           justifyContent: isMobile ? 'center' : 'space-between',
//           width: isMobile ? 'auto' : 'calc(100% - 32px)',
//           flexDirection: isMobile ? 'column' : 'row',
//           textAlign: isMobile ? 'center' : 'left'
//         }}>
//           {/* Left Side - Profile Picture and Name */}
//           <Box sx={{ 
//             display: 'flex', 
//             alignItems: 'flex-end',
//             flexDirection: isMobile ? 'column' : 'row',
//             mb: isMobile ? 1 : 0
//           }}>
//             <Box sx={{ position: 'relative', mr: isMobile ? 0 : 2 }}>
//               <Avatar
//                 src={profileImage}
//                 sx={{
//                   width: isMobile ? 120 : 168,
//                   height: isMobile ? 120 : 168,
//                   border: '4px solid white',
//                   boxShadow: 3,
//                   cursor: isOwnProfile ? 'pointer' : 'default',
//                 }}
//                 onClick={handleProfilePhotoClick}
//               />
//               {isOwnProfile && (
//                 <IconButton
//                   sx={{
//                     position: 'absolute',
//                     bottom: 8,
//                     right: 8,
//                     backgroundColor: 'primary.main',
//                     color: 'white',
//                     '&:hover': {
//                       backgroundColor: 'primary.dark'
//                     }
//                   }}
//                   onClick={handleProfilePhotoClick}
//                 >
//                   <CameraAlt fontSize="small" />
//                 </IconButton>
//               )}
//             </Box>
            
//             <Box sx={{ mt: isMobile ? 1 : 0 }}>
//               <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 0.5 }}>
//                 {publicProfile.firstName} {publicProfile.lastName}
//               </Typography>
//               <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
//                 {publicProfile.friendsCount || 0} friends
//               </Typography>
//             </Box>
//           </Box>
          
//           {/* Right Side - Action Buttons */}
//           {!isMobile && (
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
//                     sx={{ backgroundColor: '#e4e6eb', color: '#050505' }}
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
//                     sx={{ fontWeight: 600 }}
//                   >
//                     {publicProfile.isFriend ? "Friends" : "Add Friend"}
//                   </Button>
//                   <Button 
//                     variant="contained" 
//                     sx={{ 
//                       backgroundColor: '#e4e6eb', 
//                       color: '#050505',
//                       fontWeight: 600
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
//               >
//                 <MenuItem onClick={() => {
//                   handleMenuClose();
//                   navigate('/about');
//                 }}>
//                   About
//                 </MenuItem>
//                 <MenuItem onClick={handleMenuClose}>Report</MenuItem>
//               </Menu>
//             </Box>
//           )}
//         </Box>
//       </Box>

//       {/* Mobile Action Buttons */}
//       {isMobile && isOwnProfile && (
//         <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mb: 2 }}>
//           <Button 
//             variant="contained" 
//             startIcon={<Add />}
//             size="small"
//             sx={{ 
//               background: 'linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366)',
//               color: 'white',
//             }}
//           >
//             Story
//           </Button>
//           <Button 
//             variant="contained" 
//             startIcon={<Edit />}
//             size="small"
//             sx={{ backgroundColor: '#e4e6eb', color: '#050505' }}
//             onClick={() => navigate(`/public-profile-update/${publicProfile.id}`)}
//           >
//             Edit
//           </Button>
//         </Box>
//       )}

//       {/* Tabs Section */}
//       <Box sx={{ 
//         borderBottom: 1, 
//         borderColor: 'divider', 
//         mb: 3,
//         '& .MuiTabs-indicator': {
//           backgroundColor: theme.palette.primary.main,
//           height: 3
//         }
//       }}>
//         <Tabs 
//           value={tabValue} 
//           onChange={handleTabChange}
//           variant={isMobile ? "scrollable" : "standard"}
//           scrollButtons="auto"
//           textColor="primary"
//         >
//           <Tab label="Posts" sx={{ fontWeight: 600 }} />
//           <Tab label="About" sx={{ fontWeight: 600 }} />
//           <Tab label="Friends" sx={{ fontWeight: 600 }} />
//           <Tab label="Photos" sx={{ fontWeight: 600 }} />
//           <Tab label="Videos" sx={{ fontWeight: 600 }} />
//         </Tabs>
//       </Box>

//       {/* Main Content */}
//       <Grid container spacing={3}>
//         {/* Left Column */}
//         <Grid item xs={12} md={4}>
//           {/* Intro Card */}
//           <Card sx={{ 
//             mb: 3, 
//             borderRadius: 2,
//             ...cardStyles.intro
//           }}>
//             <Box sx={{
//               p: 2,
//               backgroundColor: cardStyles.intro.headerBg,
//               borderBottom: `1px solid ${cardStyles.intro.headerBorder}`
//             }}>
//               <Typography variant="h6" sx={{ fontWeight: 600, color: '#00796b' }}>
//                 Intro
//               </Typography>
//             </Box>
//             <CardContent>
//               {publicProfile.bio && (
//                 <Typography paragraph sx={{ mb: 2 }}>
//                   {publicProfile.bio}
//                 </Typography>
//               )}
              
//               <Box sx={{ '& > div': { mb: 2 } }}>
//                 {formattedDate && (
//                   <Box sx={{ display: 'flex', alignItems: 'center' }}>
//                     <Cake color="action" sx={{ mr: 1 }} />
//                     <Typography>Born {formattedDate}</Typography>
//                   </Box>
//                 )}
                
//                 {publicProfile.location && (
//                   <Box sx={{ display: 'flex', alignItems: 'center' }}>
//                     <LocationOn color="action" sx={{ mr: 1 }} />
//                     <Typography>{publicProfile.location}</Typography>
//                   </Box>
//                 )}
                
//                 {publicProfile.website && (
//                   <Box sx={{ display: 'flex', alignItems: 'center' }}>
//                     <LinkIcon color="action" sx={{ mr: 1 }} />
//                     <Link href={publicProfile.website} target="_blank" rel="noopener">
//                       {publicProfile.website.replace(/^https?:\/\//, '')}
//                     </Link>
//                   </Box>
//                 )}
//               </Box>
              
//               {isOwnProfile && (
//                 <Button 
//                   variant="outlined" 
//                   fullWidth
//                   startIcon={<Edit />}
//                   sx={{ mt: 1 }}
//                   onClick={() => navigate('/public-profile-update')}
//                 >
//                   Edit Details
//                 </Button>
//               )}
//             </CardContent>
//           </Card>

//           {/* Photos Card */}
//           <Card sx={{ 
//             mb: 3, 
//             borderRadius: 2,
//             ...cardStyles.photos
//           }}>
//             <Box sx={{
//               p: 2,
//               backgroundColor: cardStyles.photos.headerBg,
//               borderBottom: `1px solid ${cardStyles.photos.headerBorder}`
//             }}>
//               <Typography variant="h6" sx={{ fontWeight: 600, color: '#7b1fa2' }}>
//                 Photos
//               </Typography>
//             </Box>
//             <CardContent>
//               <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
//                 <Button color="primary" onClick={() => navigate('/photos')}>
//                   See All Photos
//                 </Button>
//               </Box>
              
//               <Grid container spacing={1}>
//                 {photos.slice(0, 6).map((photo) => (
//                   <Grid item xs={4} key={photo.id}>
//                     <img 
//                       src={photo.url} 
//                       alt={photo.caption} 
//                       style={{ 
//                         width: '100%', 
//                         height: 100, 
//                         objectFit: 'cover',
//                         borderRadius: 4
//                       }}
//                     />
//                   </Grid>
//                 ))}
//               </Grid>
//             </CardContent>
//           </Card>

//           {/* Friends Card */}
//           <Card sx={{ 
//             borderRadius: 2,
//             ...cardStyles.friends
//           }}>
//             <Box sx={{
//               p: 2,
//               backgroundColor: cardStyles.friends.headerBg,
//               borderBottom: `1px solid ${cardStyles.friends.headerBorder}`
//             }}>
//               <Typography variant="h6" sx={{ fontWeight: 600, color: '#2e7d32' }}>
//                 Friends
//               </Typography>
//             </Box>
//             <CardContent>
//               <Typography color="text.secondary" sx={{ mb: 2 }}>
//                 {friends.length} friends
//               </Typography>
              
//               <Grid container spacing={1}>
//                 {friends.slice(0, 6).map((friend) => (
//                   <Grid item xs={4} key={friend.id}>
//                     <Box>
//                       <img 
//                         src={friend.avatar} 
//                         alt={friend.name} 
//                         style={{ 
//                           width: '100%', 
//                           height: 100, 
//                           objectFit: 'cover',
//                           borderRadius: 4
//                         }}
//                       />
//                       <Typography variant="body2" sx={{ mt: 0.5 }}>
//                         {friend.name}
//                       </Typography>
//                     </Box>
//                   </Grid>
//                 ))}
//               </Grid>
//             </CardContent>
//           </Card>
//         </Grid>

//         {/* Right Column - Posts */}
//         <Grid item xs={12} md={8}>
//           {/* Create Post (only for own profile) */}
//           {isOwnProfile && (
//             <Card sx={{ 
//               mb: 3, 
//               borderRadius: 2,
//               ...cardStyles.createPost
//             }}>
//               <CardContent>
//                 <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
//                   <Avatar src={profileImage} sx={{ mr: 1 }} />
//                   <Button 
//                     variant="outlined" 
//                     fullWidth
//                     sx={{ justifyContent: 'flex-start' }}
//                     onClick={() => navigate('/create-post')}
//                   >
//                     What's on your mind?
//                   </Button>
//                 </Box>
//                 <Divider sx={{ my: 1 }} />
//                 <Box sx={{ display: 'flex', justifyContent: 'space-around' }}>
//                   <Button startIcon={<PhotoLibrary color="primary" />}>Photo</Button>
//                   <Button startIcon={<VideoLibrary color="secondary" />}>Video</Button>
//                   <Button startIcon={<Event color="success" />}>Event</Button>
//                 </Box>
//               </CardContent>
//             </Card>
//           )}

//           {/* Posts */}
//           {posts.map((post) => (
//             <Card key={post.id} sx={{ 
//               mb: 3, 
//               borderRadius: 2,
//               ...cardStyles.posts
//             }}>
//               <CardContent>
//                 <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
//                   <Avatar src={profileImage} sx={{ mr: 1 }} />
//                   <Box>
//                     <Typography fontWeight="500">
//                       {publicProfile.firstName} {publicProfile.lastName}
//                     </Typography>
//                     <Typography variant="body2" color="text.secondary">
//                       {post.date}
//                     </Typography>
//                   </Box>
//                 </Box>
                
//                 <Typography paragraph sx={{ mb: 2 }}>
//                   {post.content}
//                 </Typography>
                
//                 <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
//                   <Chip 
//                     label={`${post.likes} likes`}
//                     size="small"
//                     sx={{ mr: 1 }}
//                   />
//                   <Chip 
//                     label={`${post.comments} comments`}
//                     size="small"
//                   />
//                 </Box>
                
//                 <Divider sx={{ my: 1 }} />
                
//                 <Box sx={{ display: 'flex', justifyContent: 'space-around' }}>
//                   <Button startIcon={<ThumbUp />}>Like</Button>
//                   <Button startIcon={<Comment />}>Comment</Button>
//                   <Button startIcon={<Share />}>Share</Button>
//                 </Box>
//               </CardContent>
//             </Card>
//           ))}
//         </Grid>
//       </Grid>

//       {/* Photo Upload Dialogs */}
//       <PhotoUploadDialog
//         open={showCoverDialog}
//         onClose={() => setShowCoverDialog(false)}
//         title="Update Cover Photo"
//         aspectRatio={16/9}
//         imageToCrop={imageToCrop}
//         cropperRef={cropperRef}
//         handleCrop={handleCrop}
//         handleSave={handleSavePhoto}
//         loading={updatePhotoStatus === 'loading'}
//       />

//       <PhotoUploadDialog
//         open={showProfileDialog}
//         onClose={() => setShowProfileDialog(false)}
//         title="Update Profile Picture"
//         aspectRatio={1}
//         imageToCrop={imageToCrop}
//         cropperRef={cropperRef}
//         handleCrop={handleCrop}
//         handleSave={handleSavePhoto}
//         loading={updatePhotoStatus === 'loading'}
//       />

//       {/* Loading backdrop */}
//       <Backdrop
//         sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
//         open={updatePhotoStatus === 'loading'}
//       >
//         <CircularProgress color="inherit" />
//       </Backdrop>
//     </Container>
//   );
// };

// // Reusable Photo Upload Dialog Component
// const PhotoUploadDialog = ({
//   open,
//   onClose,
//   title,
//   aspectRatio,
//   imageToCrop,
//   cropperRef,
//   handleCrop,
//   handleSave,
//   loading
// }) => (
//   <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
//     <DialogTitle>
//       <Box display="flex" justifyContent="space-between" alignItems="center">
//         <Typography variant="h6">{title}</Typography>
//         <IconButton onClick={onClose} disabled={loading}>
//           <Close />
//         </IconButton>
//       </Box>
//     </DialogTitle>
//     <DialogContent>
//       <Box sx={{ height: 400 }}>
//         {imageToCrop && (
//           <Cropper
//             src={imageToCrop}
//             style={{ height: 400, width: '100%' }}
//             initialAspectRatio={aspectRatio}
//             guides={true}
//             ref={cropperRef}
//             viewMode={1}
//             dragMode="move"
//             cropBoxMovable={true}
//             cropBoxResizable={true}
//             toggleDragModeOnDblclick={false}
//             crop={handleCrop}
//           />
//         )}
//       </Box>
//     </DialogContent>
//     <DialogActions>
//       <Button onClick={onClose} disabled={loading}>
//         Cancel
//       </Button>
//       <Button 
//         variant="contained" 
//         color="primary"
//         onClick={handleSave}
//         disabled={loading}
//         startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
//       >
//         {loading ? 'Saving...' : 'Save Changes'}
//       </Button>
//     </DialogActions>
//   </Dialog>
// );

// export default PublicProfilePage;




//! running
// import {
//   Add,
//   Cake,
//   CameraAlt,
//   Close,
//   Comment,
//   Edit,
//   Event,
//   Link as LinkIcon,
//   LocationOn,
//   MoreVert,
//   PhotoLibrary,
//   Share,
//   ThumbUp,
//   VideoLibrary,
//   ArrowBack
// } from '@mui/icons-material';
// import {
//   Alert,
//   Avatar,
//   Backdrop,
//   Box,
//   Button,
//   Card,
//   CardContent,
//   Chip,
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
// import 'cropperjs/dist/cropper.css';
// import { useEffect, useRef, useState } from 'react';
// import Cropper from 'react-cropper';
// import { useDispatch, useSelector } from 'react-redux';
// import { useNavigate, useParams } from 'react-router-dom';
// import { fetchPublicProfile, updatePublicProfile } from '../../features/user/userSlice';

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
//   const [showCoverDialog, setShowCoverDialog] = useState(false);
//   const [showProfileDialog, setShowProfileDialog] = useState(false);
//   const [imageToCrop, setImageToCrop] = useState(null);
//   const [croppedImage, setCroppedImage] = useState(null);
//   const [uploadType, setUploadType] = useState(null);
//   const [anchorEl, setAnchorEl] = useState(null);
//   const coverInputRef = useRef(null);
//   const profileInputRef = useRef(null);
//   const cropperRef = useRef(null);

//   // Color scheme for cards
//   const cardStyles = {
//     intro: {
//       background: 'linear-gradient(135deg, #e0f7fa, #b2ebf2)',
//       borderLeft: '4px solid #00bcd4',
//       headerBg: '#e0f7fa',
//       headerBorder: '#b2ebf2'
//     },
//     photos: {
//       background: 'linear-gradient(135deg, #f3e5f5, #e1bee7)',
//       borderLeft: '4px solid #9c27b0',
//       headerBg: '#f3e5f5',
//       headerBorder: '#e1bee7'
//     },
//     friends: {
//       background: 'linear-gradient(135deg, #e8f5e9, #c8e6c9)',
//       borderLeft: '4px solid #4caf50',
//       headerBg: '#e8f5e9',
//       headerBorder: '#c8e6c9'
//     },
//     posts: {
//       background: 'linear-gradient(135deg, #fff3e0, #ffe0b2)',
//       borderLeft: '4px solid #ff9800',
//       headerBg: '#fff3e0',
//       headerBorder: '#ffe0b2'
//     },
//     createPost: {
//       background: 'linear-gradient(135deg, #e3f2fd, #bbdefb)',
//       borderLeft: '4px solid #2196f3',
//       headerBg: '#e3f2fd',
//       headerBorder: '#bbdefb'
//     }
//   };

//   useEffect(() => {
//     if (!id || id === 'undefined') {
//       navigate('/profile/public/me');
//       return;
//     }

//     if (id === 'me' && user?.id) {
//       navigate(`/profile/public/${user.id}`, { replace: true });
//       return;
//     }

//     dispatch(fetchPublicProfile(id));
//   }, [id, dispatch, navigate, user?.id]);

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

//   const handleCrop = () => {
//     if (cropperRef.current) {
//       setCroppedImage(cropperRef.current.getCroppedCanvas().toDataURL());
//     }
//   };

//   // const handleSavePhoto = () => {
//   //   if (croppedImage) {
//   //     dispatch(updatePublicProfile({
//   //       userId: publicProfile.id,
//   //       [uploadType === 'cover' ? 'coverImage' : 'profileImage']: croppedImage
//   //     })).then(() => {
//   //       setShowCoverDialog(false);
//   //       setShowProfileDialog(false);
//   //       setImageToCrop(null);
//   //       setCroppedImage(null);
//   //     });
//   //   }
//   // };


// // In PublicProfilePage.jsx
// const handleSavePhoto = async () => {
//   if (croppedImage) {
//     try {
//       const formData = new FormData();
//       const blob = await fetch(croppedImage).then(r => r.blob());
//       const file = new File([blob], `${uploadType}-${Date.now()}.jpg`, { type: 'image/jpeg' });
      
//       formData.append(uploadType === 'cover' ? 'coverImage' : 'profileImage', file);
      
//       await dispatch(updatePublicProfile({
//         userId: publicProfile.id,
//         formData
//       })).unwrap();

//       setShowCoverDialog(false);
//       setShowProfileDialog(false);
//       setImageToCrop(null);
//       setCroppedImage(null);
//     } catch (error) {
//       console.error('Failed to update photo:', error);
//     }
//   }
// };

//   if (status === 'loading') {
//     return (
//       <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
//         <CircularProgress size={60} />
//       </Box>
//     );
//   }

//   if (error) {
//     return (
//       <Container maxWidth="lg" sx={{ mt: 4 }}>
//         <Alert severity="error" sx={{ mb: 3 }}>
//           <Typography variant="h6">Failed to load profile</Typography>
//           <Typography>Error: {error.message || 'Unknown error'}</Typography>
//         </Alert>
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
//         <Alert severity="warning" sx={{ mb: 3 }}>
//           Profile not found
//         </Alert>
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
//     { id: 1, content: "Just visited the new art museum!", date: "2 hours ago", likes: 24, comments: 5 },
//     { id: 2, content: "Working on a new project", date: "1 day ago", likes: 12, comments: 3 }
//   ];

//   const photos = [
//     { id: 1, url: "/photo1.jpg", caption: "Vacation" },
//     { id: 2, url: "/photo2.jpg", caption: "Friends" }
//   ];

//   const friends = Array(8).fill(0).map((_, i) => ({
//     id: i + 1,
//     name: `Friend ${i + 1}`,
//     avatar: `/avatar${(i % 3) + 1}.jpg`
//   }));

//   return (
//     <Container maxWidth="lg" sx={{ mt: 0, mb: 4 }}>
//       {/* Hidden file inputs */}
//       <input
//         type="file"
//         ref={coverInputRef}
//         onChange={(e) => handleFileChange(e, 'cover')}
//         accept="image/*"
//         style={{ display: 'none' }}
//       />
//       <input
//         type="file"
//         ref={profileInputRef}
//         onChange={(e) => handleFileChange(e, 'profile')}
//         accept="image/*"
//         style={{ display: 'none' }}
//       />

//       {/* Cover Photo Section */}
//       <Box sx={{ position: 'relative', mb: 10 }}>
//         <Box
//           sx={{
//             height: 350,
//             backgroundImage: `url(${coverImage})`,
//             backgroundSize: 'cover',
//             backgroundPosition: 'center',
//             backgroundColor: 'grey.200',
//             borderRadius: '8px 8px 0 0',
//             position: 'relative',
//             cursor: isOwnProfile ? 'pointer' : 'default',
//           }}
//           onMouseEnter={() => isOwnProfile && setCoverHover(true)}
//           onMouseLeave={() => isOwnProfile && setCoverHover(false)}
//           onClick={handleCoverPhotoClick}
//         >
//           {coverHover && isOwnProfile && (
//             <Box
//               sx={{
//                 position: 'absolute',
//                 bottom: 16,
//                 right: 16,
//                 backgroundColor: 'rgba(0,0,0,0.6)',
//                 borderRadius: 1,
//                 p: 1,
//                 display: 'flex',
//                 alignItems: 'center'
//               }}
//             >
//               <CameraAlt sx={{ color: 'white', mr: 1, fontSize: 20 }} />
//               <Typography variant="body2" color="white" fontWeight="500">
//                 Edit cover photo
//               </Typography>
//             </Box>
//           )}
//         </Box>
        
//         {/* Profile Avatar and Info Section */}
//         <Box sx={{ 
//           position: 'absolute', 
//           bottom: -60, 
//           left: 16,
//           right: 16,
//           display: 'flex',
//           alignItems: 'flex-end',
//           justifyContent: 'space-between'
//         }}>
//           {/* Left Side - Profile Picture and Name */}
//           <Box sx={{ display: 'flex', alignItems: 'flex-end' }}>
//             <Box sx={{ position: 'relative', mr: 2 }}>
//               <Avatar
//                 src={profileImage}
//                 sx={{
//                   width: 168,
//                   height: 168,
//                   border: '4px solid white',
//                   boxShadow: 3,
//                   cursor: isOwnProfile ? 'pointer' : 'default',
//                 }}
//                 onClick={handleProfilePhotoClick}
//               />
//               {isOwnProfile && (
//                 <IconButton
//                   sx={{
//                     position: 'absolute',
//                     bottom: 8,
//                     right: 8,
//                     backgroundColor: 'primary.main',
//                     color: 'white',
//                     '&:hover': {
//                       backgroundColor: 'primary.dark'
//                     }
//                   }}
//                   onClick={handleProfilePhotoClick}
//                 >
//                   <CameraAlt fontSize="small" />
//                 </IconButton>
//               )}
//             </Box>
            
//             <Box>
//               <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 0.5 }}>
//                 {publicProfile.firstName} {publicProfile.lastName}
//               </Typography>
//               <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
//                 {publicProfile.friendsCount || 0} friends
//               </Typography>
//             </Box>
//           </Box>
          
//           {/* Right Side - Action Buttons */}
//           <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
//             {isOwnProfile ? (
//               <>
//                 <Button 
//                   variant="contained" 
//                   startIcon={<Add />}
//                   sx={{ 
//                     background: 'linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366)',
//                     color: 'white',
//                     '&:hover': {
//                       background: 'linear-gradient(45deg, #e6683c, #dc2743, #cc2366, #bc1888)'
//                     }
//                   }}
//                 >
//                   Add to story
//                 </Button>
//                 {/* <Button 
//                   variant="contained" 
//                   startIcon={<Edit />}
//                   sx={{ backgroundColor: '#e4e6eb', color: '#050505' }}
//                   onClick={() => navigate('/public-profile-update')}
//                 >
//                   Edit profile
//                 </Button> */}

//                 {/* // Update the Edit Profile button in PublicProfilePage.jsx */}
// <Button 
//   variant="contained" 
//   startIcon={<Edit />}
//   sx={{ backgroundColor: '#e4e6eb', color: '#050505' }}
//   onClick={() => navigate(`/public-profile-update/${publicProfile.id}`)}
// >
//   Edit profile
// </Button>
//               </>
//             ) : (
//               <>
//                 <Button 
//                   variant="contained" 
//                   color="primary"
//                   sx={{ fontWeight: 600 }}
//                 >
//                   {publicProfile.isFriend ? "Friends" : "Add Friend"}
//                 </Button>
//                 <Button 
//                   variant="contained" 
//                   sx={{ 
//                     backgroundColor: '#e4e6eb', 
//                     color: '#050505',
//                     fontWeight: 600
//                   }}
//                 >
//                   Message
//                 </Button>
//               </>
//             )}
//             <IconButton 
//               sx={{ 
//                 backgroundColor: '#e4e6eb',
//                 '&:hover': {
//                   backgroundColor: '#d8dadf'
//                 }
//               }}
//               onClick={handleMenuOpen}
//             >
//               <MoreVert sx={{ color: '#050505' }} />
//             </IconButton>
//             <Menu
//               anchorEl={anchorEl}
//               open={Boolean(anchorEl)}
//               onClose={handleMenuClose}
//             >
//               <MenuItem onClick={() => {
//                 handleMenuClose();
//                 navigate('/about');
//               }}>
//                 About
//               </MenuItem>
//               <MenuItem onClick={handleMenuClose}>Report</MenuItem>
//             </Menu>
//           </Box>
//         </Box>
//       </Box>

//       {/* Tabs Section */}
//       <Box sx={{ 
//         borderBottom: 1, 
//         borderColor: 'divider', 
//         mb: 3,
//         '& .MuiTabs-indicator': {
//           backgroundColor: theme.palette.primary.main,
//           height: 3
//         }
//       }}>
//         <Tabs 
//           value={tabValue} 
//           onChange={handleTabChange}
//           variant="scrollable"
//           scrollButtons="auto"
//           textColor="primary"
//         >
//           <Tab label="Posts" sx={{ fontWeight: 600 }} />
//           <Tab label="About" sx={{ fontWeight: 600 }} />
//           <Tab label="Friends" sx={{ fontWeight: 600 }} />
//           <Tab label="Photos" sx={{ fontWeight: 600 }} />
//           <Tab label="Videos" sx={{ fontWeight: 600 }} />
//         </Tabs>
//       </Box>

//       {/* Main Content */}
//       <Grid container spacing={3}>
//         {/* Left Column */}
//         <Grid item xs={12} md={4}>
//           {/* Intro Card */}
//           <Card sx={{ 
//             mb: 3, 
//             borderRadius: 2,
//             ...cardStyles.intro
//           }}>
//             <Box sx={{
//               p: 2,
//               backgroundColor: cardStyles.intro.headerBg,
//               borderBottom: `1px solid ${cardStyles.intro.headerBorder}`
//             }}>
//               <Typography variant="h6" sx={{ fontWeight: 600, color: '#00796b' }}>
//                 Intro
//               </Typography>
//             </Box>
//             <CardContent>
//               {publicProfile.bio && (
//                 <Typography paragraph sx={{ mb: 2 }}>
//                   {publicProfile.bio}
//                 </Typography>
//               )}
              
//               <Box sx={{ '& > div': { mb: 2 } }}>
//                 {formattedDate && (
//                   <Box sx={{ display: 'flex', alignItems: 'center' }}>
//                     <Cake color="action" sx={{ mr: 1 }} />
//                     <Typography>Born {formattedDate}</Typography>
//                   </Box>
//                 )}
                
//                 {publicProfile.location && (
//                   <Box sx={{ display: 'flex', alignItems: 'center' }}>
//                     <LocationOn color="action" sx={{ mr: 1 }} />
//                     <Typography>{publicProfile.location}</Typography>
//                   </Box>
//                 )}
                
//                 {publicProfile.website && (
//                   <Box sx={{ display: 'flex', alignItems: 'center' }}>
//                     <LinkIcon color="action" sx={{ mr: 1 }} />
//                     <Link href={publicProfile.website} target="_blank" rel="noopener">
//                       {publicProfile.website.replace(/^https?:\/\//, '')}
//                     </Link>
//                   </Box>
//                 )}
//               </Box>
              
//               {isOwnProfile && (
//                 <Button 
//                   variant="outlined" 
//                   fullWidth
//                   startIcon={<Edit />}
//                   sx={{ mt: 1 }}
//                   onClick={() => navigate('/public-profile-update')}
//                 >
//                   Edit Details
//                 </Button>
//               )}
//             </CardContent>
//           </Card>

//           {/* Photos Card */}
//           <Card sx={{ 
//             mb: 3, 
//             borderRadius: 2,
//             ...cardStyles.photos
//           }}>
//             <Box sx={{
//               p: 2,
//               backgroundColor: cardStyles.photos.headerBg,
//               borderBottom: `1px solid ${cardStyles.photos.headerBorder}`
//             }}>
//               <Typography variant="h6" sx={{ fontWeight: 600, color: '#7b1fa2' }}>
//                 Photos
//               </Typography>
//             </Box>
//             <CardContent>
//               <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
//                 <Button color="primary" onClick={() => navigate('/photos')}>
//                   See All Photos
//                 </Button>
//               </Box>
              
//               <Grid container spacing={1}>
//                 {photos.slice(0, 6).map((photo) => (
//                   <Grid item xs={4} key={photo.id}>
//                     <img 
//                       src={photo.url} 
//                       alt={photo.caption} 
//                       style={{ 
//                         width: '100%', 
//                         height: 100, 
//                         objectFit: 'cover',
//                         borderRadius: 4
//                       }}
//                     />
//                   </Grid>
//                 ))}
//               </Grid>
//             </CardContent>
//           </Card>

//           {/* Friends Card */}
//           <Card sx={{ 
//             borderRadius: 2,
//             ...cardStyles.friends
//           }}>
//             <Box sx={{
//               p: 2,
//               backgroundColor: cardStyles.friends.headerBg,
//               borderBottom: `1px solid ${cardStyles.friends.headerBorder}`
//             }}>
//               <Typography variant="h6" sx={{ fontWeight: 600, color: '#2e7d32' }}>
//                 Friends
//               </Typography>
//             </Box>
//             <CardContent>
//               <Typography color="text.secondary" sx={{ mb: 2 }}>
//                 {friends.length} friends
//               </Typography>
              
//               <Grid container spacing={1}>
//                 {friends.slice(0, 6).map((friend) => (
//                   <Grid item xs={4} key={friend.id}>
//                     <Box>
//                       <img 
//                         src={friend.avatar} 
//                         alt={friend.name} 
//                         style={{ 
//                           width: '100%', 
//                           height: 100, 
//                           objectFit: 'cover',
//                           borderRadius: 4
//                         }}
//                       />
//                       <Typography variant="body2" sx={{ mt: 0.5 }}>
//                         {friend.name}
//                       </Typography>
//                     </Box>
//                   </Grid>
//                 ))}
//               </Grid>
//             </CardContent>
//           </Card>
//         </Grid>

//         {/* Right Column - Posts */}
//         <Grid item xs={12} md={8}>
//           {/* Create Post (only for own profile) */}
//           {isOwnProfile && (
//             <Card sx={{ 
//               mb: 3, 
//               borderRadius: 2,
//               ...cardStyles.createPost
//             }}>
//               <CardContent>
//                 <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
//                   <Avatar src={profileImage} sx={{ mr: 1 }} />
//                   <Button 
//                     variant="outlined" 
//                     fullWidth
//                     sx={{ justifyContent: 'flex-start' }}
//                     onClick={() => navigate('/create-post')}
//                   >
//                     What's on your mind?
//                   </Button>
//                 </Box>
//                 <Divider sx={{ my: 1 }} />
//                 <Box sx={{ display: 'flex', justifyContent: 'space-around' }}>
//                   <Button startIcon={<PhotoLibrary color="primary" />}>Photo</Button>
//                   <Button startIcon={<VideoLibrary color="secondary" />}>Video</Button>
//                   <Button startIcon={<Event color="success" />}>Event</Button>
//                 </Box>
//               </CardContent>
//             </Card>
//           )}

//           {/* Posts */}
//           {posts.map((post) => (
//             <Card key={post.id} sx={{ 
//               mb: 3, 
//               borderRadius: 2,
//               ...cardStyles.posts
//             }}>
//               <CardContent>
//                 <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
//                   <Avatar src={profileImage} sx={{ mr: 1 }} />
//                   <Box>
//                     <Typography fontWeight="500">
//                       {publicProfile.firstName} {publicProfile.lastName}
//                     </Typography>
//                     <Typography variant="body2" color="text.secondary">
//                       {post.date}
//                     </Typography>
//                   </Box>
//                 </Box>
                
//                 <Typography paragraph sx={{ mb: 2 }}>
//                   {post.content}
//                 </Typography>
                
//                 <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
//                   <Chip 
//                     label={`${post.likes} likes`}
//                     size="small"
//                     sx={{ mr: 1 }}
//                   />
//                   <Chip 
//                     label={`${post.comments} comments`}
//                     size="small"
//                   />
//                 </Box>
                
//                 <Divider sx={{ my: 1 }} />
                
//                 <Box sx={{ display: 'flex', justifyContent: 'space-around' }}>
//                   <Button startIcon={<ThumbUp />}>Like</Button>
//                   <Button startIcon={<Comment />}>Comment</Button>
//                   <Button startIcon={<Share />}>Share</Button>
//                 </Box>
//               </CardContent>
//             </Card>
//           ))}
//         </Grid>
//       </Grid>

//       {/* Photo Upload Dialogs */}
//       <PhotoUploadDialog
//         open={showCoverDialog}
//         onClose={() => setShowCoverDialog(false)}
//         title="Update Cover Photo"
//         aspectRatio={16/9}
//         imageToCrop={imageToCrop}
//         cropperRef={cropperRef}
//         handleCrop={handleCrop}
//         handleSave={handleSavePhoto}
//         loading={updatePhotoStatus === 'loading'}
//       />

//       <PhotoUploadDialog
//         open={showProfileDialog}
//         onClose={() => setShowProfileDialog(false)}
//         title="Update Profile Picture"
//         aspectRatio={1}
//         imageToCrop={imageToCrop}
//         cropperRef={cropperRef}
//         handleCrop={handleCrop}
//         handleSave={handleSavePhoto}
//         loading={updatePhotoStatus === 'loading'}
//       />

//       {/* Loading backdrop */}
//       <Backdrop
//         sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
//         open={updatePhotoStatus === 'loading'}
//       >
//         <CircularProgress color="inherit" />
//       </Backdrop>
//     </Container>
//   );
// };

// // Reusable Photo Upload Dialog Component
// const PhotoUploadDialog = ({
//   open,
//   onClose,
//   title,
//   aspectRatio,
//   imageToCrop,
//   cropperRef,
//   handleCrop,
//   handleSave,
//   loading
// }) => (
//   <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
//     <DialogTitle>
//       <Box display="flex" justifyContent="space-between" alignItems="center">
//         <Typography variant="h6">{title}</Typography>
//         <IconButton onClick={onClose} disabled={loading}>
//           <Close />
//         </IconButton>
//       </Box>
//     </DialogTitle>
//     <DialogContent>
//       <Box sx={{ height: 400 }}>
//         {imageToCrop && (
//           <Cropper
//             src={imageToCrop}
//             style={{ height: 400, width: '100%' }}
//             initialAspectRatio={aspectRatio}
//             guides={true}
//             ref={cropperRef}
//             viewMode={1}
//             dragMode="move"
//             cropBoxMovable={true}
//             cropBoxResizable={true}
//             toggleDragModeOnDblclick={false}
//             crop={handleCrop}
//           />
//         )}
//       </Box>
//     </DialogContent>
//     <DialogActions>
//       <Button onClick={onClose} disabled={loading}>
//         Cancel
//       </Button>
//       <Button 
//         variant="contained" 
//         color="primary"
//         onClick={handleSave}
//         disabled={loading}
//         startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
//       >
//         {loading ? 'Saving...' : 'Save Changes'}
//       </Button>
//     </DialogActions>
//   </Dialog>
// );

// export default PublicProfilePage;












//! main
// import {
//   Cake,
//   CameraAlt,
//   Close,
//   Comment,
//   Edit,
//   Event,
//   Link as LinkIcon,
//   LocationOn,
//   MoreVert,
//   PhotoLibrary,
//   Share,
//   ThumbUp,
//   VideoLibrary
// } from '@mui/icons-material';
// import {
//   Alert,
//   Avatar,
//   Backdrop,
//   Box,
//   Button,
//   Card,
//   CardContent,
//   Chip,
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
//   Tab,
//   Tabs,
//   Typography
// } from '@mui/material';
// import 'cropperjs/dist/cropper.css';
// import { useEffect, useRef, useState } from 'react';
// import Cropper from 'react-cropper';
// import { useDispatch, useSelector } from 'react-redux';
// import { useNavigate, useParams } from 'react-router-dom';
// import { fetchPublicProfile, updatePublicProfile } from '../../features/user/userSlice';

// const PublicProfilePage = () => {
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
//   const [showCoverDialog, setShowCoverDialog] = useState(false);
//   const [showProfileDialog, setShowProfileDialog] = useState(false);
//   const [imageToCrop, setImageToCrop] = useState(null);
//   const [croppedImage, setCroppedImage] = useState(null);
//   const [uploadType, setUploadType] = useState(null); // 'cover' or 'profile'
//   const coverInputRef = useRef(null);
//   const profileInputRef = useRef(null);
//   const cropperRef = useRef(null);

//   useEffect(() => {
//     if (!id || id === 'undefined') {
//       navigate('/profile/pubnic');
//       return;
//     }

//     if (id === 'me' && user?.id) {
//       navigate(`/profile/public/${user.id}`, { replace: true });
//       return;
//     }

//     dispatch(fetchPublicProfile(id));
//   }, [id, dispatch, navigate, user?.id]);

//   const handleTabChange = (event, newValue) => {
//     setTabValue(newValue);
//   };

//   const handleRetry = () => {
//     dispatch(fetchPublicProfile(id));
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
//     e.target.value = null; // Reset input
//   };

//   const handleCrop = () => {
//     if (cropperRef.current) {
//       setCroppedImage(cropperRef.current.getCroppedCanvas().toDataURL());
//     }
//   };

//   const handleSavePhoto = () => {
//     if (croppedImage) {
//       const action = uploadType === 'cover' ? updatePublicProfile : updatePublicProfile;
//       dispatch(action({
//         userId: publicProfile.id,
//         image: croppedImage
//       })).then(() => {
//         setShowCoverDialog(false);
//         setShowProfileDialog(false);
//         setImageToCrop(null);
//         setCroppedImage(null);
//       });
//     }
//   };

//   if (status === 'loading') {
//     return (
//       <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
//         <CircularProgress size={60} />
//       </Box>
//     );
//   }

//   if (error) {
//     return (
//       <Container maxWidth="lg" sx={{ mt: 4 }}>
//         <Alert severity="error" sx={{ mb: 3 }}>
//           <Typography variant="h6">Failed to load profile</Typography>
//           <Typography>Error: {error.message || 'Unknown error'}</Typography>
//           {error.status && <Typography>Status Code: {error.status}</Typography>}
//         </Alert>
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
//         <Alert severity="warning" sx={{ mb: 3 }}>
//           Profile not found
//         </Alert>
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

//   // Dynamic image handling with fallbacks
//   const profileImage = publicProfile.profileImage || '/default-avatar.png';
//   const coverImage = publicProfile.coverImage || '/default-cover.jpg';

//   // Mock data for demonstration
//   const posts = [
//     { id: 1, content: "Just visited the new art museum!", date: "2 hours ago", likes: 24, comments: 5 },
//     { id: 2, content: "Working on a new project", date: "1 day ago", likes: 12, comments: 3 }
//   ];

//   const photos = [
//     { id: 1, url: "/photo1.jpg", caption: "Vacation" },
//     { id: 2, url: "/photo2.jpg", caption: "Friends" }
//   ];

//   const friends = Array(8).fill(0).map((_, i) => ({
//     id: i + 1,
//     name: `Friend ${i + 1}`,
//     avatar: `/avatar${(i % 3) + 1}.jpg`
//   }));

//   return (
//     <Container maxWidth="lg" sx={{ mt: 0, mb: 4 }}>
//       {/* Hidden file inputs */}
//       <input
//         type="file"
//         ref={coverInputRef}
//         onChange={(e) => handleFileChange(e, 'cover')}
//         accept="image/*"
//         style={{ display: 'none' }}
//       />
//       <input
//         type="file"
//         ref={profileInputRef}
//         onChange={(e) => handleFileChange(e, 'profile')}
//         accept="image/*"
//         style={{ display: 'none' }}
//       />

//       {/* Cover Photo with Profile Avatar */}
//       <Box sx={{ position: 'relative', mb: 8 }}>
//         <Box
//           sx={{
//             height: 350,
//             backgroundImage: `url(${coverImage})`,
//             backgroundSize: 'cover',
//             backgroundPosition: 'center',
//             backgroundColor: 'grey.200',
//             borderRadius: 2,
//             position: 'relative',
//             cursor: isOwnProfile ? 'pointer' : 'default',
//           }}
//           onMouseEnter={() => isOwnProfile && setCoverHover(true)}
//           onMouseLeave={() => isOwnProfile && setCoverHover(false)}
//           onClick={handleCoverPhotoClick}
//         >
//           {coverHover && isOwnProfile && (
//             <Box
//               sx={{
//                 position: 'absolute',
//                 top: 0,
//                 left: 0,
//                 right: 0,
//                 bottom: 0,
//                 backgroundColor: 'rgba(0, 0, 0, 0.5)',
//                 display: 'flex',
//                 flexDirection: 'column',
//                 justifyContent: 'center',
//                 alignItems: 'center',
//                 borderRadius: 2,
//                 transition: 'opacity 0.3s ease',
//               }}
//             >
//               <CameraAlt sx={{ color: 'white', fontSize: 40, mb: 1 }} />
//               <Typography variant="body1" color="white" fontWeight="500">
//                 Update Cover Photo
//               </Typography>
//             </Box>
//           )}
//         </Box>
        
//         <Box sx={{ 
//           position: 'absolute', 
//           bottom: -64, 
//           left: 16,
//           display: 'flex',
//           alignItems: 'flex-end',
//           width: 'calc(100% - 32px)'
//         }}>
//           <Box sx={{ position: 'relative' }}>
//             <Avatar
//               src={profileImage}
//               sx={{
//                 width: 168,
//                 height: 168,
//                 border: '4px solid white',
//                 boxShadow: 3,
//                 cursor: isOwnProfile ? 'pointer' : 'default',
//               }}
//               onClick={handleProfilePhotoClick}
//             />
//             {isOwnProfile && (
//               <IconButton
//                 sx={{
//                   position: 'absolute',
//                   bottom: 8,
//                   right: 8,
//                   backgroundColor: 'primary.main',
//                   color: 'white',
//                   '&:hover': {
//                     backgroundColor: 'primary.dark'
//                   }
//                 }}
//                 onClick={handleProfilePhotoClick}
//               >
//                 <CameraAlt fontSize="small" />
//               </IconButton>
//             )}
//           </Box>
          
//           <Box sx={{ flex: 1, display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
//             {isOwnProfile ? (
//               <Button 
//                 variant="contained" 
//                 startIcon={<Edit />}
//                 sx={{ mr: 1 }}
//                 onClick={() => navigate('/public-profile-update')}
//               >
//                 Edit Profile
//               </Button>
//             ) : (
//               <>
//                 <Button 
//                   variant="contained" 
//                   color="primary"
//                   sx={{ mr: 1 }}
//                 >
//                   {publicProfile.isFriend ? "Friends" : "Add Friend"}
//                 </Button>
//                 <Button variant="contained" sx={{ mr: 1 }}>
//                   Message
//                 </Button>
//               </>
//             )}
//             <Button variant="contained">
//               <MoreVert />
//             </Button>
//           </Box>
//         </Box>
//       </Box>

//       {/* Profile Info Section */}
//       <Box sx={{ mb: 3, pl: 2 }}>
//         <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
//           {publicProfile.firstName} {publicProfile.lastName}
//         </Typography>
//         <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
//           {publicProfile.headline || 'Welcome to my profile'}
//         </Typography>
        
//         <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
//           {publicProfile.friendsCount && (
//             <Chip 
//               label={`${publicProfile.friendsCount} friends`}
//               variant="outlined"
//               size="small"
//             />
//           )}
//           {publicProfile.location && (
//             <Chip 
//               label={publicProfile.location}
//               variant="outlined"
//               size="small"
//               icon={<LocationOn fontSize="small" />}
//             />
//           )}
//         </Box>
//       </Box>

//       {/* Tabs Section */}
//       <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
//         <Tabs 
//           value={tabValue} 
//           onChange={handleTabChange}
//           variant="scrollable"
//           scrollButtons="auto"
//         >
//           <Tab label="Posts" />
//           <Tab label="About" />
//           <Tab label="Friends" />
//           <Tab label="Photos" />
//           <Tab label="Videos" />
//           <Tab label="More" />
//         </Tabs>
//       </Box>

//       {/* Main Content */}
//       <Grid container spacing={3}>
//         {/* Left Column - Intro Card */}
//         <Grid item xs={12} md={4}>
//           <Card sx={{ mb: 3, borderRadius: 2 }}>
//             <CardContent>
//               <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
//                 Intro
//               </Typography>
              
//               {publicProfile.bio && (
//                 <Typography paragraph sx={{ mb: 2 }}>
//                   {publicProfile.bio}
//                 </Typography>
//               )}
              
//               <Box sx={{ '& > div': { mb: 2 } }}>
//                 {formattedDate && (
//                   <Box sx={{ display: 'flex', alignItems: 'center' }}>
//                     <Cake color="action" sx={{ mr: 1 }} />
//                     <Typography>Born {formattedDate}</Typography>
//                   </Box>
//                 )}
                
//                 {publicProfile.location && (
//                   <Box sx={{ display: 'flex', alignItems: 'center' }}>
//                     <LocationOn color="action" sx={{ mr: 1 }} />
//                     <Typography>{publicProfile.location}</Typography>
//                   </Box>
//                 )}
                
//                 {publicProfile.website && (
//                   <Box sx={{ display: 'flex', alignItems: 'center' }}>
//                     <LinkIcon color="action" sx={{ mr: 1 }} />
//                     <Link href={publicProfile.website} target="_blank" rel="noopener">
//                       {publicProfile.website.replace(/^https?:\/\//, '')}
//                     </Link>
//                   </Box>
//                 )}
//               </Box>
              
//               {isOwnProfile && (
//                 <Button 
//                   variant="outlined" 
//                   fullWidth
//                   startIcon={<Edit />}
//                   sx={{ mt: 1 }}
//                   onClick={() => navigate('/public-profile-update')}
//                 >
//                   Edit Details
//                 </Button>
//               )}
//             </CardContent>
//           </Card>

//           {/* Photos Card */}
//           <Card sx={{ mb: 3, borderRadius: 2 }}>
//             <CardContent>
//               <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
//                 <Typography variant="h6" sx={{ fontWeight: 600 }}>
//                   Photos
//                 </Typography>
//                 <Button color="primary">See All Photos</Button>
//               </Box>
              
//               <Grid container spacing={1}>
//                 {photos.slice(0, 6).map((photo) => (
//                   <Grid item xs={4} key={photo.id}>
//                     <img 
//                       src={photo.url} 
//                       alt={photo.caption} 
//                       style={{ 
//                         width: '100%', 
//                         height: 100, 
//                         objectFit: 'cover',
//                         borderRadius: 4
//                       }}
//                     />
//                   </Grid>
//                 ))}
//               </Grid>
//             </CardContent>
//           </Card>

//           {/* Friends Card */}
//           <Card sx={{ borderRadius: 2 }}>
//             <CardContent>
//               <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
//                 <Typography variant="h6" sx={{ fontWeight: 600 }}>
//                   Friends
//                 </Typography>
//                 <Button color="primary">See All Friends</Button>
//               </Box>
              
//               <Typography color="text.secondary" sx={{ mb: 2 }}>
//                 {friends.length} friends
//               </Typography>
              
//               <Grid container spacing={1}>
//                 {friends.slice(0, 6).map((friend) => (
//                   <Grid item xs={4} key={friend.id}>
//                     <Box>
//                       <img 
//                         src={friend.avatar} 
//                         alt={friend.name} 
//                         style={{ 
//                           width: '100%', 
//                           height: 100, 
//                           objectFit: 'cover',
//                           borderRadius: 4
//                         }}
//                       />
//                       <Typography variant="body2" sx={{ mt: 0.5 }}>
//                         {friend.name}
//                       </Typography>
//                     </Box>
//                   </Grid>
//                 ))}
//               </Grid>
//             </CardContent>
//           </Card>
//         </Grid>

//         {/* Right Column - Posts */}
//         <Grid item xs={12} md={8}>
//           {/* Create Post (only for own profile) */}
//           {isOwnProfile && (
//             <Card sx={{ mb: 3, borderRadius: 2 }}>
//               <CardContent>
//                 <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
//                   <Avatar src={profileImage} sx={{ mr: 1 }} />
//                   <Button 
//                     variant="outlined" 
//                     fullWidth
//                     sx={{ justifyContent: 'flex-start' }}
//                     onClick={() => navigate('/create-post')}
//                   >
//                     What's on your mind?
//                   </Button>
//                 </Box>
//                 <Divider sx={{ my: 1 }} />
//                 <Box sx={{ display: 'flex', justifyContent: 'space-around' }}>
//                   <Button startIcon={<PhotoLibrary color="primary" />}>Photo</Button>
//                   <Button startIcon={<VideoLibrary color="secondary" />}>Video</Button>
//                   <Button startIcon={<Event color="success" />}>Event</Button>
//                 </Box>
//               </CardContent>
//             </Card>
//           )}

//           {/* Posts */}
//           {posts.map((post) => (
//             <Card key={post.id} sx={{ mb: 3, borderRadius: 2 }}>
//               <CardContent>
//                 <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
//                   <Avatar src={profileImage} sx={{ mr: 1 }} />
//                   <Box>
//                     <Typography fontWeight="500">
//                       {publicProfile.firstName} {publicProfile.lastName}
//                     </Typography>
//                     <Typography variant="body2" color="text.secondary">
//                       {post.date}
//                     </Typography>
//                   </Box>
//                 </Box>
                
//                 <Typography paragraph sx={{ mb: 2 }}>
//                   {post.content}
//                 </Typography>
                
//                 <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
//                   <Chip 
//                     label={`${post.likes} likes`}
//                     size="small"
//                     sx={{ mr: 1 }}
//                   />
//                   <Chip 
//                     label={`${post.comments} comments`}
//                     size="small"
//                   />
//                 </Box>
                
//                 <Divider sx={{ my: 1 }} />
                
//                 <Box sx={{ display: 'flex', justifyContent: 'space-around' }}>
//                   <Button startIcon={<ThumbUp />}>Like</Button>
//                   <Button startIcon={<Comment />}>Comment</Button>
//                   <Button startIcon={<Share />}>Share</Button>
//                 </Box>
//               </CardContent>
//             </Card>
//           ))}
//         </Grid>
//       </Grid>

//       {/* Cover Photo Upload Dialog */}
//       <Dialog open={showCoverDialog} onClose={() => setShowCoverDialog(false)} maxWidth="md" fullWidth>
//         <DialogTitle>
//           <Box display="flex" justifyContent="space-between" alignItems="center">
//             <Typography variant="h6">Update Cover Photo</Typography>
//             <IconButton onClick={() => setShowCoverDialog(false)}>
//               <Close />
//             </IconButton>
//           </Box>
//         </DialogTitle>
//         <DialogContent>
//           <Box sx={{ height: 400 }}>
//             {imageToCrop && (
//               <Cropper
//                 src={imageToCrop}
//                 style={{ height: 400, width: '100%' }}
//                 initialAspectRatio={16 / 9}
//                 guides={true}
//                 ref={cropperRef}
//                 viewMode={1}
//                 dragMode="move"
//                 cropBoxMovable={true}
//                 cropBoxResizable={true}
//                 toggleDragModeOnDblclick={false}
//                 crop={handleCrop}
//               />
//             )}
//           </Box>
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={() => setShowCoverDialog(false)}>Cancel</Button>
//           <Button 
//             variant="contained" 
//             color="primary"
//             onClick={handleSavePhoto}
//             disabled={updatePhotoStatus === 'loading'}
//           >
//             {updatePhotoStatus === 'loading' ? (
//               <CircularProgress size={24} color="inherit" />
//             ) : (
//               'Save Changes'
//             )}
//           </Button>
//         </DialogActions>
//       </Dialog>

//       {/* Profile Photo Upload Dialog */}
//       <Dialog open={showProfileDialog} onClose={() => setShowProfileDialog(false)} maxWidth="sm" fullWidth>
//         <DialogTitle>
//           <Box display="flex" justifyContent="space-between" alignItems="center">
//             <Typography variant="h6">Update Profile Picture</Typography>
//             <IconButton onClick={() => setShowProfileDialog(false)}>
//               <Close />
//             </IconButton>
//           </Box>
//         </DialogTitle>
//         <DialogContent>
//           <Box sx={{ height: 400 }}>
//             {imageToCrop && (
//               <Cropper
//                 src={imageToCrop}
//                 style={{ height: 400, width: '100%' }}
//                 initialAspectRatio={1}
//                 guides={true}
//                 ref={cropperRef}
//                 viewMode={1}
//                 dragMode="move"
//                 cropBoxMovable={true}
//                 cropBoxResizable={true}
//                 toggleDragModeOnDblclick={false}
//                 crop={handleCrop}
//               />
//             )}
//           </Box>
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={() => setShowProfileDialog(false)}>Cancel</Button>
//           <Button 
//             variant="contained" 
//             color="primary"
//             onClick={handleSavePhoto}
//             disabled={updatePhotoStatus === 'loading'}
//           >
//             {updatePhotoStatus === 'loading' ? (
//               <CircularProgress size={24} color="inherit" />
//             ) : (
//               'Save Changes'
//             )}
//           </Button>
//         </DialogActions>
//       </Dialog>

//       {/* Loading backdrop */}
//       <Backdrop
//         sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
//         open={updatePhotoStatus === 'loading'}
//       >
//         <CircularProgress color="inherit" />
//       </Backdrop>
//     </Container>
//   );
// };

// export default PublicProfilePage;

//! test

// import {
//   Cake,
//   CameraAlt,
//   Close,
//   Comment,
//   Edit,
//   Event,
//   Link as LinkIcon,
//   LocationOn,
//   MoreVert,
//   PhotoLibrary,
//   Share,
//   ThumbUp,
//   VideoLibrary,
//   ArrowBack
// } from '@mui/icons-material';
// import {
//   Alert,
//   Avatar,
//   Backdrop,
//   Box,
//   Button,
//   Card,
//   CardContent,
//   Chip,
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
//   Typography
// } from '@mui/material';
// import 'cropperjs/dist/cropper.css';
// import { useEffect, useRef, useState } from 'react';
// import Cropper from 'react-cropper';
// import { useDispatch, useSelector } from 'react-redux';
// import { useNavigate, useParams } from 'react-router-dom';
// import { fetchPublicProfile, updatePublicProfile } from '../../features/user/userSlice';

// const PublicProfilePage = () => {
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
//   const [showCoverDialog, setShowCoverDialog] = useState(false);
//   const [showProfileDialog, setShowProfileDialog] = useState(false);
//   const [imageToCrop, setImageToCrop] = useState(null);
//   const [croppedImage, setCroppedImage] = useState(null);
//   const [uploadType, setUploadType] = useState(null);
//   const [anchorEl, setAnchorEl] = useState(null);
//   const coverInputRef = useRef(null);
//   const profileInputRef = useRef(null);
//   const cropperRef = useRef(null);

//   useEffect(() => {
//     if (!id || id === 'undefined') {
//       navigate('/profile/public/me');
//       return;
//     }

//     if (id === 'me' && user?.id) {
//       navigate(`/profile/public/${user.id}`, { replace: true });
//       return;
//     }

//     dispatch(fetchPublicProfile(id));
//   }, [id, dispatch, navigate, user?.id]);

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

//   const handleCrop = () => {
//     if (cropperRef.current) {
//       setCroppedImage(cropperRef.current.getCroppedCanvas().toDataURL());
//     }
//   };

//   const handleSavePhoto = () => {
//     if (croppedImage) {
//       dispatch(updatePublicProfile({
//         userId: publicProfile.id,
//         [uploadType === 'cover' ? 'coverImage' : 'profileImage']: croppedImage
//       })).then(() => {
//         setShowCoverDialog(false);
//         setShowProfileDialog(false);
//         setImageToCrop(null);
//         setCroppedImage(null);
//       });
//     }
//   };

//   if (status === 'loading') {
//     return (
//       <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
//         <CircularProgress size={60} />
//       </Box>
//     );
//   }

//   if (error) {
//     return (
//       <Container maxWidth="lg" sx={{ mt: 4 }}>
//         <Alert severity="error" sx={{ mb: 3 }}>
//           <Typography variant="h6">Failed to load profile</Typography>
//           <Typography>Error: {error.message || 'Unknown error'}</Typography>
//         </Alert>
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
//         <Alert severity="warning" sx={{ mb: 3 }}>
//           Profile not found
//         </Alert>
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
//     { id: 1, content: "Just visited the new art museum!", date: "2 hours ago", likes: 24, comments: 5 },
//     { id: 2, content: "Working on a new project", date: "1 day ago", likes: 12, comments: 3 }
//   ];

//   const photos = [
//     { id: 1, url: "/photo1.jpg", caption: "Vacation" },
//     { id: 2, url: "/photo2.jpg", caption: "Friends" }
//   ];

//   const friends = Array(8).fill(0).map((_, i) => ({
//     id: i + 1,
//     name: `Friend ${i + 1}`,
//     avatar: `/avatar${(i % 3) + 1}.jpg`
//   }));

//   return (
//     <Container maxWidth="lg" sx={{ mt: 2, mb: 4 }}>
//       {/* Hidden file inputs */}
//       <input
//         type="file"
//         ref={coverInputRef}
//         onChange={(e) => handleFileChange(e, 'cover')}
//         accept="image/*"
//         style={{ display: 'none' }}
//       />
//       <input
//         type="file"
//         ref={profileInputRef}
//         onChange={(e) => handleFileChange(e, 'profile')}
//         accept="image/*"
//         style={{ display: 'none' }}
//       />

//       {/* Cover Photo Section */}
//       <Box sx={{ position: 'relative', mb: 8 }}>
//         <Box
//           sx={{
//             height: 350,
//             backgroundImage: `url(${coverImage})`,
//             backgroundSize: 'cover',
//             backgroundPosition: 'center',
//              backgroundColor: 'grey.200',
//                      borderRadius: 2,
//             position: 'relative',
//             cursor: isOwnProfile ? 'pointer' : 'default',
//           }}
//           onMouseEnter={() => isOwnProfile && setCoverHover(true)}
//           onMouseLeave={() => isOwnProfile && setCoverHover(false)}
//           onClick={handleCoverPhotoClick}
//         >
//           {coverHover && isOwnProfile && (
//             <Box
//               sx={{
//                 position: 'absolute',
//                 top: 0,
//                 left: 0,
//                 right: 0,
//                 bottom: 0,
//                 backgroundColor: 'rgba(0, 0, 0, 0.5)',
//                 display: 'flex',
//                 flexDirection: 'column',
//                 justifyContent: 'center',
//                 alignItems: 'center',
//                 borderRadius: 2,
//               }}
//             >
//               <CameraAlt sx={{ color: 'white', fontSize: 40, mb: 1 }} />
//               <Typography variant="body1" color="white" fontWeight="500">
//                 Update Cover Photo
//               </Typography>
//             </Box>
//           )}
//         </Box>
        
//         {/* Profile Avatar and Action Buttons */}
//         <Box sx={{ 
//           position: 'absolute', 
//           bottom: -64, 
//           left: 16,
//           display: 'flex',
//           alignItems: 'flex-end',
//           width: 'calc(100% - 32px)'
//         }}>
//           <Box sx={{ position: 'relative' }}>
//             <Avatar
//               src={profileImage}
//               sx={{
//                 width: 168,
//                 height: 168,
//                 border: '4px solid white',
//                 boxShadow: 3,
//                 cursor: isOwnProfile ? 'pointer' : 'default',
//               }}
//               onClick={handleProfilePhotoClick}
//             />
//             {isOwnProfile && (
//               <IconButton
//                 sx={{
//                   position: 'absolute',
//                   bottom: 8,
//                   right: 8,
//                   backgroundColor: 'primary.main',
//                   color: 'white',
//                   '&:hover': {
//                     backgroundColor: 'primary.dark'
//                   }
//                 }}
//                 onClick={handleProfilePhotoClick}
//               >
//                 <CameraAlt fontSize="small" />
//               </IconButton>
//             )}
//           </Box>
          
//           <Box sx={{ flex: 1, display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
//             {isOwnProfile ? (
//               <>
//                 <Button 
//                   variant="contained" 
//                   startIcon={<Edit />}
//                   sx={{ mr: 1 }}
//                   onClick={() => navigate('/public-profile-update')}
//                 >
//                   Edit Profile
//                 </Button>
//                 <Button 
//                   variant="outlined"
//                   onClick={() => navigate('/settings')}
//                   sx={{ mr: 1 }}
//                 >
//                   Settings
//                 </Button>
//               </>
//             ) : (
//               <>
//                 <Button 
//                   variant="contained" 
//                   color="primary"
//                   sx={{ mr: 1 }}
//                 >
//                   {publicProfile.isFriend ? "Friends" : "Add Friend"}
//                 </Button>
//                 <Button variant="contained" sx={{ mr: 1 }}>
//                   Message
//                 </Button>
//               </>
//             )}
//             <Button variant="contained" onClick={handleMenuOpen}>
//               <MoreVert />
//             </Button>
//             <Menu
//               anchorEl={anchorEl}
//               open={Boolean(anchorEl)}
//               onClose={handleMenuClose}
//             >
//               <MenuItem onClick={() => {
//                 handleMenuClose();
//                 navigate('/about');
//               }}>
//                 About
//               </MenuItem>
//               <MenuItem onClick={handleMenuClose}>Report</MenuItem>
//             </Menu>
//           </Box>
//         </Box>
//       </Box>

//       {/* Profile Info Section */}
//       <Box sx={{ mb: 3, pl: 2 }}>
//         <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
//           {publicProfile.firstName} {publicProfile.lastName}
//         </Typography>
//         <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
//           {publicProfile.headline || 'Welcome to my profile'}
//         </Typography>
        
//         <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
//           {publicProfile.friendsCount && (
//             <Chip 
//               label={`${publicProfile.friendsCount} friends`}
//               variant="outlined"
//               size="small"
//             />
//           )}
//           {publicProfile.location && (
//             <Chip 
//               label={publicProfile.location}
//               variant="outlined"
//               size="small"
//               icon={<LocationOn fontSize="small" />}
//             />
//           )}
//         </Box>
//       </Box>

//       {/* Tabs Section */}
//       <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
//         <Tabs 
//           value={tabValue} 
//           onChange={handleTabChange}
//           variant="scrollable"
//           scrollButtons="auto"
//         >
//           <Tab label="Posts" />
//           <Tab label="About" />
//           <Tab label="Friends" />
//           <Tab label="Photos" />
//           <Tab label="Videos" />
//           <Tab label="More" />
//         </Tabs>
//       </Box>

//       {/* Main Content */}
//       <Grid container spacing={3}>
//         {/* Left Column */}
//         <Grid item xs={12} md={4}>
//           <Card sx={{ mb: 3, borderRadius: 2 }}>
//             <CardContent>
//               <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
//                 Intro
//               </Typography>
              
//               {publicProfile.bio && (
//                 <Typography paragraph sx={{ mb: 2 }}>
//                   {publicProfile.bio}
//                 </Typography>
//               )}
              
//               <Box sx={{ '& > div': { mb: 2 } }}>
//                 {formattedDate && (
//                   <Box sx={{ display: 'flex', alignItems: 'center' }}>
//                     <Cake color="action" sx={{ mr: 1 }} />
//                     <Typography>Born {formattedDate}</Typography>
//                   </Box>
//                 )}
                
//                 {publicProfile.location && (
//                   <Box sx={{ display: 'flex', alignItems: 'center' }}>
//                     <LocationOn color="action" sx={{ mr: 1 }} />
//                     <Typography>{publicProfile.location}</Typography>
//                   </Box>
//                 )}
                
//                 {publicProfile.website && (
//                   <Box sx={{ display: 'flex', alignItems: 'center' }}>
//                     <LinkIcon color="action" sx={{ mr: 1 }} />
//                     <Link href={publicProfile.website} target="_blank" rel="noopener">
//                       {publicProfile.website.replace(/^https?:\/\//, '')}
//                     </Link>
//                   </Box>
//                 )}
//               </Box>
              
//               {isOwnProfile && (
//                 <Button 
//                   variant="outlined" 
//                   fullWidth
//                   startIcon={<Edit />}
//                   sx={{ mt: 1 }}
//                   onClick={() => navigate('/public-profile-update')}
//                 >
//                   Edit Details
//                 </Button>
//               )}
//             </CardContent>
//           </Card>

//           {/* Photos Card */}
//           <Card sx={{ mb: 3, borderRadius: 2 }}>
//             <CardContent>
//               <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
//                 <Typography variant="h6" sx={{ fontWeight: 600 }}>
//                   Photos
//                 </Typography>
//                 <Button color="primary" onClick={() => navigate('/photos')}>
//                   See All Photos
//                 </Button>
//               </Box>
              
//               <Grid container spacing={1}>
//                 {photos.slice(0, 6).map((photo) => (
//                   <Grid item xs={4} key={photo.id}>
//                     <img 
//                       src={photo.url} 
//                       alt={photo.caption} 
//                       style={{ 
//                         width: '100%', 
//                         height: 100, 
//                         objectFit: 'cover',
//                         borderRadius: 4
//                       }}
//                     />
//                   </Grid>
//                 ))}
//               </Grid>
//             </CardContent>
//           </Card>

//           {/* Friends Card */}
//           <Card sx={{ borderRadius: 2 }}>
//             <CardContent>
//               <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
//                 <Typography variant="h6" sx={{ fontWeight: 600 }}>
//                   Friends
//                 </Typography>
//                 <Button color="primary" onClick={() => navigate('/friends')}>
//                   See All Friends
//                 </Button>
//               </Box>
              
//               <Typography color="text.secondary" sx={{ mb: 2 }}>
//                 {friends.length} friends
//               </Typography>
              
//               <Grid container spacing={1}>
//                 {friends.slice(0, 6).map((friend) => (
//                   <Grid item xs={4} key={friend.id}>
//                     <Box>
//                       <img 
//                         src={friend.avatar} 
//                         alt={friend.name} 
//                         style={{ 
//                           width: '100%', 
//                           height: 100, 
//                           objectFit: 'cover',
//                           borderRadius: 4
//                         }}
//                       />
//                       <Typography variant="body2" sx={{ mt: 0.5 }}>
//                         {friend.name}
//                       </Typography>
//                     </Box>
//                   </Grid>
//                 ))}
//               </Grid>
//             </CardContent>
//           </Card>
//         </Grid>

//         {/* Right Column - Posts */}
//         <Grid item xs={12} md={8}>
//           {/* Create Post (only for own profile) */}
//           {isOwnProfile && (
//             <Card sx={{ mb: 3, borderRadius: 2 }}>
//               <CardContent>
//                 <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
//                   <Avatar src={profileImage} sx={{ mr: 1 }} />
//                   <Button 
//                     variant="outlined" 
//                     fullWidth
//                     sx={{ justifyContent: 'flex-start' }}
//                     onClick={() => navigate('/create-post')}
//                   >
//                     What's on your mind?
//                   </Button>
//                 </Box>
//                 <Divider sx={{ my: 1 }} />
//                 <Box sx={{ display: 'flex', justifyContent: 'space-around' }}>
//                   <Button startIcon={<PhotoLibrary color="primary" />}>Photo</Button>
//                   <Button startIcon={<VideoLibrary color="secondary" />}>Video</Button>
//                   <Button startIcon={<Event color="success" />}>Event</Button>
//                 </Box>
//               </CardContent>
//             </Card>
//           )}

//           {/* Posts */}
//           {posts.map((post) => (
//             <Card key={post.id} sx={{ mb: 3, borderRadius: 2 }}>
//               <CardContent>
//                 <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
//                   <Avatar src={profileImage} sx={{ mr: 1 }} />
//                   <Box>
//                     <Typography fontWeight="500">
//                       {publicProfile.firstName} {publicProfile.lastName}
//                     </Typography>
//                     <Typography variant="body2" color="text.secondary">
//                       {post.date}
//                     </Typography>
//                   </Box>
//                 </Box>
                
//                 <Typography paragraph sx={{ mb: 2 }}>
//                   {post.content}
//                 </Typography>
                
//                 <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
//                   <Chip 
//                     label={`${post.likes} likes`}
//                     size="small"
//                     sx={{ mr: 1 }}
//                   />
//                   <Chip 
//                     label={`${post.comments} comments`}
//                     size="small"
//                   />
//                 </Box>
                
//                 <Divider sx={{ my: 1 }} />
                
//                 <Box sx={{ display: 'flex', justifyContent: 'space-around' }}>
//                   <Button startIcon={<ThumbUp />}>Like</Button>
//                   <Button startIcon={<Comment />}>Comment</Button>
//                   <Button startIcon={<Share />}>Share</Button>
//                 </Box>
//               </CardContent>
//             </Card>
//           ))}
//         </Grid>
//       </Grid>

//       {/* Photo Upload Dialogs */}
//       <PhotoUploadDialog
//         open={showCoverDialog}
//         onClose={() => setShowCoverDialog(false)}
//         title="Update Cover Photo"
//         aspectRatio={16/9}
//         imageToCrop={imageToCrop}
//         cropperRef={cropperRef}
//         handleCrop={handleCrop}
//         handleSave={handleSavePhoto}
//         loading={updatePhotoStatus === 'loading'}
//       />

//       <PhotoUploadDialog
//         open={showProfileDialog}
//         onClose={() => setShowProfileDialog(false)}
//         title="Update Profile Picture"
//         aspectRatio={1}
//         imageToCrop={imageToCrop}
//         cropperRef={cropperRef}
//         handleCrop={handleCrop}
//         handleSave={handleSavePhoto}
//         loading={updatePhotoStatus === 'loading'}
//       />

//       {/* Loading backdrop */}
//       <Backdrop
//         sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
//         open={updatePhotoStatus === 'loading'}
//       >
//         <CircularProgress color="inherit" />
//       </Backdrop>
//     </Container>
//   );
// };

// // Reusable Photo Upload Dialog Component
// const PhotoUploadDialog = ({
//   open,
//   onClose,
//   title,
//   aspectRatio,
//   imageToCrop,
//   cropperRef,
//   handleCrop,
//   handleSave,
//   loading
// }) => (
//   <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
//     <DialogTitle>
//       <Box display="flex" justifyContent="space-between" alignItems="center">
//         <Typography variant="h6">{title}</Typography>
//         <IconButton onClick={onClose}>
//           <Close />
//         </IconButton>
//       </Box>
//     </DialogTitle>
//     <DialogContent>
//       <Box sx={{ height: 400 }}>
//         {imageToCrop && (
//           <Cropper
//             src={imageToCrop}
//             style={{ height: 400, width: '100%' }}
//             initialAspectRatio={aspectRatio}
//             guides={true}
//             ref={cropperRef}
//             viewMode={1}
//             dragMode="move"
//             cropBoxMovable={true}
//             cropBoxResizable={true}
//             toggleDragModeOnDblclick={false}
//             crop={handleCrop}
//           />
//         )}
//       </Box>
//     </DialogContent>
//     <DialogActions>
//       <Button onClick={onClose}>Cancel</Button>
//       <Button 
//         variant="contained" 
//         color="primary"
//         onClick={handleSave}
//         disabled={loading}
//       >
//         {loading ? <CircularProgress size={24} color="inherit" /> : 'Save Changes'}
//       </Button>
//     </DialogActions>
//   </Dialog>
// );

// export default PublicProfilePage;



//! new
// import {
//   Add,
//   Cake,
//   CameraAlt,
//   Close,
//   Comment,
//   Edit,
//   Event,
//   Link as LinkIcon,
//   LocationOn,
//   MoreVert,
//   PhotoLibrary,
//   Share,
//   ThumbUp,
//   VideoLibrary,
//   ArrowBack
// } from '@mui/icons-material';
// import {
//   Alert,
//   Avatar,
//   Backdrop,
//   Box,
//   Button,
//   Card,
//   CardContent,
//   Chip,
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
//   Typography
// } from '@mui/material';
// import 'cropperjs/dist/cropper.css';
// import { useEffect, useRef, useState } from 'react';
// import Cropper from 'react-cropper';
// import { useDispatch, useSelector } from 'react-redux';
// import { useNavigate, useParams } from 'react-router-dom';
// import { fetchPublicProfile, updatePublicProfile } from '../../features/user/userSlice';

// const PublicProfilePage = () => {
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
//   const [showCoverDialog, setShowCoverDialog] = useState(false);
//   const [showProfileDialog, setShowProfileDialog] = useState(false);
//   const [imageToCrop, setImageToCrop] = useState(null);
//   const [croppedImage, setCroppedImage] = useState(null);
//   const [uploadType, setUploadType] = useState(null);
//   const [anchorEl, setAnchorEl] = useState(null);
//   const coverInputRef = useRef(null);
//   const profileInputRef = useRef(null);
//   const cropperRef = useRef(null);

//   useEffect(() => {
//     if (!id || id === 'undefined') {
//       navigate('/profile/public/me');
//       return;
//     }

//     if (id === 'me' && user?.id) {
//       navigate(`/profile/public/${user.id}`, { replace: true });
//       return;
//     }

//     dispatch(fetchPublicProfile(id));
//   }, [id, dispatch, navigate, user?.id]);

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

//   const handleCrop = () => {
//     if (cropperRef.current) {
//       setCroppedImage(cropperRef.current.getCroppedCanvas().toDataURL());
//     }
//   };

//   const handleSavePhoto = () => {
//     if (croppedImage) {
//       dispatch(updatePublicProfile({
//         userId: publicProfile.id,
//         [uploadType === 'cover' ? 'coverImage' : 'profileImage']: croppedImage
//       })).then(() => {
//         setShowCoverDialog(false);
//         setShowProfileDialog(false);
//         setImageToCrop(null);
//         setCroppedImage(null);
//       });
//     }
//   };

//   if (status === 'loading') {
//     return (
//       <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
//         <CircularProgress size={60} />
//       </Box>
//     );
//   }

//   if (error) {
//     return (
//       <Container maxWidth="lg" sx={{ mt: 4 }}>
//         <Alert severity="error" sx={{ mb: 3 }}>
//           <Typography variant="h6">Failed to load profile</Typography>
//           <Typography>Error: {error.message || 'Unknown error'}</Typography>
//         </Alert>
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
//         <Alert severity="warning" sx={{ mb: 3 }}>
//           Profile not found
//         </Alert>
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
//     { id: 1, content: "Just visited the new art museum!", date: "2 hours ago", likes: 24, comments: 5 },
//     { id: 2, content: "Working on a new project", date: "1 day ago", likes: 12, comments: 3 }
//   ];

//   const photos = [
//     { id: 1, url: "/photo1.jpg", caption: "Vacation" },
//     { id: 2, url: "/photo2.jpg", caption: "Friends" }
//   ];

//   const friends = Array(8).fill(0).map((_, i) => ({
//     id: i + 1,
//     name: `Friend ${i + 1}`,
//     avatar: `/avatar${(i % 3) + 1}.jpg`
//   }));

//   return (
//     <Container maxWidth="lg" sx={{ mt: 0, mb: 4 }}>
//       {/* Hidden file inputs */}
//       <input
//         type="file"
//         ref={coverInputRef}
//         onChange={(e) => handleFileChange(e, 'cover')}
//         accept="image/*"
//         style={{ display: 'none' }}
//       />
//       <input
//         type="file"
//         ref={profileInputRef}
//         onChange={(e) => handleFileChange(e, 'profile')}
//         accept="image/*"
//         style={{ display: 'none' }}
//       />

//       {/* Cover Photo Section - Updated to match screenshot */}
//       <Box sx={{ position: 'relative', mb: 10 }}>
//         <Box
//           sx={{
//             height: 350,
//             backgroundImage: `url(${coverImage})`,
//             backgroundSize: 'cover',
//             backgroundPosition: 'center',
//             backgroundColor: 'grey.200',
//             borderRadius: '8px 8px 0 0',
//             position: 'relative',
//             cursor: isOwnProfile ? 'pointer' : 'default',
//           }}
//           onMouseEnter={() => isOwnProfile && setCoverHover(true)}
//           onMouseLeave={() => isOwnProfile && setCoverHover(false)}
//           onClick={handleCoverPhotoClick}
//         >
//           {coverHover && isOwnProfile && (
//             <Box
//               sx={{
//                 position: 'absolute',
//                 bottom: 16,
//                 right: 16,
//                 backgroundColor: 'rgba(0,0,0,0.6)',
//                 borderRadius: 1,
//                 p: 1,
//                 display: 'flex',
//                 alignItems: 'center'
//               }}
//             >
//               <CameraAlt sx={{ color: 'white', mr: 1, fontSize: 20 }} />
//               <Typography variant="body2" color="white" fontWeight="500">
//                 Edit cover photo
//               </Typography>
//             </Box>
//           )}
//         </Box>
        
//         {/* Profile Avatar and Info Section - Updated to match screenshot */}
//         <Box sx={{ 
//           position: 'absolute', 
//           bottom: -60, 
//           left: 16,
//           right: 16,
//           display: 'flex',
//           alignItems: 'flex-end',
//           justifyContent: 'space-between'
//         }}>
//           {/* Left Side - Profile Picture and Name */}
//           <Box sx={{ display: 'flex', alignItems: 'flex-end' }}>
//             <Box sx={{ position: 'relative', mr: 2 }}>
//               <Avatar
//                 src={profileImage}
//                 sx={{
//                   width: 168,
//                   height: 168,
//                   border: '4px solid white',
//                   boxShadow: 3,
//                   cursor: isOwnProfile ? 'pointer' : 'default',
//                 }}
//                 onClick={handleProfilePhotoClick}
//               />
//               {isOwnProfile && (
//                 <IconButton
//                   sx={{
//                     position: 'absolute',
//                     bottom: 8,
//                     right: 8,
//                     backgroundColor: 'primary.main',
//                     color: 'white',
//                     '&:hover': {
//                       backgroundColor: 'primary.dark'
//                     }
//                   }}
//                   onClick={handleProfilePhotoClick}
//                 >
//                   <CameraAlt fontSize="small" />
//                 </IconButton>
//               )}
//             </Box>
            
//             <Box>
//               <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 0.5 }}>
//                 {publicProfile.firstName} {publicProfile.lastName}
//               </Typography>
//               <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
//                 {publicProfile.friendsCount || 0} friends
//               </Typography>
//             </Box>
//           </Box>
          
//           {/* Right Side - Action Buttons */}
//           <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
//             {isOwnProfile ? (
//               <>
//                 <Button 
//                   variant="contained" 
//                   startIcon={<Add />}
//                   sx={{ 
//                     background: 'linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366)',
//                     color: 'white',
//                     '&:hover': {
//                       background: 'linear-gradient(45deg, #e6683c, #dc2743, #cc2366, #bc1888)'
//                     }
//                   }}
//                 >
//                   Add to story
//                 </Button>
//                 <Button 
//                   variant="contained" 
//                   startIcon={<Edit />}
//                   sx={{ backgroundColor: '#e4e6eb', color: '#050505' }}
//                   onClick={() => navigate('/public-profile-update')}
//                 >
//                   Edit profile
//                 </Button>
//               </>
//             ) : (
//               <>
//                 <Button 
//                   variant="contained" 
//                   color="primary"
//                   sx={{ fontWeight: 600 }}
//                 >
//                   {publicProfile.isFriend ? "Friends" : "Add Friend"}
//                 </Button>
//                 <Button 
//                   variant="contained" 
//                   sx={{ 
//                     backgroundColor: '#e4e6eb', 
//                     color: '#050505',
//                     fontWeight: 600
//                   }}
//                 >
//                   Message
//                 </Button>
//               </>
//             )}
//             <IconButton 
//               sx={{ 
//                 backgroundColor: '#e4e6eb',
//                 '&:hover': {
//                   backgroundColor: '#d8dadf'
//                 }
//               }}
//               onClick={handleMenuOpen}
//             >
//               <MoreVert sx={{ color: '#050505' }} />
//             </IconButton>
//             <Menu
//               anchorEl={anchorEl}
//               open={Boolean(anchorEl)}
//               onClose={handleMenuClose}
//             >
//               <MenuItem onClick={() => {
//                 handleMenuClose();
//                 navigate('/about');
//               }}>
//                 About
//               </MenuItem>
//               <MenuItem onClick={handleMenuClose}>Report</MenuItem>
//             </Menu>
//           </Box>
//         </Box>
//       </Box>

//       {/* Tabs Section */}
//       <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
//         <Tabs 
//           value={tabValue} 
//           onChange={handleTabChange}
//           variant="scrollable"
//           scrollButtons="auto"
//         >
//           <Tab label="Posts" />
//           <Tab label="About" />
//           <Tab label="Friends" />
//           <Tab label="Photos" />
//           <Tab label="Videos" />
//           <Tab label="More" />
//         </Tabs>
//       </Box>

//       {/* Main Content */}
//       <Grid container spacing={3}>
//         {/* Left Column */}
//         <Grid item xs={12} md={4}>
//           <Card sx={{ mb: 3, borderRadius: 2 }}>
//             <CardContent>
//               <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
//                 Intro
//               </Typography>
              
//               {publicProfile.bio && (
//                 <Typography paragraph sx={{ mb: 2 }}>
//                   {publicProfile.bio}
//                 </Typography>
//               )}
              
//               <Box sx={{ '& > div': { mb: 2 } }}>
//                 {formattedDate && (
//                   <Box sx={{ display: 'flex', alignItems: 'center' }}>
//                     <Cake color="action" sx={{ mr: 1 }} />
//                     <Typography>Born {formattedDate}</Typography>
//                   </Box>
//                 )}
                
//                 {publicProfile.location && (
//                   <Box sx={{ display: 'flex', alignItems: 'center' }}>
//                     <LocationOn color="action" sx={{ mr: 1 }} />
//                     <Typography>{publicProfile.location}</Typography>
//                   </Box>
//                 )}
                
//                 {publicProfile.website && (
//                   <Box sx={{ display: 'flex', alignItems: 'center' }}>
//                     <LinkIcon color="action" sx={{ mr: 1 }} />
//                     <Link href={publicProfile.website} target="_blank" rel="noopener">
//                       {publicProfile.website.replace(/^https?:\/\//, '')}
//                     </Link>
//                   </Box>
//                 )}
//               </Box>
              
//               {isOwnProfile && (
//                 <Button 
//                   variant="outlined" 
//                   fullWidth
//                   startIcon={<Edit />}
//                   sx={{ mt: 1 }}
//                   onClick={() => navigate('/public-profile-update')}
//                 >
//                   Edit Details
//                 </Button>
//               )}
//             </CardContent>
//           </Card>

//           {/* Photos Card */}
//           <Card sx={{ mb: 3, borderRadius: 2 }}>
//             <CardContent>
//               <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
//                 <Typography variant="h6" sx={{ fontWeight: 600 }}>
//                   Photos
//                 </Typography>
//                 <Button color="primary" onClick={() => navigate('/photos')}>
//                   See All Photos
//                 </Button>
//               </Box>
              
//               <Grid container spacing={1}>
//                 {photos.slice(0, 6).map((photo) => (
//                   <Grid item xs={4} key={photo.id}>
//                     <img 
//                       src={photo.url} 
//                       alt={photo.caption} 
//                       style={{ 
//                         width: '100%', 
//                         height: 100, 
//                         objectFit: 'cover',
//                         borderRadius: 4
//                       }}
//                     />
//                   </Grid>
//                 ))}
//               </Grid>
//             </CardContent>
//           </Card>

//           {/* Friends Card */}
//           <Card sx={{ borderRadius: 2 }}>
//             <CardContent>
//               <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
//                 <Typography variant="h6" sx={{ fontWeight: 600 }}>
//                   Friends
//                 </Typography>
//                 <Button color="primary" onClick={() => navigate('/friends')}>
//                   See All Friends
//                 </Button>
//               </Box>
              
//               <Typography color="text.secondary" sx={{ mb: 2 }}>
//                 {friends.length} friends
//               </Typography>
              
//               <Grid container spacing={1}>
//                 {friends.slice(0, 6).map((friend) => (
//                   <Grid item xs={4} key={friend.id}>
//                     <Box>
//                       <img 
//                         src={friend.avatar} 
//                         alt={friend.name} 
//                         style={{ 
//                           width: '100%', 
//                           height: 100, 
//                           objectFit: 'cover',
//                           borderRadius: 4
//                         }}
//                       />
//                       <Typography variant="body2" sx={{ mt: 0.5 }}>
//                         {friend.name}
//                       </Typography>
//                     </Box>
//                   </Grid>
//                 ))}
//               </Grid>
//             </CardContent>
//           </Card>
//         </Grid>

//         {/* Right Column - Posts */}
//         <Grid item xs={12} md={8}>
//           {/* Create Post (only for own profile) */}
//           {isOwnProfile && (
//             <Card sx={{ mb: 3, borderRadius: 2 }}>
//               <CardContent>
//                 <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
//                   <Avatar src={profileImage} sx={{ mr: 1 }} />
//                   <Button 
//                     variant="outlined" 
//                     fullWidth
//                     sx={{ justifyContent: 'flex-start' }}
//                     onClick={() => navigate('/create-post')}
//                   >
//                     What's on your mind?
//                   </Button>
//                 </Box>
//                 <Divider sx={{ my: 1 }} />
//                 <Box sx={{ display: 'flex', justifyContent: 'space-around' }}>
//                   <Button startIcon={<PhotoLibrary color="primary" />}>Photo</Button>
//                   <Button startIcon={<VideoLibrary color="secondary" />}>Video</Button>
//                   <Button startIcon={<Event color="success" />}>Event</Button>
//                 </Box>
//               </CardContent>
//             </Card>
//           )}

//           {/* Posts */}
//           {posts.map((post) => (
//             <Card key={post.id} sx={{ mb: 3, borderRadius: 2 }}>
//               <CardContent>
//                 <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
//                   <Avatar src={profileImage} sx={{ mr: 1 }} />
//                   <Box>
//                     <Typography fontWeight="500">
//                       {publicProfile.firstName} {publicProfile.lastName}
//                     </Typography>
//                     <Typography variant="body2" color="text.secondary">
//                       {post.date}
//                     </Typography>
//                   </Box>
//                 </Box>
                
//                 <Typography paragraph sx={{ mb: 2 }}>
//                   {post.content}
//                 </Typography>
                
//                 <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
//                   <Chip 
//                     label={`${post.likes} likes`}
//                     size="small"
//                     sx={{ mr: 1 }}
//                   />
//                   <Chip 
//                     label={`${post.comments} comments`}
//                     size="small"
//                   />
//                 </Box>
                
//                 <Divider sx={{ my: 1 }} />
                
//                 <Box sx={{ display: 'flex', justifyContent: 'space-around' }}>
//                   <Button startIcon={<ThumbUp />}>Like</Button>
//                   <Button startIcon={<Comment />}>Comment</Button>
//                   <Button startIcon={<Share />}>Share</Button>
//                 </Box>
//               </CardContent>
//             </Card>
//           ))}
//         </Grid>
//       </Grid>

//       {/* Photo Upload Dialogs */}
//       <PhotoUploadDialog
//         open={showCoverDialog}
//         onClose={() => setShowCoverDialog(false)}
//         title="Update Cover Photo"
//         aspectRatio={16/9}
//         imageToCrop={imageToCrop}
//         cropperRef={cropperRef}
//         handleCrop={handleCrop}
//         handleSave={handleSavePhoto}
//         loading={updatePhotoStatus === 'loading'}
//       />

//       <PhotoUploadDialog
//         open={showProfileDialog}
//         onClose={() => setShowProfileDialog(false)}
//         title="Update Profile Picture"
//         aspectRatio={1}
//         imageToCrop={imageToCrop}
//         cropperRef={cropperRef}
//         handleCrop={handleCrop}
//         handleSave={handleSavePhoto}
//         loading={updatePhotoStatus === 'loading'}
//       />

//       {/* Loading backdrop */}
//       <Backdrop
//         sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
//         open={updatePhotoStatus === 'loading'}
//       >
//         <CircularProgress color="inherit" />
//       </Backdrop>
//     </Container>
//   );
// };

// // Reusable Photo Upload Dialog Component
// const PhotoUploadDialog = ({
//   open,
//   onClose,
//   title,
//   aspectRatio,
//   imageToCrop,
//   cropperRef,
//   handleCrop,
//   handleSave,
//   loading
// }) => (
//   <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
//     <DialogTitle>
//       <Box display="flex" justifyContent="space-between" alignItems="center">
//         <Typography variant="h6">{title}</Typography>
//         <IconButton onClick={onClose}>
//           <Close />
//         </IconButton>
//       </Box>
//     </DialogTitle>
//     <DialogContent>
//       <Box sx={{ height: 400 }}>
//         {imageToCrop && (
//           <Cropper
//             src={imageToCrop}
//             style={{ height: 400, width: '100%' }}
//             initialAspectRatio={aspectRatio}
//             guides={true}
//             ref={cropperRef}
//             viewMode={1}
//             dragMode="move"
//             cropBoxMovable={true}
//             cropBoxResizable={true}
//             toggleDragModeOnDblclick={false}
//             crop={handleCrop}
//           />
//         )}
//       </Box>
//     </DialogContent>
//     <DialogActions>
//       <Button onClick={onClose}>Cancel</Button>
//       <Button 
//         variant="contained" 
//         color="primary"
//         onClick={handleSave}
//         disabled={loading}
//       >
//         {loading ? <CircularProgress size={24} color="inherit" /> : 'Save Changes'}
//       </Button>
//     </DialogActions>
//   </Dialog>
// );

// export default PublicProfilePage;
















