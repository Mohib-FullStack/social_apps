import { FormControl, InputLabel, MenuItem, Select, Tooltip } from '@mui/material';
import { useDispatch } from 'react-redux';
import { updateFriendshipTier } from '../../features/friendship/friendshipSlice';
import { showSnackbar } from '../../features/snackbar/snackbarSlice';

const FriendshipTierDialog = ({ friendshipId, currentTier }) => {
  const dispatch = useDispatch();
  
  const tiers = [
    { value: 'close_friends', label: 'Close Friends' },
    { value: 'acquaintances', label: 'Acquaintances' },
    { value: 'family', label: 'Family' },
    { value: 'work', label: 'Work' },
    { value: 'custom', label: 'Custom' }
  ];

  const handleChange = async (event) => {
    const newTier = event.target.value;
    try {
      await dispatch(updateFriendshipTier({ 
        friendshipId, 
        tier: newTier 
      })).unwrap();
      
      dispatch(showSnackbar({
        message: 'Friendship tier updated successfully',
        severity: 'success'
      }));
    } catch (error) {
      dispatch(showSnackbar({
        message: 'Failed to update friendship tier',
        severity: 'error'
      }));
    }
  };

  return (
    <Tooltip title="Change friendship tier" arrow>
      <FormControl size="small" sx={{ minWidth: 120 }}>
        <InputLabel>Tier</InputLabel>
        <Select
          value={currentTier || ''}
          onChange={handleChange}
          label="Tier"
        >
          {tiers.map((tier) => (
            <MenuItem key={tier.value} value={tier.value}>
              {tier.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Tooltip>
  );
};

export default FriendshipTierDialog;