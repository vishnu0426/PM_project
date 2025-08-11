/**
 * Debug utilities for checking user permissions
 */

import realApiService from './realApiService.js';
import sessionService from './sessionService.js';

export const debugUserPermissions = async (organizationId) => {
  try {
    const response = await fetch(
      `http://localhost:3001/api/v1/projects/debug/permissions?organization_id=${organizationId}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${sessionService.getSessionToken()}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    console.log('🔍 User Permissions Debug:', result);
    return result;
  } catch (error) {
    console.error('❌ Failed to debug permissions:', error);
    throw error;
  }
};

export const enableProjectCreationForMembers = async (organizationId) => {
  try {
    console.log('🔧 Enabling project creation for members...');

    const response = await fetch(
      `http://localhost:8000/api/v1/organizations-enhanced/${organizationId}/settings`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          allow_member_create_projects: true,
          allow_admin_create_projects: true,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `HTTP ${response.status}: ${errorData.detail || response.statusText}`
      );
    }

    const result = await response.json();
    console.log('✅ Project creation enabled for members:', result);
    return result;
  } catch (error) {
    console.error('❌ Failed to enable project creation:', error);
    throw error;
  }
};

export const checkAndFixProjectCreationPermissions = async (organizationId) => {
  try {
    console.log('🔍 Checking project creation permissions...');

    // First, debug current permissions
    const permissions = await debugUserPermissions(organizationId);

    if (permissions.can_create_projects) {
      console.log('✅ User already has project creation permissions');
      return permissions;
    }

    console.log('❌ User cannot create projects. Attempting to fix...');

    // If user is member or admin, try to enable project creation
    if (
      permissions.user_role === 'member' ||
      permissions.user_role === 'admin'
    ) {
      try {
        await enableProjectCreationForMembers(organizationId);
        console.log('✅ Project creation permissions updated');

        // Check permissions again
        const updatedPermissions = await debugUserPermissions(organizationId);
        return updatedPermissions;
      } catch (error) {
        console.error(
          '❌ Failed to update permissions (you might not be an owner):',
          error.message
        );
        return permissions;
      }
    } else {
      console.log(
        '❌ User role is not member or admin. Cannot auto-fix permissions.'
      );
      return permissions;
    }
  } catch (error) {
    console.error('❌ Failed to check/fix permissions:', error);
    throw error;
  }
};

// Helper function to add debug button to UI (for development)
export const addDebugButton = (organizationId) => {
  if (process.env.NODE_ENV !== 'development') {
    return;
  }

  // Remove existing debug button
  const existingButton = document.getElementById('debug-permissions-btn');
  if (existingButton) {
    existingButton.remove();
  }

  // Create debug button
  const button = document.createElement('button');
  button.id = 'debug-permissions-btn';
  button.innerHTML = '🔍 Debug Permissions';
  button.style.cssText = `
    position: fixed;
    top: 10px;
    right: 10px;
    z-index: 9999;
    background: #3b82f6;
    color: white;
    border: none;
    padding: 8px 12px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 12px;
  `;

  button.onclick = async () => {
    try {
      const result = await checkAndFixProjectCreationPermissions(
        organizationId
      );
      alert(`Debug Result:\n${JSON.stringify(result, null, 2)}`);
    } catch (error) {
      alert(`Debug Error:\n${error.message}`);
    }
  };

  document.body.appendChild(button);
};

export default {
  debugUserPermissions,
  enableProjectCreationForMembers,
  checkAndFixProjectCreationPermissions,
  addDebugButton,
};
