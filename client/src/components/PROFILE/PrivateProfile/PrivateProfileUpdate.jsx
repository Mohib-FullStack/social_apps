import {
  Cake,
  CheckBox,
  CheckBoxOutlineBlank,
  Phone,
  PhotoCamera,
  Transgender,
} from '@mui/icons-material';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  CircularProgress,
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { showSnackbar } from '../../../features/snackbar/snackbarSlice';
import {
  fetchUserProfile,
  updatePrivateProfile,
} from '../../../features/user/userSlice';
import theme from '../../../theme';

const PrivateProfileUpdate = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { profile, loading, status } = useSelector((state) => state.user);
  const muiTheme = useTheme();

  const [formData, setFormData] = useState({
    phone: '',
    birthDate: '',
    gender: '',
    profileImage: null,
    phoneVisibility: false,
    genderVisibility: false,
  });

  const [imagePreview, setImagePreview] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const userData = profile?.user || profile;
    if (userData) {
      setFormData({
        phone: userData.phone || '',
        birthDate: userData.birthDate
          ? new Date(userData.birthDate).toISOString().split('T')[0]
          : '',
        gender: userData.gender || '',
        profileImage: null,
        phoneVisibility: userData.phoneVisibility || false,
        genderVisibility: userData.genderVisibility || false,
      });
      setImagePreview(userData.profileImage || '');
    }
  }, [profile]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleCheckboxChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.checked,
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.match('image.*')) {
        dispatch(
          showSnackbar({
            message: 'Only image files are allowed',
            severity: 'error',
          })
        );
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        dispatch(
          showSnackbar({
            message: 'Image size must be less than 5MB',
            severity: 'error',
          })
        );
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result);
        setFormData((prev) => ({
          ...prev,
          profileImage: file,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsUploading(true);

    const data = new FormData();
    data.append('phone', formData.phone);
    data.append('birthDate', formData.birthDate);
    data.append('gender', formData.gender);
    data.append('phoneVisibility', formData.phoneVisibility);
    data.append('genderVisibility', formData.genderVisibility);

    if (formData.profileImage) {
      data.append('profileImage', formData.profileImage);
    }

    try {
      const result = await dispatch(updatePrivateProfile(data)).unwrap();
      dispatch(
        showSnackbar({
          message: result.message || 'Private profile updated successfully',
          severity: 'success',
        })
      );
      await dispatch(fetchUserProfile());
      navigate('/profile/me');
    } catch (error) {
      dispatch(
        showSnackbar({
          message: error.message || 'Failed to update private profile',
          severity: 'error',
        })
      );
    } finally {
      setIsUploading(false);
    }
  };

  if (loading || !profile) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          p: { xs: 2, md: 4 },
          backgroundColor: 'background.default',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Card
          sx={{
            maxWidth: 600,
            width: '100%',
            mx: 'auto',
            p: { xs: 2, sm: 3 },
            borderRadius: 4,
            boxShadow: muiTheme.shadows[4],
            transition: 'all 0.3s ease',
            '&:hover': {
              boxShadow: muiTheme.shadows[8],
            },
          }}
        >
          <Typography
            variant="h5"
            gutterBottom
            sx={{
              mb: 3,
              textAlign: 'center',
              fontWeight: 600,
              color: 'primary.main',
            }}
          >
            Update Private Information
          </Typography>

          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              mb: 3,
              position: 'relative',
            }}
          >
            <Avatar
              src={imagePreview}
              sx={{
                width: 100,
                height: 100,
                border: '3px solid',
                borderColor: 'primary.main',
                boxShadow: muiTheme.shadows[4],
              }}
            />
            <IconButton
              component="label"
              sx={{
                position: 'absolute',
                bottom: 0,
                right: 'calc(50% - 70px)',
                bgcolor: 'primary.main',
                '&:hover': {
                  bgcolor: 'primary.dark',
                  transform: 'scale(1.1)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              <input
                hidden
                accept="image/*"
                type="file"
                onChange={handleImageChange}
                disabled={isUploading}
              />
              <PhotoCamera sx={{ color: 'white' }} />
            </IconButton>
          </Box>

          <CardContent sx={{ p: { xs: 0, sm: 2 } }}>
            <form onSubmit={handleSubmit}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                    }}
                  >
                    <Phone
                      sx={{
                        color: 'secondary.main',
                        flexShrink: 0,
                        fontSize: '1.5rem',
                      }}
                    />
                    <TextField
                      fullWidth
                      label="Phone Number"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      variant="outlined"
                      size="small"
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          name="phoneVisibility"
                          checked={formData.phoneVisibility}
                          onChange={handleCheckboxChange}
                          icon={<CheckBoxOutlineBlank />}
                          checkedIcon={<CheckBox />}
                          color="primary"
                        />
                      }
                      label="Visible"
                      sx={{ ml: 1 }}
                    />
                  </Box>
                </Grid>

                <Grid item xs={12}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                    }}
                  >
                    <Transgender
                      sx={{
                        color: 'success.main',
                        flexShrink: 0,
                        fontSize: '1.5rem',
                      }}
                    />
                    <FormControl fullWidth size="small">
                      <InputLabel>Gender</InputLabel>
                      <Select
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                        label="Gender"
                      >
                        <MenuItem value="male">Male</MenuItem>
                        <MenuItem value="female">Female</MenuItem>
                        <MenuItem value="other">Other</MenuItem>
                      </Select>
                    </FormControl>
                    <FormControlLabel
                      control={
                        <Checkbox
                          name="genderVisibility"
                          checked={formData.genderVisibility}
                          onChange={handleCheckboxChange}
                          icon={<CheckBoxOutlineBlank />}
                          checkedIcon={<CheckBox />}
                          color="primary"
                        />
                      }
                      label="Visible"
                      sx={{ ml: 1 }}
                    />
                  </Box>
                </Grid>

                <Grid item xs={12}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                    }}
                  >
                    <Cake
                      sx={{
                        color: 'warning.main',
                        flexShrink: 0,
                        fontSize: '1.5rem',
                      }}
                    />
                    <TextField
                      fullWidth
                      label="Birth Date"
                      name="birthDate"
                      type="date"
                      value={formData.birthDate}
                      onChange={handleChange}
                      InputLabelProps={{ shrink: true }}
                      variant="outlined"
                      size="small"
                    />
                  </Box>
                </Grid>
              </Grid>

              <Box
                sx={{
                  mt: 4,
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: 2,
                }}
              >
                <Button
                  variant="outlined"
                  onClick={() => navigate('/profile/me')}
                  sx={{
                    flex: 1,
                    py: 1,
                    borderRadius: 2,
                    textTransform: 'none',
                    color: 'text.primary',
                    borderColor: 'grey.400',
                    '&:hover': {
                      backgroundColor: 'error.light',
                      color: 'error.contrastText',
                      borderColor: 'error.main',
                    },
                  }}
                  disabled={isUploading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  sx={{
                    flex: 1,
                    py: 1,
                    borderRadius: 2,
                    textTransform: 'none',
                    '&:hover': {
                      backgroundColor: 'primary.dark',
                    },
                  }}
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    'Save Changes'
                  )}
                </Button>
              </Box>
            </form>
          </CardContent>
        </Card>
      </Box>
    </ThemeProvider>
  );
};

export default PrivateProfileUpdate;















