import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const NotificationCenter = ({ notifications, onNotificationRead }) => {
  const [isOpen, setIsOpen] = useState(false);

  const unreadCount = notifications?.filter(n => !n.read_at)?.length || 0;

  const getNotificationIcon = (type) => {
    const iconMap = {
      info: 'Info',
      success: 'CheckCircle',
      warning: 'AlertTriangle',
      error: 'AlertCircle'
    };
    return iconMap[type] || 'Bell';
  };

  const getNotificationColor = (type) => {
    const colorMap = {
      info: 'text-blue-600 bg-blue-50',
      success: 'text-green-600 bg-green-50',
      warning: 'text-yellow-600 bg-yellow-50',
      error: 'text-red-600 bg-red-50'
    };
    return colorMap[type] || 'text-gray-600 bg-gray-50';
  };

  const handleNotificationClick = async (notification) => {
    if (!notification?.read_at) {
      await onNotificationRead?.(notification.id);
    }
  };

  return (
    <div className="relative">
      {/* Notification Bell */}
      <Button
        variant="ghost"
        size="sm"
        className="relative"
        iconName="Bell"
        onClick={() => setIsOpen(!isOpen)}
      />
      
      {/* Badge */}
      {unreadCount > 0 && (
        <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
          {unreadCount > 99 ? '99+' : unreadCount}
        </div>
      )}

      {/* Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Panel */}
          <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-border z-20">
            {/* Header */}
            <div className="px-4 py-3 border-b border-border">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-text-primary">
                  Notifications
                </h3>
                {unreadCount > 0 && (
                  <span className="text-xs text-text-secondary">
                    {unreadCount} unread
                  </span>
                )}
              </div>
            </div>

            {/* Notifications List */}
            <div className="max-h-80 overflow-y-auto">
              {notifications?.length > 0 ? (
                <div className="divide-y divide-border">
                  {notifications.slice(0, 10).map(notification => (
                    <div
                      key={notification?.id}
                      className={`px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors ${
                        !notification?.read_at ? 'bg-blue-50/30' : ''
                      }`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex items-start space-x-3">
                        {/* Icon */}
                        <div className={`p-1.5 rounded-lg flex-shrink-0 ${getNotificationColor(notification?.notification_type)}`}>
                          <Icon 
                            name={getNotificationIcon(notification?.notification_type)} 
                            size={14} 
                          />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-text-primary text-sm">
                            {notification?.title}
                          </h4>
                          
                          {notification?.message && (
                            <p className="text-text-secondary text-xs mt-1 line-clamp-2">
                              {notification.message}
                            </p>
                          )}
                          
                          <p className="text-text-secondary text-xs mt-1">
                            {formatDistanceToNow(new Date(notification?.created_at), { addSuffix: true })}
                          </p>
                        </div>

                        {/* Unread Indicator */}
                        {!notification?.read_at && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="px-4 py-8 text-center">
                  <Icon name="Bell" size={32} className="text-text-secondary mx-auto mb-2" />
                  <p className="text-text-secondary text-sm">
                    No notifications yet
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications?.length > 0 && (
              <div className="px-4 py-3 border-t border-border">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-xs"
                  onClick={() => {
                    console.log('View all notifications');
                    setIsOpen(false);
                  }}
                >
                  View All Notifications
                </Button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationCenter;