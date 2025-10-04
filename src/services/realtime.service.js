// Real-time data service for admin panel
class RealTimeService {
  constructor() {
    this.ws = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
    this.listeners = new Map();
  }

  // Connect to WebSocket server
  connect() {
    try {
      const wsUrl = process.env.REACT_APP_WS_URL || 'ws://localhost:5000';
      this.ws = new WebSocket(`${wsUrl}/admin-realtime`);
      
      this.ws.onopen = () => {
        console.log('Real-time connection established');
        this.reconnectAttempts = 0;
        
        // Send authentication
        const token = localStorage.getItem('token');
        if (token) {
          this.ws.send(JSON.stringify({ type: 'auth', token }));
        }
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleMessage(data);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      this.ws.onclose = () => {
        console.log('Real-time connection closed');
        this.attemptReconnect();
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

    } catch (error) {
      console.error('Failed to establish WebSocket connection:', error);
      this.fallbackToPolling();
    }
  }

  // Handle incoming messages
  handleMessage(data) {
    const { type, payload } = data;
    
    // Notify all listeners for this event type
    if (this.listeners.has(type)) {
      this.listeners.get(type).forEach(callback => {
        try {
          callback(payload);
        } catch (error) {
          console.error('Error in listener callback:', error);
        }
      });
    }
  }

  // Subscribe to real-time events
  subscribe(eventType, callback) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    this.listeners.get(eventType).add(callback);

    // Return unsubscribe function
    return () => {
      if (this.listeners.has(eventType)) {
        this.listeners.get(eventType).delete(callback);
      }
    };
  }

  // Attempt to reconnect
  attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      
      setTimeout(() => {
        this.connect();
      }, this.reconnectDelay * this.reconnectAttempts);
    } else {
      console.log('Max reconnection attempts reached. Falling back to polling.');
      this.fallbackToPolling();
    }
  }

  // Fallback to HTTP polling when WebSocket fails
  fallbackToPolling() {
    console.log('Starting HTTP polling fallback');
    
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch('/api/admin/live-updates', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const updates = await response.json();
          
          // Simulate WebSocket messages for each update
          updates.forEach(update => {
            this.handleMessage(update);
          });
        }
      } catch (error) {
        console.error('Polling error:', error);
      }
    }, 5000); // Poll every 5 seconds

    // Store interval ID for cleanup
    this.pollInterval = pollInterval;
  }

  // Send message to server
  send(message) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  }

  // Disconnect and cleanup
  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
    
    this.listeners.clear();
  }

  // Get current connection status
  getStatus() {
    if (this.ws) {
      switch (this.ws.readyState) {
        case WebSocket.CONNECTING:
          return 'connecting';
        case WebSocket.OPEN:
          return 'connected';
        case WebSocket.CLOSING:
          return 'closing';
        case WebSocket.CLOSED:
          return 'closed';
        default:
          return 'unknown';
      }
    }
    return this.pollInterval ? 'polling' : 'disconnected';
  }
}

// Create singleton instance
const realTimeService = new RealTimeService();

// Auto-connect when service is imported
if (typeof window !== 'undefined') {
  realTimeService.connect();
}

export default realTimeService;