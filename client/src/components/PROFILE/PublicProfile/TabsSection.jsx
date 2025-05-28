import { Box, Tab, Tabs } from '@mui/material';
import PropTypes from 'prop-types';
import { Feed as FeedIcon, Info as InfoIcon, People as PeopleIcon, PhotoLibrary as PhotoLibraryIcon, VideoLibrary as VideoLibraryIcon } from '@mui/icons-material';

const TabsSection = ({ tabValue, handleTabChange }) => (
  <Box sx={{ 
    borderBottom: 1, 
    borderColor: 'divider', 
    mb: 3,
    '& .MuiTabs-indicator': {
      backgroundColor: theme => theme.palette.primary.main,
      height: 3
    }
  }}>
    <Tabs 
      value={tabValue} 
      onChange={handleTabChange}
      variant="scrollable"
      scrollButtons="auto"
      textColor="primary"
      sx={{
        '& .MuiTab-root': {
          minWidth: 120,
          fontWeight: 600,
          textTransform: 'none',
          fontSize: '0.9375rem',
          '&.Mui-selected': {
            color: theme => theme.palette.primary.main
          }
        }
      }}
    >
      <Tab label="Timeline" icon={<FeedIcon />} iconPosition="start" />
      <Tab label="About" icon={<InfoIcon />} iconPosition="start" />
      <Tab label="Friends" icon={<PeopleIcon />} iconPosition="start" />
      <Tab label="Photos" icon={<PhotoLibraryIcon />} iconPosition="start" />
      <Tab label="Videos" icon={<VideoLibraryIcon />} iconPosition="start" />
    </Tabs>
  </Box>
);

TabsSection.propTypes = {
  tabValue: PropTypes.number.isRequired,
  handleTabChange: PropTypes.func.isRequired
};

export default TabsSection;