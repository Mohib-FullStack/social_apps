import { Avatar, Box, Button, IconButton, Menu, MenuItem, Typography } from '@mui/material';
import PropTypes from 'prop-types';
import { Add, CameraAlt, Edit, MoreVert, Verified as VerifiedIcon } from '@mui/icons-material';
import StatBox from './StatBox';
import { People as PeopleIcon, PostAdd as PostIcon, PhotoLibrary as PhotoLibraryIcon } from '@mui/icons-material';

const ProfileInfoSection = ({
  publicProfile,
  profileImage,
  isOwnProfile,
  posts,
  photos,
  friends,
  profileHover,
  onProfileClick,
  onMenuOpen,
  anchorEl,
  onMenuClose,
  navigate
}) => {
  return (
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
          onMouseEnter={isOwnProfile ? () => setProfileHover(true) : undefined}
          onMouseLeave={isOwnProfile ? () => setProfileHover(false) : undefined}
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
            onClick={onProfileClick}
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
            />
            <StatBox 
              icon={<PostIcon fontSize="small" />} 
              count={posts.length} 
              label="Posts" 
            />
            <StatBox 
              icon={<PhotoLibraryIcon fontSize="small" />} 
              count={photos.length} 
              label="Photos" 
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
                  backgroundColor: theme => theme.palette.primary.dark
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
          onClick={onMenuOpen}
        >
          <MoreVert sx={{ color: '#050505' }} />
        </IconButton>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={onMenuClose}
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
            onMenuClose();
            navigate('/about');
          }}>
            About
          </MenuItem>
          <MenuItem onClick={onMenuClose}>Report</MenuItem>
          {isOwnProfile && (
            <MenuItem onClick={onMenuClose}>Activity Log</MenuItem>
          )}
        </Menu>
      </Box>
    </Box>
  );
};

ProfileInfoSection.propTypes = {
  publicProfile: PropTypes.object.isRequired,
  profileImage: PropTypes.string.isRequired,
  isOwnProfile: PropTypes.bool.isRequired,
  posts: PropTypes.array.isRequired,
  photos: PropTypes.array.isRequired,
  friends: PropTypes.array.isRequired,
  profileHover: PropTypes.bool.isRequired,
  onProfileClick: PropTypes.func.isRequired,
  onMenuOpen: PropTypes.func.isRequired,
  anchorEl: PropTypes.object,
  onMenuClose: PropTypes.func.isRequired,
  navigate: PropTypes.func.isRequired
};

export default ProfileInfoSection;