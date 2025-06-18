// import { Avatar, Badge, IconButton } from '@mui/material';
// import { useChatContext } from '../../context/ChatContext';

//  const ChatHead = ({ chat, onClick }) => {
//   const { onlineUsers } = useChatContext();
//   const otherUser = chat.participants.find(p => p.id !== currentUser.id);

//   return (
//     <Badge
//       overlap="circular"
//       anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
//       variant="dot"
//       color="success"
//       invisible={!onlineUsers.includes(otherUser.id)}
//     >
//       <IconButton onClick={onClick}>
//         <Avatar 
//           src={otherUser.profileImage} 
//           sx={{ width: 56, height: 56 }}
//         />
//       </IconButton>
//     </Badge>
//   );
// };


// export default ChatHead