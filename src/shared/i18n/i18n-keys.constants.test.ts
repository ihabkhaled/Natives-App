import { describe, expect, it } from 'vitest';

import { I18N_KEYS } from './i18n-keys.constants';
import arCatalog from './locales/ar.json';
import enCatalog from './locales/en.json';

interface I18nLeaf {
  readonly path: string;
  readonly value: unknown;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function collectLeaves(tree: Record<string, unknown>, prefix: readonly string[] = []): I18nLeaf[] {
  return Object.entries(tree).flatMap<I18nLeaf>(([key, value]) => {
    const path = [...prefix, key];
    return isRecord(value) ? collectLeaves(value, path) : [{ path: path.join('.'), value }];
  });
}

function lookupCatalogValue(catalog: unknown, dottedPath: string): unknown {
  let current: unknown = catalog;
  for (const segment of dottedPath.split('.')) {
    if (!isRecord(current)) {
      return undefined;
    }
    current = current[segment];
  }
  return current;
}

const LEAVES = collectLeaves(I18N_KEYS);

/**
 * CLDR plural categories. A pluralized key is stored as a family of suffixed
 * siblings (`points.movementDelta_one`), so the declared base key is a folder
 * of copy rather than a single string — i18next picks the member at runtime.
 */
const PLURAL_CATEGORIES = ['zero', 'one', 'two', 'few', 'many', 'other'];

function resolvesToCopy(catalog: unknown, dottedPath: string): boolean {
  if (typeof lookupCatalogValue(catalog, dottedPath) === 'string') {
    return true;
  }
  return PLURAL_CATEGORIES.some(
    (category) => typeof lookupCatalogValue(catalog, `${dottedPath}_${category}`) === 'string',
  );
}

function findMissingKeys(catalog: unknown): readonly string[] {
  return LEAVES.filter(({ path }) => !resolvesToCopy(catalog, path)).map(({ path }) => path);
}

describe('I18N_KEYS', () => {
  it('groups every key under a namespace', () => {
    expect(Object.keys(I18N_KEYS)).toEqual([
      'common',
      'dateField',
      'brand',
      'errors',
      'states',
      'pwa',
      'welcome',
      'auth',
      'sessions',
      'home',
      'dashboard',
      'attendance',
      'practice',
      'members',
      'assessments',
      'training',
      'points',
      'competitions',
      'squads',
      'rosters',
      'tryouts',
      'matches',
      'scoreboard',
      'scorekeeperQueue',
      'matchStats',
      'notifications',
      'adminConsole',
      'adminSettings',
      'adminRoles',
      'adminRules',
      'adminOperations',
      'adminPlatform',
      'settingForm',
      'settingEditors',
      'settingHistory',
      'settingSummary',
      'settingConstraints',
      'teamsAdmin',
      'seasonsAdmin',
      'permissionsMatrix',
      'health',
      'settings',
      'workbench',
      'notFound',
      'nav',
      'teams',
      'appBar',
      'admin',
      'guard',
    ]);
    expect(LEAVES.length).toBeGreaterThan(0);
  });

  it('binds every leaf to its own dotted path', () => {
    const mismatched = LEAVES.filter(({ path, value }) => value !== path);

    expect(mismatched).toEqual([]);
  });

  it('keeps every key unique', () => {
    const paths = LEAVES.map(({ path }) => path);

    expect(new Set(paths).size).toBe(paths.length);
  });

  it('resolves every key in the English catalog', () => {
    expect(findMissingKeys(enCatalog)).toEqual([]);
  });

  it('resolves every key in the Arabic catalog', () => {
    expect(findMissingKeys(arCatalog)).toEqual([]);
  });
});
