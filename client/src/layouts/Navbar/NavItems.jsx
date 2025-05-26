import { Box, Button, Typography } from '@mui/material';
import { Link } from 'react-router-dom';

const NavItems = ({ items }) => {
  return (
    <Box sx={{ display: 'flex', gap: 1 }}>
      {items.map((item) => (
        <Button
          key={item.name}
          component={Link}
          to={item.path}
          sx={{
            minWidth: '110px',
            height: '48px',
            borderRadius: '8px',
            '&:hover': { backgroundColor: '#E7F3FF' }
          }}
        >
          <item.icon sx={{ color: item.color, fontSize: '28px', mr: 1 }} />
          <Typography variant="body2" sx={{ color: 'text.primary' }}>
            {item.name}
          </Typography>
        </Button>
      ))}
    </Box>
  );
};

export default NavItems;