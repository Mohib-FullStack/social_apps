import {
  ArrowBack as ArrowBackIcon,
  Favorite as FavoriteIcon,
  Lock as LockIcon,
  Payment as PaymentIcon,
  Person as PersonIcon,
  ShoppingCart as ShoppingCartIcon,
} from '@mui/icons-material';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Fade,
  Grid,
  Paper,
  Typography,
} from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import theme from '../../theme'; // import your custom theme

const Profile = () => {
  const { profile } = useSelector((state) => state.user);
  const navigate = useNavigate();

  if (!profile) {
    return <div>Loading...</div>;
  }

  // Custom function to format dates
  const formatDate = (date) => new Date(date).toLocaleString();

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          padding: 4,
          backgroundColor: 'background.default',
          minHeight: '100vh',
        }}
      >
        {/* Back to Chat Button */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 2 }}>
          <Button
            variant="contained" // Changed to contained for more impact
            color="primary" // Set the button color to primary
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/chat')}
            sx={{
              marginTop: 6,
              borderRadius: '8px',
              transition: '0.3s',
              '&:hover': {
                backgroundColor: 'secondary.main', // Optional hover color change
                color: 'white',
              },
            }}
          >
            Back to Chat
          </Button>
        </Box>

        <Grid container spacing={3} maxWidth="lg" sx={{ marginTop: 4 }}>
          {/* Profile Card */}
          <Grid item xs={12} md={4}>
            <Fade in={true} timeout={1000}>
              <Card
                sx={{
                  backgroundColor: 'background.paper',
                  borderRadius: '20px',
                  boxShadow: 3,
                  padding: 3,
                  textAlign: 'center',
                }}
              >
                <Avatar
                  src={profile.user.image}
                  alt={`${profile.user.firstName} ${profile.user.lastName}`}
                  sx={{
                    width: 150,
                    height: 150,
                    margin: 'auto',
                    border: '4px solid',
                    borderColor: 'secondary.main',
                    mb: 2,
                  }}
                />
                <Typography variant="h4" component="div" color="secondary.main">
                  {profile.user.firstName} {profile.user.lastName}
                </Typography>
                <Typography color="text.secondary" variant="subtitle1">
                  ID: {profile.user.id}
                </Typography>

                <CardContent>
                  <Typography color="text.primary">
                    <strong>Email:</strong> {profile.user.email}
                  </Typography>
                  <Typography color="text.primary">
                    <strong>Phone:</strong> {profile.user.phone}
                  </Typography>
                  <Typography color="text.primary">
                    <strong>Address:</strong> {profile.user.address}
                  </Typography>
                  <Typography color="text.primary">
                    <strong>Created At:</strong>{' '}
                    {formatDate(profile.user.createdAt)}
                  </Typography>
                  <Typography color="text.primary">
                    <strong>Updated At:</strong>{' '}
                    {formatDate(profile.user.updatedAt)}
                  </Typography>
                </CardContent>
              </Card>
            </Fade>
          </Grid>

          {/* Actionable Cards */}
          <Grid item xs={12} md={8}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Fade in={true} timeout={1500}>
                  <Paper
                    elevation={3}
                    sx={{
                      padding: 2,
                      backgroundColor: 'background.paper',
                      borderRadius: '15px',
                      transition: 'transform 0.3s ease',
                      '&:hover': {
                        transform: 'scale(1.03)',
                        boxShadow: 6,
                      },
                    }}
                  >
                    <CardContent>
                      <Avatar sx={{ bgcolor: 'primary.main', mb: 2 }}>
                        <PersonIcon />
                      </Avatar>
                      <Typography variant="h6" gutterBottom>
                        Update Profile
                      </Typography>
                      <Button
                        variant="contained"
                        color="primary"
                        fullWidth
                        onClick={() => navigate('/update-user-profile')}
                      >
                        Update Profile
                      </Button>
                    </CardContent>
                  </Paper>
                </Fade>
              </Grid>

              <Grid item xs={12} md={6}>
                <Fade in={true} timeout={2000}>
                  <Paper
                    elevation={3}
                    sx={{
                      padding: 2,
                      backgroundColor: 'background.paper',
                      borderRadius: '15px',
                      transition: 'transform 0.3s ease',
                      '&:hover': {
                        transform: 'scale(1.03)',
                        boxShadow: 6,
                      },
                    }}
                  >
                    <CardContent>
                      <Avatar sx={{ bgcolor: 'secondary.main', mb: 2 }}>
                        <LockIcon />
                      </Avatar>
                      <Typography variant="h6" gutterBottom>
                        Update Password
                      </Typography>
                      <Button
                        variant="contained"
                        color="secondary"
                        fullWidth
                        onClick={() => navigate('/update-password')}
                      >
                        Change Password
                      </Button>
                    </CardContent>
                  </Paper>
                </Fade>
              </Grid>

              <Grid item xs={12} md={6}>
                <Fade in={true} timeout={2500}>
                  <Paper
                    elevation={3}
                    sx={{
                      padding: 2,
                      backgroundColor: 'background.paper',
                      borderRadius: '15px',
                      transition: 'transform 0.3s ease',
                      '&:hover': {
                        transform: 'scale(1.03)',
                        boxShadow: 6,
                      },
                    }}
                  >
                    <CardContent>
                      <Avatar sx={{ bgcolor: 'warning.main', mb: 2 }}>
                        <ShoppingCartIcon />
                      </Avatar>
                      <Typography variant="h6" gutterBottom>
                        Orders & History
                      </Typography>
                      <Button
                        variant="contained"
                        color="warning"
                        fullWidth
                        onClick={() => navigate('/order-history')}
                      >
                        View Order History
                      </Button>
                    </CardContent>
                  </Paper>
                </Fade>
              </Grid>

              <Grid item xs={12} md={6}>
                <Fade in={true} timeout={3000}>
                  <Paper
                    elevation={3}
                    sx={{
                      padding: 2,
                      backgroundColor: 'background.paper',
                      borderRadius: '15px',
                      transition: 'transform 0.3s ease',
                      '&:hover': {
                        transform: 'scale(1.03)',
                        boxShadow: 6,
                      },
                    }}
                  >
                    <CardContent>
                      <Avatar sx={{ bgcolor: 'info.main', mb: 2 }}>
                        <PaymentIcon />
                      </Avatar>
                      <Typography variant="h6" gutterBottom>
                        Payment Methods
                      </Typography>
                      <Button
                        variant="contained"
                        color="info"
                        fullWidth
                        onClick={() => navigate('/payment-methods')}
                      >
                        Manage Payments
                      </Button>
                    </CardContent>
                  </Paper>
                </Fade>
              </Grid>

              <Grid item xs={12} md={6}>
                <Fade in={true} timeout={3500}>
                  <Paper
                    elevation={3}
                    sx={{
                      padding: 2,
                      backgroundColor: 'background.paper',
                      borderRadius: '15px',
                      transition: 'transform 0.3s ease',
                      '&:hover': {
                        transform: 'scale(1.03)',
                        boxShadow: 6,
                      },
                    }}
                  >
                    <CardContent>
                      <Avatar sx={{ bgcolor: 'error.main', mb: 2 }}>
                        <FavoriteIcon />
                      </Avatar>
                      <Typography variant="h6" gutterBottom>
                        Wishlist
                      </Typography>
                      <Button
                        variant="contained"
                        color="error"
                        fullWidth
                        onClick={() => navigate('/wishlist')}
                      >
                        View Wishlist
                      </Button>
                    </CardContent>
                  </Paper>
                </Fade>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Box>
    </ThemeProvider>
  );
};

export default Profile;
