/**
 * Comprehensive error handling utilities for role-based permissions and AI features
 */

// Error types for better categorization
export const ERROR_TYPES = {
  PERMISSION_DENIED: 'PERMISSION_DENIED',
  INVALID_ASSIGNMENT: 'INVALID_ASSIGNMENT',
  AI_GENERATION_FAILED: 'AI_GENERATION_FAILED',
  NETWORK_ERROR: 'NETWORK_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR'
};

// User-friendly error messages
const ERROR_MESSAGES = {
  [ERROR_TYPES.PERMISSION_DENIED]: {
    title: 'Permission Denied',
    message: 'You do not have permission to perform this action.',
    action: 'Contact your administrator for access.'
  },
  [ERROR_TYPES.INVALID_ASSIGNMENT]: {
    title: 'Invalid Assignment',
    message: 'You cannot assign this task to the selected user.',
    action: 'Check your role permissions and try again.'
  },
  [ERROR_TYPES.AI_GENERATION_FAILED]: {
    title: 'AI Generation Failed',
    message: 'Unable to generate AI suggestions at this time.',
    action: 'Please try again or create items manually.'
  },
  [ERROR_TYPES.NETWORK_ERROR]: {
    title: 'Network Error',
    message: 'Unable to connect to the server.',
    action: 'Check your internet connection and try again.'
  },
  [ERROR_TYPES.VALIDATION_ERROR]: {
    title: 'Validation Error',
    message: 'Please check your input and try again.',
    action: 'Ensure all required fields are filled correctly.'
  },
  [ERROR_TYPES.UNKNOWN_ERROR]: {
    title: 'Unexpected Error',
    message: 'An unexpected error occurred.',
    action: 'Please try again or contact support if the problem persists.'
  }
};

/**
 * Create a standardized error object
 * @param {string} type - Error type from ERROR_TYPES
 * @param {string} customMessage - Custom error message (optional)
 * @param {object} details - Additional error details (optional)
 * @returns {object} Standardized error object
 */
export const createError = (type, customMessage = null, details = {}) => {
  const errorConfig = ERROR_MESSAGES[type] || ERROR_MESSAGES[ERROR_TYPES.UNKNOWN_ERROR];
  
  return {
    type,
    title: errorConfig.title,
    message: customMessage || errorConfig.message,
    action: errorConfig.action,
    details,
    timestamp: new Date().toISOString()
  };
};

/**
 * Handle task assignment errors
 * @param {string} userRole - Current user's role
 * @param {string} targetUserId - Target user ID for assignment
 * @param {string} currentUserId - Current user ID
 * @returns {object|null} Error object if assignment is invalid, null if valid
 */
export const validateTaskAssignment = (userRole, targetUserId, currentUserId) => {
  const role = userRole?.toLowerCase();
  
  // Viewers cannot assign tasks to others
  if (role === 'viewer' && targetUserId !== currentUserId) {
    return createError(
      ERROR_TYPES.INVALID_ASSIGNMENT,
      'Viewers can only assign tasks to themselves.',
      { userRole, targetUserId, currentUserId }
    );
  }
  
  // Members cannot assign tasks to others
  if (role === 'member' && targetUserId !== currentUserId) {
    return createError(
      ERROR_TYPES.INVALID_ASSIGNMENT,
      'Members can only assign tasks to themselves.',
      { userRole, targetUserId, currentUserId }
    );
  }
  
  return null; // Assignment is valid
};

/**
 * Handle AI generation errors
 * @param {Error} error - Original error object
 * @param {string} context - Context where error occurred (e.g., 'checklist', 'suggestion')
 * @returns {object} Standardized error object
 */
export const handleAIError = (error, context = 'AI generation') => {
  console.error(`AI Error in ${context}:`, error);
  
  if (error.name === 'NetworkError' || error.message.includes('fetch')) {
    return createError(
      ERROR_TYPES.NETWORK_ERROR,
      'Unable to connect to AI service.',
      { context, originalError: error.message }
    );
  }
  
  if (error.message.includes('timeout')) {
    return createError(
      ERROR_TYPES.AI_GENERATION_FAILED,
      'AI generation timed out. Please try again.',
      { context, originalError: error.message }
    );
  }
  
  return createError(
    ERROR_TYPES.AI_GENERATION_FAILED,
    `Failed to generate AI ${context}. Please try again.`,
    { context, originalError: error.message }
  );
};

/**
 * Handle permission errors
 * @param {string} action - Action that was attempted
 * @param {string} userRole - Current user's role
 * @param {string} requiredRole - Required role for the action
 * @returns {object} Standardized error object
 */
export const handlePermissionError = (action, userRole, requiredRole) => {
  return createError(
    ERROR_TYPES.PERMISSION_DENIED,
    `You need ${requiredRole} role or higher to ${action}. Your current role is ${userRole}.`,
    { action, userRole, requiredRole }
  );
};

/**
 * Display error to user (can be customized based on UI framework)
 * @param {object} error - Standardized error object
 * @param {function} displayFunction - Function to display the error (optional)
 */
export const displayError = (error, displayFunction = null) => {
  if (displayFunction) {
    displayFunction(error);
    return;
  }
  
  // Default browser alert (can be replaced with toast notifications, modals, etc.)
  const message = `${error.title}\n\n${error.message}\n\n${error.action}`;
  alert(message);
};

/**
 * Log error for debugging and monitoring
 * @param {object} error - Standardized error object
 * @param {object} context - Additional context for logging
 */
export const logError = (error, context = {}) => {
  const logData = {
    ...error,
    context,
    userAgent: navigator.userAgent,
    url: window.location.href
  };
  
  console.error('Application Error:', logData);
  
  // In a real application, you might send this to a logging service
  // sendToLoggingService(logData);
};

/**
 * Comprehensive error handler that combines validation, logging, and display
 * @param {Error|object} error - Error to handle
 * @param {string} context - Context where error occurred
 * @param {object} options - Additional options
 * @returns {object} Standardized error object
 */
export const handleError = (error, context = 'Unknown', options = {}) => {
  let standardizedError;
  
  if (error.type && ERROR_MESSAGES[error.type]) {
    // Already a standardized error
    standardizedError = error;
  } else if (error instanceof Error) {
    // Convert JavaScript Error to standardized error
    standardizedError = createError(
      ERROR_TYPES.UNKNOWN_ERROR,
      error.message,
      { context, stack: error.stack }
    );
  } else {
    // Handle other error formats
    standardizedError = createError(
      ERROR_TYPES.UNKNOWN_ERROR,
      typeof error === 'string' ? error : 'An unknown error occurred',
      { context, originalError: error }
    );
  }
  
  // Log the error
  logError(standardizedError, { context, ...options });
  
  // Display to user if requested
  if (options.display !== false) {
    displayError(standardizedError, options.displayFunction);
  }
  
  return standardizedError;
};

/**
 * Retry mechanism for failed operations
 * @param {function} operation - Function to retry
 * @param {number} maxRetries - Maximum number of retries
 * @param {number} delay - Delay between retries in milliseconds
 * @returns {Promise} Promise that resolves with operation result or rejects with error
 */
export const retryOperation = async (operation, maxRetries = 3, delay = 1000) => {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      
      if (attempt === maxRetries) {
        throw handleError(error, `Retry operation failed after ${maxRetries} attempts`);
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay * attempt));
    }
  }
  
  throw lastError;
};

export default {
  ERROR_TYPES,
  createError,
  validateTaskAssignment,
  handleAIError,
  handlePermissionError,
  displayError,
  logError,
  handleError,
  retryOperation
};
