import { describe, expect, it } from 'vitest';

import { APP_PATHS } from '@/shared/config';
import { PERMISSIONS } from '@/shared/security';
import { NAV_GROUP, ROUTE_ACCESS } from '@/shared/types';

import { TryoutCandidatesContainer } from '../containers/tryout-candidates.container';
import { tryoutCandidatesPagePath } from './tryout-candidates.paths';
import { getTryoutCandidatesRouteDefinitions } from './tryout-candidates.routes';

describe('tryoutCandidatesPagePath', () => {
  it('resolves the shared application path', () => {
    expect(tryoutCandidatesPagePath()).toBe(APP_PATHS.tryoutCandidates);
  });
});

describe('getTryoutCandidatesRouteDefinitions', () => {
  it('gates the screen on tryout.manage and nothing more', () => {
    const [route] = getTryoutCandidatesRouteDefinitions();

    expect(route?.path).toBe(tryoutCandidatesPagePath());
    expect(route?.access).toBe(ROUTE_ACCESS.Protected);
    expect(route?.component).toBe(TryoutCandidatesContainer);
    expect(route?.meta?.permissions).toEqual([PERMISSIONS.tryoutManage]);
  });

  it('leaves the contact and readiness grants to the screen, not the route', () => {
    // Gating the route on them would hide the whole queue from a reviewer who
    // may legitimately see names and statuses but not contact details.
    const [route] = getTryoutCandidatesRouteDefinitions();

    expect(route?.meta?.permissions).not.toContain(PERMISSIONS.tryoutContactsRead);
    expect(route?.meta?.permissions).not.toContain(PERMISSIONS.tryoutReadinessRead);
  });

  it('places it in Manage beside tryouts and requires a team', () => {
    const [route] = getTryoutCandidatesRouteDefinitions();

    expect(route?.meta?.nav?.group).toBe(NAV_GROUP.Manage);
    expect(route?.meta?.requiresTeamContext).toBe(true);
  });

  it('does not advertise the public register as offline-readable', () => {
    // Every row is a member of the public who handed over contact details;
    // the screen is not sold as something a disconnected device can serve.
    const [route] = getTryoutCandidatesRouteDefinitions();

    expect(route?.meta?.offline).toBe(false);
  });
});
