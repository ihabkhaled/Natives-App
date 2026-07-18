import js from '@eslint/js';
import prettierConfig from 'eslint-config-prettier';
import importX from 'eslint-plugin-import-x';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import promisePlugin from 'eslint-plugin-promise';
import reactPlugin from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import regexpPlugin from 'eslint-plugin-regexp';
import securityPlugin from 'eslint-plugin-security';
import sonarjs from 'eslint-plugin-sonarjs';
import unicorn from 'eslint-plugin-unicorn';
import unusedImports from 'eslint-plugin-unused-imports';
import globals from 'globals';
import tseslint from 'typescript-eslint';

import { architectureConfig } from './eslint/architecture.config.mjs';
import { playwrightTestConfig, vitestTestConfig } from './eslint/testing.config.mjs';

export default tseslint.config(
  {
    name: 'capacitor-ranger/ignores',
    ignores: [
      'node_modules/**',
      'dist/**',
      'coverage/**',
      'android/**',
      'ios/**',
      'public/mockServiceWorker.js',
      'playwright-report/**',
      'test-results/**',
      'src/packages/api-contract/generated/**',
      '.husky/**',
      '.ai/graphs/**',
      '.ai/packs/**',
      '.ai/reports/**',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.strictTypeChecked.map((config) => ({
    ...config,
    files: ['**/*.{ts,tsx}'],
  })),
  ...tseslint.configs.stylisticTypeChecked.map((config) => ({
    ...config,
    files: ['**/*.{ts,tsx}'],
  })),
  {
    name: 'capacitor-ranger/typescript-parser',
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parserOptions: {
        project: './tsconfig.eslint.json',
        tsconfigRootDir: import.meta.dirname,
      },
      globals: { ...globals.browser },
    },
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/consistent-type-imports': ['error', { fixStyle: 'inline-type-imports' }],
      '@typescript-eslint/restrict-template-expressions': ['error', { allowNumber: true }],
    },
  },
  {
    name: 'capacitor-ranger/react',
    files: ['**/*.tsx'],
    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      'jsx-a11y': jsxA11y,
    },
    settings: {
      // Explicit version: the plugin's 'detect' path uses context.getFilename(),
      // which ESLint 10 removed. See docs/dependencies/version-snapshot.md.
      react: { version: '19.2' },
    },
    rules: {
      ...reactPlugin.configs.flat.recommended.rules,
      ...reactPlugin.configs.flat['jsx-runtime'].rules,
      ...reactHooks.configs.recommended.rules,
      ...jsxA11y.flatConfigs.recommended.rules,
      'react/prop-types': 'off',
      'react-hooks/exhaustive-deps': 'error',
      'react-refresh/only-export-components': 'off',
    },
  },
  {
    name: 'capacitor-ranger/react-hooks-in-ts',
    files: ['src/**/*.hook.ts'],
    plugins: { 'react-hooks': reactHooks },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-hooks/exhaustive-deps': 'error',
    },
  },
  {
    name: 'capacitor-ranger/quality-plugins',
    files: ['**/*.{ts,tsx,mjs}'],
    plugins: {
      'import-x': importX,
      promise: promisePlugin,
      regexp: regexpPlugin,
      security: securityPlugin,
      sonarjs,
      unicorn,
      'unused-imports': unusedImports,
    },
    rules: {
      ...promisePlugin.configs['flat/recommended'].rules,
      ...regexpPlugin.configs['flat/recommended'].rules,
      'import-x/no-duplicates': 'error',
      'import-x/first': 'error',
      'import-x/newline-after-import': 'error',
      'security/detect-unsafe-regex': 'error',
      'security/detect-eval-with-expression': 'error',
      'security/detect-non-literal-regexp': 'error',
      'sonarjs/cognitive-complexity': ['error', 10],
      'sonarjs/no-identical-functions': 'error',
      'sonarjs/no-duplicate-string': 'off',
      'unicorn/filename-case': ['error', { case: 'kebabCase' }],
      'unicorn/no-abusive-eslint-disable': 'error',
      'unicorn/prefer-node-protocol': 'error',
      'unicorn/no-instanceof-builtins': 'error',
      'unicorn/prefer-array-find': 'error',
      'unicorn/prefer-includes': 'error',
      'unicorn/no-useless-spread': 'error',
      'unused-imports/no-unused-imports': 'error',
      'promise/always-return': 'off',
    },
  },
  {
    name: 'capacitor-ranger/complexity-policy',
    files: ['src/**/*.{ts,tsx}'],
    rules: {
      complexity: ['error', 8],
      'max-depth': ['error', 3],
      'max-params': ['error', 4],
      'max-statements': ['error', 20],
      'max-lines-per-function': [
        'error',
        { max: 50, skipBlankLines: true, skipComments: true, IIFEs: true },
      ],
      'max-lines': ['error', { max: 300, skipBlankLines: true, skipComments: true }],
      'max-nested-callbacks': ['error', 3],
      'no-console': 'error',
    },
  },
  {
    name: 'capacitor-ranger/component-size',
    files: ['src/**/*.component.tsx'],
    rules: {
      'max-lines': ['error', { max: 150, skipBlankLines: true, skipComments: true }],
      'max-lines-per-function': ['error', { max: 120, skipBlankLines: true, skipComments: true }],
    },
  },
  {
    name: 'capacitor-ranger/hook-size',
    files: ['src/**/*.hook.ts'],
    rules: {
      'max-lines': ['error', { max: 200, skipBlankLines: true, skipComments: true }],
      'max-lines-per-function': ['error', { max: 90, skipBlankLines: true, skipComments: true }],
    },
  },
  architectureConfig,
  vitestTestConfig,
  playwrightTestConfig,
  {
    name: 'capacitor-ranger/test-relaxations',
    files: ['src/**/*.test.{ts,tsx}', 'tests/**/*.{ts,tsx}'],
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
    },
    rules: {
      'max-lines-per-function': 'off',
      'max-lines': 'off',
      'max-statements': 'off',
      'max-nested-callbacks': ['error', 5],
      '@typescript-eslint/no-non-null-assertion': 'off',
      'sonarjs/no-identical-functions': 'off',
    },
  },
  {
    name: 'capacitor-ranger/node-tooling',
    files: ['scripts/**/*.mjs', 'eslint/**/*.mjs', '*.config.mjs', 'eslint.config.mjs'],
    languageOptions: {
      globals: { ...globals.node },
    },
    rules: {
      'no-console': 'off',
      'sonarjs/cognitive-complexity': ['error', 15],
    },
  },
  {
    name: 'capacitor-ranger/config-files',
    files: ['*.config.ts', 'capacitor.config.ts'],
    languageOptions: {
      globals: { ...globals.node },
    },
    rules: {
      'no-restricted-syntax': 'off',
    },
  },
  prettierConfig,
);
