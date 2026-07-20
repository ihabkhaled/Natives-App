/**
 * Canonical permission catalog. Permissions are strings, never role names;
 * navigation and route guards reason about these values so a persona's shell
 * follows its effective grants rather than a hard-coded role column.
 *
 * Mirrors 02-PRODUCT/rbac-permission-matrix.md. The backend remains the sole
 * authority: these strings gate convenience UI only, never authorization.
 */
export const PERMISSIONS = {
  usersManage: 'users.manage',
  membersRead: 'members.read',
  membersManage: 'members.manage',
  memberList: 'member.list',
  memberProfileReadPublic: 'member.profile.read.public',
  memberProfileReadCoach: 'member.profile.read.coach',
  memberProfileReadAdmin: 'member.profile.read.admin',
  memberProfileUpdateSelf: 'member.profile.update.self',
  memberInvite: 'member.invite',
  memberLifecycleManage: 'member.lifecycle.manage',
  memberRolesManage: 'member.roles.manage',
  memberAliasesManage: 'member.aliases.manage',
  practicesRead: 'practices.read',
  practicesManage: 'practices.manage',
  practicesRsvpSelf: 'practices.rsvp.self',
  attendanceMark: 'attendance.mark',
  assessmentsManage: 'assessments.manage',
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
  matchesScore: 'matches.score',
  reportsGenerate: 'reports.generate',
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
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];
