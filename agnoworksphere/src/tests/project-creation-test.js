/**
 * Project Creation Test
 * Tests the regular project creation endpoint with proper error handling
 */

import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

class ProjectCreationTest {
  constructor() {
    this.testUser = null;
    this.organizationId = null;
  }

  // Setup test user and organization
  async setupTest() {
    const timestamp = Date.now();
    
    try {
      // Create test user
      const userData = {
        email: `project_test_${timestamp}@test.com`,
        password: 'TestPassword123!',
        first_name: 'Project',
        last_name: 'Tester',
      };

      await axios.post(`${API_BASE_URL}/api/v1/auth/register`, userData);
      const loginResponse = await axios.post(`${API_BASE_URL}/api/v1/auth/login`, {
        email: userData.email,
        password: userData.password,
      });

      this.testUser = {
        ...userData,
        token: loginResponse.data.data.tokens.access_token,
        userId: loginResponse.data.data.user.id,
      };

      // Create organization
      const orgResponse = await axios.post(
        `${API_BASE_URL}/api/v1/organizations`,
        {
          name: `Project Test Org ${timestamp}`,
          description: 'Test organization for project creation testing',
        },
        {
          headers: {
            'Authorization': `Bearer ${this.testUser.token}`,
            'Content-Type': 'application/json',
          }
        }
      );

      this.organizationId = orgResponse.data.data.id;
      console.log('✅ Test setup completed successfully');
      return true;
    } catch (error) {
      console.error('❌ Test setup failed:', error.response?.data || error.message);
      return false;
    }
  }

  // Test regular project creation
  async testRegularProjectCreation() {
    console.log('\n📝 Testing Regular Project Creation');
    console.log('='.repeat(60));

    try {
      const projectData = {
        name: 'Test Project',
        description: 'A test project for validation',
        status: 'active',
        priority: 'medium',
        start_date: '2024-01-01',
        due_date: '2024-12-31'
      };

      const response = await axios.post(
        `${API_BASE_URL}/api/v1/projects?organization_id=${this.organizationId}`,
        projectData,
        {
          headers: {
            'Authorization': `Bearer ${this.testUser.token}`,
            'Content-Type': 'application/json',
          }
        }
      );

      if (response.data) {
        console.log('✅ Regular project created successfully');
        console.log('Project ID:', response.data.data?.id || response.data.id || 'Unknown');
        return true;
      }
    } catch (error) {
      console.error('❌ Regular project creation failed:');
      
      if (error.response?.data?.detail) {
        if (Array.isArray(error.response.data.detail)) {
          // FastAPI validation errors
          error.response.data.detail.forEach(err => {
            console.error(`  - ${err.loc?.join('.')}: ${err.msg}`);
          });
        } else {
          console.error(`  - ${error.response.data.detail}`);
        }
      } else {
        console.error(`  - ${error.message}`);
      }
      return false;
    }
  }

  // Test project creation with missing required fields
  async testInvalidProjectCreation() {
    console.log('\n❌ Testing Project Creation with Missing Fields');
    console.log('='.repeat(60));

    try {
      const invalidProjectData = {
        // Missing required field: name
        description: 'Project without a name',
      };

      const response = await axios.post(
        `${API_BASE_URL}/api/v1/projects?organization_id=${this.organizationId}`,
        invalidProjectData,
        {
          headers: {
            'Authorization': `Bearer ${this.testUser.token}`,
            'Content-Type': 'application/json',
          }
        }
      );

      console.log('❌ Invalid project creation should have failed but succeeded');
      return false;
    } catch (error) {
      console.log('✅ Invalid project creation correctly failed with validation errors:');
      
      if (error.response?.data?.detail && Array.isArray(error.response.data.detail)) {
        error.response.data.detail.forEach(err => {
          console.log(`  - ${err.loc?.join('.')}: ${err.msg}`);
        });
      } else {
        console.log(`  - ${error.response?.data?.detail || error.message}`);
      }
      return true;
    }
  }

  // Test project creation without organization access
  async testUnauthorizedProjectCreation() {
    console.log('\n🚫 Testing Project Creation without Organization Access');
    console.log('='.repeat(60));

    try {
      const projectData = {
        name: 'Unauthorized Test Project',
        description: 'This should fail due to lack of organization access',
      };

      // Use a fake organization ID
      const fakeOrgId = '00000000-0000-0000-0000-000000000000';

      const response = await axios.post(
        `${API_BASE_URL}/api/v1/projects?organization_id=${fakeOrgId}`,
        projectData,
        {
          headers: {
            'Authorization': `Bearer ${this.testUser.token}`,
            'Content-Type': 'application/json',
          }
        }
      );

      console.log('❌ Unauthorized project creation should have failed but succeeded');
      return false;
    } catch (error) {
      console.log('✅ Unauthorized project creation correctly failed:');
      console.log(`  - ${error.response?.data?.detail || error.message}`);
      return true;
    }
  }

  // Run all tests
  async runAllTests() {
    console.log('🚀 Starting Project Creation Tests');
    console.log('='.repeat(80));

    const setupSuccess = await this.setupTest();
    if (!setupSuccess) {
      console.log('❌ Test setup failed, aborting tests');
      return;
    }

    await this.testRegularProjectCreation();
    await this.testInvalidProjectCreation();
    await this.testUnauthorizedProjectCreation();

    console.log('\n✅ All project creation tests completed!');
    console.log('='.repeat(80));
  }
}

// Export for use in other test files
export default ProjectCreationTest;

// Run tests if this file is executed directly
if (typeof require !== 'undefined' && require.main === module) {
  const tester = new ProjectCreationTest();
  tester.runAllTests().catch(console.error);
}
