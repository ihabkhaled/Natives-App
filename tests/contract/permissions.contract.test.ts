import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { PERMISSIONS } from '@/shared/security';

/**
 * The frontend permission catalog must be a strict subset of the backend
 * `Permission` catalog published in `contracts/openapi.json`.
 *
 * A permission string the backend never emits is not a loud failure: it simply
 * never appears in `/auth/me`, so `hasAllPermissions` reads it as "not granted".
 * The route guard then forbids the screen and nav visibility hides its entry —
 * for every persona, including a full system administrator. That is exactly how
 * `practices.read` (backend: `practice.read`) made `/practices` unreachable and
 * hid four admin screens while every request the pages made returned 200.
 *
 * This test turns that silent, persona-independent breakage into a contract
 * failure at build time.
 */

const CONTRACT_PATH = fileURLToPath(new URL('../../contracts/openapi.json', import.meta.url));

/**
 * Grants the frontend declares AHEAD of the contract version that publishes
 * them, mapped to the exact backend contract release that will. This is the
 * narrow, documented seam for a feature built against a spec while the API is
 * still shipping — never a place to park a typo:
 *
 * - the drift guard below still runs against every other permission string;
 * - the entry names the release, so "when can this go?" has one answer;
 * - `rejects a pending entry the contract already publishes` FAILS the moment
 *   the catalog does carry the string, which forces the entry to be deleted
 *   rather than quietly outliving its reason.
 *
 * A pending grant behaves exactly like an ungranted one at runtime (it never
 * appears in `/auth/me`), so its screen is forbidden and its nav entry hidden
 * for every persona until the contract lands — which is the correct behavior
 * for a feature whose endpoints do not exist yet.
 */
const PENDING_BACKEND_CATALOG: Readonly<Record<string, string>> = {
  'news.manage': '1.8.0',
};

interface OpenApiContract {
  readonly components: {
    readonly schemas: {
      readonly EffectivePermissionsResponseDto: {
        readonly properties: {
          readonly permissions: { readonly items: { readonly enum?: readonly string[] } };
        };
      };
    };
  };
}

function readPublishedCatalog(): readonly string[] {
  const contract = JSON.parse(readFileSync(CONTRACT_PATH, 'utf8')) as OpenApiContract;
  return (
    contract.components.schemas.EffectivePermissionsResponseDto.properties.permissions.items.enum ??
    []
  );
}

describe('permission catalog wire contract', () => {
  it('publishes the backend permission catalog in the synced contract', () => {
    const catalog = readPublishedCatalog();

    expect(catalog.length).toBeGreaterThan(0);
    expect(catalog).toContain('practice.read');
  });

  it('gates every frontend permission on a string the backend actually emits', () => {
    const catalog = new Set(readPublishedCatalog());

    const unknown = Object.entries(PERMISSIONS)
      .filter(([, value]) => !catalog.has(value) && PENDING_BACKEND_CATALOG[value] === undefined)
      .map(([key, value]) => `${key} = "${value}"`);

    expect(unknown).toEqual([]);
  });

  it('declares every pending grant in the frontend catalog it excuses', () => {
    const declared = new Set<string>(Object.values(PERMISSIONS));

    const orphaned = Object.keys(PENDING_BACKEND_CATALOG).filter(
      (permission) => !declared.has(permission),
    );

    expect(orphaned).toEqual([]);
  });

  it('rejects a pending entry the contract already publishes', () => {
    // Self-expiring: once the named release is synced the string is in the
    // catalog, the excuse is spent, and this fails until the entry is removed.
    const catalog = new Set(readPublishedCatalog());

    const stale = Object.entries(PENDING_BACKEND_CATALOG)
      .filter(([permission]) => catalog.has(permission))
      .map(([permission, version]) => `${permission} (promised in ${version}) is already published`);

    expect(stale).toEqual([]);
  });

  it('rejects the drifted strings that silently forbade their screens', () => {
    const catalog = new Set(readPublishedCatalog());

    for (const drifted of [
      'practices.read',
      'practices.manage',
      'practices.rsvp.self',
      'attendance.mark',
      'settings.read',
      'points_rule.manage',
      'outbox.manage',
      'users.manage',
    ]) {
      expect(catalog.has(drifted)).toBe(false);
      expect(Object.values(PERMISSIONS)).not.toContain(drifted);
    }
  });
});
