/**
 * Project Sign-off Workflow Test
 * Tests the complete project sign-off system including data protection
 */

import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

class ProjectSignoffTest {
  constructor() {
    this.testResults = [];
    this.testUsers = {
      owner: null,
      member: null,
    };
    this.testData = {
      organizationId: null,
      projectId: null,
      boardId: null,
      columnId: null,
      cardId: null,
    };
  }

  // Setup test users with different roles
  async setupTestUsers() {
    const timestamp = Date.now();
    
    try {
      // Create owner user
      const ownerData = {
        email: `signoff_owner_${timestamp}@test.com`,
        password: 'TestPassword123!',
        first_name: 'Sign-off',
        last_name: 'Owner',
      };

      await axios.post(`${API_BASE_URL}/api/v1/auth/register`, ownerData);
      const ownerLogin = await axios.post(`${API_BASE_URL}/api/v1/auth/login`, {
        email: ownerData.email,
        password: ownerData.password,
      });

      this.testUsers.owner = {
        ...ownerData,
        token: ownerLogin.data.data.tokens.access_token,
        userId: ownerLogin.data.data.user.id,
      };

      // Create member user
      const memberData = {
        email: `signoff_member_${timestamp}@test.com`,
        password: 'TestPassword123!',
        first_name: 'Sign-off',
        last_name: 'Member',
      };

      await axios.post(`${API_BASE_URL}/api/v1/auth/register`, memberData);
      const memberLogin = await axios.post(`${API_BASE_URL}/api/v1/auth/login`, {
        email: memberData.email,
        password: memberData.password,
      });

      this.testUsers.member = {
        ...memberData,
        token: memberLogin.data.data.tokens.access_token,
        userId: memberLogin.data.data.user.id,
      };

      console.log('✅ Test users created successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to setup test users:', error.response?.data || error.message);
      return false;
    }
  }

  // Get auth headers for a specific user
  getAuthHeaders(userType = 'owner') {
    const user = this.testUsers[userType];
    return {
      'Authorization': `Bearer ${user.token}`,
      'Content-Type': 'application/json',
    };
  }

  // Setup test project structure
  async setupProjectStructure() {
    console.log('\n🏗️ Setting up project structure');
    console.log('='.repeat(60));

    try {
      // Create organization (as owner)
      const orgResponse = await axios.post(
        `${API_BASE_URL}/api/v1/organizations`,
        {
          name: `Sign-off Test Org ${Date.now()}`,
          description: 'Test organization for sign-off testing',
        },
        { headers: this.getAuthHeaders('owner') }
      );

      this.testData.organizationId = orgResponse.data.data.id;
      console.log('✅ Organization created');

      // Add member to organization
      await axios.post(
        `${API_BASE_URL}/api/v1/organizations/${this.testData.organizationId}/members`,
        {
          user_id: this.testUsers.member.userId,
          role: 'member',
        },
        { headers: this.getAuthHeaders('owner') }
      );
      console.log('✅ Member added to organization');

      // Create project
      const projectResponse = await axios.post(
        `${API_BASE_URL}/api/v1/projects`,
        {
          name: `Sign-off Test Project ${Date.now()}`,
          description: 'Test project for sign-off workflow',
          organization_id: this.testData.organizationId,
        },
        { headers: this.getAuthHeaders('owner') }
      );

      this.testData.projectId = projectResponse.data.data.id;
      console.log('✅ Project created');

      // Create board
      const boardResponse = await axios.post(
        `${API_BASE_URL}/api/v1/boards`,
        {
          name: `Test Board ${Date.now()}`,
          project_id: this.testData.projectId,
        },
        { headers: this.getAuthHeaders('owner') }
      );

      this.testData.boardId = boardResponse.data.data.id;
      console.log('✅ Board created');

      // Create column
      const columnResponse = await axios.post(
        `${API_BASE_URL}/api/v1/columns/${this.testData.boardId}/columns`,
        {
          name: `Test Column ${Date.now()}`,
          position: 0,
        },
        { headers: this.getAuthHeaders('owner') }
      );

      this.testData.columnId = columnResponse.data.data.id;
      console.log('✅ Column created');

      // Create card
      const cardResponse = await axios.post(
        `${API_BASE_URL}/api/v1/cards`,
        {
          title: `Test Card ${Date.now()}`,
          description: 'Test card for sign-off testing',
          column_id: this.testData.columnId,
          position: 0,
        },
        { headers: this.getAuthHeaders('member') }
      );

      this.testData.cardId = cardResponse.data.data.id;
      console.log('✅ Card created');

      return true;
    } catch (error) {
      console.error('❌ Failed to setup project structure:', error.response?.data || error.message);
      return false;
    }
  }

  // Test sign-off request workflow
  async testSignoffRequest() {
    console.log('\n📝 Testing Sign-off Request Workflow');
    console.log('='.repeat(60));

    try {
      // 1. Request sign-off (as member)
      const requestResponse = await axios.post(
        `${API_BASE_URL}/api/v1/project-signoff/${this.testData.projectId}/request-signoff`,
        {
          notes: 'Project completed, ready for review',
          reason: 'All tasks completed successfully',
        },
        { headers: this.getAuthHeaders('member') }
      );

      if (requestResponse.data.success) {
        console.log('✅ Sign-off request created successfully');
      }

      // 2. Check sign-off status
      const statusResponse = await axios.get(
        `${API_BASE_URL}/api/v1/project-signoff/${this.testData.projectId}/signoff-status`,
        { headers: this.getAuthHeaders('member') }
      );

      const status = statusResponse.data.data;
      if (status.sign_off_requested && status.data_protected) {
        console.log('✅ Sign-off status correct: requested and data protected');
      } else {
        console.log('❌ Sign-off status incorrect');
      }

      // 3. Check pending sign-offs (as owner)
      const pendingResponse = await axios.get(
        `${API_BASE_URL}/api/v1/project-signoff/pending-signoffs`,
        { headers: this.getAuthHeaders('owner') }
      );

      const pendingSignoffs = pendingResponse.data.data;
      if (pendingSignoffs.length > 0 && pendingSignoffs[0].project_id === this.testData.projectId) {
        console.log('✅ Pending sign-off appears in owner dashboard');
      } else {
        console.log('❌ Pending sign-off not found in owner dashboard');
      }

      return true;
    } catch (error) {
      console.error('❌ Sign-off request test failed:', error.response?.data || error.message);
      return false;
    }
  }

  // Test data protection functionality
  async testDataProtection() {
    console.log('\n🔒 Testing Data Protection');
    console.log('='.repeat(60));

    try {
      // 1. Try to delete card (should fail for member)
      try {
        await axios.delete(
          `${API_BASE_URL}/api/v1/cards/${this.testData.cardId}`,
          { headers: this.getAuthHeaders('member') }
        );
        console.log('❌ Card deletion should have failed but succeeded');
      } catch (error) {
        if (error.response?.status === 403) {
          console.log('✅ Card deletion correctly blocked for member');
        } else {
          console.log('❌ Unexpected error during card deletion:', error.response?.status);
        }
      }

      // 2. Try to delete board (should fail for member)
      try {
        await axios.delete(
          `${API_BASE_URL}/api/v1/boards/${this.testData.boardId}`,
          { headers: this.getAuthHeaders('member') }
        );
        console.log('❌ Board deletion should have failed but succeeded');
      } catch (error) {
        if (error.response?.status === 403) {
          console.log('✅ Board deletion correctly blocked for member');
        } else {
          console.log('❌ Unexpected error during board deletion:', error.response?.status);
        }
      }

      // 3. Try to delete column (should fail for member)
      try {
        await axios.delete(
          `${API_BASE_URL}/api/v1/columns/${this.testData.columnId}`,
          { headers: this.getAuthHeaders('member') }
        );
        console.log('❌ Column deletion should have failed but succeeded');
      } catch (error) {
        if (error.response?.status === 403) {
          console.log('✅ Column deletion correctly blocked for member');
        } else {
          console.log('❌ Unexpected error during column deletion:', error.response?.status);
        }
      }

      // 4. Try to delete as owner (should also fail due to pending sign-off)
      try {
        await axios.delete(
          `${API_BASE_URL}/api/v1/cards/${this.testData.cardId}`,
          { headers: this.getAuthHeaders('owner') }
        );
        console.log('❌ Card deletion should have failed for owner with pending sign-off');
      } catch (error) {
        if (error.response?.status === 403) {
          console.log('✅ Card deletion correctly blocked for owner with pending sign-off');
        } else {
          console.log('❌ Unexpected error during owner card deletion:', error.response?.status);
        }
      }

      return true;
    } catch (error) {
      console.error('❌ Data protection test failed:', error.response?.data || error.message);
      return false;
    }
  }

  // Test sign-off approval workflow
  async testSignoffApproval() {
    console.log('\n✅ Testing Sign-off Approval Workflow');
    console.log('='.repeat(60));

    try {
      // 1. Approve sign-off (as owner)
      const approvalResponse = await axios.post(
        `${API_BASE_URL}/api/v1/project-signoff/${this.testData.projectId}/approve-signoff`,
        {
          approved: true,
          notes: 'Project approved, excellent work!',
          unprotect_data: true, // Remove data protection
        },
        { headers: this.getAuthHeaders('owner') }
      );

      if (approvalResponse.data.success) {
        console.log('✅ Sign-off approved successfully');
      }

      // 2. Check updated sign-off status
      const statusResponse = await axios.get(
        `${API_BASE_URL}/api/v1/project-signoff/${this.testData.projectId}/signoff-status`,
        { headers: this.getAuthHeaders('member') }
      );

      const status = statusResponse.data.data;
      if (status.sign_off_approved && !status.data_protected) {
        console.log('✅ Sign-off status correct: approved and data unprotected');
      } else {
        console.log('❌ Sign-off status incorrect after approval');
      }

      // 3. Test that data can now be deleted
      const deleteResponse = await axios.delete(
        `${API_BASE_URL}/api/v1/cards/${this.testData.cardId}`,
        { headers: this.getAuthHeaders('member') }
      );

      if (deleteResponse.data.success) {
        console.log('✅ Card deletion now allowed after sign-off approval');
      }

      return true;
    } catch (error) {
      console.error('❌ Sign-off approval test failed:', error.response?.data || error.message);
      return false;
    }
  }

  // Run all sign-off tests
  async runAllTests() {
    console.log('🚀 Starting Project Sign-off Workflow Tests');
    console.log('='.repeat(80));

    const setupSuccess = await this.setupTestUsers();
    if (!setupSuccess) {
      console.log('❌ Test setup failed, aborting tests');
      return;
    }

    const structureSuccess = await this.setupProjectStructure();
    if (!structureSuccess) {
      console.log('❌ Project structure setup failed, aborting tests');
      return;
    }

    await this.testSignoffRequest();
    await this.testDataProtection();
    await this.testSignoffApproval();

    console.log('\n✅ All project sign-off workflow tests completed!');
    console.log('='.repeat(80));
  }
}

// Export for use in other test files
export default ProjectSignoffTest;

// Run tests if this file is executed directly
if (typeof require !== 'undefined' && require.main === module) {
  const tester = new ProjectSignoffTest();
  tester.runAllTests().catch(console.error);
}
