import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#4A90E2', // vibrant blue
    },
    secondary: {
      main: '#FF6F61', // coral red
    },
    success: {
      main: '#4CAF50',
    },
    error: {
      main: '#F44336',
    },
    background: {
      default: '#f4f6f8',
      paper: '#fff',
    },
  },
  shape: {
    borderRadius: 16,
  },
  typography: {
    fontFamily: 'Poppins, sans-serif',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          textTransform: 'none',
        },
      },
    },
  },
});

export default theme;


