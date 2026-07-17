import { RuleTester } from 'eslint';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import tseslint from 'typescript-eslint';
import { describe, expect, it } from 'vitest';

import { ALL_ARCHITECTURE_RULE_NAMES, architecturePlugin } from '../index.mjs';

const ruleTester = new RuleTester({
  languageOptions: {
    parser: tseslint.parser,
    ecmaVersion: 'latest',
    sourceType: 'module',
    parserOptions: {
      ecmaFeatures: { jsx: true },
    },
  },
});

const fixturesDir = join(import.meta.dirname, '..', 'fixtures');

describe('architecture plugin', () => {
  it('registers exactly 50 rules', () => {
    expect(ALL_ARCHITECTURE_RULE_NAMES).toHaveLength(50);
  });

  it('ships fixtures for every rule', () => {
    for (const ruleName of ALL_ARCHITECTURE_RULE_NAMES) {
      expect(existsSync(join(fixturesDir, `${ruleName}.fixtures.mjs`)), ruleName).toBe(true);
    }
  });

  for (const ruleName of ALL_ARCHITECTURE_RULE_NAMES) {
    it(`enforces architecture/${ruleName}`, async () => {
      const fixtures = (await import(`../fixtures/${ruleName}.fixtures.mjs`)).default;
      expect(fixtures.valid.length, `${ruleName} valid fixtures`).toBeGreaterThan(0);
      expect(fixtures.invalid.length, `${ruleName} invalid fixtures`).toBeGreaterThan(0);
      ruleTester.run(ruleName, architecturePlugin.rules[ruleName], fixtures);
    });
  }
});
