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
export type PracticeSessionListContract = BackendApiSchemas['ListSessionsResponseDto'];
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
export type OptimisticVersionRequestContract = BackendApiSchemas['OptimisticVersionDto'];
export type LeaderboardContract = BackendApiSchemas['LeaderboardResponseDto'];
export type PointsSummaryContract = BackendApiSchemas['PointsSummaryResponseDto'];
export type LeaderboardQueryContract = NonNullable<
  BackendApiOperations['Points.teamLeaderboard']['parameters']['query']
>;
