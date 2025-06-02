import { useState, useCallback } from 'react';
import {
  Avatar,
  Box,
  IconButton,
  CircularProgress,
  Button,
  styled
} from '@mui/material';
import { CameraAlt } from '@mui/icons-material';
import FriendRequestButton from '../../FriendsListPage/FriendRequestButton';

import PropTypes from 'prop-types';

const CoverContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: '100%',
  backgroundColor: theme.palette.grey[200],
  overflow: 'hidden',
  borderRadius: theme.shape.borderRadius * 2
}));

const ProfileAvatarContainer = styled(Box)(({ theme }) => ({
  position: 'absolute',
  left: '50%',
  transform: 'translateX(-50%)',
  bottom: -60
}));

const ProfileAvatar = styled(Avatar)(({ theme }) => ({
  border: '4px solid',
  borderColor: theme.palette.background.paper,
  boxShadow: theme.shadows[3]
}));

const EditIconButton = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  backgroundColor: theme.palette.background.paper,
  '&:hover': {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.common.white
  }
}));

const ProfileEditIconButton = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  bottom: 8,
  right: 8,
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.common.white,
  '&:hover': {
    backgroundColor: theme.palette.primary.dark
  }
}));

const ProfileHeader = ({
  coverImage,
  profileImage,
  isOwnProfile,
  userId,
  onCoverPhotoEdit = () => {},
  onProfilePhotoEdit = () => {},
  coverImageLoading = false,
  profileImageLoading = false,
  isMobile = false,
  onMessageClick
}) => {
  const [coverPreview, setCoverPreview] = useState(coverImage);
  const [profilePreview, setProfilePreview] = useState(profileImage);

  const handleCoverChange = useCallback(
    (e) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setCoverPreview(reader.result);
        }
      };
      reader.readAsDataURL(file);
      onCoverPhotoEdit(e);
    },
    [onCoverPhotoEdit]
  );

  const handleProfileChange = useCallback(
    (e) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setProfilePreview(reader.result);
        }
      };
      reader.readAsDataURL(file);
      onProfilePhotoEdit(e);
    },
    [onProfilePhotoEdit]
  );

  const coverHeight = isMobile ? 200 : 350;
  const avatarSize = isMobile ? 120 : 168;

  return (
    <Box sx={{ position: 'relative', mb: isMobile ? 8 : 10 }}>
      {/* Cover Section */}
      <CoverContainer sx={{ height: coverHeight }}>
        {coverImageLoading ? (
          <Box
            sx={{
              width: '100%',
              height: '100%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            <CircularProgress size={60} />
          </Box>
        ) : (
          <img
            src={coverPreview || coverImage}
            alt="Cover"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        )}

        {/* Cover Edit Button */}
        {isOwnProfile && (
          <EditIconButton
            component="label"
            sx={{ top: 16, right: 16 }}
          >
            <input
              hidden
              accept="image/*"
              type="file"
              onChange={handleCoverChange}
            />
            <CameraAlt />
          </EditIconButton>
        )}
      </CoverContainer>

      {/* Profile Avatar Section */}
      <ProfileAvatarContainer
        sx={{
          left: isMobile ? '50%' : 32,
          bottom: isMobile ? -60 : -80,
          transform: isMobile ? 'translateX(-50%)' : 'none'
        }}
      >
        <ProfileAvatar
          src={profilePreview || profileImage}
          sx={{
            width: avatarSize,
            height: avatarSize
          }}
        />
        {isOwnProfile && (
          <ProfileEditIconButton component="label">
            <input
              hidden
              accept="image/*"
              type="file"
              onChange={handleProfileChange}
            />
            <CameraAlt fontSize="small" />
          </ProfileEditIconButton>
        )}
      </ProfileAvatarContainer>

      {/* Action Buttons (for non-own profile) */}
      {!isOwnProfile && userId && (
        <Box
          sx={{
            position: 'absolute',
            right: 16,
            bottom: isMobile ? -72 : -92,
            display: 'flex',
            gap: 2
          }}
        >
          <FriendRequestButton targetUserId={userId} />
          <Button
            variant="outlined"
            size="small"
            sx={{ textTransform: 'none' }}
            onClick={onMessageClick}
          >
            Message
          </Button>
        </Box>
      )}
    </Box>
  );
};

ProfileHeader.propTypes = {
  coverImage: PropTypes.string.isRequired,
  profileImage: PropTypes.string.isRequired,
  isOwnProfile: PropTypes.bool.isRequired,
  userId: PropTypes.string,
  onCoverPhotoEdit: PropTypes.func,
  onProfilePhotoEdit: PropTypes.func,
  coverImageLoading: PropTypes.bool,
  profileImageLoading: PropTypes.bool,
  isMobile: PropTypes.bool,
  onMessageClick: PropTypes.func
};

ProfileHeader.defaultProps = {
  onCoverPhotoEdit: () => {},
  onProfilePhotoEdit: () => {},
  coverImageLoading: false,
  profileImageLoading: false,
  isMobile: false,
  onMessageClick: () => {}
};

export default ProfileHeader;

