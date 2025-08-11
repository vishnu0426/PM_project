import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import * as organizationService from '../../utils/organizationService';
import authService from '../../utils/authService';
import IntegrationCard from './components/IntegrationCard';
import ActivityFeed from './components/ActivityFeed';
import StatsOverview from './components/StatsOverview';
import NotificationCenter from './components/NotificationCenter';

const OrganizationDashboard = () => {
  const { user, userProfile, loading: authLoading } = useAuth();
  const [organization, setOrganization] = useState(null);
  const [integrations, setIntegrations] = useState([]);
  const [activities, setActivities] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [stats, setStats] = useState({
    totalIntegrations: 0,
    activeIntegrations: 0,
    todayActivities: 0,
    unreadNotifications: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get organization ID from auth service
  const organizationId = authService.getOrganizationId();

  const loadDashboardData = useCallback(async () => {
    if (!user?.id || !organizationId) {
      console.log('Missing user or organizationId:', {
        user: user?.id,
        organizationId,
      });
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Load organization data
      const orgResult = await organizationService.getOrganizationDashboard(
        organizationId
      );
      if (orgResult?.success) {
        setOrganization(orgResult.data);
      }

      // Load integrations
      const integrationsResult =
        await organizationService.getOrganizationIntegrations(organizationId);
      if (integrationsResult?.success) {
        setIntegrations(integrationsResult.data || []);
      }

      // Load activities
      const activitiesResult = await organizationService.getRecentActivities(
        organizationId
      );
      if (activitiesResult?.success) {
        setActivities(activitiesResult.data || []);
      }

      // Load notifications
      const notificationsResult = await organizationService.getNotifications(
        user.id
      );
      if (notificationsResult?.success) {
        setNotifications(notificationsResult.data || []);
      }

      // Calculate stats
      const totalIntegrations = integrationsResult?.data?.length || 0;
      const activeIntegrations =
        integrationsResult?.data?.filter((i) => i.status === 'connected')
          ?.length || 0;
      const todayActivities =
        activitiesResult?.data?.filter((a) => {
          const activityDate = new Date(a.occurred_at);
          const today = new Date();
          return activityDate.toDateString() === today.toDateString();
        })?.length || 0;
      const unreadNotifications =
        notificationsResult?.data?.filter((n) => !n.read_at)?.length || 0;

      setStats({
        totalIntegrations,
        activeIntegrations,
        todayActivities,
        unreadNotifications,
      });
    } catch (err) {
      setError('Failed to load dashboard data. Please try again.');
      console.error('Dashboard loading error:', err);
    } finally {
      setLoading(false);
    }
  }, [user, organizationId]);

  // Load dashboard data when component mounts and user is available
  useEffect(() => {
    if (!authLoading && user) {
      loadDashboardData();
    }
  }, [authLoading, user, loadDashboardData]);

  const handleIntegrationUpdate = async (integrationId, updates) => {
    try {
      const result = await organizationService.updateIntegration(
        integrationId,
        updates
      );
      if (result?.success) {
        // Update local state
        setIntegrations((prev) =>
          prev.map((integration) =>
            integration.id === integrationId
              ? { ...integration, ...updates }
              : integration
          )
        );

        // Reload stats
        loadDashboardData();
      } else {
        setError(result?.error || 'Failed to update integration');
      }
    } catch (err) {
      setError('Failed to update integration. Please try again.');
      console.log('Integration update error:', err);
    }
  };

  const handleNotificationRead = async (notificationId) => {
    try {
      const result = await organizationService.markNotificationAsRead(
        notificationId
      );
      if (result?.success) {
        setNotifications((prev) =>
          prev.map((notification) =>
            notification.id === notificationId
              ? { ...notification, read_at: new Date().toISOString() }
              : notification
          )
        );

        // Update unread count
        setStats((prev) => ({
          ...prev,
          unreadNotifications: Math.max(0, prev.unreadNotifications - 1),
        }));
      }
    } catch (err) {
      console.log('Notification update error:', err);
    }
  };

  if (authLoading || loading) {
    return (
      <div className='min-h-screen bg-background flex items-center justify-center'>
        <div className='flex flex-col items-center space-y-4'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary'></div>
          <p className='text-text-secondary'>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className='min-h-screen bg-background flex items-center justify-center'>
        <div className='text-center'>
          <Icon
            name='Lock'
            size={64}
            className='text-text-secondary mx-auto mb-4'
          />
          <h2 className='text-2xl font-bold text-text-primary mb-2'>
            Authentication Required
          </h2>
          <p className='text-text-secondary mb-6'>
            Please sign in to access the organization dashboard.
          </p>
          <Button onClick={() => (window.location.href = '/login')}>
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='min-h-screen bg-background flex items-center justify-center'>
        <div className='text-center max-w-md'>
          <Icon
            name='AlertCircle'
            size={64}
            className='text-destructive mx-auto mb-4'
          />
          <h2 className='text-2xl font-bold text-text-primary mb-2'>
            Error Loading Dashboard
          </h2>
          <p className='text-text-secondary mb-6'>{error}</p>
          <Button onClick={loadDashboardData}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-background'>
      {/* Header */}
      <div className='bg-white border-b border-border'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex items-center justify-between h-16'>
            <div className='flex items-center space-x-4'>
              <Icon name='Building2' size={32} className='text-primary' />
              <div>
                <h1 className='text-xl font-semibold text-text-primary'>
                  {organization?.name || 'Organization Dashboard'}
                </h1>
                <p className='text-sm text-text-secondary'>
                  Welcome back, {userProfile?.full_name || user?.email}
                </p>
              </div>
            </div>

            <div className='flex items-center space-x-4'>
              <NotificationCenter
                notifications={notifications}
                onNotificationRead={handleNotificationRead}
              />

              <div className='flex items-center space-x-2'>
                <div className='w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center'>
                  <Icon name='User' size={16} className='text-primary' />
                </div>
                <span className='text-sm font-medium text-text-primary'>
                  {userProfile?.full_name || user?.email?.split('@')[0]}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        {/* Stats Overview */}
        <StatsOverview stats={stats} />

        {/* Main Grid */}
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8'>
          {/* Integrations Section */}
          <div className='lg:col-span-2'>
            <div className='bg-white rounded-lg border border-border p-6'>
              <div className='flex items-center justify-between mb-6'>
                <h2 className='text-lg font-semibold text-text-primary'>
                  Third-Party Integrations
                </h2>
                <Button
                  variant='outline'
                  size='sm'
                  iconName='Plus'
                  iconPosition='left'
                  onClick={() => console.log('Add integration')}
                >
                  Add Integration
                </Button>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                {integrations?.length > 0 ? (
                  integrations.map((integration) => (
                    <IntegrationCard
                      key={integration.id}
                      integration={integration}
                      onUpdate={handleIntegrationUpdate}
                    />
                  ))
                ) : (
                  <div className='col-span-2 text-center py-12'>
                    <Icon
                      name='Puzzle'
                      size={48}
                      className='text-text-secondary mx-auto mb-4'
                    />
                    <h3 className='text-lg font-medium text-text-primary mb-2'>
                      No Integrations Yet
                    </h3>
                    <p className='text-text-secondary mb-4'>
                      Connect your favorite tools to streamline your workflow
                    </p>
                    <Button
                      iconName='Plus'
                      iconPosition='left'
                      onClick={() => console.log('Add first integration')}
                    >
                      Add Your First Integration
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Activity Feed */}
          <div className='lg:col-span-1'>
            <ActivityFeed
              activities={activities}
              onRefresh={loadDashboardData}
            />
          </div>
        </div>

        {/* Quick Actions */}
        <div className='mt-8 bg-white rounded-lg border border-border p-6'>
          <h2 className='text-lg font-semibold text-text-primary mb-4'>
            Quick Actions
          </h2>
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
            <Button
              variant='outline'
              className='h-20 flex-col space-y-2'
              iconName='Calendar'
              onClick={() => console.log('View calendar')}
            >
              <span className='text-sm'>View Calendar</span>
            </Button>

            <Button
              variant='outline'
              className='h-20 flex-col space-y-2'
              iconName='MessageSquare'
              onClick={() => console.log('Open messages')}
            >
              <span className='text-sm'>Messages</span>
            </Button>

            <Button
              variant='outline'
              className='h-20 flex-col space-y-2'
              iconName='Users'
              onClick={() => (window.location.href = '/team-members')}
            >
              <span className='text-sm'>Team Members</span>
            </Button>

            <Button
              variant='outline'
              className='h-20 flex-col space-y-2'
              iconName='Settings'
              onClick={() => (window.location.href = '/organization-settings')}
            >
              <span className='text-sm'>Settings</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrganizationDashboard;
