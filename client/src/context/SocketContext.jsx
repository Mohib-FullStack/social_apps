//! original
// src/context/SocketContext.jsx
import { createContext, useContext, useEffect, useState } from 'react';
import socketService from '../utils/socket';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [connectionState, setConnectionState] = useState('disconnected');
  const [socketInstance, setSocketInstance] = useState(null);

  useEffect(() => {
    const socket = socketService.connect();
    setSocketInstance(socket);

    const onConnect = () => {
      setConnectionState('connected');
    };

    const onDisconnect = () => {
      setConnectionState('disconnected');
    };

    const onConnecting = () => {
      setConnectionState('connecting');
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('connecting', onConnecting);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('connecting', onConnecting);
      socketService.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socketService, isConnected: connectionState === 'connected', socketInstance }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};








