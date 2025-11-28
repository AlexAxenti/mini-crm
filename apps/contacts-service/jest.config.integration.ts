import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testRegex: '.*\.integration-spec\.ts$',
  transform: {
    '^.+\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: ['src/**/*.(t|j)s', '!src/**/*.spec.ts'],
  coverageDirectory: './coverage',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@mini-crm/shared(.*)$': '<rootDir>/../../packages/shared/src$1',
  },
  setupFilesAfterEnv: ['<rootDir>/test/setup.integration.ts'],
  testTimeout: 30000,
  maxConcurrency: 1, // Run tests sequentially to avoid database conflicts
};

export default config;