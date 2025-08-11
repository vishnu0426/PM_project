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
import PendingSignoffsPanel from '../../../components/dashboard/PendingSignoffsPanel';
import sessionService from '../../../utils/sessionService.js';
import apiService from '../../../utils/apiService.js';
import authService from '../../../utils/authService.js';
import debugAuth from '../../../utils/authDebug.js';
import teamService from '../../../utils/teamService';
import notificationService from '../../../utils/notificationService';
import CreateProjectModal from '../../../components/modals/CreateProjectModal';
import CreateOrganizationModal from '../../../components/modals/CreateOrganizationModal';
import InviteMemberModal from '../../../components/modals/InviteMemberModal';
import EnhancedProjectCreationWizard from '../../../components/project/EnhancedProjectCreationWizard';
import { listenForProjectUpdates } from '../../../utils/projectEventService';
import { useUserProfile } from '../../../hooks/useUserProfile';
import { useAuth } from '../../../contexts/AuthContext.jsx';

const OwnerDashboard = () => {
  const location = useLocation();
  const { user, getOrganizationId } = useAuth();

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
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [showCreateOrganization, setShowCreateOrganization] = useState(false);
  const [showInviteMember, setShowInviteMember] = useState(false);
  const [showCreateAIProject, setShowCreateAIProject] = useState(false);

  // Real team members data
  const [teamMembers, setTeamMembers] = useState([]);

  // Real notifications data
  const [notifications, setNotifications] = useState([]);
  const [notificationsLoading, setNotificationsLoading] = useState(true);

  // Helper to get current organization ID
  const getCurrentOrganizationId = () => {
    // First try to get from AuthContext (most reliable)
    const authOrgId = getOrganizationId();
    if (authOrgId) return authOrgId;

    // Fallback to other sources
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

        // Debug user role and permissions
        console.log('🔍 Owner Dashboard Debug Info:', {
          currentUser: currentUser,
          userRole: currentUser?.role,
          isAuthenticated: sessionService.isAuthenticated(),
          organizationId: sessionService.getOrganizationId(),
        });

        if (currentUser) {
          setCurrentUser(currentUser);

          // Get user's organizations via API
          try {
            const userResult = await apiService.users.getCurrentUser();
            console.log('🔍 OWNER: User API result:', userResult);

            if (userResult?.organizations) {
              setOrganizations(userResult.organizations);
              console.log(
                '✅ OWNER: Organizations loaded:',
                userResult.organizations
              );
            } else {
              console.warn('⚠️ OWNER: No organizations in API response');
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
            console.error('❌ OWNER: Failed to load organizations:', error);
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

          // Get notifications and check for first-time user
          try {
            setNotificationsLoading(true);
            const notificationsResult =
              await notificationService.getNotifications({ organizationId });
            setNotifications(
              notificationsResult && Array.isArray(notificationsResult.data)
                ? notificationsResult.data
                : []
            );

            // Check if this is a first-time user (no projects, no team members except self)
            const isFirstTimeUser =
              (!projectsResult || projectsResult.length === 0) &&
              (!teamMembersResult || teamMembersResult.length <= 1);

            if (isFirstTimeUser && !location.state?.isNewUser) {
              // Show welcome message for first-time users
              setWelcomeMessage(
                `Welcome to your organization dashboard! As an owner, you have full control over your workspace. Start by creating your first project or inviting team members.`
              );
              setShowWelcome(true);
            }
          } catch (notificationError) {
            console.error('Failed to load notifications:', notificationError);
            setNotifications([]);
          } finally {
            setNotificationsLoading(false);
          }

          // Get dashboard stats
          try {
            const statsResult = await apiService.users.getDashboardStats();
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
            firstName: 'Owner',
            lastName: 'User',
            email: 'owner@example.com',
            role: 'owner',
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
        // Reload projects from API
        loadDashboardData();
      }
    });

    return unsubscribe;
  }, [organizations]);

  // Owner-specific KPI data
  const getOwnerKPIData = () => {
    const realData = dashboardData || {};

    return [
      {
        title: 'Organizations',
        value: realData.total_organizations?.toString() || '1',
        change: '+0',
        changeType: 'neutral',
        icon: 'Building',
        color: 'success',
      },
      {
        title: 'Active Projects',
        value: realData.total_projects?.toString() || '0',
        change: '+0',
        changeType: 'neutral',
        icon: 'FolderOpen',
        color: 'primary',
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
        title: 'Total Activity',
        value: realData.total_activity?.toString() || '0',
        change: '+0',
        changeType: 'neutral',
        icon: 'Activity',
        color: 'warning',
      },
    ];
  };

  // Filter projects based on search and filter criteria
  const filteredProjects = projects.filter((project) => {
    const matchesSearch = project.name
      .toLowerCase()
      .includes(searchValue.toLowerCase());
    const matchesFilter =
      filterValue === 'all' || project.status === filterValue;
    return matchesSearch && matchesFilter;
  });

  // Event handlers
  const handleOpenCreateProject = () => {
    setShowCreateProject(true);
  };

  const handleCloseCreateProject = () => {
    setShowCreateProject(false);
  };

  const handleCreateProject = async (projectData) => {
    try {
      const organizationId = getCurrentOrganizationId();
      if (!organizationId) {
        throw new Error('No organization found');
      }

      console.log('Creating project with:', {
        organizationId,
        projectData,
      });

      // Call the API with correct parameter order: (organizationId, projectData)
      const result = await apiService.projects.create(
        organizationId,
        projectData
      );

      console.log('Project creation result:', result);

      if (result) {
        // Add the new project to the current projects list immediately
        const newProject = {
          id: result.id,
          name: result.name || projectData.name,
          description: result.description || projectData.description,
          status: result.status || 'active',
          priority: result.priority || 'medium',
          created_at: result.created_at || new Date().toISOString(),
          updated_at: result.updated_at || new Date().toISOString(),
          organization_id: organizationId,
          created_by: result.created_by,
        };

        // Update projects list immediately
        setProjects((prevProjects) => [...(prevProjects || []), newProject]);

        // Also refresh from server to ensure consistency
        try {
          const projectsResult = await apiService.projects.getAll(
            organizationId
          );
          if (projectsResult && Array.isArray(projectsResult)) {
            setProjects(projectsResult);
          }
        } catch (refreshError) {
          console.warn('Failed to refresh projects list:', refreshError);
          // Keep the locally updated list if refresh fails
        }

        // Show success message
        console.log('✅ Project created successfully:', newProject.name);

        // Close the create project modal if it's open
        setShowCreateProject(false);
      }
    } catch (error) {
      console.error('Failed to create project:', error);

      // Enhanced error handling for permission issues
      if (
        error.message.includes('Permission denied') ||
        error.message.includes('create_project')
      ) {
        console.error('Permission Details:', {
          organizationId: getCurrentOrganizationId(),
          errorMessage: error.message,
        });

        // Provide user-friendly error message for owners
        throw new Error(
          'Only organization owners can create projects. Please ensure you have owner permissions in this organization.'
        );
      }

      throw error;
    }
  };

  const handleOpenCreateAIProject = () => {
    setShowCreateAIProject(true);
  };

  const handleCloseCreateAIProject = () => {
    setShowCreateAIProject(false);
  };

  const handleCreateAIProject = async (projectData) => {
    try {
      const organizationId = getCurrentOrganizationId();
      if (!organizationId) {
        throw new Error('No organization found');
      }

      const result = await apiService.ai.createAIProject(
        organizationId,
        projectData
      );

      if (result) {
        // Refresh projects list
        const projectsResult = await apiService.projects.getAll(organizationId);
        setProjects(projectsResult || []);
      }
    } catch (error) {
      console.error('Failed to create AI project:', error);
      throw error;
    }
  };

  const handleOpenCreateOrganization = () => {
    setShowCreateOrganization(true);
  };

  const handleCloseCreateOrganization = () => {
    setShowCreateOrganization(false);
  };

  const handleCreateOrganization = async (orgData) => {
    // Implementation for creating organization
    console.log('Creating organization:', orgData);
  };

  const handleManageUsers = () => {
    // Navigate to team members page
    window.location.href = '/team-members';
  };

  const handleInviteMembers = () => {
    setShowInviteMember(true);
  };

  const handleCloseInviteMember = () => {
    setShowInviteMember(false);
  };

  const handleSendInvitation = async (inviteData) => {
    try {
      // Debug authentication state
      console.log('🔍 DEBUG: Checking auth state before invite...');
      debugAuth.checkAuthState();

      const organizationId = getCurrentOrganizationId();
      if (!organizationId) {
        console.error('No organization selected');
        return;
      }

      console.log('Sending invitation:', inviteData);

      const response = await fetch(
        `${
          process.env.REACT_APP_API_URL || 'http://localhost:8000'
        }/api/v1/organizations/${organizationId}/invite`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authService.getAccessToken()}`,
          },
          body: JSON.stringify({
            email: inviteData.email,
            role: inviteData.role,
            message: inviteData.message,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to send invitation');
      }

      const result = await response.json();
      console.log('Invitation sent successfully:', result);

      // Refresh dashboard stats to show updated member count
      const statsResult = await apiService.users.getDashboardStats();
      if (statsResult.data) {
        setDashboardData(statsResult.data);
      }
    } catch (error) {
      console.error('Failed to send invitation:', error);
      throw error;
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4'></div>
          <p className='text-slate-600'>Loading your owner dashboard...</p>
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
        userRole='owner'
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
            <span>
              Organizations: {dashboardData?.total_organizations || 0}
            </span>
            <span>•</span>
            <span>Projects: {dashboardData?.total_projects || 0}</span>
            <span>•</span>
            <span>Members: {dashboardData?.total_members || 0}</span>
          </div>
        </div>
      </div>

      {/* Dashboard content */}
      <div className='max-w-7xl mx-auto px-6 py-8'>
        {/* KPI Cards */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
          {getOwnerKPIData().map((kpi, index) => (
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
                    My Organizations & Projects
                  </h2>
                  <p className='text-slate-600 mt-1'>
                    Manage and track your active projects across all
                    organizations
                  </p>
                </div>
                <div className='flex gap-3'>
                  <button
                    onClick={handleOpenCreateProject}
                    className='inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-sm'
                  >
                    <svg
                      className='w-4 h-4 mr-2'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M12 4v16m8-8H4'
                      />
                    </svg>
                    New Project
                  </button>
                  <button
                    onClick={handleOpenCreateAIProject}
                    className='inline-flex items-center px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors duration-200 shadow-sm'
                  >
                    <svg
                      className='w-4 h-4 mr-2'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M13 10V3L4 14h7v7l9-11h-7z'
                      />
                    </svg>
                    AI Project
                  </button>
                </div>
              </div>

              {/* Projects Grid */}
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                {filteredProjects.length > 0 ? (
                  filteredProjects.map((project) => (
                    <ProjectCard
                      key={project.id}
                      project={project}
                      userRole='owner'
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
                      No projects yet
                    </h3>
                    <p className='text-slate-500 mb-6'>
                      Create your first project to get started with managing
                      your work.
                    </p>
                    <button
                      onClick={handleOpenCreateProject}
                      className='inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200'
                    >
                      <svg
                        className='w-4 h-4 mr-2'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M12 4v16m8-8H4'
                        />
                      </svg>
                      Create Project
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Quick Actions */}
          <div>
            <QuickActions
              userRole='owner'
              onCreateProject={handleOpenCreateProject}
              onCreateOrganization={handleOpenCreateOrganization}
              onManageUsers={handleManageUsers}
              onInviteMembers={handleInviteMembers}
              onCreateAIProject={handleOpenCreateAIProject}
            />
          </div>

          {/* Right Column - Activity Feed, Notifications, and Pending Sign-offs */}
          <div className='space-y-8'>
            <PendingSignoffsPanel userRole='owner' />
            <ActivityFeed activities={[]} />
            <NotificationPanel
              notifications={notifications}
              loading={notificationsLoading}
            />
          </div>
        </div>

        {/* Bottom Section - Tasks and Team with improved layout */}
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
          <TaskSummary tasks={[]} userRole='owner' />
          <TeamOverview
            teamMembers={teamMembers}
            userRole='owner'
            onInviteMembers={handleInviteMembers}
          />
        </div>
      </div>

      {/* Create Project Modal */}
      <CreateProjectModal
        isOpen={showCreateProject}
        onClose={handleCloseCreateProject}
        onCreateProject={handleCreateProject}
        organizationId={getCurrentOrganizationId()}
        organizationName={organizations[0]?.name || 'Organization'}
      />

      {/* Create AI Project Modal - Owner Only */}
      <EnhancedProjectCreationWizard
        isOpen={showCreateAIProject}
        onClose={handleCloseCreateAIProject}
        onCreateProject={handleCreateAIProject}
        organizationId={getCurrentOrganizationId()}
      />

      {/* Create Organization Modal */}
      <CreateOrganizationModal
        isOpen={showCreateOrganization}
        onClose={handleCloseCreateOrganization}
        onCreateOrganization={handleCreateOrganization}
      />

      {/* Owner Invite Member Modal */}
      <InviteMemberModal
        isOpen={showInviteMember}
        onClose={handleCloseInviteMember}
        onInviteMember={handleSendInvitation}
        organizationId={getCurrentOrganizationId()}
        organizationName={organizations[0]?.name || 'Organization'}
      />
    </div>
  );
};

export default OwnerDashboard;
