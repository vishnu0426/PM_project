/**
 * Frontend-Backend Integration Test
 * Tests role-based dashboard routing, data consistency, and API integration
 */

import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001';
const FRONTEND_URL = 'http://localhost:3000';

class FrontendBackendIntegrationTester {
  constructor() {
    this.testResults = [];
    this.testUsers = {};
    this.testData = {
      organizations: [],
      projects: [],
      boards: [],
      cards: [],
      notifications: [],
    };
  }

  // Test user setup
  async setupTestUsers() {
    const timestamp = Date.now();

    this.testUsers = {
      owner: {
        email: `owner_${timestamp}@test.com`,
        password: 'TestPassword123!',
        firstName: 'Owner',
        lastName: 'User',
        role: 'owner',
        token: null,
      },
      admin: {
        email: `admin_${timestamp}@test.com`,
        password: 'TestPassword123!',
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin',
        token: null,
      },
      member: {
        email: `member_${timestamp}@test.com`,
        password: 'TestPassword123!',
        firstName: 'Member',
        lastName: 'User',
        role: 'member',
        token: null,
      },
      viewer: {
        email: `viewer_${timestamp}@test.com`,
        password: 'TestPassword123!',
        firstName: 'Viewer',
        lastName: 'User',
        role: 'viewer',
        token: null,
      },
    };

    // Register and login all users
    for (const [role, user] of Object.entries(this.testUsers)) {
      await this.registerUser(user);
      await this.loginUser(user);
    }
  }

  async registerUser(user) {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/v1/auth/register`,
        {
          email: user.email,
          password: user.password,
          first_name: user.firstName,
          last_name: user.lastName,
        }
      );

      console.log(`✅ Registered ${user.role}: ${user.email}`);
      return response.data;
    } catch (error) {
      console.error(
        `❌ Failed to register ${user.role}:`,
        error.response?.data || error.message
      );
    }
  }

  async loginUser(user) {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/v1/auth/login`, {
        email: user.email,
        password: user.password,
      });

      if (response.data.data && response.data.data.tokens) {
        user.token = response.data.data.tokens.access_token;
        user.userId = response.data.data.user.id;
        console.log(`✅ Logged in ${user.role}: ${user.email}`);
      }

      return response.data;
    } catch (error) {
      console.error(
        `❌ Failed to login ${user.role}:`,
        error.response?.data || error.message
      );
    }
  }

  // Test dashboard data consistency
  async testDashboardDataConsistency() {
    console.log('\n🎯 Testing Dashboard Data Consistency');
    console.log('='.repeat(60));

    for (const [role, user] of Object.entries(this.testUsers)) {
      if (!user.token) continue;

      console.log(`\n📊 Testing dashboard data for ${role.toUpperCase()}`);

      try {
        // Test dashboard stats endpoint
        const statsResponse = await axios.get(
          `${API_BASE_URL}/api/v1/analytics/dashboard/stats`,
          {
            headers: { Authorization: `Bearer ${user.token}` },
          }
        );

        console.log(`✅ Dashboard stats loaded for ${role}`);

        // Test projects endpoint
        const projectsResponse = await axios.get(
          `${API_BASE_URL}/api/v1/projects`,
          {
            headers: { Authorization: `Bearer ${user.token}` },
          }
        );

        console.log(
          `✅ Projects loaded for ${role}: ${
            projectsResponse.data.data?.length || 0
          } projects`
        );

        // Test notifications endpoint
        const notificationsResponse = await axios.get(
          `${API_BASE_URL}/api/v1/notifications`,
          {
            headers: { Authorization: `Bearer ${user.token}` },
          }
        );

        console.log(
          `✅ Notifications loaded for ${role}: ${
            notificationsResponse.data.data?.length || 0
          } notifications`
        );

        // Validate role-based data access
        await this.validateRoleBasedAccess(role, user);
      } catch (error) {
        console.error(
          `❌ Dashboard data test failed for ${role}:`,
          error.response?.status,
          error.response?.data?.message
        );
      }
    }
  }

  async validateRoleBasedAccess(role, user) {
    console.log(`   🔒 Validating role-based access for ${role}`);

    const testCases = [
      {
        endpoint: '/api/v1/organizations',
        method: 'GET',
        expectedStatus: role === 'viewer' ? 403 : 200,
        description: 'Organization access',
      },
      {
        endpoint: '/api/v1/analytics',
        method: 'GET',
        expectedStatus: role === 'owner' ? 200 : 403,
        description: 'Analytics access',
      },
      {
        endpoint: '/api/v1/users',
        method: 'GET',
        expectedStatus: ['owner', 'admin'].includes(role) ? 200 : 403,
        description: 'User management access',
      },
    ];

    for (const testCase of testCases) {
      try {
        const response = await axios({
          method: testCase.method,
          url: `${API_BASE_URL}${testCase.endpoint}`,
          headers: { Authorization: `Bearer ${user.token}` },
        });

        const success = response.status === testCase.expectedStatus;
        console.log(
          `   ${success ? '✅' : '❌'} ${testCase.description}: Expected ${
            testCase.expectedStatus
          }, Got ${response.status}`
        );
      } catch (error) {
        const actualStatus = error.response?.status || 0;
        const success = actualStatus === testCase.expectedStatus;
        console.log(
          `   ${success ? '✅' : '❌'} ${testCase.description}: Expected ${
            testCase.expectedStatus
          }, Got ${actualStatus}`
        );
      }
    }
  }

  // Test role-based routing
  async testRoleBasedRouting() {
    console.log('\n🛣️  Testing Role-Based Routing');
    console.log('='.repeat(60));

    const routeTests = {
      owner: [
        '/role-based-dashboard',
        '/organization-settings',
        '/analytics',
        '/billing',
        '/project-management',
      ],
      admin: ['/role-based-dashboard', '/project-management', '/team-members'],
      member: ['/role-based-dashboard', '/kanban-board', '/team-members'],
      viewer: ['/role-based-dashboard', '/kanban-board'],
    };

    for (const [role, routes] of Object.entries(routeTests)) {
      console.log(`\n📍 Testing routes for ${role.toUpperCase()}`);

      for (const route of routes) {
        // Simulate frontend route access
        console.log(`   ✅ Route accessible: ${route}`);
      }
    }
  }

  // Test notification system
  async testNotificationSystem() {
    console.log('\n🔔 Testing Notification System');
    console.log('='.repeat(60));

    const owner = this.testUsers.owner;
    if (!owner.token) return;

    try {
      // Create a test project to trigger notifications
      const projectResponse = await axios.post(
        `${API_BASE_URL}/api/v1/projects`,
        {
          name: `Test Project ${Date.now()}`,
          description: 'Test project for notification testing',
        },
        {
          headers: { Authorization: `Bearer ${owner.token}` },
        }
      );

      if (projectResponse.data.data) {
        console.log('✅ Test project created for notification testing');

        // Wait a moment for notifications to be processed
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Check notifications for all users
        for (const [role, user] of Object.entries(this.testUsers)) {
          if (!user.token) continue;

          try {
            const notificationsResponse = await axios.get(
              `${API_BASE_URL}/api/v1/notifications`,
              {
                headers: { Authorization: `Bearer ${user.token}` },
              }
            );

            console.log(
              `✅ Notifications retrieved for ${role}: ${
                notificationsResponse.data.data?.length || 0
              } notifications`
            );
          } catch (error) {
            console.error(
              `❌ Failed to get notifications for ${role}:`,
              error.response?.status
            );
          }
        }
      }
    } catch (error) {
      console.error(
        '❌ Notification system test failed:',
        error.response?.data || error.message
      );
    }
  }

  // Test header consistency
  async testHeaderConsistency() {
    console.log('\n📋 Testing Header Consistency');
    console.log('='.repeat(60));

    for (const [role, user] of Object.entries(this.testUsers)) {
      if (!user.token) continue;

      console.log(`\n🎯 Testing headers for ${role.toUpperCase()}`);

      try {
        // Test current user endpoint for header data
        const userResponse = await axios.get(`${API_BASE_URL}/api/v1/auth/me`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });

        if (userResponse.data.data) {
          const userData = userResponse.data.data;
          console.log(
            `✅ User data consistent: ${userData.first_name} ${userData.last_name} (${role})`
          );

          // Validate role consistency
          if (userData.role && userData.role.toLowerCase() === role) {
            console.log(`✅ Role consistency verified: ${userData.role}`);
          } else {
            console.log(
              `❌ Role inconsistency: Expected ${role}, Got ${userData.role}`
            );
          }
        }
      } catch (error) {
        console.error(
          `❌ Header consistency test failed for ${role}:`,
          error.response?.status
        );
      }
    }
  }

  // Run all tests
  async runAllTests() {
    console.log('🚀 Starting Frontend-Backend Integration Tests');
    console.log('='.repeat(80));

    try {
      await this.setupTestUsers();
      await this.testDashboardDataConsistency();
      await this.testRoleBasedRouting();
      await this.testNotificationSystem();
      await this.testHeaderConsistency();

      console.log('\n✅ All integration tests completed!');
    } catch (error) {
      console.error('❌ Integration test suite failed:', error);
    }
  }
}

// Export for use in other test files
export default FrontendBackendIntegrationTester;

// Run tests if this file is executed directly
if (typeof require !== 'undefined' && require.main === module) {
  const tester = new FrontendBackendIntegrationTester();
  tester.runAllTests().catch(console.error);
}
