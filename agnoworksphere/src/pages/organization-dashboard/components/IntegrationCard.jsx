import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const IntegrationCard = ({ integration, onUpdate }) => {
  const [isUpdating, setIsUpdating] = useState(false);

  const getIntegrationIcon = (type) => {
    const iconMap = {
      slack: 'MessageCircle',
      teams: 'Users',
      calendar: 'Calendar',
      github: 'Github',
      gmail: 'Mail',
      drive: 'HardDrive',
      zoom: 'Video',
      trello: 'Trello'
    };
    return iconMap[type] || 'Puzzle';
  };

  const getStatusColor = (status) => {
    const colorMap = {
      connected: 'text-green-600 bg-green-50 border-green-200',
      disconnected: 'text-gray-600 bg-gray-50 border-gray-200',
      error: 'text-red-600 bg-red-50 border-red-200',
      pending: 'text-yellow-600 bg-yellow-50 border-yellow-200'
    };
    return colorMap[status] || 'text-gray-600 bg-gray-50 border-gray-200';
  };

  const getStatusText = (status) => {
    const textMap = {
      connected: 'Connected',
      disconnected: 'Disconnected',
      error: 'Error',
      pending: 'Pending'
    };
    return textMap[status] || 'Unknown';
  };

  const handleToggleConnection = async () => {
    if (isUpdating) return;
    
    setIsUpdating(true);
    try {
      const newStatus = integration?.status === 'connected' ? 'disconnected' : 'connected';
      await onUpdate?.(integration?.id, { 
        status: newStatus,
        last_sync_at: newStatus === 'connected' ? new Date().toISOString() : null
      });
    } catch (error) {
      console.log('Integration toggle error:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSync = async () => {
    if (isUpdating || integration?.status !== 'connected') return;
    
    setIsUpdating(true);
    try {
      await onUpdate?.(integration?.id, { 
        last_sync_at: new Date().toISOString()
      });
    } catch (error) {
      console.log('Integration sync error:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="bg-white border border-border rounded-lg p-4 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Icon 
              name={getIntegrationIcon(integration?.integration_type)} 
              size={20} 
              className="text-primary" 
            />
          </div>
          <div>
            <h3 className="font-medium text-text-primary">
              {integration?.integration_name}
            </h3>
            <p className="text-sm text-text-secondary capitalize">
              {integration?.integration_type}
            </p>
          </div>
        </div>
        
        <div className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(integration?.status)}`}>
          {getStatusText(integration?.status)}
        </div>
      </div>

      {/* Configuration Info */}
      {integration?.config && Object.keys(integration.config).length > 0 && (
        <div className="mb-3 p-2 bg-gray-50 rounded text-xs">
          {integration?.integration_type === 'slack' && integration?.config?.workspace && (
            <p><span className="font-medium">Workspace:</span> {integration.config.workspace}</p>
          )}
          {integration?.integration_type === 'teams' && integration?.config?.tenant && (
            <p><span className="font-medium">Tenant:</span> {integration.config.tenant}</p>
          )}
          {integration?.integration_type === 'calendar' && integration?.config?.calendar_ids && (
            <p><span className="font-medium">Calendars:</span> {integration.config.calendar_ids.length}</p>
          )}
        </div>
      )}

      {/* Error Message */}
      {integration?.error_message && (
        <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
          {integration.error_message}
        </div>
      )}

      {/* Last Sync */}
      {integration?.last_sync_at && (
        <p className="text-xs text-text-secondary mb-3">
          Last synced: {new Date(integration.last_sync_at).toLocaleDateString()} at{' '}
          {new Date(integration.last_sync_at).toLocaleTimeString()}
        </p>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-3 border-t border-border">
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleToggleConnection}
            disabled={isUpdating}
            iconName={integration?.status === 'connected' ? 'Unplug' : 'Plug'}
            iconPosition="left"
          >
            {isUpdating ? 'Updating...' : integration?.status === 'connected' ? 'Disconnect' : 'Connect'}
          </Button>
          
          {integration?.status === 'connected' && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleSync}
              disabled={isUpdating}
              iconName="RefreshCw"
              iconPosition="left"
            >
              Sync
            </Button>
          )}
        </div>

        <Button
          variant="ghost"
          size="sm"
          iconName="Settings"
          onClick={() => console.log('Configure integration:', integration?.id)}
        />
      </div>
    </div>
  );
};

export default IntegrationCard;