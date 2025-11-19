// jest.config.js (The modern way to configure ts-jest)

module.exports = {
  // REMOVE: preset: 'ts-jest', 
  
  testEnvironment: 'node',
  rootDir: './',
  testMatch: ['<rootDir>/tests/**/*.test.ts'],
  moduleFileExtensions: ['ts', 'js'],
  
  // *** NEW MODERN CONFIGURATION ***
  transform: {
    // Tells Jest to use ts-jest for all .ts files
    '^.+\\.ts$': [
        'ts-jest', 
        { 
            // Ensures modules are compiled to CommonJS for Node.js compatibility
            tsconfig: 'tsconfig.json',
            isolatedModules: true, 
        }
    ],
  },
  // REMOVE the 'globals' block entirely
};