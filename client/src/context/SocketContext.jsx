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
//       console.log('Socket connected');
//     };

//     const onDisconnect = (reason) => {
//       setConnectionState('disconnected');
//       console.log('Socket disconnected:', reason);
//     };

//     const onConnecting = () => {
//       setConnectionState('connecting');
//     };

//     const onConnectError = (error) => {
//       setConnectionState('error');
//       console.error('Socket connection error:', error);
//     };

//     socket.on('connect', onConnect);
//     socket.on('disconnect', onDisconnect);
//     socket.on('connecting', onConnecting);
//     socket.on('connect_error', onConnectError);

//     return () => {
//       socket.off('connect', onConnect);
//       socket.off('disconnect', onDisconnect);
//       socket.off('connecting', onConnecting);
//       socket.off('connect_error', onConnectError);
//       socketService.disconnect();
//     };
//   }, []);

//   return (
//     <SocketContext.Provider value={{ 
//       socketService, 
//       isConnected: connectionState === 'connected', 
//       connectionState, // Now exposing the full state for more granular control
//       socketInstance 
//     }}>
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








