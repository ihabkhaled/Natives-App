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
      .filter(([, value]) => !catalog.has(value))
      .map(([key, value]) => `${key} = "${value}"`);

    expect(unknown).toEqual([]);
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
