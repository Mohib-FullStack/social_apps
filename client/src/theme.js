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


// ! previous version running
// import { createTheme } from '@mui/material/styles';

// const theme = createTheme({
//   palette: {
//     mode: 'light',
//     primary: {
//       main: '#0055A4', // French blue
//     },
//     secondary: {
//       main: '#006A4E', // Bangladesh green
//     },
//     error: {
//       main: '#EF3340', // French red
//     },
//     background: {
//       default: '#F8F9FA',
//       paper: '#FFFFFF',
//     },
//     text: {
//       primary: '#0055A4', // French blue
//       secondary: '#006A4E', // Bangladesh green
//     },
//   },
//   typography: {
//     fontFamily: `'Poppins', sans-serif`,
//     h5: {
//       fontWeight: 600,
//       fontSize: '1.8rem',
//       '@media (max-width:600px)': {
//         fontSize: '1.4rem',
//       },
//     },
//     body1: {
//       fontSize: '1rem',
//       '@media (max-width:600px)': {
//         fontSize: '0.9rem',
//       },
//     },
//   },
//   components: {
//     MuiPaper: {
//       styleOverrides: {
//         root: {
//           borderRadius: 12,
//         },
//       },
//     },
//     MuiButton: {
//       styleOverrides: {
//         root: {
//           borderRadius: 8,
//           textTransform: 'none',
//           fontWeight: 500,
//           boxShadow: 'none',
//           '&:hover': {
//             boxShadow: 'none',
//           },
//         },
//       },
//     },
//     MuiTextField: {
//       styleOverrides: {
//         root: {
//           borderRadius: 8,
//           '& .MuiInputBase-root': {
//             borderRadius: 8,
//           },
//         },
//       },
//     },
//   },
// });

// export default theme;
//! new
// theme.js
// import { createTheme } from '@mui/material/styles';

// const theme = createTheme({
//   palette: {
//     mode: 'dark',
//     primary: {
//       main: '#1D3D8F',
//     },
//     secondary: {
//       main: '#FF644A',
//     },
//     background: {
//       default: '#0F1E2F',
//       paper: '#253A63',
//     },
//     text: {
//       primary: '#FFFFFF',
//       secondary: '#F0F0F0',
//     },
//   },
//   typography: {
//     fontFamily: `'Poppins', sans-serif`,
//     h5: {
//       fontWeight: 600,
//       fontSize: '1.5rem',
//       '@media (max-width:600px)': {
//         fontSize: '1.2rem',
//       },
//     },
//     body1: {
//       fontSize: '1rem',
//       '@media (max-width:600px)': {
//         fontSize: '0.9rem',
//       },
//     },
//   },
//   components: {
//     MuiPaper: {
//       styleOverrides: {
//         root: {
//           borderRadius: 16,
//         },
//       },
//     },
//     MuiButton: {
//       styleOverrides: {
//         root: {
//           borderRadius: 12,
//           textTransform: 'none',
//         },
//       },
//     },
//     MuiTextField: {
//       styleOverrides: {
//         root: {
//           borderRadius: 10,
//           '& .MuiInputBase-root': {
//             borderRadius: 10,
//           },
//         },
//       },
//     },
//   },
// });

// export default theme;
