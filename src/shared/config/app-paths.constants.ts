/**
 * Canonical route table. Modules expose typed builders in their
 * routes/*.paths.ts files derived from these values; raw route strings are
 * forbidden everywhere else (ESLint: architecture/no-inline-routes).
 */
export const APP_PATHS = {
  root: '/',
  welcome: '/welcome',
  about: '/about',
  contact: '/contact',
  team: '/team',
  /**
   * The public marketing site is split across dedicated pages rather than one
   * scrolling landing page: `/` is a curated front door that teases each of
   * these and links to it. Each page owns one subject so it can carry its own
   * title, description and canonical URL — a single long page can only ever
   * rank for one of them.
   */
  ultimate: '/ultimate',
  spirit: '/spirit',
  gallery: '/gallery',
  location: '/location',
  publicAchievements: '/at-a-glance',
  /**
   * Public competitions showcase (signed-out). `/competitions` and
   * `/competitions/:competitionId` already belong to the authenticated
   * competitions workspace, so the marketing pages live under `/results`;
   * changing these two values is all it takes to move them.
   */
  publicCompetitions: '/results',
  publicCompetitionDetail: '/results/:competitionSlug',
  news: '/news',
  // Registered before `newsArticle` in the news route table so the literal
  // segment wins over the `:slug` pattern in the router's first-match Switch.
  newsManage: '/news/manage',
  newsArticle: '/news/:slug',
  login: '/login',
  signup: '/signup',
  forgotPassword: '/forgot-password',
  resetPassword: '/reset-password',
  acceptInvitation: '/accept-invitation',
  sessions: '/sessions',
  home: '/home',
  practices: '/practices',
  practiceSession: '/practices/:sessionId',
  attendance: '/practices/:sessionId/attendance',
  myAttendance: '/my-attendance',
  admin: '/admin',
  members: '/members',
  memberProfile: '/members/:membershipId',
  assessments: '/assessments',
  assessmentEntry: '/assessments/:assessmentId',
  performance: '/performance',
  performanceMeasurements: '/performance/measurements',
  performanceFeedback: '/performance/feedback',
  training: '/training',
  trainingSubmission: '/training/:submissionId',
  trainingReview: '/training-review',
  leaderboard: '/leaderboard',
  points: '/points',
  analytics: '/analytics',
  playerAnalytics: '/analytics/players/:membershipId',
  standings: '/standings',
  standingsRules: '/standings/rules',
  achievements: '/achievements',
  teamHistory: '/team-history',
  reports: '/reports',
  competitions: '/competitions',
  competitionDetail: '/competitions/:competitionId',
  squads: '/squads',
  squadDetail: '/squads/:squadId',
  rosters: '/rosters',
  rosterDetail: '/rosters/:rosterId',
  tryoutRegistration: '/tryout-registration',
  tryouts: '/tryouts',
  tryoutDetail: '/tryouts/:tryoutId',
  matches: '/matches',
  matchScoreboard: '/matches/:matchId',
  matchStatistics: '/matches/:matchId/statistics',
  notifications: '/notifications',
  notificationPreferences: '/notifications/preferences',
  notificationLink: '/notifications/open/:notificationId',
  adminSettings: '/admin/settings',
  adminRoles: '/admin/roles',
  adminRules: '/admin/rules',
  adminOperations: '/admin/operations',
  adminPlatform: '/admin/platform',
  adminTeams: '/admin/teams',
  adminSeasons: '/admin/seasons',
  adminPermissions: '/admin/permissions',
  settings: '/settings',
  workbench: '/workbench',
} as const;

export type AppPath = (typeof APP_PATHS)[keyof typeof APP_PATHS];
