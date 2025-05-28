import { Box, Typography, Link } from '@mui/material';
import PropTypes from 'prop-types';

const InfoItem = ({ icon, label, value, isLink = false }) => (
  <Box sx={{ display: 'flex', mb: 2 }}>
    <Box sx={{ mr: 2, color: 'text.secondary' }}>{icon}</Box>
    <Box>
      <Typography variant="subtitle2" color="text.secondary">{label}</Typography>
      {isLink ? (
        <Link href={value.startsWith('http') ? value : `https://${value}`} target="_blank" rel="noopener">
          {value}
        </Link>
      ) : (
        <Typography variant="body1">{value}</Typography>
      )}
    </Box>
  </Box>
);

InfoItem.propTypes = {
  icon: PropTypes.node.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  isLink: PropTypes.bool
};

export default InfoItem;