// src/utils/realApiService.js (minimal live backend client used by apiService)

import sessionService from './sessionService.js';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

const getAuthHeaders = (extra = {}) => {
  // Database-only authentication - NO localStorage fallback
  const token = sessionService.getSessionToken?.();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extra,
  };
};

const handle = async (resp) => {
  const text = await resp.text();
  let json;
  try {
    json = text ? JSON.parse(text) : {};
  } catch {
    json = { message: text };
  }
  if (!resp.ok) {
    const msg = json?.error?.message || json?.message || `HTTP ${resp.status}`;
    throw new Error(msg);
  }
  return json;
};

const buildQS = (params = {}) => {
  const usp = new URLSearchParams();
  for (const [k, v] of Object.entries(params))
    if (v !== undefined && v !== null && v !== '') usp.append(k, v);
  const qs = usp.toString();
  return qs ? `?${qs}` : '';
};

const realApiService = {
  // Authentication
  auth: {
    register: async (data) => {
      const body = {
        email: data.email,
        password: data.password,
        first_name: data.firstName || data.first_name,
        last_name: data.lastName || data.last_name,
        organization_name: data.organizationName || data.organization_name,
        organization_domain:
          data.organizationDomain || data.organization_domain,
      };
      const resp = await fetch(`${API_BASE_URL}/api/v1/auth/register`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(body),
      });
      return handle(resp);
    },
    login: async (email, password) => {
      const resp = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ email, password }),
      });
      const result = await handle(resp);
      // Database-only authentication - no localStorage usage
      // Tokens are handled by sessionService
      return result;
    },
    logout: async () => {
      const resp = await fetch(`${API_BASE_URL}/api/v1/auth/logout`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
      const result = await handle(resp);
      // Database-only authentication - no localStorage usage
      // Session cleanup is handled by sessionService
      return result;
    },
  },

  // Users
  users: {
    getCurrentUser: async () => {
      const resp = await fetch(`${API_BASE_URL}/api/v1/auth/me`, {
        headers: getAuthHeaders(),
      });
      return handle(resp);
    },
    updateProfile: async (updateData) => {
      const resp = await fetch(`${API_BASE_URL}/api/v1/users/profile`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updateData),
      });
      return handle(resp);
    },
    uploadAvatar: async (file) => {
      const form = new FormData();
      form.append('file', file);
      const token =
        sessionService.getSessionToken?.() ||
        localStorage.getItem('accessToken');
      const resp = await fetch(`${API_BASE_URL}/api/v1/users/avatar`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: form,
      });
      return handle(resp);
    },
  },

  // Dashboard / Analytics (minimal)
  dashboard: {
    getStats: async () => {
      const resp = await fetch(
        `${API_BASE_URL}/api/v1/analytics/dashboard/stats`,
        { headers: getAuthHeaders() }
      );
      // Normalize into {data, error}
      try {
        const j = await handle(resp);
        return { data: j.data || j, error: null };
      } catch (e) {
        return { data: null, error: e.message };
      }
    },
  },
  analytics: {
    getUserAnalytics: async () => {
      const resp = await fetch(`${API_BASE_URL}/api/v1/analytics/user`, {
        headers: getAuthHeaders(),
      });
      return handle(resp);
    },
    getOrganizationAnalytics: async (organizationId, period = '30d') => {
      const resp = await fetch(
        `${API_BASE_URL}/api/v1/analytics/organization/${organizationId}${buildQS(
          { period }
        )}`,
        { headers: getAuthHeaders() }
      );
      return handle(resp);
    },
    getDashboardStats: async () => realApiService.dashboard.getStats(),
    getUsageAnalytics: async (period = '30d') => {
      const resp = await fetch(
        `${API_BASE_URL}/api/v1/analytics/usage${buildQS({ period })}`,
        { headers: getAuthHeaders() }
      );
      return handle(resp);
    },
  },

  // Organizations (members endpoints used by teamService)
  organizations: {
    getAll: async () => {
      const resp = await fetch(`${API_BASE_URL}/api/v1/organizations`, {
        headers: getAuthHeaders(),
      });
      const r = await handle(resp);
      return {
        organizations: Array.isArray(r.data) ? r.data : r.data ? [r.data] : [],
      };
    },
    getById: async (id) => {
      const resp = await fetch(`${API_BASE_URL}/api/v1/organizations/${id}`, {
        headers: getAuthHeaders(),
      });
      const r = await handle(resp);
      return r.data || r;
    },
    getMembers: async (organizationId, filters = {}) => {
      const resp = await fetch(
        `${API_BASE_URL}/api/v1/organizations/${organizationId}/members${buildQS(
          filters
        )}`,
        { headers: getAuthHeaders() }
      );
      const r = await handle(resp);
      return r.data;
    },
    create: async (data) => {
      const resp = await fetch(`${API_BASE_URL}/api/v1/organizations`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      return handle(resp);
    },
    update: async (id, data) => {
      const resp = await fetch(`${API_BASE_URL}/api/v1/organizations/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      return handle(resp);
    },
  },

  // Projects
  projects: {
    getAll: async (organizationId) => {
      // Backend supports organization_id as a query parameter
      const qs = buildQS(
        organizationId ? { organization_id: organizationId } : {}
      );
      const resp = await fetch(`${API_BASE_URL}/api/v1/projects${qs}`, {
        headers: getAuthHeaders(),
      });
      const r = await handle(resp);
      // Backend returns a bare list for this endpoint
      return r;
    },
    getById: async (id) => {
      const resp = await fetch(`${API_BASE_URL}/api/v1/projects/${id}`, {
        headers: getAuthHeaders(),
      });
      const r = await handle(resp);
      // Backend returns a single project object
      return r;
    },
    create: async (organizationId, data) => {
      const headers = getAuthHeaders(
        organizationId ? { 'X-Organization-ID': organizationId } : {}
      );
      const resp = await fetch(`${API_BASE_URL}/api/v1/projects`, {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
      });
      return handle(resp);
    },
    update: async (id, data) => {
      const resp = await fetch(`${API_BASE_URL}/api/v1/projects/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      return handle(resp);
    },
    delete: async (id) => {
      const resp = await fetch(`${API_BASE_URL}/api/v1/projects/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      return handle(resp);
    },
  },

  // Boards
  boards: {
    getByProject: async (projectId) => {
      const resp = await fetch(
        `${API_BASE_URL}/api/v1/projects/${projectId}/boards`,
        { headers: getAuthHeaders() }
      );
      const r = await handle(resp);
      return r.data || r; // handle both wrapped and unwrapped responses
    },
    getById: async (id) => {
      const resp = await fetch(`${API_BASE_URL}/api/v1/boards/${id}`, {
        headers: getAuthHeaders(),
      });
      const r = await handle(resp);
      return r.data;
    },
    create: async (projectId, data) => {
      // Backend expects POST /api/v1/projects/{projectId}/boards
      const payload = { name: data.name, description: data.description };
      const resp = await fetch(
        `${API_BASE_URL}/api/v1/projects/${projectId}/boards`,
        {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify(payload),
        }
      );
      return handle(resp);
    },
    update: async (id, data) => {
      const resp = await fetch(`${API_BASE_URL}/api/v1/boards/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      return handle(resp);
    },
    delete: async (id) => {
      const resp = await fetch(`${API_BASE_URL}/api/v1/boards/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      return handle(resp);
    },
  },

  // Columns
  columns: {
    getByBoard: async (boardId) => {
      const resp = await fetch(
        `${API_BASE_URL}/api/v1/boards/${boardId}/columns`,
        { headers: getAuthHeaders() }
      );
      const r = await handle(resp);
      return r.data || r; // server wraps in {success,message,data}
    },
    getById: async (id) => {
      const resp = await fetch(`${API_BASE_URL}/api/v1/columns/${id}`, {
        headers: getAuthHeaders(),
      });
      const r = await handle(resp);
      return r.data;
    },
    create: async (boardId, data) => {
      // Backend expects POST /api/v1/columns with board_id in body
      const payload = {
        board_id: boardId,
        name: data.name,
        position: data.position,
        color: data.color,
      };
      const resp = await fetch(`${API_BASE_URL}/api/v1/columns`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });
      return handle(resp);
    },
    update: async (id, data) => {
      const resp = await fetch(`${API_BASE_URL}/api/v1/columns/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      return handle(resp);
    },
    delete: async (id) => {
      const resp = await fetch(`${API_BASE_URL}/api/v1/columns/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      return handle(resp);
    },
  },

  // Cards / Tasks
  cards: {
    getAll: async (columnId = null) => {
      const resp = await fetch(
        `${API_BASE_URL}/api/v1/cards${buildQS(
          columnId ? { column_id: columnId } : {}
        )}`,
        { headers: getAuthHeaders() }
      );
      const r = await handle(resp);
      return r.data ? r.data : [];
    },
    getById: async (id) => {
      const resp = await fetch(`${API_BASE_URL}/api/v1/cards/${id}`, {
        headers: getAuthHeaders(),
      });
      const result = await handle(resp);

      // Ensure consistent response format
      if (result && typeof result === 'object') {
        // If backend returns { success: true, data: {...} }, extract the data
        if (result.data) {
          return { data: result.data };
        }
        // If backend returns the card data directly, wrap it
        return { data: result };
      }

      return result;
    },
    create: async (columnId, data) => {
      const payload = { ...data, column_id: data.column_id || columnId };
      const resp = await fetch(`${API_BASE_URL}/api/v1/cards`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });
      const result = await handle(resp);

      // Ensure consistent response format - backend returns { success, data, message }
      // Frontend expects { data: ... }
      if (result && typeof result === 'object') {
        // If backend returns { success: true, data: {...} }, extract the data
        if (result.data) {
          return { data: result.data };
        }
        // If backend returns the card data directly, wrap it
        return { data: result };
      }

      return result;
    },
    update: async (id, data) => {
      // Log what we're sending for debugging
      console.log('Updating card with data:', data);

      const resp = await fetch(`${API_BASE_URL}/api/v1/cards/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });

      // Enhanced error handling
      if (!resp.ok) {
        const errorText = await resp.text();
        console.error(`Card update failed (${resp.status}):`, errorText);
        throw new Error(`HTTP ${resp.status}: ${errorText}`);
      }

      return handle(resp);
    },
    delete: async (id) => {
      const resp = await fetch(`${API_BASE_URL}/api/v1/cards/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      return handle(resp);
    },
    move: async (cardId, targetColumnId, position = null) => {
      const payload = { target_column_id: targetColumnId, position };
      const resp = await fetch(`${API_BASE_URL}/api/v1/cards/${cardId}/move`, {
        method: 'PUT', // Backend expects PUT, not POST
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });
      return handle(resp);
    },
  },

  // Checklist
  checklist: {
    createBulk: async (cardId, checklistData) => {
      const resp = await fetch(
        `${API_BASE_URL}/api/v1/checklist/${cardId}/bulk`,
        {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify(checklistData),
        }
      );
      return handle(resp);
    },
    updateItem: async (itemId, update) => {
      const resp = await fetch(
        `${API_BASE_URL}/api/v1/checklist/items/${itemId}`,
        {
          method: 'PUT',
          headers: getAuthHeaders(),
          body: JSON.stringify(update),
        }
      );
      return handle(resp);
    },
    deleteItem: async (itemId) => {
      const resp = await fetch(
        `${API_BASE_URL}/api/v1/checklist/items/${itemId}`,
        { method: 'DELETE', headers: getAuthHeaders() }
      );
      return handle(resp);
    },
    generateAI: async (cardId, aiData) => {
      const resp = await fetch(
        `${API_BASE_URL}/api/v1/checklist/${cardId}/generate-ai`,
        {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify(aiData),
        }
      );
      return handle(resp);
    },
  },

  // Files
  files: {
    upload: async (file, cardId = null) => {
      const form = new FormData();
      form.append('file', file);
      if (cardId) form.append('card_id', cardId);
      const token =
        sessionService.getSessionToken?.() ||
        localStorage.getItem('accessToken');
      const resp = await fetch(`${API_BASE_URL}/api/v1/files/upload`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: form,
      });
      return handle(resp);
    },
    getByCard: async (cardId) => {
      const resp = await fetch(
        `${API_BASE_URL}/api/v1/files${buildQS({ card_id: cardId })}`,
        { headers: getAuthHeaders() }
      );
      return handle(resp);
    },
    delete: async (fileId) => {
      const resp = await fetch(`${API_BASE_URL}/api/v1/files/${fileId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      return handle(resp);
    },
  },

  // Teams
  teams: {
    getMemberActivity: async (organizationId, userId) => {
      const resp = await fetch(
        `${API_BASE_URL}/api/v1/teams/${organizationId}/members/${userId}/activity`,
        { headers: getAuthHeaders() }
      );
      return handle(resp);
    },
    getTeamStats: async (organizationId) => {
      const resp = await fetch(
        `${API_BASE_URL}/api/v1/teams/${organizationId}/stats`,
        { headers: getAuthHeaders() }
      );
      return handle(resp);
    },
    inviteMember: async (organizationId, inviteData) => {
      const resp = await fetch(
        `${API_BASE_URL}/api/v1/organizations/${organizationId}/invite`,
        {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify(inviteData),
        }
      );
      return handle(resp);
    },
    updateMemberRole: async (organizationId, userId, roleData) => {
      const resp = await fetch(
        `${API_BASE_URL}/api/v1/organizations/${organizationId}/members/${userId}/role`,
        {
          method: 'PUT',
          headers: getAuthHeaders(),
          body: JSON.stringify(roleData),
        }
      );
      return handle(resp);
    },
    removeMember: async (organizationId, userId) => {
      const resp = await fetch(
        `${API_BASE_URL}/api/v1/organizations/${organizationId}/members/${userId}`,
        { method: 'DELETE', headers: getAuthHeaders() }
      );
      return handle(resp);
    },
  },

  // Notifications
  notifications: {
    getAll: async (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      const url = qs
        ? `${API_BASE_URL}/api/v1/notifications?${qs}`
        : `${API_BASE_URL}/api/v1/notifications`;
      const resp = await fetch(url, { headers: getAuthHeaders() });
      return handle(resp);
    },
    create: async (data) => {
      const resp = await fetch(`${API_BASE_URL}/api/v1/notifications`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      return handle(resp);
    },
    markAsRead: async (notificationId) => {
      const resp = await fetch(
        `${API_BASE_URL}/api/v1/notifications/${notificationId}/read`,
        { method: 'PUT', headers: getAuthHeaders() }
      );
      return handle(resp);
    },
    markAllAsRead: async () => {
      const resp = await fetch(
        `${API_BASE_URL}/api/v1/notifications/mark-all-read`,
        { method: 'PUT', headers: getAuthHeaders() }
      );
      return handle(resp);
    },
    getStats: async () => {
      const resp = await fetch(`${API_BASE_URL}/api/v1/notifications/stats`, {
        headers: getAuthHeaders(),
      });
      return handle(resp);
    },
    delete: async (notificationId) => {
      const resp = await fetch(
        `${API_BASE_URL}/api/v1/notifications/${notificationId}`,
        { method: 'DELETE', headers: getAuthHeaders() }
      );
      return handle(resp);
    },
  },

  // AI Projects
  aiProjects: {
    preview: async ({
      name,
      project_type = 'general',
      team_size = 5,
      team_experience = 'intermediate',
      organization_id,
    }) => {
      const resp = await fetch(
        `${API_BASE_URL}/api/v1/ai-projects/ai-preview`,
        {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({
            name,
            project_type,
            team_size,
            team_experience,
            organization_id,
          }),
        }
      );
      return handle(resp);
    },
    createAIProject: async (organizationId, data) => {
      // Map incoming data to backend simple create contract
      const payload = {
        name:
          data.name ||
          data.overview?.title ||
          data.configuration?.name ||
          'Untitled Project',
        description:
          data.description ||
          data.overview?.description ||
          data.configuration?.description ||
          '',
        organization_id: data.organization_id || organizationId,
        generated_tasks: data.generated_tasks || data.tasks || [],
        configuration: data.configuration || {},
        tech_stack: data.tech_stack || data.techStack || {},
        workflow: data.workflow || {},
      };
      const resp = await fetch(
        `${API_BASE_URL}/api/v1/ai-projects/ai-create-simple`,
        {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify(payload),
        }
      );
      return handle(resp);
    },
    createFromPreview: async ({ confirmation_data, final_tasks, workflow }) => {
      const resp = await fetch(`${API_BASE_URL}/api/v1/ai-projects/ai-create`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ confirmation_data, final_tasks, workflow }),
      });
      return handle(resp);
    },
  },

  // Add AI task to board card (helper)
  aiProjectsTaskToBoard: async (organizationId, projectId, taskData) => {
    const payload = {
      organization_id: organizationId,
      project_id: projectId,
      task_data: taskData,
    };
    const resp = await fetch(
      `${API_BASE_URL}/api/v1/ai-projects/ai-task-to-board`,
      {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      }
    );
    return handle(resp);
  },

  // AI Projects metadata
  aiProjectsMeta: {
    getTemplates: async () => {
      const resp = await fetch(`${API_BASE_URL}/api/v1/ai-projects/templates`, {
        headers: getAuthHeaders(),
      });
      return handle(resp);
    },
    getTechStacks: async () => {
      const resp = await fetch(
        `${API_BASE_URL}/api/v1/ai-projects/tech-stacks`,
        {
          headers: getAuthHeaders(),
        }
      );
      return handle(resp);
    },
  },

  // AI Info
  ai: {
    getModels: async () => {
      const resp = await fetch(`${API_BASE_URL}/api/v1/ai/models`, {
        headers: getAuthHeaders(),
      });
      return handle(resp);
    },
    getWorkflows: async () => {
      const resp = await fetch(`${API_BASE_URL}/api/v1/ai/workflows`, {
        headers: getAuthHeaders(),
      });
      return handle(resp);
    },
    getInsights: async () => {
      const resp = await fetch(`${API_BASE_URL}/api/v1/ai/insights`, {
        headers: getAuthHeaders(),
      });
      return handle(resp);
    },
  },

  // Project Sign-off
  projectSignoff: {
    requestSignoff: async (projectId, requestData) => {
      const resp = await fetch(
        `${API_BASE_URL}/api/v1/project-signoff/${projectId}/request-signoff`,
        {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify(requestData),
        }
      );
      return handle(resp);
    },
    approveSignoff: async (projectId, approvalData) => {
      const resp = await fetch(
        `${API_BASE_URL}/api/v1/project-signoff/${projectId}/approve-signoff`,
        {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify(approvalData),
        }
      );
      return handle(resp);
    },
    getSignoffStatus: async (projectId) => {
      const resp = await fetch(
        `${API_BASE_URL}/api/v1/project-signoff/${projectId}/signoff-status`,
        { headers: getAuthHeaders() }
      );
      return handle(resp);
    },
    getPendingSignoffs: async () => {
      const resp = await fetch(
        `${API_BASE_URL}/api/v1/project-signoff/pending-signoffs`,
        { headers: getAuthHeaders() }
      );
      return handle(resp);
    },
  },
};

export default realApiService;
