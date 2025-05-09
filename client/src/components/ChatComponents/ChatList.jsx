// components/Chat/ChatList.jsx
import { List, ListItem, ListItemAvatar, Avatar, ListItemText, Typography, Badge } from '@mui/material';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../../axiosInstance';
import { useSelector } from 'react-redux';

const ChatList = () => {
  const [chats, setChats] = useState([]);
  const { user } = useSelector((state) => state.user);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const response = await axiosInstance.get('/api/chats');
        setChats(response.data.payload);
      } catch (error) {
        console.error('Error fetching chats:', error);
      }
    };

    fetchChats();
  }, []);

  const getOtherParticipant = (chat) => {
    return chat.participants.find(p => p.id !== user.id);
  };

  const formatLastMessage = (message) => {
    if (!message) return 'No messages yet';
    return message.length > 30 ? `${message.substring(0, 30)}...` : message;
  };

  return (
    <List sx={{ width: '100%' }}>
      {chats.map((chat) => {
        const otherUser = getOtherParticipant(chat);
        const lastMessage = chat.messages?.[0]?.content || '';

        return (
          <ListItem 
            key={chat.id} 
            button 
            onClick={() => navigate(`/chat/${chat.id}`)}
            sx={{
              '&:hover': {
                backgroundColor: 'action.hover'
              }
            }}
          >
            <ListItemAvatar>
              <Badge
                overlap="circular"
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                variant="dot"
                color="primary"
                invisible={!chat.unreadCount}
              >
                <Avatar src={otherUser?.profileImage} />
              </Badge>
            </ListItemAvatar>
            <ListItemText
              primary={`${otherUser?.firstName} ${otherUser?.lastName}`}
              secondary={formatLastMessage(lastMessage)}
              secondaryTypographyProps={{
                noWrap: true,
                color: 'text.secondary'
              }}
            />
            <Typography variant="caption" color="text.secondary">
              {chat.lastMessageAt ? new Date(chat.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
            </Typography>
          </ListItem>
        );
      })}
    </List>
  );
};

export default ChatList;