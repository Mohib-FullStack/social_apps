import { useState, useMemo } from 'react';
import { 
  Card, 
  Divider, 
  Grid, 
  Tab, 
  Tabs, 
  Typography, 
  Box,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  Person,
  PhotoLibrary,
  PostAdd,
  Work,
  Lock,
  Email,
  Cake,
  Delete
} from '@mui/icons-material';
import ActionCard from './ActionCard';

const ProfileTabs = ({ 
  tabValue, 
  handleTabChange, 
  privacy, 
  privacyChanged, 
  handlePrivacyChange, 
  handleSavePrivacy, 
  handleDeleteAccount, 
  navigate, 
  userData 
}) => {
  const profileActions = useMemo(() => [
    { icon: <Person />, title: 'Update Profile', path: '/my-profile-update', color: 'primary' },
    { icon: <Lock />, title: 'Update Password', path: '/update-password', color: 'secondary' }
  ], []);

  const mediaActions = useMemo(() => [
    { icon: <PhotoLibrary />, title: 'Photo Library', path: '/photos', color: 'warning' },
    { icon: <PhotoLibrary />, title: 'Video Library', path: '/videos', color: 'error' },
    { icon: <PhotoLibrary />, title: 'Music Library', path: '/music', color: 'success' }
  ], []);

  const productivityTools = useMemo(() => [
    { icon: <PostAdd />, title: 'Calendar', path: '/calendar', color: 'info' },
    { icon: <PostAdd />, title: 'Notes', path: '/notes', color: 'info' },
    { icon: <PostAdd />, title: 'Posts', path: '/posts', color: 'info' }
  ], []);

  const professionalSection = useMemo(() => [
    { icon: <Work />, title: 'Work Experience', path: '/work', color: 'primary' },
    { icon: <Work />, title: 'Education', path: '/education', color: 'primary' },
    { icon: <Work />, title: 'Groups', path: '/groups', color: 'primary' },
    { icon: <Work />, title: 'Portfolio Links', path: '/links', color: 'primary' }
  ], []);

  const formatDate = (date) => {
    try {
      return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return 'Unknown date';
    }
  };

  return (
    <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
      <Tabs 
        value={tabValue} 
        onChange={handleTabChange} 
        variant="scrollable"
        scrollButtons="auto"
        sx={{ 
          borderBottom: 1, 
          borderColor: 'divider',
          '& .MuiTab-root': { 
            minWidth: 120,
            py: 1.5,
            textTransform: 'none',
            fontWeight: 500
          }
        }}
      >
        <Tab label="Profile" icon={<Person />} iconPosition="start" />
        <Tab label="Media" icon={<PhotoLibrary />} iconPosition="start" />
        <Tab label="Tools" icon={<PostAdd />} iconPosition="start" />
        <Tab label="Professional" icon={<Work />} iconPosition="start" />
        <Tab label="Privacy" icon={<Lock />} iconPosition="start" />
      </Tabs>

      <Box sx={{ p: 3 }}>
        {/* Profile Tab */}
        {tabValue === 0 && (
          <Grid container spacing={3}>
            {profileActions.map((action, index) => (
              <Grid item xs={12} sm={6} key={index}>
                <ActionCard {...action} navigate={navigate} />
              </Grid>
            ))}
            
            <Grid item xs={12}>
              <Card sx={{ borderRadius: 2, p: 3 }}>
                <Typography variant="h6" gutterBottom>Personal Information</Typography>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Email color="action" sx={{ mr: 1.5 }} />
                      <Box>
                        <Typography variant="caption" color="text.secondary">Email</Typography>
                        <Typography>{userData.email}</Typography>
                      </Box>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Cake color="action" sx={{ mr: 1.5 }} />
                      <Box>
                        <Typography variant="caption" color="text.secondary">Member Since</Typography>
                        <Typography>{formatDate(userData.createdAt)}</Typography>
                      </Box>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Person color="action" sx={{ mr: 1.5 }} />
                      <Box>
                        <Typography variant="caption" color="text.secondary">Last Updated</Typography>
                        <Typography>{formatDate(userData.updatedAt)}</Typography>
                      </Box>
                    </Box>
                  </Grid>
                </Grid>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Media Tab */}
        {tabValue === 1 && (
          <Grid container spacing={2}>
            {mediaActions.map((action, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <ActionCard {...action} navigate={navigate} />
              </Grid>
            ))}
          </Grid>
        )}

        {/* Tools Tab */}
        {tabValue === 2 && (
          <Grid container spacing={2}>
            {productivityTools.map((action, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <ActionCard {...action} navigate={navigate} />
              </Grid>
            ))}
          </Grid>
        )}

        {/* Professional Tab */}
        {tabValue === 3 && (
          <Grid container spacing={2}>
            {professionalSection.map((action, index) => (
              <Grid item xs={12} sm={6} key={index}>
                <ActionCard {...action} navigate={navigate} />
              </Grid>
            ))}
          </Grid>
        )}

        {/* Privacy Tab */}
        {tabValue === 4 && (
          <Box>
            <Typography variant="h6" gutterBottom>Privacy Settings</Typography>
            <Divider sx={{ mb: 3 }} />
            
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Profile Visibility</InputLabel>
                  <Select
                    value={privacy.profileVisibility}
                    onChange={(e) => handlePrivacyChange('profileVisibility', e.target.value)}
                    label="Profile Visibility"
                  >
                    <MenuItem value="public">Public</MenuItem>
                    <MenuItem value="friends">Friends Only</MenuItem>
                    <MenuItem value="private">Private</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Email Visibility</InputLabel>
                  <Select
                    value={privacy.emailVisibility}
                    onChange={(e) => handlePrivacyChange('emailVisibility', e.target.value)}
                    label="Email Visibility"
                  >
                    <MenuItem value="public">Public</MenuItem>
                    <MenuItem value="friends">Friends Only</MenuItem>
                    <MenuItem value="private">Private</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Phone Visibility</InputLabel>
                  <Select
                    value={privacy.phoneVisibility}
                    onChange={(e) => handlePrivacyChange('phoneVisibility', e.target.value)}
                    label="Phone Visibility"
                  >
                    <MenuItem value="friends">Friends Only</MenuItem>
                    <MenuItem value="private">Private</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleSavePrivacy}
                disabled={!privacyChanged}
              >
                Save Changes
              </Button>
              
              <Button
                variant="outlined"
                color="error"
                onClick={handleDeleteAccount}
                startIcon={<Delete />}
              >
                Delete Account
              </Button>
            </Box>
          </Box>
        )}
      </Box>
    </Card>
  );
};

export default ProfileTabs;