// src/context/SocketContext.jsx
import { createContext, useContext, useEffect, useState } from 'react';
import socketService from '../utils/socket';
import { useDispatch } from 'react-redux';
import { addNotification } from '../features/notification/notificationSlice';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [connectionState, setConnectionState] = useState('disconnected');
  const dispatch = useDispatch();

  useEffect(() => {
    const socket = socketService.getSocket();
    
    if (!socket) return;

    const handleNotification = (type, data) => {
      dispatch(addNotification({
        type,
        senderId: data.from || data.acceptedBy,
        metadata: { friendshipId: data.friendshipId },
        isRead: false,
        createdAt: new Date().toISOString()
      }));
    };

    const onConnect = () => {
      setConnectionState('connected');
      console.log('Socket connected');
      
      // Notification listeners
      socket.on('friend_request', (data) => handleNotification('friend_request', data));
      socket.on('friend_request_accepted', (data) => handleNotification('friend_request_accepted', data));
    };

    const onDisconnect = () => {
      setConnectionState('disconnected');
      socket.off('friend_request');
      socket.off('friend_request_accepted');
    };

    const handleError = (err) => {
      console.error('Socket error:', err);
      setConnectionState('error');
    };

    const onReconnecting = () => {
      setConnectionState('reconnecting');
    };

    // Event listeners
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('connect_error', handleError);
    socket.on('error', handleError);
    socket.on('reconnecting', onReconnecting);

    // Initial connection
    if (socket.connected) onConnect();

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('connect_error', handleError);
      socket.off('error', handleError);
      socket.off('reconnecting', onReconnecting);
    };
  }, [dispatch]);

  return (
    <SocketContext.Provider value={{ 
      socketService,
      isConnected: connectionState === 'connected',
      connectionState 
    }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);






//! original
// src/context/SocketContext.jsx
// import { createContext, useContext, useEffect, useState } from 'react';
// import socketService from '../utils/socket';

// const SocketContext = createContext();

// export const SocketProvider = ({ children }) => {
//   const [connectionState, setConnectionState] = useState('disconnected');
//   const [socketInstance, setSocketInstance] = useState(null);

//   useEffect(() => {
//     const socket = socketService.connect();
//     setSocketInstance(socket);

//     const onConnect = () => {
//       setConnectionState('connected');
//     };

//     const onDisconnect = () => {
//       setConnectionState('disconnected');
//     };

//     const onConnecting = () => {
//       setConnectionState('connecting');
//     };

//     socket.on('connect', onConnect);
//     socket.on('disconnect', onDisconnect);
//     socket.on('connecting', onConnecting);

//     return () => {
//       socket.off('connect', onConnect);
//       socket.off('disconnect', onDisconnect);
//       socket.off('connecting', onConnecting);
//       socketService.disconnect();
//     };
//   }, []);

//   return (
//     <SocketContext.Provider value={{ socketService, isConnected: connectionState === 'connected', socketInstance }}>
//       {children}
//     </SocketContext.Provider>
//   );
// };

// export const useSocket = () => {
//   const context = useContext(SocketContext);
//   if (!context) {
//     throw new Error('useSocket must be used within a SocketProvider');
//   }
//   return context;
// };








