import {
  ArrowBack as ArrowBackIcon,
  CameraAlt as CameraIcon,
  Edit as EditIcon,
  Lock as LockIcon
} from '@mui/icons-material';
import {
  Avatar,
  Badge,
  Box,
  Button,
  Chip,
  IconButton,
  Tab,
  Tabs,
  Typography
} from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';

const PrivateProfileHeader = ({ 
  profile,
  tabValue,
  handleTabChange,
  isMobile
}) => {
  const navigate = useNavigate();
  const userId = profile.user?._id || profile._id || 'me';
  const fullName = `${profile.user?.firstName || profile.firstName || ''} ${profile.user?.lastName || profile.lastName || ''}`.trim();
  const profileImage = profile.user?.profileImage || profile.profileImage || '/default-avatar.png';
  const isVerified = profile.user?.isVerified || profile.isVerified || false;

  return (
    <Box sx={{ 
      backgroundColor: 'background.default',
      position: 'relative',
      mb: 3
    }}>
      {/* Header with Back Button */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 3,
        mt: isMobile ? 8 : 4
      }}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<ArrowBackIcon />}
           onClick={() => navigate(-1)}
               
          sx={{
            borderRadius: '8px',
            '&:hover': { backgroundColor: 'secondary.main' }
          }}
        >
          Back
        </Button>


        <Typography variant="h4" color="text.primary">
          My Profile
        </Typography>
        <Box sx={{ width: 150 }} /> {/* Spacer for alignment */}
      </Box>

      {/* Profile Card */}
      <Box sx={{ 
        display: 'flex', 
        flexDirection: isMobile ? 'column' : 'row', 
        alignItems: isMobile ? 'center' : 'flex-start',
        gap: 3,
        mb: 3
      }}>
        {/* Profile Image */}
        <Badge
          overlap="circular"
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          badgeContent={
            <IconButton 
              component={RouterLink}
              to="/my-profile-update"
              sx={{ 
                bgcolor: 'secondary.main',
                '&:hover': { bgcolor: 'secondary.dark' }
              }}
            >
              <EditIcon fontSize="small" sx={{ color: 'white' }} />
            </IconButton>
          }
        >
          <Avatar
            src={profileImage}
            alt={fullName}
            sx={{
              width: isMobile ? 120 : 150,
              height: isMobile ? 120 : 150,
              border: '4px solid',
              borderColor: 'secondary.main',
              cursor: 'pointer',
              transition: 'transform 0.3s',
              '&:hover': {
                transform: 'scale(1.05)'
              }
            }}
          />
        </Badge>

        {/* Profile Info */}
        <Box sx={{ 
          textAlign: isMobile ? 'center' : 'left',
          flexGrow: 1
        }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: isMobile ? 'center' : 'flex-start',
            gap: 2,
            mb: 1
          }}>
            <Typography variant="h4" component="h1">
              {fullName || 'Anonymous User'}
            </Typography>
            <Chip 
              label={isVerified ? "Verified" : "Not Verified"} 
              color={isVerified ? "success" : "default"} 
              size="small"
            />
          </Box>

          <Box sx={{ 
            display: 'flex',
            gap: 2,
            justifyContent: isMobile ? 'center' : 'flex-start',
            mb: 2
          }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<EditIcon />}
              onClick={() => navigate('/my-profile-update')}
            >
              Edit Profile
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              startIcon={<LockIcon />}
              onClick={() => navigate('/update-password')}
            >
              Change Password
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Tabs */}
      <Tabs 
        value={tabValue} 
        onChange={handleTabChange} 
        variant={isMobile ? "scrollable" : "standard"}
        scrollButtons="auto"
        sx={{ 
          borderBottom: 1, 
          borderColor: 'divider',
          '& .MuiTab-root': { minWidth: 120 }
        }}
      >
        <Tab label="Profile" icon={isMobile ? <CameraIcon /> : null} iconPosition="start" />
        <Tab label="Media" icon={isMobile ? <CameraIcon /> : null} iconPosition="start" />
        <Tab label="Tools" icon={isMobile ? <CameraIcon /> : null} iconPosition="start" />
        <Tab label="Professional" icon={isMobile ? <CameraIcon /> : null} iconPosition="start" />
        <Tab label="Privacy" icon={isMobile ? <LockIcon /> : null} iconPosition="start" />
      </Tabs>
    </Box>
  );
};

export default PrivateProfileHeader;