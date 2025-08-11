/**
 * Collaboration Service for Real-time Project Management
 * Handles collaborative editing, conflict resolution, and change tracking
 */

import websocketService from './websocketService';

class CollaborationService {
  constructor() {
    this.activeUsers = new Map();
    this.changeHistory = [];
    this.conflictQueue = [];
    this.lockManager = new Map();
    this.debounceTimers = new Map();
    this.lastSyncTimestamp = Date.now();
  }

  /**
   * Initialize collaboration for a project
   */
  initializeProject(projectId, userId) {
    websocketService.joinProject(projectId);
    
    // Set up event listeners
    websocketService.on('userJoined', this.handleUserJoined.bind(this));
    websocketService.on('userLeft', this.handleUserLeft.bind(this));
    websocketService.on('collaborativeEdit', this.handleCollaborativeEdit.bind(this));
    websocketService.on('conflictDetected', this.handleConflictDetected.bind(this));
    websocketService.on('projectUpdated', this.handleProjectUpdated.bind(this));
    websocketService.on('taskUpdated', this.handleTaskUpdated.bind(this));
    websocketService.on('workflowUpdated', this.handleWorkflowUpdated.bind(this));

    // Announce user presence
    this.announcePresence(userId);
  }

  /**
   * Clean up collaboration when leaving project
   */
  cleanup() {
    websocketService.leaveProject();
    this.activeUsers.clear();
    this.changeHistory = [];
    this.conflictQueue = [];
    this.lockManager.clear();
    this.clearAllDebounceTimers();
  }

  /**
   * Announce user presence in project
   */
  announcePresence(userId) {
    websocketService.send('user_joined', {
      userId,
      timestamp: Date.now(),
      userInfo: this.getCurrentUserInfo()
    });
  }

  /**
   * Handle user joined event
   */
  handleUserJoined(data) {
    const { userId, userInfo } = data;
    this.activeUsers.set(userId, {
      ...userInfo,
      joinedAt: Date.now(),
      lastActivity: Date.now()
    });
    
    this.emit('userJoined', { userId, userInfo });
  }

  /**
   * Handle user left event
   */
  handleUserLeft(data) {
    const { userId } = data;
    this.activeUsers.delete(userId);
    this.releaseLocks(userId);
    
    this.emit('userLeft', { userId });
  }

  /**
   * Handle collaborative edit event
   */
  handleCollaborativeEdit(data) {
    const { editType, elementId, changes, userId, timestamp } = data;
    
    // Check for conflicts
    if (this.detectConflict(elementId, changes, timestamp)) {
      this.handleConflict(elementId, changes, userId, timestamp);
      return;
    }

    // Apply changes
    this.applyChanges(editType, elementId, changes, userId);
    
    // Record change in history
    this.recordChange({
      editType,
      elementId,
      changes,
      userId,
      timestamp,
      applied: true
    });

    this.emit('collaborativeEdit', data);
  }

  /**
   * Handle conflict detection
   */
  handleConflictDetected(data) {
    this.conflictQueue.push(data);
    this.emit('conflictDetected', data);
  }

  /**
   * Handle project updates
   */
  handleProjectUpdated(data) {
    this.lastSyncTimestamp = Date.now();
    this.emit('projectUpdated', data);
  }

  /**
   * Handle task updates
   */
  handleTaskUpdated(data) {
    this.lastSyncTimestamp = Date.now();
    this.emit('taskUpdated', data);
  }

  /**
   * Handle workflow updates
   */
  handleWorkflowUpdated(data) {
    this.lastSyncTimestamp = Date.now();
    this.emit('workflowUpdated', data);
  }

  /**
   * Send collaborative edit update
   */
  sendEdit(editType, elementId, changes) {
    const editData = {
      editType,
      elementId,
      changes,
      timestamp: Date.now()
    };

    // Debounce rapid edits
    this.debounceEdit(elementId, () => {
      websocketService.notifyCollaborativeEdit(editData);
      this.recordChange({
        ...editData,
        userId: websocketService.currentUser,
        applied: false // Will be applied when received back
      });
    });
  }

  /**
   * Debounce edit operations to prevent spam
   */
  debounceEdit(elementId, callback, delay = 300) {
    if (this.debounceTimers.has(elementId)) {
      clearTimeout(this.debounceTimers.get(elementId));
    }

    const timer = setTimeout(() => {
      callback();
      this.debounceTimers.delete(elementId);
    }, delay);

    this.debounceTimers.set(elementId, timer);
  }

  /**
   * Clear all debounce timers
   */
  clearAllDebounceTimers() {
    this.debounceTimers.forEach(timer => clearTimeout(timer));
    this.debounceTimers.clear();
  }

  /**
   * Detect conflicts in collaborative editing
   */
  detectConflict(elementId, changes, timestamp) {
    // Check if element is locked by another user
    if (this.lockManager.has(elementId)) {
      const lock = this.lockManager.get(elementId);
      if (lock.userId !== websocketService.currentUser) {
        return true;
      }
    }

    // Check for concurrent modifications
    const recentChanges = this.changeHistory.filter(change => 
      change.elementId === elementId && 
      change.timestamp > timestamp - 5000 && // Within 5 seconds
      change.userId !== websocketService.currentUser
    );

    return recentChanges.length > 0;
  }

  /**
   * Handle conflict resolution
   */
  handleConflict(elementId, changes, userId, timestamp) {
    const conflictData = {
      elementId,
      changes,
      userId,
      timestamp,
      conflictType: 'concurrent_edit',
      resolution: 'manual' // Can be 'auto', 'manual', 'last_writer_wins'
    };

    websocketService.reportConflict(conflictData);
    this.conflictQueue.push(conflictData);
  }

  /**
   * Apply changes to the UI
   */
  applyChanges(editType, elementId, changes, userId) {
    // This would be implemented based on specific UI framework
    // For now, just emit the event for components to handle
    this.emit('applyChanges', {
      editType,
      elementId,
      changes,
      userId
    });
  }

  /**
   * Record change in history
   */
  recordChange(change) {
    this.changeHistory.push(change);
    
    // Keep only last 100 changes to prevent memory issues
    if (this.changeHistory.length > 100) {
      this.changeHistory = this.changeHistory.slice(-100);
    }
  }

  /**
   * Acquire lock on element for editing
   */
  acquireLock(elementId, userId = null) {
    const lockUserId = userId || websocketService.currentUser;
    
    if (this.lockManager.has(elementId)) {
      const existingLock = this.lockManager.get(elementId);
      if (existingLock.userId !== lockUserId) {
        return false; // Lock already held by another user
      }
    }

    this.lockManager.set(elementId, {
      userId: lockUserId,
      timestamp: Date.now(),
      type: 'edit'
    });

    // Auto-release lock after 30 seconds
    setTimeout(() => {
      this.releaseLock(elementId, lockUserId);
    }, 30000);

    return true;
  }

  /**
   * Release lock on element
   */
  releaseLock(elementId, userId = null) {
    const lockUserId = userId || websocketService.currentUser;
    
    if (this.lockManager.has(elementId)) {
      const lock = this.lockManager.get(elementId);
      if (lock.userId === lockUserId) {
        this.lockManager.delete(elementId);
        return true;
      }
    }
    
    return false;
  }

  /**
   * Release all locks held by a user
   */
  releaseLocks(userId) {
    const locksToRelease = [];
    
    this.lockManager.forEach((lock, elementId) => {
      if (lock.userId === userId) {
        locksToRelease.push(elementId);
      }
    });

    locksToRelease.forEach(elementId => {
      this.lockManager.delete(elementId);
    });
  }

  /**
   * Get active users in project
   */
  getActiveUsers() {
    return Array.from(this.activeUsers.entries()).map(([userId, userInfo]) => ({
      userId,
      ...userInfo
    }));
  }

  /**
   * Get change history
   */
  getChangeHistory(elementId = null) {
    if (elementId) {
      return this.changeHistory.filter(change => change.elementId === elementId);
    }
    return this.changeHistory;
  }

  /**
   * Get pending conflicts
   */
  getPendingConflicts() {
    return this.conflictQueue;
  }

  /**
   * Resolve conflict
   */
  resolveConflict(conflictId, resolution) {
    const conflictIndex = this.conflictQueue.findIndex(c => c.id === conflictId);
    if (conflictIndex > -1) {
      const conflict = this.conflictQueue[conflictIndex];
      
      // Apply resolution
      switch (resolution.type) {
        case 'accept_changes':
          this.applyChanges(conflict.editType, conflict.elementId, conflict.changes, conflict.userId);
          break;
        case 'reject_changes':
          // Do nothing, keep current state
          break;
        case 'merge_changes':
          // Implement merge logic based on resolution.mergeStrategy
          this.mergeChanges(conflict, resolution.mergeStrategy);
          break;
      }

      // Remove from queue
      this.conflictQueue.splice(conflictIndex, 1);
      
      this.emit('conflictResolved', { conflict, resolution });
    }
  }

  /**
   * Merge conflicting changes
   */
  mergeChanges(conflict, mergeStrategy) {
    // Implementation depends on the type of changes and merge strategy
    // This is a placeholder for more complex merge logic
    console.log('Merging changes with strategy:', mergeStrategy);
  }

  /**
   * Get current user info
   */
  getCurrentUserInfo() {
    // This would typically come from auth service
    return {
      name: 'Current User',
      avatar: '/default-avatar.png',
      role: 'member'
    };
  }

  /**
   * Event emitter functionality
   */
  on(event, callback) {
    if (!this.listeners) {
      this.listeners = new Map();
    }
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  off(event, callback) {
    if (this.listeners && this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  emit(event, data) {
    if (this.listeners && this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Error in collaboration event listener:', error);
        }
      });
    }
  }
}

// Create singleton instance
const collaborationService = new CollaborationService();

export default collaborationService;
