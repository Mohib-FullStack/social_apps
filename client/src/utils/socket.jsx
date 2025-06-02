// src/utils/socket.jsx
import { io } from 'socket.io-client';
import { addNotification } from '../features/notification/notificationSlice';
import { store } from '../app/store';

class SocketService {
  static DEFAULT_CONFIG = {
    maxConnectionAttempts: 5,
    reconnectionDelay: 1000,
    connectionTimeout: 10000,
    validationTimeout: 3000,
    heartbeatInterval: 30000,
    baseUrl: import.meta.env.VITE_SOCKET_URL || 'http://localhost:3030',
    transports: ['websocket'],
  };

  constructor(config = {}) {
    this.config = { ...SocketService.DEFAULT_CONFIG, ...config };
    this.socket = null;
    this.listeners = new Map();
    this.validationTimeouts = new Map();
    this.connectionAttempts = 0;
    this.heartbeatInterval = null;
    this.connectionState = 'disconnected';
    this.reconnectTimer = null;
  }

  /**
   * Connects to the socket server with optional query parameters
   * @param {string} queryParams - Query parameters to append to the connection URL
   * @returns {Socket} The socket instance
   */
  connect(queryParams = '') {
    if (this.socket?.connected) {
      return this.socket;
    }

    this.cleanupExistingConnection();

    const socketUrl = `${this.config.baseUrl}${queryParams}`;
    
    this.socket = io(socketUrl, {
      withCredentials: true,
      autoConnect: true,
      reconnectionAttempts: this.config.maxConnectionAttempts,
      reconnectionDelay: this.config.reconnectionDelay,
      transports: this.config.transports,
      timeout: this.config.connectionTimeout,
    });

    this.setupEventHandlers();
    return this.socket;
  }

  // In src/utils/socket.jsx, add this method to the SocketService class
getSocket() {
  return this.socket;
}

  /**
   * Cleans up any existing connection before creating a new one
   */
  cleanupExistingConnection() {
    if (this.socket) {
      this.socket.removeAllListeners();
      if (this.socket.connected) {
        this.socket.disconnect();
      }
    }
    this.clearHeartbeat();
    this.clearReconnectTimer();
  }

  /**
   * Sets up all socket event handlers
   */
  setupEventHandlers() {
    this.setupConnectionHandlers();
    this.setupNotificationHandlers();
    this.setupHeartbeat();
  }

  /**
   * Sets up connection-related event handlers
   */
  setupConnectionHandlers() {
    this.socket.on('connect', () => {
      this.connectionState = 'connected';
      console.log('Socket connected:', this.socket.id);
      this.connectionAttempts = 0;
      this.clearReconnectTimer();
      this.setupHeartbeat();
    });

    this.socket.on('disconnect', (reason) => {
      this.connectionState = 'disconnected';
      console.log('Socket disconnected:', reason);
      this.cleanupOnDisconnect();
      
      if (reason === 'io server disconnect') {
        // The server forcefully disconnected the socket
        this.scheduleReconnect();
      }
    });

    this.socket.on('connect_error', (error) => {
      this.connectionState = 'error';
      console.error('Socket connection error:', error.message);
      this.handleConnectionFailure();
    });

    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
      this.showNotification({
        type: 'error',
        message: 'Socket connection error occurred'
      });
    });

    this.socket.on('reconnect_attempt', (attempt) => {
      console.log(`Reconnection attempt ${attempt}`);
    });

    this.socket.on('reconnect_failed', () => {
      console.error('Failed to reconnect socket');
      this.showNotification({
        type: 'error',
        message: 'Failed to reconnect to server. Please refresh the page.'
      });
    });
  }

  /**
   * Sets up notification event handlers
   */
  setupNotificationHandlers() {
    this.socket.on('friend_request', (data) => {
      this.handleFriendRequestNotification(data);
    });

    this.socket.on('friend_request_accepted', (data) => {
      this.handleFriendRequestAcceptedNotification(data);
    });

    // Add more notification handlers as needed
    this.socket.on('notification', (data) => {
      this.dispatchNotification({
        id: `notif_${Date.now()}`,
        ...data,
        isRead: false,
        createdAt: new Date().toISOString()
      });
    });
  }

  /**
   * Schedules a reconnection attempt
   */
  scheduleReconnect() {
    this.clearReconnectTimer();
    this.reconnectTimer = setTimeout(() => {
      this.connect();
    }, this.config.reconnectionDelay);
  }

  /**
   * Clears the reconnect timer
   */
  clearReconnectTimer() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  /**
   * Sets up heartbeat mechanism
   */
  setupHeartbeat() {
    this.clearHeartbeat();
    
    this.heartbeatInterval = setInterval(() => {
      if (this.isConnected) {
        this.socket.emit('heartbeat', { timestamp: Date.now() }, (response) => {
          if (!response?.success) {
            console.warn('Heartbeat failed, reconnecting...');
            this.socket.disconnect();
          }
        });
      }
    }, this.config.heartbeatInterval);
  }

  /**
   * Cleans up resources on disconnect
   */
  cleanupOnDisconnect() {
    this.clearAllValidationTimeouts();
    this.clearHeartbeat();
  }

  /**
   * Handles connection failure logic
   */
  handleConnectionFailure() {
    this.connectionAttempts++;
    
    if (this.connectionAttempts >= this.config.maxConnectionAttempts) {
      console.error('Max connection attempts reached');
      this.showNotification({
        type: 'error',
        message: 'Connection to server failed. Please try again later.'
      });
    }
  }

  /**
   * Handles friend request notifications
   * @param {Object} data - Notification data
   */
  handleFriendRequestNotification(data) {
    this.dispatchNotification({
      id: `friend_req_${data.friendshipId}`,
      type: 'friend_request',
      senderId: data.from,
      metadata: { friendshipId: data.friendshipId }
    });
  }

  /**
   * Handles friend request accepted notifications
   * @param {Object} data - Notification data
   */
  handleFriendRequestAcceptedNotification(data) {
    this.dispatchNotification({
      id: `friend_accept_${data.friendshipId}`,
      type: 'friend_request_accepted',
      senderId: data.acceptedBy,
      metadata: { friendshipId: data.friendshipId }
    });
  }

  /**
   * Dispatches a notification to the store
   * @param {Object} notification - Notification data
   */
  dispatchNotification(notification) {
    const completeNotification = {
      ...notification,
      isRead: false,
      createdAt: new Date().toISOString()
    };
    
    store.dispatch(addNotification(completeNotification));
  }

  /**
   * Displays a system notification in the UI
   * @param {Object} notification - Notification data
   */
  showNotification(notification) {
    this.dispatchNotification({
      id: `sys_${Date.now()}`,
      type: 'system',
      ...notification
    });
  }

  /**
   * Clears all pending validation timeouts
   */
  clearAllValidationTimeouts() {
    this.validationTimeouts.forEach((timeout) => clearTimeout(timeout));
    this.validationTimeouts.clear();
  }

  /**
   * Clears the heartbeat interval
   */
  clearHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  /**
   * Validates a field value with the server
   * @param {string} field - Field name to validate
   * @param {string} value - Field value to validate
   * @returns {Promise} Resolves with validation response or rejects with error
   */
  async validateField(field, value) {
    if (!this.isConnected) {
      await this.ensureConnection();
    }

    const requestId = Date.now().toString();

    // Clear any previous validation for this field
    if (this.validationTimeouts.has(field)) {
      clearTimeout(this.validationTimeouts.get(field));
      this.validationTimeouts.delete(field);
    }

    return new Promise((resolve, reject) => {
      // Set timeout for validation response
      this.validationTimeouts.set(field, setTimeout(() => {
        reject(new Error('Validation timeout'));
        this.validationTimeouts.delete(field);
      }, this.config.validationTimeout));

      // Send validation request
      this.socket.emit('validate-field', { field, value, requestId }, (response) => {
        clearTimeout(this.validationTimeouts.get(field));
        this.validationTimeouts.delete(field);
        
        if (response?.error) {
          reject(new Error(response.error));
        } else {
          resolve(response);
        }
      });
    });
  }

  /**
   * Ensures we have an active connection
   * @returns {Promise} Resolves when connected
   */
  ensureConnection() {
    return new Promise((resolve, reject) => {
      if (this.isConnected) {
        resolve();
        return;
      }

      this.connect();
      
      const connectHandler = () => {
        this.socket.off('connect', connectHandler);
        this.socket.off('connect_error', errorHandler);
        resolve();
      };

      const errorHandler = (error) => {
        this.socket.off('connect', connectHandler);
        this.socket.off('connect_error', errorHandler);
        reject(error);
      };

      this.socket.on('connect', connectHandler);
      this.socket.on('connect_error', errorHandler);
    });
  }

  /**
   * Registers an event listener
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   */
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);
    this.socket?.on(event, callback);
  }

  /**
   * Removes an event listener
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   */
  off(event, callback) {
    const listeners = this.listeners.get(event);
    if (listeners) {
      listeners.delete(callback);
      this.socket?.off(event, callback);
      if (listeners.size === 0) {
        this.listeners.delete(event);
      }
    }
  }

  /**
   * Emits an event to the server
   * @param {string} event - Event name
   * @param {any} data - Data to send
   * @param {Function} [ack] - Acknowledgement callback
   * @returns {Promise} Promise that resolves when the event is acknowledged
   */
  emit(event, data, ack) {
    return new Promise((resolve, reject) => {
      if (!this.isConnected) {
        this.connect();
      }

      const callback = (response) => {
        if (response?.error) {
          reject(new Error(response.error));
        } else {
          resolve(response);
        }
      };

      if (ack) {
        this.socket.emit(event, data, (response) => {
          ack(response);
          callback(response);
        });
      } else {
        this.socket.emit(event, data, callback);
      }
    });
  }

  /**
   * Disconnects the socket and cleans up resources
   */
  disconnect() {
    if (this.socket) {
      this.cleanupOnDisconnect();
      this.socket.disconnect();
      this.socket.removeAllListeners();
      this.socket = null;
      this.listeners.clear();
      this.connectionAttempts = 0;
      this.connectionState = 'disconnected';
      this.clearReconnectTimer();
    }
  }

  /**
   * Gets the current connection state
   * @returns {boolean} True if socket is connected
   */
  get isConnected() {
    return this.socket?.connected && this.connectionState === 'connected';
  }

  /**
   * Gets the socket ID if connected
   * @returns {string|null} Socket ID or null if disconnected
   */
  get socketId() {
    return this.socket?.id || null;
  }
}

// Singleton instance
const socketService = new SocketService();

export default socketService;




//! original
// src/utils/socket.js
// import { io } from 'socket.io-client';

// class SocketService {
//   constructor() {
//     this.socket = null;
//     this.listeners = new Map();
//     this.validationTimeouts = {};
//     this.connectionAttempts = 0;
//     this.maxConnectionAttempts = 5;
//   }

//   connect(queryParams = '?validation=true') {
//     if (!this.socket) {
//       const socketUrl = `${import.meta.env.VITE_SOCKET_URL || 'http://localhost:3030'}${queryParams}`;
//       console.log('Connecting to socket at:', socketUrl); // Debug log
      
//       this.socket = io(socketUrl, {
//         withCredentials: true,
//         autoConnect: true,
//         reconnectionAttempts: 5,
//         reconnectionDelay: 1000,
//         transports: ['websocket'], // Force WebSocket transport
//         timeout: 10000, // Increase connection timeout
//       });

//       this.socket.on('connect', () => {
//         console.log('Socket connected:', this.socket.id);
//         this.connectionAttempts = 0;
//       });

//       this.socket.on('disconnect', (reason) => {
//         console.log('Socket disconnected:', reason);
//         this.clearAllValidationTimeouts();
//       });

//       this.socket.on('connect_error', (error) => {
//         console.error('Socket connection error:', error.message);
//         this.clearAllValidationTimeouts();
//         this.connectionAttempts++;
        
//         if (this.connectionAttempts >= this.maxConnectionAttempts) {
//           console.error('Max connection attempts reached');
//           // You might want to trigger some UI notification here
//         }
//       });

//       // Add ping/pong monitoring
//       this.socket.on('ping', () => console.debug('Socket ping'));
//       this.socket.on('pong', (latency) => console.debug('Socket pong', latency));
//     }
//     return this.socket;
//   }

//   disconnect() {
//     if (this.socket) {
//       this.clearAllValidationTimeouts();
//       this.socket.disconnect();
//       this.socket = null;
//       this.listeners.clear();
//       this.connectionAttempts = 0;
//     }
//   }

//   clearAllValidationTimeouts() {
//     Object.values(this.validationTimeouts).forEach(clearTimeout);
//     this.validationTimeouts = {};
//   }

//   validateField(field, value) {
//     return new Promise((resolve, reject) => {
//       if (!this.socket?.connected) {
//         this.socket = this.connect();
//       }

//       const requestId = Date.now().toString();

//       // Clear any previous validation for this field
//       if (this.validationTimeouts[field]) {
//         clearTimeout(this.validationTimeouts[field]);
//         delete this.validationTimeouts[field];
//       }

//       // Set timeout (3 seconds)
//       this.validationTimeouts[field] = setTimeout(() => {
//         reject(new Error('Validation timeout'));
//       }, 3000);

//       // Send validation request
//       this.socket.emit('validate-field', { field, value, requestId }, (response) => {
//         clearTimeout(this.validationTimeouts[field]);
//         delete this.validationTimeouts[field];
        
//         if (response.error) {
//           reject(new Error(response.error || 'Validation failed'));
//         } else {
//           resolve(response);
//         }
//       });
//     });
//   }
// }

// // Singleton instance
// const socketService = new SocketService();

// export default socketService;







