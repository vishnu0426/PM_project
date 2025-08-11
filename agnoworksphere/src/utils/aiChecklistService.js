/**
 * AI-powered checklist generation service
 * Analyzes task content and generates intelligent checklist items
 */

// Task type patterns and their associated checklist templates
const TASK_TYPE_PATTERNS = {
  development: {
    keywords: ['develop', 'code', 'implement', 'build', 'create', 'api', 'frontend', 'backend', 'database', 'feature'],
    templates: [
      'Review requirements and acceptance criteria',
      'Set up development environment',
      'Create technical design document',
      'Implement core functionality',
      'Write unit tests',
      'Perform code review',
      'Test functionality manually',
      'Update documentation'
    ]
  },
  api_integration: {
    keywords: ['api', 'integration', 'endpoint', 'rest', 'graphql', 'webhook', 'service', 'third-party'],
    templates: [
      'Review API documentation and requirements',
      'Set up authentication and API keys',
      'Create API client/service layer',
      'Implement API endpoints integration',
      'Add error handling and retry logic',
      'Write integration tests',
      'Test with real API responses',
      'Document API usage and examples'
    ]
  },
  design: {
    keywords: ['design', 'ui', 'ux', 'mockup', 'wireframe', 'prototype', 'visual', 'interface', 'layout'],
    templates: [
      'Research user requirements',
      'Create initial wireframes',
      'Design visual mockups',
      'Review with stakeholders',
      'Iterate based on feedback',
      'Create design specifications',
      'Prepare assets for development',
      'Conduct usability testing'
    ]
  },
  testing: {
    keywords: ['test', 'qa', 'quality', 'bug', 'verify', 'validate', 'check'],
    templates: [
      'Review test requirements',
      'Create test plan',
      'Set up test environment',
      'Execute test cases',
      'Document test results',
      'Report bugs and issues',
      'Verify bug fixes',
      'Sign off on testing'
    ]
  },
  research: {
    keywords: ['research', 'analyze', 'investigate', 'study', 'explore', 'evaluate'],
    templates: [
      'Define research objectives',
      'Identify information sources',
      'Gather relevant data',
      'Analyze findings',
      'Document insights',
      'Present recommendations',
      'Review with team',
      'Plan next steps'
    ]
  },
  deployment: {
    keywords: ['deploy', 'release', 'launch', 'production', 'staging', 'environment'],
    templates: [
      'Prepare deployment checklist',
      'Review code changes',
      'Run pre-deployment tests',
      'Deploy to staging environment',
      'Verify staging deployment',
      'Deploy to production',
      'Monitor system health',
      'Document deployment notes'
    ]
  },
  meeting: {
    keywords: ['meeting', 'discussion', 'review', 'planning', 'standup', 'retrospective'],
    templates: [
      'Prepare meeting agenda',
      'Send calendar invites',
      'Gather required materials',
      'Facilitate discussion',
      'Take meeting notes',
      'Assign action items',
      'Send meeting summary',
      'Follow up on action items'
    ]
  }
};

// Priority-based checklist additions
const PRIORITY_ADDITIONS = {
  high: [
    'Notify stakeholders of high priority',
    'Set up monitoring and alerts',
    'Prepare rollback plan'
  ],
  medium: [
    'Review with team lead',
    'Update project timeline'
  ],
  low: [
    'Document lessons learned'
  ]
};

// Project context-based additions
const PROJECT_CONTEXT_ADDITIONS = {
  'e-commerce': [
    'Test payment integration',
    'Verify security compliance',
    'Check mobile responsiveness'
  ],
  'mobile': [
    'Test on multiple devices',
    'Verify app store guidelines',
    'Check performance metrics'
  ],
  'api': [
    'Update API documentation',
    'Test rate limiting',
    'Verify authentication'
  ]
};

/**
 * Detect task type based on title and description
 * @param {string} title - Task title
 * @param {string} description - Task description
 * @returns {string} Detected task type
 */
const detectTaskType = (title, description) => {
  const content = `${title} ${description}`.toLowerCase();
  
  let bestMatch = 'development';
  let maxScore = 0;
  
  Object.entries(TASK_TYPE_PATTERNS).forEach(([type, pattern]) => {
    const score = pattern.keywords.reduce((acc, keyword) => {
      return acc + (content.includes(keyword) ? 1 : 0);
    }, 0);
    
    if (score > maxScore) {
      maxScore = score;
      bestMatch = type;
    }
  });
  
  return bestMatch;
};

/**
 * Generate contextual checklist items based on task content
 * @param {string} title - Task title
 * @param {string} description - Task description
 * @param {string} priority - Task priority (low, medium, high)
 * @param {string} projectType - Project type context
 * @returns {array} Generated checklist items
 */
export const generateAIChecklist = async (title, description = '', priority = 'medium', projectType = null) => {
  try {
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const taskType = detectTaskType(title, description);
    const baseTemplate = TASK_TYPE_PATTERNS[taskType]?.templates || TASK_TYPE_PATTERNS.development.templates;
    
    // Start with base template items
    let checklistItems = [...baseTemplate];
    
    // Add priority-specific items
    if (PRIORITY_ADDITIONS[priority]) {
      checklistItems = [...checklistItems, ...PRIORITY_ADDITIONS[priority]];
    }
    
    // Add project context items
    if (projectType && PROJECT_CONTEXT_ADDITIONS[projectType]) {
      checklistItems = [...checklistItems, ...PROJECT_CONTEXT_ADDITIONS[projectType]];
    }
    
    // Customize items based on task content
    checklistItems = customizeChecklistItems(checklistItems, title, description);
    
    // Limit to 3-8 items and add metadata
    const finalItems = checklistItems.slice(0, 8).map((item, index) => ({
      id: `ai-${Date.now()}-${index}`,
      text: item,
      completed: false,
      createdAt: new Date().toISOString(),
      aiGenerated: true,
      confidence: calculateConfidence(item, title, description)
    }));
    
    return {
      success: true,
      items: finalItems,
      metadata: {
        taskType,
        confidence: calculateOverallConfidence(finalItems),
        generatedAt: new Date().toISOString(),
        itemCount: finalItems.length
      }
    };
    
  } catch (error) {
    console.error('AI checklist generation failed:', error);
    return {
      success: false,
      error: error.message,
      items: []
    };
  }
};

/**
 * Customize checklist items based on specific task content
 * @param {array} items - Base checklist items
 * @param {string} title - Task title
 * @param {string} description - Task description
 * @returns {array} Customized checklist items
 */
const customizeChecklistItems = (items, title, description) => {
  const content = `${title} ${description}`.toLowerCase();
  
  return items.map(item => {
    // Replace generic terms with specific ones from task content
    let customizedItem = item;
    
    // API-specific customizations
    if (content.includes('api')) {
      customizedItem = customizedItem.replace('functionality', 'API endpoints');
      customizedItem = customizedItem.replace('feature', 'API feature');
      customizedItem = customizedItem.replace('core functionality', 'API integration logic');
      customizedItem = customizedItem.replace('technical design document', 'API integration design and data flow');
      customizedItem = customizedItem.replace('unit tests', 'API integration tests');
    }

    // Integration-specific customizations
    if (content.includes('integration')) {
      customizedItem = customizedItem.replace('functionality', 'integration points');
      customizedItem = customizedItem.replace('Test functionality manually', 'Test integration with external services');
      customizedItem = customizedItem.replace('Update documentation', 'Document integration setup and usage');
    }
    
    // UI-specific customizations
    if (content.includes('ui') || content.includes('interface')) {
      customizedItem = customizedItem.replace('functionality', 'UI components');
      customizedItem = customizedItem.replace('feature', 'UI feature');
    }
    
    // Database-specific customizations
    if (content.includes('database') || content.includes('db')) {
      customizedItem = customizedItem.replace('functionality', 'database operations');
      customizedItem = customizedItem.replace('feature', 'database feature');
    }
    
    return customizedItem;
  });
};

/**
 * Calculate confidence score for a checklist item
 * @param {string} item - Checklist item text
 * @param {string} title - Task title
 * @param {string} description - Task description
 * @returns {number} Confidence score (0-100)
 */
const calculateConfidence = (item, title, description) => {
  const content = `${title} ${description}`.toLowerCase();
  const itemWords = item.toLowerCase().split(' ');
  
  // Base confidence
  let confidence = 70;
  
  // Increase confidence if item words appear in task content
  const matchingWords = itemWords.filter(word => 
    word.length > 3 && content.includes(word)
  );
  
  confidence += (matchingWords.length / itemWords.length) * 20;
  
  // Cap at 95% to indicate AI uncertainty
  return Math.min(95, Math.round(confidence));
};

/**
 * Calculate overall confidence for the generated checklist
 * @param {array} items - Generated checklist items
 * @returns {number} Overall confidence score
 */
const calculateOverallConfidence = (items) => {
  if (items.length === 0) return 0;
  
  const avgConfidence = items.reduce((sum, item) => sum + item.confidence, 0) / items.length;
  return Math.round(avgConfidence);
};

/**
 * Get suggested checklist items for manual addition
 * @param {string} taskType - Detected task type
 * @returns {array} Suggested items for manual addition
 */
export const getSuggestedItems = (taskType = 'development') => {
  const suggestions = {
    development: [
      'Set up CI/CD pipeline',
      'Perform security review',
      'Optimize performance',
      'Add error handling'
    ],
    design: [
      'Create style guide',
      'Test accessibility',
      'Optimize for mobile',
      'Validate with users'
    ],
    testing: [
      'Automate test cases',
      'Test edge cases',
      'Performance testing',
      'Security testing'
    ]
  };
  
  return suggestions[taskType] || suggestions.development;
};

export default {
  generateAIChecklist,
  getSuggestedItems,
  detectTaskType: (title, description) => detectTaskType(title, description)
};
