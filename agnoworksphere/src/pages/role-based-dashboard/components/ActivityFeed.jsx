import React from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';

const ActivityFeed = ({ activities, userRole }) => {
  const getActivityIcon = (type) => {
    const icons = {
      'project_created': 'FolderPlus',
      'task_completed': 'CheckCircle',
      'comment_added': 'MessageCircle',
      'file_uploaded': 'Upload',
      'member_added': 'UserPlus',
      'status_changed': 'RefreshCw',
      'deadline_updated': 'Calendar'
    };
    return icons[type] || 'Activity';
  };

  const getActivityColor = (type) => {
    const colors = {
      'project_created': 'text-primary',
      'task_completed': 'text-success',
      'comment_added': 'text-accent',
      'file_uploaded': 'text-warning',
      'member_added': 'text-primary',
      'status_changed': 'text-secondary',
      'deadline_updated': 'text-error'
    };
    return colors[type] || 'text-text-secondary';
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const activityTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now - activityTime) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const canViewDetails = userRole !== 'Viewer' || activities.some(activity => activity.isPublic);

  return (
    <div className="bg-white rounded-lg border border-border p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-text-primary">
          Recent Activity
        </h3>
        {canViewDetails && (
          <button className="text-sm text-primary hover:text-primary/80 font-medium">
            View All
          </button>
        )}
      </div>

      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start gap-3">
            <div className={`w-8 h-8 rounded-full bg-muted flex items-center justify-center ${getActivityColor(activity.type)}`}>
              <Icon name={getActivityIcon(activity.type)} size={16} />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Image
                  src={activity.user.avatar}
                  alt={activity.user.name}
                  className="w-6 h-6 rounded-full"
                />
                <span className="text-sm font-medium text-text-primary">
                  {activity.user.name}
                </span>
                <span className="text-xs text-text-secondary">
                  {formatTimeAgo(activity.timestamp)}
                </span>
              </div>
              
              <p className="text-sm text-text-secondary">
                {activity.description}
              </p>
              
              {activity.project && (
                <div className="flex items-center gap-1 mt-1">
                  <Icon name="Folder" size={12} className="text-text-secondary" />
                  <span className="text-xs text-text-secondary">
                    {activity.project}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {activities.length === 0 && (
        <div className="text-center py-8">
          <Icon name="Activity" size={48} className="text-text-secondary mx-auto mb-3" />
          <p className="text-text-secondary">No recent activity</p>
        </div>
      )}
    </div>
  );
};

export default ActivityFeed;