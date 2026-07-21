import { describe, expect, it } from 'vitest';

import { APP_PATHS } from './app-paths.constants';

const VALUES = Object.values(APP_PATHS);

describe('APP_PATHS', () => {
  it('names every screen the app can route to', () => {
    // The literal path strings are pinned by the deep-link policy test, which
    // asserts the whole sorted table; this pins the route *names* so a screen
    // cannot be dropped from the canonical table unnoticed.
    expect(Object.keys(APP_PATHS).sort()).toEqual([
      'acceptInvitation',
      'admin',
      'adminOperations',
      'adminRoles',
      'adminRules',
      'adminSettings',
      'assessmentEntry',
      'assessments',
      'attendance',
      'competitionDetail',
      'competitions',
      'forgotPassword',
      'home',
      'leaderboard',
      'login',
      'matchScoreboard',
      'matchStatistics',
      'matches',
      'memberProfile',
      'members',
      'notificationLink',
      'notificationPreferences',
      'notifications',
      'performance',
      'points',
      'practiceSession',
      'practices',
      'resetPassword',
      'root',
      'rosterDetail',
      'rosters',
      'sessions',
      'settings',
      'squadDetail',
      'squads',
      'training',
      'trainingReview',
      'trainingSubmission',
      'tryoutDetail',
      'tryoutRegistration',
      'tryouts',
      'welcome',
      'workbench',
    ]);
  });

  it('anchors every path at the root', () => {
    expect(VALUES.filter((path) => !path.startsWith('/'))).toEqual([]);
  });

  it('avoids trailing slashes outside the root', () => {
    expect(VALUES.filter((path) => path !== APP_PATHS.root && path.endsWith('/'))).toEqual([]);
  });

  it('keeps every route unique', () => {
    expect(new Set(VALUES).size).toBe(VALUES.length);
  });

  it('pins the two screens whose paths the deep-link policy also allows', () => {
    expect(APP_PATHS.root).toBe('/');
    expect(APP_PATHS.tryoutRegistration).toBe('/tryout-registration');
  });
});
