import CloseIcon from '@mui/icons-material/Close';
import { Box, Drawer, IconButton, Typography } from '@mui/material';
import NotificationPanel from '../../features/notification/NotificationPanel';

const NotificationDrawer = ({ open, onClose }) => {
  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      ModalProps={{
        keepMounted: true,
        BackdropProps: {
          sx: {
            backgroundColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }}
      sx={{
        '& .MuiDrawer-paper': {
          width: { xs: '100%', sm: 400 },
          boxSizing: 'border-box',
          boxShadow: '-2px 0 10px rgba(0, 0, 0, 0.1)'
        },
      }}
    >
      <Box 
        sx={{ 
          p: 2, 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          borderBottom: '1px solid rgba(0, 0, 0, 0.12)'
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 600 }}>Notifications</Typography>
        <IconButton 
          onClick={onClose}
          sx={{
            '&:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.05)'
            }
          }}
        >
          <CloseIcon />
        </IconButton>
      </Box>
      <NotificationPanel />
    </Drawer>
  );
};

export default NotificationDrawer;