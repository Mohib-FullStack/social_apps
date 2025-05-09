// components/Chat/ChatWindow.jsx
import { Box, Typography, Avatar, TextField, IconButton, List, ListItem, ListItemAvatar, ListItemText, Divider } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { useEffect, useState, useRef } from 'react';
import { useSocket } from '../../context/SocketContext';
import { useSelector } from 'react-redux';
import axiosInstance from '../../axiosInstance';

const ChatWindow = ({ chatId }) => {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [chat, setChat] = useState(null);
  const socket = useSocket();
  const { user } = useSelector((state) => state.user);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!chatId) return;

    // Fetch chat details
    const fetchChat = async () => {
      try {
        const response = await axiosInstance.get(`/api/chats/${chatId}`);
        setChat(response.data.payload);
      } catch (error) {
        console.error('Error fetching chat:', error);
      }
    };

    // Fetch initial messages
    const fetchMessages = async () => {
      try {
        const response = await axiosInstance.get(`/api/chats/${chatId}/messages`);
        setMessages(response.data.payload);
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };

    fetchChat();
    fetchMessages();
  }, [chatId]);

  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (newMessage) => {
      if (newMessage.chatId === chatId) {
        setMessages(prev => [...prev, newMessage]);
      }
    };

    socket.on('newMessage', handleNewMessage);

    return () => {
      socket.off('newMessage', handleNewMessage);
    };
  }, [socket, chatId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !socket || !chatId) return;

    try {
      // Optimistically add message to UI
      const tempMessage = {
        id: Date.now(), // temporary ID
        content: message,
        senderId: user.id,
        chatId,
        isRead: false,
        createdAt: new Date().toISOString(),
        sender: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          profileImage: user.profileImage
        }
      };

      setMessages(prev => [...prev, tempMessage]);
      setMessage('');

      // Send via socket
      socket.emit('sendMessage', {
        chatId,
        content: message
      });
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!chat) return <Box>Loading chat...</Box>;

  const otherParticipant = chat.participants.find(p => p.id !== user.id);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Chat header */}
      <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0', display: 'flex', alignItems: 'center' }}>
        <Avatar src={otherParticipant?.profileImage} />
        <Typography variant="h6" sx={{ ml: 2 }}>
          {otherParticipant?.firstName} {otherParticipant?.lastName}
        </Typography>
      </Box>

      {/* Messages list */}
      <Box sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
        <List>
          {messages.map((msg) => (
            <ListItem key={msg.id} sx={{ 
              justifyContent: msg.senderId === user.id ? 'flex-end' : 'flex-start',
              alignItems: 'flex-start'
            }}>
              {msg.senderId !== user.id && (
                <ListItemAvatar>
                  <Avatar src={msg.sender?.profileImage} />
                </ListItemAvatar>
              )}
              <Box sx={{
                bgcolor: msg.senderId === user.id ? 'primary.main' : 'grey.200',
                color: msg.senderId === user.id ? 'white' : 'text.primary',
                p: 1.5,
                borderRadius: 2,
                maxWidth: '70%',
                wordBreak: 'break-word'
              }}>
                <ListItemText 
                  primary={msg.content} 
                  secondary={new Date(msg.createdAt).toLocaleTimeString()} 
                  sx={{ 
                    color: msg.senderId === user.id ? 'white' : 'inherit',
                    '& .MuiListItemText-secondary': {
                      color: msg.senderId === user.id ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)'
                    }
                  }} 
                />
              </Box>
            </ListItem>
          ))}
          <div ref={messagesEndRef} />
        </List>
      </Box>

      {/* Message input */}
      <Box sx={{ p: 2, borderTop: '1px solid #e0e0e0' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Type a message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            multiline
            maxRows={4}
          />
          <IconButton 
            color="primary" 
            onClick={handleSendMessage}
            disabled={!message.trim()}
            sx={{ ml: 1 }}
          >
            <SendIcon />
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
};

export default ChatWindow;