// src/utils/socket.js
import { io } from 'socket.io-client';

const createSocketService = () => {
  let socket = null;
  const listeners = new Map();
  let validationTimeouts = {};
  let connectionAttempts = 0;
  const maxConnectionAttempts = 5;

  const clearAllValidationTimeouts = () => {
    Object.values(validationTimeouts).forEach(clearTimeout);
    validationTimeouts = {};
  };

  const connect = (queryParams = '?validation=true') => {
    if (!socket) {
      const socketUrl = `${import.meta.env.VITE_SOCKET_URL || 'http://localhost:3030'}${queryParams}`;
      
      console.log('Connecting to socket at:', socketUrl);
      
      socket = io(socketUrl, {
        withCredentials: true,  // Crucial for cookie auth
        autoConnect: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        transports: ['websocket'],
        timeout: 10000,
      });

      socket.on('connect', () => {
        console.log('Socket connected:', socket.id);
        connectionAttempts = 0;
      });

      socket.on('disconnect', (reason) => {
        console.log('Socket disconnected:', reason);
        clearAllValidationTimeouts();
      });

      socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error.message);
        clearAllValidationTimeouts();
        connectionAttempts++;
        
        if (connectionAttempts >= maxConnectionAttempts) {
          console.error('Max connection attempts reached');
        }
      });

      // Ping/pong monitoring
      socket.on('ping', () => console.debug('Socket ping'));
      socket.on('pong', (latency) => console.debug('Socket pong', latency));
    }
    return socket;
  };

  const disconnect = () => {
    if (socket) {
      clearAllValidationTimeouts();
      socket.disconnect();
      socket = null;
      listeners.clear();
      connectionAttempts = 0;
    }
  };

  const validateField = (field, value) => {
    return new Promise((resolve, reject) => {
      if (!socket?.connected) {
        socket = connect();
      }

      const requestId = Date.now().toString();

      if (validationTimeouts[field]) {
        clearTimeout(validationTimeouts[field]);
        delete validationTimeouts[field];
      }

      validationTimeouts[field] = setTimeout(() => {
        reject(new Error('Validation timeout'));
      }, 3000);

      socket.emit('validate-field', { field, value, requestId }, (response) => {
        clearTimeout(validationTimeouts[field]);
        delete validationTimeouts[field];
        
        if (response.error) {
          reject(new Error(response.error || 'Validation failed'));
        } else {
          resolve(response);
        }
      });
    });
  };

  return {
    connect,
    disconnect,
    validateField,
    clearAllValidationTimeouts
  };
};

const socketService = createSocketService();
export default socketService;






//! original
// src/utils/socket.js
// import { io } from 'socket.io-client';

// const createSocketService = () => {
//   let socket = null;
//   const listeners = new Map();
//   let validationTimeouts = {};
//   let connectionAttempts = 0;
//   const maxConnectionAttempts = 5;

//   const clearAllValidationTimeouts = () => {
//     Object.values(validationTimeouts).forEach(clearTimeout);
//     validationTimeouts = {};
//   };

//   const connect = (queryParams = '?validation=true') => {
//     if (!socket) {
//       const socketUrl = `${import.meta.env.VITE_SOCKET_URL || 'http://localhost:3030'}${queryParams}`;
      
//       console.log('Connecting to socket at:', socketUrl); // Debug log
      
//       socket = io(socketUrl, {
//         withCredentials: true,
//         autoConnect: true,
//         reconnectionAttempts: 5,
//         reconnectionDelay: 1000,
//         transports: ['websocket'], // Force WebSocket transport
//         timeout: 10000, // Increase connection timeout
//       });

//       socket.on('connect', () => {
//         console.log('Socket connected:', socket.id);
//         connectionAttempts = 0;
//       });

//       socket.on('disconnect', (reason) => {
//         console.log('Socket disconnected:', reason);
//         clearAllValidationTimeouts();
//       });

//       socket.on('connect_error', (error) => {
//         console.error('Socket connection error:', error.message);
//         clearAllValidationTimeouts();
//         connectionAttempts++;
        
//         if (connectionAttempts >= maxConnectionAttempts) {
//           console.error('Max connection attempts reached');
//           // You might want to trigger some UI notification here
//         }
//       });

//       // Add ping/pong monitoring
//       socket.on('ping', () => console.debug('Socket ping'));
//       socket.on('pong', (latency) => console.debug('Socket pong', latency));
//     }
//     return socket;
//   };

//   const disconnect = () => {
//     if (socket) {
//       clearAllValidationTimeouts();
//       socket.disconnect();
//       socket = null;
//       listeners.clear();
//       connectionAttempts = 0;
//     }
//   };

//   const validateField = (field, value) => {
//     return new Promise((resolve, reject) => {
//       if (!socket?.connected) {
//         socket = connect();
//       }

//       const requestId = Date.now().toString();

//       // Clear any previous validation for this field
//       if (validationTimeouts[field]) {
//         clearTimeout(validationTimeouts[field]);
//         delete validationTimeouts[field];
//       }

//       // Set timeout (3 seconds)
//       validationTimeouts[field] = setTimeout(() => {
//         reject(new Error('Validation timeout'));
//       }, 3000);

//       // Send validation request
//       socket.emit('validate-field', { field, value, requestId }, (response) => {
//         clearTimeout(validationTimeouts[field]);
//         delete validationTimeouts[field];
        
//         if (response.error) {
//           reject(new Error(response.error || 'Validation failed'));
//         } else {
//           resolve(response);
//         }
//       });
//     });
//   };

//   return {
//     connect,
//     disconnect,
//     validateField,
//     clearAllValidationTimeouts
//   };
// };

// // Singleton instance
// const socketService = createSocketService();

// export default socketService;