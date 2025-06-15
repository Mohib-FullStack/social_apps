// import { PersonAdd } from '@mui/icons-material';
// import { Button } from '@mui/material';
// import PropTypes from 'prop-types';
// import theme from '../../../theme';

// const AddFriendButton = ({ onClick, isMobile = false, disabled = false }) => {
//   return (
//     <Button
//       variant="contained"
//       color="primary"
//       startIcon={<PersonAdd />}
//       onClick={onClick}
//       disabled={disabled} // Add disabled prop
//       sx={{
//         position: 'absolute',
//         bottom: isMobile ? 16 : 32,
//         right: 32,
//         zIndex: 2,
//         '&.MuiButton-root': {
//           [theme.breakpoints.down('sm')]: {
//             right: '50%',
//             transform: 'translateX(50%)',
//           },
//         },
//         '&.Mui-disabled': {
//           backgroundColor: theme.palette.grey[300],
//           color: theme.palette.grey[500],
//         },
//       }}
//     >
//       Add Friend
//     </Button>
//   );
// };

// AddFriendButton.propTypes = {
//   onClick: PropTypes.func.isRequired,
//   isMobile: PropTypes.bool,
//   disabled: PropTypes.bool, // Add new propType
// };

// AddFriendButton.defaultProps = {
//   isMobile: false,
//   disabled: false, // Add new default prop
// };

// export default AddFriendButton;








// import { PersonAdd } from '@mui/icons-material';
// import { Button } from '@mui/material';
// import PropTypes from 'prop-types';
// import theme from '../../../theme';



// const AddFriendButton = ({ onClick, isMobile = false }) => {
//   return (
//     <Button
//       variant="contained"
//       color="primary"
//       startIcon={<PersonAdd />}
//       onClick={onClick}
//       sx={{
//         position: 'absolute',
//         bottom: isMobile ? 16 : 32,
//         right: 32,
//         zIndex: 2,
//         '&.MuiButton-root': {
//           [theme.breakpoints.down('sm')]: {
//             right: '50%',
//             transform: 'translateX(50%)',
//           },
//         },
//       }}
//     >
//       Add Friend
//     </Button>
//   );
// };

// AddFriendButton.propTypes = {
//   onClick: PropTypes.func.isRequired,
//   isMobile: PropTypes.bool,
// };

// export default AddFriendButton;