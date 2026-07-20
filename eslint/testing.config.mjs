import vitestPlugin from '@vitest/eslint-plugin';
import playwrightPlugin from 'eslint-plugin-playwright';
import testingLibraryPlugin from 'eslint-plugin-testing-library';

/** Flat-config blocks for test code. */
export const vitestTestConfig = {
  name: 'capacitor-ranger/vitest-tests',
  files: ['src/**/*.test.{ts,tsx}', 'tests/unit/**', 'tests/integration/**', 'tests/contract/**'],
  plugins: {
    vitest: vitestPlugin,
    'testing-library': testingLibraryPlugin,
  },
  rules: {
    ...vitestPlugin.configs.recommended.rules,
    ...testingLibraryPlugin.configs['flat/react'].rules,
    'vitest/expect-expect': 'error',
    'vitest/no-focused-tests': 'error',
    'vitest/no-disabled-tests': 'error',
  },
};

export const playwrightTestConfig = {
  name: 'capacitor-ranger/playwright-tests',
  files: ['tests/e2e/**', 'tests/accessibility/**', 'tests/visual/**'],
  plugins: {
    playwright: playwrightPlugin,
  },
  rules: {
    ...playwrightPlugin.configs['flat/recommended'].rules,
    'playwright/no-focused-test': 'error',
    // Custom assertion helpers in tests/e2e/fixtures wrap expect(); without
    // this the rule reports tests that assert only through them.
    'playwright/expect-expect': [
      'error',
      { assertFunctionNames: ['expectPresentedPage', 'capture'] },
    ],
  },
};
