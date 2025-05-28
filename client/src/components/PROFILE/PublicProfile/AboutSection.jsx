import { Button, Card, CardContent, CardHeader, Grid } from '@mui/material';
import PropTypes from 'prop-types';
import { Edit } from '@mui/icons-material';
import InfoItem from './InfoItem';
import { Cake, Email, Link as LinkIcon, LocationOn, Work } from '@mui/icons-material';

const AboutSection = ({ publicProfile, isOwnProfile, formattedDate }) => {
  const aboutInfo = [
    { icon: <Work />, label: "Works at", value: publicProfile.company || "Not specified" },
    { icon: <LocationOn />, label: "Lives in", value: publicProfile.location || "Not specified" },
    { icon: <Email />, label: "Email", value: publicProfile.email || "Not specified" },
    { icon: <LinkIcon />, label: "Website", value: publicProfile.website || "Not specified", isLink: true },
    { icon: <Cake />, label: "Birthday", value: formattedDate || "Not specified" }
  ];

  return (
    <Card sx={{ 
      mb: 3, 
      borderRadius: 2,
      boxShadow: 2
    }}>
      <CardHeader 
        title="Intro" 
        titleTypographyProps={{ 
          variant: 'h6',
          fontWeight: 600
        }}
      />
      <CardContent>
        {aboutInfo.map((item, index) => (
          <InfoItem 
            key={index}
            icon={item.icon}
            label={item.label}
            value={item.value}
            isLink={item.isLink}
          />
        ))}
        {isOwnProfile && (
          <Button 
            variant="outlined" 
            fullWidth 
            startIcon={<Edit />}
            sx={{ mt: 1 }}
          >
            Edit Details
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

AboutSection.propTypes = {
  publicProfile: PropTypes.object.isRequired,
  isOwnProfile: PropTypes.bool.isRequired,
  formattedDate: PropTypes.string
};

export default AboutSection;