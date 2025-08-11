import React from 'react';
import Icon from '../../../components/AppIcon';

const StatsOverview = ({ stats }) => {
  const statsData = [
    {
      title: 'Total Integrations',
      value: stats?.totalIntegrations || 0,
      icon: 'Puzzle',
      color: 'text-blue-600 bg-blue-50 border-blue-200'
    },
    {
      title: 'Active Integrations',
      value: stats?.activeIntegrations || 0,
      icon: 'Zap',
      color: 'text-green-600 bg-green-50 border-green-200'
    },
    {
      title: 'Today\'s Activities',
      value: stats?.todayActivities || 0,
      icon: 'Activity',
      color: 'text-purple-600 bg-purple-50 border-purple-200'
    },
    {
      title: 'Unread Notifications',
      value: stats?.unreadNotifications || 0,
      icon: 'Bell',
      color: 'text-orange-600 bg-orange-50 border-orange-200'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {statsData.map((stat, index) => (
        <div
          key={index}
          className="bg-white rounded-lg border border-border p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-secondary text-sm font-medium">
                {stat.title}
              </p>
              <p className="text-text-primary text-2xl font-bold mt-1">
                {stat.value}
              </p>
            </div>
            
            <div className={`p-3 rounded-lg border ${stat.color}`}>
              <Icon name={stat.icon} size={24} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsOverview;