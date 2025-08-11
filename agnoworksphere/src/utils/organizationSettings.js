/**
 * Organization Settings Management
 * Utilities for managing organization-specific settings and permissions
 */

const API_BASE_URL = 'http://localhost:3001';

import sessionService from './sessionService.js';

// Get auth headers
const getAuthHeaders = () => {
  const token = sessionService.getSessionToken();
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};

/**
 * Get organization settings
 */
export const getOrganizationSettings = async (organizationId) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/organizations-enhanced/${organizationId}/settings`,
      {
        method: 'GET',
        headers: getAuthHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Failed to get organization settings:', error);
    throw error;
  }
};

/**
 * Update organization settings (owner only)
 */
export const updateOrganizationSettings = async (organizationId, settings) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/organizations-enhanced/${organizationId}/settings`,
      {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(settings),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `HTTP ${response.status}: ${errorData.detail || response.statusText}`
      );
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Failed to update organization settings:', error);
    throw error;
  }
};

/**
 * Enable admin project creation (owner only)
 */
export const enableAdminProjectCreation = async (organizationId) => {
  try {
    console.log('🔧 Enabling admin project creation...');

    const result = await updateOrganizationSettings(organizationId, {
      allow_admin_create_projects: true,
    });

    console.log('✅ Admin project creation enabled:', result);
    return result;
  } catch (error) {
    console.error('❌ Failed to enable admin project creation:', error);
    throw error;
  }
};

/**
 * Disable admin project creation (owner only)
 */
export const disableAdminProjectCreation = async (organizationId) => {
  try {
    console.log('🔧 Disabling admin project creation...');

    const result = await updateOrganizationSettings(organizationId, {
      allow_admin_create_projects: false,
    });

    console.log('✅ Admin project creation disabled:', result);
    return result;
  } catch (error) {
    console.error('❌ Failed to disable admin project creation:', error);
    throw error;
  }
};

/**
 * Check if admin project creation is enabled
 */
export const isAdminProjectCreationEnabled = async (organizationId) => {
  try {
    const settings = await getOrganizationSettings(organizationId);
    return settings.allow_admin_create_projects || false;
  } catch (error) {
    console.error('Failed to check admin project creation setting:', error);
    return false;
  }
};

/**
 * Debug user permissions for project creation
 */
export const debugProjectCreationPermissions = async (organizationId) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/projects/debug/permissions?organization_id=${organizationId}`,
      {
        method: 'GET',
        headers: getAuthHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    console.log('🔍 Project Creation Permissions Debug:', result);
    return result;
  } catch (error) {
    console.error('❌ Failed to debug permissions:', error);
    throw error;
  }
};

/**
 * Auto-fix project creation permissions for admins (owner only)
 */
export const autoFixAdminProjectCreation = async (organizationId) => {
  try {
    console.log('🔧 Auto-fixing admin project creation permissions...');

    // First, debug current permissions
    const permissions = await debugProjectCreationPermissions(organizationId);

    if (permissions.can_create_projects) {
      console.log('✅ User already has project creation permissions');
      return permissions;
    }

    // If user is admin and cannot create projects, try to enable it
    if (permissions.user_role === 'admin') {
      try {
        await enableAdminProjectCreation(organizationId);
        console.log('✅ Admin project creation enabled');

        // Check permissions again
        const updatedPermissions = await debugProjectCreationPermissions(
          organizationId
        );
        return updatedPermissions;
      } catch (error) {
        console.error(
          '❌ Failed to enable admin project creation (you might not be an owner):',
          error.message
        );
        throw new Error(
          'Only organization owners can enable admin project creation. Please contact your organization owner.'
        );
      }
    } else {
      throw new Error(
        `Cannot auto-fix permissions for role: ${permissions.user_role}. Only admins can have project creation enabled.`
      );
    }
  } catch (error) {
    console.error('❌ Failed to auto-fix admin project creation:', error);
    throw error;
  }
};

/**
 * Show organization settings management UI (for development)
 */
export const showOrganizationSettingsDebug = (organizationId) => {
  if (process.env.NODE_ENV !== 'development') {
    return;
  }

  // Remove existing debug panel
  const existingPanel = document.getElementById('org-settings-debug-panel');
  if (existingPanel) {
    existingPanel.remove();
  }

  // Create debug panel
  const panel = document.createElement('div');
  panel.id = 'org-settings-debug-panel';
  panel.style.cssText = `
    position: fixed;
    top: 50px;
    right: 10px;
    z-index: 9999;
    background: white;
    border: 2px solid #3b82f6;
    border-radius: 8px;
    padding: 16px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    font-family: monospace;
    font-size: 12px;
    max-width: 300px;
  `;

  panel.innerHTML = `
    <div style="font-weight: bold; margin-bottom: 12px; color: #3b82f6;">
      🔧 Organization Settings Debug
    </div>
    <button id="debug-permissions-btn" style="width: 100%; margin-bottom: 8px; padding: 6px; background: #10b981; color: white; border: none; border-radius: 4px; cursor: pointer;">
      🔍 Debug Permissions
    </button>
    <button id="enable-admin-projects-btn" style="width: 100%; margin-bottom: 8px; padding: 6px; background: #3b82f6; color: white; border: none; border-radius: 4px; cursor: pointer;">
      ✅ Enable Admin Projects
    </button>
    <button id="disable-admin-projects-btn" style="width: 100%; margin-bottom: 8px; padding: 6px; background: #ef4444; color: white; border: none; border-radius: 4px; cursor: pointer;">
      ❌ Disable Admin Projects
    </button>
    <button id="auto-fix-btn" style="width: 100%; margin-bottom: 8px; padding: 6px; background: #f59e0b; color: white; border: none; border-radius: 4px; cursor: pointer;">
      🔧 Auto-Fix Permissions
    </button>
    <button id="close-debug-btn" style="width: 100%; padding: 6px; background: #6b7280; color: white; border: none; border-radius: 4px; cursor: pointer;">
      ✖️ Close
    </button>
  `;

  // Add event listeners
  panel.querySelector('#debug-permissions-btn').onclick = async () => {
    try {
      const result = await debugProjectCreationPermissions(organizationId);
      alert(`Debug Result:\n${JSON.stringify(result, null, 2)}`);
    } catch (error) {
      alert(`Debug Error:\n${error.message}`);
    }
  };

  panel.querySelector('#enable-admin-projects-btn').onclick = async () => {
    try {
      await enableAdminProjectCreation(organizationId);
      alert('✅ Admin project creation enabled!');
    } catch (error) {
      alert(`❌ Error:\n${error.message}`);
    }
  };

  panel.querySelector('#disable-admin-projects-btn').onclick = async () => {
    try {
      await disableAdminProjectCreation(organizationId);
      alert('❌ Admin project creation disabled!');
    } catch (error) {
      alert(`❌ Error:\n${error.message}`);
    }
  };

  panel.querySelector('#auto-fix-btn').onclick = async () => {
    try {
      const result = await autoFixAdminProjectCreation(organizationId);
      alert(`🔧 Auto-fix Result:\n${JSON.stringify(result, null, 2)}`);
    } catch (error) {
      alert(`❌ Auto-fix Error:\n${error.message}`);
    }
  };

  panel.querySelector('#close-debug-btn').onclick = () => {
    panel.remove();
  };

  document.body.appendChild(panel);
};

export default {
  getOrganizationSettings,
  updateOrganizationSettings,
  enableAdminProjectCreation,
  disableAdminProjectCreation,
  isAdminProjectCreationEnabled,
  debugProjectCreationPermissions,
  autoFixAdminProjectCreation,
  showOrganizationSettingsDebug,
};
