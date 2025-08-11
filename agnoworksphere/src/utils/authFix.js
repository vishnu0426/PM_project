// Authentication Fix Utility
// Database-only authentication service - NO localStorage usage

import sessionService from './sessionService.js';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

// Test credentials for development
const TEST_CREDENTIALS = {
  email: 'cardtest@example.com',
  password: 'CardTest123!',
};

export const authFix = {
  // Check if user is properly authenticated via database session
  isAuthenticated: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/users/me`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${sessionService.getSessionToken()}`,
          'Content-Type': 'application/json',
        },
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  },

  // Get current token from session service (database-backed)
  getToken: () => {
    return sessionService.getSessionToken();
  },

  // Auto-login with test credentials for development
  autoLogin: async () => {
    try {
      console.log('🔧 AUTH FIX: Attempting auto-login...');

      const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(TEST_CREDENTIALS),
      });

      if (!response.ok) {
        throw new Error(`Login failed: ${response.status}`);
      }

      const result = await response.json();

      // Use sessionService to store session in database (no localStorage)
      sessionService.storeSession(result.data);

      console.log('✅ AUTH FIX: Auto-login successful via database session');
      return { success: true, token: sessionService.getSessionToken() };
    } catch (error) {
      console.error('❌ AUTH FIX: Auto-login failed:', error);
      return { success: false, error: error.message };
    }
  },

  // Fix authentication issues automatically using database sessions
  fixAuth: async () => {
    // Check if already authenticated via database session
    if (await authFix.isAuthenticated()) {
      console.log('✅ AUTH FIX: Already authenticated via database session');
      return { success: true, message: 'Already authenticated' };
    }

    // Try auto-login
    console.log('🔧 AUTH FIX: Not authenticated, attempting auto-login...');
    const loginResult = await authFix.autoLogin();

    if (loginResult.success) {
      // Reload the page to refresh the app state
      console.log(
        '🔄 AUTH FIX: Reloading page to refresh authentication state...'
      );
      window.location.reload();
      return {
        success: true,
        message: 'Authentication fixed, page reloading...',
      };
    } else {
      return { success: false, error: loginResult.error };
    }
  },

  // Clear authentication data from database session
  clearAuth: async () => {
    await sessionService.logout();
    console.log('🧹 AUTH FIX: Database session cleared');
  },

  // Debug authentication state from database session
  debugAuth: async () => {
    console.log('🔍 AUTH DEBUG STATE (Database Session):');
    console.log(
      '- sessionToken:',
      sessionService.getSessionToken()?.substring(0, 20) + '...'
    );
    console.log('- currentUser:', sessionService.getCurrentUser());
    console.log('- isAuthenticated:', await authFix.isAuthenticated());
    console.log('- sessionService state:', {
      hasSession: !!sessionService.currentSession,
      hasToken: !!sessionService.sessionToken,
      hasUser: !!sessionService.user,
    });
  },
};

// Auto-fix authentication on module load in development
if (process.env.NODE_ENV === 'development') {
  // Check authentication state on page load
  setTimeout(async () => {
    if (!(await authFix.isAuthenticated())) {
      console.log(
        '🔧 AUTH FIX: No database session detected, will auto-fix on next API call'
      );
    }
  }, 1000);
}

export default authFix;
