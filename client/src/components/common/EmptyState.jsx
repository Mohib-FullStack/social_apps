import { Box, Typography } from '@mui/material';

const EmptyState = ({
  icon,
  title,
  subtitle,
  action
}) => {
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      textAlign="center"
      p={4}
    >
      <Box mb={2} color="text.secondary">
        {icon}
      </Box>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        {subtitle}
      </Typography>
      {action && <Box mt={2}>{action}</Box>}
    </Box>
  );
};

export default EmptyState;