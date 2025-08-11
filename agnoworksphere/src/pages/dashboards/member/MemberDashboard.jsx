import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import RoleBasedHeader from '../../../components/ui/RoleBasedHeader';
import KPICard from '../../role-based-dashboard/components/KPICard';
import ProjectCard from '../../role-based-dashboard/components/ProjectCard';
import ActivityFeed from '../../role-based-dashboard/components/ActivityFeed';
import QuickActions from '../../role-based-dashboard/components/QuickActions';
import TaskSummary from '../../role-based-dashboard/components/TaskSummary';
import TeamOverview from '../../role-based-dashboard/components/TeamOverview';
import NotificationPanel from '../../role-based-dashboard/components/NotificationPanel';
import sessionService from '../../../utils/sessionService';
import apiService from '../../../utils/apiService';
import teamService from '../../../utils/teamService';
import notificationService from '../../../utils/notificationService';
import { listenForProjectUpdates } from '../../../utils/projectEventService';
import { useUserProfile } from '../../../hooks/useUserProfile';

const MemberDashboard = () => {
  const location = useLocation();

  // Use centralized user profile hook
  const {
    userProfile,
    currentOrganization: hookCurrentOrganization,
    availableOrganizations,
    loading: profileLoading,
  } = useUserProfile();

  const [searchValue, setSearchValue] = useState('');
  const [filterValue, setFilterValue] = useState('all');
  const [dashboardData, setDashboardData] = useState(null);
  const [projects, setProjects] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showWelcome, setShowWelcome] = useState(false);
  const [welcomeMessage, setWelcomeMessage] = useState('');

  // Real team members data
  const [teamMembers, setTeamMembers] = useState([]);

  // Real notifications data
  const [notifications, setNotifications] = useState([]);
  const [notificationsLoading, setNotificationsLoading] = useState(true);

  // Helper to get current organization ID
  const getCurrentOrganizationId = () => {
    return organizations?.[0]?.id || hookCurrentOrganization?.id;
  };

  // Load dashboard data from backend
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);

        // Check for welcome message from navigation state
        if (location.state?.message && location.state?.type === 'success') {
          setWelcomeMessage(location.state.message);
          setShowWelcome(true);
          // Clear the state to prevent showing on refresh
          window.history.replaceState({}, document.title);
        }

        // Get current user from session service
        const currentUser = sessionService.getCurrentUser();

        if (currentUser) {
          setCurrentUser(currentUser);

          // Get user's organizations via API
          try {
            const userResult = await apiService.users.getCurrentUser();
            console.log('🔍 MEMBER: User API result:', userResult);

            if (userResult?.organizations) {
              setOrganizations(userResult.organizations);
              console.log(
                '✅ MEMBER: Organizations loaded:',
                userResult.organizations
              );
            } else {
              console.warn('⚠️ MEMBER: No organizations in API response');
              // Use fallback organization
              setOrganizations([
                {
                  id: sessionService.getOrganizationId() || 'fallback-org',
                  name: 'Organization',
                  domain: 'example.com',
                },
              ]);
            }
          } catch (error) {
            console.error('❌ MEMBER: Failed to load organizations:', error);
            // Use fallback organization
            setOrganizations([
              {
                id: sessionService.getOrganizationId() || 'fallback-org',
                name: 'Organization',
                domain: 'example.com',
              },
            ]);
          }
        } else {
          console.warn('No user data available from session');
          return; // Don't proceed without user
        }

        // Get projects using organization ID from session service
        const organizationId = sessionService.getOrganizationId();
        if (organizationId) {
          const projectsResult = await apiService.projects.getAll(
            organizationId
          );
          setProjects(projectsResult || []);

          // Get team members
          try {
            const teamMembersResult = await teamService.getTeamMembers(
              organizationId
            );
            setTeamMembers(teamMembersResult || []);
          } catch (teamError) {
            console.error('Failed to load team members:', teamError);
            setTeamMembers([]); // Clear team members on error
          }

          // Get notifications
          try {
            setNotificationsLoading(true);
            const notificationsResult =
              await notificationService.getNotifications(organizationId);
            setNotifications(notificationsResult || []);
          } catch (notificationError) {
            console.error('Failed to load notifications:', notificationError);
            setNotifications([]);
          } finally {
            setNotificationsLoading(false);
          }

          // Get dashboard stats
          try {
            const statsResult = await authService.getDashboardStats();
            if (statsResult.data) {
              setDashboardData(statsResult.data);
            }
          } catch (statsError) {
            console.error('Failed to load dashboard stats:', statsError);
          }
        }
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
        setError(error.message);

        // Set fallback data on error
        if (!currentUser) {
          setCurrentUser({
            id: 'fallback-user',
            firstName: 'Member',
            lastName: 'User',
            email: 'member@example.com',
            role: 'member',
          });
        }

        if (organizations.length === 0) {
          setOrganizations([
            {
              id: 'fallback-org',
              name: 'Default Organization',
              domain: 'example.com',
            },
          ]);
        }

        // Set empty arrays for other data
        setProjects([]);
        setTeamMembers([]);
        setNotifications([]);
        setNotificationsLoading(false);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [location.state]);

  // Listen for real-time project updates
  useEffect(() => {
    const organizationId = getCurrentOrganizationId();
    if (!organizationId) return;

    const unsubscribe = listenForProjectUpdates((updateData) => {
      const { action, project, organizationId: eventOrgId } = updateData;

      // Only handle updates for our organization
      if (eventOrgId !== organizationId) return;

      if (action === 'created' && project) {
        setProjects((prevProjects) => [...prevProjects, project]);
      } else if (action === 'updated' && project) {
        setProjects((prevProjects) => {
          const existingIndex = prevProjects.findIndex(
            (p) => p.id === project.id
          );
          if (existingIndex >= 0) {
            // Update existing project
            const newProjects = [...prevProjects];
            newProjects[existingIndex] = project;
            return newProjects;
          }
          return prevProjects;
        });
      } else if (action === 'deleted' && project) {
        setProjects((prevProjects) =>
          prevProjects.filter((p) => p.id !== project.id)
        );
      } else if (action === 'refresh') {
        // Projects will be refreshed automatically by the event system
        console.log('🔄 Project refresh requested');
      }
    });

    return unsubscribe;
  }, [organizations]);

  // Member-specific KPI data
  const getMemberKPIData = () => {
    const realData = dashboardData || {};

    return [
      {
        title: 'My Projects',
        value: realData.total_projects?.toString() || '0',
        change: '+0',
        changeType: 'neutral',
        icon: 'FolderOpen',
        color: 'primary',
      },
      {
        title: 'My Organization',
        value: '1',
        change: '+0',
        changeType: 'neutral',
        icon: 'Building',
        color: 'success',
      },
      {
        title: 'Team Members',
        value: realData.total_members?.toString() || '1',
        change: '+0',
        changeType: 'neutral',
        icon: 'Users',
        color: 'accent',
      },
      {
        title: 'My Activity',
        value: realData.total_activity?.toString() || '0',
        change: '+0',
        changeType: 'neutral',
        icon: 'Activity',
        color: 'warning',
      },
    ];
  };

  // Filter projects based on search and filter criteria - members see all organization projects
  const filteredProjects = projects.filter((project) => {
    const matchesSearch = project.name
      .toLowerCase()
      .includes(searchValue.toLowerCase());
    const matchesFilter =
      filterValue === 'all' || project.status === filterValue;
    return matchesSearch && matchesFilter;
  });

  // Show loading state
  if (loading) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4'></div>
          <p className='text-slate-600'>Loading your member dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 to-blue-50'>
      {/* Welcome Message */}
      {showWelcome && welcomeMessage && (
        <div className='bg-green-50 border-l-4 border-green-400 p-4 mb-6 mx-6'>
          <div className='flex'>
            <div className='flex-shrink-0'>
              <svg
                className='h-5 w-5 text-green-400'
                viewBox='0 0 20 20'
                fill='currentColor'
              >
                <path
                  fillRule='evenodd'
                  d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
                  clipRule='evenodd'
                />
              </svg>
            </div>
            <div className='ml-3'>
              <p className='text-sm text-green-700'>{welcomeMessage}</p>
            </div>
            <div className='ml-auto pl-3'>
              <button
                onClick={() => setShowWelcome(false)}
                className='text-green-400 hover:text-green-600'
              >
                <span className='sr-only'>Dismiss</span>
                <svg
                  className='h-5 w-5'
                  viewBox='0 0 20 20'
                  fill='currentColor'
                >
                  <path
                    fillRule='evenodd'
                    d='M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z'
                    clipRule='evenodd'
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <RoleBasedHeader
        userRole='member'
        currentUser={currentUser}
        currentOrganization={organizations[0]}
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        filterValue={filterValue}
        onFilterChange={setFilterValue}
      />

      {/* Dashboard Stats Bar */}
      <div className='bg-white shadow-sm border-b border-slate-200'>
        <div className='max-w-7xl mx-auto px-6 py-4'>
          <div className='flex items-center justify-between text-sm text-slate-600'>
            <span>My Projects: {dashboardData?.total_projects || 0}</span>
            <span>•</span>
            <span>Team Members: {dashboardData?.total_members || 0}</span>
            <span>•</span>
            <span>My Activity: {dashboardData?.total_activity || 0}</span>
          </div>
        </div>
      </div>

      {/* Dashboard content */}
      <div className='max-w-7xl mx-auto px-6 py-8'>
        {/* KPI Cards */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
          {getMemberKPIData().map((kpi, index) => (
            <KPICard key={index} {...kpi} />
          ))}
        </div>

        {/* Main Content Grid */}
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8'>
          {/* Left Column - Projects */}
          <div className='lg:col-span-2'>
            {/* Projects Section with enhanced header */}
            <div className='space-y-6'>
              <div className='flex items-center justify-between'>
                <div>
                  <h2 className='text-2xl font-semibold text-slate-800 tracking-tight'>
                    My Projects
                  </h2>
                  <p className='text-slate-600 mt-1'>
                    View and collaborate on organization projects
                  </p>
                </div>
              </div>

              {/* Projects Grid */}
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                {filteredProjects.length > 0 ? (
                  filteredProjects.map((project) => (
                    <ProjectCard
                      key={project.id}
                      project={project}
                      userRole='member'
                    />
                  ))
                ) : (
                  <div className='col-span-2 text-center py-12 bg-white rounded-xl border border-slate-200'>
                    <div className='w-16 h-16 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center'>
                      <svg
                        className='w-8 h-8 text-slate-400'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10'
                        />
                      </svg>
                    </div>
                    <h3 className='text-lg font-medium text-slate-900 mb-2'>
                      No projects available
                    </h3>
                    <p className='text-slate-500 mb-6'>
                      Contact your admin or owner to get access to projects.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Quick Actions (Limited for members) */}
          <div>
            <QuickActions userRole='member' />
          </div>

          {/* Right Column - Activity Feed and Notifications */}
          <div className='space-y-8'>
            <ActivityFeed activities={[]} />
            <NotificationPanel
              notifications={notifications}
              loading={notificationsLoading}
            />
          </div>
        </div>

        {/* Bottom Section - Tasks and Team with improved layout */}
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
          <TaskSummary tasks={[]} userRole='member' />
          <TeamOverview teamMembers={teamMembers} userRole='member' />
        </div>
      </div>
    </div>
  );
};

export default MemberDashboard;
