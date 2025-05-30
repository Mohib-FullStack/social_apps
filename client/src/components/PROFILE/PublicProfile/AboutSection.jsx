import { Button, Card, CardContent, CardHeader, Grid } from '@mui/material';
import PropTypes from 'prop-types';
import { Edit as EditIcon } from '@mui/icons-material';
import InfoItem from './InfoItem';
import { Cake as BirthdayIcon, Email as EmailIcon, Link as LinkIcon, LocationOn as LocationIcon, Work as WorkIcon } from '@mui/icons-material';

const AboutSection = ({ profile, isOwnProfile, formattedDate }) => {
  const aboutInfo = [
    { icon: <WorkIcon color="primary" />, label: "Profession", value: profile.profession || "Not specified" },
    { icon: <LocationIcon color="secondary" />, label: "Location", value: profile.location || "Not specified" },
    { icon: <EmailIcon color="info" />, label: "Email", value: profile.email || "Not specified" },
    { icon: <LinkIcon color="success" />, label: "Website", value: profile.website || "Not specified", isLink: true },
    { icon: <BirthdayIcon color="warning" />, label: "Birthday", value: formattedDate || "Not specified" }
  ];

  return (
    <Card sx={{ 
      mb: 3, 
      borderRadius: 3,
      boxShadow: 2
    }}>
      <CardHeader 
        title="About" 
        titleTypographyProps={{ 
          variant: 'h6',
          fontWeight: 600
        }}
      />
      <CardContent>
        <Grid container spacing={2}>
          {aboutInfo.map((item, index) => (
            <Grid item xs={12} key={index}>
              <InfoItem 
                icon={item.icon}
                label={item.label}
                value={item.value}
                isLink={item.isLink}
              />
            </Grid>
          ))}
        </Grid>
        {isOwnProfile && (
          <Button 
            variant="outlined" 
            fullWidth 
            startIcon={<EditIcon />}
            sx={{ mt: 2 }}
          >
            Edit Details
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

AboutSection.propTypes = {
  profile: PropTypes.object.isRequired,
  isOwnProfile: PropTypes.bool.isRequired,
  formattedDate: PropTypes.string
};

export default AboutSection;










