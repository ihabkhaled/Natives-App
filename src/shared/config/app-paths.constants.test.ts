import { describe, expect, it } from 'vitest';

import { APP_PATHS } from './app-paths.constants';

const VALUES = Object.values(APP_PATHS);

describe('APP_PATHS', () => {
  it('names every screen the app can route to', () => {
    // The literal path strings are pinned by the deep-link policy test, which
    // asserts the whole sorted table; this pins the route *names* so a screen
    // cannot be dropped from the canonical table unnoticed.
    expect(Object.keys(APP_PATHS).sort()).toEqual([
      'about',
      'acceptInvitation',
      'achievements',
      'admin',
      'adminOperations',
      'adminPermissions',
      'adminPlatform',
      'adminRoles',
      'adminRules',
      'adminSeasons',
      'adminSettings',
      'adminTeams',
      'analytics',
      'assessmentEntry',
      'assessments',
      'attendance',
      'competitionDetail',
      'competitions',
      'contact',
      'dataQuality',
      'drillDetail',
      'drills',
      'forgotPassword',
      'gallery',
      'governance',
      'home',
      'jerseyOrders',
      'leaderboard',
      'location',
      'login',
      'matchScoreboard',
      'matchStatistics',
      'matches',
      'memberProfile',
      'members',
      'myAttendance',
      'news',
      'newsArticle',
      'newsManage',
      'notificationLink',
      'notificationPreferences',
      'notifications',
      'performance',
      'performanceFeedback',
      'performanceMeasurements',
      'playerAnalytics',
      'points',
      'practiceAgenda',
      'practiceAgendaGroups',
      'practiceReminders',
      'practiceRsvpDetail',
      'practiceScheduleDetail',
      'practiceScheduleNew',
      'practiceSchedules',
      'practiceSession',
      'practices',
      'publicAchievements',
      'publicCompetitionDetail',
      'publicCompetitions',
      'reports',
      'resetPassword',
      'roleAssignments',
      'root',
      'rosterDetail',
      'rosters',
      'sessions',
      'settings',
      'signup',
      'spirit',
      'squadDetail',
      'squads',
      'standings',
      'standingsRules',
      'team',
      'teamHistory',
      'training',
      'trainingReview',
      'trainingSubmission',
      'tryoutCandidates',
      'tryoutDetail',
      'tryoutRegistration',
      'tryouts',
      'ultimate',
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

  it('keeps the literal news editor path ahead of the slug pattern it shadows', () => {
    // `/news/manage` and `/news/:slug` both match "/news/manage"; the router
    // renders the first Route that matches, so the editor must be declared
    // first or a signed-in editor lands on an article detail for slug
    // "manage". `getNewsRouteDefinitions` owns that ordering.
    const values = Object.values(APP_PATHS);

    expect(values.indexOf(APP_PATHS.newsManage)).toBeLessThan(
      values.indexOf(APP_PATHS.newsArticle),
    );
  });
});
