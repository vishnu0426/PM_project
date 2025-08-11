// src/contexts/AuthContext.jsx

import React, { createContext, useContext, useState, useEffect } from 'react';
import sessionService from '../utils/sessionService';
import authService from '../utils/authService';

// Create context
const AuthContext = createContext();

// Enhanced context provider with mock authentication
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const checkExistingSession = async () => {
      try {
        console.log('🔍 AUTH: Initializing session service...');

        // Initialize session service (checks for existing session)
        const hasValidSession = await sessionService.initialize();

        if (hasValidSession) {
          const currentUser = sessionService.getCurrentUser();
          if (currentUser) {
            setUser(currentUser);
            console.log(
              '✅ AUTH: Session restored for user:',
              currentUser.email
            );

            // Try to connect WebSocket for restored session (optional)
            try {
              await connectWebSocket(currentUser);
            } catch (e) {
              console.warn(
                'WebSocket connection on session restore failed (non-critical):',
                e?.message
              );
            }
          }
        } else {
          console.log('ℹ️ AUTH: No valid session found');
        }
      } catch (error) {
        console.error('❌ AUTH: Session initialization failed:', error);
        // Clear any invalid session data
        sessionService.clearSession();
      } finally {
        setLoading(false);
      }
    };

    checkExistingSession();
  }, []);

  // Connect WebSocket for real-time notifications after session restore
  // Use DB-backed sessionService for token retrieval (no localStorage)
  const connectWebSocket = async (u) => {
    try {
      // Get token from sessionService (synchronous call)
      const token = sessionService.getSessionToken();
      if (!token) {
        console.warn('WebSocket connect skipped: missing token');
        return;
      }
      if (!u?.id) {
        console.warn('WebSocket connect skipped: missing userId');
        return;
      }
      const wsMod = await import('../utils/websocketService.js');
      const websocketService = wsMod.default || wsMod;
      await websocketService.connect(token, u.id);
    } catch (e) {
      console.warn('WebSocket connect skipped:', e?.message || e);
    }
  };

  const login = async (email, password) => {
    try {
      console.log('🔐 AUTH: Attempting login with session service...');

      const result = await sessionService.login(email, password);

      if (!result.success) {
        console.log('❌ AUTH: Login failed:', result.error);
        return { success: false, error: result.error };
      }

      console.log('✅ AUTH: Login successful, setting user state...');

      // Get user data from session service
      const currentUser = sessionService.getCurrentUser();
      const userData = {
        ...currentUser,
        organizationId: result.data.organization?.id,
        organizationName: result.data.organization?.name,
        organizationRole: result.data.organization?.role,
      };

      setUser(userData);

      // Connect WebSocket now that we have a user and token
      try {
        // Small delay to ensure session is fully stored
        await new Promise((resolve) => setTimeout(resolve, 100));

        // Get token from sessionService (synchronous call)
        const token = sessionService.getSessionToken();
        console.log(
          '🔌 AUTH: WebSocket connection attempt - token:',
          token ? 'present' : 'missing',
          'userId:',
          userData?.id
        );

        if (token && userData?.id) {
          const wsMod = await import('../utils/websocketService.js');
          const websocketService = wsMod.default || wsMod;
          await websocketService.connect(token, userData.id);
          console.log('✅ AUTH: WebSocket connected successfully');
        } else {
          console.warn(
            '⚠️ AUTH: WebSocket connection skipped - missing token or userId'
          );
        }
      } catch (e) {
        console.warn(
          '❌ AUTH: WebSocket connect on login failed:',
          e?.message || e
        );
      }

      // Add a small delay to ensure state is updated before navigation
      await new Promise((resolve) => setTimeout(resolve, 100));

      console.log('✅ AUTH: User state set, ready for navigation');
      return { success: true, data: result.data };
    } catch (error) {
      console.log('❌ AUTH: Login error:', error.message);
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    try {
      console.log('🚪 AUTH: Logging out...');
      await sessionService.logout();
      setUser(null);
      console.log('✅ AUTH: Logout successful');
      return { success: true };
    } catch (error) {
      console.log('❌ AUTH: Logout error:', error.message);
      return { success: false, error: error.message };
    }
  };

  const register = async (email, password, userData) => {
    try {
      const result = await authService.signUp(email, password, userData);
      if (result.error) {
        return { success: false, error: result.error };
      }

      setUser(result.data.user);
      return { success: true, data: result.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const getOrganizationId = () => {
    return (
      sessionService.getOrganizationId() ||
      user?.organizationId ||
      user?.current_organization_id ||
      null
    );
  };

  const value = {
    user,
    login,
    logout,
    register,
    isAuthenticated: !!user,
    loading,
    getOrganizationId,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook
export const useAuth = () => useContext(AuthContext);
