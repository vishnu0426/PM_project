// src/utils/apiService.js - Real Backend Integration

// Simulate API delay
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Helper function to get headers with authentication (not used in mock mode)
// const getAuthHeaders = (organizationId = null) => {
//   const token = localStorage.getItem('accessToken');
//   const headers = {
//     'Content-Type': 'application/json',
//     ...(organizationId && { 'X-Organization-ID': organizationId })
//   };

//   if (token) {
//     headers['Authorization'] = `Bearer ${token}`;
//   }

//   return headers;
// };

// Helper function to handle API responses (not used in mock mode)
// const handleResponse = async (response) => {
//   const result = await response.json();

//   if (!response.ok) {
//     throw new Error(result.error?.message || result.message || 'API request failed');
//   }

//   return result;
// };

const apiService = {
  // Auth (Real Backend Integration)
  auth: {
    register: async (registrationData) => {
      try {
        const realApiService = (await import('./realApiService.js')).default;
        return await realApiService.auth.register(registrationData);
      } catch (error) {
        console.error('Failed to register user:', error);
        throw error;
      }
    },
    login: async (email, password) => {
      try {
        const realApiService = (await import('./realApiService.js')).default;
        return await realApiService.auth.login(email, password);
      } catch (error) {
        console.error('Failed to login:', error);
        throw error;
      }
    },
    logout: async () => {
      try {
        const realApiService = (await import('./realApiService.js')).default;
        return await realApiService.auth.logout();
      } catch (error) {
        console.error('Failed to logout:', error);
        throw error;
      }
    },
  },
  // Organizations (Use organizationService.js instead)
  // organizations: {
  //   // Commented out - use organizationService.js for organization operations
  // },

  // All organization methods commented out - use organizationService.js instead

  // Projects (Real Backend Integration)
  projects: {
    getAll: async (organizationId) => {
      try {
        // Use real API service
        const realApiService = (await import('./realApiService.js')).default;
        const result = await realApiService.projects.getAll(organizationId);
        console.log('Projects loaded successfully:', result);
        return Array.isArray(result) ? result : result?.data || [];
      } catch (error) {
        console.error('Failed to fetch projects:', error);
        return []; // Return empty array instead of mock data
      }
    },

    create: async (organizationId, projectData) => {
      try {
        // Use real API service
        const realApiService = (await import('./realApiService.js')).default;
        const result = await realApiService.projects.create(
          organizationId,
          projectData
        );
        console.log('Project created successfully:', result);
        return result;
      } catch (error) {
        console.error('Failed to create project:', error);
        throw error; // Don't use mock fallback, let the error bubble up
      }
    },

    getById: async (id) => {
      try {
        // Use real API service
        const realApiService = (await import('./realApiService.js')).default;
        return await realApiService.projects.getById(id);
      } catch (error) {
        // Gracefully handle not-found without noisy error
        const msg = (error && error.message) || '';
        if (msg.includes('404') || /not\s*found/i.test(msg)) {
          console.warn('Project not found:', id);
          return null;
        }
        console.error('Failed to fetch project:', error);
        throw error; // Don't use mock fallback
      }
    },

    update: async (id, updateData) => {
      try {
        // Use real API service
        const realApiService = (await import('./realApiService.js')).default;
        return await realApiService.projects.update(id, updateData);
      } catch (error) {
        console.error('Failed to update project:', error);
        throw error; // Don't use mock fallback
      }
    },

    delete: async (id) => {
      try {
        // Use real API service
        const realApiService = (await import('./realApiService.js')).default;
        return await realApiService.projects.delete(id);
      } catch (error) {
        console.error('Failed to delete project:', error);
        throw error; // Don't use mock fallback
      }
    },
  },

  // Boards (Real Backend Integration)
  boards: {
    getByProject: async (projectId) => {
      try {
        // Use real API service
        const realApiService = (await import('./realApiService.js')).default;
        const result = await realApiService.boards.getByProject(projectId);
        console.log('Boards loaded successfully:', result);
        return result || [];
      } catch (error) {
        console.error('Failed to fetch boards:', error);
        throw error; // Don't use mock fallback
      }
    },

    getById: async (id) => {
      try {
        // Use real API service
        const realApiService = (await import('./realApiService.js')).default;
        return await realApiService.boards.getById(id);
      } catch (error) {
        console.error('Failed to fetch board:', error);
        throw error; // Don't use mock fallback
      }
    },

    create: async (projectId, boardData) => {
      try {
        // Use real API service
        const realApiService = (await import('./realApiService.js')).default;
        return await realApiService.boards.create(projectId, boardData);
      } catch (error) {
        console.error('Failed to create board:', error);
        throw error; // Don't use mock fallback
      }
    },

    update: async (id, updateData) => {
      try {
        // Use real API service
        const realApiService = (await import('./realApiService.js')).default;
        return await realApiService.boards.update(id, updateData);
      } catch (error) {
        console.error('Failed to update board:', error);
        throw error; // Don't use mock fallback
      }
    },

    delete: async (id) => {
      try {
        // Use real API service
        const realApiService = (await import('./realApiService.js')).default;
        return await realApiService.boards.delete(id);
      } catch (error) {
        console.error('Failed to delete board:', error);
        throw error; // Don't use mock fallback
      }
    },
  },

  // Columns (Real Backend Integration)
  columns: {
    getByBoard: async (boardId) => {
      try {
        // Use real API service
        const realApiService = (await import('./realApiService.js')).default;
        const result = await realApiService.columns.getByBoard(boardId);
        console.log('Columns loaded successfully:', result);
        return result || [];
      } catch (error) {
        console.error('Failed to fetch columns:', error);
        throw error; // Don't use mock fallback
      }
    },

    getById: async (id) => {
      try {
        // Use real API service
        const realApiService = (await import('./realApiService.js')).default;
        return await realApiService.columns.getById(id);
      } catch (error) {
        console.error('Failed to fetch column:', error);
        throw error; // Don't use mock fallback
      }
    },

    create: async (boardId, columnData) => {
      try {
        // Use real API service
        const realApiService = (await import('./realApiService.js')).default;
        return await realApiService.columns.create(boardId, columnData);
      } catch (error) {
        console.error('Failed to create column:', error);
        throw error; // Don't use mock fallback
      }
    },

    update: async (id, updateData) => {
      try {
        // Use real API service
        const realApiService = (await import('./realApiService.js')).default;
        return await realApiService.columns.update(id, updateData);
      } catch (error) {
        console.error('Failed to update column:', error);
        throw error; // Don't use mock fallback
      }
    },

    delete: async (id) => {
      try {
        // Use real API service
        const realApiService = (await import('./realApiService.js')).default;
        return await realApiService.columns.delete(id);
      } catch (error) {
        console.error('Failed to delete column:', error);
        throw error; // Don't use mock fallback
      }
    },
  },

  // Cards (Real Backend Integration)
  cards: {
    getAll: async (columnId = null) => {
      try {
        // Use real API service
        const realApiService = (await import('./realApiService.js')).default;
        const result = await realApiService.cards.getAll(columnId);
        console.log('Cards loaded successfully:', result);
        return result || [];
      } catch (error) {
        console.error('Failed to fetch cards:', error);
        throw error; // Don't use mock fallback
      }
    },

    getById: async (id) => {
      try {
        // Use real API service
        const realApiService = (await import('./realApiService.js')).default;
        return await realApiService.cards.getById(id);
      } catch (error) {
        console.error('Failed to fetch card:', error);
        throw error; // Don't use mock fallback
      }
    },

    create: async (columnId, cardData) => {
      try {
        // Use real API service
        const realApiService = (await import('./realApiService.js')).default;
        return await realApiService.cards.create(columnId, cardData);
      } catch (error) {
        console.error('Failed to create card:', error);
        throw error; // Don't use mock fallback
      }
    },

    update: async (id, updateData) => {
      try {
        // Use real API service
        const realApiService = (await import('./realApiService.js')).default;
        return await realApiService.cards.update(id, updateData);
      } catch (error) {
        console.error('Failed to update card:', error);
        throw error; // Don't use mock fallback
      }
    },

    delete: async (id) => {
      try {
        // Use real API service
        const realApiService = (await import('./realApiService.js')).default;
        return await realApiService.cards.delete(id);
      } catch (error) {
        console.error('Failed to delete card:', error);
        throw error; // Don't use mock fallback
      }
    },

    move: async (cardId, targetColumnId, position = null) => {
      try {
        // Use real API service
        const realApiService = (await import('./realApiService.js')).default;
        return await realApiService.cards.move(
          cardId,
          targetColumnId,
          position
        );
      } catch (error) {
        console.error('Failed to move card:', error);
        throw error; // Don't use mock fallback
      }
    },
  },

  // Users (Real Backend Integration)
  users: {
    getCurrentUser: async () => {
      try {
        const realApiService = (await import('./realApiService.js')).default;
        return await realApiService.users.getCurrentUser();
      } catch (error) {
        console.error('Failed to fetch current user:', error);
        throw error;
      }
    },

    getProfile: async () => {
      try {
        // Use real API service
        const realApiService = (await import('./realApiService.js')).default;
        return await realApiService.users.getCurrentUser();
      } catch (error) {
        console.error('Failed to fetch user profile:', error);
        throw error; // Don't use mock fallback
      }
    },

    updateProfile: async (updateData) => {
      try {
        // Use real API service
        const realApiService = (await import('./realApiService.js')).default;
        return await realApiService.users.updateProfile(updateData);
      } catch (error) {
        console.error('Failed to update user profile:', error);
        throw error; // Don't use mock fallback
      }
    },

    uploadAvatar: async (file) => {
      try {
        // Use real API service
        const realApiService = (await import('./realApiService.js')).default;
        return await realApiService.users.uploadAvatar(file);
      } catch (error) {
        console.error('Failed to upload avatar:', error);
        throw error; // Don't use mock fallback
      }
    },

    getDashboardStats: async () => {
      try {
        // Use real API service
        const realApiService = (await import('./realApiService.js')).default;
        const result = await realApiService.dashboard.getStats();
        return {
          data: result.data || result,
          error: result.error,
        };
      } catch (error) {
        console.error('Failed to get dashboard stats:', error);
        throw error; // Don't use mock fallback
      }
    },
  },

  // Teams (Real Backend Integration)
  projectSignoff: {
    requestSignoff: async (projectId, requestData) => {
      try {
        const realApiService = (await import('./realApiService.js')).default;
        return await realApiService.projectSignoff.requestSignoff(
          projectId,
          requestData
        );
      } catch (error) {
        console.error('Failed to request project signoff:', error);
        throw error;
      }
    },
    approveSignoff: async (projectId, approvalData) => {
      try {
        const realApiService = (await import('./realApiService.js')).default;
        return await realApiService.projectSignoff.approveSignoff(
          projectId,
          approvalData
        );
      } catch (error) {
        console.error('Failed to approve project signoff:', error);
        throw error;
      }
    },
    getSignoffStatus: async (projectId) => {
      try {
        const realApiService = (await import('./realApiService.js')).default;
        return await realApiService.projectSignoff.getSignoffStatus(projectId);
      } catch (error) {
        console.error('Failed to load project signoff status:', error);
        throw error;
      }
    },
    getPendingSignoffs: async () => {
      try {
        const realApiService = (await import('./realApiService.js')).default;
        return await realApiService.projectSignoff.getPendingSignoffs();
      } catch (error) {
        console.error('Failed to load pending signoffs:', error);
        throw error;
      }
    },
  },

  teams: {
    getMembers: async (organizationId, filters = {}) => {
      try {
        const realApiService = (await import('./realApiService.js')).default;
        return await realApiService.organizations.getMembers(
          organizationId,
          filters
        );
      } catch (error) {
        console.error('Failed to fetch organization members:', error);
        throw error;
      }
    },
    getMemberActivity: async (organizationId, userId) => {
      try {
        // Use real API service
        const realApiService = (await import('./realApiService.js')).default;
        return await realApiService.teams.getMemberActivity(
          organizationId,
          userId
        );
      } catch (error) {
        console.error('Failed to fetch member activity:', error);
        throw error; // Don't use mock fallback
      }
    },

    getTeamStats: async (organizationId) => {
      try {
        // Use real API service
        const realApiService = (await import('./realApiService.js')).default;
        return await realApiService.teams.getTeamStats(organizationId);
      } catch (error) {
        console.error('Failed to fetch team stats:', error);
        throw error; // Don't use mock fallback
      }
    },
  },

  // Notifications (Real Backend Integration)
  notifications: {
    getAll: async () => {
      try {
        // Use real API service
        const realApiService = (await import('./realApiService.js')).default;
        return await realApiService.notifications.getAll();
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
        throw error; // Don't use mock fallback
      }
    },

    markAsRead: async (notificationId) => {
      try {
        // Use real API service
        const realApiService = (await import('./realApiService.js')).default;
        return await realApiService.notifications.markAsRead(notificationId);
      } catch (error) {
        console.error('Failed to mark notification as read:', error);
        throw error; // Don't use mock fallback
      }
    },

    markAllAsRead: async () => {
      try {
        // Use real API service
        const realApiService = (await import('./realApiService.js')).default;
        return await realApiService.notifications.markAllAsRead();
      } catch (error) {
        console.error('Failed to mark all notifications as read:', error);
        throw error; // Don't use mock fallback
      }
    },
  },

  // Organization API methods
  organizations: {
    // Create new organization
    create: async (orgData, logoFile = null) => {
      try {
        // Import organizationService dynamically to avoid circular imports
        const { createOrganization } = await import('./organizationService.js');
        return await createOrganization(orgData, logoFile);
      } catch (error) {
        console.error('Failed to create organization:', error);
        throw error;
      }
    },

    // Get all organizations
    getAll: async () => {
      try {
        const { getOrganizations } = await import('./organizationService.js');
        return await getOrganizations();
      } catch (error) {
        console.error('Failed to get organizations:', error);
        throw error;
      }
    },

    // Get organization by ID
    getById: async (id) => {
      try {
        const { getOrganizationById } = await import(
          './organizationService.js'
        );
        return await getOrganizationById(id);
      } catch (error) {
        console.error('Failed to get organization:', error);
        throw error;
      }
    },

    // Update organization
    update: async (id, orgData, logoFile = null) => {
      try {
        const { updateOrganization } = await import('./organizationService.js');
        return await updateOrganization(id, orgData, logoFile);
      } catch (error) {
        console.error('Failed to update organization:', error);
        throw error;
      }
    },

    // Upload organization logo
    uploadLogo: async (id, logoFile) => {
      try {
        const { uploadOrganizationLogo } = await import(
          './organizationService.js'
        );
        return await uploadOrganizationLogo(id, logoFile);
      } catch (error) {
        console.error('Failed to upload organization logo:', error);
        throw error;
      }
    },

    // Delete organization logo
    deleteLogo: async (id) => {
      try {
        const { deleteOrganizationLogo } = await import(
          './organizationService.js'
        );
        return await deleteOrganizationLogo(id);
      } catch (error) {
        console.error('Failed to delete organization logo:', error);
        throw error;
      }
    },
  },

  // Analytics methods (Real Backend Integration)
  getUserActivityAnalytics: async (period = '30d') => {
    try {
      // Use real API service
      const realApiService = (await import('./realApiService.js')).default;
      const result = await realApiService.analytics.getUserAnalytics();
      console.log('User analytics loaded successfully:', result);
      return result.data;
    } catch (error) {
      console.error('Failed to fetch user analytics:', error);
      throw error; // Don't use mock fallback
    }
  },

  getOrganizationPerformance: async (period = '30d') => {
    try {
      // Use real API service
      const realApiService = (await import('./realApiService.js')).default;
      const organizationId = localStorage.getItem('organizationId');
      if (!organizationId) {
        throw new Error('Organization ID not found');
      }

      const result = await realApiService.analytics.getOrganizationAnalytics(
        organizationId,
        period
      );
      console.log('Organization analytics loaded successfully:', result);
      return result.data;
    } catch (error) {
      console.error('Failed to fetch organization analytics:', error);
      throw error; // Don't use mock fallback
    }
  },

  getProjectStatistics: async (period = '30d') => {
    try {
      // Use real API service
      const realApiService = (await import('./realApiService.js')).default;
      const result = await realApiService.analytics.getDashboardStats();
      console.log('Dashboard stats loaded successfully:', result);
      return result.data;
    } catch (error) {
      console.error('Failed to fetch project statistics:', error);
      throw error; // Don't use mock fallback
    }
  },

  getUsageAnalytics: async (period = '30d') => {
    try {
      // Use real API service
      const realApiService = (await import('./realApiService.js')).default;
      const result = await realApiService.analytics.getUsageAnalytics(period);
      console.log('Usage analytics loaded successfully:', result);
      return result.data;
    } catch (error) {
      console.error('Failed to fetch usage analytics:', error);
      throw error; // Don't use mock fallback
    }
  },

  // AI Features (Real Backend Integration)
  ai: {
    // Generate AI project preview
    generateProjectPreview: async (projectData) => {
      try {
        // Use real API service
        const realApiService = (await import('./realApiService.js')).default;
        return await realApiService.aiProjects.preview(projectData);
      } catch (error) {
        console.error('Failed to generate AI project preview:', error);
        throw error; // Don't use mock fallback
      }
    },

    // Create AI project
    createAIProject: async (organizationId, projectData) => {
      try {
        const realApiService = (await import('./realApiService.js')).default;
        return await realApiService.aiProjects.createAIProject(
          organizationId,
          projectData
        );
      } catch (error) {
        console.error('Failed to create AI project:', error);
        throw error;
      }
    },

    // Preview AI project
    previewAIProject: async (previewData) => {
      try {
        const realApiService = (await import('./realApiService.js')).default;
        return await realApiService.aiProjects.preview(previewData);
      } catch (error) {
        console.error('Failed to preview AI project:', error);
        throw error;
      }
    },

    // Get AI models
    getModels: async () => {
      try {
        // Use real API service
        const realApiService = (await import('./realApiService.js')).default;
        return await realApiService.ai.getModels();
      } catch (error) {
        console.error('Failed to fetch AI models:', error);
        throw error; // Don't use mock fallback
      }
    },

    // Get AI workflows
    getWorkflows: async () => {
      try {
        // Use real API service
        const realApiService = (await import('./realApiService.js')).default;
        return await realApiService.ai.getWorkflows();
      } catch (error) {
        console.error('Failed to fetch AI workflows:', error);
        throw error; // Don't use mock fallback
      }
    },

    // Get AI insights
    getInsights: async () => {
      try {
        // Use real API service
        const realApiService = (await import('./realApiService.js')).default;
        return await realApiService.ai.getInsights();
      } catch (error) {
        console.error('Failed to fetch AI insights:', error);
        throw error; // Don't use mock fallback
      }
    },

    // Get project templates
    getTemplates: async () => {
      try {
        // Use real API service
        const realApiService = (await import('./realApiService.js')).default;
        return await realApiService.aiProjectsMeta.getTemplates();
      } catch (error) {
        console.error('Failed to fetch AI templates:', error);
        throw error; // Don't use mock fallback
      }
    },

    // Get tech stacks
    getTechStacks: async () => {
      try {
        // Use real API service
        const realApiService = (await import('./realApiService.js')).default;
        return await realApiService.aiProjectsMeta.getTechStacks();
      } catch (error) {
        console.error('Failed to fetch tech stacks:', error);
        throw error; // Don't use mock fallback
      }
    },

    // AI Projects helpers
    aiProjects: {
      taskToBoard: async (organizationId, projectId, task) => {
        const realApiService = (await import('./realApiService.js')).default;
        return await realApiService.aiProjectsTaskToBoard(
          organizationId,
          projectId,
          task
        );
      },
    },
  },

  // Checklist (Real Backend Integration)
  checklist: {
    createBulk: async (cardId, checklistData) => {
      try {
        // Use real API service
        const realApiService = (await import('./realApiService.js')).default;
        return await realApiService.checklist.createBulk(cardId, checklistData);
      } catch (error) {
        console.error('Failed to create checklist:', error);
        throw error; // Don't use mock fallback
      }
    },

    generateAI: async (cardId, aiData) => {
      try {
        // Use real API service
        const realApiService = (await import('./realApiService.js')).default;
        return await realApiService.checklist.generateAI(cardId, aiData);
      } catch (error) {
        console.error('Failed to generate AI checklist:', error);
        throw error; // Don't use mock fallback
      }
    },
  },

  // File Upload (Real Backend Integration)
  files: {
    upload: async (file, cardId = null) => {
      try {
        // Use real API service
        const realApiService = (await import('./realApiService.js')).default;
        return await realApiService.files.upload(file, cardId);
      } catch (error) {
        console.error('Failed to upload file:', error);
        throw error; // Don't use mock fallback
      }
    },

    getByCard: async (cardId) => {
      try {
        // Use real API service
        const realApiService = (await import('./realApiService.js')).default;
        return await realApiService.files.getByCard(cardId);
      } catch (error) {
        console.error('Failed to fetch files:', error);
        throw error; // Don't use mock fallback
      }
    },

    delete: async (fileId) => {
      try {
        // Use real API service
        const realApiService = (await import('./realApiService.js')).default;
        return await realApiService.files.delete(fileId);
      } catch (error) {
        console.error('Failed to delete file:', error);
        throw error; // Don't use mock fallback
      }
    },
  },

  // Billing methods
  getSubscriptionDetails: async () => {
    await delay(500);
    return {
      plan: 'Professional',
      status: 'active',
      price: 29.99,
      currency: 'USD',
      billingCycle: 'monthly',
      nextBillingDate: '2024-02-15',
      seats: 25,
      usedSeats: 18,
    };
  },

  getPaymentHistory: async () => {
    await delay(500);
    return [
      {
        id: 'inv_001',
        date: '2024-01-15',
        amount: 29.99,
        status: 'paid',
        description: 'Professional Plan - Monthly',
        downloadUrl: '#',
      },
      {
        id: 'inv_002',
        date: '2023-12-15',
        amount: 29.99,
        status: 'paid',
        description: 'Professional Plan - Monthly',
        downloadUrl: '#',
      },
    ];
  },

  getUsageBilling: async () => {
    await delay(500);
    return {
      currentPeriod: {
        start: '2024-01-15',
        end: '2024-02-15',
      },
      metrics: [
        { name: 'Active Users', current: 18, limit: 25, unit: 'users' },
        { name: 'Projects', current: 12, limit: 'unlimited', unit: 'projects' },
        { name: 'Storage', current: 2.4, limit: 100, unit: 'GB' },
        { name: 'API Calls', current: 1250, limit: 10000, unit: 'calls' },
      ],
    };
  },

  getAvailablePlans: async () => {
    await delay(500);
    return [
      {
        id: 'starter',
        name: 'Starter',
        price: 9.99,
        currency: 'USD',
        billingCycle: 'monthly',
        features: ['Up to 5 users', '10 projects', '5GB storage'],
        current: false,
      },
      {
        id: 'professional',
        name: 'Professional',
        price: 29.99,
        currency: 'USD',
        billingCycle: 'monthly',
        features: ['Up to 25 users', 'Unlimited projects', '100GB storage'],
        current: true,
        popular: true,
      },
      {
        id: 'enterprise',
        name: 'Enterprise',
        price: 99.99,
        currency: 'USD',
        billingCycle: 'monthly',
        features: ['Unlimited users', 'Unlimited projects', '1TB storage'],
        current: false,
      },
    ];
  },
};

export default apiService;
