import { Box, Card, DialogContent, DialogTitle } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
// import { fetchFriendships } from '../../features/friendship/friendshipSlice';
import theme from '../../theme';
import SendFriendRequest from '../Friends/SendFriendRequest';
import { getSentRequests } from '../../features/friendship/friendshipSlice';
import FriendsPage from '../Friends/FriendsPage';



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
      <Box sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: 'background.default',
      }}>
        <Card sx={{
          width: '100%',
          maxWidth: 900,
          height: '85vh',
          backgroundColor: 'background.paper',
          borderRadius: '20px',
          boxShadow: 3,
          padding: 3,
          overflow: 'auto',
        }}>
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











// import { useEffect } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { fetchFriendships } from '../../features/friendship/friendshipSlice';


// const Chat = () => {
//   const dispatch = useDispatch();
//     // const { error, status } = useSelector((state) => state.user);
//    const { user } = useSelector((state) => state.user); // assuming auth slice
//   const { friendships } = useSelector((state) => state.friendship);

//   useEffect(() => {
//     if (user?.id) dispatch(fetchFriendships(user.id));
//   }, [user, dispatch]);

//   const friends = friendships.filter(f => f.status === 'accepted');

//   return (
//     <div>
//       <h2>Your Friends</h2>
//       <ul>
//         {friends.map(friend => {
//           const friendId = friend.userId === user.id ? friend.friendId : friend.userId;
//           return <li key={friend.id}>Friend ID: {friendId}</li>;
//         })}
//       </ul>
//     </div>
//   );
// };

// export default Chat;










// import { Box, Grid, Paper, Typography } from '@mui/material';
// import { useState } from 'react';
// import ChatList from './ChatList';
// import ChatWindow from './ChatWindow';

// const Chat = () => {
//   const [selectedChat, setSelectedChat] = useState(null);

//   return (
//     <Box sx={{ flexGrow: 1, p: 3 }}>
//       <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
//         Messages
//       </Typography>
//       <Grid container spacing={3}>
//         <Grid item xs={12} md={4}>
//           <Paper sx={{ height: '80vh', overflow: 'auto' }}>
//             <ChatList onSelectChat={setSelectedChat} />
//           </Paper>
//         </Grid>
//         <Grid item xs={12} md={8}>
//           <Paper sx={{ height: '80vh' }}>
//             {selectedChat ? (
//               <ChatWindow chatId={selectedChat} />
//             ) : (
//               <Box sx={{ 
//                 display: 'flex', 
//                 alignItems: 'center', 
//                 justifyContent: 'center', 
//                 height: '100%',
//                 textAlign: 'center'
//               }}>
//                 <Typography variant="h6" color="text.secondary">
//                   Select a chat to start messaging
//                 </Typography>
//               </Box>
//             )}
//           </Paper>
//         </Grid>
//       </Grid>
//     </Box>
//   );
// };

// export default Chat;