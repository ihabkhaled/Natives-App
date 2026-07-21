/**
 * Canonical permission catalog. Permissions are strings, never role names;
 * navigation and route guards reason about these values so a persona's shell
 * follows its effective grants rather than a hard-coded role column.
 *
 * The backend `Permission` enum is the sole authority. Every value below MUST
 * exist in that catalog: a value the backend never emits can only ever evaluate
 * to "not granted", which silently forbids the route and hides its nav entry.
 * `tests/contract/permissions.contract.test.ts` pins this file against the
 * catalog the backend publishes in `contracts/openapi.json`, so this class of
 * drift fails the contract gate instead of reaching a user as a dead screen.
 */
export const PERMISSIONS = {
  memberList: 'member.list',
  memberProfileReadPublic: 'member.profile.read.public',
  memberProfileReadCoach: 'member.profile.read.coach',
  memberProfileReadAdmin: 'member.profile.read.admin',
  memberProfileUpdateSelf: 'member.profile.update.self',
  memberInvite: 'member.invite',
  memberLifecycleManage: 'member.lifecycle.manage',
  memberRolesManage: 'member.roles.manage',
  memberAliasesManage: 'member.aliases.manage',
  practicesRead: 'practice.read',
  practicesManage: 'practice.manage',
  practicesRsvpSelf: 'practice.rsvp.self',
  attendanceMark: 'attendance.record',
  assessmentReadSelfPublished: 'assessment.read.self.published',
  assessmentReadTeam: 'assessment.read.team',
  assessmentCreate: 'assessment.create',
  assessmentReview: 'assessment.review',
  assessmentPublish: 'assessment.publish',
  feedbackReadSelf: 'feedback.read.self',
  feedbackManage: 'feedback.manage',
  activityReadSelf: 'activity.read.self',
  activitySubmitSelf: 'activity.submit.self',
  activityReview: 'activity.review',
  activityCorrect: 'activity.correct',
  leaderboardsRead: 'leaderboard.read',
  pointsReadSelf: 'points.read.self',
  pointsReadTeam: 'points.read.team',
  matchRead: 'match.read',
  matchScore: 'match.score',
  matchFinalize: 'match.finalize',
  matchCorrect: 'match.correct',
  matchStatsRead: 'match.stats.read',
  matchAnalysisReadSelf: 'match.analysis.read.self',
  matchAnalysisReadTeam: 'match.analysis.read.team',
  reportsGenerate: 'report.generate',
  competitionRead: 'competition.read',
  competitionManage: 'competition.manage',
  squadRead: 'squad.read',
  squadManage: 'squad.manage',
  squadOverrideEligibility: 'squad.override_eligibility',
  rosterRead: 'roster.read',
  rosterManage: 'roster.manage',
  rosterLock: 'roster.lock',
  tryoutPublicRegister: 'tryout.public.register',
  tryoutCandidateReadSelf: 'tryout.candidate.read.self',
  tryoutManage: 'tryout.manage',
  tryoutContactsRead: 'tryout.contacts.read',
  tryoutReadinessRead: 'tryout.readiness.read',
  tryoutEvaluate: 'tryout.evaluate',
  tryoutDecide: 'tryout.decide',
  tryoutConvert: 'tryout.convert',
  settingsRead: 'team.settings.read',
  settingsManage: 'team.settings.manage',
  seasonManage: 'season.manage',
  venueManage: 'venue.manage',
  pointsRuleManage: 'points.rules.manage',
  calculationRuleManage: 'rules.manage',
  auditRead: 'audit.read',
  outboxManage: 'jobs.manage',
} as const;
export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];
