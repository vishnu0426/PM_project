/**
 * Project Event Service
 * Manages real-time project updates across components
 */

/**
 * Dispatch project update event to notify all components
 * @param {string} organizationId - Organization ID
 * @param {Array} projects - Updated projects list (optional)
 * @param {Object} project - Single project that was updated (optional)
 * @param {string} action - Action performed ('created', 'updated', 'deleted')
 */
export const dispatchProjectUpdate = (organizationId, { projects = null, project = null, action = 'updated' } = {}) => {
  console.log('Dispatching project update event:', { organizationId, action, project });
  
  const event = new CustomEvent('projectsUpdated', {
    detail: {
      organizationId,
      projects,
      project,
      action,
      timestamp: Date.now()
    }
  });
  
  window.dispatchEvent(event);
};

/**
 * Dispatch project creation event
 * @param {string} organizationId - Organization ID
 * @param {Object} project - Created project
 */
export const dispatchProjectCreated = (organizationId, project) => {
  dispatchProjectUpdate(organizationId, { project, action: 'created' });
};

/**
 * Dispatch project update event
 * @param {string} organizationId - Organization ID
 * @param {Object} project - Updated project
 */
export const dispatchProjectUpdated = (organizationId, project) => {
  dispatchProjectUpdate(organizationId, { project, action: 'updated' });
};

/**
 * Dispatch project deletion event
 * @param {string} organizationId - Organization ID
 * @param {Object} project - Deleted project
 */
export const dispatchProjectDeleted = (organizationId, project) => {
  dispatchProjectUpdate(organizationId, { project, action: 'deleted' });
};

/**
 * Listen for project updates
 * @param {Function} callback - Callback function to handle updates
 * @returns {Function} Cleanup function to remove listener
 */
export const listenForProjectUpdates = (callback) => {
  const handleProjectUpdate = (event) => {
    callback(event.detail);
  };
  
  window.addEventListener('projectsUpdated', handleProjectUpdate);
  
  // Return cleanup function
  return () => {
    window.removeEventListener('projectsUpdated', handleProjectUpdate);
  };
};

/**
 * Refresh projects in all components for a specific organization
 * @param {string} organizationId - Organization ID
 */
export const refreshProjectsGlobally = (organizationId) => {
  dispatchProjectUpdate(organizationId, { action: 'refresh' });
};

export default {
  dispatchProjectUpdate,
  dispatchProjectCreated,
  dispatchProjectUpdated,
  dispatchProjectDeleted,
  listenForProjectUpdates,
  refreshProjectsGlobally
};
