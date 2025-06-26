// src/components/Chat/MessageModal.jsx

import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import {
    Avatar,
    Box,
    Button,
    Dialog,
    DialogContent,
    DialogTitle,
    IconButton,
    TextField,
    Typography,
} from '@mui/material';
import axios from 'axios';
import { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { useSocket } from '../../context/SocketContext';

const MessageModal = ({ open, onClose, friend }) => {
  const { socketInstance } = useSocket();
  const currentUser = useSelector((state) => state.user.profile);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!open || !friend?.id || !currentUser?.id) return;

    // Load message history from server
    const fetchHistory = async () => {
      try {
        const res = await axios.get(`/api/messages/conversation/${currentUser.id}/${friend.id}`);
        setMessages(res.data);
      } catch (err) {
        console.error('Failed to fetch messages:', err);
      }
    };

    fetchHistory();
  }, [open, friend?.id, currentUser?.id]);

  useEffect(() => {
    if (!socketInstance || !friend?.id) return;

    const handleNewMessage = (msg) => {
      if (
        msg.senderId === friend.id ||
        (msg.senderId === currentUser.id && msg.receiverId === friend.id)
      ) {
        setMessages((prev) => [...prev, msg]);
      }
    };

    socketInstance.on('private_message', handleNewMessage);
    return () => socketInstance.off('private_message', handleNewMessage);
  }, [socketInstance, friend?.id, currentUser?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!message.trim()) return;

    const payload = {
      senderId: currentUser.id,
      receiverId: friend.id,
      content: message,
    };

    socketInstance.emit('private_message', payload);
    setMessages((prev) => [...prev, { ...payload, senderId: currentUser.id }]);
    setMessage('');
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Avatar src={friend.profileImage || '/default-avatar.png'} />
        <Typography variant="h6">{friend.firstName} {friend.lastName}</Typography>
        <Box flexGrow={1} />
        <IconButton onClick={onClose}><CloseIcon /></IconButton>
      </DialogTitle>

      <DialogContent>
        <Box
          sx={{
            maxHeight: '300px',
            overflowY: 'auto',
            mb: 2,
            px: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
          }}
        >
          {messages.map((msg, i) => (
            <Box
              key={i}
              alignSelf={msg.senderId === currentUser.id ? 'flex-end' : 'flex-start'}
              sx={{
                bgcolor: msg.senderId === currentUser.id ? 'primary.main' : 'grey.300',
                color: msg.senderId === currentUser.id ? 'white' : 'black',
                p: 1.2,
                borderRadius: 2,
                maxWidth: '70%',
              }}
            >
              {msg.content}
            </Box>
          ))}
          <div ref={messagesEndRef} />
        </Box>

        <Box display="flex" gap={1}>
          <TextField
            fullWidth
            size="small"
            variant="outlined"
            placeholder="Type a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
          <Button onClick={handleSend} variant="contained" endIcon={<SendIcon />}>
            Send
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default MessageModal;
