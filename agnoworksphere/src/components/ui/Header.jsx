import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Icon from '../AppIcon';
import Button from './Button';
import authService from '../../utils/authService';
import apiService from '../../utils/apiService';

const Header = () => {
  const [isOrgDropdownOpen, setIsOrgDropdownOpen] = useState(false);
  const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const orgDropdownRef = useRef(null);
  const projectDropdownRef = useRef(null);
  const userDropdownRef = useRef(null);
  const mobileMenuRef = useRef(null);

  // Real user data should be passed as props or from context
  const currentUser = {
    name: 'User',
    email: 'user@example.com',
    avatar: '/assets/images/avatar.jpg',
    role: 'Member',
  };

  const [currentOrganization, setCurrentOrganization] = useState({
    name: 'Loading...',
    domain: '',
    logo: '/assets/images/org-logo.png',
  });

  const [availableOrganizations, setAvailableOrganizations] = useState([]);

  const availableProjects = [
    { id: 1, name: 'Website Redesign', status: 'active', organizationId: 1 },
    {
      id: 2,
      name: 'Mobile App Development',
      status: 'active',
      organizationId: 1,
    },
    {
      id: 3,
      name: 'Marketing Campaign',
      status: 'planning',
      organizationId: 1,
    },
    { id: 4, name: 'Data Migration', status: 'completed', organizationId: 1 },
  ];

  const currentProject = availableProjects[0]; // Default to first project

  const navigationItems = [
    { label: 'Projects', path: '/kanban-board', icon: 'Kanban' },
    { label: 'Team Members', path: '/team-members', icon: 'Users' },
    { label: 'Organization', path: '/organization-settings', icon: 'Settings' },
  ];

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
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Load organization data
  useEffect(() => {
    const loadOrganizationData = async () => {
      try {
        const result = await authService.getCurrentUser();

        if (
          result.data &&
          result.data.organizations &&
          result.data.organizations.length > 0
        ) {
          const userOrgs = result.data.organizations;
          setAvailableOrganizations(userOrgs);

          // Set current organization (first one or based on stored preference)
          const currentOrgId = authService.getOrganizationId();
          const currentOrg =
            userOrgs.find((org) => org.id === currentOrgId) || userOrgs[0];

          if (currentOrg) {
            setCurrentOrganization({
              name:
                currentOrg.name ||
                currentOrg.organization?.name ||
                'Organization',
              domain:
                currentOrg.domain || currentOrg.organization?.domain || '',
              logo:
                currentOrg.logo_url ||
                currentOrg.organization?.logo_url ||
                '/assets/images/org-logo.png',
            });
          }
        }
      } catch (error) {
        console.error('Failed to load organization data:', error);
      }
    };

    loadOrganizationData();
  }, []);

  const handleOrganizationSwitch = (orgId) => {
    console.log('Switching to organization:', orgId);
    setIsOrgDropdownOpen(false);
  };

  const handleProjectSwitch = (projectId) => {
    console.log('Switching to project:', projectId);
    setIsProjectDropdownOpen(false);
    // In real app, this would update the current project context
  };

  const handleLogout = () => {
    console.log('Logging out...');
    // In real app, this would clear auth state and redirect
  };

  // Don't render header on auth pages
  if (location.pathname === '/login' || location.pathname === '/register') {
    return null;
  }

  return (
    <header className='fixed top-0 left-0 right-0 z-1000 bg-surface border-b border-border shadow-enterprise'>
      <div className='flex items-center justify-between h-16 px-4 lg:px-6'>
        {/* Logo */}
        <div className='flex items-center'>
          <Link
            to='/kanban-board'
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
          <div className='relative' ref={orgDropdownRef}>
            <Button
              variant='ghost'
              onClick={() => setIsOrgDropdownOpen(!isOrgDropdownOpen)}
              className='flex items-center space-x-2 px-3 py-2'
            >
              <div className='w-6 h-6 bg-muted rounded-sm flex items-center justify-center'>
                <span className='text-xs font-medium text-text-primary'>
                  {currentOrganization.name.charAt(0)}
                </span>
              </div>
              <span className='font-medium text-text-primary'>
                {currentOrganization.name}
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
                  {availableOrganizations.map((org) => (
                    <button
                      key={org.id}
                      onClick={() => handleOrganizationSwitch(org.id)}
                      className='w-full flex items-center space-x-3 px-2 py-2 rounded-sm hover:bg-muted transition-micro text-left'
                    >
                      <div className='w-8 h-8 bg-muted rounded-sm flex items-center justify-center'>
                        <span className='text-sm font-medium text-text-primary'>
                          {org.name.charAt(0)}
                        </span>
                      </div>
                      <div className='flex-1 min-w-0'>
                        <div className='font-medium text-text-primary truncate'>
                          {org.name}
                        </div>
                        <div className='text-xs text-text-secondary'>
                          {org.role} • {org.domain}
                        </div>
                      </div>
                      {org.id === 1 && (
                        <Icon name='Check' size={16} className='text-success' />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Project Context Switcher - Desktop */}
          <div className='relative' ref={projectDropdownRef}>
            <Button
              variant='ghost'
              onClick={() => setIsProjectDropdownOpen(!isProjectDropdownOpen)}
              className='flex items-center space-x-2 px-3 py-2'
            >
              <div className='w-6 h-6 bg-primary/10 rounded-sm flex items-center justify-center'>
                <Icon name='FolderOpen' size={14} className='text-primary' />
              </div>
              <span className='font-medium text-text-primary'>
                {currentProject.name}
              </span>
              <Icon
                name='ChevronDown'
                size={16}
                className='text-text-secondary'
              />
            </Button>

            {isProjectDropdownOpen && (
              <div className='absolute top-full left-0 mt-1 w-64 bg-popover border border-border rounded-md shadow-elevated z-1010'>
                <div className='p-2'>
                  <div className='text-xs font-medium text-text-secondary uppercase tracking-wide px-2 py-1'>
                    Switch Project
                  </div>
                  {availableProjects.map((project) => (
                    <button
                      key={project.id}
                      onClick={() => handleProjectSwitch(project.id)}
                      className='w-full flex items-center space-x-3 px-2 py-2 rounded-sm hover:bg-muted transition-micro text-left'
                    >
                      <div className='w-8 h-8 bg-primary/10 rounded-sm flex items-center justify-center'>
                        <Icon
                          name='FolderOpen'
                          size={14}
                          className='text-primary'
                        />
                      </div>
                      <div className='flex-1 min-w-0'>
                        <div className='font-medium text-text-primary truncate'>
                          {project.name}
                        </div>
                        <div className='text-xs text-text-secondary capitalize'>
                          {project.status}
                        </div>
                      </div>
                      {project.id === currentProject.id && (
                        <Icon name='Check' size={16} className='text-success' />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Primary Navigation */}
          <nav className='flex items-center space-x-1'>
            {navigationItems.map((item) => (
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
            ))}
          </nav>
        </div>

        {/* User Profile & Mobile Menu */}
        <div className='flex items-center space-x-2'>
          {/* User Profile Dropdown */}
          <div className='relative' ref={userDropdownRef}>
            <Button
              variant='ghost'
              onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
              className='flex items-center space-x-2 px-2 py-2'
            >
              <div className='w-8 h-8 bg-primary rounded-full flex items-center justify-center'>
                <span className='text-sm font-medium text-primary-foreground'>
                  {currentUser.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')}
                </span>
              </div>
              <div className='hidden md:block text-left'>
                <div className='text-sm font-medium text-text-primary'>
                  {currentUser.name}
                </div>
                <div className='text-xs text-text-secondary'>
                  {currentUser.role}
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
                      {currentUser.name}
                    </div>
                    <div className='text-sm text-text-secondary'>
                      {currentUser.email}
                    </div>
                  </div>
                  <div className='py-1'>
                    <Link
                      to='/user-profile-settings'
                      onClick={() => setIsUserDropdownOpen(false)}
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
                  </div>
                  <div className='border-t border-border pt-1'>
                    <button
                      onClick={handleLogout}
                      className='w-full flex items-center space-x-2 px-2 py-2 text-sm text-destructive hover:bg-destructive/10 rounded-sm transition-micro'
                    >
                      <Icon name='LogOut' size={16} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className='lg:hidden' ref={mobileMenuRef}>
            <Button
              variant='ghost'
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className='p-2'
            >
              <Icon name={isMobileMenuOpen ? 'X' : 'Menu'} size={20} />
            </Button>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
              <div className='absolute top-full right-0 mt-1 w-64 bg-popover border border-border rounded-md shadow-elevated z-1010'>
                <div className='p-2'>
                  {/* Organization Switcher - Mobile */}
                  <div className='border-b border-border pb-2 mb-2'>
                    <div className='text-xs font-medium text-text-secondary uppercase tracking-wide px-2 py-1'>
                      Current Organization
                    </div>
                    <div className='flex items-center space-x-2 px-2 py-2'>
                      <div className='w-6 h-6 bg-muted rounded-sm flex items-center justify-center'>
                        <span className='text-xs font-medium text-text-primary'>
                          {currentOrganization.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <div className='font-medium text-text-primary'>
                          {currentOrganization.name}
                        </div>
                        <div className='text-xs text-text-secondary'>
                          {currentOrganization.domain}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Navigation - Mobile */}
                  <nav className='space-y-1'>
                    {navigationItems.map((item) => (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`flex items-center space-x-2 px-2 py-2 rounded-sm text-sm font-medium transition-micro ${
                          isActivePath(item.path)
                            ? 'bg-primary text-primary-foreground'
                            : 'text-text-secondary hover:text-text-primary hover:bg-muted'
                        }`}
                      >
                        <Icon name={item.icon} size={16} />
                        <span>{item.label}</span>
                      </Link>
                    ))}
                  </nav>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
