import { createContext, useState, useEffect } from 'react';
import { useSocket } from './SocketContext';

export const ChatContext = createContext();

 const ChatProvider = ({ children }) => {
  const [activeChats, setActiveChats] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const { socket } = useSocket();

  useEffect(() => {
    if (!socket) return;

    socket.on('userOnline', ({ userId }) => {
      setOnlineUsers(prev => [...prev, userId]);
    });

    socket.on('userOffline', ({ userId }) => {
      setOnlineUsers(prev => prev.filter(id => id !== userId));
    });

    return () => {
      socket.off('userOnline');
      socket.off('userOffline');
    };
  }, [socket]);

  return (
    <ChatContext.Provider value={{ activeChats, onlineUsers }}>
      {children}
    </ChatContext.Provider>
  );
};


export default ChatContext