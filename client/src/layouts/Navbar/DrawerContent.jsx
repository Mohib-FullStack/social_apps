import { List, ListItem, ListItemIcon, ListItemText, Avatar, Typography, Box } from '@mui/material';
import { Link } from 'react-router-dom';
import { ContactMail, Login } from '@mui/icons-material';

const DrawerContent = ({ 
  navItems, 
  userData, 
  loggedIn, 
  toggleDrawer 
}) => {
  return (
    <Box sx={{ width: 250 }} role="presentation">
      <List>
        {loggedIn && (
          <ListItem 
            component={Link} 
            to="/profile/me"
            onClick={toggleDrawer(false)}
            sx={{ '&:hover': { backgroundColor: '#E7F3FF' } }}
          >
            <Avatar src={userData.image} sx={{ width: 40, height: 40, mr: 2 }} />
            <Typography variant="body1">
              {userData.firstName} {userData.lastName}
            </Typography>
          </ListItem>
        )}

        {navItems.map((item) => (
          <ListItem
            key={item.name}
            component={Link}
            to={item.path}
            onClick={toggleDrawer(false)}
            sx={{ '&:hover': { backgroundColor: '#E7F3FF' } }}
          >
            <ListItemIcon>
              <item.icon sx={{ color: item.color }} />
            </ListItemIcon>
            <ListItemText primary={item.name} />
          </ListItem>
        ))}

        <ListItem 
          component={Link} 
          to="/contact-us"
          onClick={toggleDrawer(false)}
        >
          <ListItemIcon>
            <ContactMail color="info" />
          </ListItemIcon>
          <ListItemText primary="Contact Us" />
        </ListItem>

        {!loggedIn && (
          <ListItem 
            component={Link} 
            to="/login"
            onClick={toggleDrawer(false)}
          >
            <ListItemIcon>
              <Login color="success" />
            </ListItemIcon>
            <ListItemText primary="Login" />
          </ListItem>
        )}
      </List>
    </Box>
  );
};

export default DrawerContent;