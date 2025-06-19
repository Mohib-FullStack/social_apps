// src/components/Friends/MutualFriendsSection.jsx
import CloseIcon from '@mui/icons-material/Close';
import PeopleIcon from '@mui/icons-material/People';
import {
  Avatar,
  Box,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Typography
} from '@mui/material';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getMutualFriends } from '../../../features/friendship/friendshipSlice';

const MutualFriends = ({ userId }) => {
  const dispatch = useDispatch();
  const { mutualFriends, status } = useSelector((state) => state.friendship);
  const [openDialog, setOpenDialog] = useState(false);

  useEffect(() => {
    if (userId) {
      dispatch(getMutualFriends({ userId }));
    }
  }, [dispatch, userId]);

  const handleOpenDialog = () => setOpenDialog(true);
  const handleCloseDialog = () => setOpenDialog(false);

  if (status === 'loading') {
    return <CircularProgress size={24} />;
  }

  if (!mutualFriends.data || mutualFriends.data.length === 0) {
    return null;
  }

  return (
    <>
      <Box sx={{ mt: 2, cursor: 'pointer' }} onClick={handleOpenDialog}>
        <Typography variant="subtitle2" color="text.secondary">
          <PeopleIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 1 }} />
          {mutualFriends.data.length} mutual friend{mutualFriends.data.length !== 1 ? 's' : ''}
        </Typography>
      </Box>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">
              Mutual Friends ({mutualFriends.data.length})
            </Typography>
            <IconButton onClick={handleCloseDialog}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <List>
            {mutualFriends.data.map((friend) => (
              <ListItem key={friend.id}>
                <ListItemAvatar>
                  <Avatar src={friend.profileImage} />
                </ListItemAvatar>
                <ListItemText
                  primary={`${friend.firstName} ${friend.lastName}`}
                />
              </ListItem>
            ))}
          </List>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default MutualFriends;