import { Box, Tab, Tabs } from '@mui/material';
import PropTypes from 'prop-types';
import {
  Article as TimelineIcon,
  Info as AboutIcon,
  Groups as ConnectionsIcon,
  PhotoCamera as MediaIcon,
  Videocam as VideosIcon
} from '@mui/icons-material';

const TabsSection = ({ activeTab, onChangeTab }) => {
  const tabs = [
    { id: 'timeline', label: 'Timeline', icon: <TimelineIcon /> },
    { id: 'about', label: 'About', icon: <AboutIcon /> },
    { id: 'connections', label: 'Connections', icon: <ConnectionsIcon /> },
    { id: 'media', label: 'Media', icon: <MediaIcon /> },
    { id: 'videos', label: 'Videos', icon: <VideosIcon /> }
  ];

  return (
    <Box sx={{ 
      borderBottom: 1, 
      borderColor: 'divider',
      mb: 3,
      '& .MuiTabs-indicator': {
        height: 4,
        borderRadius: 2
      }
    }}>
      <Tabs 
        value={activeTab}
        onChange={(e, newValue) => onChangeTab(newValue)}
        variant="scrollable"
        scrollButtons="auto"
        textColor="primary"
        indicatorColor="primary"
        sx={{
          '& .MuiTab-root': {
            minWidth: 120,
            fontWeight: 600,
            textTransform: 'none',
            fontSize: '0.9375rem',
            '&.Mui-selected': {
              color: 'primary.main'
            }
          }
        }}
      >
        {tabs.map((tab) => (
          <Tab 
            key={tab.id}
            value={tab.id}
            label={tab.label}
            icon={tab.icon}
            iconPosition="start"
          />
        ))}
      </Tabs>
    </Box>
  );
};

TabsSection.propTypes = {
  activeTab: PropTypes.string.isRequired,
  onChangeTab: PropTypes.func.isRequired
};

export default TabsSection;











// import { Box, Tab, Tabs } from '@mui/material';
// import PropTypes from 'prop-types';
// import { Feed as FeedIcon, Info as InfoIcon, People as PeopleIcon, PhotoLibrary as PhotoLibraryIcon, VideoLibrary as VideoLibraryIcon } from '@mui/icons-material';

// const TabsSection = ({ tabValue, handleTabChange }) => (
//   <Box sx={{ 
//     borderBottom: 1, 
//     borderColor: 'divider', 
//     mb: 3,
//     '& .MuiTabs-indicator': {
//       backgroundColor: theme => theme.palette.primary.main,
//       height: 3
//     }
//   }}>
//     <Tabs 
//       value={tabValue} 
//       onChange={handleTabChange}
//       variant="scrollable"
//       scrollButtons="auto"
//       textColor="primary"
//       sx={{
//         '& .MuiTab-root': {
//           minWidth: 120,
//           fontWeight: 600,
//           textTransform: 'none',
//           fontSize: '0.9375rem',
//           '&.Mui-selected': {
//             color: theme => theme.palette.primary.main
//           }
//         }
//       }}
//     >
//       <Tab label="Timeline" icon={<FeedIcon />} iconPosition="start" />
//       <Tab label="About" icon={<InfoIcon />} iconPosition="start" />
//       <Tab label="Friends" icon={<PeopleIcon />} iconPosition="start" />
//       <Tab label="Photos" icon={<PhotoLibraryIcon />} iconPosition="start" />
//       <Tab label="Videos" icon={<VideoLibraryIcon />} iconPosition="start" />
//     </Tabs>
//   </Box>
// );

// TabsSection.propTypes = {
//   tabValue: PropTypes.number.isRequired,
//   handleTabChange: PropTypes.func.isRequired
// };

// export default TabsSection;