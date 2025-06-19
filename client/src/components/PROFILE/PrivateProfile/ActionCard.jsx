import { Avatar, Box, Button, Paper, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const ActionCard = ({ icon, title, path, color, navigate, onClick }) => {
  const nav = useNavigate();

  const handleClick = onClick ? onClick : () => (path ? nav(path) : null);

  return (
    <Paper
      elevation={2}
      sx={{
        p: 2,
        borderRadius: 2,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 4,
        },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <Avatar
          sx={{
            bgcolor: `${color}.main`,
            mr: 2,
            width: 40,
            height: 40,
            color: 'common.white',
          }}
        >
          {icon}
        </Avatar>
        <Typography variant="subtitle1" fontWeight="500">
          {title}
        </Typography>
      </Box>
      <Button
        variant="outlined"
        color={color}
        fullWidth
        onClick={handleClick}
        size="small"
        sx={{ mt: 'auto' }}
      >
        {onClick ? 'Action' : 'Open'}
      </Button>
    </Paper>
  );
};

export default ActionCard;
