import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import sessionService from '../../utils/sessionService';
import OwnerDashboard from './owner/OwnerDashboard';
import AdminDashboard from './admin/AdminDashboard';
import MemberDashboard from './member/MemberDashboard';
import ViewerDashboard from './viewer/ViewerDashboard';

const DashboardRouter = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const determineUserRole = () => {
      try {
        setLoading(true);

        // Check if user is authenticated and has user data
        if (!isAuthenticated || !user) {
          console.log(
            'DashboardRouter: User not authenticated, redirecting to login'
          );
          navigate('/login', {
            state: {
              message: 'Please log in to access your dashboard',
              from: location.pathname,
            },
          });
          return;
        }

        // Determine role with robust fallbacks (organization role > user role > stored)
        const roleFromSession = sessionService.getUserRole();
        const resolvedRole = (
          roleFromSession ||
          user?.organizationRole ||
          user?.role ||
          'member'
        ).toLowerCase();

        console.log(
          'Dashboard Router - User role determined:',
          resolvedRole,
          'for user:',
          user.email
        );
        setUserRole(resolvedRole);
      } catch (error) {
        console.error('Failed to determine user role:', error);
        setError(error.message);

        // On error, default to member role to prevent blocking access
        setUserRole('member');
      } finally {
        setLoading(false);
      }
    };

    // Wait for auth to finish loading before determining role
    if (!authLoading) {
      determineUserRole();
    }
  }, [navigate, location.pathname, user, isAuthenticated, authLoading]);

  // Show loading state while auth is loading or role is being determined
  if (authLoading || loading) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4'></div>
          <p className='text-slate-600'>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error && !userRole) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center'>
        <div className='text-center max-w-md mx-auto'>
          <div className='bg-red-100 rounded-full p-3 mx-auto mb-4 w-16 h-16 flex items-center justify-center'>
            <svg
              className='w-8 h-8 text-red-600'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z'
              />
            </svg>
          </div>
          <h2 className='text-xl font-semibold text-slate-800 mb-2'>
            Dashboard Error
          </h2>
          <p className='text-slate-600 mb-6'>
            Unable to load your dashboard. Please try refreshing the page or
            contact support.
          </p>
          <div className='space-x-4'>
            <button
              onClick={() => window.location.reload()}
              className='inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200'
            >
              Refresh Page
            </button>
            <button
              onClick={() => navigate('/login')}
              className='inline-flex items-center px-4 py-2 bg-slate-600 text-white text-sm font-medium rounded-lg hover:bg-slate-700 transition-colors duration-200'
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Route to appropriate dashboard based on user role
  switch (userRole) {
    case 'owner':
      return <OwnerDashboard />;
    case 'admin':
      return <AdminDashboard />;
    case 'member':
      return <MemberDashboard />;
    case 'viewer':
      return <ViewerDashboard />;
    default:
      // Default to member dashboard for unknown roles
      console.warn(
        `Unknown user role: ${userRole}, defaulting to member dashboard`
      );
      return <MemberDashboard />;
  }
};

export default DashboardRouter;
