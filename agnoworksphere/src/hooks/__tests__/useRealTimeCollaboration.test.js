import { renderHook, act, waitFor } from '@testing-library/react';
import useRealTimeCollaboration from '../useRealTimeCollaboration';
import websocketService from '../../utils/websocketService';
import collaborationService from '../../utils/collaborationService';
import authService from '../../utils/authService';

// Mock dependencies
jest.mock('../../utils/websocketService');
jest.mock('../../utils/collaborationService');
jest.mock('../../utils/authService');

describe('useRealTimeCollaboration', () => {
  const mockUser = {
    id: 'user-123',
    name: 'Test User',
    email: 'test@example.com'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(() => 'test-token')
      }
    });

    // Mock authService
    authService.getCurrentUser.mockResolvedValue({
      data: { user: mockUser }
    });

    // Mock websocketService
    websocketService.connect.mockResolvedValue();
    websocketService.disconnect.mockImplementation(() => {});
    websocketService.on.mockImplementation(() => {});
    websocketService.off.mockImplementation(() => {});
    websocketService.getConnectionStatus.mockReturnValue({
      isConnected: true,
      reconnectAttempts: 0,
      currentUser: mockUser.id,
      currentProject: 'project-123'
    });

    // Mock collaborationService
    collaborationService.initializeProject.mockImplementation(() => {});
    collaborationService.cleanup.mockImplementation(() => {});
    collaborationService.on.mockImplementation(() => {});
    collaborationService.off.mockImplementation(() => {});
    collaborationService.sendEdit.mockImplementation(() => {});
    collaborationService.acquireLock.mockReturnValue(true);
    collaborationService.releaseLock.mockReturnValue(true);
    collaborationService.getChangeHistory.mockReturnValue([]);
    collaborationService.resolveConflict.mockImplementation(() => {});
  });

  it('initializes collaboration when projectId is provided', async () => {
    const projectId = 'project-123';

    renderHook(() => useRealTimeCollaboration(projectId));

    await waitFor(() => {
      expect(authService.getCurrentUser).toHaveBeenCalled();
      expect(websocketService.connect).toHaveBeenCalledWith('test-token', mockUser.id, projectId);
      expect(collaborationService.initializeProject).toHaveBeenCalledWith(projectId, mockUser.id);
    });
  });

  it('does not initialize when autoConnect is false', () => {
    const projectId = 'project-123';

    renderHook(() => useRealTimeCollaboration(projectId, { autoConnect: false }));

    expect(authService.getCurrentUser).not.toHaveBeenCalled();
    expect(websocketService.connect).not.toHaveBeenCalled();
  });

  it('does not initialize when projectId is not provided', () => {
    renderHook(() => useRealTimeCollaboration(null));

    expect(authService.getCurrentUser).not.toHaveBeenCalled();
    expect(websocketService.connect).not.toHaveBeenCalled();
  });

  it('sets up event listeners', async () => {
    const projectId = 'project-123';
    const onUserJoined = jest.fn();
    const onConflictDetected = jest.fn();

    renderHook(() => useRealTimeCollaboration(projectId, {
      onUserJoined,
      onConflictDetected
    }));

    await waitFor(() => {
      expect(websocketService.on).toHaveBeenCalledWith('connected', expect.any(Function));
      expect(websocketService.on).toHaveBeenCalledWith('disconnected', expect.any(Function));
      expect(collaborationService.on).toHaveBeenCalledWith('userJoined', expect.any(Function));
      expect(collaborationService.on).toHaveBeenCalledWith('conflictDetected', expect.any(Function));
    });
  });

  it('updates connection state when connected', async () => {
    const projectId = 'project-123';

    const { result } = renderHook(() => useRealTimeCollaboration(projectId));

    // Simulate connection event
    const connectedHandler = websocketService.on.mock.calls.find(
      call => call[0] === 'connected'
    )[1];

    act(() => {
      connectedHandler();
    });

    expect(result.current.isConnected).toBe(true);
    expect(result.current.connectionStatus).toBe('connected');
  });

  it('updates active users when user joins', async () => {
    const projectId = 'project-123';
    const onUserJoined = jest.fn();

    const { result } = renderHook(() => useRealTimeCollaboration(projectId, { onUserJoined }));

    // Simulate user joined event
    const userJoinedHandler = collaborationService.on.mock.calls.find(
      call => call[0] === 'userJoined'
    )[1];

    const newUser = { userId: 'user-456', userInfo: { name: 'New User' } };

    act(() => {
      userJoinedHandler(newUser);
    });

    expect(result.current.activeUsers).toContainEqual(newUser);
    expect(onUserJoined).toHaveBeenCalledWith(newUser, [newUser]);
  });

  it('removes users when they leave', async () => {
    const projectId = 'project-123';

    const { result } = renderHook(() => useRealTimeCollaboration(projectId));

    // Add a user first
    const userJoinedHandler = collaborationService.on.mock.calls.find(
      call => call[0] === 'userJoined'
    )[1];
    const userLeftHandler = collaborationService.on.mock.calls.find(
      call => call[0] === 'userLeft'
    )[1];

    const user = { userId: 'user-456', userInfo: { name: 'Test User' } };

    act(() => {
      userJoinedHandler(user);
    });

    expect(result.current.activeUsers).toContainEqual(user);

    act(() => {
      userLeftHandler({ userId: 'user-456' });
    });

    expect(result.current.activeUsers).not.toContainEqual(user);
  });

  it('handles conflicts detection', async () => {
    const projectId = 'project-123';
    const onConflictDetected = jest.fn();

    const { result } = renderHook(() => useRealTimeCollaboration(projectId, { onConflictDetected }));

    const conflictHandler = collaborationService.on.mock.calls.find(
      call => call[0] === 'conflictDetected'
    )[1];

    const conflict = { id: 'conflict-1', elementId: 'element-1' };

    act(() => {
      conflictHandler(conflict);
    });

    expect(result.current.pendingConflicts).toContainEqual(conflict);
    expect(onConflictDetected).toHaveBeenCalledWith(conflict, [conflict]);
  });

  it('sends collaborative edits', async () => {
    const projectId = 'project-123';

    const { result } = renderHook(() => useRealTimeCollaboration(projectId));

    await waitFor(() => {
      expect(result.current.isConnected).toBe(true);
    });

    act(() => {
      const success = result.current.sendEdit('text_edit', 'element-1', { text: 'new text' });
      expect(success).toBe(true);
    });

    expect(collaborationService.sendEdit).toHaveBeenCalledWith(
      'text_edit',
      'element-1',
      { text: 'new text' }
    );
  });

  it('returns false when sending edit while disconnected', async () => {
    const projectId = 'project-123';

    const { result } = renderHook(() => useRealTimeCollaboration(projectId));

    // Simulate disconnection
    const disconnectedHandler = websocketService.on.mock.calls.find(
      call => call[0] === 'disconnected'
    )[1];

    act(() => {
      disconnectedHandler();
    });

    act(() => {
      const success = result.current.sendEdit('text_edit', 'element-1', { text: 'new text' });
      expect(success).toBe(false);
    });
  });

  it('acquires and releases locks', async () => {
    const projectId = 'project-123';

    const { result } = renderHook(() => useRealTimeCollaboration(projectId));

    await waitFor(() => {
      expect(result.current.isConnected).toBe(true);
    });

    act(() => {
      const acquired = result.current.acquireLock('element-1');
      expect(acquired).toBe(true);
    });

    expect(collaborationService.acquireLock).toHaveBeenCalledWith('element-1');

    act(() => {
      const released = result.current.releaseLock('element-1');
      expect(released).toBe(true);
    });

    expect(collaborationService.releaseLock).toHaveBeenCalledWith('element-1');
  });

  it('notifies project updates', async () => {
    const projectId = 'project-123';

    const { result } = renderHook(() => useRealTimeCollaboration(projectId));

    await waitFor(() => {
      expect(result.current.isConnected).toBe(true);
    });

    const projectData = { id: 'project-123', name: 'Updated Project' };

    act(() => {
      const success = result.current.notifyProjectUpdate(projectData);
      expect(success).toBe(true);
    });

    expect(websocketService.notifyProjectUpdate).toHaveBeenCalledWith(projectData);
  });

  it('resolves conflicts', async () => {
    const projectId = 'project-123';

    const { result } = renderHook(() => useRealTimeCollaboration(projectId));

    const resolution = { type: 'accept_changes' };

    act(() => {
      result.current.resolveConflict('conflict-1', resolution);
    });

    expect(collaborationService.resolveConflict).toHaveBeenCalledWith('conflict-1', resolution);
  });

  it('reconnects when requested', async () => {
    const projectId = 'project-123';

    const { result } = renderHook(() => useRealTimeCollaboration(projectId));

    await waitFor(() => {
      expect(websocketService.connect).toHaveBeenCalledTimes(1);
    });

    await act(async () => {
      await result.current.reconnect();
    });

    expect(websocketService.connect).toHaveBeenCalledTimes(2);
    expect(collaborationService.initializeProject).toHaveBeenCalledTimes(2);
  });

  it('disconnects and cleans up', async () => {
    const projectId = 'project-123';

    const { result } = renderHook(() => useRealTimeCollaboration(projectId));

    act(() => {
      result.current.disconnect();
    });

    expect(collaborationService.cleanup).toHaveBeenCalled();
    expect(websocketService.disconnect).toHaveBeenCalled();
  });

  it('provides connection information', async () => {
    const projectId = 'project-123';

    const { result } = renderHook(() => useRealTimeCollaboration(projectId));

    await waitFor(() => {
      const info = result.current.getConnectionInfo();
      expect(info).toEqual({
        isConnected: true,
        connectionStatus: 'connected',
        activeUsers: 0,
        pendingConflicts: 0,
        lastSyncTime: null
      });
    });
  });

  it('cleans up on unmount', async () => {
    const projectId = 'project-123';

    const { unmount } = renderHook(() => useRealTimeCollaboration(projectId));

    await waitFor(() => {
      expect(collaborationService.initializeProject).toHaveBeenCalled();
    });

    unmount();

    expect(collaborationService.cleanup).toHaveBeenCalled();
    expect(websocketService.disconnect).toHaveBeenCalled();
  });

  it('handles initialization errors gracefully', async () => {
    authService.getCurrentUser.mockRejectedValue(new Error('Auth failed'));
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    const projectId = 'project-123';

    const { result } = renderHook(() => useRealTimeCollaboration(projectId));

    await waitFor(() => {
      expect(result.current.connectionStatus).toBe('error');
    });

    expect(consoleSpy).toHaveBeenCalledWith('Failed to initialize collaboration:', expect.any(Error));
    
    consoleSpy.mockRestore();
  });

  it('updates project ID when it changes', async () => {
    const { rerender } = renderHook(
      ({ projectId }) => useRealTimeCollaboration(projectId),
      { initialProps: { projectId: 'project-123' } }
    );

    await waitFor(() => {
      expect(collaborationService.initializeProject).toHaveBeenCalledWith('project-123', mockUser.id);
    });

    rerender({ projectId: 'project-456' });

    await waitFor(() => {
      expect(collaborationService.cleanup).toHaveBeenCalled();
      expect(collaborationService.initializeProject).toHaveBeenCalledWith('project-456', mockUser.id);
    });
  });
});
