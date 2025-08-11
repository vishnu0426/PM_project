import React, { useState, useEffect } from 'react';
import RoleBasedHeader from '../../components/ui/RoleBasedHeader';
import Breadcrumb from '../../components/ui/Breadcrumb';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import apiService from '../../utils/apiService';
import { useUserProfile } from '../../hooks/useUserProfile';

const Analytics = () => {
  const { userProfile, currentOrganization: profileOrg } = useUserProfile();
  // Authentication state
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState('member');
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState({
    userActivity: {
      dailyActiveUsers: [],
    },
    organizationPerformance: {
      performanceMetrics: [],
    },
    projectStats: {},
    usageAnalytics: {
      mostUsedFeatures: [],
      deviceBreakdown: [],
    },
  });

  // Time period filter
  const [timePeriod, setTimePeriod] = useState('30d');
  const timePeriods = [
    { value: '7d', label: 'Last 7 days' },
    { value: '30d', label: 'Last 30 days' },
    { value: '90d', label: 'Last 3 months' },
    { value: '1y', label: 'Last year' },
  ];

  useEffect(() => {
    // derive user and role from unified profile
    if (userProfile) {
      setCurrentUser(userProfile);
      setUserRole((userProfile.role || 'member').toLowerCase());
    }
  }, [userProfile]);

  useEffect(() => {
    loadAnalyticsData();
  }, [timePeriod]);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);

      // Load analytics data from API
      const [userActivity, orgPerformance, projectStats, usageData] =
        await Promise.all([
          apiService.getUserActivityAnalytics(timePeriod),
          apiService.getOrganizationPerformance(timePeriod),
          apiService.getProjectStatistics(timePeriod),
          apiService.getUsageAnalytics(timePeriod),
        ]);

      setAnalyticsData({
        userActivity: userActivity || generateMockUserActivity(),
        organizationPerformance: orgPerformance || generateMockOrgPerformance(),
        projectStats: projectStats || generateMockProjectStats(),
        usageAnalytics: usageData || generateMockUsageAnalytics(),
      });
    } catch (error) {
      console.error('Failed to load analytics data:', error);
      // Use mock data as fallback
      setAnalyticsData({
        userActivity: generateMockUserActivity(),
        organizationPerformance: generateMockOrgPerformance(),
        projectStats: generateMockProjectStats(),
        usageAnalytics: generateMockUsageAnalytics(),
      });
    } finally {
      setLoading(false);
    }
  };

  // Mock data generators for demonstration
  const generateMockUserActivity = () => ({
    totalUsers: 24,
    activeUsers: 18,
    newUsers: 3,
    userGrowth: 12.5,
    dailyActiveUsers: [
      { date: '2024-01-01', users: 15 },
      { date: '2024-01-02', users: 18 },
      { date: '2024-01-03', users: 16 },
      { date: '2024-01-04', users: 20 },
      { date: '2024-01-05', users: 22 },
      { date: '2024-01-06', users: 19 },
      { date: '2024-01-07', users: 24 },
    ],
    topUsers: [
      { name: 'John Doe', email: 'john@acme.com', activity: 95 },
      { name: 'Jane Smith', email: 'jane@acme.com', activity: 87 },
      { name: 'Bob Johnson', email: 'bob@acme.com', activity: 76 },
    ],
  });

  const generateMockOrgPerformance = () => ({
    totalProjects: 12,
    completedProjects: 8,
    activeProjects: 4,
    completionRate: 66.7,
    averageProjectDuration: 45,
    teamProductivity: 78,
    performanceMetrics: [
      { metric: 'Task Completion Rate', value: 85, trend: 'up' },
      { metric: 'Team Collaboration', value: 92, trend: 'up' },
      { metric: 'Project Delivery', value: 78, trend: 'down' },
      { metric: 'Resource Utilization', value: 88, trend: 'up' },
    ],
  });

  const generateMockProjectStats = () => ({
    totalTasks: 156,
    completedTasks: 124,
    inProgressTasks: 24,
    overdueTasks: 8,
    taskCompletionRate: 79.5,
    averageTaskDuration: 3.2,
    projectsByStatus: [
      { status: 'Completed', count: 8, percentage: 66.7 },
      { status: 'In Progress', count: 3, percentage: 25 },
      { status: 'Planning', count: 1, percentage: 8.3 },
    ],
  });

  const generateMockUsageAnalytics = () => ({
    totalSessions: 342,
    averageSessionDuration: 28,
    pageViews: 1456,
    bounceRate: 23,
    mostUsedFeatures: [
      { feature: 'Kanban Board', usage: 89 },
      { feature: 'Team Chat', usage: 76 },
      { feature: 'File Sharing', usage: 65 },
      { feature: 'Time Tracking', usage: 54 },
    ],
    deviceBreakdown: [
      { device: 'Desktop', percentage: 68 },
      { device: 'Mobile', percentage: 24 },
      { device: 'Tablet', percentage: 8 },
    ],
  });

  // Check if user has access to analytics
  if (userRole !== 'owner' && userRole !== 'admin') {
    return (
      <div className='min-h-screen bg-background'>
        <RoleBasedHeader
          userRole={userRole.toLowerCase()}
          currentUser={currentUser}
          currentOrganization={profileOrg}
        />
        <main className='pt-16'>
          <div className='max-w-7xl mx-auto p-6'>
            <div className='flex items-center justify-center h-64'>
              <div className='text-center'>
                <Icon
                  name='Lock'
                  size={32}
                  className='mx-auto mb-4 text-text-secondary'
                />
                <h3 className='text-lg font-medium text-text-primary mb-2'>
                  Access Restricted
                </h3>
                <p className='text-text-secondary mb-4'>
                  Analytics are only available to Owner and Admin users.
                </p>
                <Button onClick={() => window.history.back()}>Go Back</Button>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-background'>
      <RoleBasedHeader
        userRole={userRole.toLowerCase()}
        currentUser={
          currentUser
            ? {
                name: `${currentUser.firstName} ${currentUser.lastName}`,
                email: currentUser.email,
                avatar: currentUser.avatar || '/assets/images/avatar.jpg',
                role: userRole,
              }
            : {
                name: 'Loading...',
                email: '',
                avatar: '/assets/images/avatar.jpg',
                role: userRole,
              }
        }
        currentOrganization={profileOrg}
      />

      <main className='pt-16'>
        <div className='max-w-7xl mx-auto p-6'>
          <Breadcrumb />

          {/* Page Header */}
          <div className='flex items-center justify-between mb-8'>
            <div>
              <h1 className='text-3xl font-bold text-text-primary'>
                Analytics Dashboard
              </h1>
              <p className='text-text-secondary mt-2'>
                Comprehensive insights into your organization's performance and
                usage
              </p>
            </div>

            {/* Time Period Filter */}
            <div className='flex items-center space-x-4'>
              <select
                value={timePeriod}
                onChange={(e) => setTimePeriod(e.target.value)}
                className='px-4 py-2 border border-border rounded-lg bg-card text-text-primary focus:outline-none focus:ring-2 focus:ring-primary'
              >
                {timePeriods.map((period) => (
                  <option key={period.value} value={period.value}>
                    {period.label}
                  </option>
                ))}
              </select>

              <Button variant='outline' iconName='Download'>
                Export Report
              </Button>
            </div>
          </div>

          {loading ? (
            <div className='flex items-center justify-center h-64'>
              <div className='text-center'>
                <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4'></div>
                <p className='text-text-secondary'>Loading analytics data...</p>
              </div>
            </div>
          ) : (
            <div className='space-y-8'>
              {/* Key Metrics Overview */}
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
                <div className='bg-card rounded-lg border border-border p-6'>
                  <div className='flex items-center justify-between'>
                    <div>
                      <p className='text-sm font-medium text-text-secondary'>
                        Total Users
                      </p>
                      <p className='text-2xl font-bold text-text-primary'>
                        {analyticsData.userActivity.totalUsers}
                      </p>
                    </div>
                    <div className='w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center'>
                      <Icon name='Users' size={24} className='text-primary' />
                    </div>
                  </div>
                  <div className='mt-4 flex items-center'>
                    <Icon
                      name='TrendingUp'
                      size={16}
                      className='text-success mr-1'
                    />
                    <span className='text-sm text-success'>
                      +{analyticsData.userActivity.userGrowth}%
                    </span>
                    <span className='text-sm text-text-secondary ml-2'>
                      vs last period
                    </span>
                  </div>
                </div>

                <div className='bg-card rounded-lg border border-border p-6'>
                  <div className='flex items-center justify-between'>
                    <div>
                      <p className='text-sm font-medium text-text-secondary'>
                        Active Projects
                      </p>
                      <p className='text-2xl font-bold text-text-primary'>
                        {analyticsData.organizationPerformance.activeProjects}
                      </p>
                    </div>
                    <div className='w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center'>
                      <Icon
                        name='FolderOpen'
                        size={24}
                        className='text-accent'
                      />
                    </div>
                  </div>
                  <div className='mt-4 flex items-center'>
                    <Icon
                      name='TrendingUp'
                      size={16}
                      className='text-success mr-1'
                    />
                    <span className='text-sm text-success'>+2</span>
                    <span className='text-sm text-text-secondary ml-2'>
                      new this month
                    </span>
                  </div>
                </div>

                <div className='bg-card rounded-lg border border-border p-6'>
                  <div className='flex items-center justify-between'>
                    <div>
                      <p className='text-sm font-medium text-text-secondary'>
                        Completion Rate
                      </p>
                      <p className='text-2xl font-bold text-text-primary'>
                        {analyticsData.projectStats.taskCompletionRate}%
                      </p>
                    </div>
                    <div className='w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center'>
                      <Icon
                        name='CheckCircle'
                        size={24}
                        className='text-success'
                      />
                    </div>
                  </div>
                  <div className='mt-4 flex items-center'>
                    <Icon
                      name='TrendingUp'
                      size={16}
                      className='text-success mr-1'
                    />
                    <span className='text-sm text-success'>+5.2%</span>
                    <span className='text-sm text-text-secondary ml-2'>
                      improvement
                    </span>
                  </div>
                </div>

                <div className='bg-card rounded-lg border border-border p-6'>
                  <div className='flex items-center justify-between'>
                    <div>
                      <p className='text-sm font-medium text-text-secondary'>
                        Team Productivity
                      </p>
                      <p className='text-2xl font-bold text-text-primary'>
                        {analyticsData.organizationPerformance.teamProductivity}
                        %
                      </p>
                    </div>
                    <div className='w-12 h-12 bg-warning/10 rounded-lg flex items-center justify-center'>
                      <Icon name='Zap' size={24} className='text-warning' />
                    </div>
                  </div>
                  <div className='mt-4 flex items-center'>
                    <Icon
                      name='TrendingUp'
                      size={16}
                      className='text-success mr-1'
                    />
                    <span className='text-sm text-success'>+3.1%</span>
                    <span className='text-sm text-text-secondary ml-2'>
                      this week
                    </span>
                  </div>
                </div>
              </div>

              {/* Charts and Detailed Analytics */}
              <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
                {/* User Activity Chart */}
                <div className='bg-card rounded-lg border border-border p-6'>
                  <div className='flex items-center justify-between mb-6'>
                    <h3 className='text-lg font-semibold text-text-primary'>
                      User Activity Trends
                    </h3>
                    <Icon
                      name='BarChart3'
                      size={20}
                      className='text-text-secondary'
                    />
                  </div>

                  <div className='space-y-4'>
                    {(analyticsData.userActivity.dailyActiveUsers || []).map(
                      (day, index) => (
                        <div
                          key={index}
                          className='flex items-center justify-between'
                        >
                          <span className='text-sm text-text-secondary'>
                            {new Date(day.date).toLocaleDateString()}
                          </span>
                          <div className='flex items-center space-x-2'>
                            <div className='w-32 bg-muted rounded-full h-2'>
                              <div
                                className='bg-primary h-2 rounded-full'
                                style={{ width: `${(day.users / 24) * 100}%` }}
                              ></div>
                            </div>
                            <span className='text-sm font-medium text-text-primary w-8'>
                              {day.users}
                            </span>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>

                {/* Performance Metrics */}
                <div className='bg-card rounded-lg border border-border p-6'>
                  <div className='flex items-center justify-between mb-6'>
                    <h3 className='text-lg font-semibold text-text-primary'>
                      Performance Metrics
                    </h3>
                    <Icon
                      name='Target'
                      size={20}
                      className='text-text-secondary'
                    />
                  </div>

                  <div className='space-y-4'>
                    {(
                      analyticsData.organizationPerformance
                        .performanceMetrics || []
                    ).map((metric, index) => (
                      <div
                        key={index}
                        className='flex items-center justify-between'
                      >
                        <span className='text-sm text-text-secondary'>
                          {metric.metric}
                        </span>
                        <div className='flex items-center space-x-2'>
                          <div className='w-24 bg-muted rounded-full h-2'>
                            <div
                              className='bg-primary h-2 rounded-full'
                              style={{ width: `${metric.value}%` }}
                            ></div>
                          </div>
                          <span className='text-sm font-medium text-text-primary w-8'>
                            {metric.value}%
                          </span>
                          <Icon
                            name={
                              metric.trend === 'up'
                                ? 'TrendingUp'
                                : 'TrendingDown'
                            }
                            size={16}
                            className={
                              metric.trend === 'up'
                                ? 'text-success'
                                : 'text-destructive'
                            }
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Analytics;
