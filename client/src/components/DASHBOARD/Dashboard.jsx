import {
  Edit as EditIcon,
  Event as EventsIcon,
  People as FriendsIcon,
  AccountBox as InfoIcon,
  Favorite as LikesIcon,
  Lock as LockIcon,
  PhotoLibrary as MediaIcon,
  Chat as MessagesIcon,
  Article as PostsIcon,
  Security as PrivacyIcon,
  BusinessCenter as ProfessionalIcon,
  Visibility as PublicIcon,
  PhotoCamera as StoriesIcon,
  Build as ToolsIcon,
  Visibility as ViewsIcon
} from '@mui/icons-material';

import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Grid,
  Typography,
  useMediaQuery,
  useTheme
} from '@mui/material';

import React from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
// import ProfileHeader from '../PROFILE/PrivateProfile/ProfileHeader';

const Dashboard = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { profile } = useSelector((state) => state.user);

  const cardStyle = (color) => ({
    height: '100%',
    background: `linear-gradient(135deg, ${color} 0%, ${theme.palette.background.paper} 100%)`,
    color: theme.palette.getContrastText(color),
    '&:hover': { transform: 'translateY(-4px)', boxShadow: 4 },
    transition: '0.3s'
  });

  const renderCard = ({ title, icon, subtitle, color, action }, index) => (
    <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
      <Card sx={cardStyle(color)} onClick={action}>
        <CardContent sx={{ p: 2 }}>
          <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 48, height: 48, mb: 1 }}>
            {icon}
          </Avatar>
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom noWrap>
            {title}
          </Typography>
          <Typography variant="body2" noWrap>{subtitle}</Typography>
        </CardContent>
        <Box sx={{ px: 2, pb: 2 }}>
          <Button
            variant="outlined"
            size="small"
            fullWidth
            sx={{
              fontSize: '0.75rem',
              py: 0.5,
              color: 'inherit',
              borderColor: 'rgba(255,255,255,0.5)',
              '&:hover': {
                bgcolor: 'rgba(255,255,255,0.1)',
                borderColor: 'white'
              }
            }}
          >
            Explore
          </Button>
        </Box>
      </Card>
    </Grid>
  );

  const socialCards = [
    {
      title: "Social Feed",
      icon: <PostsIcon fontSize="large" />,
      subtitle: "See latest posts",
      color: theme.palette.primary.main,
      action: () => navigate('/feed')
    },
    {
      title: "Profile Views",
      icon: <ViewsIcon fontSize="large" />,
      subtitle: "Check who's viewed",
      color: theme.palette.success.main,
      action: () => navigate('/insights')
    },
    {
      title: "Messages",
      icon: <MessagesIcon fontSize="large" />,
      subtitle: "View conversations",
      color: theme.palette.info.main,
      action: () => navigate('/messages')
    },
    {
      title: "Events",
      icon: <EventsIcon fontSize="large" />,
      subtitle: "Upcoming activities",
      color: theme.palette.error.main,
      action: () => navigate('/events')
    },
    {
      title: "Story Archive",
      icon: <StoriesIcon fontSize="large" />,
      subtitle: "Relive old moments",
      color: "#9c27b0",
      action: () => navigate('/stories')
    },
    {
      title: "Likes",
      icon: <LikesIcon fontSize="large" />,
      subtitle: "Content you liked",
      color: "#f44336",
      action: () => navigate('/likes')
    }
  ];

  const profileActionCards = [
    {
      title: "Edit Profile",
      icon: <EditIcon fontSize="large" />,
      subtitle: "Update your information",
      color: "#4caf50",
      action: () => navigate('/my-profile-update')
    },
    {
      title: "View as Public",
      icon: <PublicIcon fontSize="large" />,
      subtitle: "See your public profile",
      color: "#2196f3",
      action: () => window.open(`/profile/${profile?.id || 'me'}`, '_blank')
    },
    {
      title: "Update Password",
      icon: <LockIcon fontSize="large" />,
      subtitle: "Change your credentials",
      color: "#ff9800",
      action: () => navigate('/change-password')
    },
    {
      title: "Personal Info",
      icon: <InfoIcon fontSize="large" />,
      subtitle: "Your email, phone & bio",
      color: "#3f51b5",
      action: () => navigate('/profile/private-update')
    },
    {
      title: "Media",
      icon: <MediaIcon fontSize="large" />,
      subtitle: "Your uploaded content",
      color: "#9c27b0",
      action: () => navigate('/profile/media')
    },
    {
      title: "Tools",
      icon: <ToolsIcon fontSize="large" />,
      subtitle: "Developer or creative tools",
      color: "#607d8b",
      action: () => navigate('/profile/tools')
    },
    {
      title: "Professional",
      icon: <ProfessionalIcon fontSize="large" />,
      subtitle: "Job, career, portfolio",
      color: "#795548",
      action: () => navigate('/profile/professional')
    },
    {
      title: "Privacy Settings",
      icon: <PrivacyIcon fontSize="large" />,
      subtitle: "Control what others see",
      color: "#009688",
      action: () => navigate('/profile/privacy')
    },
    {
      title: "My Posts",
      icon: <PostsIcon fontSize="large" />,
      subtitle: "See all your posts",
      color: "#673ab7",
      action: () => navigate('/my-posts')
    },
    {
      title: "Friends",
      icon: <FriendsIcon fontSize="large" />,
      subtitle: "Manage your connections",
      color: "#00bcd4",
      action: () => navigate('/friends')
    },
    {
      title: "Blocked Users",
      icon: <PrivacyIcon fontSize="large" />,
      subtitle: "Users you blocked",
      color: "#607d8b",
      action: () => navigate('/profile/blocked-users')
    },
    {
      title: "Unblock Requests",
      icon: <LockIcon fontSize="large" />,
      subtitle: "Pending unblock requests",
      color: "#9e9e9e",
      action: () => navigate('/profile/unblock-requests')
    }
  ];

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        {/* <ProfileHeader
          userData={profile}
          isMobile={isMobile}
          navigate={navigate}
          onCoverPhotoEdit={() => {}}
          onProfilePhotoEdit={() => {}}
          coverImageLoading={false}
          //  hideAddFriendButton
        /> */}
      </Box>

      <Grid container spacing={3}>
        {socialCards.map(renderCard)}
      </Grid>

      <Typography variant="h5" sx={{ mt: 6, mb: 2 }}>Profile Settings</Typography>
      <Grid container spacing={3}>
        {profileActionCards.map(renderCard)}
      </Grid>

      {isMobile && (
        <Box sx={{
          position: 'fixed',
          bottom: 20,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <Card sx={{ borderRadius: 50, boxShadow: 3, px: 2, py: 1 }}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {[...socialCards.slice(0, 2), ...profileActionCards.slice(0, 2)].map((card, index) => (
                <Button
                  key={index}
                  startIcon={React.cloneElement(card.icon, { fontSize: 'small' })}
                  onClick={card.action}
                  sx={{
                    minWidth: 'unset',
                    color: card.color,
                    '&:hover': { bgcolor: `${card.color}10` }
                  }}
                />
              ))}
            </Box>
          </Card>
        </Box>
      )}
    </Container>
  );
};

export default Dashboard;

