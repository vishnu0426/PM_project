// Debug utility to check authentication state
import sessionService from './sessionService.js';
import authService from './authService.js';

export const debugAuth = {
  // Check current authentication state
  checkAuthState: () => {
    console.log('🔍 AUTH DEBUG - Current State:');
    console.log(
      '- sessionService.isAuthenticated():',
      sessionService.isAuthenticated()
    );
    console.log(
      '- sessionService.getSessionToken():',
      sessionService.getSessionToken()?.substring(0, 20) + '...'
    );
    console.log(
      '- authService.isAuthenticated():',
      authService.isAuthenticated()
    );
    console.log(
      '- authService.getAccessToken():',
      authService.getAccessToken()?.substring(0, 20) + '...'
    );

    // Check sessionStorage
    try {
      const stored = sessionStorage.getItem('agno_session');
      if (stored) {
        const session = JSON.parse(stored);
        console.log('- sessionStorage has session data:', !!session);
        console.log('- sessionStorage user:', session.user?.email);
        console.log(
          '- sessionStorage organization:',
          session.organization?.name
        );
      } else {
        console.log('- sessionStorage: No session data found');
      }
    } catch (error) {
      console.log('- sessionStorage error:', error.message);
    }

    // Database-only authentication - no localStorage usage
    console.log(
      '- Database-only auth: localStorage not used for authentication'
    );
  },

  // Test API call with current token
  testApiCall: async () => {
    try {
      const token = authService.getAccessToken();
      if (!token) {
        console.log('❌ No token available for API test');
        return false;
      }

      const response = await fetch('http://localhost:8000/api/v1/users/me', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ API test successful:', result.data?.user?.email);
        return true;
      } else {
        console.log(
          '❌ API test failed:',
          response.status,
          response.statusText
        );
        return false;
      }
    } catch (error) {
      console.log('❌ API test error:', error.message);
      return false;
    }
  },

  // Quick login for testing
  quickLogin: async () => {
    try {
      console.log('🔐 Attempting quick login...');
      const result = await authService.signIn(
        'owner@example.com',
        'password123'
      );

      if (result.data) {
        console.log('✅ Quick login successful:', result.data.user.email);
        return true;
      } else {
        console.log('❌ Quick login failed:', result.error);
        return false;
      }
    } catch (error) {
      console.log('❌ Quick login error:', error.message);
      return false;
    }
  },

  // Full debug report
  fullReport: async () => {
    console.log('🔍 FULL AUTH DEBUG REPORT');
    console.log('=' * 50);

    debugAuth.checkAuthState();

    console.log('\n🧪 Testing API call...');
    const apiWorking = await debugAuth.testApiCall();

    if (!apiWorking) {
      console.log('\n🔐 Trying quick login...');
      const loginWorking = await debugAuth.quickLogin();

      if (loginWorking) {
        console.log('\n🧪 Re-testing API call after login...');
        await debugAuth.testApiCall();
      }
    }

    console.log('\n✅ Debug report complete');
  },
};

// Auto-run debug on import in development
if (process.env.NODE_ENV === 'development') {
  // Make it available globally for console debugging
  window.debugAuth = debugAuth;
}

export default debugAuth;
