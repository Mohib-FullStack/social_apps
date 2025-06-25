// src/context/SocketContext.jsx
import { createContext, useContext, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import socketService from '../utils/socket';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [connectionState, setConnectionState] = useState('disconnected');
  const [socketInstance, setSocketInstance] = useState(null);
  
  // Get user ID from Redux to verify authentication status
  const userId = useSelector((state) => state.user?.profile?.id);

  useEffect(() => {
    // Only connect if we have a user ID (indicating authenticated session)
    if (!userId) return;

    // With cookie auth, we don't need to pass the token manually
    // The cookie will be sent automatically with the WebSocket connection
    const socket = socketService.connect();
    
    setSocketInstance(socket);

    const onConnect = () => {
      setConnectionState('connected');
      console.log('Socket connected with cookie authentication');
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
  }, [userId]); // Reconnect if user authentication status changes

  // Guest connection method (for unauthenticated flows like registration)
  const connectForGuest = (queryParams = {}) => {
    if (socketInstance) {
      socketService.disconnect();
    }
    const guestSocket = socketService.connect({}, queryParams);
    setSocketInstance(guestSocket);
    return guestSocket;
  };

  return (
    <SocketContext.Provider
      value={{
        socketService,
        isConnected: connectionState === 'connected',
        socketInstance,
        connectForGuest
      }}
    >
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

//! original
// // src/context/SocketContext.jsx
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
//     <SocketContext.Provider
//       value={{
//         socketService,
//         isConnected: connectionState === 'connected',
//         socketInstance,
//       }}
//     >
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
