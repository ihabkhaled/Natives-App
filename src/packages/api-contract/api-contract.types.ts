import type { components, operations, paths } from './generated/openapi.generated.types';

export type BackendApiPaths = paths;
export type BackendApiOperations = operations;
export type BackendApiSchemas = components['schemas'];

export type LoginRequestContract = BackendApiSchemas['LoginDto'];
export type LoginResponseContract = BackendApiSchemas['LoginResponseDto'];
export type CurrentUserResponseContract = BackendApiSchemas['AuthUserDto'];
export type RefreshRequestContract = BackendApiSchemas['RefreshDto'];
export type RefreshResponseContract = BackendApiSchemas['AuthSessionResponseDto'];
export type LogoutRequestContract = BackendApiSchemas['LogoutDto'];
export type MessageResponseContract = BackendApiSchemas['MessageResponseDto'];
export type PracticeSessionContract = BackendApiSchemas['PracticeSessionResponseDto'];
export type PracticeSessionListContract = BackendApiSchemas['PracticeListSessionsResponseDto'];
export type PracticeRsvpContract = BackendApiSchemas['RsvpResponseDto'];
export type PracticeSessionListQueryContract = NonNullable<
  BackendApiOperations['PracticeSessions.list']['parameters']['query']
>;
export type SetRsvpRequestContract = BackendApiSchemas['SetRsvpDto'];
export type AuthMembershipContract = BackendApiSchemas['AuthMembershipDto'];
export type DashboardSummaryContract = BackendApiSchemas['DashboardSummaryResponseDto'];
export type MemberRolesContract = BackendApiSchemas['MemberRolesResponseDto'];
export type ActivityTypeListContract = BackendApiSchemas['ListActivityTypesResponseDto'];
export type ActivitySubmissionListContract = BackendApiSchemas['ListSubmissionsResponseDto'];
export type ActivitySubmissionDetailContract = BackendApiSchemas['SubmissionDetailResponseDto'];
export type ActivityEvidenceListContract = BackendApiSchemas['ListEvidenceResponseDto'];
export type ActivityBuddyListContract = BackendApiSchemas['ListBuddiesResponseDto'];
export type ActivityReviewQueueContract = BackendApiSchemas['ListReviewQueueResponseDto'];
export type ActivityReviewDetailContract = BackendApiSchemas['ReviewDetailResponseDto'];
export type CreateSubmissionRequestContract = BackendApiSchemas['CreateSubmissionDto'];
export type UpdateSubmissionRequestContract = BackendApiSchemas['UpdateSubmissionDto'];
export type ReviewDecisionRequestContract = BackendApiSchemas['ReviewDecisionDto'];
export type OptimisticVersionRequestContract = BackendApiSchemas['ActivityOptimisticVersionDto'];
export type LeaderboardContract = BackendApiSchemas['LeaderboardResponseDto'];
export type PointsSummaryContract = BackendApiSchemas['PointsSummaryResponseDto'];
export type LeaderboardQueryContract = NonNullable<
  BackendApiOperations['Points.teamLeaderboard']['parameters']['query']
>;

// --- Typed team settings (contract 1.3.0 union, synced at 1.4.0) -------------
export type SettingKeyContract = BackendApiSchemas['SettingVersionResponseDto']['settingKey'];
export type AttendanceStatusesValueContract = BackendApiSchemas['AttendanceStatusesValueDto'];
export type SessionTypesValueContract = BackendApiSchemas['SessionTypesValueDto'];
export type AttendanceWeightsValueContract = BackendApiSchemas['AttendanceWeightsValueDto'];
export type AssessmentScaleValueContract = BackendApiSchemas['AssessmentScaleValueDto'];
export type BadgeTiersValueContract = BackendApiSchemas['BadgeTiersValueDto'];
export type RosterLimitsValueContract = BackendApiSchemas['RosterLimitsValueDto'];
export type NotificationRulesValueContract = BackendApiSchemas['NotificationRulesValueDto'];
export type ReportBrandingValueContract = BackendApiSchemas['ReportBrandingValueDto'];

/** Per-key value contract map: the discriminated `value` for each settingKey. */
export interface SettingValueContractByKey {
  readonly attendance_statuses: AttendanceStatusesValueContract;
  readonly session_types: SessionTypesValueContract;
  readonly attendance_weights: AttendanceWeightsValueContract;
  readonly assessment_scale: AssessmentScaleValueContract;
  readonly badge_tiers: BadgeTiersValueContract;
  readonly roster_limits: RosterLimitsValueContract;
  readonly notification_rules: NotificationRulesValueContract;
  readonly report_branding: ReportBrandingValueContract;
}

export type SettingVersionResponseContract = BackendApiSchemas['SettingVersionResponseDto'];
export type SettingVersionListResponseContract =
  BackendApiSchemas['ListSettingVersionsResponseDto'];
export type EffectiveSettingResponseContract = BackendApiSchemas['EffectiveSettingResponseDto'];
export type SettingsSnapshotResponseContract = BackendApiSchemas['SettingsSnapshotResponseDto'];

/** The 8-way discriminated create request (`settingKey` narrows the value). */
export type CreateSettingVersionRequestContract =
  | BackendApiSchemas['CreateAttendanceStatusesSettingVersionDto']
  | BackendApiSchemas['CreateSessionTypesSettingVersionDto']
  | BackendApiSchemas['CreateAttendanceWeightsSettingVersionDto']
  | BackendApiSchemas['CreateAssessmentScaleSettingVersionDto']
  | BackendApiSchemas['CreateBadgeTiersSettingVersionDto']
  | BackendApiSchemas['CreateRosterLimitsSettingVersionDto']
  | BackendApiSchemas['CreateNotificationRulesSettingVersionDto']
  | BackendApiSchemas['CreateReportBrandingSettingVersionDto'];
