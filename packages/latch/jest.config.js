module.exports = {
    testEnvironment: 'jest-environment-jsdom',
    setupFilesAfterEnv: ['<rootDir>/src/test/setupTests.ts'],
    moduleNameMapper: {
        '\\.(css|less)$': 'identity-obj-proxy',
    },
    testMatch: ['<rootDir>/src/**/*.test.{ts,tsx}'],
    transform: {
        '^.+\\.(t|j)sx?$': 'babel-jest',
    },
    collectCoverageFrom: [
        'src/**/*.{ts,tsx}',
        '!src/index.tsx',
        '!src/**/*.d.ts',
        '!src/data/generated/**',
        '!src/test/**',
    ],
    coverageDirectory: '<rootDir>/coverage',
};
