import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Image from '../../../components/AppImage';

const NotificationPanel = ({ notifications = [], userRole, loading = false }) => {
  const [filter, setFilter] = useState('all');

  const getNotificationIcon = (type) => {
    const icons = {
      'task_assigned': 'UserCheck',
      'project_update': 'FolderOpen',
      'deadline_reminder': 'Clock',
      'comment_mention': 'MessageCircle',
      'system_alert': 'AlertTriangle',
      'team_invite': 'UserPlus',
      'status_change': 'RefreshCw'
    };
    return icons[type] || 'Bell';
  };

  const getNotificationColor = (type, priority) => {
    if (priority === 'high') return 'text-error';
    
    const colors = {
      'task_assigned': 'text-primary',
      'project_update': 'text-accent',
      'deadline_reminder': 'text-warning',
      'comment_mention': 'text-success',
      'system_alert': 'text-error',
      'team_invite': 'text-primary',
      'status_change': 'text-secondary'
    };
    return colors[type] || 'text-text-secondary';
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

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !notification.read;
    if (filter === 'high') return notification.priority === 'high';
    return notification.type === filter;
  });

  const unreadCount = notifications.filter(n => !n.read).length;
  const highPriorityCount = notifications.filter(n => n.priority === 'high').length;

  const handleMarkAsRead = (notificationId) => {
    console.log(`Marking notification ${notificationId} as read`);
  };

  const handleMarkAllAsRead = () => {
    console.log('Marking all notifications as read');
  };

  return (
    <div className="bg-white rounded-lg border border-border p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold text-text-primary">
            Notifications
          </h3>
          {unreadCount > 0 && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-error text-error-foreground">
              {unreadCount}
            </span>
          )}
        </div>
        
        {unreadCount > 0 && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleMarkAllAsRead}
            className="text-xs"
          >
            Mark all read
          </Button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 mb-4 overflow-x-auto">
        {[
          { key: 'all', label: 'All', count: notifications.length },
          { key: 'unread', label: 'Unread', count: unreadCount },
          { key: 'high', label: 'High Priority', count: highPriorityCount },
          { key: 'task_assigned', label: 'Tasks', count: notifications.filter(n => n.type === 'task_assigned').length }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-150 whitespace-nowrap ${
              filter === tab.key
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-text-secondary hover:bg-muted/80'
            }`}
          >
            {tab.label}
            {tab.count > 0 && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                filter === tab.key
                  ? 'bg-primary-foreground/20 text-primary-foreground'
                  : 'bg-text-secondary/20 text-text-secondary'
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {filteredNotifications.map((notification) => (
          <div 
            key={notification.id} 
            className={`flex items-start gap-3 p-3 rounded-lg border transition-colors duration-150 ${
              notification.read 
                ? 'border-border bg-white hover:bg-muted/30' :'border-primary/20 bg-primary/5 hover:bg-primary/10'
            }`}
          >
            <div className={`w-8 h-8 rounded-full bg-muted flex items-center justify-center ${getNotificationColor(notification.type, notification.priority)}`}>
              <Icon name={getNotificationIcon(notification.type)} size={16} />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-1">
                <h5 className={`text-sm font-medium ${notification.read ? 'text-text-secondary' : 'text-text-primary'}`}>
                  {notification.title}
                </h5>
                <div className="flex items-center gap-2">
                  {notification.priority === 'high' && (
                    <Icon name="AlertTriangle" size={12} className="text-error" />
                  )}
                  <span className="text-xs text-text-secondary whitespace-nowrap">
                    {formatTimeAgo(notification.timestamp)}
                  </span>
                </div>
              </div>
              
              <p className={`text-sm ${notification.read ? 'text-text-secondary' : 'text-text-primary'} mb-2`}>
                {notification.message}
              </p>
              
              {notification.user && (
                <div className="flex items-center gap-2">
                  <Image
                    src={notification.user.avatar}
                    alt={notification.user.name}
                    className="w-5 h-5 rounded-full"
                  />
                  <span className="text-xs text-text-secondary">
                    {notification.user.name}
                  </span>
                </div>
              )}
              
              {notification.actions && (
                <div className="flex items-center gap-2 mt-2">
                  {notification.actions.map((action, index) => (
                    <Button
                      key={index}
                      variant={action.variant || 'outline'}
                      size="sm"
                      onClick={() => console.log(`Action: ${action.label}`)}
                      className="text-xs"
                    >
                      {action.label}
                    </Button>
                  ))}
                </div>
              )}
            </div>

            {!notification.read && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleMarkAsRead(notification.id)}
                iconName="Check"
                className="flex-shrink-0"
              />
            )}
          </div>
        ))}
      </div>

      {loading && (
        <div className="text-center py-8">
          <Icon name="Loader" size={32} className="text-text-secondary mx-auto mb-3 animate-spin" />
          <p className="text-text-secondary">Loading notifications...</p>
        </div>
      )}

      {!loading && filteredNotifications.length === 0 && (
        <div className="text-center py-8">
          <Icon name="Bell" size={48} className="text-text-secondary mx-auto mb-3" />
          <p className="text-text-secondary">
            {filter === 'all' ? 'No notifications' : `No ${filter} notifications`}
          </p>
        </div>
      )}
    </div>
  );
};

export default NotificationPanel;