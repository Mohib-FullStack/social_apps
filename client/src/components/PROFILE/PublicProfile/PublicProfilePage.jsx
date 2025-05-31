import React, { useEffect, useMemo, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Box,
  Typography,
  useMediaQuery,
  CircularProgress,
  Alert,
  Button,
} from '@mui/material';
import {
  fetchPublicProfile,
  selectCurrentUser,
  selectPublicProfile,
  selectPublicProfileStatus,
  selectPublicProfileError,
} from '../../../features/user/userSlice';
import { sendFriendRequest } from '../../../features/friendship/friendshipSlice';
import ProfileHeader from './ProfileHeader';
import ProfileActions from './ProfileActions';
import AboutSection from './AboutSection';
import TabsSection from './TabsSection';
import PostCard from './PostCard';

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

  // Debug logs
  console.log('[Profile] ID from URL:', profileId);
  console.log('[Profile] Current user ID:', currentUser?.id);
  console.log('[Profile] Public profile ID:', publicProfile?.id);

  // Fetch profile data
  useEffect(() => {
    if (profileId && profileId !== 'me' && profileId !== currentUser?.id?.toString()) {
      console.log('[Profile] Fetching public profile for ID:', profileId);
      dispatch(fetchPublicProfile(profileId));
    }
  }, [profileId, currentUser?.id, dispatch]);

  // Redirect to private profile if viewing own profile
  if (profileId === currentUser?.id?.toString()) {
    console.log('[Profile] Redirecting to private profile');
    return <Navigate to="/profile/me" replace />;
  }

  // Derived state
  const isOwnProfile = useMemo(() => (
    publicProfile?.id === currentUser?.id
  ), [publicProfile, currentUser]);

  const friendStatus = useMemo(() => {
    if (!publicProfile) return 'loading';
    if (publicProfile.isFriend) return 'friends';
    if (publicProfile.friendRequestStatus === 'pending') return 'pending';
    if (publicProfile.isFollowing) return 'following';
    return 'not_friends';
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
        <Alert severity="warning">
          Profile not found
        </Alert>
        <Button variant="contained" onClick={() => navigate('/')} sx={{ mt: 2 }}>
          Go Home
        </Button>
      </Container>
    );
  }

  // Profile data
  const profileData = {
    fullName: `${publicProfile.firstName || ''} ${publicProfile.lastName || ''}`,
    profileImage: publicProfile.profileImage || '/default-avatar.png',
    coverImage: publicProfile.coverImage || '/default-cover.jpg',
    headline: publicProfile.headline || 'SocialSphere Member',
    friendsCount: publicProfile.friendsCount || 0,
  };

  // Handlers
  const handleAddFriend = () => {
    dispatch(sendFriendRequest({ targetUserId: profileId }))
      .unwrap()
      .catch((err) => console.error('Friend request failed:', err));
  };

  const handleMessage = () => navigate(`/messages/${profileId}`);
  const handleViewFriends = () => navigate(`/profile/${profileId}/friends`);

  return (
    <Container maxWidth="lg" sx={{ mt: 2, mb: 4 }}>
      <ProfileHeader
        coverImage={profileData.coverImage}
        profileImage={profileData.profileImage}
        isMobile={isMobile}
      />

      <Box sx={{ mt: isMobile ? 12 : 10, mb: 4 }}>
        <Typography variant="h4" align="center" gutterBottom>
          {profileData.fullName}
        </Typography>
        <Typography variant="subtitle1" align="center" color="text.secondary">
          {profileData.headline}
        </Typography>

        <ProfileActions
          friendStatus={friendStatus}
          onAddFriend={handleAddFriend}
          onMessage={handleMessage}
          onViewFriends={handleViewFriends}
        />
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
                  author={profileData.fullName}
                  content={post.content}
                  date={post.date}
                  likes={post.likes}
                  comments={post.comments}
                  shares={post.shares}
                  image={post.image}
                  profileImage={profileData.profileImage}
                />
              ))}
            </Box>
          )}
          {activeTab === 'about' && (
            <AboutSection profile={publicProfile} />
          )}
        </Grid>
      </Grid>
    </Container>
  );
};

// Sample data
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
// import React, { useEffect, useMemo, useState, useCallback } from 'react';
// import { useSelector, useDispatch } from 'react-redux';
// import { useParams, useNavigate } from 'react-router-dom';
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
//   // updateCoverImage,
//   // updateProfileImage,
// } from '../../../features/user/userSlice';
// import { sendFriendRequest } from '../../../features/friendship/friendshipSlice';
// import ProfileHeader from './ProfileHeader';
// import ProfileActions from './ProfileActions';
// import AboutSection from './AboutSection';
// import TabsSection from './TabsSection';
// import PostCard from './PostCard';

// const PublicProfilePage = () => {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const dispatch = useDispatch();
//   const isMobile = useMediaQuery((theme) => theme.breakpoints.down('sm'));

//   // Redux state
//   const { profile, publicProfile, publicProfileStatus, publicProfileError } = useSelector(state => state.user);
//   const userId = useSelector(state => state.user.profile?.id);
  
//   const isOwnProfile = useMemo(() => {
//     if (!id || !userId) return false;
//     return id === userId.toString();
//   }, [id, userId]);

//   // Memoized friend status
//   const friendStatus = useMemo(() => {
//     if (isOwnProfile) return 'own_profile';
//     if (publicProfile?.isFriend) return 'friends';
//     if (publicProfile?.friendRequestStatus === 'pending') return 'pending';
//     if (publicProfile?.isFollowing) return 'following';
//     return 'not_friends';
//   }, [publicProfile, isOwnProfile]);

//   // Local state
//   const [activeTab, setActiveTab] = useState('timeline');
//   const [coverImageLoading, setCoverImageLoading] = useState(false);
//   const [profileImageLoading, setProfileImageLoading] = useState(false);

//   // Memoized profile data
//   const profileData = useMemo(() => ({
//     fullName: publicProfile ? `${publicProfile.firstName || ''} ${publicProfile.lastName || ''}` : '',
//     profileImage: publicProfile?.profileImage || '/default-avatar.png',
//     coverImage: publicProfile?.coverImage || '/default-cover.jpg',
//     headline: publicProfile?.headline || 'SocialSphere Member',
//     friendsCount: publicProfile?.friendsCount || 0,
//     ...publicProfile,
//   }), [publicProfile]);

//   // Handlers
//   const handleAddFriend = useCallback(async () => {
//     try {
//       await dispatch(sendFriendRequest({ targetuserId: id })).unwrap();
//     } catch (err) {
//       console.error('Failed to send friend request:', err);
//     }
//   }, [dispatch, id]);

//   const handleMessage = useCallback(() => navigate(`/messages/${id}`), [navigate, id]);
//   const handleEditProfile = useCallback(() => navigate('/profile/edit'), [navigate]);
//   const handleCreateStory = useCallback(() => navigate('/stories/create'), [navigate]);
//   const handleViewFriends = useCallback(() => navigate(`/profile/${id}/friends`), [navigate, id]);

//   const handleCoverPhotoEdit = useCallback(async (e) => {
//     const file = e.target.files[0];
//     if (!file) return;

//     setCoverImageLoading(true);
//     try {
//       const formData = new FormData();
//       formData.append('coverImage', file);
//       await dispatch(updateCoverImage(formData)).unwrap();
//     } catch (err) {
//       console.error('Failed to update cover image:', err);
//     } finally {
//       setCoverImageLoading(false);
//     }
//   }, [dispatch]);

//   const handleProfilePhotoEdit = useCallback(async (e) => {
//     const file = e.target.files[0];
//     if (!file) return;

//     setProfileImageLoading(true);
//     try {
//       const formData = new FormData();
//       formData.append('profileImage', file);
//       await dispatch(updateProfileImage(formData)).unwrap();
//     } catch (err) {
//       console.error('Failed to update profile image:', err);
//     } finally {
//       setProfileImageLoading(false);
//     }
//   }, [dispatch]);

//   // Fetch profile data
//   useEffect(() => {
//     if (!id || id === 'undefined') {
//       navigate(userId ? `/profile/${userId}` : '/');
//       return;
//     }

//     if (id === 'me' && userId) {
//          navigate(`/profile/${userId}`, { replace: true });
//       return;
//     }

//     if (/^\d+$/.test(id)) {
//       dispatch(fetchPublicProfile(id));
//     } else {
//       navigate('/error/invalid-profile');
//     }
//   }, [id, userId, dispatch, navigate]);

//   // Loading states
//   if (!userId && publicProfileStatus === 'loading') {
//     return (
//       <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
//         <CircularProgress size={60} />
//       </Box>
//     );
//   }

//   if (publicProfileStatus === 'loading') {
//     return (
//       <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
//         <CircularProgress size={60} />
//       </Box>
//     );
//   }

//   // Error state
//   if (publicProfileError) {
//     return (
//       <Container maxWidth="lg" sx={{ mt: 4 }}>
//         <Alert severity="error" sx={{ mb: 2 }}>
//           {publicProfileError.message || 'Failed to load profile'}
//         </Alert>
//         <Button variant="contained" onClick={() => navigate('/')} fullWidth>
//           Go Home
//         </Button>
//       </Container>
//     );
//   }

//   if (!publicProfile) {
//     return (
//       <Container maxWidth="lg" sx={{ mt: 4 }}>
//         <Alert severity="warning" sx={{ mb: 2 }}>
//           Profile not found
//         </Alert>
//         <Button variant="contained" onClick={() => navigate('/')} fullWidth>
//           Go Home
//         </Button>
//       </Container>
//     );
//   }

//   return (
//     <Container maxWidth="lg" sx={{ mt: 2, mb: 4 }}>
//       <ProfileHeader
//         coverImage={profileData.coverImage}
//         profileImage={profileData.profileImage}
//         isOwnProfile={isOwnProfile}
//         isMobile={isMobile}
//         onCoverPhotoEdit={isOwnProfile ? handleCoverPhotoEdit : undefined}
//         onProfilePhotoEdit={isOwnProfile ? handleProfilePhotoEdit : undefined}
//         coverImageLoading={coverImageLoading}
//         profileImageLoading={profileImageLoading}
//       />

//       <Box sx={{ mt: isMobile ? 12 : 10, mb: 4 }}>
//         <Typography variant="h4" align="center" gutterBottom>
//           {profileData.fullName}
//         </Typography>
//         <Typography variant="subtitle1" align="center" color="text.secondary">
//           {profileData.headline}
//         </Typography>

//         <ProfileActions
//           isOwnProfile={isOwnProfile}
//           friendStatus={friendStatus}
//           onAddFriend={!isOwnProfile ? handleAddFriend : undefined}
//           onMessage={!isOwnProfile ? handleMessage : undefined}
//           onEditProfile={isOwnProfile ? handleEditProfile : undefined}
//           onCreateStory={isOwnProfile ? handleCreateStory : undefined}
//           onViewFriends={handleViewFriends}
//         />
//       </Box>

//       <TabsSection activeTab={activeTab} onChangeTab={setActiveTab} />

//       <Grid container spacing={3}>
//         {activeTab !== 'about' && (
//           <Grid item xs={12} md={4}>
//             <AboutSection profile={publicProfile} isOwnProfile={isOwnProfile} condensed />
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
//           {activeTab === 'about' && (
//             <AboutSection profile={publicProfile} isOwnProfile={isOwnProfile} />
//           )}
//         </Grid>
//       </Grid>
//     </Container>
//   );
// };

// // Sample posts (to be replaced with real data from API)
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
// import React, { useEffect, useMemo, useState, useCallback } from 'react';
// import { useSelector, useDispatch } from 'react-redux';
// import { useParams, useNavigate } from 'react-router-dom';
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
//   updateCoverImage,
//   // updateProfileImage,
// } from '../../../features/user/userSlice';
// import { sendFriendRequest } from '../../../features/friendship/friendshipSlice';

// import ProfileHeader from './ProfileHeader';
// import ProfileActions from './ProfileActions';
// import AboutSection from './AboutSection';
// import TabsSection from './TabsSection';
// import PostCard from './PostCard';

// const PublicProfilePage = () => {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const dispatch = useDispatch();
//   const isMobile = useMediaQuery((theme) => theme.breakpoints.down('sm'));

//   // Redux state
//   const { profile, publicProfile, publicProfileStatus, publicProfileError } = useSelector(state => state.user);
//   const currentUserId = profile?.id;
//   const isOwnProfile = id === currentUserId?.toString();

//   // Memoized friend status
//   const friendStatus = useMemo(() => {
//     if (isOwnProfile) return 'own_profile';
//     if (publicProfile?.isFriend) return 'friends';
//     if (publicProfile?.friendRequestStatus === 'pending') return 'pending';
//     if (publicProfile?.isFollowing) return 'following';
//     return 'not_friends';
//   }, [publicProfile, isOwnProfile]);

//   // Local state
//   const [activeTab, setActiveTab] = useState('timeline');
//   const [coverImageLoading, setCoverImageLoading] = useState(false);
//   const [profileImageLoading, setProfileImageLoading] = useState(false);

//   // Memoized profile data
//   const profileData = useMemo(() => ({
//     fullName: publicProfile ? `${publicProfile.firstName || ''} ${publicProfile.lastName || ''}` : '',
//     profileImage: publicProfile?.profileImage || '/default-avatar.png',
//     coverImage: publicProfile?.coverImage || '/default-cover.jpg',
//     headline: publicProfile?.headline || 'SocialSphere Member',
//     friendsCount: publicProfile?.friendsCount || 0,
//     ...publicProfile,
//   }), [publicProfile]);

//   // Handlers
//   const handleAddFriend = useCallback(async () => {
//     try {
//       await dispatch(sendFriendRequest({ targetUserId: id })).unwrap();
//     } catch (err) {
//       console.error('Failed to send friend request:', err);
//     }
//   }, [dispatch, id]);

//   const handleMessage = () => navigate(`/messages/${id}`);
//   const handleEditProfile = () => navigate('/profile/edit');
  
//   const handleCreateStory = () => {
//     navigate('/stories/create');
//   };

//   const handleViewFriends = () => {
//     navigate(`/profile/${id}/friends`);
//   };

//   const handleCoverPhotoEdit = async (e) => {
//     const file = e.target.files[0];
//     if (!file) return;

//     setCoverImageLoading(true);
//     try {
//       const formData = new FormData();
//       formData.append('coverImage', file);
//       await dispatch(updateCoverImage(formData)).unwrap();
//     } catch (err) {
//       console.error('Failed to update cover image:', err);
//     } finally {
//       setCoverImageLoading(false);
//     }
//   };

//   const handleProfilePhotoEdit = async (e) => {
//     const file = e.target.files[0];
//     if (!file) return;

//     setProfileImageLoading(true);
//     try {
//       const formData = new FormData();
//       formData.append('profileImage', file);
//       await dispatch(updateProfileImage(formData)).unwrap();
//     } catch (err) {
//       console.error('Failed to update profile image:', err);
//     } finally {
//       setProfileImageLoading(false);
//     }
//   };

//   // Fetch profile data
//   useEffect(() => {
//     if (!id || id === 'undefined') {
//       navigate(currentUserId ? `/profile/${currentUserId}` : '/');
//       return;
//     }

//     if (id === 'me' && currentUserId) {
//       navigate(`/profile/${currentUserId}`, { replace: true });
//       return;
//     }

//     if (/^\d+$/.test(id)) {
//       dispatch(fetchPublicProfile(id));
//     } else {
//       navigate('/error/invalid-profile');
//     }
//   }, [id, currentUserId, dispatch, navigate]);

//   // Loading state
//   if (publicProfileStatus === 'loading') {
//     return (
//       <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
//         <CircularProgress size={60} />
//       </Box>
//     );
//   }

//   // Error state
//   if (publicProfileError) {
//     return (
//       <Container maxWidth="lg" sx={{ mt: 4 }}>
//         <Alert severity="error" sx={{ mb: 2 }}>
//           {publicProfileError.message || 'Failed to load profile'}
//         </Alert>
//         <Button variant="contained" onClick={() => navigate('/')} fullWidth>
//           Go Home
//         </Button>
//       </Container>
//     );
//   }

//   if (!publicProfile) {
//     return (
//       <Container maxWidth="lg" sx={{ mt: 4 }}>
//         <Alert severity="warning" sx={{ mb: 2 }}>
//           Profile not found
//         </Alert>
//         <Button variant="contained" onClick={() => navigate('/')} fullWidth>
//           Go Home
//         </Button>
//       </Container>
//     );
//   }

//   return (
//     <Container maxWidth="lg" sx={{ mt: 2, mb: 4 }}>
//       <ProfileHeader
//         coverImage={profileData.coverImage}
//         profileImage={profileData.profileImage}
//         isOwnProfile={isOwnProfile}
//         isMobile={isMobile}
//         onCoverPhotoEdit={isOwnProfile ? handleCoverPhotoEdit : undefined}
//         onProfilePhotoEdit={isOwnProfile ? handleProfilePhotoEdit : undefined}
//         coverImageLoading={coverImageLoading}
//         profileImageLoading={profileImageLoading}
//       />

//       <Box sx={{ mt: isMobile ? 12 : 10, mb: 4 }}>
//         <Typography variant="h4" align="center" gutterBottom>
//           {profileData.fullName}
//         </Typography>
//         <Typography variant="subtitle1" align="center" color="text.secondary">
//           {profileData.headline}
//         </Typography>

//         <ProfileActions
//           isOwnProfile={isOwnProfile}
//           friendStatus={friendStatus}
//           onAddFriend={!isOwnProfile ? handleAddFriend : undefined}
//           onMessage={!isOwnProfile ? handleMessage : undefined}
//           onEditProfile={isOwnProfile ? handleEditProfile : undefined}
//           onCreateStory={isOwnProfile ? handleCreateStory : undefined}
//           onViewFriends={handleViewFriends}
//         />
//       </Box>

//       <TabsSection activeTab={activeTab} onChangeTab={setActiveTab} />

//       <Grid container spacing={3}>
//         {activeTab !== 'about' && (
//           <Grid item xs={12} md={4}>
//             <AboutSection profile={publicProfile} isOwnProfile={isOwnProfile} condensed />
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
//           {activeTab === 'about' && (
//             <AboutSection profile={publicProfile} isOwnProfile={isOwnProfile} />
//           )}
//         </Grid>
//       </Grid>
//     </Container>
//   );
// };

// // Sample posts (to be replaced with real data from API)
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

// // export default React.memo(PublicProfilePage);
// export default PublicProfilePage;



//! running
// import React, { useEffect, useMemo, useState, useCallback } from 'react';
// import { useSelector, useDispatch } from 'react-redux';
// import { useParams, useNavigate } from 'react-router-dom';
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
//   updateCoverImage,
// } from '../../../features/user/userSlice';
// import { sendFriendRequest } from '../../../features/friendship/friendshipSlice';

// import ProfileHeader from './ProfileHeader';
// import ProfileActions from './ProfileActions';
// import AboutSection from './AboutSection';
// import TabsSection from './TabsSection';
// import PostCard from './PostCard';

// const PublicProfilePage = () => {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const dispatch = useDispatch();
//   const isMobile = useMediaQuery((theme) => theme.breakpoints.down('sm'));

//   // Redux state
//   const { profile, publicProfile, publicProfileStatus, publicProfileError } = useSelector(state => state.user);
//   const { statusByUserId = {} } = useSelector(state => state.friendship);

//   const currentUserId = profile?.id;
//   const isOwnProfile = id === currentUserId?.toString();
//   const friendStatus = statusByUserId[id] || 'not_friends';

//   // Local state
//   const [activeTab, setActiveTab] = useState('timeline');
//   const [coverImageLoading, setCoverImageLoading] = useState(false);
//   const [profileImageLoading, setProfileImageLoading] = useState(false);

//   // Memoized profile data
//   const profileData = useMemo(() => ({
//     fullName: publicProfile ? `${publicProfile.firstName || ''} ${publicProfile.lastName || ''}` : '',
//     profileImage: publicProfile?.profileImage || '/default-avatar.png',
//     coverImage: publicProfile?.coverImage || '/default-cover.jpg',
//     headline: publicProfile?.headline || 'SocialSphere Member',
//     friendsCount: publicProfile?.friendsCount || 0,
//     ...publicProfile,
//   }), [publicProfile]);

//   // Handlers
//   const handleAddFriend = useCallback(async () => {
//     try {
//       await dispatch(sendFriendRequest({ targetUserId: id })).unwrap();
//     } catch (err) {
//       console.error('Failed to send friend request:', err);
//     }
//   }, [dispatch, id]);

//   const handleMessage = () => navigate(`/messages/${id}`);
//   const handleEditProfile = () => navigate('/profile/edit');
//   const handleCreateStory = () => navigate('/stories/create');
//   const handleViewFriends = () => navigate(`/profile/${id}/friends`);

//   const handleCoverPhotoEdit = async (e) => {
//     const file = e.target.files[0];
//     if (!file) return;

//     setCoverImageLoading(true);
//     try {
//       const formData = new FormData();
//       formData.append('coverImage', file);
//       await dispatch(updateCoverImage(formData)).unwrap();
//     } catch (err) {
//       console.error('Failed to update cover image:', err);
//     } finally {
//       setCoverImageLoading(false);
//     }
//   };

//   const handleProfilePhotoEdit = async (e) => {
//     const file = e.target.files[0];
//     if (!file) return;

//     setProfileImageLoading(true);
//     try {
//       const formData = new FormData();
//       formData.append('profileImage', file);
//       await dispatch(updateProfileImage(formData)).unwrap();
//     } catch (err) {
//       console.error('Failed to update profile image:', err);
//     } finally {
//       setProfileImageLoading(false);
//     }
//   };

//   // Fetch profile data
//   useEffect(() => {
//     if (!id || id === 'undefined') {
//       navigate(currentUserId ? `/profile/${currentUserId}` : '/');
//       return;
//     }

//     if (id === 'me' && currentUserId) {
//       navigate(`/profile/${currentUserId}`, { replace: true });
//       return;
//     }

//     if (/^\d+$/.test(id)) {
//       dispatch(fetchPublicProfile(id));
//     } else {
//       navigate('/error/invalid-profile');
//     }
//   }, [id, currentUserId, dispatch, navigate]);

//   // Loading state
//   if (publicProfileStatus === 'loading') {
//     return (
//       <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
//         <CircularProgress size={60} />
//       </Box>
//     );
//   }

//   // Error state
//   if (publicProfileError) {
//     return (
//       <Container maxWidth="lg" sx={{ mt: 4 }}>
//         <Alert severity="error" sx={{ mb: 2 }}>
//           {publicProfileError.message || 'Failed to load profile'}
//         </Alert>
//         <Button variant="contained" onClick={() => navigate('/')} fullWidth>
//           Go Home
//         </Button>
//       </Container>
//     );
//   }

//   if (!publicProfile) {
//     return (
//       <Container maxWidth="lg" sx={{ mt: 4 }}>
//         <Alert severity="warning" sx={{ mb: 2 }}>
//           Profile not found
//         </Alert>
//         <Button variant="contained" onClick={() => navigate('/')} fullWidth>
//           Go Home
//         </Button>
//       </Container>
//     );
//   }

//   return (
//     <Container maxWidth="lg" sx={{ mt: 2, mb: 4 }}>
//       <ProfileHeader
//         coverImage={profileData.coverImage}
//         profileImage={profileData.profileImage}
//         isOwnProfile={isOwnProfile}
//         isMobile={isMobile}
//         onCoverPhotoEdit={isOwnProfile ? handleCoverPhotoEdit : undefined}
//         onProfilePhotoEdit={isOwnProfile ? handleProfilePhotoEdit : undefined}
//         coverImageLoading={coverImageLoading}
//       />

//       <Box sx={{ mt: isMobile ? 12 : 10, mb: 4 }}>
//         <Typography variant="h4" align="center" gutterBottom>
//           {profileData.fullName}
//         </Typography>
//         <Typography variant="subtitle1" align="center" color="text.secondary">
//           {profileData.headline}
//         </Typography>

//         <ProfileActions
//           isOwnProfile={isOwnProfile}
//           friendStatus={friendStatus}
//           onAddFriend={!isOwnProfile ? handleAddFriend : undefined}
//           onMessage={!isOwnProfile ? handleMessage : undefined}
//           onEditProfile={isOwnProfile ? handleEditProfile : undefined}
//           onCreateStory={isOwnProfile ? handleCreateStory : undefined}
//           onViewFriends={isOwnProfile ? handleViewFriends : undefined}
//         />
//       </Box>

//       <TabsSection activeTab={activeTab} onChangeTab={setActiveTab} />

//       <Grid container spacing={3}>
//         {activeTab !== 'about' && (
//           <Grid item xs={12} md={4}>
//             <AboutSection profile={publicProfile} isOwnProfile={isOwnProfile} condensed />
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
//           {activeTab === 'about' && (
//             <AboutSection profile={publicProfile} isOwnProfile={isOwnProfile} />
//           )}
//         </Grid>
//       </Grid>
//     </Container>
//   );
// };

// // Sample posts (you'll replace this with real post data eventually)
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

// export default React.memo(PublicProfilePage);








//! old
// import React, { useCallback, useEffect, useMemo, useState } from 'react';
// import { useSelector, useDispatch } from 'react-redux';
// import { useParams, useNavigate } from 'react-router-dom';
// import {
//   Container,
//   Grid,
//   Card,
//   CardContent,
//   CircularProgress,
//   Typography,
//   Box,
//   useMediaQuery,
//   Button,
//   Alert
// } from '@mui/material';
// import {
//   fetchPublicProfile,
//   updateCoverImage,
//   // updateProfileImage
// } from '../../../features/user/userSlice';
// import { sendFriendRequest } from '../../../features/friendship/friendshipSlice';
// import ProfileHeader from './ProfileHeader';
// import ProfileActions from './ProfileActions';
// import AboutSection from './AboutSection';
// import PostCard from './PostCard';
// import TabsSection from './TabsSection';

// const PublicProfilePage = () => {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const dispatch = useDispatch();
//   const isMobile = useMediaQuery((theme) => theme.breakpoints.down('sm'));
  
//   // Redux state
//   const {
//     profile,                // Current user's profile
//     publicProfile,          // Profile being viewed
//     publicProfileStatus: status,
//     publicProfileError: error,
//   } = useSelector(state => state.user);

//   const { statusByUserId = {} } = useSelector(state => state.friendship);
//   const friendStatus = id ? statusByUserId[id] || 'not_friends' : 'not_friends';

//   // Local state
//   const [activeTab, setActiveTab] = useState('timeline');
//   const [coverImageLoading, setCoverImageLoading] = useState(false);
//   const [profileImageLoading, setProfileImageLoading] = useState(false);

//   const isOwnProfile = profile?.id === publicProfile?.id;

//   // Memoized profile data
//   const profileData = useMemo(() => ({
//     fullName: publicProfile ? `${publicProfile.firstName || ''} ${publicProfile.lastName || ''}` : '',
//     profileImage: publicProfile?.profileImage || '/default-avatar.png',
//     coverImage: publicProfile?.coverImage || '/default-cover.jpg',
//     headline: publicProfile?.headline || 'SocialSphere Member',
//     friendsCount: publicProfile?.friendsCount || 0,
//     isCurrentUser: isOwnProfile,
//     ...publicProfile
//   }), [publicProfile, isOwnProfile]);

//   // Handlers
//   const handleAddFriend = useCallback(async () => {
//     if (!id) return;
//     try {
//       await dispatch(sendFriendRequest({ targetUserId: id })).unwrap();
//     } catch (err) {
//       console.error('Failed to send friend request:', err);
//     }
//   }, [dispatch, id]);

//   const handleMessage = useCallback(() => {
//     navigate(`/messages/${id}`);
//   }, [navigate, id]);

//   const handleEditProfile = useCallback(() => {
//     navigate('/profile/edit');
//   }, [navigate]);

//   const handleCreateStory = useCallback(() => {
//     navigate('/stories/create');
//   }, [navigate]);

//   const handleViewFriends = useCallback(() => {
//     navigate(`/profile/${id}/friends`);
//   }, [navigate, id]);

//   const handleCoverPhotoEdit = useCallback(async (e) => {
//     const file = e.target.files[0];
//     if (!file) return;

//     setCoverImageLoading(true);
//     try {
//       const formData = new FormData();
//       formData.append('coverImage', file);
//       await dispatch(updateCoverImage(formData)).unwrap();
//     } catch (err) {
//       console.error('Failed to update cover image:', err);
//     } finally {
//       setCoverImageLoading(false);
//     }
//   }, [dispatch]);

//   const handleProfilePhotoEdit = useCallback(async (e) => {
//     const file = e.target.files[0];
//     if (!file) return;

//     setProfileImageLoading(true);
//     try {
//       const formData = new FormData();
//       formData.append('profileImage', file);
//       await dispatch(updateProfileImage(formData)).unwrap();
//     } catch (err) {
//       console.error('Failed to update profile image:', err);
//     } finally {
//       setProfileImageLoading(false);
//     }
//   }, [dispatch]);

//   // Fetch profile data
//   useEffect(() => {
//     if (!id || id === 'undefined') {
//       navigate(profile?.id ? `/profile/${profile.id}` : '/');
//       return;
//     }
    
//     if (id === 'me' && profile?.id) {
//       navigate(`/profile/${profile.id}`, { replace: true });
//       return;
//     }

//     if (/^\d+$/.test(id)) {
//       dispatch(fetchPublicProfile(id));
//     } else {
//       navigate('/error/invalid-profile');
//     }
//   }, [id, profile?.id, dispatch, navigate]);

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
//         <Button variant="contained" onClick={() => navigate('/')} fullWidth>
//           Go Home
//         </Button>
//       </Container>
//     );
//   }

//   if (!publicProfile) {
//     return (
//       <Container maxWidth="lg" sx={{ mt: 4 }}>
//         <Alert severity="warning" sx={{ mb: 2 }}>
//           Profile not found
//         </Alert>
//         <Button variant="contained" onClick={() => navigate('/')} fullWidth>
//           Go Home
//         </Button>
//       </Container>
//     );
//   }

//   return (
//     <Container maxWidth="lg" sx={{ mt: 2, mb: 4 }}>
//       {/* Profile Header Section */}
//       <ProfileHeader
//         coverImage={profileData.coverImage}
//         profileImage={profileData.profileImage}
//         isOwnProfile={isOwnProfile}
//         isMobile={isMobile}
//         onCoverPhotoEdit={isOwnProfile ? handleCoverPhotoEdit : undefined}
//         onProfilePhotoEdit={isOwnProfile ? handleProfilePhotoEdit : undefined}
//         coverImageLoading={coverImageLoading}
//       />

//       {/* Profile Info Section */}
//       <Box sx={{ mt: isMobile ? 12 : 10, mb: 4 }}>
//         <Typography variant="h4" align="center" gutterBottom>
//           {profileData.fullName}
//         </Typography>
//         <Typography variant="subtitle1" align="center" color="text.secondary">
//           {profileData.headline}
//         </Typography>

//         {/* Action Buttons - Now properly differentiated */}
//         <ProfileActions
//           isOwnProfile={isOwnProfile}
//           friendStatus={friendStatus}
//           onAddFriend={!isOwnProfile ? handleAddFriend : undefined}
//           onMessage={!isOwnProfile ? handleMessage : undefined}
//           onEditProfile={isOwnProfile ? handleEditProfile : undefined}
//           onCreateStory={isOwnProfile ? handleCreateStory : undefined}
//           onViewFriends={isOwnProfile ? handleViewFriends : undefined}
//         />
//       </Box>

//       {/* Tabs Section */}
//       <TabsSection 
//         activeTab={activeTab} 
//         onChangeTab={setActiveTab} 
//       />

//       {/* Tab Content */}
//       <Grid container spacing={3}>
//         {activeTab !== 'about' && (
//           <Grid item xs={12} md={4}>
//             <AboutSection 
//               profile={publicProfile}
//               isOwnProfile={isOwnProfile}
//               condensed
//             />
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
//           {activeTab === 'about' && (
//             <AboutSection profile={publicProfile} isOwnProfile={isOwnProfile} />
//           )}
//         </Grid>
//       </Grid>
//     </Container>
//   );
// };

// // Sample data (replace with real data)
// const samplePosts = [
//   {
//     id: 1,
//     content: "Enjoying the beautiful weather today!",
//     date: "2 hours ago",
//     likes: 24,
//     comments: 5,
//     shares: 2,
//     image: '/sample-post.jpg'
//   }
// ];

// export default React.memo(PublicProfilePage);





//! old
// import React, { useEffect, useMemo, useCallback, useState } from 'react';
// import { useSelector, useDispatch } from 'react-redux';
// import { useParams, useNavigate } from 'react-router-dom';
// import {
//   Container,
//   Grid,
//   Card,
//   CardContent,
//   CircularProgress,
//   Typography,
//   Box,
//   useMediaQuery,
//   Button,
//   Alert
// } from '@mui/material';
// import { fetchPublicProfile } from '../../../features/user/userSlice';
// import { sendFriendRequest } from '../../../features/friendship/friendshipSlice';
// import ProfileHeader from './ProfileHeader';
// import ProfileActions from './ProfileActions';
// import AboutSection from './AboutSection';
// import ConnectionCard from './ConnectionCard';
// import MediaCard from './MediaCard';
// import PostCard from './PostCard';
// import TabsSection from './TabsSection';

// // Memoize static data to prevent recreation on every render
// const staticPosts = [
//   {
//     id: 1,
//     content: "Just visited the new art museum! The contemporary exhibits were breathtaking.",
//     date: "2 hours ago",
//     likes: 24,
//     comments: 5,
//     shares: 2,
//     image: '/post-sample-1.jpg'
//   },
//   {
//     id: 2,
//     content: "Working on a new project that combines AI with creative design. Excited to share more soon!",
//     date: "1 day ago",
//     likes: 12,
//     comments: 3,
//     shares: 0,
//     image: null
//   }
// ];

// const staticMedia = Array.from({ length: 6 }, (_, i) => ({
//   id: i + 1,
//   imageUrl: `/sample-media/${i + 1}.jpg`,
//   likes: Math.floor(Math.random() * 50) + 5
// }));

// const staticConnections = Array.from({ length: 6 }, (_, i) => ({
//   id: i + 1,
//   name: `Connection ${i + 1}`,
//   avatar: `/avatar-${(i % 3) + 1}.jpg`,
//   mutual: i % 2 === 0 ? Math.floor(Math.random() * 10) + 1 : 0
// }));

// const PublicProfilePage = () => {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const dispatch = useDispatch();
//   const isMobile = useMediaQuery((theme) => theme.breakpoints.down('sm'));
  
//   // Redux state selectors
//   const {
//     profile,                // Current user's profile
//     publicProfile,          // Profile being viewed
//     publicProfileStatus: status,
//     publicProfileError: error,
//   } = useSelector(state => state.user);

//   const {
//     statusByUserId = {}
//   } = useSelector(state => state.friendship);

//   const friendStatus = id ? statusByUserId[id] || 'none' : 'none';

//   const [activeTab, setActiveTab] = useState('timeline');
//   const isOwnProfile = profile?.id === publicProfile?.id;

//   const profileData = useMemo(() => ({
//     fullName: publicProfile ? `${publicProfile.firstName || ''} ${publicProfile.lastName || ''}` : '',
//     profileImage: publicProfile?.profileImage || '/default-avatar.png',
//     coverImage: publicProfile?.coverImage || '/default-cover.jpg',
//     headline: publicProfile?.headline || 'SocialSphere Member',
//     isCurrentUser: isOwnProfile,
//     ...publicProfile
//   }), [publicProfile, isOwnProfile]);

//   const handleAddFriend = useCallback(async () => {
//     if (!id) return;
    
//     try {
//       await dispatch(sendFriendRequest({ targetUserId: id })).unwrap();
//     } catch (err) {
//       console.error('Failed to send friend request:', err);
//       return <Alert severity="error">Failed to send friend request</Alert>;
//     }
//   }, [dispatch, id]);

//   const handleMessage = useCallback(() => {
//     if (!id) return;
//     navigate(`/messages/${id}`);
//   }, [navigate, id]);

//   const handleEditProfile = useCallback(() => {
//     navigate('/profile/edit');
//   }, [navigate]);

//   const handleCreateStory = useCallback(() => {
//     navigate('/stories/create');
//   }, [navigate]);

//   useEffect(() => {
//     if (!id || id === 'undefined') {
//       navigate(profile?.id ? `/profile/${profile.id}` : '/');
//       return;
//     }
    
//     if (id === 'me' && profile?.id) {
//       navigate(`/profile/${profile.id}`, { replace: true });
//       return;
//     }

//     if (/^\d+$/.test(id)) {
//       dispatch(fetchPublicProfile(id));
//     } else {
//       navigate('/error/invalid-profile');
//     }
//   }, [id, profile?.id, dispatch, navigate]);

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
//         <Alert severity="error" sx={{ mb: 2 }}>
//           Failed to load profile: {error.message || error}
//         </Alert>
//         <Button 
//           variant="contained" 
//           onClick={() => navigate('/')}
//           fullWidth
//         >
//           Go Home
//         </Button>
//       </Container>
//     );
//   }

//   if (!publicProfile) {
//     return (
//       <Container maxWidth="lg" sx={{ mt: 4 }}>
//         <Alert severity="warning" sx={{ mb: 2 }}>
//           Profile not found
//         </Alert>
//         <Button 
//           variant="contained" 
//           onClick={() => navigate('/')}
//           fullWidth
//         >
//           Go Home
//         </Button>
//       </Container>
//     );
//   }

//   const renderProfileContent = () => {
//     switch (activeTab) {
//       case 'timeline':
//         return (
//           <Box>
//             {staticPosts.map((post) => (
//               <PostCard 
//                 key={post.id}
//                 author={profileData.fullName}
//                 content={post.content}
//                 date={post.date}
//                 likes={post.likes}
//                 comments={post.comments}
//                 shares={post.shares}
//                 image={post.image}
//                 profileImage={profileData.profileImage}
//               />
//             ))}
//           </Box>
//         );
//       case 'about':
//         return <AboutSection profile={publicProfile} isOwnProfile={isOwnProfile} />;
//       case 'friends':
//         return <div>Friends content</div>;
//       case 'photos':
//         return <div>Photos content</div>;
//       default:
//         return null;
//     }
//   };

//   return (
//     <Container maxWidth="lg" sx={{ mt: 2, mb: 4 }}>
//       <ProfileHeader
//         coverImage={profileData.coverImage}
//         profileImage={profileData.profileImage}
//         isOwnProfile={isOwnProfile}
//         isMobile={isMobile}
//       />

//       <Box sx={{ mt: isMobile ? 12 : 10, mb: 4 }}>
//         <Typography variant="h4" align="center" gutterBottom>
//           {profileData.fullName}
//         </Typography>
//         <Typography variant="subtitle1" align="center" color="text.secondary">
//           {profileData.headline}
//         </Typography>

//         <ProfileActions
//           isOwnProfile={isOwnProfile}
//           friendStatus={friendStatus}
//           onAddFriend={!isOwnProfile ? handleAddFriend : undefined}
//           onMessage={!isOwnProfile ? handleMessage : undefined}
//           onEditProfile={isOwnProfile ? handleEditProfile : undefined}
//           onCreateStory={isOwnProfile ? handleCreateStory : undefined}
//         />
//       </Box>

//       <TabsSection 
//         activeTab={activeTab} 
//         onChangeTab={setActiveTab} 
//       />

//       <Grid container spacing={3}>
//         {activeTab !== 'about' && (
//           <Grid item xs={12} md={4}>
//             <AboutSection 
//               profile={publicProfile}
//               isOwnProfile={isOwnProfile}
//               condensed
//             />

//             <Card sx={{ mb: 3 }}>
//               <CardContent>
//                 <Typography variant="h6" gutterBottom>Media</Typography>
//                 <Grid container spacing={1}>
//                   {staticMedia.map((media) => (
//                     <Grid item xs={4} key={media.id}>
//                       <MediaCard 
//                         imageUrl={media.imageUrl}
//                         likes={media.likes}
//                       />
//                     </Grid>
//                   ))}
//                 </Grid>
//               </CardContent>
//             </Card>

//             <Card>
//               <CardContent>
//                 <Typography variant="h6" gutterBottom>Connections</Typography>
//                 <Grid container spacing={2}>
//                   {staticConnections.map((connection) => (
//                     <Grid item xs={6} key={connection.id}>
//                       <ConnectionCard 
//                         name={connection.name}
//                         avatar={connection.avatar}
//                         mutual={connection.mutual}
//                       />
//                     </Grid>
//                   ))}
//                 </Grid>
//               </CardContent>
//             </Card>
//           </Grid>
//         )}

//         <Grid item xs={12} md={activeTab === 'about' ? 12 : 8}>
//           {renderProfileContent()}
//         </Grid>
//       </Grid>
//     </Container>
//   );
// };

// export default React.memo(PublicProfilePage);





//! curent
// import { useState, useRef, useEffect, useMemo } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { useNavigate, useParams } from 'react-router-dom';
// import { fetchPublicProfile } from '../../../features/user/userSlice';
// import {
//   Add,
//   Cake,
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
//   Menu,
//   MenuItem,
//   Tab,
//   Tabs,
//   Typography,
//   useMediaQuery,
//   useTheme
// } from '@mui/material';
// import TabsSection from './TabsSection';
// import AboutSection from './AboutSection';
// import PostCard from './PostCard';
// import PhotoCard from './PhotoCard';
// import FriendCard from './FriendCard';
// import ProfileHeader from './ProfileHeader';

// const PublicProfilePage = () => {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const dispatch = useDispatch();
//   const theme = useTheme();
//   const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
//   const {
//     publicProfile,
//     publicProfileStatus: status,
//     publicProfileError: error,
//     updatePhotoStatus
//   } = useSelector((state) => state.user);
  
//   const { user } = useSelector((state) => state.user);
//   const [tabValue, setTabValue] = useState(0);
//   const [showCoverDialog, setShowCoverDialog] = useState(false);
//   const [showProfileDialog, setShowProfileDialog] = useState(false);
//   const [imageToCrop, setImageToCrop] = useState(null);
//   const [croppedImage, setCroppedImage] = useState(null);
//   const [uploadType, setUploadType] = useState(null);
//   const [anchorEl, setAnchorEl] = useState(null);
//   const coverInputRef = useRef(null);
//   const profileInputRef = useRef(null);

//   // Memoized derived values
//   const isOwnProfile = useMemo(
//   () => String(user?.id) === String(publicProfile?.id),
//   [user, publicProfile]
// );

//     console.log('User ID:', user?.id, 'Profile ID:', publicProfile?.id, 'Is own profile:', isOwnProfile); // <-- HERE
//   const formattedDate = useMemo(() => {
//     return publicProfile?.birthDate 
//       ? new Date(publicProfile.birthDate).toLocaleDateString('en-US', {
//           year: 'numeric',
//           month: 'long',
//           day: 'numeric'
//         })
//       : null;
//   }, [publicProfile?.birthDate]);

//   const profileImage = publicProfile?.profileImage || '/default-avatar.png';
//   const coverImage = publicProfile?.coverImage || '/default-cover.jpg';
//   const fullName = publicProfile ? `${publicProfile.firstName} ${publicProfile.lastName}` : '';

//   // Effect for loading profile
//   useEffect(() => {
//     if (!id || id === 'undefined') {
//       navigate(user?.id ? `/profile/public/${user.id}` : '/');
//       return;
//     }
    
//     if (id === 'me' && user?.id) {
//       navigate(`/profile/public/${user.id}`, { replace: true });
//       return;
//     }

//     if (/^\d+$/.test(id)) {
//       dispatch(fetchPublicProfile(id));
//     } else {
//       navigate('/error/invalid-profile');
//     }
//   }, [id, user?.id, dispatch, navigate]);

//   // Effect for handling errors
//   useEffect(() => {
//     if (error && error.status === 400 && error.message.includes('Invalid user ID')) {
//       if (user?.id) {
//         navigate(`/profile/public/${user.id}`, { replace: true });
//       } else {
//         navigate('/');
//       }
//     }
//   }, [error, navigate, user?.id]);

//   // Mock data - would normally come from API
//   const { posts, photos, friends } = useMemo(() => ({
//     posts: [
//       { 
//         id: 1, 
//         author: fullName,
//         content: "Just visited the new art museum!", 
//         date: "2 hours ago", 
//         likes: 24, 
//         comments: 5,
//         shares: 2,
//         image: '/post1.jpg'
//       },
//       { 
//         id: 2, 
//         author: fullName,
//         content: "Working on a new project", 
//         date: "1 day ago", 
//         likes: 12, 
//         comments: 3,
//         shares: 0
//       }
//     ],
//     photos: [
//       { id: 1, url: "/photo1.jpg", caption: "Vacation", likes: 15 },
//       { id: 2, url: "/photo2.jpg", caption: "Friends", likes: 23 },
//       { id: 3, url: "/photo3.jpg", caption: "Conference", likes: 8 }
//     ],
//     friends: Array(8).fill(0).map((_, i) => ({
//       id: i + 1,
//       name: `Friend ${i + 1}`,
//       avatar: `/avatar${(i % 3) + 1}.jpg`,
//       mutual: i % 2 === 0 ? Math.floor(Math.random() * 10) + 1 : 0
//     }))
//   }), [fullName]);

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

//   const handleFileChange = (e, type) => {
//     const file = e.target.files[0];
//     if (file) {
//       setUploadType(type);
//       const reader = new FileReader();
//       reader.onload = () => {
//         setImageToCrop(reader.result);
//         type === 'cover' ? setShowCoverDialog(true) : setShowProfileDialog(true);
//       };
//       reader.readAsDataURL(file);
//     }
//     e.target.value = null;
//   };

//   const handleAddFriend = () => {
//     // Implement add friend functionality
//     console.log('Add friend clicked');
//   };

//   if (status === 'loading') {
//     return (
//       <Backdrop open sx={{ zIndex: theme.zIndex.drawer + 1, color: '#fff' }}>
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
//           boxShadow: 4
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
//           boxShadow: 3
//         }}>
//           <Typography variant="h6" color="warning.contrastText">Profile not found</Typography>
//         </Card>
//         <Button variant="contained" onClick={() => navigate('/')}>
//           Return Home
//         </Button>
//       </Container>
//     );
//   }

//   return (
//     <Container maxWidth="lg" sx={{ mt: 0, mb: 4 }}>
//       {/* Hidden file inputs */}
//       <input
//         type="file"
//         ref={coverInputRef}
//         onChange={(e) => handleFileChange(e, 'cover')}
//         accept="image/*"
//         hidden
//       />
//       <input
//         type="file"
//         ref={profileInputRef}
//         onChange={(e) => handleFileChange(e, 'profile')}
//         accept="image/*"
//         hidden
//       />

//       <ProfileHeader
//         userData={{
//           ...publicProfile,
//           fullName,
//           profileImage,
//           coverImage,
//           isCurrentUser: isOwnProfile
//         }}
//         isMobile={isMobile}
//         navigate={navigate}
//         onCoverPhotoEdit={isOwnProfile ? (e) => handleFileChange(e, 'cover') : undefined}
//         onProfilePhotoEdit={isOwnProfile ? (e) => handleFileChange(e, 'profile') : undefined}
//         coverImageLoading={updatePhotoStatus === 'loading'}
//         handleAddFriend={handleAddFriend}
//         isOwnProfile={isOwnProfile}
//       />

//       <TabsSection 
//         tabValue={tabValue} 
//         handleTabChange={handleTabChange} 
//       />

//       <Grid container spacing={3}>
//         {/* Left Column */}
//         <Grid item xs={12} md={4}>
//           <AboutSection 
//             publicProfile={publicProfile}
//             isOwnProfile={isOwnProfile}
//             formattedDate={formattedDate}
//           />

//           {/* Photos Card */}
//           <Card sx={{ mb: 3, borderRadius: 2, boxShadow: 2 }}>
//             <CardHeader 
//               title="Photos" 
//               titleTypographyProps={{ variant: 'h6', fontWeight: 600 }}
//               action={<Button color="primary">See All</Button>}
//             />
//             <CardContent>
//               <Grid container spacing={1}>
//                 {photos.slice(0, 6).map((photo) => (
//                   <Grid item xs={4} key={photo.id}>
//                     <PhotoCard photo={photo} />
//                   </Grid>
//                 ))}
//               </Grid>
//             </CardContent>
//           </Card>

//           {/* Friends Card */}
//           <Card sx={{ mb: 3, borderRadius: 2, boxShadow: 2 }}>
//             <CardHeader 
//               title="Friends" 
//               titleTypographyProps={{ variant: 'h6', fontWeight: 600 }}
//               subheader={`${friends.length} friends`}
//               action={<Button color="primary">See All</Button>}
//             />
//             <CardContent>
//               <Grid container spacing={2}>
//                 {friends.slice(0, 6).map((friend) => (
//                   <Grid item xs={6} key={friend.id}>
//                     <FriendCard friend={friend} />
//                   </Grid>
//                 ))}
//               </Grid>
//             </CardContent>
//           </Card>
//         </Grid>

//         {/* Right Column */}
//         <Grid item xs={12} md={8}>
//           {/* Create Post Card (only for own profile) */}
//           {isOwnProfile && (
//             <Card sx={{ mb: 3, borderRadius: 2, boxShadow: 2 }}>
//               <CardContent>
//                 <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
//                   <Avatar src={profileImage} sx={{ mr: 2 }} />
//                   <Button 
//                     fullWidth 
//                     variant="outlined" 
//                     sx={{ 
//                       justifyContent: 'flex-start',
//                       borderRadius: 20,
//                       backgroundColor: '#f0f2f5',
//                       textTransform: 'none',
//                       color: '#65676b'
//                     }}
//                     onClick={() => navigate('/create-post')}
//                   >
//                     What's on your mind?
//                   </Button>
//                 </Box>
//                 <Divider />
//                 <Box sx={{ display: 'flex', justifyContent: 'space-around', pt: 1 }}>
//                   <Button 
//                     startIcon={<VideoLibraryIcon color="error" />}
//                     sx={{ color: '#65676b', textTransform: 'none' }}
//                   >
//                     Live Video
//                   </Button>
//                   <Button 
//                     startIcon={<PhotoLibraryIcon color="success" />}
//                     sx={{ color: '#65676b', textTransform: 'none' }}
//                   >
//                     Photo/Video
//                   </Button>
//                   <Button 
//                     startIcon={<Groups color="warning" />}
//                     sx={{ color: '#65676b', textTransform: 'none' }}
//                   >
//                     Feeling/Activity
//                   </Button>
//                 </Box>
//               </CardContent>
//             </Card>
//           )}

//           {/* Posts */}
//           {posts.length > 0 ? (
//             posts.map((post) => (
//               <PostCard 
//                 key={post.id} 
//                 post={post} 
//                 profileImage={profileImage}
//               />
//             ))
//           ) : (
//             <Card sx={{ 
//               mb: 3, 
//               borderRadius: 2,
//               boxShadow: 2,
//               textAlign: 'center',
//               p: 4
//             }}>
//               <PhotoLibraryIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
//               <Typography variant="h6" gutterBottom>
//                 {isOwnProfile ? "You haven't posted anything yet" : "No posts yet"}
//               </Typography>
//               <Typography color="text.secondary" sx={{ mb: 2 }}>
//                 {isOwnProfile 
//                   ? "Share your first post with your friends!" 
//                   : "When this user posts, you'll see it here."}
//               </Typography>
//               {isOwnProfile && (
//                 <Button 
//                   variant="contained" 
//                   startIcon={<Add />}
//                   onClick={() => navigate('/create-post')}
//                 >
//                   Create Post
//                 </Button>
//               )}
//             </Card>
//           )}
//         </Grid>
//       </Grid>

//       {/* Image Upload Dialogs */}
//       <Dialog open={showCoverDialog} onClose={() => setShowCoverDialog(false)} maxWidth="md" fullWidth>
//         <DialogTitle>Edit Cover Photo</DialogTitle>
//         <DialogContent>
//           <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
//             <Typography>Image cropper would appear here</Typography>
//           </Box>
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={() => setShowCoverDialog(false)}>Cancel</Button>
//           <Button 
//             variant="contained" 
//             onClick={() => {
//               setShowCoverDialog(false);
//               // Handle cover photo update
//             }}
//           >
//             Save
//           </Button>
//         </DialogActions>
//       </Dialog>

//       <Dialog open={showProfileDialog} onClose={() => setShowProfileDialog(false)} maxWidth="sm" fullWidth>
//         <DialogTitle>Edit Profile Photo</DialogTitle>
//         <DialogContent>
//           <Box sx={{ 
//             height: 300, 
//             display: 'flex', 
//             alignItems: 'center', 
//             justifyContent: 'center',
//             position: 'relative'
//           }}>
//             <Typography>Image cropper would appear here</Typography>
//           </Box>
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={() => setShowProfileDialog(false)}>Cancel</Button>
//           <Button 
//             variant="contained" 
//             onClick={() => {
//               setShowProfileDialog(false);
//               // Handle profile photo update
//             }}
//           >
//             Save
//           </Button>
//         </DialogActions>
//       </Dialog>
//     </Container>
//   );
// };

// export default PublicProfilePage;



// //! original-1
// import {
//   Add,
//   Cake,
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
// import ProfileHeader from './ProfileHeader';

// // Reusable components (keep these the same as before)
// const StatBox = ({ icon, count, label, theme }) => (
//   <Box sx={{ 
//     display: 'flex', 
//     flexDirection: 'column',
//     alignItems: 'center',
//     justifyContent: 'center',
//     p: 1.5,
//     borderRadius: 2,
//     backgroundColor: 'rgba(255,255,255,0.1)',
//     minWidth: 80,
//     backdropFilter: 'blur(5px)',
//     boxShadow: theme.shadows[1],
//     transition: 'transform 0.2s',
//     '&:hover': {
//       transform: 'translateY(-3px)'
//     }
//   }}>
//     <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
//       {icon}
//       <Typography variant="h6" fontWeight="bold" sx={{ ml: 0.5 }}>{count}</Typography>
//     </Box>
//     <Typography variant="caption" color="text.secondary">{label}</Typography>
//   </Box>
// );

// const InfoItem = ({ icon, label, value, isLink = false }) => (
//   <Box sx={{ display: 'flex', mb: 2 }}>
//     <Box sx={{ mr: 2, color: 'text.secondary' }}>{icon}</Box>
//     <Box>
//       <Typography variant="subtitle2" color="text.secondary">{label}</Typography>
//       {isLink ? (
//         <Link href={value.startsWith('http') ? value : `https://${value}`} target="_blank" rel="noopener">
//           {value}
//         </Link>
//       ) : (
//         <Typography variant="body1">{value}</Typography>
//       )}
//     </Box>
//   </Box>
// );

// const PostCard = ({ post, profileImage, theme }) => (
//   <Card sx={{ mb: 3, borderRadius: 3, boxShadow: theme.shadows[2] }}>
//     <CardHeader
//       avatar={<Avatar src={profileImage} />}
//       title={<Typography fontWeight="600">{post.author}</Typography>}
//       subheader={post.date}
//       action={
//         <IconButton>
//           <MoreVert />
//         </IconButton>
//       }
//     />
//     <CardContent sx={{ pt: 0 }}>
//       <Typography paragraph>{post.content}</Typography>
//       {post.image && (
//         <Box sx={{ 
//           borderRadius: 2, 
//           overflow: 'hidden', 
//           mb: 2,
//           boxShadow: theme.shadows[1]
//         }}>
//           <img 
//             src={post.image} 
//             alt="Post" 
//             style={{ 
//               width: '100%', 
//               maxHeight: 400, 
//               objectFit: 'cover' 
//             }} 
//           />
//         </Box>
//       )}
//       <Box sx={{ display: 'flex', justifyContent: 'space-between', color: 'text.secondary' }}>
//         <Typography variant="body2">
//           {post.likes} likes • {post.comments} comments • {post.shares} shares
//         </Typography>
//       </Box>
//       <Divider sx={{ my: 1.5 }} />
//       <Box sx={{ display: 'flex', justifyContent: 'space-around' }}>
//         <Button startIcon={<ThumbUp />} sx={{ color: 'text.secondary' }}>Like</Button>
//         <Button startIcon={<Comment />} sx={{ color: 'text.secondary' }}>Comment</Button>
//         <Button startIcon={<Share />} sx={{ color: 'text.secondary' }}>Share</Button>
//       </Box>
//     </CardContent>
//   </Card>
// );

// const PhotoCard = ({ photo, theme }) => (
//   <Card sx={{ borderRadius: 2, overflow: 'hidden', boxShadow: theme.shadows[2] }}>
//     <Box sx={{ position: 'relative', paddingTop: '100%' }}>
//       <img 
//         src={photo.url} 
//         alt={photo.caption} 
//         style={{ 
//           position: 'absolute', 
//           top: 0, 
//           left: 0, 
//           width: '100%', 
//           height: '100%', 
//           objectFit: 'cover' 
//         }} 
//       />
//     </Box>
//     <Box sx={{ p: 1.5 }}>
//       <Typography variant="subtitle2">{photo.caption}</Typography>
//       <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
//         <ThumbUp fontSize="small" color="action" />
//         <Typography variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>
//           {photo.likes}
//         </Typography>
//       </Box>
//     </Box>
//   </Card>
// );

// const FriendCard = ({ friend, theme }) => (
//   <Card sx={{ borderRadius: 2, overflow: 'hidden', boxShadow: theme.shadows[2] }}>
//     <Box sx={{ position: 'relative', paddingTop: '75%' }}>
//       <img 
//         src={friend.avatar} 
//         alt={friend.name} 
//         style={{ 
//           position: 'absolute', 
//           top: 0, 
//           left: 0, 
//           width: '100%', 
//           height: '100%', 
//           objectFit: 'cover' 
//         }} 
//       />
//     </Box>
//     <Box sx={{ p: 1.5 }}>
//       <Typography fontWeight="600">{friend.name}</Typography>
//       {friend.mutual > 0 && (
//         <Typography variant="caption" color="text.secondary">
//           {friend.mutual} mutual friend{friend.mutual !== 1 ? 's' : ''}
//         </Typography>
//       )}
//       <Button 
//         variant="contained" 
//         size="small" 
//         fullWidth 
//         sx={{ mt: 1 }}
//       >
//         {friend.mutual > 0 ? 'Add Friend' : 'Follow'}
//       </Button>
//     </Box>
//   </Card>
// );

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
//   const [showCoverDialog, setShowCoverDialog] = useState(false);
//   const [showProfileDialog, setShowProfileDialog] = useState(false);
//   const [imageToCrop, setImageToCrop] = useState(null);
//   const [croppedImage, setCroppedImage] = useState(null);
//   const [uploadType, setUploadType] = useState(null);
//   const [anchorEl, setAnchorEl] = useState(null);
//   const coverInputRef = useRef(null);
//   const profileInputRef = useRef(null);

//   useEffect(() => {
//     if (!id || id === 'undefined') {
//       navigate(user?.id ? `/profile/public/${user.id}` : '/');
//       return;
//     }
    
//     if (id === 'me' && user?.id) {
//       navigate(`/profile/public/${user.id}`, { replace: true });
//       return;
//     }

//     if (/^\d+$/.test(id)) {
//       dispatch(fetchPublicProfile(id));
//     } else {
//       navigate('/error/invalid-profile');
//     }
//   }, [id, user?.id, dispatch, navigate]);

//   useEffect(() => {
//     if (error && error.status === 400 && error.message.includes('Invalid user ID')) {
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

//   const handleCoverPhotoEdit = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       setUploadType('cover');
//       const reader = new FileReader();
//       reader.onload = () => {
//         setImageToCrop(reader.result);
//         setShowCoverDialog(true);
//       };
//       reader.readAsDataURL(file);
//     }
//     e.target.value = null;
//   };

//   const handleProfilePhotoEdit = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       setUploadType('profile');
//       const reader = new FileReader();
//       reader.onload = () => {
//         setImageToCrop(reader.result);
//         setShowProfileDialog(true);
//       };
//       reader.readAsDataURL(file);
//     }
//     e.target.value = null;
//   };

//   const handleAddFriend = () => {
//     // Implement add friend logic here
//     console.log('Add friend clicked');
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
//       author: `${publicProfile.firstName} ${publicProfile.lastName}`,
//       content: "Just visited the new art museum!", 
//       date: "2 hours ago", 
//       likes: 24, 
//       comments: 5,
//       shares: 2,
//       image: '/post1.jpg'
//     },
//     { 
//       id: 2, 
//       author: `${publicProfile.firstName} ${publicProfile.lastName}`,
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

//   return (
//     <ThemeProvider theme={theme}>
//       <Container maxWidth="lg" sx={{ mt: 0, mb: 4 }}>
//         {/* Hidden file inputs */}
//         <input
//           type="file"
//           ref={coverInputRef}
//           onChange={handleCoverPhotoEdit}
//           accept="image/*"
//           style={{ display: 'none' }}
//         />
//         <input
//           type="file"
//           ref={profileInputRef}
//           onChange={handleProfilePhotoEdit}
//           accept="image/*"
//           style={{ display: 'none' }}
//         />

//         {/* Profile Header Section */}
  
// <ProfileHeader
// userData={{
//     coverImage,
//     profileImage,
//     fullName: `${publicProfile.firstName} ${publicProfile.lastName}`,
//     isCurrentUser: isOwnProfile, // MUST be true for your own profile
//     isVerified: publicProfile.isVerified,
//     userId: publicProfile.id // Pass the actual profile ID
//   }}
// isMobile={false}
// // Only pass handleAddFriend for OTHER profiles
// showAddFriend={!isOwnProfile}
// onAddFriend={handleAddFriend}
// // ... other props
// />

//         {/* Profile Info Section below the header */}
//         <Box sx={{ 
//           position: 'relative', 
//           mt: 12,
//           mb: 4,
//           display: 'flex',
//           alignItems: 'flex-end',
//           justifyContent: 'space-between'
//         }}>
//           {/* Left Side - Name and Stats */}
//           <Box>
//             <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 0.5 }}>
//               {publicProfile.firstName} {publicProfile.lastName}
//               {publicProfile.isVerified && (
//                 <VerifiedIcon color="primary" sx={{ ml: 1, fontSize: 'inherit' }} />
//               )}
//             </Typography>
//             <Box sx={{ display: 'flex', gap: 2, mb: 1 }}>
//               <StatBox 
//                 icon={<PeopleIcon fontSize="small" />} 
//                 count={publicProfile.friendsCount || 0} 
//                 label="Friends" 
//                 theme={theme}
//               />
//               <StatBox 
//                 icon={<PostIcon fontSize="small" />} 
//                 count={posts.length} 
//                 label="Posts" 
//                 theme={theme}
//               />
//               <StatBox 
//                 icon={<PhotoLibraryIcon fontSize="small" />} 
//                 count={photos.length} 
//                 label="Photos" 
//                 theme={theme}
//               />
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
//                   sx={{ 
//                     backgroundColor: '#e4e6eb', 
//                     color: '#050505',
//                     '&:hover': {
//                       backgroundColor: '#d8dadf'
//                     }
//                   }}
//                   onClick={() => navigate(`/public-profile-update/${publicProfile.id}`)}
//                 >
//                   Edit profile
//                 </Button>
//               </>
//             ) : (
//               <>
//                 <Button 
//                   variant="contained" 
//                   color="primary"
//                   sx={{ 
//                     fontWeight: 600,
//                     boxShadow: 'none',
//                     '&:hover': {
//                       boxShadow: 'none',
//                       backgroundColor: theme.palette.primary.dark
//                     }
//                   }}
//                 >
//                   {publicProfile.isFriend ? "Friends" : "Add Friend"}
//                 </Button>
//                 <Button 
//                   variant="contained" 
//                   sx={{ 
//                     backgroundColor: '#e4e6eb', 
//                     color: '#050505',
//                     '&:hover': {
//                       backgroundColor: '#d8dadf'
//                     }
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
//               anchorOrigin={{
//                 vertical: 'bottom',
//                 horizontal: 'right',
//               }}
//               transformOrigin={{
//                 vertical: 'top',
//                 horizontal: 'right',
//               }}
//             >
//               <MenuItem onClick={() => {
//                 handleMenuClose();
//                 navigate('/about');
//               }}>
//                 About
//               </MenuItem>
//               <MenuItem onClick={handleMenuClose}>Report</MenuItem>
//               {isOwnProfile && (
//                 <MenuItem onClick={handleMenuClose}>Activity Log</MenuItem>
//               )}
//             </Menu>
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
//                     onClick={() => navigate(`/public-profile-update/${publicProfile.id}`)}
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
//                       <PhotoCard photo={photo} theme={theme} />
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
//                       <FriendCard friend={friend} theme={theme} />
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
//                 <PostCard 
//                   key={post.id} 
//                   post={post} 
//                   profileImage={profileImage}
//                   theme={theme}
//                 />
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


// ! original
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

// // Reusable components
// const StatBox = ({ icon, count, label, theme }) => (
//   <Box sx={{ 
//     display: 'flex', 
//     flexDirection: 'column',
//     alignItems: 'center',
//     justifyContent: 'center',
//     p: 1.5,
//     borderRadius: 2,
//     backgroundColor: 'rgba(255,255,255,0.1)',
//     minWidth: 80,
//     backdropFilter: 'blur(5px)',
//     boxShadow: theme.shadows[1],
//     transition: 'transform 0.2s',
//     '&:hover': {
//       transform: 'translateY(-3px)'
//     }
//   }}>
//     <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
//       {icon}
//       <Typography variant="h6" fontWeight="bold" sx={{ ml: 0.5 }}>{count}</Typography>
//     </Box>
//     <Typography variant="caption" color="text.secondary">{label}</Typography>
//   </Box>
// );

// const InfoItem = ({ icon, label, value, isLink = false }) => (
//   <Box sx={{ display: 'flex', mb: 2 }}>
//     <Box sx={{ mr: 2, color: 'text.secondary' }}>{icon}</Box>
//     <Box>
//       <Typography variant="subtitle2" color="text.secondary">{label}</Typography>
//       {isLink ? (
//         <Link href={value.startsWith('http') ? value : `https://${value}`} target="_blank" rel="noopener">
//           {value}
//         </Link>
//       ) : (
//         <Typography variant="body1">{value}</Typography>
//       )}
//     </Box>
//   </Box>
// );

// const PostCard = ({ post, profileImage, theme }) => (
//   <Card sx={{ mb: 3, borderRadius: 3, boxShadow: theme.shadows[2] }}>
//     <CardHeader
//       avatar={<Avatar src={profileImage} />}
//       title={<Typography fontWeight="600">{post.author}</Typography>}
//       subheader={post.date}
//       action={
//         <IconButton>
//           <MoreVert />
//         </IconButton>
//       }
//     />
//     <CardContent sx={{ pt: 0 }}>
//       <Typography paragraph>{post.content}</Typography>
//       {post.image && (
//         <Box sx={{ 
//           borderRadius: 2, 
//           overflow: 'hidden', 
//           mb: 2,
//           boxShadow: theme.shadows[1]
//         }}>
//           <img 
//             src={post.image} 
//             alt="Post" 
//             style={{ 
//               width: '100%', 
//               maxHeight: 400, 
//               objectFit: 'cover' 
//             }} 
//           />
//         </Box>
//       )}
//       <Box sx={{ display: 'flex', justifyContent: 'space-between', color: 'text.secondary' }}>
//         <Typography variant="body2">
//           {post.likes} likes • {post.comments} comments • {post.shares} shares
//         </Typography>
//       </Box>
//       <Divider sx={{ my: 1.5 }} />
//       <Box sx={{ display: 'flex', justifyContent: 'space-around' }}>
//         <Button startIcon={<ThumbUp />} sx={{ color: 'text.secondary' }}>Like</Button>
//         <Button startIcon={<Comment />} sx={{ color: 'text.secondary' }}>Comment</Button>
//         <Button startIcon={<Share />} sx={{ color: 'text.secondary' }}>Share</Button>
//       </Box>
//     </CardContent>
//   </Card>
// );

// const PhotoCard = ({ photo, theme }) => (
//   <Card sx={{ borderRadius: 2, overflow: 'hidden', boxShadow: theme.shadows[2] }}>
//     <Box sx={{ position: 'relative', paddingTop: '100%' }}>
//       <img 
//         src={photo.url} 
//         alt={photo.caption} 
//         style={{ 
//           position: 'absolute', 
//           top: 0, 
//           left: 0, 
//           width: '100%', 
//           height: '100%', 
//           objectFit: 'cover' 
//         }} 
//       />
//     </Box>
//     <Box sx={{ p: 1.5 }}>
//       <Typography variant="subtitle2">{photo.caption}</Typography>
//       <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
//         <ThumbUp fontSize="small" color="action" />
//         <Typography variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>
//           {photo.likes}
//         </Typography>
//       </Box>
//     </Box>
//   </Card>
// );

// const FriendCard = ({ friend, theme }) => (
//   <Card sx={{ borderRadius: 2, overflow: 'hidden', boxShadow: theme.shadows[2] }}>
//     <Box sx={{ position: 'relative', paddingTop: '75%' }}>
//       <img 
//         src={friend.avatar} 
//         alt={friend.name} 
//         style={{ 
//           position: 'absolute', 
//           top: 0, 
//           left: 0, 
//           width: '100%', 
//           height: '100%', 
//           objectFit: 'cover' 
//         }} 
//       />
//     </Box>
//     <Box sx={{ p: 1.5 }}>
//       <Typography fontWeight="600">{friend.name}</Typography>
//       {friend.mutual > 0 && (
//         <Typography variant="caption" color="text.secondary">
//           {friend.mutual} mutual friend{friend.mutual !== 1 ? 's' : ''}
//         </Typography>
//       )}
//       <Button 
//         variant="contained" 
//         size="small" 
//         fullWidth 
//         sx={{ mt: 1 }}
//       >
//         {friend.mutual > 0 ? 'Add Friend' : 'Follow'}
//       </Button>
//     </Box>
//   </Card>
// );

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

//   // Add this safety check to prevent rare edge cases
//   useEffect(() => {
//     if (!id || id === 'undefined') {
//       navigate(user?.id ? `/profile/public/${user.id}` : '/');
//       return;
//     }
    
//     if (id === 'me' && user?.id) {
//       navigate(`/profile/public/${user.id}`, { replace: true });
//       return;
//     }

//     // Only fetch if ID is a positive number
//     if (/^\d+$/.test(id)) {
//       dispatch(fetchPublicProfile(id));
//     } else {
//       navigate('/error/invalid-profile');
//     }
//   }, [id, user?.id, dispatch, navigate]);

//   useEffect(() => {
//     if (error && error.status === 400 && error.message.includes('Invalid user ID')) {
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
//       author: `${publicProfile.firstName} ${publicProfile.lastName}`,
//       content: "Just visited the new art museum!", 
//       date: "2 hours ago", 
//       likes: 24, 
//       comments: 5,
//       shares: 2,
//       image: '/post1.jpg'
//     },
//     { 
//       id: 2, 
//       author: `${publicProfile.firstName} ${publicProfile.lastName}`,
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
//                     theme={theme}
//                   />
//                   <StatBox 
//                     icon={<PostIcon fontSize="small" />} 
//                     count={posts.length} 
//                     label="Posts" 
//                     theme={theme}
//                   />
//                   <StatBox 
//                     icon={<PhotoLibraryIcon fontSize="small" />} 
//                     count={photos.length} 
//                     label="Photos" 
//                     theme={theme}
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
//                       <PhotoCard photo={photo} theme={theme} />
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
//                       <FriendCard friend={friend} theme={theme} />
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
//                 <PostCard 
//                   key={post.id} 
//                   post={post} 
//                   profileImage={profileImage}
//                   theme={theme}
//                 />
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














































