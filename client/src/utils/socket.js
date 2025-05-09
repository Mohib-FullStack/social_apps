// src/utils/socket.js
import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
    this.validationTimeouts = {};
    this.connectionAttempts = 0;
    this.maxConnectionAttempts = 5;
  }

  connect() {
    if (!this.socket) {
      const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3030';
      console.log('Connecting to socket at:', socketUrl); // Debug log
      
      this.socket = io(socketUrl, {
        withCredentials: true,
        autoConnect: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        transports: ['websocket'], // Force WebSocket transport
        timeout: 10000, // Increase connection timeout
      });

      this.socket.on('connect', () => {
        console.log('Socket connected:', this.socket.id);
        this.connectionAttempts = 0;
      });

      this.socket.on('disconnect', (reason) => {
        console.log('Socket disconnected:', reason);
        this.clearAllValidationTimeouts();
      });

      this.socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error.message);
        this.clearAllValidationTimeouts();
        this.connectionAttempts++;
        
        if (this.connectionAttempts >= this.maxConnectionAttempts) {
          console.error('Max connection attempts reached');
          // You might want to trigger some UI notification here
        }
      });

      // Add ping/pong monitoring
      this.socket.on('ping', () => console.debug('Socket ping'));
      this.socket.on('pong', (latency) => console.debug('Socket pong', latency));
    }
    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.clearAllValidationTimeouts();
      this.socket.disconnect();
      this.socket = null;
      this.listeners.clear();
      this.connectionAttempts = 0;
    }
  }

  clearAllValidationTimeouts() {
    Object.values(this.validationTimeouts).forEach(clearTimeout);
    this.validationTimeouts = {};
  }

  validateField(field, value) {
    return new Promise((resolve, reject) => {
      if (!this.socket?.connected) {
        return reject(new Error('Socket not connected'));
      }

      const requestId = Date.now().toString();

      // Clear any previous validation for this field
      if (this.validationTimeouts[field]) {
        clearTimeout(this.validationTimeouts[field]);
        delete this.validationTimeouts[field];
      }

      // Set timeout (3 seconds)
      this.validationTimeouts[field] = setTimeout(() => {
        reject(new Error('Validation timeout'));
      }, 3000);

      // Send validation request
      this.socket.emit('validate-field', { field, value, requestId }, (response) => {
        clearTimeout(this.validationTimeouts[field]);
        delete this.validationTimeouts[field];
        
        if (response.error) {
          reject(new Error(response.error || 'Validation failed'));
        } else {
          resolve(response);
        }
      });
    });
  }
}

// Singleton instance
const socketService = new SocketService();

export default socketService;






