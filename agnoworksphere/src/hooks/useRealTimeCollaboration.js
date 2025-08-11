/**
 * React Hook for Real-time Collaboration
 * Provides easy integration of collaborative features in React components
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import websocketService from '../utils/websocketService';
import collaborationService from '../utils/collaborationService';
import authService from '../utils/authService';

export const useRealTimeCollaboration = (projectId, options = {}) => {
  const {
    autoConnect = true,
    enableConflictResolution = true,
    debounceDelay = 300,
    onUserJoined,
    onUserLeft,
    onConflictDetected,
    onProjectUpdated,
    onTaskUpdated,
    onWorkflowUpdated,
  } = options;

  // State
  const [isConnected, setIsConnected] = useState(false);
  const [activeUsers, setActiveUsers] = useState([]);
  const [pendingConflicts, setPendingConflicts] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [lastSyncTime, setLastSyncTime] = useState(null);

  // Refs
  const currentUserRef = useRef(null);
  const projectIdRef = useRef(projectId);
  const listenersRef = useRef(new Map());

  // Update project ID ref when it changes
  useEffect(() => {
    projectIdRef.current = projectId;
  }, [projectId]);

  // Initialize collaboration
  useEffect(() => {
    if (!autoConnect || !projectId) return;

    const initializeCollaboration = async () => {
      try {
        // Get current user
        const userResponse = await authService.getCurrentUser();
        if (userResponse.data?.user) {
          currentUserRef.current = userResponse.data.user;

          // Connect WebSocket
          const token = authService.getAccessToken();
          if (token) {
            await websocketService.connect(
              token,
              userResponse.data.user.id,
              projectId
            );

            // Initialize collaboration service
            collaborationService.initializeProject(
              projectId,
              userResponse.data.user.id
            );
          }
        }
      } catch (error) {
        console.error('Failed to initialize collaboration:', error);
        setConnectionStatus('error');
      }
    };

    initializeCollaboration();

    return () => {
      collaborationService.cleanup();
      websocketService.disconnect();
    };
  }, [projectId, autoConnect]);

  // Set up event listeners
  useEffect(() => {
    const handleConnected = () => {
      setIsConnected(true);
      setConnectionStatus('connected');
    };

    const handleDisconnected = () => {
      setIsConnected(false);
      setConnectionStatus('disconnected');
    };

    const handleError = (error) => {
      setConnectionStatus('error');
      console.error('WebSocket error:', error);
    };

    const handleUserJoined = (data) => {
      setActiveUsers((prev) => {
        const existing = prev.find((user) => user.userId === data.userId);
        if (existing) return prev;
        const newUsers = [...prev, data];
        onUserJoined?.(data, newUsers);
        return newUsers;
      });
    };

    const handleUserLeft = (data) => {
      setActiveUsers((prev) => {
        const newUsers = prev.filter((user) => user.userId !== data.userId);
        onUserLeft?.(data, newUsers);
        return newUsers;
      });
    };

    const handleConflictDetected = (conflict) => {
      setPendingConflicts((prev) => {
        const newConflicts = [...prev, conflict];
        onConflictDetected?.(conflict, newConflicts);
        return newConflicts;
      });
    };

    const handleConflictResolved = (data) => {
      setPendingConflicts((prev) =>
        prev.filter((c) => c.id !== data.conflict.id)
      );
    };

    const handleProjectUpdated = (data) => {
      setLastSyncTime(Date.now());
      onProjectUpdated?.(data);
    };

    const handleTaskUpdated = (data) => {
      setLastSyncTime(Date.now());
      onTaskUpdated?.(data);
    };

    const handleWorkflowUpdated = (data) => {
      setLastSyncTime(Date.now());
      onWorkflowUpdated?.(data);
    };

    // Register listeners
    websocketService.on('connected', handleConnected);
    websocketService.on('disconnected', handleDisconnected);
    websocketService.on('error', handleError);

    collaborationService.on('userJoined', handleUserJoined);
    collaborationService.on('userLeft', handleUserLeft);
    collaborationService.on('conflictDetected', handleConflictDetected);
    collaborationService.on('conflictResolved', handleConflictResolved);
    collaborationService.on('projectUpdated', handleProjectUpdated);
    collaborationService.on('taskUpdated', handleTaskUpdated);
    collaborationService.on('workflowUpdated', handleWorkflowUpdated);

    // Store listeners for cleanup
    listenersRef.current.set('websocket', [
      ['connected', handleConnected],
      ['disconnected', handleDisconnected],
      ['error', handleError],
    ]);

    listenersRef.current.set('collaboration', [
      ['userJoined', handleUserJoined],
      ['userLeft', handleUserLeft],
      ['conflictDetected', handleConflictDetected],
      ['conflictResolved', handleConflictResolved],
      ['projectUpdated', handleProjectUpdated],
      ['taskUpdated', handleTaskUpdated],
      ['workflowUpdated', handleWorkflowUpdated],
    ]);

    return () => {
      // Cleanup listeners
      listenersRef.current.get('websocket')?.forEach(([event, handler]) => {
        websocketService.off(event, handler);
      });

      listenersRef.current.get('collaboration')?.forEach(([event, handler]) => {
        collaborationService.off(event, handler);
      });

      listenersRef.current.clear();
    };
  }, [
    onUserJoined,
    onUserLeft,
    onConflictDetected,
    onProjectUpdated,
    onTaskUpdated,
    onWorkflowUpdated,
  ]);

  // Collaborative editing functions
  const sendEdit = useCallback(
    (editType, elementId, changes) => {
      if (!isConnected) {
        console.warn('Cannot send edit: not connected');
        return false;
      }

      collaborationService.sendEdit(editType, elementId, changes);
      return true;
    },
    [isConnected]
  );

  const acquireLock = useCallback((elementId) => {
    return collaborationService.acquireLock(elementId);
  }, []);

  const releaseLock = useCallback((elementId) => {
    return collaborationService.releaseLock(elementId);
  }, []);

  // Project update functions
  const notifyProjectUpdate = useCallback(
    (projectData) => {
      if (!isConnected) return false;
      websocketService.notifyProjectUpdate(projectData);
      return true;
    },
    [isConnected]
  );

  const notifyTaskUpdate = useCallback(
    (taskData) => {
      if (!isConnected) return false;
      websocketService.notifyTaskUpdate(taskData);
      return true;
    },
    [isConnected]
  );

  const notifyWorkflowUpdate = useCallback(
    (workflowData) => {
      if (!isConnected) return false;
      websocketService.notifyWorkflowUpdate(workflowData);
      return true;
    },
    [isConnected]
  );

  // Conflict resolution
  const resolveConflict = useCallback((conflictId, resolution) => {
    collaborationService.resolveConflict(conflictId, resolution);
  }, []);

  // Connection management
  const reconnect = useCallback(async () => {
    if (currentUserRef.current && projectIdRef.current) {
      const token = authService.getAccessToken();
      if (token) {
        try {
          await websocketService.connect(
            token,
            currentUserRef.current.id,
            projectIdRef.current
          );
          collaborationService.initializeProject(
            projectIdRef.current,
            currentUserRef.current.id
          );
        } catch (error) {
          console.error('Failed to reconnect:', error);
        }
      }
    }
  }, []);

  const disconnect = useCallback(() => {
    collaborationService.cleanup();
    websocketService.disconnect();
  }, []);

  // Utility functions
  const getChangeHistory = useCallback((elementId = null) => {
    return collaborationService.getChangeHistory(elementId);
  }, []);

  const getCurrentUser = useCallback(() => {
    return currentUserRef.current;
  }, []);

  const getConnectionInfo = useCallback(() => {
    return {
      isConnected,
      connectionStatus,
      activeUsers: activeUsers.length,
      pendingConflicts: pendingConflicts.length,
      lastSyncTime,
    };
  }, [
    isConnected,
    connectionStatus,
    activeUsers.length,
    pendingConflicts.length,
    lastSyncTime,
  ]);

  return {
    // Connection state
    isConnected,
    connectionStatus,
    activeUsers,
    pendingConflicts,
    lastSyncTime,

    // Collaborative editing
    sendEdit,
    acquireLock,
    releaseLock,

    // Project updates
    notifyProjectUpdate,
    notifyTaskUpdate,
    notifyWorkflowUpdate,

    // Conflict resolution
    resolveConflict,

    // Connection management
    reconnect,
    disconnect,

    // Utility functions
    getChangeHistory,
    getCurrentUser,
    getConnectionInfo,
  };
};

export default useRealTimeCollaboration;
