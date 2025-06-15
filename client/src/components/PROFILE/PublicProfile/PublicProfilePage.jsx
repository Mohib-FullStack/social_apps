//! working
// src/components/PROFILE/PublicProfile/PublicProfilePage.jsx
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Grid,
  Tooltip,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import {
  acceptFriendRequest,
  cancelFriendRequest,
  sendFriendRequest
} from '../../../features/friendship/friendshipSlice';
import { showSnackbar } from '../../../features/snackbar/snackbarSlice';
import {
  fetchPublicProfile,
  selectCurrentUser,
  selectPublicProfile,
  selectPublicProfileError,
  selectPublicProfileStatus,
} from '../../../features/user/userSlice';
import AboutSection from './AboutSection';
import PostCard from './PostCard';
import ProfileHeader from './ProfileHeader';
import TabsSection from './TabsSection';

const FriendRequestButton = ({ friendId, currentStatus, disabled }) => {
  const dispatch = useDispatch();
  const [localStatus, setLocalStatus] = useState(currentStatus);
  const [isLoading, setIsLoading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    setLocalStatus(currentStatus);
  }, [currentStatus]);

  const handleAction = async (action, successMessage, errorMessage) => {
    setIsLoading(true);
    try {
      await dispatch(action({ friendId })).unwrap();
      dispatch(showSnackbar({
        message: successMessage,
        severity: 'success',
        autoHideDuration: 3000,
      }));
    } catch (error) {
      dispatch(showSnackbar({
        message: errorMessage || 'Action failed. Please try again later.',
        severity: 'error',
        autoHideDuration: 4000,
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const getButtonConfig = () => {
    switch (localStatus) {
      case 'friends':
        return {
          defaultLabel: 'Friends',
          hoverLabel: 'Unfriend',
          color: 'success',
          variant: 'contained',
          tooltip: 'Click to remove this friend',
          onClick: () => handleAction(
            
            'You are no longer friends',
            'Could not remove friend'
          ),
        };
      case 'pending_outgoing':
        return {
          defaultLabel: 'Request Sent',
          hoverLabel: 'Cancel Request',
          color: 'info',
          variant: 'contained',
          tooltip: 'Your friend request is pending. Click to cancel',
          onClick: () => handleAction(
            cancelFriendRequest,
            'Friend request cancelled',
            'Failed to cancel request'
          ),
        };
      case 'pending_incoming':
        return {
          defaultLabel: 'Respond to Request',
          hoverLabel: 'Accept Request',
          color: 'primary',
          variant: 'contained',
          tooltip: 'This user sent you a friend request',
          onClick: () => handleAction(
            acceptFriendRequest,
            'Friend request accepted!',
            'Failed to accept request'
          ),
        };
      case 'following':
        return {
          defaultLabel: 'Following',
          hoverLabel: 'Unfollow',
          color: 'secondary',
          variant: 'outlined',
          tooltip: 'You are following this user',
          onClick: () => {}, // Add unfollow logic if needed
        };
      default:
        return {
          defaultLabel: 'Add Friend',
          hoverLabel: 'Send Friend Request',
          color: 'primary',
          variant: 'contained',
          tooltip: 'Click to send a friend request',
          onClick: () => handleAction(
            sendFriendRequest,
            'Friend request sent successfully!',
            'Failed to send friend request'
          ),
        };
    }
  };

  const { defaultLabel, hoverLabel, color, variant, tooltip, onClick } = getButtonConfig();
  const displayLabel = isHovered ? hoverLabel : defaultLabel;

  // Special case for pending requests from other users
  if (localStatus === 'pending_incoming' && !isHovered) {
    return (
      <Tooltip title={tooltip} arrow>
        <Button
          variant="contained"
          color="primary"
          onClick={onClick}
          disabled={disabled || isLoading}
          startIcon={isLoading ? <CircularProgress size={16} /> : null}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          sx={buttonStyles}
        >
          Respond to Request
        </Button>
      </Tooltip>
    );
  }

  return (
    <Tooltip title={tooltip} arrow>
      <Button
        variant={variant}
        color={color}
        onClick={onClick}
        disabled={disabled || isLoading}
        startIcon={isLoading ? <CircularProgress size={16} /> : null}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        sx={buttonStyles}
      >
        {displayLabel}
      </Button>
    </Tooltip>
  );
};

const buttonStyles = {
  minWidth: 140,
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: 3,
  },
  '&.Mui-disabled': {
    opacity: 0.8,
  }
};

const PublicProfilePage = () => {
  const { id: profileId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isMobile = useMediaQuery((theme) => theme.breakpoints.down('sm'));

  // Redux state
  const currentUser = useSelector(selectCurrentUser);
  const publicProfile = useSelector(selectPublicProfile);
  const status = useSelector(selectPublicProfileStatus);
  const error = useSelector(selectPublicProfileError);

  // Fetch profile data
  useEffect(() => {
    if (profileId && profileId !== 'me' && profileId !== currentUser?.id?.toString()) {
      dispatch(fetchPublicProfile(profileId));
    }
  }, [profileId, currentUser?.id, dispatch]);

  // Redirect to private profile if viewing own profile
  if (profileId === currentUser?.id?.toString()) {
    return <Navigate to="/profile/me" replace />;
  }

  // Derived state
  const isOwnProfile = useMemo(
    () => publicProfile?.id === currentUser?.id,
    [publicProfile, currentUser]
  );

  const friendStatus = useMemo(() => {
    if (!publicProfile) return 'loading';
    if (publicProfile.isFriend) return 'friends';
    if (publicProfile.friendRequestStatus === 'pending_outgoing') return 'pending_outgoing';
    if (publicProfile.friendRequestStatus === 'pending_incoming') return 'pending_incoming';
    if (publicProfile.isFollowing) return 'following';
    return 'not_connected';
  }, [publicProfile]);

  // Local state
  const [activeTab, setActiveTab] = useState('timeline');

  // Loading state
  if (status === 'loading') {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress size={60} />
      </Box>
    );
  }

  // Error states
  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error.message || 'Failed to load profile'}
        </Alert>
        <Button variant="contained" onClick={() => navigate('/')}>
          Go Home
        </Button>
      </Container>
    );
  }

  if (!publicProfile) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="warning">Profile not found</Alert>
        <Button variant="contained" onClick={() => navigate('/')} sx={{ mt: 2 }}>
          Go Home
        </Button>
      </Container>
    );
  }

  // Handlers
  const handleMessage = () => {
    if (friendStatus !== 'friends') {
      dispatch(showSnackbar({
        message: 'You need to be friends to message this user',
        severity: 'warning',
        autoHideDuration: 4000,
      }));
      return;
    }
    navigate(`/messages/${profileId}`);
  };

  const handleViewFriends = () => navigate(`/profile/${profileId}/friends`);

  return (
    <Container maxWidth="lg" sx={{ mt: 2, mb: 4 }}>
      <ProfileHeader
        coverImage={publicProfile.coverImage || '/default-cover.jpg'}
        profileImage={publicProfile.profileImage || '/default-avatar.png'}
        isMobile={isMobile}
      />

      <Box sx={{ mt: isMobile ? 12 : 10, mb: 4 }}>
        <Typography variant="h4" align="center" gutterBottom>
          {`${publicProfile.firstName || ''} ${publicProfile.lastName || ''}`.trim()}
        </Typography>
        <Typography variant="subtitle1" align="center" color="text.secondary">
          {publicProfile.headline || 'SocialSphere Member'}
        </Typography>

        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 3, flexWrap: 'wrap' }}>
          <FriendRequestButton
            friendId={profileId}
            currentStatus={friendStatus}
            disabled={isOwnProfile}
          />
          
          {!isOwnProfile && (
            <Tooltip title={friendStatus !== 'friends' ? 
              "Become friends to message this user" : "Send a message"} arrow>
              <Button variant="outlined" onClick={handleMessage}>
                Message
              </Button>
            </Tooltip>
          )}
          
          <Button variant="text" onClick={handleViewFriends}>
            View Friends ({publicProfile.friendsCount || 0})
          </Button>
        </Box>
      </Box>

      <TabsSection activeTab={activeTab} onChangeTab={setActiveTab} />

      <Grid container spacing={3}>
        {activeTab !== 'about' && (
          <Grid item xs={12} md={4}>
            <AboutSection profile={publicProfile} condensed />
          </Grid>
        )}

        <Grid item xs={12} md={activeTab === 'about' ? 12 : 8}>
          {activeTab === 'timeline' && (
            <Box>
              {samplePosts.map((post) => (
                <PostCard
                  key={post.id}
                  author={`${publicProfile.firstName} ${publicProfile.lastName}`}
                  content={post.content}
                  date={post.date}
                  likes={post.likes}
                  comments={post.comments}
                  shares={post.shares}
                  image={post.image}
                  profileImage={publicProfile.profileImage}
                />
              ))}
            </Box>
          )}
          {activeTab === 'about' && <AboutSection profile={publicProfile} />}
        </Grid>
      </Grid>
    </Container>
  );
};

const samplePosts = [
  {
    id: 1,
    content: "Enjoying the beautiful weather today!",
    date: "2 hours ago",
    likes: 24,
    comments: 5,
    shares: 2,
    image: '/sample-post.jpg',
  },
];

export default PublicProfilePage;






//! running
// src/pages/PublicProfilePage.jsx
// import React, { useEffect, useMemo, useState } from 'react';
// import { useSelector, useDispatch } from 'react-redux';
// import { useParams, useNavigate, Navigate } from 'react-router-dom';
// import {
//   Container,
//   Grid,
//   Box,
//   Typography,
//   useMediaQuery,
//   CircularProgress,
//   Alert,
//   Button,
// } from '@mui/material';
// import {
//   fetchPublicProfile,
//   selectCurrentUser,
//   selectPublicProfile,
//   selectPublicProfileStatus,
//   selectPublicProfileError,
// } from '../../../features/user/userSlice';
// import {
//   sendFriendRequest,
//   cancelFriendRequest,
//   acceptFriendRequest,
//   rejectFriendRequest,
//   unfriendUser,
// } from '../../../features/friendship/friendshipSlice';
// import { showSnackbar } from '../../../features/snackbar/snackbarSlice';
// import ProfileHeader from './ProfileHeader';
// import AboutSection from './AboutSection';
// import TabsSection from './TabsSection';
// import PostCard from './PostCard';

// // Updated FriendRequestButton component with snackbar notifications
// const FriendRequestButton = ({ targetUserId, currentStatus, disabled }) => {
//   const dispatch = useDispatch();
//   const [localStatus, setLocalStatus] = useState(currentStatus);
//   const [isLoading, setIsLoading] = useState(false);

//   useEffect(() => {
//     setLocalStatus(currentStatus);
//   }, [currentStatus]);

//   const handleAction = async (action, successMessage, errorMessage) => {
//     setIsLoading(true);
//     try {
//       await dispatch(action({ targetUserId })).unwrap();
//       dispatch(showSnackbar({
//         message: successMessage,
//         severity: 'success',
//       }));
//     } catch (error) {
//       console.error('Friend request action failed:', error);
//       dispatch(showSnackbar({
//         message: errorMessage || 'Action failed. Please try again.',
//         severity: 'error',
//       }));
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const getButtonProps = () => {
//     switch (localStatus) {
//       case 'friends':
//         return {
//           label: 'Friends',
//           color: 'success',
//           variant: 'contained',
//           onClick: () => handleAction(
//             unfriendUser,
//             'Friend removed successfully',
//             'Failed to remove friend'
//           ),
//         };
//       case 'pending_outgoing':
//         return {
//           label: 'Request Sent',
//           color: 'info',
//           variant: 'contained',
//           onClick: () => handleAction(
//             cancelFriendRequest,
//             'Friend request cancelled',
//             'Failed to cancel friend request'
//           ),
//         };
//       case 'pending_incoming':
//         return {
//           label: 'Accept Request',
//           color: 'primary',
//           variant: 'contained',
//           onClick: () => handleAction(
//             acceptFriendRequest,
//             'Friend request accepted!',
//             'Failed to accept friend request'
//           ),
//         };
//       case 'following':
//         return {
//           label: 'Following',
//           color: 'secondary',
//           variant: 'outlined',
//           onClick: () => {}, // Add unfollow logic if needed
//         };
//       default:
//         return {
//           label: 'Add Friend',
//           color: 'primary',
//           variant: 'contained',
//           onClick: () => handleAction(
//             sendFriendRequest,
//             'Friend request sent!',
//             'Failed to send friend request'
//           ),
//         };
//     }
//   };

//   const { label, color, variant, onClick } = getButtonProps();

//   return (
//     <Button
//       variant={variant}
//       color={color}
//       onClick={onClick}
//       disabled={disabled || isLoading}
//       startIcon={isLoading ? <CircularProgress size={16} /> : null}
//       sx={{ minWidth: 120 }}
//     >
//       {label}
//     </Button>
//   );
// };

// const PublicProfilePage = () => {
//   const { id: profileId } = useParams();
//   const navigate = useNavigate();
//   const dispatch = useDispatch();
//   const isMobile = useMediaQuery((theme) => theme.breakpoints.down('sm'));

//   // Redux state
//   const currentUser = useSelector(selectCurrentUser);
//   const publicProfile = useSelector(selectPublicProfile);
//   const status = useSelector(selectPublicProfileStatus);
//   const error = useSelector(selectPublicProfileError);

//   // Fetch profile data
//   useEffect(() => {
//     if (profileId && profileId !== 'me' && profileId !== currentUser?.id?.toString()) {
//       dispatch(fetchPublicProfile(profileId));
//     }
//   }, [profileId, currentUser?.id, dispatch]);

//   // Redirect to private profile if viewing own profile
//   if (profileId === currentUser?.id?.toString()) {
//     return <Navigate to="/profile/me" replace />;
//   }

//   // Derived state
//   const isOwnProfile = useMemo(
//     () => publicProfile?.id === currentUser?.id,
//     [publicProfile, currentUser]
//   );

//   const friendStatus = useMemo(() => {
//     if (!publicProfile) return 'loading';
//     if (publicProfile.isFriend) return 'friends';
//     if (publicProfile.friendRequestStatus === 'pending_outgoing') return 'pending_outgoing';
//     if (publicProfile.friendRequestStatus === 'pending_incoming') return 'pending_incoming';
//     if (publicProfile.isFollowing) return 'following';
//     return 'not_connected';
//   }, [publicProfile]);

//   // Local state
//   const [activeTab, setActiveTab] = useState('timeline');

//   // Loading state
//   if (status === 'loading') {
//     return (
//       <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
//         <CircularProgress size={60} />
//       </Box>
//     );
//   }

//   // Error states
//   if (error) {
//     return (
//       <Container maxWidth="lg" sx={{ mt: 4 }}>
//         <Alert severity="error" sx={{ mb: 2 }}>
//           {error.message || 'Failed to load profile'}
//         </Alert>
//         <Button variant="contained" onClick={() => navigate('/')}>
//           Go Home
//         </Button>
//       </Container>
//     );
//   }

//   if (!publicProfile) {
//     return (
//       <Container maxWidth="lg" sx={{ mt: 4 }}>
//         <Alert severity="warning">Profile not found</Alert>
//         <Button variant="contained" onClick={() => navigate('/')} sx={{ mt: 2 }}>
//           Go Home
//         </Button>
//       </Container>
//     );
//   }

//   // Profile data
//   const profileData = {
//     fullName: `${publicProfile.firstName || ''} ${publicProfile.lastName || ''}`.trim(),
//     profileImage: publicProfile.profileImage || '/default-avatar.png',
//     coverImage: publicProfile.coverImage || '/default-cover.jpg',
//     headline: publicProfile.headline || 'SocialSphere Member',
//     friendsCount: publicProfile.friendsCount || 0,
//   };

//   // Handlers
//   const handleMessage = () => {
//     if (friendStatus !== 'friends') {
//       dispatch(showSnackbar({
//         message: 'You need to be friends to message this user',
//         severity: 'warning',
//       }));
//       return;
//     }
//     navigate(`/messages/${profileId}`);
//   };

//   const handleViewFriends = () => navigate(`/profile/${profileId}/friends`);

//   return (
//     <Container maxWidth="lg" sx={{ mt: 2, mb: 4 }}>
//       <ProfileHeader
//         coverImage={profileData.coverImage}
//         profileImage={profileData.profileImage}
//         isMobile={isMobile}
//       />

//       <Box sx={{ mt: isMobile ? 12 : 10, mb: 4 }}>
//         <Typography variant="h4" align="center" gutterBottom>
//           {profileData.fullName}
//         </Typography>
//         <Typography variant="subtitle1" align="center" color="text.secondary">
//           {profileData.headline}
//         </Typography>

//         <Box
//           sx={{
//             display: 'flex',
//             justifyContent: 'center',
//             gap: 2,
//             mt: 3,
//             flexWrap: 'wrap',
//           }}
//         >
//           <FriendRequestButton
//             targetUserId={profileId}
//             currentStatus={friendStatus}
//             disabled={isOwnProfile}
//           />
//           {!isOwnProfile && (
//             <Button
//               variant="outlined"
//               onClick={handleMessage}
//             >
//               Message
//             </Button>
//           )}
//           <Button variant="text" onClick={handleViewFriends}>
//             View Friends ({profileData.friendsCount})
//           </Button>
//         </Box>
//       </Box>

//       <TabsSection activeTab={activeTab} onChangeTab={setActiveTab} />

//       <Grid container spacing={3}>
//         {activeTab !== 'about' && (
//           <Grid item xs={12} md={4}>
//             <AboutSection profile={publicProfile} condensed />
//           </Grid>
//         )}

//         <Grid item xs={12} md={activeTab === 'about' ? 12 : 8}>
//           {activeTab === 'timeline' && (
//             <Box>
//               {samplePosts.map((post) => (
//                 <PostCard
//                   key={post.id}
//                   author={profileData.fullName}
//                   content={post.content}
//                   date={post.date}
//                   likes={post.likes}
//                   comments={post.comments}
//                   shares={post.shares}
//                   image={post.image}
//                   profileImage={profileData.profileImage}
//                 />
//               ))}
//             </Box>
//           )}
//           {activeTab === 'about' && <AboutSection profile={publicProfile} />}
//         </Grid>
//       </Grid>
//     </Container>
//   );
// };

// // Sample data
// const samplePosts = [
//   {
//     id: 1,
//     content: "Enjoying the beautiful weather today!",
//     date: "2 hours ago",
//     likes: 24,
//     comments: 5,
//     shares: 2,
//     image: '/sample-post.jpg',
//   },
// ];

// export default PublicProfilePage;






//! running
// import React, { useEffect, useMemo, useState } from 'react';
// import { useSelector, useDispatch } from 'react-redux';
// import { useParams, useNavigate, Navigate } from 'react-router-dom';
// import {
//   Container,
//   Grid,
//   Box,
//   Typography,
//   useMediaQuery,
//   CircularProgress,
//   Alert,
//   Button,
// } from '@mui/material';
// import {
//   fetchPublicProfile,
//   selectCurrentUser,
//   selectPublicProfile,
//   selectPublicProfileStatus,
//   selectPublicProfileError,
// } from '../../../features/user/userSlice';
// import {
//   sendFriendRequest,
//   cancelFriendRequest,
//   acceptFriendRequest,
//   rejectFriendRequest,
//   unfriendUser,
// } from '../../../features/friendship/friendshipSlice';
// import ProfileHeader from './ProfileHeader';
// import AboutSection from './AboutSection';
// import TabsSection from './TabsSection';
// import PostCard from './PostCard';

// // New standalone FriendRequestButton component
// const FriendRequestButton = ({ targetUserId, currentStatus, disabled }) => {
//   const dispatch = useDispatch();
//   const [localStatus, setLocalStatus] = useState(currentStatus);
//   const [isLoading, setIsLoading] = useState(false);

//   useEffect(() => {
//     setLocalStatus(currentStatus);
//   }, [currentStatus]);

//   const handleAction = async (action) => {
//     setIsLoading(true);
//     try {
//       await dispatch(action({ targetUserId })).unwrap();
//       // Status will be updated via Redux
//     } catch (error) {
//       console.error('Friend request action failed:', error);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const getButtonProps = () => {
//     switch (localStatus) {
//       case 'friends':
//         return {
//           label: 'Friends',
//           color: 'success',
//           variant: 'contained',
//           onClick: () => handleAction(unfriendUser),
//         };
//       case 'pending_outgoing':
//         return {
//           label: 'Request Sent',
//           color: 'info',
//           variant: 'contained',
//           onClick: () => handleAction(cancelFriendRequest),
//         };
//       case 'pending_incoming':
//         return {
//           label: 'Accept Request',
//           color: 'primary',
//           variant: 'contained',
//           onClick: () => handleAction(acceptFriendRequest),
//         };
//       case 'following':
//         return {
//           label: 'Following',
//           color: 'secondary',
//           variant: 'outlined',
//           onClick: () => {}, // Add unfollow logic if needed
//         };
//       default:
//         return {
//           label: 'Add Friend',
//           color: 'primary',
//           variant: 'contained',
//           onClick: () => handleAction(sendFriendRequest),
//         };
//     }
//   };

//   const { label, color, variant, onClick } = getButtonProps();

//   return (
//     <Button
//       variant={variant}
//       color={color}
//       onClick={onClick}
//       disabled={disabled || isLoading}
//       startIcon={isLoading ? <CircularProgress size={16} /> : null}
//       sx={{ minWidth: 120 }}
//     >
//       {label}
//     </Button>
//   );
// };

// const PublicProfilePage = () => {
//   const { id: profileId } = useParams();
//   const navigate = useNavigate();
//   const dispatch = useDispatch();
//   const isMobile = useMediaQuery((theme) => theme.breakpoints.down('sm'));

//   // Redux state
//   const currentUser = useSelector(selectCurrentUser);
//   const publicProfile = useSelector(selectPublicProfile);
//   const status = useSelector(selectPublicProfileStatus);
//   const error = useSelector(selectPublicProfileError);

//   // Fetch profile data
//   useEffect(() => {
//     if (profileId && profileId !== 'me' && profileId !== currentUser?.id?.toString()) {
//       dispatch(fetchPublicProfile(profileId));
//     }
//   }, [profileId, currentUser?.id, dispatch]);

//   // Redirect to private profile if viewing own profile
//   if (profileId === currentUser?.id?.toString()) {
//     return <Navigate to="/profile/me" replace />;
//   }

//   // Derived state
//   const isOwnProfile = useMemo(
//     () => publicProfile?.id === currentUser?.id,
//     [publicProfile, currentUser]
//   );

//   const friendStatus = useMemo(() => {
//     if (!publicProfile) return 'loading';
//     if (publicProfile.isFriend) return 'friends';
//     if (publicProfile.friendRequestStatus === 'pending_outgoing') return 'pending_outgoing';
//     if (publicProfile.friendRequestStatus === 'pending_incoming') return 'pending_incoming';
//     if (publicProfile.isFollowing) return 'following';
//     return 'not_connected';
//   }, [publicProfile]);

//   // Local state
//   const [activeTab, setActiveTab] = useState('timeline');

//   // Loading state
//   if (status === 'loading') {
//     return (
//       <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
//         <CircularProgress size={60} />
//       </Box>
//     );
//   }

//   // Error states
//   if (error) {
//     return (
//       <Container maxWidth="lg" sx={{ mt: 4 }}>
//         <Alert severity="error" sx={{ mb: 2 }}>
//           {error.message || 'Failed to load profile'}
//         </Alert>
//         <Button variant="contained" onClick={() => navigate('/')}>
//           Go Home
//         </Button>
//       </Container>
//     );
//   }

//   if (!publicProfile) {
//     return (
//       <Container maxWidth="lg" sx={{ mt: 4 }}>
//         <Alert severity="warning">Profile not found</Alert>
//         <Button variant="contained" onClick={() => navigate('/')} sx={{ mt: 2 }}>
//           Go Home
//         </Button>
//       </Container>
//     );
//   }

//   // Profile data
//   const profileData = {
//     fullName: `${publicProfile.firstName || ''} ${publicProfile.lastName || ''}`.trim(),
//     profileImage: publicProfile.profileImage || '/default-avatar.png',
//     coverImage: publicProfile.coverImage || '/default-cover.jpg',
//     headline: publicProfile.headline || 'SocialSphere Member',
//     friendsCount: publicProfile.friendsCount || 0,
//   };

//   // Handlers
//   const handleMessage = () => navigate(`/messages/${profileId}`);
//   const handleViewFriends = () => navigate(`/profile/${profileId}/friends`);

//   return (
//     <Container maxWidth="lg" sx={{ mt: 2, mb: 4 }}>
//       <ProfileHeader
//         coverImage={profileData.coverImage}
//         profileImage={profileData.profileImage}
//         isMobile={isMobile}
//       />

//       <Box sx={{ mt: isMobile ? 12 : 10, mb: 4 }}>
//         <Typography variant="h4" align="center" gutterBottom>
//           {profileData.fullName}
//         </Typography>
//         <Typography variant="subtitle1" align="center" color="text.secondary">
//           {profileData.headline}
//         </Typography>

//         <Box
//           sx={{
//             display: 'flex',
//             justifyContent: 'center',
//             gap: 2,
//             mt: 3,
//             flexWrap: 'wrap',
//           }}
//         >
//           <FriendRequestButton
//             targetUserId={profileId}
//             currentStatus={friendStatus}
//             disabled={isOwnProfile}
//           />
//           {!isOwnProfile && (
//             <Button
//               variant="outlined"
//               onClick={handleMessage}
//               disabled={friendStatus !== 'friends'}
//             >
//               Message
//             </Button>
//           )}
//           <Button variant="text" onClick={handleViewFriends}>
//             View Friends ({profileData.friendsCount})
//           </Button>
//         </Box>
//       </Box>

//       <TabsSection activeTab={activeTab} onChangeTab={setActiveTab} />

//       <Grid container spacing={3}>
//         {activeTab !== 'about' && (
//           <Grid item xs={12} md={4}>
//             <AboutSection profile={publicProfile} condensed />
//           </Grid>
//         )}

//         <Grid item xs={12} md={activeTab === 'about' ? 12 : 8}>
//           {activeTab === 'timeline' && (
//             <Box>
//               {samplePosts.map((post) => (
//                 <PostCard
//                   key={post.id}
//                   author={profileData.fullName}
//                   content={post.content}
//                   date={post.date}
//                   likes={post.likes}
//                   comments={post.comments}
//                   shares={post.shares}
//                   image={post.image}
//                   profileImage={profileData.profileImage}
//                 />
//               ))}
//             </Box>
//           )}
//           {activeTab === 'about' && <AboutSection profile={publicProfile} />}
//         </Grid>
//       </Grid>
//     </Container>
//   );
// };

// // Sample data
// const samplePosts = [
//   {
//     id: 1,
//     content: "Enjoying the beautiful weather today!",
//     date: "2 hours ago",
//     likes: 24,
//     comments: 5,
//     shares: 2,
//     image: '/sample-post.jpg',
//   },
// ];

// export default PublicProfilePage;

















































