import {
  AdminPanelSettings as AdminIcon,
  Category as CategoryIcon,
  LocalShipping as InventoryIcon,
  People as PeopleIcon,
  Inventory as ProductIcon,
  BarChart as SalesIcon,
  SupportAgent as SupportIcon,
} from '@mui/icons-material';
import {
  Avatar,
  Box,
  Button,
  CardContent,
  Fade,
  Grid,
  Paper,
  Typography,
} from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import theme from '../../theme';

const Dashboard = () => {
  const navigate = useNavigate();

  const cardStyle = {
    padding: 2,
    backgroundColor: 'background.paper',
    borderRadius: '15px',
    transition: 'transform 0.3s ease',
    '&:hover': {
      transform: 'scale(1.03)',
      boxShadow: 6,
    },
  };

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          padding: 4,
          backgroundColor: 'background.default',
          minHeight: '100vh',
        }}
      >
        {/* Ensure the title is visible by adding more margin on top */}
        <Typography
          variant="h3"
          color="text.primary"
          gutterBottom
          sx={{ textAlign: 'center', fontWeight: 'bold', mt: 8, mb: 4 }}
        >
          Admin Dashboard
        </Typography>

        <Grid container spacing={3} maxWidth="lg" sx={{ margin: '0 auto' }}>
          {[
            {
              title: 'Manage Categories',
              icon: <CategoryIcon />,
              color: 'primary.main',
              path: '/category',
            },
            {
              title: 'Manage Products',
              icon: <ProductIcon />,
              color: 'secondary.main',
              path: '/product',
            },
            {
              title: 'Orders Table',
              icon: <ProductIcon />,
              color: 'secondary.main',
              path: '/order-table',
            },
            {
              title: 'User Management',
              icon: <PeopleIcon />,
              color: 'warning.main',
              path: '/user-table',
            },
            {
              title: 'Admin Panel',
              icon: <AdminIcon />,
              color: 'error.main',
              path: '/admin-panel',
            },
            {
              title: 'Sales Reports',
              icon: <SalesIcon />,
              color: 'success.main',
              path: '/sales-reports',
            },
            {
              title: 'Customer Support',
              icon: <SupportIcon />,
              color: 'info.main',
              path: '/customer-support',
            },
            {
              title: 'Inventory Tracking',
              icon: <InventoryIcon />,
              color: 'primary.light',
              path: '/inventory-tracking',
            },
          ].map((item, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Fade in={true} timeout={1000 + index * 500}>
                <Paper elevation={3} sx={cardStyle}>
                  <CardContent>
                    <Avatar sx={{ bgcolor: item.color, mb: 2 }}>{item.icon}</Avatar>
                    <Typography variant="h6" gutterBottom>
                      {item.title}
                    </Typography>
                    <Button
                      variant="contained"
                      fullWidth
                      color={item.color.split('.')[0]}
                      onClick={() => navigate(item.path)}
                    >
                      Go to {item.title}
                    </Button>
                  </CardContent>
                </Paper>
              </Fade>
            </Grid>
          ))}
        </Grid>
      </Box>
    </ThemeProvider>
  );
};

export default Dashboard;

