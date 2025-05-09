// theme.js
// import { createTheme } from '@mui/material/styles';

// const theme = createTheme({
//   palette: {
//     primary: {
//       main: '#1D3D8F', // for card header and accents
//     },
//     secondary: {
//       main: '#FF644A', // for important text and labels
//     },
//     background: {
//       default: '#0F1E2F', // overall background color
//       paper: '#253A63', // for card background
//     },
//     text: {
//       primary: '#FFFFFF', // main text color
//       secondary: '#F0F0F0', // secondary text color
//     },
//   },
// });

// export default theme;
//! new
// theme.js
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#1D3D8F',
    },
    secondary: {
      main: '#FF644A',
    },
    background: {
      default: '#0F1E2F',
      paper: '#253A63',
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#F0F0F0',
    },
  },
  typography: {
    fontFamily: `'Poppins', sans-serif`,
    h5: {
      fontWeight: 600,
      fontSize: '1.5rem',
      '@media (max-width:600px)': {
        fontSize: '1.2rem',
      },
    },
    body1: {
      fontSize: '1rem',
      '@media (max-width:600px)': {
        fontSize: '0.9rem',
      },
    },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          textTransform: 'none',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          '& .MuiInputBase-root': {
            borderRadius: 10,
          },
        },
      },
    },
  },
});

export default theme;
