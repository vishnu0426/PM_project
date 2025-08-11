/**
 * WebSocket Service for Real-time Collaboration
 * Handles real-time updates, collaborative editing, and live notifications
 */

class WebSocketService {
  constructor() {
    this.ws = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
    this.listeners = new Map();
    this.isConnected = false;
    this.currentUser = null;
    this.currentProject = null;
    this.heartbeatInterval = null;
  }

  /**
   * Initialize WebSocket connection
   */
  connect(token, userId, projectId = null) {
    // Prevent connection if missing required params
    if (!token || !userId) {
      const msg = `WebSocket not connecting: missing token or userId (token=${
        token ? 'present' : 'null'
      }, userId=${userId})`;
      console.warn(msg);
      // Don't reject, just return resolved promise to avoid breaking the app
      return Promise.resolve();
    }
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      try {
        const wsUrl = `${
          process.env.REACT_APP_WS_URL || 'ws://localhost:3001'
        }/ws`;
        this.ws = new WebSocket(
          `${wsUrl}?token=${token}&userId=${userId}&projectId=${
            projectId || ''
          }`
        );

        this.currentUser = userId;
        this.currentProject = projectId;

        this.ws.onopen = () => {
          console.log('WebSocket connected');
          this.isConnected = true;
          this.reconnectAttempts = 0;
          this.startHeartbeat();
          this.emit('connected');
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            this.handleMessage(data);
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        };

        this.ws.onclose = (event) => {
          console.log('WebSocket disconnected:', event.code, event.reason);
          this.isConnected = false;
          this.stopHeartbeat();
          this.emit('disconnected', { code: event.code, reason: event.reason });

          if (
            !event.wasClean &&
            this.reconnectAttempts < this.maxReconnectAttempts
          ) {
            this.scheduleReconnect();
          }
        };

        this.ws.onerror = (event) => {
          let errorMsg = 'WebSocket error';
          if (event && event.message) errorMsg += ': ' + event.message;
          console.warn(
            errorMsg +
              " (this is normal if backend doesn't support WebSockets)",
            event
          );
          // Clean up connection and prevent hangs
          if (this.ws && this.ws.readyState !== WebSocket.CLOSED) {
            try {
              this.ws.close();
            } catch (e) {
              // ignore
            }
            this.ws = null;
          }
          this.isConnected = false;
          this.stopHeartbeat();
          this.emit('error', errorMsg);
          // Always resolve to avoid hanging Promises
          resolve();
        };
      } catch (error) {
        console.error('Failed to create WebSocket connection:', error);
        reject(error);
      }
    });
  }

  /**
   * Disconnect WebSocket
   */
  disconnect() {
    if (this.ws) {
      this.ws.close(1000, 'Client disconnect');
      this.ws = null;
    }
    this.stopHeartbeat();
    this.isConnected = false;
  }

  /**
   * Schedule reconnection attempt
   */
  scheduleReconnect() {
    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

    console.log(
      `Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`
    );

    setTimeout(() => {
      if (this.currentUser) {
        this.connect(
          localStorage.getItem('accessToken'),
          this.currentUser,
          this.currentProject
        );
      }
    }, delay);
  }

  /**
   * Start heartbeat to keep connection alive
   */
  startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      if (this.isConnected) {
        this.send('ping', {});
      }
    }, 30000); // Send ping every 30 seconds
  }

  /**
   * Stop heartbeat
   */
  stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  /**
   * Handle incoming WebSocket messages
   */
  handleMessage(data) {
    const { type, payload, userId, timestamp } = data;

    // Don't process messages from the current user
    if (userId === this.currentUser) {
      return;
    }

    switch (type) {
      case 'project_updated':
        this.emit('projectUpdated', payload);
        break;

      case 'task_updated':
        this.emit('taskUpdated', payload);
        break;

      case 'workflow_updated':
        this.emit('workflowUpdated', payload);
        break;

      case 'user_joined':
        this.emit('userJoined', payload);
        break;

      case 'user_left':
        this.emit('userLeft', payload);
        break;

      case 'collaborative_edit':
        this.emit('collaborativeEdit', payload);
        break;

      case 'notification':
        this.emit('notification', payload);
        break;

      case 'conflict_detected':
        this.emit('conflictDetected', payload);
        break;

      case 'pong':
        // Heartbeat response
        break;

      default:
        console.log('Unknown message type:', type);
    }
  }

  /**
   * Send message through WebSocket
   */
  send(type, payload) {
    if (!this.isConnected || !this.ws) {
      console.warn('WebSocket not connected, cannot send message');
      return false;
    }

    try {
      const message = {
        type,
        payload,
        userId: this.currentUser,
        projectId: this.currentProject,
        timestamp: Date.now(),
      };

      this.ws.send(JSON.stringify(message));
      return true;
    } catch (error) {
      console.error('Error sending WebSocket message:', error);
      return false;
    }
  }

  /**
   * Join a project room for real-time updates
   */
  joinProject(projectId) {
    this.currentProject = projectId;
    this.send('join_project', { projectId });
  }

  /**
   * Leave current project room
   */
  leaveProject() {
    if (this.currentProject) {
      this.send('leave_project', { projectId: this.currentProject });
      this.currentProject = null;
    }
  }

  /**
   * Send project update notification
   */
  notifyProjectUpdate(projectData) {
    this.send('project_updated', projectData);
  }

  /**
   * Send task update notification
   */
  notifyTaskUpdate(taskData) {
    this.send('task_updated', taskData);
  }

  /**
   * Send workflow update notification
   */
  notifyWorkflowUpdate(workflowData) {
    this.send('workflow_updated', workflowData);
  }

  /**
   * Send collaborative editing update
   */
  notifyCollaborativeEdit(editData) {
    this.send('collaborative_edit', editData);
  }

  /**
   * Report conflict detection
   */
  reportConflict(conflictData) {
    this.send('conflict_detected', conflictData);
  }

  /**
   * Add event listener
   */
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  /**
   * Remove event listener
   */
  off(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  /**
   * Emit event to listeners
   */
  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          console.error('Error in event listener:', error);
        }
      });
    }
  }

  /**
   * Get connection status
   */
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      reconnectAttempts: this.reconnectAttempts,
      currentUser: this.currentUser,
      currentProject: this.currentProject,
    };
  }
}

// Create singleton instance
const websocketService = new WebSocketService();

export default websocketService;
