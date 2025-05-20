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
  useTheme
} from '@mui/material';
import 'cropperjs/dist/cropper.css';
import { useEffect, useRef, useState } from 'react';
import Cropper from 'react-cropper';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchPublicProfile, updatePublicProfile } from '../../features/user/userSlice';

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

  const handleSavePhoto = () => {
    if (croppedImage) {
      dispatch(updatePublicProfile({
        userId: publicProfile.id,
        [uploadType === 'cover' ? 'coverImage' : 'profileImage']: croppedImage
      })).then(() => {
        setShowCoverDialog(false);
        setShowProfileDialog(false);
        setImageToCrop(null);
        setCroppedImage(null);
      });
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
          bottom: -60, 
          left: 16,
          right: 16,
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between'
        }}>
          {/* Left Side - Profile Picture and Name */}
          <Box sx={{ display: 'flex', alignItems: 'flex-end' }}>
            <Box sx={{ position: 'relative', mr: 2 }}>
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
              {isOwnProfile && (
                <IconButton
                  sx={{
                    position: 'absolute',
                    bottom: 8,
                    right: 8,
                    backgroundColor: 'primary.main',
                    color: 'white',
                    '&:hover': {
                      backgroundColor: 'primary.dark'
                    }
                  }}
                  onClick={handleProfilePhotoClick}
                >
                  <CameraAlt fontSize="small" />
                </IconButton>
              )}
            </Box>
            
            <Box>
              <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 0.5 }}>
                {publicProfile.firstName} {publicProfile.lastName}
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
                {publicProfile.friendsCount || 0} friends
              </Typography>
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
                  sx={{ backgroundColor: '#e4e6eb', color: '#050505' }}
                  onClick={() => navigate('/public-profile-update')}
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
        <IconButton onClick={onClose}>
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
      <Button onClick={onClose}>Cancel</Button>
      <Button 
        variant="contained" 
        color="primary"
        onClick={handleSave}
        disabled={loading}
      >
        {loading ? <CircularProgress size={24} color="inherit" /> : 'Save Changes'}
      </Button>
    </DialogActions>
  </Dialog>
);

export default PublicProfilePage;












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
















