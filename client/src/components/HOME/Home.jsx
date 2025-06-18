import { Box, Button, Container, Grid, Paper, styled, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const FeatureCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  textAlign: 'center',
  borderRadius: '16px',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
  boxShadow: '0 8px 16px rgba(0, 85, 164, 0.1)',
  transition: 'transform 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-10px)',
  },
}));

const HomePage = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: '👥',
      title: 'Meaningful Connections',
      description: 'Build relationships that go beyond the surface with people who share your passions.',
    },
    {
      icon: '💬',
      title: 'Authentic Conversations',
      description: 'Engage in real discussions with privacy-focused messaging tools.',
    },
    {
      icon: '🌱',
      title: 'Grow Together',
      description: 'Discover communities that help you learn and develop new interests.',
    },
  ];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(to bottom, #FFFFFF 0%, #F8F9FA 100%)',
        paddingTop: 8,
        paddingBottom: 8,
      }}
    >
      <Container maxWidth="lg">
        {/* Hero Section */}
        <Grid container spacing={4} alignItems="center" sx={{ mb: 8 }}>
          <Grid item xs={12}>
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <Typography
                variant="h2"
                component="h1"
                gutterBottom
                sx={{
                  fontWeight: 700,
                  color: '#0055A4',
                  fontSize: { xs: '2.5rem', md: '3.5rem' },
                  textAlign: 'center',
                  maxWidth: '800px',
                  mx: 'auto',
                  lineHeight: 1.2,
                }}
              >
                Your space for <Box component="span" sx={{ color: '#EF3340' }}>authentic</Box> connections
              </Typography>
              <Typography
                variant="h5"
                component="p"
                gutterBottom
                sx={{
                  color: '#006A4E',
                  mb: 4,
                  fontSize: { xs: '1.1rem', md: '1.3rem' },
                  textAlign: 'center',
                  maxWidth: '600px',
                  mx: 'auto',
                }}
              >
                Where conversations matter and communities thrive. Join a network designed for real interactions.
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => navigate('/register')}
                  sx={{
                    backgroundColor: '#0055A4',
                    '&:hover': { backgroundColor: '#003D73' },
                    borderRadius: '8px',
                    px: 4,
                    py: 1.5,
                    fontSize: '1rem',
                    fontWeight: 600,
                  }}
                >
                  Join Now
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => navigate('/login')}
                  sx={{
                    color: '#0055A4',
                    borderColor: '#0055A4',
                    '&:hover': { borderColor: '#003D73' },
                    borderRadius: '8px',
                    px: 4,
                    py: 1.5,
                    fontSize: '1rem',
                    fontWeight: 600,
                  }}
                >
                  Sign In
                </Button>
              </Box>
            </motion.div>
          </Grid>
        </Grid>

        {/* Features Section */}
        <Typography
          variant="h3"
          component="h2"
          align="center"
          sx={{
            fontWeight: 600,
            color: '#0055A4',
            mb: 6,
            fontSize: { xs: '2rem', md: '2.5rem' },
          }}
        >
          Why Our Community Stands Out
        </Typography>
        <Grid container spacing={4} sx={{ mb: 8 }}>
          {features.map((feature, index) => (
            <Grid item xs={12} md={4} key={index}>
              <motion.div
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
              >
                <FeatureCard>
                  <Typography
                    variant="h2"
                    sx={{ mb: 2, fontSize: '3rem' }}
                  >
                    {feature.icon}
                  </Typography>
                  <Typography
                    variant="h5"
                    component="h3"
                    sx={{
                      fontWeight: 600,
                      color: '#0055A4',
                      mb: 2,
                    }}
                  >
                    {feature.title}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {feature.description}
                  </Typography>
                </FeatureCard>
              </motion.div>
            </Grid>
          ))}
        </Grid>

        {/* Call to Action */}
        <Box
          sx={{
            backgroundColor: '#F8F9FA',
            borderRadius: '16px',
            padding: { xs: 4, md: 6 },
            textAlign: 'center',
            boxShadow: '0 8px 16px rgba(0, 85, 164, 0.1)',
            maxWidth: '800px',
            mx: 'auto',
          }}
        >
          <Typography
            variant="h4"
            component="h2"
            sx={{
              fontWeight: 600,
              color: '#0055A4',
              mb: 3,
            }}
          >
            Ready for a better social experience?
          </Typography>
          <Typography
            variant="body1"
            sx={{ color: '#006A4E', mb: 4, mx: 'auto' }}
          >
            We're building a platform where quality interactions come first. 
            Be part of a community that values your time and attention.
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/register')}
            sx={{
              backgroundColor: '#EF3340',
              '&:hover': { backgroundColor: '#D12B36' },
              borderRadius: '8px',
              px: 6,
              py: 1.5,
              fontSize: '1.1rem',
              fontWeight: 600,
            }}
          >
            Start Your Journey
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default HomePage;







