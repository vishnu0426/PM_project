import React, { useState, useEffect, Suspense, lazy } from 'react';
import { getOrganizationById } from '../../utils/organizationService';
import sessionService from '../../utils/sessionService';

// Simple error boundary for tab content
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    // Log error if needed
    console.error('ErrorBoundary caught:', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className='p-8 text-center text-red-600'>
          Something went wrong: {this.state.error?.message || 'Unknown error'}
        </div>
      );
    }
    return this.props.children;
  }
}

const tabs = [
  {
    id: 'general',
    label: 'General',
    component: lazy(() => import('./components/GeneralSettings')),
  },
  {
    id: 'security',
    label: 'Security',
    component: lazy(() => import('./components/SecuritySettings')),
  },
  {
    id: 'integrations',
    label: 'Integrations',
    component: lazy(() => import('./components/IntegrationSettings')),
  },
  {
    id: 'members',
    label: 'Members',
    component: lazy(() => import('./components/MemberManagement')),
  },
  {
    id: 'billing',
    label: 'Billing',
    component: lazy(() => import('./components/BillingSettings')),
  },
];

const OrganizationSettings = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [orgData, setOrgData] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Robust async org loader with timeout to prevent freezing
  const loadOrg = async () => {
    setIsLoading(true);
    setError(null);
    
    // Add timeout to prevent infinite hanging
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Request timeout')), 10000)
    );
    
    try {
      console.log('Loading organization data...');
      
      const loadPromise = (async () => {
        const orgId = sessionService.getOrganizationId();
        console.log('Organization ID from session:', orgId);
        
        if (!orgId) {
          throw new Error('No organization ID found in session.');
        }
        
        const response = await getOrganizationById(orgId);
        console.log('Organization API response:', response);
        
        if (response?.data) {
          setOrgData(response.data);
          console.log('Organization data loaded successfully:', response.data);
        } else {
          throw new Error(response?.error || 'Organization not found.');
        }
      })();
      
      // Race between actual load and timeout
      await Promise.race([loadPromise, timeoutPromise]);
      
    } catch (e) {
      console.error('Error loading organization:', e);
      setError(e.message || 'Failed to load organization.');
      
      // Set fallback data to prevent complete failure
      setOrgData({
        id: 'fallback',
        name: 'Organization Settings',
        description: 'Settings not available',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Add a small delay to ensure session is ready
    const timeoutId = setTimeout(() => {
      loadOrg();
    }, 100);
    
    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line
  }, [refreshKey]);

  if (isLoading)
    return (
      <div className='p-8 text-center'>
        <div className='animate-pulse text-lg text-muted-foreground'>
          Loading organization settings...
        </div>
      </div>
    );
  if (error)
    return (
      <div className='p-8 text-center text-red-600'>
        {error}
        <br />
        <button
          className='mt-4 px-4 py-2 rounded bg-primary text-white hover:bg-primary-dark transition-colors'
          onClick={() => setRefreshKey((k) => k + 1)}
        >
          Refresh
        </button>
      </div>
    );

  const ActiveComponent = tabs.find((t) => t.id === activeTab)?.component;

  return (
    <div className='min-h-screen bg-background'>
      <div className='max-w-4xl mx-auto py-8'>
        <h1 className='text-2xl font-bold mb-4'>
          Organization Settings: {orgData?.name}
        </h1>
        <div className='flex gap-2 mb-6'>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`px-4 py-2 rounded transition-colors duration-150 ${
                activeTab === tab.id
                  ? 'bg-primary text-white'
                  : 'bg-muted hover:bg-accent'
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <ErrorBoundary>
          <Suspense fallback={<div>Loading tab...</div>}>
            {ActiveComponent && <ActiveComponent orgData={orgData} />}
          </Suspense>
        </ErrorBoundary>
      </div>
    </div>
  );
};

export default OrganizationSettings;
