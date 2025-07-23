/**
 * For a detailed explanation regarding each configuration property, visit:
 * https://jestjs.io/docs/configuration
 */

import type {Config} from 'jest';

const config: Config = {
  clearMocks: true,
  collectCoverage: true,
  coverageDirectory: "coverage",
  coverageProvider: "v8",
  testEnvironment: "node",
  testEnvironmentOptions: {
    env: {
      NODE_ENV: "test"
    }
  },
  moduleFileExtensions: [
    "js",
    "ts",
  ],
  rootDir: '.',
  roots: [
    "<rootDir>"
  ],
  preset: 'ts-jest',
  testMatch: [
    "**/*.test.ts"
  ],
  transform: {
    "^.+\\.ts$": "ts-jest"
  }
};

export default config;
