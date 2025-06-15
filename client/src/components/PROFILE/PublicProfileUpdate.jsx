import {
  Person,
  Home,
  Link as LinkIcon,
  PhotoCamera,
  Wallpaper
} from '@mui/icons-material';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  TextField,
  Typography,
  IconButton
} from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { showSnackbar } from '../../features/snackbar/snackbarSlice';
import { fetchUserProfile, updatePublicProfile } from '../../features/user/userSlice';
import theme from '../../theme';

const PublicProfileUpdate = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { profile, loading } = useSelector((state) => state.user);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    bio: '',
    website: '',
    location: '',
    profileImage: null,
    coverImage: null
  });

  const [profilePreview, setProfilePreview] = useState('');
  const [coverPreview, setCoverPreview] = useState('');

  useEffect(() => {
    if (profile?.user) {
      setFormData({
        firstName: profile.user.firstName || '',
        lastName: profile.user.lastName || '',
        bio: profile.user.bio || '',
        website: profile.user.website || '',
        location: profile.user.location || '',
      });
      setProfilePreview(profile.user.profileImage || '');
      setCoverPreview(profile.user.coverImage || '');
    }
  }, [profile]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleProfileImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setProfilePreview(reader.result);
        setFormData(prev => ({
          ...prev,
          profileImage: file
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCoverImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setCoverPreview(reader.result);
        setFormData(prev => ({
          ...prev,
          coverImage: file
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const data = new FormData();
    data.append('firstName', formData.firstName);
    data.append('lastName', formData.lastName);
    data.append('bio', formData.bio);
    data.append('website', formData.website);
    data.append('location', formData.location);
    if (formData.profileImage) {
      data.append('profileImage', formData.profileImage);
    }
    if (formData.coverImage) {
      data.append('coverImage', formData.coverImage);
    }

    try {
      const result = await dispatch(updatePublicProfile(data)).unwrap();
      
      dispatch(showSnackbar({
        message: result.message || 'Public profile updated successfully',
        severity: 'success'
      }));
      
      await dispatch(fetchUserProfile());
      navigate('/profile');
    } catch (error) {
      dispatch(showSnackbar({
        message: error.message || 'Failed to update public profile',
        severity: 'error'
      }));
    }
  };

  if (loading || !profile) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ p: 0, backgroundColor: 'background.default', minHeight: '100vh' }}>
        {/* Cover Photo Section */}
        <Box sx={{ 
          height: 200, 
          position: 'relative',
          backgroundImage: coverPreview ? `url(${coverPreview})` : 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          mb: 10
        }}>
          <IconButton 
            component="label"
            sx={{ 
              position: 'absolute', 
              bottom: 16, 
              right: 16,
              bgcolor: 'background.paper',
              '&:hover': { bgcolor: 'background.default' }
            }}
          >
            <input hidden accept="image/*" type="file" onChange={handleCoverImageChange} />
            <Wallpaper sx={{ color: 'text.primary' }} />
          </IconButton>
        </Box>

        <Card sx={{ maxWidth: 800, mx: 'auto', p: 3, borderRadius: 3, mt: -8 }}>
          {/* Profile Image */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2, mt: -12 }}>
            <Avatar
              src={profilePreview}
              sx={{ 
                width: 120, 
                height: 120, 
                border: '4px solid',
                borderColor: 'background.paper',
                position: 'relative'
              }}
            >
              <IconButton 
                component="label"
                sx={{ 
                  position: 'absolute', 
                  bottom: 0, 
                  right: 0,
                  bgcolor: 'primary.main',
                  '&:hover': { bgcolor: 'primary.dark' }
                }}
              >
                <input hidden accept="image/*" type="file" onChange={handleProfileImageChange} />
                <PhotoCamera sx={{ color: 'white' }} />
              </IconButton>
            </Avatar>
          </Box>

          <Typography variant="h4" gutterBottom sx={{ mb: 3, textAlign: 'center' }}>
            Update Public Profile
          </Typography>
          
          <CardContent>
            <form onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="First Name"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    InputProps={{
                      startAdornment: <Person sx={{ mr: 1, color: 'action.active' }} />
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Last Name"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    InputProps={{
                      startAdornment: <Person sx={{ mr: 1, color: 'action.active' }} />
                    }}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    multiline
                    rows={4}
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Website"
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    InputProps={{
                      startAdornment: <LinkIcon sx={{ mr: 1, color: 'action.active' }} />
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Location"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    InputProps={{
                      startAdornment: <Home sx={{ mr: 1, color: 'action.active' }} />
                    }}
                  />
                </Grid>
              </Grid>

              <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
                <Button 
                  variant="outlined" 
                  onClick={() => navigate('/profile')}
                  sx={{ width: '48%' }}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  variant="contained" 
                  sx={{ width: '48%' }}
                >
                  Save Changes
                </Button>
              </Box>
            </form>
          </CardContent>
        </Card>
      </Box>
    </ThemeProvider>
  );
};

export default PublicProfileUpdate;