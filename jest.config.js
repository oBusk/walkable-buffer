'use strict';
const semver = require('semver');

function getSupportedTypescriptTarget() {
    if (process.argv.includes('--debuggable')) {
        // If run with `--debuggable` we run in the latest available TS target to make asynchrounous methods steppable

        const nodeVersion = process.versions.node;

        if (semver.gte(nodeVersion, '10.0.0')) {
            return 'es2018';
        } else if (semver.gte(nodeVersion, '7.6.0')) {
            return 'es2017';
        } else if (semver.gte(nodeVersion, '7.0.0')) {
            return 'es2016';
        }
    }

    return 'es2015';
}

module.exports = {
    testEnvironment: 'node',
    testURL: 'http://localhost',
    preset: 'ts-jest',
    collectCoverageFrom: [
        'src/**/*.{t,j}s?(x)',
        '!src/**/*.d.ts',
    ],
    globals: {
        'ts-jest': {
            tsConfig: {
                target: getSupportedTypescriptTarget(),
            }
        }
    }
};
