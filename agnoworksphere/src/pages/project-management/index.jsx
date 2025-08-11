import React, { useState, useEffect, Suspense, lazy } from 'react';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';

const tabs = [
  {
    id: 'overview',
    label: 'Overview',
    icon: 'LayoutDashboard',
    description: 'Project summary and key metrics',
    component: lazy(() => import('./components/ProjectOverview')),
  },
  {
    id: 'tasks',
    label: 'Tasks',
    icon: 'CheckSquare',
    description: 'Task management and tracking',
    component: lazy(() => import('./components/TasksTab')),
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: 'Settings',
    description: 'Project configuration and permissions',
    component: lazy(() => import('./components/SettingsTab')),
  },
];

const ProjectManagement = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [project, setProject] = useState(null);
  // Get projectId from URL (React Router v6+)
  const urlParams = new URLSearchParams(window.location.search);
  const projectId = urlParams.get('id');
  console.log('ProjectManagement: projectId from URL:', projectId);

  useEffect(() => {
    let didCancel = false;
    setIsLoading(true);
    setError(null);
    const timeout = setTimeout(() => {
      if (!didCancel) {
        setError('Loading timed out. Please try again.');
        setIsLoading(false);
      }
    }, 10000);
    (async () => {
      try {
        if (!projectId || projectId === 'proj-1') {
          setError(
            'Invalid or missing project ID. Please select a valid project.'
          );
          setIsLoading(false);
          return;
        }
        // TODO: Replace with real API call to fetch project by ID
        // Example: const result = await apiService.projects.getById(projectId);
        // setProject(result.data);
        // For now, show a placeholder with the ID
        // Fetch real project from backend
        const apiService = (await import('../../utils/apiService')).default;
        const result = await apiService.projects.getById(projectId);
        if (result && result.data) {
          setProject(result.data);
        } else if (result && result.name) {
          setProject(result);
        } else {
          setError('Project not found or missing name.');
        }
      } catch (e) {
        if (!didCancel) setError('Failed to load project.');
      } finally {
        if (!didCancel) setIsLoading(false);
        clearTimeout(timeout);
      }
    })();
    return () => {
      didCancel = true;
      clearTimeout(timeout);
    };
  }, [projectId]);

  if (isLoading)
    return <div className='p-8 text-center'>Loading project management...</div>;
  if (error) {
    return (
      <div className='p-8 text-center text-red-600'>
        {error}
        <div className='mt-4 text-xs text-gray-500'>
          Project ID: <span className='font-mono'>{projectId || '(none)'}</span>
        </div>
      </div>
    );
  }

  const ActiveTab = tabs.find((t) => t.id === activeTab);
  const ActiveComponent = ActiveTab?.component;

  return (
    <div className='min-h-screen bg-background'>
      <div className='max-w-7xl mx-auto py-8 px-4'>
        {/* Page Header */}
        <div className='flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8'>
          <div>
            <h1 className='text-3xl font-bold text-foreground mb-2'>
              {project?.name || 'Project Management'}
            </h1>
            <p className='text-text-secondary'>
              {project?.description ||
                'Project management and team coordination'}
            </p>
          </div>
          <div className='flex gap-3'>
            <Button variant='outline' iconName='Download' iconPosition='left'>
              Export Data
            </Button>
            <Button variant='outline' iconName='BarChart3' iconPosition='left'>
              Generate Report
            </Button>
            <Button variant='default' iconName='Plus' iconPosition='left'>
              New Project
            </Button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className='bg-card rounded-lg border border-border mb-6'>
          {/* Desktop Tab Navigation */}
          <div className='hidden md:flex border-b border-border'>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-6 py-4 font-medium transition-colors relative ${
                  activeTab === tab.id
                    ? 'text-primary border-b-2 border-primary bg-primary/5'
                    : 'text-text-secondary hover:text-foreground hover:bg-muted/50'
                }`}
              >
                <Icon name={tab.icon} size={18} />
                <div className='text-left'>
                  <div className='font-medium'>{tab.label}</div>
                  <div className='text-xs text-text-secondary'>
                    {tab.description}
                  </div>
                </div>
              </button>
            ))}
          </div>
          {/* Mobile Tab Navigation */}
          <div className='md:hidden border-b border-border p-4'>
            <div className='relative'>
              <select
                value={activeTab}
                onChange={(e) => setActiveTab(e.target.value)}
                className='w-full appearance-none bg-background border border-border rounded-lg px-4 py-3 pr-10 text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent'
              >
                {tabs.map((tab) => (
                  <option key={tab.id} value={tab.id}>
                    {tab.label} - {tab.description}
                  </option>
                ))}
              </select>
              <Icon
                name='ChevronDown'
                size={20}
                className='absolute right-3 top-1/2 transform -translate-y-1/2 text-text-secondary pointer-events-none'
              />
            </div>
          </div>
          {/* Tab Content */}
          <div className='p-6'>
            {/* Active Tab Header (Mobile) */}
            <div className='flex items-center gap-3 mb-6 md:hidden'>
              <Icon name={ActiveTab.icon} size={24} className='text-primary' />
              <div>
                <h2 className='text-xl font-semibold text-foreground'>
                  {ActiveTab.label}
                </h2>
                <p className='text-sm text-text-secondary'>
                  {ActiveTab.description}
                </p>
              </div>
            </div>
            {/* Render Active Tab Content */}
            <Suspense fallback={<div>Loading tab...</div>}>
              {ActiveComponent && <ActiveComponent project={project} />}
            </Suspense>
          </div>
        </div>

        {/* Quick Actions Footer */}
        <div className='bg-card rounded-lg border border-border p-6'>
          <div className='flex flex-col sm:flex-row items-center justify-between gap-4'>
            <div className='flex items-center gap-3'>
              <Icon name='Zap' size={20} className='text-primary' />
              <div>
                <h3 className='font-medium text-foreground'>Quick Actions</h3>
                <p className='text-sm text-text-secondary'>
                  Frequently used project management tools
                </p>
              </div>
            </div>
            <div className='flex flex-wrap gap-2'>
              <Button
                variant='outline'
                size='sm'
                iconName='UserPlus'
                iconPosition='left'
              >
                Invite Team
              </Button>
              <Button
                variant='outline'
                size='sm'
                iconName='Calendar'
                iconPosition='left'
              >
                Schedule Meeting
              </Button>
              <Button
                variant='outline'
                size='sm'
                iconName='FileText'
                iconPosition='left'
              >
                Create Template
              </Button>
              <Button
                variant='outline'
                size='sm'
                iconName='Archive'
                iconPosition='left'
              >
                Backup Project
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectManagement;
