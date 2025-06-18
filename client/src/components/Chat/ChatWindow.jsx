// // components/Chat/ChatWindow.jsx
// import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';
// import SendIcon from '@mui/icons-material/Send';
// import {
//   Avatar,
//   Box,
//   Chip,
//   IconButton,
//   List,
//   ListItem,
//   ListItemAvatar,
//   ListItemText,
//   Popover,
//   TextField,
//   Typography
// } from '@mui/material';
// import { useEffect, useRef, useState } from 'react';
// import { useSelector } from 'react-redux';
// import axiosInstance from '../../axiosInstance';
// import { useSocket } from '../../context/SocketContext';

// const emojis = ['👍', '❤️', '😂', '😮', '😢', '🙏'];

// const ChatWindow = ({ chatId }) => {
//   const [messages, setMessages] = useState([]);
//   const [message, setMessage] = useState('');
//   const [chat, setChat] = useState(null);
//   const [typingUsers, setTypingUsers] = useState([]);
//   const [reactionAnchor, setReactionAnchor] = useState(null);
//   const [selectedMessage, setSelectedMessage] = useState(null);
//   const socket = useSocket();
//   const { user } = useSelector((state) => state.user);
//   const messagesEndRef = useRef(null);

//   useEffect(() => {
//     if (!chatId) return;

//     // Fetch chat details
//     const fetchChat = async () => {
//       try {
//         const response = await axiosInstance.get(`/api/chats/${chatId}`);
//         setChat(response.data.payload);
//       } catch (error) {
//         console.error('Error fetching chat:', error);
//       }
//     };

//     // Fetch initial messages
//     const fetchMessages = async () => {
//       try {
//         const response = await axiosInstance.get(`/api/chats/${chatId}/messages`);
//         setMessages(response.data.payload);
//       } catch (error) {
//         console.error('Error fetching messages:', error);
//       }
//     };

//     fetchChat();
//     fetchMessages();
//   }, [chatId]);

//   useEffect(() => {
//     if (!socket) return;

//     const handleNewMessage = (newMessage) => {
//       if (newMessage.chatId === chatId) {
//         setMessages(prev => [...prev, newMessage]);
//       }
//     };

//     const handleMessageReaction = ({ messageId, reactions }) => {
//       setMessages(prev => prev.map(msg => 
//         msg.id === messageId ? { ...msg, reactions } : msg
//       ));
//     };

//     const handleMessageEdited = ({ messageId, newContent }) => {
//       setMessages(prev => prev.map(msg => 
//         msg.id === messageId ? { ...msg, content: newContent, edited: true } : msg
//       ));
//     };

//     const handleUserTyping = ({ userId, name }) => {
//       setTypingUsers(prev => {
//         const exists = prev.some(u => u.userId === userId);
//         return exists ? prev : [...prev, { userId, name }];
//       });
//     };

//     const handleUserStoppedTyping = ({ userId }) => {
//       setTypingUsers(prev => prev.filter(u => u.userId !== userId));
//     };

//     socket.on('newMessage', handleNewMessage);
//     socket.on('messageReaction', handleMessageReaction);
//     socket.on('messageEdited', handleMessageEdited);
//     socket.on('userTyping', handleUserTyping);
//     socket.on('userStoppedTyping', handleUserStoppedTyping);

//     return () => {
//       socket.off('newMessage', handleNewMessage);
//       socket.off('messageReaction', handleMessageReaction);
//       socket.off('messageEdited', handleMessageEdited);
//       socket.off('userTyping', handleUserTyping);
//       socket.off('userStoppedTyping', handleUserStoppedTyping);
//     };
//   }, [socket, chatId]);

//   useEffect(() => {
//     scrollToBottom();
//   }, [messages]);

//   const scrollToBottom = () => {
//     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//   };

//   const handleSendMessage = async () => {
//     if (!message.trim() || !socket || !chatId) return;

//     try {
//       // Optimistically add message to UI
//       const tempMessage = {
//         id: Date.now(), // temporary ID
//         content: message,
//         senderId: user.id,
//         chatId,
//         isRead: false,
//         createdAt: new Date().toISOString(),
//         sender: {
//           id: user.id,
//           firstName: user.firstName,
//           lastName: user.lastName,
//           profileImage: user.profileImage
//         }
//       };

//       setMessages(prev => [...prev, tempMessage]);
//       setMessage('');

//       // Send via socket
//       socket.emit('sendMessage', {
//         chatId,
//         content: message
//       });
//     } catch (error) {
//       console.error('Error sending message:', error);
//     }
//   };

//   const handleKeyPress = (e) => {
//     if (e.key === 'Enter' && !e.shiftKey) {
//       e.preventDefault();
//       handleSendMessage();
//     }
//   };

//   const handleTyping = () => {
//     if (!socket || !chatId) return;
//     socket.emit('typing', { chatId });
//     setTimeout(() => socket.emit('stopTyping', { chatId }), 3000);
//   };

//   const handleReact = (messageId, emoji) => {
//     if (!socket) return;
//     socket.emit('reactToMessage', { messageId, reaction: emoji });
//     setReactionAnchor(null);
//   };

//   const openReactionMenu = (event, messageId) => {
//     setSelectedMessage(messageId);
//     setReactionAnchor(event.currentTarget);
//   };

//   const closeReactionMenu = () => {
//     setReactionAnchor(null);
//     setSelectedMessage(null);
//   };

//   const handleEditMessage = (messageId, newContent) => {
//     if (!socket) return;
//     socket.emit('editMessage', { messageId, newContent });
//   };

//   if (!chat) return <Box>Loading chat...</Box>;

//   const otherParticipant = chat.participants.find(p => p.id !== user.id);

//   return (
//     <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
//       {/* Chat header */}
//       <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0', display: 'flex', alignItems: 'center' }}>
//         <Avatar src={otherParticipant?.profileImage} />
//         <Box sx={{ ml: 2 }}>
//           <Typography variant="h6">
//             {otherParticipant?.firstName} {otherParticipant?.lastName}
//           </Typography>
//           {typingUsers.length > 0 && (
//             <Typography variant="caption" color="text.secondary">
//               {typingUsers.map(u => u.name).join(', ')} {typingUsers.length > 1 ? 'are' : 'is'} typing...
//             </Typography>
//           )}
//         </Box>
//       </Box>

//       {/* Messages list */}
//       <Box sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
//         <List>
//           {messages.map((msg) => (
//             <ListItem 
//               key={msg.id} 
//               sx={{ 
//                 justifyContent: msg.senderId === user.id ? 'flex-end' : 'flex-start',
//                 alignItems: 'flex-start',
//                 position: 'relative'
//               }}
//             >
//               {msg.senderId !== user.id && (
//                 <ListItemAvatar>
//                   <Avatar src={msg.sender?.profileImage} />
//                 </ListItemAvatar>
//               )}
//               <Box sx={{
//                 bgcolor: msg.senderId === user.id ? 'primary.main' : 'grey.200',
//                 color: msg.senderId === user.id ? 'white' : 'text.primary',
//                 p: 1.5,
//                 borderRadius: 2,
//                 maxWidth: '70%',
//                 wordBreak: 'break-word',
//                 position: 'relative'
//               }}>
//                 <ListItemText 
//                   primary={msg.content} 
//                   secondary={
//                     <>
//                       {msg.edited && <span>(edited) </span>}
//                       {new Date(msg.createdAt).toLocaleTimeString()}
//                       <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5 }}>
//                         {Object.entries(msg.reactions || {}).map(([userId, emoji]) => (
//                           <Chip 
//                             key={userId} 
//                             label={emoji} 
//                             size="small" 
//                             sx={{ 
//                               height: 'auto',
//                               '& .MuiChip-label': { p: 0.5 }
//                             }} 
//                           />
//                         ))}
//                       </Box>
//                     </>
//                   } 
//                   sx={{ 
//                     color: msg.senderId === user.id ? 'white' : 'inherit',
//                     '& .MuiListItemText-secondary': {
//                       color: msg.senderId === user.id ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)'
//                     }
//                   }} 
//                 />
//                 <IconButton
//                   size="small"
//                   sx={{
//                     position: 'absolute',
//                     right: -8,
//                     bottom: -8,
//                     bgcolor: 'background.paper',
//                     '&:hover': { bgcolor: 'background.default' }
//                   }}
//                   onClick={(e) => openReactionMenu(e, msg.id)}
//                 >
//                   <EmojiEmotionsIcon fontSize="small" />
//                 </IconButton>
//               </Box>
//             </ListItem>
//           ))}
//           <div ref={messagesEndRef} />
//         </List>
//       </Box>

//       {/* Message input */}
//       <Box sx={{ p: 2, borderTop: '1px solid #e0e0e0' }}>
//         <Box sx={{ display: 'flex', alignItems: 'center' }}>
//           <TextField
//             fullWidth
//             variant="outlined"
//             placeholder="Type a message"
//             value={message}
//             onChange={(e) => {
//               setMessage(e.target.value);
//               if (e.target.value) handleTyping();
//             }}
//             onKeyPress={handleKeyPress}
//             multiline
//             maxRows={4}
//           />
//           <IconButton 
//             color="primary" 
//             onClick={handleSendMessage}
//             disabled={!message.trim()}
//             sx={{ ml: 1 }}
//           >
//             <SendIcon />
//           </IconButton>
//         </Box>
//       </Box>

//       {/* Reaction popover */}
//       <Popover
//         open={Boolean(reactionAnchor)}
//         anchorEl={reactionAnchor}
//         onClose={closeReactionMenu}
//         anchorOrigin={{
//           vertical: 'top',
//           horizontal: 'center',
//         }}
//         transformOrigin={{
//           vertical: 'bottom',
//           horizontal: 'center',
//         }}
//       >
//         <Box sx={{ p: 1, display: 'flex', gap: 1 }}>
//           {emojis.map(emoji => (
//             <IconButton 
//               key={emoji} 
//               onClick={() => handleReact(selectedMessage, emoji)}
//               sx={{ fontSize: '1.5rem' }}
//             >
//               {emoji}
//             </IconButton>
//           ))}
//         </Box>
//       </Popover>
//     </Box>
//   );
// };

// export default ChatWindow;

