import { Box, Card, DialogContent, DialogTitle } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getSentRequests } from '../../features/friendship/friendshipSlice';
import theme from '../../theme';

const Chat = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.user);

  useEffect(() => {
    if (user?.id) {
      dispatch(getSentRequests(user.id));
    }
  }, [user, dispatch]);

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          backgroundColor: 'background.default',
        }}
      >
        <Card
          sx={{
            width: '100%',
            maxWidth: 900,
            height: '85vh',
            backgroundColor: 'background.paper',
            borderRadius: '20px',
            boxShadow: 3,
            padding: 3,
            overflow: 'auto',
          }}
        >
          <DialogTitle sx={{ textAlign: 'center' }}>
            Chat & Friendship Panel
          </DialogTitle>

          <DialogContent>
            <SendFriendRequest />
            <AcceptFriendRequest />
            <FriendsPage />
          </DialogContent>
        </Card>
      </Box>
    </ThemeProvider>
  );
};

export default Chat;
