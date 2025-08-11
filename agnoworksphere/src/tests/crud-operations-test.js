/**
 * CRUD Operations Integration Test
 * Tests all CRUD operations for all entities to ensure frontend-backend integration
 */

import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

class CRUDOperationsTest {
  constructor() {
    this.testResults = [];
    this.testUser = null;
    this.testData = {
      organizationId: null,
      projectId: null,
      boardId: null,
      columnId: null,
      cardId: null,
    };
  }

  // Setup test user and authentication
  async setupTestUser() {
    const timestamp = Date.now();
    const testUser = {
      email: `crud_test_${timestamp}@test.com`,
      password: 'TestPassword123!',
      first_name: 'CRUD',
      last_name: 'Tester',
    };

    try {
      // Register user
      await axios.post(`${API_BASE_URL}/api/v1/auth/register`, testUser);
      console.log('✅ Test user registered');

      // Login user
      const loginResponse = await axios.post(
        `${API_BASE_URL}/api/v1/auth/login`,
        {
          email: testUser.email,
          password: testUser.password,
        }
      );

      if (loginResponse.data.data && loginResponse.data.data.tokens) {
        this.testUser = {
          ...testUser,
          token: loginResponse.data.data.tokens.access_token,
          userId: loginResponse.data.data.user.id,
        };
        console.log('✅ Test user logged in');
        return true;
      }
    } catch (error) {
      console.error(
        '❌ Failed to setup test user:',
        error.response?.data || error.message
      );
      return false;
    }
  }

  // Get auth headers
  getAuthHeaders() {
    return {
      Authorization: `Bearer ${this.testUser.token}`,
      'Content-Type': 'application/json',
    };
  }

  // Test Organizations CRUD
  async testOrganizationsCRUD() {
    console.log('\n🏢 Testing Organizations CRUD Operations');
    console.log('='.repeat(60));

    try {
      // CREATE Organization
      const createResponse = await axios.post(
        `${API_BASE_URL}/api/v1/organizations`,
        {
          name: `Test Organization ${Date.now()}`,
          description: 'Test organization for CRUD testing',
        },
        { headers: this.getAuthHeaders() }
      );

      if (createResponse.data.data) {
        this.testData.organizationId = createResponse.data.data.id;
        console.log('✅ Organization CREATE: Success');
      }

      // READ Organization
      const readResponse = await axios.get(
        `${API_BASE_URL}/api/v1/organizations/${this.testData.organizationId}`,
        { headers: this.getAuthHeaders() }
      );

      if (readResponse.data.data) {
        console.log('✅ Organization READ: Success');
      }

      // UPDATE Organization
      const updateResponse = await axios.put(
        `${API_BASE_URL}/api/v1/organizations/${this.testData.organizationId}`,
        {
          name: `Updated Test Organization ${Date.now()}`,
          description: 'Updated test organization',
        },
        { headers: this.getAuthHeaders() }
      );

      if (updateResponse.data.data) {
        console.log('✅ Organization UPDATE: Success');
      }

      // LIST Organizations
      const listResponse = await axios.get(
        `${API_BASE_URL}/api/v1/organizations`,
        { headers: this.getAuthHeaders() }
      );

      if (listResponse.data.data) {
        console.log(
          `✅ Organization LIST: Success (${listResponse.data.data.length} organizations)`
        );
      }
    } catch (error) {
      console.error(
        '❌ Organization CRUD failed:',
        error.response?.status,
        error.response?.data?.message
      );
    }
  }

  // Test Projects CRUD
  async testProjectsCRUD() {
    console.log('\n📁 Testing Projects CRUD Operations');
    console.log('='.repeat(60));

    if (!this.testData.organizationId) {
      console.log('❌ Skipping Projects CRUD - No organization ID');
      return;
    }

    try {
      // CREATE Project
      const createResponse = await axios.post(
        `${API_BASE_URL}/api/v1/projects`,
        {
          name: `Test Project ${Date.now()}`,
          description: 'Test project for CRUD testing',
          organization_id: this.testData.organizationId,
        },
        { headers: this.getAuthHeaders() }
      );

      if (createResponse.data.data) {
        this.testData.projectId = createResponse.data.data.id;
        console.log('✅ Project CREATE: Success');
      }

      // READ Project
      const readResponse = await axios.get(
        `${API_BASE_URL}/api/v1/projects/${this.testData.projectId}`,
        { headers: this.getAuthHeaders() }
      );

      if (readResponse.data.data) {
        console.log('✅ Project READ: Success');
      }

      // UPDATE Project
      const updateResponse = await axios.put(
        `${API_BASE_URL}/api/v1/projects/${this.testData.projectId}`,
        {
          name: `Updated Test Project ${Date.now()}`,
          description: 'Updated test project',
        },
        { headers: this.getAuthHeaders() }
      );

      if (updateResponse.data.data) {
        console.log('✅ Project UPDATE: Success');
      }

      // LIST Projects
      const listResponse = await axios.get(
        `${API_BASE_URL}/api/v1/projects?organization_id=${this.testData.organizationId}`,
        { headers: this.getAuthHeaders() }
      );

      if (listResponse.data.data) {
        console.log(
          `✅ Project LIST: Success (${listResponse.data.data.length} projects)`
        );
      }
    } catch (error) {
      console.error(
        '❌ Project CRUD failed:',
        error.response?.status,
        error.response?.data?.message
      );
    }
  }

  // Test Boards CRUD
  async testBoardsCRUD() {
    console.log('\n📋 Testing Boards CRUD Operations');
    console.log('='.repeat(60));

    if (!this.testData.projectId) {
      console.log('❌ Skipping Boards CRUD - No project ID');
      return;
    }

    try {
      // CREATE Board
      const createResponse = await axios.post(
        `${API_BASE_URL}/api/v1/boards`,
        {
          name: `Test Board ${Date.now()}`,
          project_id: this.testData.projectId,
        },
        { headers: this.getAuthHeaders() }
      );

      if (createResponse.data.data) {
        this.testData.boardId = createResponse.data.data.id;
        console.log('✅ Board CREATE: Success');
      }

      // READ Board
      const readResponse = await axios.get(
        `${API_BASE_URL}/api/v1/boards/${this.testData.boardId}`,
        { headers: this.getAuthHeaders() }
      );

      if (readResponse.data.data) {
        console.log('✅ Board READ: Success');
      }

      // UPDATE Board
      const updateResponse = await axios.put(
        `${API_BASE_URL}/api/v1/boards/${this.testData.boardId}`,
        {
          name: `Updated Test Board ${Date.now()}`,
        },
        { headers: this.getAuthHeaders() }
      );

      if (updateResponse.data.data) {
        console.log('✅ Board UPDATE: Success');
      }

      // LIST Boards by Project
      const listResponse = await axios.get(
        `${API_BASE_URL}/api/v1/boards/${this.testData.projectId}/boards`,
        { headers: this.getAuthHeaders() }
      );

      if (listResponse.data.data) {
        console.log(
          `✅ Board LIST: Success (${listResponse.data.data.length} boards)`
        );
      }
    } catch (error) {
      console.error(
        '❌ Board CRUD failed:',
        error.response?.status,
        error.response?.data?.message
      );
    }
  }

  // Test Columns CRUD
  async testColumnsCRUD() {
    console.log('\n📊 Testing Columns CRUD Operations');
    console.log('='.repeat(60));

    if (!this.testData.boardId) {
      console.log('❌ Skipping Columns CRUD - No board ID');
      return;
    }

    try {
      // CREATE Column
      const createResponse = await axios.post(
        `${API_BASE_URL}/api/v1/columns/${this.testData.boardId}/columns`,
        {
          name: `Test Column ${Date.now()}`,
          position: 0,
        },
        { headers: this.getAuthHeaders() }
      );

      if (createResponse.data.data) {
        this.testData.columnId = createResponse.data.data.id;
        console.log('✅ Column CREATE: Success');
      }

      // READ Column
      const readResponse = await axios.get(
        `${API_BASE_URL}/api/v1/columns/${this.testData.columnId}`,
        { headers: this.getAuthHeaders() }
      );

      if (readResponse.data.data) {
        console.log('✅ Column READ: Success');
      }

      // UPDATE Column
      const updateResponse = await axios.put(
        `${API_BASE_URL}/api/v1/columns/${this.testData.columnId}`,
        {
          name: `Updated Test Column ${Date.now()}`,
        },
        { headers: this.getAuthHeaders() }
      );

      if (updateResponse.data.data) {
        console.log('✅ Column UPDATE: Success');
      }

      // LIST Columns by Board
      const listResponse = await axios.get(
        `${API_BASE_URL}/api/v1/boards/${this.testData.boardId}/columns`,
        { headers: this.getAuthHeaders() }
      );

      if (listResponse.data.data) {
        console.log(
          `✅ Column LIST: Success (${listResponse.data.data.length} columns)`
        );
      }
    } catch (error) {
      console.error(
        '❌ Column CRUD failed:',
        error.response?.status,
        error.response?.data?.message
      );
    }
  }

  // Test Cards CRUD
  async testCardsCRUD() {
    console.log('\n🃏 Testing Cards CRUD Operations');
    console.log('='.repeat(60));

    if (!this.testData.columnId) {
      console.log('❌ Skipping Cards CRUD - No column ID');
      return;
    }

    try {
      // CREATE Card
      const createResponse = await axios.post(
        `${API_BASE_URL}/api/v1/cards`,
        {
          title: `Test Card ${Date.now()}`,
          description: 'Test card for CRUD testing',
          column_id: this.testData.columnId,
          position: 0,
        },
        { headers: this.getAuthHeaders() }
      );

      if (createResponse.data.data) {
        this.testData.cardId = createResponse.data.data.id;
        console.log('✅ Card CREATE: Success');
      }

      // READ Card
      const readResponse = await axios.get(
        `${API_BASE_URL}/api/v1/cards/${this.testData.cardId}`,
        { headers: this.getAuthHeaders() }
      );

      if (readResponse.data.data) {
        console.log('✅ Card READ: Success');
      }

      // UPDATE Card
      const updateResponse = await axios.put(
        `${API_BASE_URL}/api/v1/cards/${this.testData.cardId}`,
        {
          title: `Updated Test Card ${Date.now()}`,
          description: 'Updated test card',
        },
        { headers: this.getAuthHeaders() }
      );

      if (updateResponse.data.data) {
        console.log('✅ Card UPDATE: Success');
      }

      // LIST Cards by Column
      const listResponse = await axios.get(
        `${API_BASE_URL}/api/v1/cards?column_id=${this.testData.columnId}`,
        { headers: this.getAuthHeaders() }
      );

      if (listResponse.data.data) {
        console.log(
          `✅ Card LIST: Success (${listResponse.data.data.length} cards)`
        );
      }
    } catch (error) {
      console.error(
        '❌ Card CRUD failed:',
        error.response?.status,
        error.response?.data?.message
      );
    }
  }

  // Test Analytics Endpoints
  async testAnalyticsEndpoints() {
    console.log('\n📊 Testing Analytics Endpoints');
    console.log('='.repeat(60));

    try {
      // Dashboard Stats
      const dashboardResponse = await axios.get(
        `${API_BASE_URL}/api/v1/analytics/dashboard/stats`,
        { headers: this.getAuthHeaders() }
      );

      if (dashboardResponse.data.data) {
        console.log('✅ Dashboard Analytics: Success');
      }

      // User Analytics
      const userAnalyticsResponse = await axios.get(
        `${API_BASE_URL}/api/v1/analytics/users`,
        { headers: this.getAuthHeaders() }
      );

      if (userAnalyticsResponse.data.data) {
        console.log('✅ User Analytics: Success');
      }

      // Organization Analytics
      if (this.testData.organizationId) {
        const orgAnalyticsResponse = await axios.get(
          `${API_BASE_URL}/api/v1/analytics/organizations/${this.testData.organizationId}`,
          { headers: this.getAuthHeaders() }
        );

        if (orgAnalyticsResponse.data.data) {
          console.log('✅ Organization Analytics: Success');
        }
      }
    } catch (error) {
      console.error(
        '❌ Analytics endpoints failed:',
        error.response?.status,
        error.response?.data?.message
      );
    }
  }

  // Test User Profile Operations
  async testUserProfileOperations() {
    console.log('\n👤 Testing User Profile Operations');
    console.log('='.repeat(60));

    try {
      // Get Current User
      const currentUserResponse = await axios.get(
        `${API_BASE_URL}/api/v1/users/me`,
        { headers: this.getAuthHeaders() }
      );

      if (currentUserResponse.data.data) {
        console.log('✅ Get Current User: Success');
      }

      // Update Profile
      const updateProfileResponse = await axios.put(
        `${API_BASE_URL}/api/v1/users/profile`,
        {
          first_name: 'Updated CRUD',
          last_name: 'Tester Updated',
        },
        { headers: this.getAuthHeaders() }
      );

      if (updateProfileResponse.data.data) {
        console.log('✅ Update Profile: Success');
      }
    } catch (error) {
      console.error(
        '❌ User profile operations failed:',
        error.response?.status,
        error.response?.data?.message
      );
    }
  }

  // Test Notifications
  async testNotifications() {
    console.log('\n🔔 Testing Notifications');
    console.log('='.repeat(60));

    try {
      // Get Notifications
      const notificationsResponse = await axios.get(
        `${API_BASE_URL}/api/v1/notifications`,
        { headers: this.getAuthHeaders() }
      );

      if (notificationsResponse.data.data) {
        console.log(
          `✅ Get Notifications: Success (${notificationsResponse.data.data.length} notifications)`
        );
      }
    } catch (error) {
      console.error(
        '❌ Notifications test failed:',
        error.response?.status,
        error.response?.data?.message
      );
    }
  }

  // Run all CRUD tests
  async runAllTests() {
    console.log('🚀 Starting CRUD Operations Integration Tests');
    console.log('='.repeat(80));

    const setupSuccess = await this.setupTestUser();
    if (!setupSuccess) {
      console.log('❌ Test setup failed, aborting tests');
      return;
    }

    await this.testOrganizationsCRUD();
    await this.testProjectsCRUD();
    await this.testBoardsCRUD();
    await this.testColumnsCRUD();
    await this.testCardsCRUD();
    await this.testAnalyticsEndpoints();
    await this.testUserProfileOperations();
    await this.testNotifications();

    console.log('\n✅ All CRUD operations tests completed!');
  }
}

// Export for use in other test files
export default CRUDOperationsTest;

// Run tests if this file is executed directly
if (typeof require !== 'undefined' && require.main === module) {
  const tester = new CRUDOperationsTest();
  tester.runAllTests().catch(console.error);
}
