import websocketService from '../websocketService';

// Mock WebSocket
global.WebSocket = jest.fn().mockImplementation(() => ({
  close: jest.fn(),
  send: jest.fn(),
  readyState: WebSocket.OPEN,
  addEventListener: jest.fn(),
  removeEventListener: jest.fn()
}));

// Mock WebSocket constants
WebSocket.OPEN = 1;
WebSocket.CLOSED = 3;
WebSocket.CONNECTING = 0;
WebSocket.CLOSING = 2;

describe('WebSocketService', () => {
  let mockWebSocket;

  beforeEach(() => {
    jest.clearAllMocks();
    mockWebSocket = {
      close: jest.fn(),
      send: jest.fn(),
      readyState: WebSocket.OPEN,
      onopen: null,
      onmessage: null,
      onclose: null,
      onerror: null
    };
    global.WebSocket = jest.fn(() => mockWebSocket);
    
    // Reset service state
    websocketService.disconnect();
    websocketService.listeners.clear();
  });

  afterEach(() => {
    websocketService.disconnect();
  });

  describe('connect', () => {
    it('creates WebSocket connection with correct URL', async () => {
      const token = 'test-token';
      const userId = 'user-123';
      const projectId = 'project-456';

      const connectPromise = websocketService.connect(token, userId, projectId);
      
      expect(global.WebSocket).toHaveBeenCalledWith(
        expect.stringContaining(`token=${token}&userId=${userId}&projectId=${projectId}`)
      );

      // Simulate connection open
      mockWebSocket.onopen();
      
      await connectPromise;
      
      expect(websocketService.isConnected).toBe(true);
    });

    it('handles connection without projectId', async () => {
      const token = 'test-token';
      const userId = 'user-123';

      const connectPromise = websocketService.connect(token, userId);
      
      expect(global.WebSocket).toHaveBeenCalledWith(
        expect.stringContaining(`token=${token}&userId=${userId}&projectId=`)
      );

      mockWebSocket.onopen();
      await connectPromise;
    });

    it('rejects promise on connection error', async () => {
      const token = 'test-token';
      const userId = 'user-123';

      const connectPromise = websocketService.connect(token, userId);
      
      const error = new Error('Connection failed');
      mockWebSocket.onerror(error);
      
      await expect(connectPromise).rejects.toThrow('Connection failed');
    });

    it('returns existing connection if already open', async () => {
      websocketService.ws = { readyState: WebSocket.OPEN };
      
      const result = await websocketService.connect('token', 'user');
      
      expect(global.WebSocket).not.toHaveBeenCalled();
    });
  });

  describe('disconnect', () => {
    it('closes WebSocket connection', () => {
      websocketService.ws = mockWebSocket;
      websocketService.isConnected = true;

      websocketService.disconnect();

      expect(mockWebSocket.close).toHaveBeenCalledWith(1000, 'Client disconnect');
      expect(websocketService.isConnected).toBe(false);
      expect(websocketService.ws).toBeNull();
    });

    it('handles disconnect when no connection exists', () => {
      websocketService.ws = null;
      
      expect(() => websocketService.disconnect()).not.toThrow();
    });
  });

  describe('message handling', () => {
    beforeEach(() => {
      websocketService.currentUser = 'user-123';
      websocketService.isConnected = true;
      websocketService.ws = mockWebSocket;
    });

    it('handles project_updated message', () => {
      const listener = jest.fn();
      websocketService.on('projectUpdated', listener);

      const message = {
        type: 'project_updated',
        payload: { projectId: 'project-123' },
        userId: 'other-user',
        timestamp: Date.now()
      };

      websocketService.handleMessage(message);

      expect(listener).toHaveBeenCalledWith(message.payload);
    });

    it('ignores messages from current user', () => {
      const listener = jest.fn();
      websocketService.on('projectUpdated', listener);

      const message = {
        type: 'project_updated',
        payload: { projectId: 'project-123' },
        userId: 'user-123', // Same as current user
        timestamp: Date.now()
      };

      websocketService.handleMessage(message);

      expect(listener).not.toHaveBeenCalled();
    });

    it('handles user_joined message', () => {
      const listener = jest.fn();
      websocketService.on('userJoined', listener);

      const message = {
        type: 'user_joined',
        payload: { userId: 'new-user' },
        userId: 'new-user',
        timestamp: Date.now()
      };

      websocketService.handleMessage(message);

      expect(listener).toHaveBeenCalledWith(message.payload);
    });

    it('handles unknown message types gracefully', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      const message = {
        type: 'unknown_type',
        payload: {},
        userId: 'other-user',
        timestamp: Date.now()
      };

      websocketService.handleMessage(message);

      expect(consoleSpy).toHaveBeenCalledWith('Unknown message type:', 'unknown_type');
      consoleSpy.mockRestore();
    });
  });

  describe('send', () => {
    beforeEach(() => {
      websocketService.isConnected = true;
      websocketService.ws = mockWebSocket;
      websocketService.currentUser = 'user-123';
      websocketService.currentProject = 'project-456';
    });

    it('sends message with correct format', () => {
      const type = 'test_message';
      const payload = { data: 'test' };

      const result = websocketService.send(type, payload);

      expect(result).toBe(true);
      expect(mockWebSocket.send).toHaveBeenCalledWith(
        JSON.stringify({
          type,
          payload,
          userId: 'user-123',
          projectId: 'project-456',
          timestamp: expect.any(Number)
        })
      );
    });

    it('returns false when not connected', () => {
      websocketService.isConnected = false;

      const result = websocketService.send('test', {});

      expect(result).toBe(false);
      expect(mockWebSocket.send).not.toHaveBeenCalled();
    });

    it('handles send errors gracefully', () => {
      mockWebSocket.send.mockImplementation(() => {
        throw new Error('Send failed');
      });

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const result = websocketService.send('test', {});

      expect(result).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith('Error sending WebSocket message:', expect.any(Error));
      
      consoleSpy.mockRestore();
    });
  });

  describe('project management', () => {
    beforeEach(() => {
      websocketService.isConnected = true;
      websocketService.ws = mockWebSocket;
    });

    it('joins project room', () => {
      const projectId = 'project-123';

      websocketService.joinProject(projectId);

      expect(websocketService.currentProject).toBe(projectId);
      expect(mockWebSocket.send).toHaveBeenCalledWith(
        expect.stringContaining('"type":"join_project"')
      );
    });

    it('leaves project room', () => {
      websocketService.currentProject = 'project-123';

      websocketService.leaveProject();

      expect(mockWebSocket.send).toHaveBeenCalledWith(
        expect.stringContaining('"type":"leave_project"')
      );
      expect(websocketService.currentProject).toBeNull();
    });
  });

  describe('event listeners', () => {
    it('adds event listeners', () => {
      const listener = jest.fn();

      websocketService.on('test', listener);

      expect(websocketService.listeners.get('test')).toContain(listener);
    });

    it('removes event listeners', () => {
      const listener = jest.fn();
      websocketService.on('test', listener);

      websocketService.off('test', listener);

      expect(websocketService.listeners.get('test')).not.toContain(listener);
    });

    it('emits events to listeners', () => {
      const listener1 = jest.fn();
      const listener2 = jest.fn();
      websocketService.on('test', listener1);
      websocketService.on('test', listener2);

      const data = { message: 'test' };
      websocketService.emit('test', data);

      expect(listener1).toHaveBeenCalledWith(data);
      expect(listener2).toHaveBeenCalledWith(data);
    });

    it('handles listener errors gracefully', () => {
      const errorListener = jest.fn(() => {
        throw new Error('Listener error');
      });
      const goodListener = jest.fn();
      
      websocketService.on('test', errorListener);
      websocketService.on('test', goodListener);

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      websocketService.emit('test', {});

      expect(consoleSpy).toHaveBeenCalledWith('Error in event listener:', expect.any(Error));
      expect(goodListener).toHaveBeenCalled(); // Should still call other listeners
      
      consoleSpy.mockRestore();
    });
  });

  describe('heartbeat', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      websocketService.isConnected = true;
      websocketService.ws = mockWebSocket;
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('starts heartbeat on connection', () => {
      websocketService.startHeartbeat();

      jest.advanceTimersByTime(30000);

      expect(mockWebSocket.send).toHaveBeenCalledWith(
        expect.stringContaining('"type":"ping"')
      );
    });

    it('stops heartbeat on disconnect', () => {
      websocketService.startHeartbeat();
      websocketService.stopHeartbeat();

      jest.advanceTimersByTime(30000);

      expect(mockWebSocket.send).not.toHaveBeenCalled();
    });
  });

  describe('reconnection', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      // Mock localStorage
      Object.defineProperty(window, 'localStorage', {
        value: {
          getItem: jest.fn(() => 'test-token')
        }
      });
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('schedules reconnection on unexpected disconnect', () => {
      websocketService.currentUser = 'user-123';
      websocketService.reconnectAttempts = 0;
      
      const connectSpy = jest.spyOn(websocketService, 'connect').mockResolvedValue();

      websocketService.scheduleReconnect();

      jest.advanceTimersByTime(1000); // First attempt delay

      expect(connectSpy).toHaveBeenCalledWith('test-token', 'user-123', null);
      
      connectSpy.mockRestore();
    });

    it('increases delay with each reconnection attempt', () => {
      websocketService.currentUser = 'user-123';
      websocketService.reconnectAttempts = 2; // Third attempt
      
      const connectSpy = jest.spyOn(websocketService, 'connect').mockResolvedValue();

      websocketService.scheduleReconnect();

      // Should wait 4000ms (1000 * 2^2)
      jest.advanceTimersByTime(3999);
      expect(connectSpy).not.toHaveBeenCalled();
      
      jest.advanceTimersByTime(1);
      expect(connectSpy).toHaveBeenCalled();
      
      connectSpy.mockRestore();
    });
  });

  describe('getConnectionStatus', () => {
    it('returns current connection status', () => {
      websocketService.isConnected = true;
      websocketService.reconnectAttempts = 2;
      websocketService.currentUser = 'user-123';
      websocketService.currentProject = 'project-456';

      const status = websocketService.getConnectionStatus();

      expect(status).toEqual({
        isConnected: true,
        reconnectAttempts: 2,
        currentUser: 'user-123',
        currentProject: 'project-456'
      });
    });
  });
});
