import {
  Info as AboutIcon,
  Groups as ConnectionsIcon,
  PhotoCamera as MediaIcon,
  Article as TimelineIcon,
  Videocam as VideosIcon
} from '@mui/icons-material';
import { Box, Tab, Tabs } from '@mui/material';
import PropTypes from 'prop-types';

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











