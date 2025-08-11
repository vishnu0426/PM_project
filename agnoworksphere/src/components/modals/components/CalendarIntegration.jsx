import React, { useState, useEffect } from 'react';
import Button from '../../ui/Button';
import Icon from '../../AppIcon';

const CalendarIntegration = ({ projectData }) => {
  const [connectedCalendars, setConnectedCalendars] = useState([]);
  const [isConnecting, setIsConnecting] = useState(false);
  const [syncStatus, setSyncStatus] = useState('idle'); // idle, syncing, success, error

  const calendarProviders = [
    {
      id: 'google',
      name: 'Google Calendar',
      icon: 'Calendar',
      color: 'bg-red-500',
      description: 'Sync with Google Calendar and Gmail'
    },
    {
      id: 'outlook',
      name: 'Microsoft Outlook',
      icon: 'Mail',
      color: 'bg-blue-500',
      description: 'Sync with Outlook and Office 365'
    },
    {
      id: 'apple',
      name: 'Apple Calendar',
      icon: 'Smartphone',
      color: 'bg-gray-800',
      description: 'Sync with iCloud Calendar'
    }
  ];

  useEffect(() => {
    loadConnectedCalendars();
  }, []);

  const loadConnectedCalendars = async () => {
    try {
      // This would fetch from your API
      const calendars = [
        {
          id: 'google-cal-1',
          provider: 'google',
          email: 'john@example.com',
          isActive: true,
          lastSync: '2024-01-15T10:30:00Z'
        }
      ];
      setConnectedCalendars(calendars);
    } catch (error) {
      console.error('Failed to load calendars:', error);
    }
  };

  const handleConnectCalendar = async (providerId) => {
    setIsConnecting(true);
    try {
      // This would initiate OAuth flow
      const authUrl = await getCalendarAuthUrl(providerId);
      
      // Open OAuth popup
      const popup = window.open(
        authUrl,
        'calendar-auth',
        'width=500,height=600,scrollbars=yes,resizable=yes'
      );

      // Listen for OAuth completion
      const checkClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkClosed);
          setIsConnecting(false);
          // Refresh connected calendars
          loadConnectedCalendars();
        }
      }, 1000);

    } catch (error) {
      console.error('Failed to connect calendar:', error);
      setIsConnecting(false);
    }
  };

  const handleDisconnectCalendar = async (calendarId) => {
    try {
      await disconnectCalendar(calendarId);
      setConnectedCalendars(prev => prev.filter(cal => cal.id !== calendarId));
    } catch (error) {
      console.error('Failed to disconnect calendar:', error);
    }
  };

  const handleSyncCalendars = async () => {
    setSyncStatus('syncing');
    try {
      await syncAllCalendars();
      setSyncStatus('success');
      setTimeout(() => setSyncStatus('idle'), 3000);
    } catch (error) {
      console.error('Failed to sync calendars:', error);
      setSyncStatus('error');
      setTimeout(() => setSyncStatus('idle'), 3000);
    }
  };

  const getCalendarAuthUrl = async (providerId) => {
    // This would generate the OAuth URL for the provider
    const baseUrls = {
      google: 'https://accounts.google.com/oauth2/auth',
      outlook: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
      apple: 'https://appleid.apple.com/auth/authorize'
    };
    
    return `${baseUrls[providerId]}?client_id=your_client_id&redirect_uri=your_redirect_uri&scope=calendar`;
  };

  const disconnectCalendar = async (calendarId) => {
    // API call to disconnect calendar
    console.log('Disconnecting calendar:', calendarId);
  };

  const syncAllCalendars = async () => {
    // API call to sync all calendars
    console.log('Syncing all calendars');
  };

  const getProviderInfo = (providerId) => {
    return calendarProviders.find(p => p.id === providerId);
  };

  const formatLastSync = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-gray-700">Calendar Integration</h4>
        {connectedCalendars.length > 0 && (
          <Button
            size="sm"
            variant="outline"
            onClick={handleSyncCalendars}
            disabled={syncStatus === 'syncing'}
            iconName={syncStatus === 'syncing' ? 'Loader2' : 'RefreshCw'}
            className={`text-xs ${syncStatus === 'syncing' ? 'animate-spin' : ''}`}
          >
            {syncStatus === 'syncing' ? 'Syncing...' : 'Sync Now'}
          </Button>
        )}
      </div>

      {/* Sync Status */}
      {syncStatus !== 'idle' && (
        <div className={`p-2 rounded text-xs ${
          syncStatus === 'success' 
            ? 'bg-green-50 text-green-700 border border-green-200'
            : syncStatus === 'error'
              ? 'bg-red-50 text-red-700 border border-red-200'
              : 'bg-blue-50 text-blue-700 border border-blue-200'
        }`}>
          {syncStatus === 'success' && '✓ Calendars synced successfully'}
          {syncStatus === 'error' && '✗ Failed to sync calendars'}
          {syncStatus === 'syncing' && '⟳ Syncing calendars...'}
        </div>
      )}

      {/* Connected Calendars */}
      {connectedCalendars.length > 0 && (
        <div className="space-y-2">
          <h5 className="text-xs font-medium text-gray-600">Connected Calendars</h5>
          {connectedCalendars.map(calendar => {
            const provider = getProviderInfo(calendar.provider);
            return (
              <div key={calendar.id} className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 ${provider.color} rounded flex items-center justify-center`}>
                    <Icon name={provider.icon} size={12} className="text-white" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">{provider.name}</div>
                    <div className="text-xs text-gray-600">{calendar.email}</div>
                    <div className="text-xs text-gray-500">
                      Last sync: {formatLastSync(calendar.lastSync)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${calendar.isActive ? 'bg-green-500' : 'bg-gray-400'}`} />
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDisconnectCalendar(calendar.id)}
                    iconName="X"
                    className="text-red-600 hover:text-red-800"
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Available Providers */}
      <div className="space-y-2">
        <h5 className="text-xs font-medium text-gray-600">
          {connectedCalendars.length > 0 ? 'Connect Additional Calendars' : 'Connect Your Calendar'}
        </h5>
        {calendarProviders
          .filter(provider => !connectedCalendars.some(cal => cal.provider === provider.id))
          .map(provider => (
            <div key={provider.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
              <div className="flex items-center gap-3">
                <div className={`w-6 h-6 ${provider.color} rounded flex items-center justify-center`}>
                  <Icon name={provider.icon} size={12} className="text-white" />
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900">{provider.name}</div>
                  <div className="text-xs text-gray-600">{provider.description}</div>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleConnectCalendar(provider.id)}
                disabled={isConnecting}
                iconName="Plus"
                className="text-xs"
              >
                Connect
              </Button>
            </div>
          ))}
      </div>

      {/* Benefits */}
      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <h6 className="text-xs font-medium text-blue-800 mb-2 flex items-center gap-1">
          <Icon name="Info" size={12} />
          Calendar Integration Benefits
        </h6>
        <ul className="text-xs text-blue-700 space-y-1">
          <li>• Automatic meeting invites with calendar events</li>
          <li>• Conflict detection and alternative time suggestions</li>
          <li>• Bi-directional sync with your existing calendar</li>
          <li>• Reminder notifications before meetings</li>
        </ul>
      </div>
    </div>
  );
};

export default CalendarIntegration;
