/**
 * Role-based permission system for task assignments and other features
 */

// Role hierarchy and permissions
const ROLE_HIERARCHY = {
  viewer: 0,
  member: 1,
  admin: 2,
  owner: 3
};

const ROLE_PERMISSIONS = {
  viewer: {
    canAssignTasksToSelf: true,
    canAssignTasksToOthers: false,
    canCreateTasks: false,
    canEditOwnTasks: false,
    canEditOtherTasks: false,
    canDeleteTasks: false,
    canManageProjects: false,
    canInviteMembers: false,
    canManageMembers: false,
    assignmentScope: 'self'
  },
  member: {
    canAssignTasksToSelf: true,
    canAssignTasksToOthers: false,
    canCreateTasks: true,
    canEditOwnTasks: true,
    canEditOtherTasks: false,
    canDeleteTasks: false,
    canManageProjects: false,
    canInviteMembers: false,
    canManageMembers: false,
    assignmentScope: 'self'
  },
  admin: {
    canAssignTasksToSelf: true,
    canAssignTasksToOthers: true,
    canCreateTasks: true,
    canEditOwnTasks: true,
    canEditOtherTasks: true,
    canDeleteTasks: true,
    canManageProjects: true,
    canInviteMembers: true,
    canManageMembers: true,
    assignmentScope: 'project'
  },
  owner: {
    canAssignTasksToSelf: true,
    canAssignTasksToOthers: true,
    canCreateTasks: true,
    canEditOwnTasks: true,
    canEditOtherTasks: true,
    canDeleteTasks: true,
    canManageProjects: true,
    canInviteMembers: true,
    canManageMembers: true,
    assignmentScope: 'organization'
  }
};

/**
 * Get permissions for a specific role
 * @param {string} role - User role (viewer, member, admin, owner)
 * @returns {object} Role permissions object
 */
export const getRolePermissions = (role) => {
  const normalizedRole = role?.toLowerCase() || 'member';
  return ROLE_PERMISSIONS[normalizedRole] || ROLE_PERMISSIONS.member;
};

/**
 * Check if user can assign tasks to other members
 * @param {string} userRole - Current user's role
 * @param {string} currentUserId - Current user's ID
 * @param {string} targetUserId - Target user's ID for assignment
 * @param {object} projectContext - Project context (optional)
 * @returns {boolean} Whether assignment is allowed
 */
export const canAssignTaskToUser = (userRole, currentUserId, targetUserId, projectContext = null) => {
  const permissions = getRolePermissions(userRole);
  
  // Self-assignment is always allowed for all roles
  if (currentUserId === targetUserId) {
    return permissions.canAssignTasksToSelf;
  }
  
  // Check if user can assign to others
  if (!permissions.canAssignTasksToOthers) {
    return false;
  }
  
  // Role-specific assignment scope checks
  switch (permissions.assignmentScope) {
    case 'self':
      return currentUserId === targetUserId;
    
    case 'project':
      // Admin can assign within project scope
      // For now, we'll allow assignment to any member in the same organization
      // In a real implementation, this would check project membership
      return true;
    
    case 'organization':
      // Owner can assign to anyone in the organization
      return true;
    
    default:
      return false;
  }
};

/**
 * Filter assignable members based on user role and permissions
 * @param {array} allMembers - All available members
 * @param {string} userRole - Current user's role
 * @param {string} currentUserId - Current user's ID
 * @param {object} projectContext - Project context (optional)
 * @returns {array} Filtered list of assignable members
 */
export const getAssignableMembers = (allMembers, userRole, currentUserId, projectContext = null) => {
  const permissions = getRolePermissions(userRole);
  
  return allMembers.filter(member => {
    return canAssignTaskToUser(userRole, currentUserId, member.id, projectContext);
  });
};

/**
 * Get assignment restriction message for UI display
 * @param {string} userRole - Current user's role
 * @returns {string} User-friendly message explaining assignment restrictions
 */
export const getAssignmentRestrictionMessage = (userRole) => {
  const permissions = getRolePermissions(userRole);
  
  switch (permissions.assignmentScope) {
    case 'self':
      return userRole === 'viewer' 
        ? "Viewers can only assign tasks to themselves"
        : "Members can only assign tasks to themselves";
    
    case 'project':
      return "Admins can assign tasks to project team members";
    
    case 'organization':
      return "Owners can assign tasks to any organization member";
    
    default:
      return "Task assignment not available for your role";
  }
};

/**
 * Check if user can receive task assignments
 * @param {string} userRole - User's role
 * @returns {boolean} Whether user can receive task assignments
 */
export const canReceiveTaskAssignments = (userRole) => {
  // All roles can receive task assignments, but with different restrictions
  return ['member', 'admin', 'owner'].includes(userRole?.toLowerCase());
};

/**
 * Get role hierarchy level
 * @param {string} role - User role
 * @returns {number} Hierarchy level (higher number = more permissions)
 */
export const getRoleLevel = (role) => {
  return ROLE_HIERARCHY[role?.toLowerCase()] || 0;
};

/**
 * Check if user has higher or equal role than required
 * @param {string} userRole - Current user's role
 * @param {string} requiredRole - Required minimum role
 * @returns {boolean} Whether user meets role requirement
 */
export const hasMinimumRole = (userRole, requiredRole) => {
  return getRoleLevel(userRole) >= getRoleLevel(requiredRole);
};

export default {
  getRolePermissions,
  canAssignTaskToUser,
  getAssignableMembers,
  getAssignmentRestrictionMessage,
  canReceiveTaskAssignments,
  getRoleLevel,
  hasMinimumRole
};
