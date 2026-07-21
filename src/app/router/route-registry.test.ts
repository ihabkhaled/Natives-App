import { describe, expect, it } from 'vitest';

import { getNotFoundRouteDefinition } from '@/modules/home';
import { APP_PATHS } from '@/shared/config';
import { ROUTE_ACCESS } from '@/shared/types';

import { getAppRouteDefinitions, getCatchAllRouteDefinition } from './route-registry';

function paths(): readonly string[] {
  return getAppRouteDefinitions().map((definition) => definition.path);
}

describe('getAppRouteDefinitions', () => {
  it('aggregates every module route table', () => {
    expect(paths()).toEqual([
      APP_PATHS.login,
      APP_PATHS.forgotPassword,
      APP_PATHS.resetPassword,
      APP_PATHS.acceptInvitation,
      APP_PATHS.sessions,
      APP_PATHS.welcome,
      APP_PATHS.home,
      APP_PATHS.practices,
      APP_PATHS.practiceSession,
      APP_PATHS.attendance,
      APP_PATHS.members,
      APP_PATHS.memberProfile,
      APP_PATHS.assessments,
      APP_PATHS.assessmentEntry,
      APP_PATHS.performance,
      APP_PATHS.training,
      APP_PATHS.trainingReview,
      APP_PATHS.trainingSubmission,
      APP_PATHS.leaderboard,
      APP_PATHS.points,
      APP_PATHS.competitions,
      APP_PATHS.competitionDetail,
      APP_PATHS.squads,
      APP_PATHS.squadDetail,
      APP_PATHS.rosters,
      APP_PATHS.rosterDetail,
      APP_PATHS.matches,
      APP_PATHS.matchScoreboard,
      APP_PATHS.matchStatistics,
      APP_PATHS.tryoutRegistration,
      APP_PATHS.tryouts,
      APP_PATHS.tryoutDetail,
      APP_PATHS.notificationPreferences,
      APP_PATHS.notifications,
      APP_PATHS.notificationLink,
      APP_PATHS.adminSettings,
      APP_PATHS.adminRoles,
      APP_PATHS.adminRules,
      APP_PATHS.adminOperations,
      APP_PATHS.admin,
      APP_PATHS.settings,
      APP_PATHS.workbench,
    ]);
  });

  it('registers each route exactly once', () => {
    expect(new Set(paths()).size).toBe(paths().length);
  });

  it('never includes the catch-all, which the router appends last', () => {
    expect(paths()).not.toContain('*');
  });

  it('declares an access policy and a component for every route', () => {
    for (const definition of getAppRouteDefinitions()) {
      expect(Object.values(ROUTE_ACCESS)).toContain(definition.access);
      expect(definition.component).toBeTypeOf('function');
    }
  });

  it('keeps the session-bound routes behind their guards', () => {
    const byPath = new Map(
      getAppRouteDefinitions().map((definition) => [definition.path, definition.access]),
    );

    expect(byPath.get(APP_PATHS.home)).toBe(ROUTE_ACCESS.Protected);
    expect(byPath.get(APP_PATHS.sessions)).toBe(ROUTE_ACCESS.Protected);
    expect(byPath.get(APP_PATHS.login)).toBe(ROUTE_ACCESS.PublicOnly);
    expect(byPath.get(APP_PATHS.acceptInvitation)).toBe(ROUTE_ACCESS.PublicOnly);
    expect(byPath.get(APP_PATHS.welcome)).toBe(ROUTE_ACCESS.Public);
  });
});

describe('getCatchAllRouteDefinition', () => {
  it('re-exports the home module catch-all', () => {
    expect(getCatchAllRouteDefinition()).toEqual(getNotFoundRouteDefinition());
  });

  it('matches every unclaimed path without requiring a session', () => {
    expect(getCatchAllRouteDefinition().path).toBe('*');
    expect(getCatchAllRouteDefinition().exact).toBe(false);
    expect(getCatchAllRouteDefinition().access).toBe(ROUTE_ACCESS.Public);
  });
});
