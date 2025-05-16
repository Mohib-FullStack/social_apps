import { List, ListItem, ListItemText, Typography } from '@mui/material';
import { useSelector } from 'react-redux';

const FriendList = () => {
  const { user } = useSelector((state) => state.user);
  const { friendships } = useSelector((state) => state.friendship);

  const friends = friendships?.filter(f => f.status === 'accepted') || [];

  return (
    <>
      <Typography variant="h6" mt={3}>Your Friends</Typography>
      {friends.length > 0 ? (
        <List>
          {friends.map(friend => {
            const friendId = friend.userId === user.id ? friend.friendId : friend.userId;
            return (
              <ListItem key={friend.id}>
                <ListItemText primary={`Friend ID: ${friendId}`} />
              </ListItem>
            );
          })}
        </List>
      ) : (
        <Typography color="text.secondary">You have no friends yet.</Typography>
      )}
    </>
  );
};

export default FriendList;
