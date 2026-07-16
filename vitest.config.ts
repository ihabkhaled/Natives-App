import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

const perFileThreshold = {
  statements: 95,
  branches: 95,
  functions: 95,
  lines: 95,
} as const;

const pureFileThreshold = {
  statements: 100,
  branches: 100,
  functions: 100,
  lines: 100,
} as const;

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    globals: false,
    coverage: {
      provider: 'v8',
      all: true,
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/main.tsx',
        'src/vite-env.d.ts',
        'src/tests/**',
        'src/**/*.test.{ts,tsx}',
        'src/**/*.types.ts',
        'src/**/*.interfaces.ts',
        'src/**/index.ts',
      ],
      reporter: ['text', 'html', 'lcov', 'json', 'json-summary'],
      reportsDirectory: 'coverage',
      thresholds: {
        perFile: true,
        ...perFileThreshold,
        '**/*.helper.ts': { ...pureFileThreshold },
        '**/*.utils.ts': { ...pureFileThreshold },
        '**/*.mapper.ts': { ...pureFileThreshold },
        '**/*.schema.ts': { ...pureFileThreshold },
        '**/*.keys.ts': { ...pureFileThreshold },
        '**/*.paths.ts': { ...pureFileThreshold },
        '**/*.selectors.ts': { ...pureFileThreshold },
        '**/*.migrations.ts': { ...pureFileThreshold },
        '**/*.parser.ts': { ...pureFileThreshold },
      },
    },
    projects: [
      {
        extends: true,
        test: {
          name: 'unit',
          environment: 'jsdom',
          include: ['src/**/*.test.{ts,tsx}', 'tests/unit/**/*.test.{ts,tsx}'],
          setupFiles: ['tests/setup/testing-library.setup.ts'],
        },
      },
      {
        extends: true,
        test: {
          name: 'integration',
          environment: 'jsdom',
          include: ['tests/integration/**/*.test.{ts,tsx}'],
          setupFiles: ['tests/setup/testing-library.setup.ts', 'tests/setup/msw-server.setup.ts'],
        },
      },
      {
        extends: true,
        test: {
          name: 'contract',
          environment: 'node',
          include: ['tests/contract/**/*.test.ts'],
          setupFiles: ['tests/setup/msw-server.setup.ts'],
        },
      },
      {
        extends: true,
        test: {
          name: 'architecture-plugin',
          environment: 'node',
          include: ['eslint/architecture-plugin/tests/**/*.test.mjs'],
        },
      },
    ],
  },
});
