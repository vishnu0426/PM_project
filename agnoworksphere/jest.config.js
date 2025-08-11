/**
 * Jest Configuration for AgnoWorkSphere
 * Comprehensive testing setup for React components and utilities
 */

export default {
  // Test environment
  testEnvironment: 'jsdom',

  // Setup files
  setupFilesAfterEnv: ['<rootDir>/test/setup.js'],

  // Module name mapping for path aliases
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@components/(.*)$': '<rootDir>/src/components/$1',
    '^@utils/(.*)$': '<rootDir>/src/utils/$1',
    '^@hooks/(.*)$': '<rootDir>/src/hooks/$1',
    '^@styles/(.*)$': '<rootDir>/src/styles/$1',
    '^@assets/(.*)$': '<rootDir>/src/assets/$1',
  },

  // File extensions to consider
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx', 'json', 'node'],

  // Transform files
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': [
      'babel-jest',
      {
        presets: [
          ['@babel/preset-env', { targets: { node: 'current' } }],
          ['@babel/preset-react', { runtime: 'automatic' }],
          '@babel/preset-typescript',
        ],
        plugins: [
          '@babel/plugin-proposal-class-properties',
          '@babel/plugin-transform-runtime',
        ],
      },
    ],
    '^.+\\.css$': 'jest-transform-css',
    '^(?!.*\\.(js|jsx|ts|tsx|css|json)$)': 'jest-transform-file',
  },

  // Transform ignore patterns
  transformIgnorePatterns: [
    'node_modules/(?!(react-dnd|dnd-core|@react-dnd|react-dnd-html5-backend)/)',
  ],

  // Test match patterns
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.{js,jsx,ts,tsx}',
    '<rootDir>/src/**/*.{test,spec}.{js,jsx,ts,tsx}',
  ],

  // Files to ignore
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/build/',
    '<rootDir>/dist/',
  ],

  // Coverage configuration
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/index.js',
    '!src/reportWebVitals.js',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
    '!src/**/__tests__/**',
    '!src/**/*.test.{js,jsx,ts,tsx}',
    '!src/**/*.spec.{js,jsx,ts,tsx}',
  ],

  // Coverage thresholds
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
    // Specific thresholds for critical components
    'src/components/project/': {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
    'src/utils/': {
      branches: 85,
      functions: 85,
      lines: 85,
      statements: 85,
    },
  },

  // Coverage reporters
  coverageReporters: ['text', 'text-summary', 'html', 'lcov', 'clover'],

  // Coverage directory
  coverageDirectory: '<rootDir>/coverage',

  // Module directories
  moduleDirectories: ['node_modules', '<rootDir>/src'],

  // Global variables
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.json',
    },
  },

  // Test timeout
  testTimeout: 10000,

  // Verbose output
  verbose: true,

  // Clear mocks between tests
  clearMocks: true,

  // Restore mocks after each test
  restoreMocks: true,

  // Error on deprecated features
  errorOnDeprecated: true,

  // Notify mode
  notify: false,

  // Watch plugins
  watchPlugins: [
    'jest-watch-typeahead/filename',
    'jest-watch-typeahead/testname',
  ],

  // Reporters
  reporters: [
    'default',
    [
      'jest-junit',
      {
        outputDirectory: '<rootDir>/test-results',
        outputName: 'junit.xml',
        classNameTemplate: '{classname}',
        titleTemplate: '{title}',
        ancestorSeparator: ' › ',
        usePathForSuiteName: true,
      },
    ],
  ],

  // Test results processor
  testResultsProcessor: 'jest-sonar-reporter',

  // Max workers
  maxWorkers: '50%',

  // Cache directory
  cacheDirectory: '<rootDir>/.jest-cache',

  // Preset
  preset: undefined,

  // Projects (for multi-project setup)
  projects: undefined,

  // Runner
  runner: 'jest-runner',

  // Test sequences
  testSequencer: '@jest/test-sequencer',

  // Snapshot serializers
  snapshotSerializers: ['enzyme-to-json/serializer'],

  // Unmocked module path patterns
  unmockedModulePathPatterns: undefined,

  // Watch path ignore patterns
  watchPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/build/',
    '<rootDir>/dist/',
    '<rootDir>/coverage/',
  ],

  // Force exit
  forceExit: false,

  // Detect open handles
  detectOpenHandles: true,

  // Detect leaks
  detectLeaks: false,

  // Bail on first failure
  bail: false,

  // Fail fast
  passWithNoTests: true,

  // Silent
  silent: false,

  // Log heap usage
  logHeapUsage: false,

  // Max concurrency
  maxConcurrency: 5,

  // Random seed
  randomize: false,

  // Roots
  roots: ['<rootDir>/src'],

  // Test name pattern
  testNamePattern: undefined,

  // Test regex
  testRegex: undefined,

  // Test runner
  testRunner: 'jest-circus/runner',

  // Test URL
  testURL: 'http://localhost',

  // Timer
  timers: 'real',

  // Update snapshot
  updateSnapshot: false,

  // Use stderr
  useStderr: false,

  // Watch
  watch: false,

  // Watch all
  watchAll: false,
};
