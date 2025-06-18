import {
  Facebook,
  Instagram,
  LinkedIn,
  Twitter,
  YouTube,
} from '@mui/icons-material';
import {
  Box,
  Container,
  Grid,
  IconButton,
  Link,
  Typography,
} from '@mui/material';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  // Enhanced navigation links with better structure for SEO
  const navLinks = [
    {
      title: 'Explore',
      links: [
        { name: 'Home', url: '/' },
        { name: 'Friends', url: '/friends' },
        { name: 'Groups', url: '/groups' },
        { name: 'Marketplace', url: '/marketplace' }
      ]
    },
    {
      title: 'Company',
      links: [
        { name: 'About Us', url: '/about' },
        { name: 'Careers', url: '/careers' },
        { name: 'Privacy Policy', url: '/privacy' },
        { name: 'Terms of Service', url: '/terms' }
      ]
    },
    {
      title: 'Support',
      links: [
        { name: 'Help Center', url: '/help' },
        { name: 'Safety Center', url: '/safety' },
        { name: 'Community Standards', url: '/standards' },
        { name: 'Contact Us', url: '/contact' }
      ]
    }
  ];

  // Social media links with proper attributes for SEO
  const socialMediaLinks = [
    {
      icon: <Facebook />,
      url: 'https://www.facebook.com/yourpage',
      alt: 'Follow us on Facebook',
      ariaLabel: 'Facebook'
    },
    {
      icon: <Instagram />,
      url: 'https://www.instagram.com/yourpage',
      alt: 'Follow us on Instagram',
      ariaLabel: 'Instagram'
    },
    {
      icon: <Twitter />,
      url: 'https://twitter.com/yourpage',
      alt: 'Follow us on Twitter',
      ariaLabel: 'Twitter'
    },
    {
      icon: <LinkedIn />,
      url: 'https://www.linkedin.com/company/yourpage',
      alt: 'Connect with us on LinkedIn',
      ariaLabel: 'LinkedIn'
    },
    {
      icon: <YouTube />,
      url: 'https://www.youtube.com/yourchannel',
      alt: 'Subscribe to our YouTube channel',
      ariaLabel: 'YouTube'
    }
  ];

  return (
    <Box 
      component="footer" 
      sx={{ 
        bgcolor: '#242526', // Darker background
        color: '#e4e6eb', // Light text
        py: 6,
        borderTop: '1px solid rgba(255,255,255,0.1)'
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* Navigation Links with semantic structure */}
          {navLinks.map((section, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Typography 
                variant="h6" 
                component="h3"
                sx={{ 
                  fontWeight: 600, 
                  mb: 2,
                  color: '#ffffff' // White for headings
                }}
              >
                {section.title}
              </Typography>
              <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0 }}>
                {section.links.map((link, idx) => (
                  <li key={idx}>
                    <Link
                      href={link.url}
                      sx={{ 
                        display: 'block', 
                        mb: 1.5, 
                        color: '#b0b3b8', // Subdued text
                        '&:hover': {
                          color: '#ffffff', // White on hover
                          textDecoration: 'none'
                        }
                      }}
                      underline="none"
                      title={link.name}
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </Box>
            </Grid>
          ))}

          {/* Social Media with better accessibility */}
          <Grid item xs={12} md={12} lg={12}>
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column',
              alignItems: 'center',
              mt: 4
            }}>
              <Typography 
                variant="h6" 
                component="h3"
                sx={{ 
                  fontWeight: 600, 
                  mb: 3,
                  color: '#ffffff'
                }}
              >
                Connect With Us
              </Typography>
              <Box>
                {socialMediaLinks.map((social, idx) => (
                  <IconButton
                    key={idx}
                    component="a"
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    sx={{ 
                      color: '#b0b3b8',
                      mx: 1,
                      '&:hover': {
                        color: '#ffffff',
                        backgroundColor: 'rgba(255,255,255,0.1)'
                      }
                    }}
                    aria-label={social.ariaLabel}
                    title={social.alt}
                  >
                    {social.icon}
                  </IconButton>
                ))}
              </Box>
            </Box>
          </Grid>
        </Grid>

        {/* Copyright with microdata */}
        <Box 
          textAlign="center" 
          mt={6}
          sx={{ 
            borderTop: '1px solid rgba(255,255,255,0.1)',
            pt: 3
          }}
        >
          <Typography 
            variant="body2" 
            sx={{ color: '#b0b3b8' }}
            itemProp="copyrightYear"
          >
            &copy; {currentYear} <span itemProp="name">SocialApp</span>. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;