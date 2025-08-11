import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ActivityFeed = ({ activities, onRefresh }) => {
  const getActivityIcon = (type) => {
    const iconMap = {
      meeting: 'Calendar',
      message: 'MessageCircle',
      task: 'CheckSquare',
      integration_event: 'Zap'
    };
    return iconMap[type] || 'Activity';
  };

  const getActivityColor = (type) => {
    const colorMap = {
      meeting: 'text-blue-600 bg-blue-50',
      message: 'text-green-600 bg-green-50',
      task: 'text-purple-600 bg-purple-50',
      integration_event: 'text-orange-600 bg-orange-50'
    };
    return colorMap[type] || 'text-gray-600 bg-gray-50';
  };

  return (
    <div className="bg-white rounded-lg border border-border p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-text-primary">
          Recent Activity
        </h2>
        <Button
          variant="ghost"
          size="sm"
          iconName="RefreshCw"
          onClick={onRefresh}
        />
      </div>

      {/* Activity List */}
      <div className="space-y-4">
        {activities?.length > 0 ? (
          activities.map(activity => (
            <div key={activity?.id} className="flex items-start space-x-3">
              {/* Icon */}
              <div className={`p-2 rounded-lg ${getActivityColor(activity?.activity_type)} flex-shrink-0`}>
                <Icon 
                  name={getActivityIcon(activity?.activity_type)} 
                  size={16} 
                />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-text-primary text-sm">
                  {activity?.title}
                </h4>
                
                {activity?.description && (
                  <p className="text-text-secondary text-xs mt-1 line-clamp-2">
                    {activity.description}
                  </p>
                )}
                
                <div className="flex items-center space-x-2 mt-2 text-xs text-text-secondary">
                  {/* Integration Source */}
                  {activity?.integrations && (
                    <span className="flex items-center space-x-1">
                      <Icon name="Link" size={12} />
                      <span className="capitalize">
                        {activity.integrations.integration_name}
                      </span>
                    </span>
                  )}
                  
                  {/* User */}
                  {activity?.user_profiles?.full_name && (
                    <span className="flex items-center space-x-1">
                      <Icon name="User" size={12} />
                      <span>{activity.user_profiles.full_name}</span>
                    </span>
                  )}
                  
                  {/* Time */}
                  <span className="flex items-center space-x-1">
                    <Icon name="Clock" size={12} />
                    <span>
                      {formatDistanceToNow(new Date(activity?.occurred_at), { addSuffix: true })}
                    </span>
                  </span>
                </div>

                {/* Metadata */}
                {activity?.metadata && Object.keys(activity.metadata).length > 0 && (
                  <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                    {activity?.activity_type === 'meeting' && activity?.metadata?.duration && (
                      <span className="text-text-secondary">
                        Duration: {activity.metadata.duration} minutes
                      </span>
                    )}
                    {activity?.activity_type === 'message' && activity?.metadata?.channel && (
                      <span className="text-text-secondary">
                        Channel: #{activity.metadata.channel}
                      </span>
                    )}
                    {activity?.metadata?.attendees && (
                      <span className="text-text-secondary">
                        Attendees: {activity.metadata.attendees}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <Icon name="Activity" size={32} className="text-text-secondary mx-auto mb-3" />
            <h3 className="font-medium text-text-primary mb-1">
              No Recent Activity
            </h3>
            <p className="text-text-secondary text-sm">
              Connect integrations to see activity here
            </p>
          </div>
        )}
      </div>

      {/* View All Link */}
      {activities?.length > 0 && (
        <div className="mt-6 pt-4 border-t border-border">
          <Button
            variant="ghost"
            size="sm"
            className="w-full"
            iconName="ArrowRight"
            iconPosition="right"
            onClick={() => console.log('View all activities')}
          >
            View All Activity
          </Button>
        </div>
      )}
    </div>
  );
};

export default ActivityFeed;