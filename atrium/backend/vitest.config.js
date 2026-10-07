'use strict';

const { defineConfig } = require('vitest/config');

module.exports = defineConfig({
  test: {
    environment: 'node',
    globals: true,
    fileParallelism: false,
    sequence: { concurrent: false },
    hookTimeout: 60000,
    testTimeout: 30000,
  },
});
