import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import RoleBasedHeader from '../../components/ui/RoleBasedHeader';
import Breadcrumb from '../../components/ui/Breadcrumb';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';
import OwnerInviteMemberModal from '../../components/modals/InviteMemberModal';
import AdminInviteMemberModal from '../team-members/components/InviteMemberModal';
import CreateTaskModal from '../../components/modals/CreateTaskModal';
import teamService from '../../utils/teamService';
import authService from '../../utils/authService';
import sessionService from '../../utils/sessionService';

const ProjectOverview = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { projectId: urlProjectId } = useParams();
  const { user } = useAuth();

  // Real project data state
  const [currentProject, setCurrentProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal states
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false);
  const [currentOrganization, setCurrentOrganization] = useState(null);

  // Load real project data
  useEffect(() => {
    const loadProjectData = async () => {
      try {
        setLoading(true);

        // Get project ID from URL params, route params, or location state
        const urlParams = new URLSearchParams(location.search);
        const projectId =
          urlProjectId || urlParams.get('id') || location.state?.projectId;

        if (!projectId) {
          setError('No project ID provided');
          setLoading(false);
          return;
        }

        console.log('Loading project data for ID:', projectId);

        // Import apiService dynamically to avoid circular imports
        const { default: apiService } = await import('../../utils/apiService');
        const projectData = await apiService.projects.getById(projectId);

        console.log('Loaded project data:', projectData);

        // Transform the data to match the expected format
        const transformedProject = {
          id: projectData.id,
          name: projectData.name || 'Untitled Project',
          description: projectData.description || 'No description available',
          status: projectData.status || 'active',
          priority: projectData.priority || 'medium',
          startDate:
            projectData.start_date || new Date().toISOString().split('T')[0],
          endDate:
            projectData.due_date || new Date().toISOString().split('T')[0],
          progress: projectData.progress || 0,
          progressChange: '+0% this week', // This would come from analytics
          budget: {
            allocated: projectData.budget?.allocated || 0,
            spent: projectData.budget?.spent || 0,
            remaining:
              (projectData.budget?.allocated || 0) -
              (projectData.budget?.spent || 0),
          },
          team: {
            totalMembers: projectData.team?.totalMembers || 0,
            activeMembers: projectData.team?.activeMembers || 0,
            tasksCompleted: projectData.team?.tasksCompleted || 0,
          },
        };

        setCurrentProject(transformedProject);
      } catch (error) {
        console.error('Failed to load project data:', error);
        setError('Failed to load project data');

        // Set fallback project data if API fails
        const fallbackProject = {
          id: 'fallback',
          name: location.state?.project?.name || 'Project',
          description: 'Unable to load project details',
          status: 'active',
          priority: 'medium',
          startDate: new Date().toISOString().split('T')[0],
          endDate: new Date().toISOString().split('T')[0],
          progress: 0,
          progressChange: '+0% this week',
          budget: { allocated: 0, spent: 0, remaining: 0 },
          team: { totalMembers: 0, activeMembers: 0, tasksCompleted: 0 },
        };

        setCurrentProject(fallbackProject);
      } finally {
        setLoading(false);
      }
    };

    loadProjectData();
  }, [location.search, location.state, urlProjectId]);

  // Load organization data
  useEffect(() => {
    const loadOrganizationData = async () => {
      try {
        const orgResponse = await authService.getCurrentOrganization();
        if (orgResponse.data && orgResponse.data.organization) {
          setCurrentOrganization(orgResponse.data.organization);
        } else {
          // Fallback organization
          setCurrentOrganization({
            id: authService.getOrganizationId() || 'fallback-org',
            name: 'Organization',
          });
        }
      } catch (error) {
        console.error('Failed to load organization:', error);
        setCurrentOrganization({
          id: 'fallback-org',
          name: 'Organization',
        });
      }
    };

    loadOrganizationData();
  }, []);

  const [userRole, setUserRole] = useState('member');
  const [activeTab, setActiveTab] = useState('overview');

  // Real team members data - will be empty for now since this is project-specific
  const [teamMembers] = useState([]);

  useEffect(() => {
    // Load real user role from auth context or API
    const loadUserData = async () => {
      try {
        // Import authService dynamically to avoid circular imports
        const { default: authService } = await import(
          '../../utils/authService'
        );
        const result = await authService.getCurrentUser();

        if (result.data && result.data.user) {
          const userData = result.data.user;
          // Get user role from the user data
          const role =
            userData.organizationRole ||
            userData.role ||
            sessionService.getUserRole() ||
            'member';
          console.log('User role loaded:', role);
          setUserRole(role.toLowerCase());
        }
      } catch (error) {
        console.error('Error loading user data:', error);
        // Fallback to member role
        setUserRole(sessionService.getUserRole() || 'member');
      }
    };

    loadUserData();
  }, []);

  const tabs = [
    {
      id: 'overview',
      label: 'Overview',
      icon: 'BarChart3',
      description: 'Project summary and key metrics',
      roles: ['viewer', 'member', 'admin', 'owner'],
    },
    {
      id: 'tasks',
      label: 'Tasks',
      icon: 'CheckSquare',
      description: 'Task management and tracking',
      roles: ['viewer', 'member', 'admin', 'owner'],
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: 'Settings',
      description: 'Project configuration and permissions',
      roles: ['admin', 'owner'],
    },
  ];

  const visibleTabs = tabs.filter((tab) => tab.roles.includes(userRole));

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
  };

  const handleGoToBoard = () => {
    if (!currentProject) return;

    navigate('/kanban-board', {
      state: {
        projectId: currentProject.id,
        project: currentProject,
      },
    });
  };

  const handleAddTask = () => {
    if (!currentProject) return;
    setIsCreateTaskModalOpen(true);
  };

  const handleTaskCreated = (newTask) => {
    console.log('New task created:', newTask);
    // Optionally refresh project data or show success message
    // You could also navigate to kanban board to show the new task
  };

  const handleInviteMembers = () => {
    setIsInviteModalOpen(true);
  };

  // Handler for Owner (single invite)
  const handleOwnerInviteSubmit = async (inviteData) => {
    if (!currentOrganization?.id) {
      console.error('No organization selected');
      return;
    }

    try {
      console.log('Owner inviting member:', inviteData);

      await teamService.inviteTeamMember(currentOrganization.id, {
        email: inviteData.email,
        role: inviteData.role,
        organization_id: currentOrganization.id,
      });

      console.log('Invitation sent successfully');
    } catch (error) {
      console.error('Failed to invite member:', error);
      throw error; // Let the modal handle the error display
    }
  };

  // Handler for Admin (bulk invite)
  const handleAdminInviteSubmit = async (inviteData) => {
    if (!currentOrganization?.id) {
      console.error('No organization selected');
      return;
    }

    try {
      console.log('Admin inviting members:', inviteData);

      // Send invitations through API
      for (const email of inviteData.emails) {
        await teamService.inviteTeamMember(currentOrganization.id, {
          email,
          role: inviteData.role,
          message: inviteData.welcomeMessage,
        });
      }

      console.log('Invitations sent successfully');
    } catch (error) {
      console.error('Failed to invite members:', error);
      // You might want to show an error message to the user here
    }
  };

  const getStatusColor = (status) => {
    if (!status) return 'bg-muted text-text-secondary';

    switch (status.toLowerCase()) {
      case 'good':
        return 'bg-success/10 text-success';
      case 'at risk':
        return 'bg-warning/10 text-warning';
      case 'delayed':
        return 'bg-destructive/10 text-destructive';
      default:
        return 'bg-muted text-text-secondary';
    }
  };

  const getPriorityColor = (priority) => {
    if (!priority) return 'bg-muted text-text-secondary';

    switch (priority.toLowerCase()) {
      case 'high priority':
        return 'bg-destructive/10 text-destructive';
      case 'medium priority':
        return 'bg-warning/10 text-warning';
      case 'low priority':
        return 'bg-success/10 text-success';
      default:
        return 'bg-muted text-text-secondary';
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className='min-h-screen bg-background'>
        <RoleBasedHeader currentUser={user} userRole={userRole} />
        <main className='pt-16'>
          <div className='max-w-7xl mx-auto p-6'>
            <div className='flex items-center justify-center h-64'>
              <div className='text-center'>
                <Icon
                  name='Loader2'
                  size={32}
                  className='animate-spin mx-auto mb-4 text-primary'
                />
                <p className='text-text-secondary'>Loading project data...</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className='min-h-screen bg-background'>
        <RoleBasedHeader currentUser={user} userRole={userRole} />
        <main className='pt-16'>
          <div className='max-w-7xl mx-auto p-6'>
            <div className='flex items-center justify-center h-64'>
              <div className='text-center'>
                <Icon
                  name='AlertCircle'
                  size={32}
                  className='mx-auto mb-4 text-destructive'
                />
                <h3 className='text-lg font-medium text-text-primary mb-2'>
                  Error Loading Project
                </h3>
                <p className='text-text-secondary mb-4'>{error}</p>
                <Button onClick={() => window.location.reload()}>
                  Try Again
                </Button>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Show main content when project data is loaded
  if (!currentProject) {
    return (
      <div className='min-h-screen bg-background'>
        <RoleBasedHeader currentUser={user} userRole={userRole} />
        <main className='pt-16'>
          <div className='max-w-7xl mx-auto p-6'>
            <div className='flex items-center justify-center h-64'>
              <div className='text-center'>
                <Icon
                  name='FolderX'
                  size={32}
                  className='mx-auto mb-4 text-text-secondary'
                />
                <h3 className='text-lg font-medium text-text-primary mb-2'>
                  Project Not Found
                </h3>
                <p className='text-text-secondary mb-4'>
                  The requested project could not be found.
                </p>
                <Button onClick={() => navigate('/role-based-dashboard')}>
                  Back to Dashboard
                </Button>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Final safety check - if currentProject is still null, show loading
  if (!currentProject) {
    return (
      <div className='min-h-screen bg-background'>
        <RoleBasedHeader currentUser={user} userRole={userRole} />
        <main className='pt-16'>
          <div className='max-w-7xl mx-auto p-6'>
            <div className='flex items-center justify-center h-64'>
              <div className='text-center'>
                <Icon
                  name='Loader2'
                  size={32}
                  className='animate-spin mx-auto mb-4 text-primary'
                />
                <p className='text-text-secondary'>Loading project data...</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-background'>
      <RoleBasedHeader currentUser={user} userRole={userRole} />

      <div className='flex-1 flex flex-col'>
        {/* Breadcrumb */}
        <div className='border-b border-border bg-card'>
          <div className='px-6 py-4'>
            <Breadcrumb
              items={[
                { label: 'Projects', path: '/projects' },
                {
                  label: currentProject?.name || 'Project',
                  path: `/project-overview/${currentProject?.id || ''}`,
                },
              ]}
            />
          </div>
        </div>

        {/* Project Header */}
        <div className='border-b border-border bg-card'>
          <div className='px-6 py-6'>
            <div className='flex items-start justify-between'>
              <div className='flex-1'>
                <div className='flex items-center space-x-3 mb-2'>
                  <h1 className='text-2xl font-bold text-text-primary'>
                    {currentProject.name}
                  </h1>
                  <span
                    className={`px-2 py-1 rounded-md text-xs font-medium ${getStatusColor(
                      currentProject.status
                    )}`}
                  >
                    {currentProject.status}
                  </span>
                </div>
                <p className='text-text-secondary mb-4 max-w-3xl'>
                  {currentProject.description}
                </p>
                <div className='flex items-center space-x-6 text-sm'>
                  <div className='flex items-center space-x-2'>
                    <Icon
                      name='Calendar'
                      size={16}
                      className='text-text-secondary'
                    />
                    <span className='text-text-secondary'>
                      {currentProject.startDate} - {currentProject.endDate}
                    </span>
                  </div>
                  <div className='flex items-center space-x-2'>
                    <Icon
                      name='Flag'
                      size={16}
                      className='text-text-secondary'
                    />
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(
                        currentProject.priority
                      )}`}
                    >
                      {currentProject.priority}
                    </span>
                  </div>
                </div>
              </div>
              <div className='flex items-center space-x-3'>
                <Button
                  variant='outline'
                  onClick={() => navigate('/project-management')}
                  iconName='Settings'
                  iconPosition='left'
                >
                  Settings
                </Button>
                <Button
                  variant='default'
                  onClick={handleAddTask}
                  iconName='Plus'
                  iconPosition='left'
                >
                  Add Task
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className='border-b border-border bg-card'>
          <div className='px-6'>
            <nav className='flex space-x-8'>
              {visibleTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`flex items-center space-x-2 px-1 py-4 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-primary text-primary'
                      : 'border-transparent text-text-secondary hover:text-text-primary hover:border-border'
                  }`}
                >
                  <Icon name={tab.icon} size={16} />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className='flex-1 p-6'>
          {activeTab === 'overview' && (
            <div className='space-y-6'>
              {/* Progress, Budget, Team Cards */}
              <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                {/* Progress Card */}
                <div className='bg-card border border-border rounded-lg p-6'>
                  <div className='flex items-center justify-between mb-4'>
                    <h3 className='text-lg font-semibold text-text-primary flex items-center'>
                      <Icon
                        name='TrendingUp'
                        size={20}
                        className='mr-2 text-primary'
                      />
                      Progress
                    </h3>
                  </div>
                  <div className='space-y-4'>
                    <div>
                      <div className='flex items-center justify-between mb-2'>
                        <span className='text-3xl font-bold text-text-primary'>
                          {currentProject.progress}%
                        </span>
                        <span className='text-sm text-success font-medium'>
                          {currentProject.progressChange}
                        </span>
                      </div>
                      <div className='w-full bg-muted rounded-full h-2'>
                        <div
                          className='bg-primary h-2 rounded-full transition-all duration-300'
                          style={{ width: `${currentProject.progress}%` }}
                        ></div>
                      </div>
                      <p className='text-sm text-text-secondary mt-2'>
                        On track for completion
                      </p>
                    </div>
                  </div>
                </div>

                {/* Budget Card */}
                <div className='bg-card border border-border rounded-lg p-6'>
                  <div className='flex items-center justify-between mb-4'>
                    <h3 className='text-lg font-semibold text-text-primary flex items-center'>
                      <Icon
                        name='DollarSign'
                        size={20}
                        className='mr-2 text-primary'
                      />
                      Budget
                    </h3>
                  </div>
                  <div className='space-y-3'>
                    <div className='flex justify-between'>
                      <span className='text-text-secondary'>Allocated</span>
                      <span className='font-medium'>
                        ${currentProject.budget.allocated.toLocaleString()}
                      </span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-text-secondary'>Spent</span>
                      <span className='font-medium'>
                        ${currentProject.budget.spent.toLocaleString()}
                      </span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-text-secondary'>Remaining</span>
                      <span className='font-medium text-success'>
                        ${currentProject.budget.remaining.toLocaleString()}
                      </span>
                    </div>
                    <div className='w-full bg-muted rounded-full h-2 mt-4'>
                      <div
                        className='bg-warning h-2 rounded-full'
                        style={{
                          width: `${
                            (currentProject.budget.spent /
                              currentProject.budget.allocated) *
                            100
                          }%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Team Card */}
                <div className='bg-card border border-border rounded-lg p-6'>
                  <div className='flex items-center justify-between mb-4'>
                    <h3 className='text-lg font-semibold text-text-primary flex items-center'>
                      <Icon
                        name='Users'
                        size={20}
                        className='mr-2 text-primary'
                      />
                      Team
                    </h3>
                  </div>
                  <div className='space-y-3'>
                    <div className='flex justify-between'>
                      <span className='text-text-secondary'>Total Members</span>
                      <span className='font-medium'>
                        {currentProject.team.totalMembers}
                      </span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-text-secondary'>Active</span>
                      <span className='font-medium'>
                        {currentProject.team.activeMembers}
                      </span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-text-secondary'>
                        Tasks Completed
                      </span>
                      <span className='font-medium'>
                        {currentProject.team.tasksCompleted}
                      </span>
                    </div>
                    {(userRole === 'owner' || userRole === 'admin') && (
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={handleInviteMembers}
                        iconName='UserPlus'
                        iconPosition='left'
                        className='w-full mt-4'
                      >
                        Invite Members
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {/* Team Members Section */}
              <div className='bg-card border border-border rounded-lg p-6'>
                <div className='flex items-center justify-between mb-6'>
                  <h3 className='text-lg font-semibold text-text-primary'>
                    Team Members
                  </h3>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => navigate('/team-members')}
                  >
                    View All
                  </Button>
                </div>
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
                  {teamMembers.map((member) => (
                    <div
                      key={member.id}
                      className='flex items-center space-x-3 p-3 rounded-lg border border-border'
                    >
                      <img
                        src={member.avatar}
                        alt={member.name}
                        className='w-10 h-10 rounded-full object-cover'
                      />
                      <div className='flex-1 min-w-0'>
                        <p className='text-sm font-medium text-text-primary truncate'>
                          {member.name}
                        </p>
                        <p className='text-xs text-text-secondary truncate'>
                          {member.role}
                        </p>
                        <div className='flex items-center space-x-2 mt-1'>
                          <span
                            className={`w-2 h-2 rounded-full ${
                              member.status === 'active'
                                ? 'bg-success'
                                : 'bg-muted'
                            }`}
                          ></span>
                          <span className='text-xs text-text-secondary'>
                            {member.tasksCompleted}/{member.tasksAssigned} tasks
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className='bg-card border border-border rounded-lg p-6'>
                <h3 className='text-lg font-semibold text-text-primary mb-4'>
                  Quick Actions
                </h3>
                <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                  <Button
                    variant='outline'
                    onClick={handleGoToBoard}
                    iconName='Kanban'
                    iconPosition='left'
                    className='justify-start'
                  >
                    Go to Board
                  </Button>
                  <Button
                    variant='outline'
                    onClick={handleAddTask}
                    iconName='Plus'
                    iconPosition='left'
                    className='justify-start'
                  >
                    Add New Task
                  </Button>
                  <Button
                    variant='outline'
                    onClick={() => navigate('/team-members')}
                    iconName='Users'
                    iconPosition='left'
                    className='justify-start'
                  >
                    Manage Team
                  </Button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'tasks' && (
            <div className='text-center py-12'>
              <Icon
                name='CheckSquare'
                size={48}
                className='mx-auto text-text-secondary mb-4'
              />
              <h3 className='text-lg font-semibold text-text-primary mb-2'>
                Task Management
              </h3>
              <p className='text-text-secondary mb-6'>
                Manage and track project tasks
              </p>
              <Button
                variant='default'
                onClick={handleGoToBoard}
                iconName='Kanban'
                iconPosition='left'
              >
                Go to Kanban Board
              </Button>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className='text-center py-12'>
              <Icon
                name='Settings'
                size={48}
                className='mx-auto text-text-secondary mb-4'
              />
              <h3 className='text-lg font-semibold text-text-primary mb-2'>
                Project Settings
              </h3>
              <p className='text-text-secondary mb-6'>
                Configure project settings and permissions
              </p>
              <Button
                variant='default'
                onClick={() => navigate('/project-management')}
                iconName='Settings'
                iconPosition='left'
              >
                Open Settings
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Role-based Invite Members Modal */}
      {userRole === 'owner' ? (
        <OwnerInviteMemberModal
          isOpen={isInviteModalOpen}
          onClose={() => setIsInviteModalOpen(false)}
          onInviteMember={handleOwnerInviteSubmit}
          organizationId={currentOrganization?.id}
          organizationName={currentOrganization?.name}
        />
      ) : userRole === 'admin' ? (
        <AdminInviteMemberModal
          isOpen={isInviteModalOpen}
          onClose={() => setIsInviteModalOpen(false)}
          onInvite={handleAdminInviteSubmit}
        />
      ) : null}

      {/* Create Task Modal */}
      <CreateTaskModal
        isOpen={isCreateTaskModalOpen}
        onClose={() => setIsCreateTaskModalOpen(false)}
        onTaskCreated={handleTaskCreated}
        projectId={currentProject?.id}
        project={currentProject}
      />
    </div>
  );
};

export default ProjectOverview;
