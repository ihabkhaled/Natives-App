import { describe, expect, it } from 'vitest';

import { FEATURE_FLAGS } from '@/shared/config';
import { PERMISSIONS } from '@/shared/security';
import type { RouteMeta } from '@/shared/types';

import { normalizeRouteMeta } from './route-meta.helper';

const fullMeta: RouteMeta = {
  key: 'admin',
  titleKey: 'admin.title',
  permissions: [PERMISSIONS.usersManage],
  requiresTeamContext: true,
  offline: false,
  preload: false,
  featureFlag: FEATURE_FLAGS.adminConsole,
  nav: null,
};

describe('normalizeRouteMeta', () => {
  it('reads permissions, team requirement, and flag state from present metadata', () => {
    expect(normalizeRouteMeta(fullMeta)).toEqual({
      requiredPermissions: [PERMISSIONS.usersManage],
      requiresTeamContext: true,
      featureEnabled: true,
    });
  });

  it('applies permissive defaults when a route has no metadata', () => {
    expect(normalizeRouteMeta(undefined)).toEqual({
      requiredPermissions: [],
      requiresTeamContext: false,
      featureEnabled: true,
    });
  });

  it('reports a flagged-off route as disabled', () => {
    const meta: RouteMeta = {
      ...fullMeta,
      featureFlag: 'nope' as typeof FEATURE_FLAGS.adminConsole,
    };

    expect(normalizeRouteMeta(meta).featureEnabled).toBe(false);
  });
});
