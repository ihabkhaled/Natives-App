import { vi } from 'vitest';

import { useActiveTeamScope, useEffectivePermissions } from '@/modules/auth';
import type {
  CandidateDetailPanelView,
  CandidateDisclosureView,
  CandidateRowView,
  CandidateWithdrawalView,
  TryoutCandidatesScreenView,
} from '@/modules/tryout-candidates/types/tryout-candidates-view.types';
import { PERMISSIONS } from '@/shared/security';

/** What a spec varies about the reviewer driving the screen. */
export interface ReviewerGrantOptions {
  readonly permissions?: readonly string[];
  readonly isOnline?: boolean;
  readonly isLoading?: boolean;
}

/**
 * Points the mocked auth hooks at one reviewer. The caller still owns the
 * `vi.mock('@/modules/auth', …)` factory — that hoisting cannot be shared —
 * and calls this from its own arrange step.
 */
export function mockTryoutCandidateReviewer(options: ReviewerGrantOptions = {}): void {
  vi.mocked(useActiveTeamScope).mockReturnValue({
    teamId: 'team-1',
    membershipId: 'membership-1',
    seasonId: null,
    teamName: 'Cairo Natives',
    isLoading: options.isLoading ?? false,
    isError: false,
  });
  vi.mocked(useEffectivePermissions).mockReturnValue({
    permissions: options.permissions ?? [PERMISSIONS.tryoutManage],
    accountActive: true,
    accountPending: false,
    onboardingComplete: true,
    hasTeamContext: true,
    isLoading: false,
    isError: false,
  });
}

/** One selectable candidate row, already checked in. */
export function buildCandidateRowView(overrides: Partial<CandidateRowView> = {}): CandidateRowView {
  return {
    candidateId: 'candidate-1',
    displayName: 'Nour El-Sayed',
    statusLabel: 'Registered',
    statusTone: 'primary',
    checkedInLabel: 'Checked in at 18 July 2026 5:00 PM',
    isSelected: false,
    ...overrides,
  };
}

/** A disclosed contacts block. Pass `isDisclosed: false` for the withheld case. */
export function buildCandidateDisclosureView(
  overrides: Partial<CandidateDisclosureView> = {},
): CandidateDisclosureView {
  return {
    key: 'contacts',
    heading: 'Contact details',
    isDisclosed: true,
    withheldTitle: 'Contact details are restricted',
    withheldMessage: 'Only staff holding the tryout contacts grant can read these.',
    notice: 'Each read of these fields is audited.',
    facts: [{ key: 'contact-reference', label: 'Email', value: 'nour@example.test' }],
    ...overrides,
  };
}

/** A withdrawable candidate's record with both restricted blocks present. */
export function buildCandidateDetailPanelView(
  overrides: Partial<CandidateDetailPanelView> = {},
): CandidateDetailPanelView {
  return {
    candidateId: 'candidate-1',
    displayName: 'Nour El-Sayed',
    statusLabel: 'Registered',
    statusTone: 'primary',
    notice: 'Contact details and any readiness note are visible only to staff who hold the grant.',
    facts: [{ key: 'retention', label: 'Expires', value: '1 July 2027 9:00 AM' }],
    blocks: [
      buildCandidateDisclosureView(),
      buildCandidateDisclosureView({
        key: 'readiness',
        heading: 'Readiness and health notes',
        isDisclosed: false,
        withheldTitle: 'Readiness notes are restricted',
        withheldMessage: 'Only staff holding the tryout readiness grant can read these.',
        facts: [],
      }),
    ],
    canWithdraw: true,
    withdrawLabel: 'Withdraw',
    onWithdraw: (): void => undefined,
    ...overrides,
  };
}

/** An open withdrawal step with a valid reason already typed. */
export function buildCandidateWithdrawalView(
  overrides: Partial<CandidateWithdrawalView> = {},
): CandidateWithdrawalView {
  return {
    heading: 'Withdraw',
    subjectName: 'Nour El-Sayed',
    consequence: 'This cannot be undone once applied.',
    notice: 'Decisions are visible to the candidate; evaluator notes are not.',
    reasonLabel: 'Decision reason',
    reasonPlaceholder: 'Why this decision?',
    reason: 'Asked us to remove them.',
    validationMessage: null,
    submitLabel: 'Withdraw',
    cancelLabel: 'Cancel',
    canSubmit: true,
    isSubmitting: false,
    onReasonChange: (): void => undefined,
    onSubmit: (): void => undefined,
    onCancel: (): void => undefined,
    ...overrides,
  };
}

/**
 * The whole screen view model, ready to render. Shared by the view spec and
 * the container spec so the shape lives in one place rather than three.
 */
export function buildTryoutCandidatesScreenView(
  overrides: Partial<TryoutCandidatesScreenView> = {},
): TryoutCandidatesScreenView {
  return {
    path: '/tryout-candidates',
    pageTitle: 'Tryout candidates',
    status: 'ready',
    listHeading: 'Candidates',
    listIntro: 'Newest registration first.',
    listPrivacyNotice: 'Contact details and readiness notes never appear in this list.',
    countLabel: '4 candidates',
    notice: null,
    rows: [buildCandidateRowView()],
    selectPrompt: 'Pick a candidate to review their tryout.',
    detail: null,
    withdrawal: null,
    onSelect: (): void => undefined,
    loadingLabel: 'Loading candidates…',
    errorTitle: 'Something went wrong',
    errorMessage: 'Something went wrong',
    retryLabel: 'Try again',
    onRetry: (): void => undefined,
    offlineTitle: 'You are offline',
    offlineMessage: 'Reconnect to load the latest data.',
    offlineNoticeLabel: 'Reconnect to load the latest data.',
    isOffline: false,
    forbiddenTitle: 'Permission needed',
    forbiddenMessage: 'Grant the required permission to use this feature.',
    emptyTitle: 'No candidates yet',
    emptyMessage: 'Candidates appear here as registrations arrive.',
    ...overrides,
  };
}
