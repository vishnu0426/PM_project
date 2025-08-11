import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import sessionService from '../utils/sessionService.js';
import apiService from '../utils/realApiService.js';

/**
 * Custom hook for managing user profile data consistently across the application
 * This ensures all components use the same user data and stay in sync
 */
export const useUserProfile = () => {
  const { user: authUser, isAuthenticated } = useAuth();
  const [userProfile, setUserProfile] = useState(null);
  const [currentOrganization, setCurrentOrganization] = useState(null);
  const [availableOrganizations, setAvailableOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Normalize user data to ensure consistent format
  const normalizeUserData = (userData) => {
    if (!userData) return null;

    // Handle different field name formats from API
    const firstName = userData.firstName || userData.first_name || '';
    const lastName = userData.lastName || userData.last_name || '';
    const email = userData.email || '';

    // Generate display name with fallbacks
    let displayName = '';
    if (firstName || lastName) {
      displayName = `${firstName} ${lastName}`.trim();
    }
    if (!displayName && email) {
      displayName = email.split('@')[0];
    }
    if (!displayName) {
      displayName = 'User';
    }

    return {
      id: userData.id,
      email: email,
      firstName: firstName,
      lastName: lastName,
      displayName: displayName,
      avatar:
        userData.avatar ||
        userData.profilePicture ||
        userData.profile_picture ||
        '/assets/images/avatar.jpg',
      role: userData.role || 'member',
      jobTitle: userData.jobTitle || userData.job_title || '',
      bio: userData.bio || userData.description || '',
      emailVerified: userData.emailVerified || userData.email_verified || false,
      twoFactorEnabled:
        userData.twoFactorEnabled || userData.two_factor_enabled || false,
      lastLoginAt: userData.lastLoginAt || userData.last_login_at,
      createdAt: userData.createdAt || userData.created_at,
    };
  };

  // Normalize organization data
  const normalizeOrganizationData = (orgData) => {
    if (!orgData) return null;

    return {
      id: orgData.id,
      name: orgData.name || 'Organization',
      domain: orgData.domain || '',
      logo: orgData.logo || '/assets/images/org-logo.png',
      role: orgData.role || 'member',
      slug: orgData.slug || '',
      member_count: orgData.member_count || 0,
      joined_at: orgData.joined_at,
    };
  };

  // Load user profile data
  const loadUserProfile = async () => {
    if (!isAuthenticated) {
      setUserProfile(null);
      setCurrentOrganization(null);
      setAvailableOrganizations([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Get current user from session service
      const currentUser = sessionService.getCurrentUser();

      if (currentUser) {
        const normalizedUser = normalizeUserData(currentUser);
        setUserProfile(normalizedUser);

        // Get user data and organizations from API
        try {
          const result = await apiService.users.getCurrentUser();
          console.log('🔍 USER PROFILE: API result:', result);

          if (
            result &&
            result.organizations &&
            result.organizations.length > 0
          ) {
            const normalizedOrgs = result.organizations.map(
              normalizeOrganizationData
            );
            setAvailableOrganizations(normalizedOrgs);

            // Use current_organization_id from backend if available
            let currentOrg = null;
            if (result.current_organization_id) {
              currentOrg = normalizedOrgs.find(
                (org) => org.id === result.current_organization_id
              );
            }

            // Fallback to saved org or first org
            if (!currentOrg) {
              const savedOrgId = sessionService.getOrganizationId();
              currentOrg = savedOrgId
                ? normalizedOrgs.find((org) => org.id === savedOrgId) ||
                  normalizedOrgs[0]
                : normalizedOrgs[0];
            }

            setCurrentOrganization(currentOrg);

            // Save current organization ID and user role to sessionStorage
            if (currentOrg) {
              sessionStorage.setItem('currentOrganizationId', currentOrg.id);
              sessionStorage.setItem('organizationId', currentOrg.id);
              sessionStorage.setItem('userRole', currentOrg.role);
            }
          } else {
            // Create fallback organization
            const orgId = sessionService.getOrganizationId() || 'fallback-org';
            const fallbackOrg = {
              id: orgId,
              name: 'Organization',
              domain: '',
              logo: '/assets/images/org-logo.png',
              role: normalizedUser.role || 'member',
            };
            setCurrentOrganization(fallbackOrg);
            setAvailableOrganizations([fallbackOrg]);
          }
        } catch (apiError) {
          console.error('Failed to load organizations from API:', apiError);
          // Create fallback organization
          const orgId = sessionService.getOrganizationId() || 'fallback-org';
          const fallbackOrg = {
            id: orgId,
            name: 'Organization',
            domain: '',
            logo: '/assets/images/org-logo.png',
            role: normalizedUser.role || 'member',
          };
          setCurrentOrganization(fallbackOrg);
          setAvailableOrganizations([fallbackOrg]);
        }
      } else {
        // Use auth context user as fallback
        if (authUser) {
          const normalizedUser = normalizeUserData(authUser);
          setUserProfile(normalizedUser);
        }
      }
    } catch (err) {
      console.error('Failed to load user profile:', err);
      setError(err.message);

      // Use auth context user as fallback
      if (authUser) {
        const normalizedUser = normalizeUserData(authUser);
        setUserProfile(normalizedUser);
      }
    } finally {
      setLoading(false);
    }
  };

  // Switch organization
  const switchOrganization = (organizationId) => {
    const org = availableOrganizations.find((o) => o.id === organizationId);
    if (org) {
      setCurrentOrganization(org);
      localStorage.setItem('currentOrganizationId', org.id);
    }
  };

  // Update user profile
  const updateUserProfile = (updates) => {
    if (userProfile) {
      const updatedProfile = { ...userProfile, ...updates };
      const normalizedProfile = normalizeUserData(updatedProfile);
      setUserProfile(normalizedProfile);
    }
  };

  // Load data when authentication state changes
  useEffect(() => {
    loadUserProfile();
  }, [isAuthenticated, authUser]);

  return {
    userProfile,
    currentOrganization,
    availableOrganizations,
    loading,
    error,
    switchOrganization,
    updateUserProfile,
    refreshProfile: loadUserProfile,
  };
};
