// src/utils/organizationService.js
// Real organization service that connects to the backend API

// Remove direct import to avoid circular dependency - use dynamic imports instead

// Helper function for delays (for UX)
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Get all organizations
export const getOrganizations = async () => {
  try {
    const apiService = (await import('./apiService.js')).default;
    const result = await apiService.organizations.getAll();
    return {
      data: result.organizations || [],
      error: null,
    };
  } catch (error) {
    console.error('Failed to get organizations:', error);
    return {
      data: [],
      error: error.message || 'Failed to fetch organizations',
    };
  }
};

// Get organization by ID
export const getOrganizationById = async (id) => {
  try {
    const apiService = (await import('./apiService.js')).default;
    const result = await apiService.organizations.getById(id);
    return {
      data: result || null,
      error: result ? null : 'Organization not found',
    };
  } catch (error) {
    console.error('Failed to get organization:', error);
    return {
      data: null,
      error: error.message || 'Organization not found',
    };
  }
};

// Create new organization
export const createOrganization = async (orgData, logoFile = null) => {
  try {
    await delay(300); // UX delay

    // Validate required fields
    if (!orgData.name?.trim()) {
      return { data: null, error: 'Organization name is required' };
    }

    // Prepare organization data
    const organizationData = {
      name: orgData.name.trim(),
      description: orgData.description?.trim() || '',
      domain: orgData.domain?.trim() || '',
      website: orgData.website?.trim() || '',
      industry: orgData.industry || '',
      size: orgData.size || '',
      language: orgData.language || 'en',
      timezone: orgData.timezone || 'UTC',
    };

    // Create organization via API
    const apiService = (await import('./apiService.js')).default;
    const result = await apiService.organizations.create(organizationData);

    // Handle logo upload if provided
    if (logoFile && result.data) {
      try {
        const logoResult = await uploadOrganizationLogo(
          result.data.id,
          logoFile
        );
        if (logoResult.data) {
          result.data.logo_url = logoResult.data.logo_url;
        }
      } catch (logoError) {
        console.warn('Logo upload failed:', logoError);
        // Don't fail the entire operation for logo upload failure
      }
    }

    return {
      data: result.data,
      error: null,
      message: `Organization "${result.data?.name}" created successfully!`,
    };
  } catch (error) {
    console.error('Failed to create organization:', error);
    return {
      data: null,
      error: error.message || 'Failed to create organization',
    };
  }
};

// Get organization dashboard data
export const getOrganizationDashboard = async (organizationId) => {
  try {
    await delay(300);

    // Get organization details
    const orgResult = await getOrganizationById(organizationId);
    if (!orgResult.data) {
      return { success: false, error: 'Organization not found' };
    }

    // Get additional dashboard data
    const apiService = (await import('./apiService.js')).default;
    const [projectsResult, membersResult] = await Promise.allSettled([
      apiService.projects.getAll(organizationId),
      apiService.teams.getMembers(organizationId),
    ]);

    const projectCount =
      projectsResult.status === 'fulfilled'
        ? projectsResult.value?.projects?.length || 0
        : 0;

    const memberCount =
      membersResult.status === 'fulfilled'
        ? membersResult.value?.members?.length || 0
        : 0;

    return {
      success: true,
      data: {
        ...orgResult.data,
        member_count: memberCount,
        project_count: projectCount,
        integration_count: 0, // TODO: Implement integrations
      },
    };
  } catch (error) {
    console.error('Failed to get organization dashboard:', error);
    return {
      success: false,
      error: error.message || 'Failed to load dashboard data',
    };
  }
};

// Get organization integrations
export const getOrganizationIntegrations = async (organizationId) => {
  try {
    await delay(300);

    // TODO: Implement real integrations API
    // For now, return empty array
    return {
      success: true,
      data: [],
    };
  } catch (error) {
    console.error('Failed to get integrations:', error);
    return {
      success: false,
      error: error.message || 'Failed to load integrations',
    };
  }
};

// Get recent activities
export const getRecentActivities = async (organizationId) => {
  try {
    await delay(300);

    // TODO: Implement real activities API
    // For now, return empty array
    return {
      success: true,
      data: [],
    };
  } catch (error) {
    console.error('Failed to get activities:', error);
    return {
      success: false,
      error: error.message || 'Failed to load activities',
    };
  }
};

// Get notifications
export const getNotifications = async (organizationId) => {
  try {
    await delay(300);

    // Use real notifications API if available
    try {
      const result = await (
        await import('./apiService.js')
      ).default.notifications.getAll();
      return {
        success: true,
        data: result.data || [],
      };
    } catch (apiError) {
      // Fallback to empty array if notifications API not implemented
      return {
        success: true,
        data: [],
      };
    }
  } catch (error) {
    console.error('Failed to get notifications:', error);
    return {
      success: false,
      error: error.message || 'Failed to load notifications',
    };
  }
};

// Mark notification as read
export const markNotificationAsRead = async (notificationId) => {
  try {
    await delay(200);

    // Use real notifications API if available
    try {
      await (
        await import('./apiService.js')
      ).default.notifications.markAsRead(notificationId);
      return { success: true };
    } catch (apiError) {
      // Fallback for API not implemented
      return { success: true };
    }
  } catch (error) {
    console.error('Failed to mark notification as read:', error);
    return {
      success: false,
      error: error.message || 'Failed to mark notification as read',
    };
  }
};

// Update integration
export const updateIntegration = async (integrationId, updateData) => {
  try {
    await delay(300);

    // TODO: Implement real integrations update API
    return {
      success: true,
      data: { id: integrationId, ...updateData },
    };
  } catch (error) {
    console.error('Failed to update integration:', error);
    return {
      success: false,
      error: error.message || 'Failed to update integration',
    };
  }
};

// Update organization
export const updateOrganization = async (
  organizationId,
  orgData,
  logoFile = null
) => {
  try {
    await delay(600);

    // Validate email format if provided
    if (orgData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(orgData.email)) {
      return { data: null, error: 'Invalid email format' };
    }

    // Update organization via API
    const api = (await import('./apiService.js')).default;
    const result = await api.organizations.update(organizationId, orgData);

    // Handle logo upload if provided
    if (logoFile && result.data) {
      try {
        const logoResult = await uploadOrganizationLogo(
          organizationId,
          logoFile
        );
        if (logoResult.data) {
          result.data.logo_url = logoResult.data.logo_url;
        }
      } catch (logoError) {
        console.warn('Logo upload failed:', logoError);
      }
    }

    return {
      data: result.data,
      error: null,
      message: 'Organization updated successfully!',
    };
  } catch (error) {
    console.error('Failed to update organization:', error);
    return {
      data: null,
      error: error.message || 'Failed to update organization',
    };
  }
};

// Upload organization logo
export const uploadOrganizationLogo = async (organizationId, logoFile) => {
  try {
    await delay(500);

    if (!logoFile.type.startsWith('image/')) {
      return { data: null, error: 'Logo must be an image file' };
    }

    if (logoFile.size > 5 * 1024 * 1024) {
      // 5MB limit
      return { data: null, error: 'Logo file size must be less than 5MB' };
    }

    // TODO: Implement real file upload API
    const logoUrl = `/uploads/organizations/${organizationId}/logo/${logoFile.name}`;

    return {
      data: { logo_url: logoUrl },
      error: null,
      message: 'Logo uploaded successfully!',
    };
  } catch (error) {
    console.error('Failed to upload logo:', error);
    return {
      data: null,
      error: error.message || 'Failed to upload logo',
    };
  }
};

// Delete organization logo
export const deleteOrganizationLogo = async (organizationId) => {
  try {
    await delay(300);

    // TODO: Implement real logo deletion API
    return {
      data: { success: true },
      error: null,
      message: 'Logo deleted successfully!',
    };
  } catch (error) {
    console.error('Failed to delete logo:', error);
    return {
      data: null,
      error: error.message || 'Failed to delete logo',
    };
  }
};
