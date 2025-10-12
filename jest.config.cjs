module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    roots: [ '<rootDir>/tests', '<rootDir>/src' ],
    testMatch: [ '**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts' ],
    transform: {
        '^.+\\.ts$': 'ts-jest',
    },
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
    },
    collectCoverageFrom: [
        'src/**/*.ts',
        '!src/**/*.d.ts',
        '!src/**/*.test.ts',
        '!src/**/*.spec.ts',
    ],
    coverageDirectory: 'coverage',
    coverageReporters: [ 'text', 'lcov', 'html' ],
    setupFilesAfterEnv: [ '<rootDir>/tests/setup.ts' ],
    moduleFileExtensions: [ 'ts', 'tsx', 'js', 'jsx', 'json', 'node' ],
    testTimeout: 10000,
    globals: {
        'ts-jest': {
            tsconfig: {
                esModuleInterop: true,
            },
        },
    },
};