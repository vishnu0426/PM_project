import React, { useState, useEffect } from 'react';
import { cn } from '../../utils/cn';
import Icon from '../AppIcon';
import websocketService from '../../utils/websocketService';
import collaborationService from '../../utils/collaborationService';

const RealTimeIndicator = ({ className }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [activeUsers, setActiveUsers] = useState([]);
  const [pendingConflicts, setPendingConflicts] = useState([]);
  const [showUserList, setShowUserList] = useState(false);

  useEffect(() => {
    // Set up WebSocket connection status listeners
    const handleConnected = () => setIsConnected(true);
    const handleDisconnected = () => setIsConnected(false);
    
    websocketService.on('connected', handleConnected);
    websocketService.on('disconnected', handleDisconnected);

    // Set up collaboration listeners
    const handleUserJoined = (data) => {
      setActiveUsers(prev => {
        const existing = prev.find(user => user.userId === data.userId);
        if (existing) return prev;
        return [...prev, data];
      });
    };

    const handleUserLeft = (data) => {
      setActiveUsers(prev => prev.filter(user => user.userId !== data.userId));
    };

    const handleConflictDetected = (conflict) => {
      setPendingConflicts(prev => [...prev, conflict]);
    };

    const handleConflictResolved = (data) => {
      setPendingConflicts(prev => prev.filter(c => c.id !== data.conflict.id));
    };

    collaborationService.on('userJoined', handleUserJoined);
    collaborationService.on('userLeft', handleUserLeft);
    collaborationService.on('conflictDetected', handleConflictDetected);
    collaborationService.on('conflictResolved', handleConflictResolved);

    // Initialize with current state
    setIsConnected(websocketService.getConnectionStatus().isConnected);
    setActiveUsers(collaborationService.getActiveUsers());
    setPendingConflicts(collaborationService.getPendingConflicts());

    return () => {
      websocketService.off('connected', handleConnected);
      websocketService.off('disconnected', handleDisconnected);
      collaborationService.off('userJoined', handleUserJoined);
      collaborationService.off('userLeft', handleUserLeft);
      collaborationService.off('conflictDetected', handleConflictDetected);
      collaborationService.off('conflictResolved', handleConflictResolved);
    };
  }, []);

  const getConnectionStatusColor = () => {
    if (!isConnected) return 'text-red-500';
    if (pendingConflicts.length > 0) return 'text-yellow-500';
    return 'text-green-500';
  };

  const getConnectionStatusText = () => {
    if (!isConnected) return 'Disconnected';
    if (pendingConflicts.length > 0) return `${pendingConflicts.length} conflict(s)`;
    return 'Connected';
  };

  return (
    <div className={cn("relative", className)}>
      <div className="flex items-center gap-2 p-2 rounded-lg bg-card border border-border">
        {/* Connection Status */}
        <div className="flex items-center gap-1">
          <div className={cn(
            "w-2 h-2 rounded-full transition-colors duration-200",
            isConnected ? "bg-green-500" : "bg-red-500"
          )}>
            {isConnected && (
              <div className="w-2 h-2 rounded-full bg-green-500 animate-ping" />
            )}
          </div>
          <span className={cn("text-xs font-medium", getConnectionStatusColor())}>
            {getConnectionStatusText()}
          </span>
        </div>

        {/* Active Users */}
        {activeUsers.length > 0 && (
          <div className="flex items-center gap-1">
            <div className="flex -space-x-1">
              {activeUsers.slice(0, 3).map((user, index) => (
                <div
                  key={user.userId}
                  className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center border-2 border-background"
                  title={user.userInfo?.name || user.userId}
                >
                  {user.userInfo?.name?.charAt(0) || 'U'}
                </div>
              ))}
              {activeUsers.length > 3 && (
                <div className="w-6 h-6 rounded-full bg-secondary text-secondary-foreground text-xs flex items-center justify-center border-2 border-background">
                  +{activeUsers.length - 3}
                </div>
              )}
            </div>
            
            <button
              onClick={() => setShowUserList(!showUserList)}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              {activeUsers.length} online
            </button>
          </div>
        )}

        {/* Conflicts Indicator */}
        {pendingConflicts.length > 0 && (
          <div className="flex items-center gap-1">
            <Icon name="AlertTriangle" className="h-3 w-3 text-yellow-500" />
            <span className="text-xs text-yellow-600 font-medium">
              {pendingConflicts.length}
            </span>
          </div>
        )}

        {/* Settings */}
        <button
          className="p-1 hover:bg-secondary rounded transition-colors"
          title="Collaboration Settings"
        >
          <Icon name="Settings" className="h-3 w-3 text-muted-foreground" />
        </button>
      </div>

      {/* Active Users Dropdown */}
      {showUserList && activeUsers.length > 0 && (
        <div className="absolute top-full left-0 mt-1 w-64 bg-card border border-border rounded-lg shadow-lg z-50">
          <div className="p-3">
            <h4 className="text-sm font-medium text-foreground mb-2">
              Active Users ({activeUsers.length})
            </h4>
            <div className="space-y-2">
              {activeUsers.map((user) => (
                <div key={user.userId} className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                    {user.userInfo?.name?.charAt(0) || 'U'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-foreground truncate">
                      {user.userInfo?.name || user.userId}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {user.userInfo?.role || 'Member'}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span className="text-xs text-muted-foreground">
                      {Math.floor((Date.now() - user.lastActivity) / 60000)}m ago
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RealTimeIndicator;
