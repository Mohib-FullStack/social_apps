import { Box } from '@mui/material';

const LayoutWrapper = ({ children }) => {
  return (
    <Box className="main-content">
      {children}
    </Box>
  );
};

export default LayoutWrapper;