import React, { useState, useEffect, useRef } from 'react';
import Icon from '../AppIcon';
import Button from './Button';
import * as notificationService from '../../utils/notificationService';

const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  // Load notifications on component mount
  useEffect(() => {
    loadNotifications();
  }, []);

  // Real-time updates via WebSocket (fallback to polling)
  useEffect(() => {
    let pollHandle;

    // Polling fallback for unread stats to keep badge fresh even when closed
    const startPolling = () => {
      pollHandle = setInterval(async () => {
        try {
          const stats = await notificationService.getNotificationStats();
          if (stats.success) {
            setUnreadCount(stats.data.unread_notifications || 0);
          }
        } catch (e) {
          // ignore
        }
      }, 20000); // every 20s
    };

    // WebSocket-based live updates if available
    let removeWsListener;
    try {
      const wsMod = require('../../utils/websocketService.js');
      const websocketService = wsMod.default || wsMod;

      const onNotification = (payload) => {
        // Prepend new notification
        setNotifications((prev) => [payload, ...prev]);
        setUnreadCount((prev) => prev + (payload.read ? 0 : 1));
      };

      websocketService.on('notification', onNotification);
      removeWsListener = () =>
        websocketService.off('notification', onNotification);
    } catch (e) {
      // If websocketService is unavailable, do nothing
    }

    startPolling();

    return () => {
      if (pollHandle) clearInterval(pollHandle);
      if (removeWsListener) removeWsListener();
    };
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const result = await notificationService.getNotifications();
      if (result.success) {
        setNotifications(result.data);
        setUnreadCount(result.data.filter((n) => !n.read).length);
      }
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await notificationService.markNotificationAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllNotificationsAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    try {
      await notificationService.deleteNotification(notificationId);
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
      setUnreadCount((prev) => {
        const notification = notifications.find((n) => n.id === notificationId);
        return notification && !notification.read
          ? Math.max(0, prev - 1)
          : prev;
      });
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'project':
      case 'project_created':
        return 'FolderPlus';
      case 'task_assigned':
        return 'UserCheck';
      case 'task_completed':
        return 'CheckCircle';
      case 'task_updated':
        return 'Edit';
      case 'team_member_added':
        return 'UserPlus';
      case 'welcome':
        return 'Heart';
      default:
        return 'Bell';
    }
  };

  const getNotificationColor = (type, priority) => {
    if (priority === 'high') return 'text-red-500';
    if (priority === 'medium') return 'text-blue-500';
    return 'text-gray-500';
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const notificationTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now - notificationTime) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <div className='relative' ref={dropdownRef}>
      {/* Notification Bell Button */}
      <Button
        variant='ghost'
        size='icon'
        onClick={() => setIsOpen(!isOpen)}
        className='relative'
      >
        <Icon name='Bell' size={18} />
        {unreadCount > 0 && (
          <span className='absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center'>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </Button>

      {/* Dropdown */}
      {isOpen && (
        <div className='absolute right-0 mt-2 w-80 bg-surface border border-border rounded-lg shadow-lg z-50'>
          {/* Header */}
          <div className='flex items-center justify-between p-4 border-b border-border'>
            <h3 className='text-sm font-semibold text-text-primary'>
              Notifications
            </h3>
            {unreadCount > 0 && (
              <Button
                variant='ghost'
                size='sm'
                onClick={handleMarkAllAsRead}
                className='text-xs'
              >
                Mark all read
              </Button>
            )}
          </div>

          {/* Notifications List */}
          <div className='max-h-96 overflow-y-auto'>
            {loading ? (
              <div className='p-4 text-center text-text-secondary'>
                <Icon
                  name='Loader2'
                  size={20}
                  className='animate-spin mx-auto mb-2'
                />
                Loading notifications...
              </div>
            ) : notifications.length === 0 ? (
              <div className='p-4 text-center text-text-secondary'>
                <Icon
                  name='Bell'
                  size={24}
                  className='mx-auto mb-2 opacity-50'
                />
                <p>No notifications yet</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border-b border-border hover:bg-muted transition-colors ${
                    !notification.read ? 'bg-primary/5' : ''
                  }`}
                >
                  <div className='flex items-start space-x-3'>
                    <div
                      className={`flex-shrink-0 ${getNotificationColor(
                        notification.type,
                        notification.priority
                      )}`}
                    >
                      <Icon
                        name={getNotificationIcon(notification.type)}
                        size={16}
                      />
                    </div>
                    <div className='flex-1 min-w-0'>
                      <div className='flex items-start justify-between'>
                        <div className='flex-1'>
                          <p className='text-sm font-medium text-text-primary'>
                            {notification.title}
                          </p>
                          <p className='text-xs text-text-secondary mt-1'>
                            {notification.message}
                          </p>
                          <p className='text-xs text-text-secondary mt-1'>
                            {formatTimeAgo(
                              notification.createdAt || notification.created_at
                            )}
                          </p>
                        </div>
                        <div className='flex items-center space-x-1 ml-2'>
                          {!notification.read && (
                            <Button
                              variant='ghost'
                              size='icon'
                              onClick={() => handleMarkAsRead(notification.id)}
                              className='h-6 w-6'
                            >
                              <Icon name='Check' size={12} />
                            </Button>
                          )}
                          <Button
                            variant='ghost'
                            size='icon'
                            onClick={() =>
                              handleDeleteNotification(notification.id)
                            }
                            className='h-6 w-6 text-destructive hover:text-destructive'
                          >
                            <Icon name='X' size={12} />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className='p-3 border-t border-border'>
              <Button
                variant='ghost'
                size='sm'
                className='w-full text-xs'
                onClick={() => {
                  setIsOpen(false);
                  // Navigate to notifications page if it exists
                }}
              >
                View all notifications
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
