// pages/ChatPage.jsx
import { Box, Grid, Paper, Typography } from '@mui/material';
import { useState } from 'react';
import ChatList from './ChatList';
import ChatWindow from './ChatWindow';

const ChatPage = () => {
  const [selectedChat, setSelectedChat] = useState(null);

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
        Messages
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ height: '80vh', overflow: 'auto' }}>
            <ChatList onSelectChat={setSelectedChat} />
          </Paper>
        </Grid>
        <Grid item xs={12} md={8}>
          <Paper sx={{ height: '80vh' }}>
            {selectedChat ? (
              <ChatWindow chatId={selectedChat} />
            ) : (
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                height: '100%',
                textAlign: 'center'
              }}>
                <Typography variant="h6" color="text.secondary">
                  Select a chat to start messaging
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ChatPage;