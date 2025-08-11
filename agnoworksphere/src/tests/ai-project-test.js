/**
 * AI Project Creation Test
 * Tests the AI project creation endpoint with proper error handling
 */

import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

class AIProjectTest {
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
        email: `ai_test_${timestamp}@test.com`,
        password: 'TestPassword123!',
        first_name: 'AI',
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
          name: `AI Test Org ${timestamp}`,
          description: 'Test organization for AI project testing',
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

  // Test AI project creation with minimal data
  async testMinimalAIProject() {
    console.log('\n🤖 Testing AI Project Creation with Minimal Data');
    console.log('='.repeat(60));

    try {
      const projectData = {
        name: 'Test AI Project',
        description: 'A test project created with AI',
        organization_id: this.organizationId,
        generated_tasks: [
          {
            title: 'Setup Project',
            description: 'Initialize the project structure',
            priority: 'high',
            estimated_hours: 4
          },
          {
            title: 'Implement Core Features',
            description: 'Build the main functionality',
            priority: 'medium',
            estimated_hours: 8
          }
        ],
        configuration: {
          project_type: 'web_application',
          team_size: 3
        },
        tech_stack: {
          frontend: 'React',
          backend: 'FastAPI',
          database: 'PostgreSQL'
        },
        workflow: {
          methodology: 'agile',
          sprint_duration: 2
        }
      };

      const response = await axios.post(
        `${API_BASE_URL}/api/v1/ai-projects/ai-create-simple`,
        projectData,
        {
          headers: {
            'Authorization': `Bearer ${this.testUser.token}`,
            'Content-Type': 'application/json',
          }
        }
      );

      if (response.data) {
        console.log('✅ AI project created successfully');
        console.log('Project ID:', response.data.data?.id || 'Unknown');
        return true;
      }
    } catch (error) {
      console.error('❌ AI project creation failed:');
      
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

  // Test AI project creation with missing required fields
  async testInvalidAIProject() {
    console.log('\n❌ Testing AI Project Creation with Missing Fields');
    console.log('='.repeat(60));

    try {
      const invalidProjectData = {
        name: 'Invalid Test Project',
        // Missing required fields: description, organization_id, generated_tasks
      };

      const response = await axios.post(
        `${API_BASE_URL}/api/v1/ai-projects/ai-create-simple`,
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

  // Run all tests
  async runAllTests() {
    console.log('🚀 Starting AI Project Creation Tests');
    console.log('='.repeat(80));

    const setupSuccess = await this.setupTest();
    if (!setupSuccess) {
      console.log('❌ Test setup failed, aborting tests');
      return;
    }

    await this.testMinimalAIProject();
    await this.testInvalidAIProject();

    console.log('\n✅ All AI project creation tests completed!');
    console.log('='.repeat(80));
  }
}

// Export for use in other test files
export default AIProjectTest;

// Run tests if this file is executed directly
if (typeof require !== 'undefined' && require.main === module) {
  const tester = new AIProjectTest();
  tester.runAllTests().catch(console.error);
}
