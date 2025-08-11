// src/utils/authService.js
// Authentication service that connects to the backend API via apiService/sessionService

import apiService from './apiService.js';
import sessionService from './sessionService.js';

const authService = {
  // Sign up a new user with real backend integration
  signUp: async (email, password, userData = {}) => {
    try {
      const registrationData = {
        email,
        password,
        first_name: userData.firstName || userData.first_name || '',
        last_name: userData.lastName || userData.last_name || '',
        organization_name:
          userData.organizationName || userData.organization_name || '',
        organization_slug:
          userData.organizationSlug || userData.organization_slug || '',
        organization_domain:
          userData.organizationDomain || userData.organization_domain || '',
      };

      const result = await apiService.auth.register(registrationData);

      if (result.error) {
        return {
          data: null,
          error: result.error,
        };
      }

      // Transform the response to match the expected format
      // Note: result.data contains the backend response which has its own data property
      const backendData = result.data.data || result.data;

      return {
        data: {
          user: {
            id: backendData.user.id,
            email: backendData.user.email,
            firstName: backendData.user.first_name,
            lastName: backendData.user.last_name,
            emailVerified: backendData.user.email_verified || false,
            role: backendData.organization?.role || 'owner',
          },
          organization: backendData.organization || null,
          tokens: backendData.tokens,
        },
        error: null,
      };
    } catch (error) {
      console.error('SignUp error:', error);
      return {
        data: null,
        error: error.message || 'Sign up failed',
      };
    }
  },

  // Register function (alias for signUp for compatibility)
  register: async (email, password, userData = {}) => {
    return await authService.signUp(email, password, userData);
  },

  // Sign in with email and password using real backend
  signIn: async (email, password) => {
    try {
      // Prefer sessionService for session lifecycle
      const sessionResult = await sessionService.login(email, password);
      if (!sessionResult.success) {
        return { data: null, error: sessionResult.error || 'Login failed' };
      }

      // Also return a consistent structure used by callers
      const backendData = sessionResult.data;
      const userRole = backendData.organization?.role || 'member';

      return {
        data: {
          user: {
            id: backendData.user.id,
            email: backendData.user.email,
            firstName: backendData.user.first_name,
            lastName: backendData.user.last_name,
            emailVerified: backendData.user.email_verified ?? true,
            role: userRole,
          },
          organization: backendData.organization || null,
          tokens: backendData.tokens,
        },
        error: null,
      };
    } catch (error) {
      console.error('SignIn error:', error);
      return {
        data: null,
        error: error.message || 'Login failed',
      };
    }
  },

  // Sign out
  signOut: async () => {
    return await sessionService.logout();
  },

  // Logout (alias for signOut)
  logout: async () => {
    return await sessionService.logout();
  },

  // Get current user profile using real backend with timeout
  getCurrentUser: async () => {
    try {
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Request timeout')), 3000)
      );

      const userPromise = apiService.users.getCurrentUser();

      const result = await Promise.race([userPromise, timeoutPromise]);

      if (result.error || !result.data) {
        return {
          data: null,
          error: result.error || 'Failed to get current user',
        };
      }

      // The backend returns UserProfileWithRole, but wrapped in data property
      const backendData = result.data.data || result.data;

      // Transform the response to match the expected format
      return {
        data: {
          user: {
            id: backendData.id,
            email: backendData.email,
            firstName: backendData.first_name,
            lastName: backendData.last_name,
            emailVerified: backendData.email_verified || true,
            role: backendData.role || 'member',
            avatar: backendData.avatar_url,
          },
          organizations: (backendData.organizations || []).map((org) => ({
            id: org.id,
            name: org.name,
            role: org.role,
          })),
          current_organization_id: backendData.current_organization_id,
        },
        error: null,
      };
    } catch (error) {
      console.error('GetCurrentUser error:', error);
      return {
        data: null,
        error: error.message || 'Failed to get current user',
      };
    }
  },

  // Refresh access token
  refreshToken: async () => {
    try {
      return {
        data: {
          accessToken: sessionService.getSessionToken(),
          refreshToken: 'mock-refresh-token',
        },
        error: null,
      };
    } catch (error) {
      return {
        data: null,
        error: error.message || 'Token refresh failed',
      };
    }
  },

  // Check if user is authenticated
  isAuthenticated: () => sessionService.isAuthenticated(),

  // Get stored access token
  getAccessToken: () => sessionService.getSessionToken(),

  // Get user role
  getUserRole: () => sessionService.getUserRole(),

  // Get organization ID
  getOrganizationId: () => sessionService.getOrganizationId(),

  // Get current organization using real backend with timeout
  getCurrentOrganization: async () => {
    try {
      const organizationId = sessionService.getOrganizationId();

      if (!organizationId) {
        return {
          data: { organization: null },
          error: null,
        };
      }

      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Request timeout')), 3000)
      );

      const organizationPromise =
        apiService.organizations.getById(organizationId);

      const organization = await Promise.race([
        organizationPromise,
        timeoutPromise,
      ]);

      return {
        data: { organization },
        error: null,
      };
    } catch (error) {
      console.error('GetCurrentOrganization error:', error);
      return {
        data: { organization: null },
        error: null, // Don't expose errors for getCurrentOrganization
      };
    }
  },

  // Get dashboard stats using real backend
  getDashboardStats: async () => {
    try {
      const result = await apiService.users.getDashboardStats();

      return {
        data: result.data,
        userRole: sessionService.getUserRole(),
        error: result.error,
      };
    } catch (error) {
      console.error('GetDashboardStats error:', error);
      return {
        data: null,
        error: error.message || 'Failed to get dashboard stats',
      };
    }
  },

  // Listen to auth state changes
  onAuthStateChange: (callback) => {
    // Simple implementation - check token periodically
    const checkAuth = async () => {
      const result = await authService.getCurrentUser();
      callback(result.data.user, result.error);
    };

    // Check immediately
    checkAuth();

    // Set up periodic check (every 5 minutes)
    const interval = setInterval(checkAuth, 5 * 60 * 1000);

    return {
      data: {
        subscription: {
          unsubscribe: () => clearInterval(interval),
        },
      },
    };
  },
};

export default authService;
