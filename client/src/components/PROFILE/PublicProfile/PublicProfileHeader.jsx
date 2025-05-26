import {
  Add,
  Cake,
  CameraAlt,
  Edit,
  Event,
  LocationOn,
  MoreVert,
  PhotoLibrary,
  Share,
  VideoLibrary
} from '@mui/icons-material';
import {
  Avatar,
  Backdrop,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Tabs,
  Tab,
  Typography,
  useMediaQuery
} from '@mui/material';
import Cropper from 'react-cropper';
import 'cropperjs/dist/cropper.css';
import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const PublicProfileHeader = ({ 
  profile,
  tabValue,
  handleTabChange,
  isMobile,
  isOwnProfile,
  updatePhotoStatus
}) => {
  const navigate = useNavigate();
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

  const fullName = `${profile.firstName} ${profile.lastName}`;
  const profileImage = profile.profileImage || '/default-avatar.png';
  const coverImage = profile.coverImage || '/default-cover.jpg';
  const formattedDate = profile.birthDate ? new Date(profile.birthDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }) : null;

  const handleCoverPhotoClick = () => {
    if (!isOwnProfile) return;
    coverInputRef.current.click();
  };

  const handleProfilePhotoClick = () => {
    if (!isOwnProfile) return;
    profileInputRef.current.click();
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setImageToCrop(reader.result);
      setUploadType(type);
      if (type === 'cover') {
        setShowCoverDialog(true);
      } else {
        setShowProfileDialog(true);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleCrop = () => {
    if (typeof cropperRef.current?.cropper !== 'undefined') {
      setCroppedImage(cropperRef.current?.cropper.getCroppedCanvas().toDataURL());
    }
  };

  const handleSavePhoto = () => {
    if (!croppedImage) return;
    
    // Here you would typically dispatch an action to save the photo
    console.log('Photo saved:', uploadType, croppedImage);
    
    if (uploadType === 'cover') {
      setShowCoverDialog(false);
    } else {
      setShowProfileDialog(false);
    }
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <Box sx={{ 
      position: 'relative', 
      mb: isMobile ? 15 : 10,
      zIndex: 1
    }}>
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
        textAlign: isMobile ? 'center' : 'left',
        zIndex: 2
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
              {fullName}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
              {profile.friendsCount || 0} friends
            </Typography>
          </Box>
        </Box>
        
        {/* Right Side - Action Buttons */}
        {!isMobile && (
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            mb: 2, 
            gap: 1,
            position: 'relative',
            zIndex: 3
          }}>
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
                  onClick={() => navigate(`/public-profile-update/${profile.id}`)}
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
                  {profile.isFriend ? "Friends" : "Add Friend"}
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

      {/* Mobile Action Buttons */}
      {isMobile && (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          gap: 1, 
          mb: 2,
          mt: 12
        }}>
          {isOwnProfile ? (
            <>
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
                onClick={() => navigate(`/public-profile-update/${profile.id}`)}
              >
                Edit
              </Button>
            </>
          ) : (
            <>
              <Button 
                variant="contained" 
                size="small"
                color="primary"
                sx={{ fontWeight: 600 }}
              >
                {profile.isFriend ? "Friends" : "Add Friend"}
              </Button>
              <Button 
                variant="contained" 
                size="small"
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
        </Box>
      )}

      {/* Tabs Section */}
      <Box sx={{ 
        borderBottom: 1, 
        borderColor: 'divider', 
        mb: 3,
        '& .MuiTabs-indicator': {
          backgroundColor: 'primary.main',
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

      {/* Photo Upload Dialogs */}
      <Dialog open={showCoverDialog} onClose={() => setShowCoverDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Update Cover Photo</Typography>
            <IconButton onClick={() => setShowCoverDialog(false)} disabled={updatePhotoStatus === 'loading'}>
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
                initialAspectRatio={16/9}
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
          <Button onClick={() => setShowCoverDialog(false)} disabled={updatePhotoStatus === 'loading'}>
            Cancel
          </Button>
          <Button 
            variant="contained" 
            color="primary"
            onClick={handleSavePhoto}
            disabled={updatePhotoStatus === 'loading'}
            startIcon={updatePhotoStatus === 'loading' ? <CircularProgress size={20} color="inherit" /> : null}
          >
            {updatePhotoStatus === 'loading' ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={showProfileDialog} onClose={() => setShowProfileDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Update Profile Picture</Typography>
            <IconButton onClick={() => setShowProfileDialog(false)} disabled={updatePhotoStatus === 'loading'}>
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
                initialAspectRatio={1}
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
          <Button onClick={() => setShowProfileDialog(false)} disabled={updatePhotoStatus === 'loading'}>
            Cancel
          </Button>
          <Button 
            variant="contained" 
            color="primary"
            onClick={handleSavePhoto}
            disabled={updatePhotoStatus === 'loading'}
            startIcon={updatePhotoStatus === 'loading' ? <CircularProgress size={20} color="inherit" /> : null}
          >
            {updatePhotoStatus === 'loading' ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Loading backdrop */}
      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={updatePhotoStatus === 'loading'}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </Box>
  );
};

export default PublicProfileHeader;