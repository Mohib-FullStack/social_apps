import {
  Bookmark,
  Cake,
  Email,
  Event,
  Groups,
  Link as LinkIcon,
  LocationOn,
  MoreVert,
  Phone,
  PhotoLibrary,
  VideoLibrary
} from '@mui/icons-material';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Divider,
  Grid,
  IconButton,
  Link,
  Paper,
  Tab,
  Tabs,
  Typography
} from '@mui/material';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { fetchPublicProfile } from '../../features/user/userSlice';
// import FriendButton from './FriendButton';

const PublicProfilePage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { publicProfile, status } = useSelector((state) => state.user);
  const { user } = useSelector((state) => state.user);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    if (id) {
      dispatch(fetchPublicProfile(id));
    }
  }, [id, dispatch]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  if (status === 'loading') return <div>Loading...</div>;
  if (!publicProfile) return <div>Profile not found</div>;

  const isOwnProfile = user?.id === publicProfile.id;
  const formattedDate = publicProfile.birthDate 
    ? new Date(publicProfile.birthDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : null;

  // Mock data for demonstration
  const posts = [
    { id: 1, content: "Just visited the new art museum!", date: "2 hours ago" },
    { id: 2, content: "Working on a new project", date: "1 day ago" }
  ];

  const photos = [
    { id: 1, url: "/photo1.jpg", caption: "Vacation" },
    { id: 2, url: "/photo2.jpg", caption: "Friends" }
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 2, mb: 4 }}>
      {/* Cover Photo with Profile Avatar */}
      <Card sx={{ mb: 3, borderRadius: 3, overflow: 'hidden', position: 'relative' }}>
        <Box
          sx={{
            height: { xs: 200, md: 300 },
            backgroundImage: `url(${publicProfile.coverImage || '/default-cover.jpg'})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundColor: 'grey.200'
          }}
        />
        
        <Avatar
          src={publicProfile.profileImage}
          sx={{
            width: { xs: 100, md: 150 },
            height: { xs: 100, md: 150 },
            border: '4px solid',
            borderColor: 'background.paper',
            position: 'absolute',
            bottom: { xs: -50, md: -75 },
            left: { xs: 20, md: 40 },
            boxShadow: 3
          }}
        />
      </Card>

      {/* Profile Header with Action Buttons */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-end',
        mb: 3,
        ml: { xs: 0, md: 18 },
        pl: { xs: 14, md: 0 },
        position: 'relative'
      }}>
        <Box>
          <Typography variant="h4" component="h1">
            {publicProfile.firstName} {publicProfile.lastName}
          </Typography>
          {publicProfile.headline && (
            <Typography variant="subtitle1" color="text.secondary">
              {publicProfile.headline}
            </Typography>
          )}
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          {!isOwnProfile && (
            <>
              <Button variant="contained" color="primary">
                {/* <FriendButton profileId={publicProfile.id} isFriend={publicProfile.isFriend} /> */}
                {publicProfile.isFriend ? "Friends" : "Add Friend"}
              </Button>
              <Button variant="outlined">Message</Button>
            </>
          )}
          {isOwnProfile && (
            <Button variant="contained" color="primary">
              Edit Profile
            </Button>
          )}
          <IconButton>
            <MoreVert />
          </IconButton>
        </Box>
      </Box>

      {/* Main Content with Tabs */}
      <Grid container spacing={3}>
        {/* Left Column - About Section */}
        <Grid item xs={12} md={4}>
          <Card sx={{ mb: 3, borderRadius: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                About
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              {publicProfile.bio && (
                <Typography paragraph sx={{ mb: 3 }}>
                  {publicProfile.bio}
                </Typography>
              )}
              
              <Box sx={{ '& > div': { mb: 2 } }}>
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
                
                {publicProfile.email && (
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Email color="action" sx={{ mr: 1 }} />
                    <Typography>{publicProfile.email}</Typography>
                  </Box>
                )}
                
                {publicProfile.phone && (
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Phone color="action" sx={{ mr: 1 }} />
                    <Typography>{publicProfile.phone}</Typography>
                  </Box>
                )}
                
                {formattedDate && (
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Cake color="action" sx={{ mr: 1 }} />
                    <Typography>Born {formattedDate}</Typography>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>

          {/* Education Section */}
          {publicProfile.education?.length > 0 && (
            <Card sx={{ mb: 3, borderRadius: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  Education
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                {publicProfile.education.map((edu, index) => (
                  <Box key={index} sx={{ mb: 2 }}>
                    <Typography fontWeight="500">{edu.school}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {edu.degree} {edu.fieldOfStudy && `in ${edu.fieldOfStudy}`}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {edu.startYear} - {edu.endYear || 'Present'}
                    </Typography>
                  </Box>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Work Experience Section */}
          {publicProfile.workExperience?.length > 0 && (
            <Card sx={{ borderRadius: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  Work Experience
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                {publicProfile.workExperience.map((work, index) => (
                  <Box key={index} sx={{ mb: 2 }}>
                    <Typography fontWeight="500">{work.position}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {work.company}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {work.startDate} - {work.endDate || 'Present'}
                    </Typography>
                    {work.description && (
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        {work.description}
                      </Typography>
                    )}
                  </Box>
                ))}
              </CardContent>
            </Card>
          )}
        </Grid>

        {/* Right Column - Main Content */}
        <Grid item xs={12} md={8}>
          <Card sx={{ mb: 3, borderRadius: 3 }}>
            <Tabs 
              value={tabValue} 
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
              sx={{ borderBottom: 1, borderColor: 'divider' }}
            >
              <Tab label="Posts" icon={<Event />} iconPosition="start" />
              <Tab label="Photos" icon={<PhotoLibrary />} iconPosition="start" />
              <Tab label="Videos" icon={<VideoLibrary />} iconPosition="start" />
              <Tab label="Friends" icon={<Groups />} iconPosition="start" />
              <Tab label="Saved" icon={<Bookmark />} iconPosition="start" />
            </Tabs>

            <CardContent>
              {/* Posts Tab */}
              {tabValue === 0 && (
                <Box>
                  {isOwnProfile && (
                    <Paper sx={{ p: 2, mb: 3, borderRadius: 2 }}>
                      <Typography variant="subtitle1" gutterBottom>
                        Create a post
                      </Typography>
                      <Button variant="outlined" fullWidth>
                        What's on your mind?
                      </Button>
                    </Paper>
                  )}
                  
                  {posts.length > 0 ? (
                    posts.map(post => (
                      <Paper key={post.id} sx={{ p: 2, mb: 2, borderRadius: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Avatar src={publicProfile.profileImage} sx={{ mr: 1 }} />
                          <Box>
                            <Typography fontWeight="500">
                              {publicProfile.firstName} {publicProfile.lastName}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {post.date}
                            </Typography>
                          </Box>
                        </Box>
                        <Typography paragraph sx={{ mt: 1 }}>
                          {post.content}
                        </Typography>
                      </Paper>
                    ))
                  ) : (
                    <Typography align="center" color="text.secondary" sx={{ py: 4 }}>
                      No posts to display
                    </Typography>
                  )}
                </Box>
              )}

              {/* Photos Tab */}
              {tabValue === 1 && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Photos
                  </Typography>
                  {photos.length > 0 ? (
                    <Grid container spacing={2}>
                      {photos.map(photo => (
                        <Grid item xs={6} sm={4} key={photo.id}>
                          <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
                            <img 
                              src={photo.url} 
                              alt={photo.caption} 
                              style={{ width: '100%', height: 150, objectFit: 'cover' }}
                            />
                            {photo.caption && (
                              <Box sx={{ p: 1 }}>
                                <Typography variant="body2">{photo.caption}</Typography>
                              </Box>
                            )}
                          </Paper>
                        </Grid>
                      ))}
                    </Grid>
                  ) : (
                    <Typography align="center" color="text.secondary" sx={{ py: 4 }}>
                      No photos to display
                    </Typography>
                  )}
                </Box>
              )}

              {/* Other tabs would go here */}
              {tabValue !== 0 && tabValue !== 1 && (
                <Typography align="center" color="text.secondary" sx={{ py: 4 }}>
                  Content coming soon
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default PublicProfilePage;







//! old
// import {
//     Avatar,
//     Box,
//     Card,
//     CardContent,
//     Container,
//     Divider,
//     Grid,
//     Typography
// } from '@mui/material';
// import { useEffect } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { useParams } from 'react-router-dom';
// import { fetchPublicProfile } from '../../features/user/userSlice';
// // import FriendButton from './FriendButton';

// const PublicProfilePage = () => {
//   const { id } = useParams();
//   const dispatch = useDispatch();
//   const { publicProfile, status } = useSelector((state) => state.user);
//   const { user } = useSelector((state) => state.user);

//   useEffect(() => {
//     if (id) {
//       dispatch(fetchPublicProfile(id));
//     }
//   }, [id, dispatch]);

//   if (status === 'loading') return <div>Loading...</div>;
//   if (!publicProfile) return <div>Profile not found</div>;

//   const isOwnProfile = user?.id === publicProfile.id;

//   return (
//     <Container maxWidth="md" sx={{ mt: 4 }}>
//       {/* Cover Photo */}
//       <Card sx={{ mb: 3, borderRadius: 3 }}>
//         <Box
//           sx={{
//             height: 300,
//             backgroundImage: `url(${publicProfile.coverImage || '/default-cover.jpg'})`,
//             backgroundSize: 'cover',
//             backgroundPosition: 'center'
//           }}
//         />
//       </Card>

//       {/* Profile Header */}
//       <Card sx={{ mb: 3, borderRadius: 3 }}>
//         <CardContent sx={{ position: 'relative' }}>
//           <Avatar
//             src={publicProfile.profileImage}
//             sx={{
//               width: 150,
//               height: 150,
//               border: '4px solid white',
//               position: 'absolute',
//               top: -75,
//               left: 20
//             }}
//           />
          
//           <Box sx={{ ml: 18, mt: 4 }}>
//             <Typography variant="h4">
//               {publicProfile.firstName} {publicProfile.lastName}
//             </Typography>
            
//             {!isOwnProfile && (
//               <Box sx={{ mt: 2 }}>
//                 <FriendButton profileId={publicProfile.id} isFriend={publicProfile.isFriend} />
//               </Box>
//             )}
//           </Box>
//         </CardContent>
//       </Card>

//       {/* Profile Details */}
//       <Grid container spacing={3}>
//         <Grid item xs={12} md={8}>
//           <Card sx={{ mb: 3, borderRadius: 3 }}>
//             <CardContent>
//               <Typography variant="h6" gutterBottom>About</Typography>
//               <Divider sx={{ mb: 2 }} />
              
//               {publicProfile.bio && (
//                 <Typography paragraph>{publicProfile.bio}</Typography>
//               )}
              
//               <Grid container spacing={2}>
//                 {publicProfile.email && (
//                   <Grid item xs={12} sm={6}>
//                     <Typography variant="subtitle2">Email</Typography>
//                     <Typography>{publicProfile.email}</Typography>
//                   </Grid>
//                 )}
                
//                 {publicProfile.birthDate && (
//                   <Grid item xs={12} sm={6}>
//                     <Typography variant="subtitle2">Birth Date</Typography>
//                     <Typography>
//                       {new Date(publicProfile.birthDate).toLocaleDateString()}
//                     </Typography>
//                   </Grid>
//                 )}
//               </Grid>
//             </CardContent>
//           </Card>
//         </Grid>
        
//         <Grid item xs={12} md={4}>
//           <Card sx={{ borderRadius: 3 }}>
//             <CardContent>
//               <Typography variant="h6" gutterBottom>Details</Typography>
//               <Divider sx={{ mb: 2 }} />
              
//               {publicProfile.website && (
//                 <Box sx={{ mb: 2 }}>
//                   <Typography variant="subtitle2">Website</Typography>
//                   <Typography>
//                     <a href={publicProfile.website} target="_blank" rel="noopener noreferrer">
//                       {publicProfile.website}
//                     </a>
//                   </Typography>
//                 </Box>
//               )}
//             </CardContent>
//           </Card>
//         </Grid>
//       </Grid>
//     </Container>
//   );
// };

// export default PublicProfilePage;