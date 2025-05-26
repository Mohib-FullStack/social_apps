import { Link as LinkIcon, LocationOn, VerifiedUser } from '@mui/icons-material';
import { Link, Typography, Box } from '@mui/material';

const formatWebsite = (url) => {
  if (!url) return '';
  return url.replace(/(^\w+:|^)\/\//, '');
};

const ProfileInfoSection = ({ userData, isMobile }) => {
  return (
    <Box sx={{ 
      maxWidth: 'lg', 
      mx: 'auto', 
      px: { xs: 2, sm: 3, md: 4 },
      mt: isMobile ? 12 : 8,
      textAlign: isMobile ? 'center' : 'left',
      mb: 4,
      ml: isMobile ? 0 : 24
    }}>
      <Typography variant="h3" component="h1" sx={{ fontWeight: 700 }}>
        {userData.fullName || 'Anonymous User'}
        {userData.isVerified && (
          <VerifiedUser 
            color="primary" 
            sx={{ 
              ml: 1, 
              verticalAlign: 'middle',
              fontSize: 'inherit'
            }} 
          />
        )}
      </Typography>
      
      {userData.bio && (
        <Typography variant="subtitle1" color="text.secondary" sx={{ mt: 1 }}>
          {userData.bio}
        </Typography>
      )}
      
      {userData.location && (
        <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
          <LocationOn fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
          {userData.location}
        </Typography>
      )}
      
      {userData.website && (
        <Link 
          href={userData.website.startsWith('http') ? userData.website : `https://${userData.website}`}
          target="_blank"
          rel="noopener noreferrer"
          color="primary"
          sx={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            mt: 1,
            textDecoration: 'none',
            '&:hover': {
              textDecoration: 'underline'
            }
          }}
        >
          <LinkIcon fontSize="small" sx={{ mr: 0.5 }} />
          {formatWebsite(userData.website)}
        </Link>
      )}
    </Box>
  );
};

export default ProfileInfoSection;