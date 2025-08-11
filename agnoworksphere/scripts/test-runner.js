#!/usr/bin/env node

/**
 * Comprehensive Test Runner for AgnoWorkSphere
 * Runs all tests with proper configuration and reporting
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Test configuration
const TEST_CONFIG = {
  // Test patterns
  patterns: {
    unit: 'src/**/*.test.{js,jsx}',
    integration: 'src/**/*.integration.test.{js,jsx}',
    e2e: 'cypress/integration/**/*.spec.js',
    component: 'src/components/**/*.test.{js,jsx}',
    utils: 'src/utils/**/*.test.{js,jsx}',
    hooks: 'src/hooks/**/*.test.{js,jsx}'
  },
  
  // Coverage thresholds
  coverage: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    },
    components: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    },
    utils: {
      branches: 85,
      functions: 85,
      lines: 85,
      statements: 85
    }
  },
  
  // Test environments
  environments: ['jsdom', 'node'],
  
  // Reporters
  reporters: ['default', 'jest-junit', 'jest-html-reporter']
};

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

// Utility functions
const log = (message, color = 'reset') => {
  console.log(`${colors[color]}${message}${colors.reset}`);
};

const logSection = (title) => {
  log('\n' + '='.repeat(60), 'cyan');
  log(`  ${title}`, 'bright');
  log('='.repeat(60), 'cyan');
};

const logSuccess = (message) => log(`✅ ${message}`, 'green');
const logError = (message) => log(`❌ ${message}`, 'red');
const logWarning = (message) => log(`⚠️  ${message}`, 'yellow');
const logInfo = (message) => log(`ℹ️  ${message}`, 'blue');

// Check if required dependencies are installed
const checkDependencies = () => {
  logSection('Checking Dependencies');
  
  const requiredDeps = [
    '@testing-library/react',
    '@testing-library/jest-dom',
    '@testing-library/user-event',
    'jest'
  ];
  
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const allDeps = { ...packageJson.dependencies, ...packageJson.devDependencies };
  
  const missing = requiredDeps.filter(dep => !allDeps[dep]);
  
  if (missing.length > 0) {
    logError(`Missing dependencies: ${missing.join(', ')}`);
    logInfo('Run: npm install --save-dev ' + missing.join(' '));
    return false;
  }
  
  logSuccess('All required dependencies are installed');
  return true;
};

// Run specific test suite
const runTests = (pattern, options = {}) => {
  return new Promise((resolve, reject) => {
    const args = [
      'test',
      '--testPathPattern=' + pattern,
      '--passWithNoTests',
      '--verbose'
    ];
    
    if (options.coverage) {
      args.push('--coverage');
    }
    
    if (options.watch) {
      args.push('--watch');
    }
    
    if (options.updateSnapshots) {
      args.push('--updateSnapshot');
    }
    
    if (options.bail) {
      args.push('--bail');
    }
    
    const child = spawn('npm', args, {
      stdio: 'inherit',
      shell: true
    });
    
    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Tests failed with exit code ${code}`));
      }
    });
    
    child.on('error', reject);
  });
};

// Generate test report
const generateReport = () => {
  logSection('Generating Test Report');
  
  const reportDir = path.join(process.cwd(), 'test-results');
  
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }
  
  const report = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'test',
    node_version: process.version,
    npm_version: process.env.npm_version,
    test_patterns: TEST_CONFIG.patterns,
    coverage_thresholds: TEST_CONFIG.coverage
  };
  
  fs.writeFileSync(
    path.join(reportDir, 'test-config.json'),
    JSON.stringify(report, null, 2)
  );
  
  logSuccess('Test report generated in test-results/');
};

// Main test runner
const runAllTests = async (options = {}) => {
  try {
    logSection('AgnoWorkSphere Test Suite');
    
    // Check dependencies
    if (!checkDependencies()) {
      process.exit(1);
    }
    
    // Run component tests
    logSection('Running Component Tests');
    await runTests(TEST_CONFIG.patterns.component, {
      coverage: options.coverage,
      bail: options.bail
    });
    logSuccess('Component tests passed');
    
    // Run utility tests
    logSection('Running Utility Tests');
    await runTests(TEST_CONFIG.patterns.utils, {
      coverage: options.coverage,
      bail: options.bail
    });
    logSuccess('Utility tests passed');
    
    // Run hook tests
    logSection('Running Hook Tests');
    await runTests(TEST_CONFIG.patterns.hooks, {
      coverage: options.coverage,
      bail: options.bail
    });
    logSuccess('Hook tests passed');
    
    // Run all unit tests
    logSection('Running All Unit Tests');
    await runTests(TEST_CONFIG.patterns.unit, {
      coverage: options.coverage,
      bail: options.bail
    });
    logSuccess('All unit tests passed');
    
    // Generate report
    generateReport();
    
    logSection('Test Suite Complete');
    logSuccess('All tests passed successfully! 🎉');
    
  } catch (error) {
    logError(`Test suite failed: ${error.message}`);
    process.exit(1);
  }
};

// CLI interface
const main = () => {
  const args = process.argv.slice(2);
  const options = {
    coverage: args.includes('--coverage'),
    watch: args.includes('--watch'),
    bail: args.includes('--bail'),
    updateSnapshots: args.includes('--updateSnapshot')
  };
  
  if (args.includes('--help') || args.includes('-h')) {
    log('AgnoWorkSphere Test Runner', 'bright');
    log('');
    log('Usage: node scripts/test-runner.js [options]', 'cyan');
    log('');
    log('Options:', 'yellow');
    log('  --coverage        Generate coverage report');
    log('  --watch          Watch for file changes');
    log('  --bail           Stop on first test failure');
    log('  --updateSnapshot Update snapshots');
    log('  --help, -h       Show this help message');
    log('');
    log('Examples:', 'yellow');
    log('  node scripts/test-runner.js --coverage');
    log('  node scripts/test-runner.js --watch');
    log('  node scripts/test-runner.js --bail --coverage');
    return;
  }
  
  if (args.includes('--watch')) {
    logInfo('Running tests in watch mode...');
    runTests('src/**/*.test.{js,jsx}', { watch: true });
  } else {
    runAllTests(options);
  }
};

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logError(`Uncaught exception: ${error.message}`);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logError(`Unhandled rejection at: ${promise}, reason: ${reason}`);
  process.exit(1);
});

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = {
  runAllTests,
  runTests,
  checkDependencies,
  generateReport,
  TEST_CONFIG
};
