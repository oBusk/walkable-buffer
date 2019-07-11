'use strict';

module.exports = {
    testEnvironment: 'node',
    preset: 'ts-jest',
    collectCoverageFrom: [
        'src/**/*.{t,j}s?(x)',
        '!src/**/*.d.ts',
    ],
};
