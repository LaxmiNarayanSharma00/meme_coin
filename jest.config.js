

module.exports = {

  
  testEnvironment: 'node',
  rootDir: './',
  testMatch: ['<rootDir>/tests/**/*.test.ts'],
  moduleFileExtensions: ['ts', 'js'],
  

  transform: {

    '^.+\\.ts$': [
        'ts-jest', 
        { 

            tsconfig: 'tsconfig.json',
            isolatedModules: true, 
        }
    ],
  },

};