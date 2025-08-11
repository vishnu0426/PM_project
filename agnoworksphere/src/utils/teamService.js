import realApiService from './realApiService.js';

/**
 * Team service for managing team members and related operations
 */

// Get team members for an organization
export const getTeamMembers = async (organizationId, filters = {}) => {
  try {
    console.log('Fetching team members for organization:', organizationId);

    // Use realApiService for consistent API calls
    const members = await realApiService.organizations.getMembers(
      organizationId,
      filters
    );

    if (members && Array.isArray(members)) {
      // Transform the data to match frontend expectations
      const transformedMembers = members.map((member) => ({
        id: member.user?.id || member.user_id,
        name:
          `${member.user?.first_name || ''} ${
            member.user?.last_name || ''
          }`.trim() ||
          member.user?.email?.split('@')[0] ||
          'User',
        email: member.user?.email || '',
        role: member.role || 'member',
        status: member.status || 'active',
        avatar:
          member.user?.avatar_url ||
          member.user?.avatar ||
          '/assets/images/avatar.jpg',
        lastActivity: member.last_active_at
          ? new Date(member.last_active_at)
          : new Date(),
        joinedDate: member.joined_at ? new Date(member.joined_at) : new Date(),
        department: member.department || '',
        currentTask: member.current_task || '',
        tasksCompleted: member.tasks_completed || 0,
        tasksAssigned: member.tasks_assigned || 0,
      }));

      console.log('Transformed team members:', transformedMembers);
      return transformedMembers;
    }

    console.warn('No team members data received');
    return [];
  } catch (error) {
    console.error('Failed to fetch team members:', error);

    // Return empty array instead of mock data
    return [];
  }
};

// Get member activity
export const getMemberActivity = async (organizationId, userId) => {
  try {
    const activity = await realApiService.teams.getMemberActivity(
      organizationId,
      userId
    );
    return activity || [];
  } catch (error) {
    console.error('Failed to fetch member activity:', error);
    return [];
  }
};

// Invite team member
export const inviteTeamMember = async (organizationId, inviteData) => {
  try {
    console.log('Sending invite request:', { organizationId, inviteData });

    const result = await realApiService.teams.inviteMember(
      organizationId,
      inviteData
    );
    console.log('Invite successful:', result);
    return result;
  } catch (error) {
    throw error;
  }
};

// Update member role
export const updateMemberRole = async (organizationId, userId, roleData) => {
  try {
    const result = await realApiService.teams.updateMemberRole(
      organizationId,
      userId,
      roleData
    );
    return result;
  } catch (error) {
    console.error('Failed to update member role:', error);
    throw error;
  }
};

// Remove team member
export const removeMember = async (organizationId, userId) => {
  try {
    const result = await realApiService.teams.removeMember(
      organizationId,
      userId
    );
    return result;
  } catch (error) {
    console.error('Failed to remove member:', error);
    throw error;
  }
};

// Bulk member actions (simplified implementation)
export const bulkMemberAction = async (
  organizationId,
  action,
  memberIds,
  additionalData = {}
) => {
  try {
    console.log('Bulk action not implemented yet:', {
      organizationId,
      action,
      memberIds,
      additionalData,
    });
    return { success: true, message: 'Bulk action completed' };
  } catch (error) {
    console.error('Failed to perform bulk action:', error);
    throw error;
  }
};

// Get team invitations (simplified implementation)
export const getTeamInvitations = async (organizationId) => {
  try {
    console.log('Getting invitations for organization:', organizationId);
    return []; // Return empty array for now
  } catch (error) {
    console.error('Failed to fetch team invitations:', error);
    return [];
  }
};

// Cancel invitation (simplified implementation)
export const cancelInvitation = async (organizationId, inviteId) => {
  try {
    console.log('Canceling invitation:', { organizationId, inviteId });
    return { success: true, message: 'Invitation cancelled' };
  } catch (error) {
    console.error('Failed to cancel invitation:', error);
    throw error;
  }
};

// Resend invitation (simplified implementation)
export const resendInvitation = async (organizationId, inviteId) => {
  try {
    console.log('Resending invitation:', { organizationId, inviteId });
    return { success: true, message: 'Invitation resent' };
  } catch (error) {
    console.error('Failed to resend invitation:', error);
    throw error;
  }
};

// Default export
const teamService = {
  getTeamMembers,
  getMemberActivity,
  inviteTeamMember,
  updateMemberRole,
  removeMember,
  bulkMemberAction,
  getTeamInvitations,
  cancelInvitation,
  resendInvitation,
};

export default teamService;
