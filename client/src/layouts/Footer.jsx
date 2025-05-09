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
import { useTheme } from '@mui/material/styles';
import React from 'react';

const Footer = () => {
  const theme = useTheme();
  const currentYear = new Date().getFullYear();

  // Navigation links for the eCommerce sections
  const navLinks = [
    {
      title: 'Products',
      links: ['Shoes', 'Clothing', 'Accessories', 'Bags'],
    },
    {
      title: 'Company',
      links: ['About Us', 'Careers', 'Press', 'Contact'],
    },
    {
      title: 'Support',
      links: ['FAQs', 'Shipping', 'Returns', 'Order Tracking'],
    },
  ];

  // Social media links for SEO
  const socialMediaLinks = [
    {
      icon: <Facebook />,
      url: 'https://www.facebook.com',
      alt: 'Facebook',
    },
    {
      icon: <Instagram />,
      url: 'https://www.instagram.com',
      alt: 'Instagram',
    },
    {
      icon: <Twitter />,
      url: 'https://x.com', // Linking to X (formerly Twitter)
      alt: 'X (formerly Twitter)',
    },
    {
      icon: <LinkedIn />,
      url: 'https://www.linkedin.com',
      alt: 'LinkedIn',
    },
    {
      icon: <YouTube />,
      url: 'https://www.youtube.com',
      alt: 'YouTube',
    },
  ];

  return (
    <Box component="footer" sx={{ bgcolor: '#212121', color: 'white', py: 4 }}>
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* Navigation Links */}
          <Grid item xs={12} md={6} lg={8}>
            <Grid container spacing={4}>
              {navLinks.map((section, index) => (
                <Grid item xs={6} sm={4} key={index}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                    {section.title}
                  </Typography>
                  {section.links.map((link, idx) => (
                    <Link
                      key={idx}
                      href={`/${link.toLowerCase().replace(/\s+/g, '-')}`}
                      sx={{ display: 'block', mb: 1, color: 'white' }}
                      underline="hover"
                    >
                      {link}
                    </Link>
                  ))}
                </Grid>
              ))}
            </Grid>
          </Grid>

          {/* Social Media Icons */}
          <Grid item xs={12} md={6} lg={4}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
              Follow Us
            </Typography>
            <Box>
              {socialMediaLinks.map((social, idx) => (
                <IconButton
                  key={idx}
                  component="a"
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ color: 'white', mr: 1 }}
                  aria-label={social.alt}
                >
                  {social.icon}
                </IconButton>
              ))}
            </Box>
          </Grid>
        </Grid>

        {/* Copyright Notice */}
        <Box textAlign="center" mt={4}>
          <Typography variant="body2" sx={{ color: 'gray.500' }}>
            &copy; {currentYear} Ecommerce Website. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;


