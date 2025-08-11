import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Icon from '../AppIcon';
import Button from './Button';
import sessionService from '../../utils/sessionService';
import * as notificationService from '../../utils/notificationService';
import CreateProjectModal from '../modals/CreateProjectModal';
import CreateOrganizationModal from '../modals/CreateOrganizationModal';
import NotificationDropdown from './NotificationDropdown';
import { useUserProfile } from '../../hooks/useUserProfile';
import {
  dispatchProjectCreated,
  refreshProjectsGlobally,
} from '../../utils/projectEventService';

const RoleBasedHeader = ({
  userRole = 'member',
  currentUser: propCurrentUser,
  currentOrganization: propCurrentOrganization,
  disableAsync = false,
}) => {
  const [isOrgDropdownOpen, setIsOrgDropdownOpen] = useState(false);
  const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationDropdownOpen, setIsNotificationDropdownOpen] =
    useState(false);
  const [isCreateProjectModalOpen, setIsCreateProjectModalOpen] =
    useState(false);
  const [isCreateOrganizationModalOpen, setIsCreateOrganizationModalOpen] =
    useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const orgDropdownRef = useRef(null);
  const projectDropdownRef = useRef(null);
  const userDropdownRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const notificationDropdownRef = useRef(null);

  // Use centralized user profile hook for consistent data
  const { userProfile, currentOrganization, availableOrganizations } =
    useUserProfile();

  // Use prop data if provided, otherwise use hook data
  const currentUser = propCurrentUser ||
    userProfile || {
      displayName: 'Loading...',
      email: '',
      avatar: '/assets/images/avatar.jpg',
      role: userRole,
    };

  // Always prefer hook data over prop data for organization
  const organization = currentOrganization ||
    propCurrentOrganization || {
      name: 'Loading...',
      domain: '',
      logo: '/assets/images/org-logo.png',
    };

  // Use the current user data
  const user = currentUser;

  // Get the actual user role from the data
  const actualUserRole = currentUser?.role || userRole;

  // Project state and data
  const [currentProject, setCurrentProject] = useState(null);
  const [availableProjects, setAvailableProjects] = useState([]);

  // Function to load projects (extracted for reuse)
  const loadProjects = async () => {
    if (!organization?.id) {
      return;
    }

    try {
      // Import apiService dynamically to avoid circular imports
      const { default: apiService } = await import('../../utils/apiService');
      const projects = await apiService.projects.getAll(organization.id);

      const transformedProjects = (projects || []).map((project) => ({
        id: project.id,
        name: project.name || 'Untitled Project',
        description: project.description || '',
        status: project.status || 'active',
      }));

      setAvailableProjects(transformedProjects);

      // Set current project from localStorage or first project
      const savedProjectId = localStorage.getItem('currentProjectId');
      if (savedProjectId) {
        const savedProject = transformedProjects.find(
          (p) => p.id === savedProjectId
        );
        if (savedProject) {
          setCurrentProject(savedProject);
        }
      } else if (transformedProjects.length > 0) {
        setCurrentProject(transformedProjects[0]);
        localStorage.setItem('currentProjectId', transformedProjects[0].id);
      }
    } catch (error) {
      console.error('Failed to load projects:', error);
      setAvailableProjects([]);
    }
  };

  // Load projects when organization changes
  useEffect(() => {
    if (disableAsync || !organization?.id) return;
    loadProjects();
  }, [organization?.id, disableAsync]);

  // Listen for project updates from other components
  useEffect(() => {
    if (disableAsync) return;
    const handleProjectsUpdated = (event) => {
      const { organizationId, projects } = event.detail;
      if (organizationId === organization?.id) {
        console.log('Received projects update event:', projects);
        loadProjects(); // Refresh projects list
      }
    };

    window.addEventListener('projectsUpdated', handleProjectsUpdated);
    return () =>
      window.removeEventListener('projectsUpdated', handleProjectsUpdated);
  }, [organization?.id, disableAsync]);

  // Role-based navigation configuration
  const getNavigationItems = (role) => {
    const baseItems = [
      {
        label: 'Dashboard',
        path: '/role-based-dashboard',
        icon: 'Home',
        roles: ['viewer', 'member', 'admin', 'owner'],
      },
      {
        label: 'Projects',
        path: '/kanban-board',
        icon: 'Kanban',
        roles: ['viewer', 'member', 'admin', 'owner'],
      },
      {
        label: 'Team Members',
        path: '/team-members',
        icon: 'Users',
        roles: ['member', 'admin', 'owner'],
      },
    ];

    const adminItems = [
      // Organization settings moved to owner-only items
    ];

    const ownerItems = [
      {
        label: 'Organization',
        path: '/organization-settings',
        icon: 'Settings',
        roles: ['owner'],
      },
      {
        label: 'Analytics',
        path: '/analytics',
        icon: 'BarChart3',
        roles: ['owner'],
      },
      {
        label: 'Billing',
        path: '/billing',
        icon: 'CreditCard',
        roles: ['owner'],
      },
    ];

    // Filter items based on user role
    const allItems = [...baseItems, ...adminItems, ...ownerItems];
    return allItems.filter((item) => item.roles.includes(role.toLowerCase()));
  };

  // Get role-specific features
  const getRoleFeatures = (role) => {
    const features = {
      viewer: {
        canCreateProjects: false,
        canInviteMembers: false,
        canManageSettings: false,
        canViewAnalytics: false,
        canManageBilling: false,
        canSwitchOrganizations: false,
      },
      member: {
        canCreateProjects: true,
        canInviteMembers: false,
        canManageSettings: false,
        canViewAnalytics: false,
        canManageBilling: false,
        canSwitchOrganizations: false,
      },
      admin: {
        canCreateProjects: true,
        canInviteMembers: true,
        canManageSettings: true,
        canViewAnalytics: false,
        canManageBilling: false,
        canSwitchOrganizations: true,
      },
      owner: {
        canCreateProjects: true,
        canInviteMembers: true,
        canManageSettings: true,
        canViewAnalytics: true,
        canManageBilling: true,
        canSwitchOrganizations: true,
      },
    };
    return features[role.toLowerCase()] || features.viewer;
  };

  const navigationItems = getNavigationItems(actualUserRole);
  const roleFeatures = getRoleFeatures(actualUserRole);

  // Enhanced notification data with comprehensive structure
  const [notifications, setNotifications] = useState([]); // Real notifications loaded from API

  // Mock notifications removed - now using real API data

  // Load real notifications from API
  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const result = await notificationService.getNotifications({
          limit: 10,
        });

        // Handle the new response structure
        if (result && result.data && Array.isArray(result.data)) {
          setNotifications(result.data);
        } else if (Array.isArray(result)) {
          // Fallback for direct array response
          setNotifications(result);
        } else {
          console.warn('Unexpected notification response format:', result);
          setNotifications([]);
        }
      } catch (error) {
        console.error('Failed to load notifications:', error);
        setNotifications([]);
      }
    };

    loadNotifications();
  }, []);

  // Notification state and filtering
  const [notificationFilter, setNotificationFilter] = useState('all'); // 'all', 'unread', 'high_priority'
  const [isLoading, setIsLoading] = useState(false);

  // Ensure notifications is always an array
  const notificationsArray = Array.isArray(notifications) ? notifications : [];

  const unreadCount = notificationsArray.filter((n) => !n.isRead).length;
  const highPriorityCount = notificationsArray.filter(
    (n) => n.priority === 'high' && !n.isRead
  ).length;

  // Filter notifications based on current filter
  const filteredNotifications = notificationsArray.filter((notification) => {
    switch (notificationFilter) {
      case 'unread':
        return !notification.isRead;
      case 'high_priority':
        return notification.priority === 'high';
      default:
        return true;
    }
  });

  const markAsRead = (notificationId) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === notificationId
          ? { ...notification, isRead: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((notification) => ({ ...notification, isRead: true }))
    );
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'task_assignment':
        return 'UserPlus';
      case 'meeting_invite':
        return 'Calendar';
      case 'meeting_reminder':
        return 'Clock';
      case 'ai_suggestion':
        return 'Zap';
      case 'project_update':
        return 'AlertTriangle';
      default:
        return 'Bell';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'text-destructive';
      case 'medium':
        return 'text-warning';
      case 'low':
        return 'text-muted-foreground';
      default:
        return 'text-muted-foreground';
    }
  };

  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return timestamp.toLocaleDateString();
  };

  // Role-based notification filtering
  const getRoleBasedNotifications = (notifications, role) => {
    return notifications.filter((notification) => {
      switch (notification.type) {
        case 'meeting_invite':
          // All roles can receive meeting invites
          return true;
        case 'ai_suggestion':
          // AI suggestions available to all roles
          return true;
        case 'task_assignment':
          // Task assignments for members and above only
          // Viewers cannot receive task assignments in this system
          return ['member', 'admin', 'owner'].includes(role?.toLowerCase());
        case 'project_update':
          // Project updates for all roles
          return true;
        default:
          return true;
      }
    });
  };

  // Notification action handlers
  const handleNotificationAction = async (
    notificationId,
    action,
    notificationData
  ) => {
    setIsLoading(true);

    try {
      switch (action) {
        case 'accept_task':
          // Accept task assignment
          console.log('Accepting task:', notificationData.taskId);
          // Navigate to kanban board with task highlighted
          navigate('/kanban-board', {
            state: {
              projectId: notificationData.projectId,
              highlightTaskId: notificationData.taskId,
              taskAccepted: true,
            },
          });
          // Remove notification after acceptance
          setNotifications((prev) =>
            prev.filter((n) => n.id !== notificationId)
          );
          break;

        case 'view_task':
          // View task details
          navigate('/kanban-board', {
            state: {
              projectId: notificationData.projectId,
              highlightTaskId: notificationData.taskId,
            },
          });
          markAsRead(notificationId);
          break;

        case 'decline_task':
          // Decline task assignment
          const reason = prompt(
            'Please provide a reason for declining this task (optional):'
          );
          console.log(
            'Declining task:',
            notificationData.taskId,
            'Reason:',
            reason
          );
          // Remove notification after declining
          setNotifications((prev) =>
            prev.filter((n) => n.id !== notificationId)
          );
          break;

        case 'accept_meeting':
          // Accept meeting invitation
          console.log('Accepting meeting:', notificationData.meetingId);
          // Update meeting status and remove notification
          setNotifications((prev) =>
            prev.filter((n) => n.id !== notificationId)
          );
          break;

        case 'decline_meeting':
          // Decline meeting invitation
          console.log('Declining meeting:', notificationData.meetingId);
          setNotifications((prev) =>
            prev.filter((n) => n.id !== notificationId)
          );
          break;

        case 'view_meeting':
          // View meeting details
          console.log('Viewing meeting details:', notificationData.meetingId);
          markAsRead(notificationId);
          break;

        case 'join_meeting':
          // Join meeting (open meeting link)
          console.log('Joining meeting:', notificationData.meetingId);
          window.open('https://zoom.us/j/meeting-room', '_blank');
          markAsRead(notificationId);
          break;

        case 'apply_ai_suggestion':
          // Apply AI suggestion
          console.log(
            'Applying AI suggestion:',
            notificationData.suggestionType
          );
          markAsRead(notificationId);
          break;

        case 'view_project':
          // View project details
          navigate('/project-overview', {
            state: {
              projectId: notificationData.projectId,
            },
          });
          markAsRead(notificationId);
          break;

        default:
          console.log('Unknown action:', action);
          markAsRead(notificationId);
      }
    } catch (error) {
      console.error('Error handling notification action:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const isActivePath = (path) => location.pathname === path;

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        orgDropdownRef.current &&
        !orgDropdownRef.current.contains(event.target)
      ) {
        setIsOrgDropdownOpen(false);
      }
      if (
        projectDropdownRef.current &&
        !projectDropdownRef.current.contains(event.target)
      ) {
        setIsProjectDropdownOpen(false);
      }
      if (
        userDropdownRef.current &&
        !userDropdownRef.current.contains(event.target)
      ) {
        setIsUserDropdownOpen(false);
      }
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target)
      ) {
        setIsMobileMenuOpen(false);
      }
      if (
        notificationDropdownRef.current &&
        !notificationDropdownRef.current.contains(event.target)
      ) {
        setIsNotificationDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleOrganizationSwitch = async (orgId) => {
    try {
      console.log('Switching to organization:', orgId);

      // Find the organization in available organizations
      const selectedOrg = availableOrganizations.find(
        (org) => org.id === orgId
      );

      if (selectedOrg) {
        // Update local storage
        localStorage.setItem('organizationId', orgId);
        localStorage.setItem('userRole', selectedOrg.role);

        // Refresh the page to load data for the new organization
        window.location.reload();
      }

      setIsOrgDropdownOpen(false);
    } catch (error) {
      console.error('Failed to switch organization:', error);
      setIsOrgDropdownOpen(false);
    }
  };

  const handleProjectSwitch = (project) => {
    console.log('Switching to project:', project);
    setCurrentProject(project);
    setIsProjectDropdownOpen(false);

    // Save selected project to localStorage
    localStorage.setItem('currentProjectId', project.id);
    localStorage.setItem('currentProject', JSON.stringify(project));

    // Navigate to the project management page with project ID in URL
    navigate(`/project-management?id=${project.id}`, {
      state: {
        projectId: project.id,
        project: project,
      },
    });
  };

  const handleCreateProject = () => {
    console.log('Creating new project...');
    setIsProjectDropdownOpen(false);
    setIsCreateProjectModalOpen(true);
  };

  const handleCreateProjectSubmit = async (projectData) => {
    try {
      console.log('Creating project:', projectData);
      console.log('Current organization:', organization);

      // Get organization ID - try multiple sources
      const orgId =
        organization?.id ||
        sessionService.getOrganizationId() ||
        sessionStorage.getItem('organizationId');
      console.log('Using organization ID:', orgId);

      if (!orgId) {
        throw new Error(
          'No organization ID available. Please refresh the page and try again.'
        );
      }

      // Create project via API
      const apiService = (await import('../../utils/realApiService')).default;
      const result = await apiService.projects.create(orgId, projectData);
      console.log('Project created via API:', result);

      const projectResult = result.data || result;
      const newProject = {
        id: projectResult.id,
        name: projectResult.name || projectData.name,
        description: projectResult.description || projectData.description,
        status: projectResult.status || 'active',
        memberRole: 'assigned',
      };

      // Refresh the projects list to include the new project
      await loadProjects();

      // Dispatch global project creation event
      console.log('🔔 Dispatching project created event:', {
        orgId,
        newProject,
      });
      if (orgId && newProject) {
        dispatchProjectCreated(orgId, newProject);
      } else {
        console.warn(
          '⚠️ Cannot dispatch project created event - missing orgId or newProject'
        );
      }

      // Update current project to the newly created one
      setCurrentProject(newProject);
      localStorage.setItem('currentProjectId', newProject.id);
      localStorage.setItem('currentProject', JSON.stringify(newProject));

      // Post-create: create in-app notification for the owner/admins
      try {
        const notifPayload = {
          user_id: user?.id || (userProfile && userProfile.id),
          organization_id:
            organization?.id || sessionService.getOrganizationId() || undefined,
          title: 'Project Created',
          message: `Project "${newProject.name}" has been created successfully`,
          type: 'project',
          priority: 'normal',
          action_url: `/project-management?id=${newProject.id}`,
          notification_metadata: { project_id: newProject.id },
        };
        const notifApi = (await import('../../utils/realApiService')).default;
        await notifApi.notifications.create(notifPayload);
      } catch (e) {
        console.warn('Post-create notification failed (non-blocking):', e);
      }

      setIsCreateProjectModalOpen(false);

      // Navigate to the new project's management page
      navigate(`/project-management?id=${newProject.id}`, {
        state: {
          projectId: newProject.id,
          project: newProject,
        },
      });
    } catch (error) {
      console.error('Failed to create project:', error);

      // Provide user-friendly error message
      let errorMessage = 'Failed to create project. ';
      if (error.message.includes('organization')) {
        errorMessage += 'Please refresh the page and try again.';
      } else if (
        error.message.includes('401') ||
        error.message.includes('unauthorized')
      ) {
        errorMessage += 'Please log in again.';
      } else {
        errorMessage += error.message || 'Please try again.';
      }

      // You could show this error in a toast notification
      alert(errorMessage);
      throw error;
    }
  };

  const handleCreateOrganization = () => {
    console.log('Creating new organization...');
    setIsOrgDropdownOpen(false);
    setIsCreateOrganizationModalOpen(true);
  };

  const handleCreateOrganizationSubmit = async (organizationData, logoFile) => {
    try {
      console.log('Creating organization:', organizationData);
      // Here you would typically call an API to create the organization
      // For now, we'll just simulate the creation
      const newOrganization = {
        id: Date.now(),
        name: organizationData.name,
        description: organizationData.description,
        logo_url: logoFile ? URL.createObjectURL(logoFile) : null,
        ...organizationData,
      };

      setIsCreateOrganizationModalOpen(false);

      // Show success message and potentially navigate to organization settings
      console.log('Organization created successfully:', newOrganization);
      // You might want to refresh the organization list or navigate somewhere
      navigate('/organization-settings', {
        state: {
          message: `Organization "${organizationData.name}" created successfully!`,
          type: 'success',
        },
      });
    } catch (error) {
      console.error('Failed to create organization:', error);
      throw error;
    }
  };

  const getRoleDashboardPath = () => {
    // Always redirect to role-based-dashboard regardless of role
    return '/role-based-dashboard';
  };

  const handleLogout = async () => {
    try {
      console.log('Logging out...');

      // Clear authentication state
      await sessionService.logout();

      // Close any open dropdowns
      setIsUserDropdownOpen(false);
      setIsOrgDropdownOpen(false);
      setIsProjectDropdownOpen(false);
      setIsMobileMenuOpen(false);

      // Redirect to login page
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Error during logout:', error);
      // Even if logout fails, redirect to login page
      navigate('/login', { replace: true });
    }
  };

  // Don't render header on auth pages
  if (location.pathname === '/login' || location.pathname === '/register') {
    return null;
  }

  // Get role badge color
  const getRoleBadgeColor = (role) => {
    const colors = {
      viewer: 'bg-gray-100 text-gray-800',
      member: 'bg-blue-100 text-blue-800',
      admin: 'bg-purple-100 text-purple-800',
      owner: 'bg-green-100 text-green-800',
    };
    return colors[role.toLowerCase()] || colors.viewer;
  };

  return (
    <header className='fixed top-0 left-0 right-0 z-1000 bg-surface border-b border-border shadow-enterprise'>
      <div className='flex items-center justify-between h-16 px-4 lg:px-6'>
        {/* Logo */}
        <div className='flex items-center'>
          <Link
            to={getRoleDashboardPath()}
            className='flex items-center space-x-3 hover-lift'
          >
            <div className='w-8 h-8 bg-primary rounded-md flex items-center justify-center'>
              <svg
                viewBox='0 0 24 24'
                className='w-5 h-5 text-primary-foreground'
                fill='currentColor'
              >
                <path d='M3 3h7v7H3V3zm0 11h7v7H3v-7zm11-11h7v7h-7V3zm0 11h7v7h-7v-7z' />
              </svg>
            </div>
            <span className='text-xl font-semibold text-text-primary'>
              Agno WorkSphere
            </span>
          </Link>
        </div>

        {/* Organization Context Switcher - Desktop */}
        <div className='hidden lg:flex items-center space-x-6'>
          {roleFeatures.canSwitchOrganizations ? (
            <div className='relative' ref={orgDropdownRef}>
              <Button
                variant='ghost'
                onClick={() => setIsOrgDropdownOpen(!isOrgDropdownOpen)}
                className='flex items-center space-x-2 px-3 py-2'
              >
                <div className='w-6 h-6 bg-muted rounded-sm flex items-center justify-center'>
                  <span className='text-xs font-medium text-text-primary'>
                    {organization?.name?.charAt(0) || 'O'}
                  </span>
                </div>
                <span className='font-medium text-text-primary'>
                  {organization?.name || 'Organization'}
                </span>
                <Icon
                  name='ChevronDown'
                  size={16}
                  className='text-text-secondary'
                />
              </Button>

              {isOrgDropdownOpen && (
                <div className='absolute top-full left-0 mt-1 w-64 bg-popover border border-border rounded-md shadow-elevated z-1010'>
                  <div className='p-2'>
                    <div className='text-xs font-medium text-text-secondary uppercase tracking-wide px-2 py-1'>
                      Switch Organization
                    </div>

                    {/* Create New Organization - Only for Owners */}
                    {actualUserRole === 'owner' && (
                      <>
                        <button
                          onClick={handleCreateOrganization}
                          className='w-full flex items-center space-x-3 px-2 py-2 rounded-sm hover:bg-muted transition-micro text-left border-b border-border mb-2'
                        >
                          <div className='w-8 h-8 bg-primary rounded-sm flex items-center justify-center'>
                            <Icon
                              name='Plus'
                              size={16}
                              className='text-primary-foreground'
                            />
                          </div>
                          <div className='flex-1'>
                            <div className='text-sm font-medium text-primary'>
                              Create New Organization
                            </div>
                            <div className='text-xs text-text-secondary'>
                              Start a new organization
                            </div>
                          </div>
                        </button>
                      </>
                    )}

                    {availableOrganizations.map((org) => (
                      <button
                        key={org.id}
                        onClick={() => handleOrganizationSwitch(org.id)}
                        className='w-full flex items-center space-x-3 px-2 py-2 rounded-sm hover:bg-muted transition-micro text-left'
                      >
                        <div className='w-8 h-8 bg-muted rounded-sm flex items-center justify-center'>
                          <span className='text-xs font-medium text-text-primary'>
                            {org.name.charAt(0)}
                          </span>
                        </div>
                        <div className='flex-1'>
                          <div className='text-sm font-medium text-text-primary'>
                            {org.name}
                          </div>
                          <div className='text-xs text-text-secondary'>
                            {org.domain}
                          </div>
                        </div>
                        <span
                          className={`text-xs px-2 py-1 rounded ${getRoleBadgeColor(
                            org.role
                          )}`}
                        >
                          {org.role}
                        </span>
                        {org.id === 1 && (
                          <Icon
                            name='Check'
                            size={16}
                            className='text-success'
                          />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            // For members and viewers - show organization name without dropdown
            <div className='flex items-center space-x-2 px-3 py-2'>
              <div className='w-6 h-6 bg-muted rounded-sm flex items-center justify-center'>
                <span className='text-xs font-medium text-text-primary'>
                  {organization?.name?.charAt(0) || 'O'}
                </span>
              </div>
              <span className='font-medium text-text-primary'>
                {organization?.name || 'Organization'}
              </span>
            </div>
          )}

          {/* Role-Based Navigation */}
          <nav className='flex items-center space-x-1'>
            {navigationItems.map((item) => {
              // Special handling for Projects item - make it a dropdown
              if (item.label === 'Projects') {
                return (
                  <div
                    key={item.path}
                    className='relative'
                    ref={projectDropdownRef}
                  >
                    <Button
                      variant='ghost'
                      onClick={() =>
                        setIsProjectDropdownOpen(!isProjectDropdownOpen)
                      }
                      className={`flex items-center space-x-1 px-2 py-1.5 rounded-md text-xs font-medium transition-micro ${
                        isActivePath(item.path)
                          ? 'bg-primary text-primary-foreground'
                          : 'text-text-secondary hover:text-text-primary hover:bg-muted'
                      }`}
                    >
                      <Icon name={item.icon} size={14} />
                      <span>{item.label}</span>
                      <Icon name='ChevronDown' size={10} className='ml-0.5' />
                    </Button>

                    {isProjectDropdownOpen && (
                      <div className='absolute top-full left-0 mt-1 w-80 bg-popover border border-border rounded-md shadow-elevated z-1010'>
                        <div className='p-2'>
                          <div className='text-xs font-medium text-text-secondary uppercase tracking-wide px-2 py-1'>
                            Switch Project
                          </div>

                          {/* Create New Project - Only for Admins and Owners */}
                          {(actualUserRole === 'admin' ||
                            actualUserRole === 'owner') && (
                            <>
                              <button
                                onClick={handleCreateProject}
                                className='w-full flex items-center space-x-3 px-2 py-2 rounded-sm hover:bg-muted transition-micro text-left border-b border-border mb-2'
                              >
                                <div className='w-8 h-8 bg-primary rounded-sm flex items-center justify-center'>
                                  <Icon
                                    name='Plus'
                                    size={16}
                                    className='text-primary-foreground'
                                  />
                                </div>
                                <div className='flex-1'>
                                  <div className='text-sm font-medium text-primary'>
                                    Create New Project
                                  </div>
                                  <div className='text-xs text-text-secondary'>
                                    Start a new project
                                  </div>
                                </div>
                              </button>
                            </>
                          )}

                          {/* Available Projects */}
                          {availableProjects.length === 0 ? (
                            <div className='px-2 py-4 text-center'>
                              <div className='w-12 h-12 bg-muted rounded-lg flex items-center justify-center mx-auto mb-3'>
                                <Icon
                                  name='FolderOpen'
                                  size={20}
                                  className='text-text-secondary'
                                />
                              </div>
                              <div className='text-sm font-medium text-text-primary mb-1'>
                                No Projects Yet
                              </div>
                              <div className='text-xs text-text-secondary mb-3'>
                                {actualUserRole === 'admin' ||
                                actualUserRole === 'owner'
                                  ? 'Create your first project to get started'
                                  : 'Ask your admin to create a project or invite you to one'}
                              </div>
                              {(actualUserRole === 'admin' ||
                                actualUserRole === 'owner') && (
                                <button
                                  onClick={handleCreateProject}
                                  className='text-xs text-primary hover:text-primary/80 font-medium'
                                >
                                  Create Project
                                </button>
                              )}
                            </div>
                          ) : (
                            availableProjects.map((project) => (
                              <button
                                key={project.id}
                                onClick={() => handleProjectSwitch(project)}
                                className='w-full flex items-center space-x-3 px-2 py-2 rounded-sm hover:bg-muted transition-micro text-left'
                              >
                                <div className='w-8 h-8 bg-muted rounded-sm flex items-center justify-center'>
                                  <Icon
                                    name='Folder'
                                    size={16}
                                    className='text-text-primary'
                                  />
                                </div>
                                <div className='flex-1'>
                                  <div className='text-sm font-medium text-text-primary'>
                                    {project.name}
                                  </div>
                                  <div className='text-xs text-text-secondary truncate'>
                                    {project.description}
                                  </div>
                                </div>
                                <div className='flex flex-col items-end'>
                                  <span
                                    className={`text-xs px-2 py-1 rounded ${
                                      project.status === 'active'
                                        ? 'bg-success/10 text-success'
                                        : project.status === 'planning'
                                        ? 'bg-warning/10 text-warning'
                                        : 'bg-muted text-text-secondary'
                                    }`}
                                  >
                                    {project.status}
                                  </span>
                                  {actualUserRole === 'member' && (
                                    <span className='text-xs text-text-secondary mt-1'>
                                      Assigned
                                    </span>
                                  )}
                                </div>
                                {project.id === currentProject?.id && (
                                  <Icon
                                    name='Check'
                                    size={16}
                                    className='text-success'
                                  />
                                )}
                              </button>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              }

              // Regular navigation items
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-micro ${
                    isActivePath(item.path)
                      ? 'bg-primary text-primary-foreground'
                      : 'text-text-secondary hover:text-text-primary hover:bg-muted'
                  }`}
                >
                  <Icon name={item.icon} size={16} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Profile & Mobile Menu */}
        <div className='flex items-center space-x-2'>
          {/* Notifications */}
          {disableAsync ? null : <NotificationDropdown />}

          {/* User Profile Dropdown */}
          <div className='relative' ref={userDropdownRef}>
            <Button
              variant='ghost'
              onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
              className='flex items-center space-x-2 px-2 py-2'
            >
              <div className='w-8 h-8 bg-primary rounded-full flex items-center justify-center'>
                <span className='text-sm font-medium text-primary-foreground'>
                  {user?.name
                    ? user.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                    : 'U'}
                </span>
              </div>
              <div className='hidden md:block text-left'>
                <div className='text-sm font-medium text-text-primary'>
                  {user?.name || 'User'}
                </div>
                <div className='text-xs text-text-secondary'>
                  {user?.role || 'Member'}
                </div>
              </div>
              <Icon
                name='ChevronDown'
                size={16}
                className='text-text-secondary'
              />
            </Button>

            {isUserDropdownOpen && (
              <div className='absolute top-full right-0 mt-1 w-56 bg-popover border border-border rounded-md shadow-elevated z-1010'>
                <div className='p-2'>
                  <div className='px-2 py-2 border-b border-border'>
                    <div className='font-medium text-text-primary'>
                      {user?.name || user?.displayName || 'User'}
                    </div>
                    <div className='text-sm text-text-secondary'>
                      {user?.email || 'user@example.com'}
                    </div>
                    <span
                      className={`inline-block text-xs px-2 py-1 rounded mt-1 ${getRoleBadgeColor(
                        actualUserRole
                      )}`}
                    >
                      {actualUserRole.charAt(0).toUpperCase() +
                        actualUserRole.slice(1)}
                    </span>
                  </div>
                  <div className='py-1'>
                    <Link
                      to='/user-profile-settings'
                      className='w-full flex items-center space-x-2 px-2 py-2 text-sm text-text-primary hover:bg-muted rounded-sm transition-micro'
                    >
                      <Icon name='User' size={16} />
                      <span>Profile Settings</span>
                    </Link>
                    <button className='w-full flex items-center space-x-2 px-2 py-2 text-sm text-text-primary hover:bg-muted rounded-sm transition-micro'>
                      <Icon name='Bell' size={16} />
                      <span>Notifications</span>
                    </button>
                    <button className='w-full flex items-center space-x-2 px-2 py-2 text-sm text-text-primary hover:bg-muted rounded-sm transition-micro'>
                      <Icon name='HelpCircle' size={16} />
                      <span>Help & Support</span>
                    </button>
                    <div className='border-t border-border my-1'></div>
                    <button
                      onClick={handleLogout}
                      className='w-full flex items-center space-x-2 px-2 py-2 text-sm text-destructive hover:bg-muted rounded-sm transition-micro'
                    >
                      <Icon name='LogOut' size={16} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <Button
            variant='ghost'
            size='icon'
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className='lg:hidden'
          >
            <Icon name={isMobileMenuOpen ? 'X' : 'Menu'} size={20} />
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div
          ref={mobileMenuRef}
          className='lg:hidden border-t border-border bg-surface'
        >
          <div className='px-4 py-2 space-y-1'>
            {/* Create Organization Button for Mobile - Only for Owners */}
            {actualUserRole === 'owner' && (
              <button
                onClick={() => {
                  handleCreateOrganization();
                  setIsMobileMenuOpen(false);
                }}
                className='w-full flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-micro mb-2'
              >
                <Icon name='Building2' size={16} />
                <span>New Organization</span>
              </button>
            )}

            {/* Create Project Button for Mobile */}
            {roleFeatures.canCreateProjects && (
              <button
                onClick={() => {
                  navigate('/project-management');
                  setIsMobileMenuOpen(false);
                }}
                className='w-full flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-micro'
              >
                <Icon name='Plus' size={16} />
                <span>New Project</span>
              </button>
            )}

            {navigationItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-micro ${
                  isActivePath(item.path)
                    ? 'bg-primary text-primary-foreground'
                    : 'text-text-secondary hover:text-text-primary hover:bg-muted'
                }`}
              >
                <Icon name={item.icon} size={16} />
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Create Project Modal */}
      <CreateProjectModal
        isOpen={isCreateProjectModalOpen}
        onClose={() => setIsCreateProjectModalOpen(false)}
        onCreateProject={handleCreateProjectSubmit}
        organizationId={
          organization?.id ||
          sessionService.getOrganizationId() ||
          sessionStorage.getItem('organizationId')
        }
        organizationName={organization?.name || 'Organization'}
      />

      {/* Create Organization Modal */}
      <CreateOrganizationModal
        isOpen={isCreateOrganizationModalOpen}
        onClose={() => setIsCreateOrganizationModalOpen(false)}
        onCreateOrganization={handleCreateOrganizationSubmit}
      />
    </header>
  );
};

export default RoleBasedHeader;
