export default {
  testEnvironment: 'node',
  transform: {},
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  testTimeout: 30000,
  // Add these for ESM support
  transformIgnorePatterns: [],
  moduleFileExtensions: ['js', 'mjs'],
}; 