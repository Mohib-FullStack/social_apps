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










// import { Button, Card, CardContent, CardHeader, Grid } from '@mui/material';
// import PropTypes from 'prop-types';
// import { Edit } from '@mui/icons-material';
// import InfoItem from './InfoItem';
// import { Cake, Email, Link as LinkIcon, LocationOn, Work } from '@mui/icons-material';

// const AboutSection = ({ publicProfile, isOwnProfile, formattedDate }) => {
//   const aboutInfo = [
//     { icon: <Work />, label: "Works at", value: publicProfile.company || "Not specified" },
//     { icon: <LocationOn />, label: "Lives in", value: publicProfile.location || "Not specified" },
//     { icon: <Email />, label: "Email", value: publicProfile.email || "Not specified" },
//     { icon: <LinkIcon />, label: "Website", value: publicProfile.website || "Not specified", isLink: true },
//     { icon: <Cake />, label: "Birthday", value: formattedDate || "Not specified" }
//   ];

//   return (
//     <Card sx={{ 
//       mb: 3, 
//       borderRadius: 2,
//       boxShadow: 2
//     }}>
//       <CardHeader 
//         title="Intro" 
//         titleTypographyProps={{ 
//           variant: 'h6',
//           fontWeight: 600
//         }}
//       />
//       <CardContent>
//         {aboutInfo.map((item, index) => (
//           <InfoItem 
//             key={index}
//             icon={item.icon}
//             label={item.label}
//             value={item.value}
//             isLink={item.isLink}
//           />
//         ))}
//         {isOwnProfile && (
//           <Button 
//             variant="outlined" 
//             fullWidth 
//             startIcon={<Edit />}
//             sx={{ mt: 1 }}
//           >
//             Edit Details
//           </Button>
//         )}
//       </CardContent>
//     </Card>
//   );
// };

// AboutSection.propTypes = {
//   publicProfile: PropTypes.object.isRequired,
//   isOwnProfile: PropTypes.bool.isRequired,
//   formattedDate: PropTypes.string
// };

// export default AboutSection;