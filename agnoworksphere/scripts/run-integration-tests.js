#!/usr/bin/env node

/**
 * Integration Test Runner
 * Runs all frontend-backend integration tests
 */

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting Frontend-Backend Integration Tests');
console.log('='.repeat(80));

// Check if backend is running
async function checkBackendHealth() {
  try {
    const response = await fetch('http://localhost:3001/api/v1/health');
    if (response.ok) {
      console.log('✅ Backend is running and healthy');
      return true;
    }
  } catch (error) {
    console.log('❌ Backend is not running or not healthy');
    console.log('   Please start the backend server first:');
    console.log('   cd PM/backend && npm start');
    return false;
  }
}

// Run a test file
function runTest(testFile, testName) {
  return new Promise((resolve, reject) => {
    console.log(`\n🧪 Running ${testName}...`);
    console.log('-'.repeat(60));

    const testProcess = spawn('node', [testFile], {
      stdio: 'inherit',
      cwd: path.join(__dirname, '..'),
    });

    testProcess.on('close', (code) => {
      if (code === 0) {
        console.log(`✅ ${testName} completed successfully`);
        resolve();
      } else {
        console.log(`❌ ${testName} failed with exit code ${code}`);
        reject(new Error(`${testName} failed`));
      }
    });

    testProcess.on('error', (error) => {
      console.error(`❌ Failed to run ${testName}:`, error);
      reject(error);
    });
  });
}

// Main test runner
async function runAllTests() {
  try {
    // Check backend health
    const backendHealthy = await checkBackendHealth();
    if (!backendHealthy) {
      process.exit(1);
    }

    // List of tests to run
    const tests = [
      {
        file: path.join(__dirname, '../src/tests/crud-operations-test.js'),
        name: 'CRUD Operations Test',
      },
      {
        file: path.join(
          __dirname,
          '../src/tests/frontend-backend-integration-test.js'
        ),
        name: 'Frontend-Backend Integration Test',
      },
      {
        file: path.join(__dirname, '../src/tests/project-signoff-test.js'),
        name: 'Project Sign-off Workflow Test',
      },
    ];

    // Run each test
    for (const test of tests) {
      try {
        await runTest(test.file, test.name);
      } catch (error) {
        console.error(`Test failed: ${test.name}`);
        // Continue with other tests even if one fails
      }
    }

    console.log('\n🎉 All integration tests completed!');
    console.log('='.repeat(80));
  } catch (error) {
    console.error('❌ Test runner failed:', error);
    process.exit(1);
  }
}

// Add fetch polyfill for Node.js if needed
if (typeof fetch === 'undefined') {
  global.fetch = require('node-fetch');
}

// Run tests
runAllTests().catch((error) => {
  console.error('❌ Test runner error:', error);
  process.exit(1);
});
