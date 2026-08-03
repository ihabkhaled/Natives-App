import type { FactListItem, AsyncViewStatus } from '@/shared/ui';
import type { ScreenCopy } from '@/shared/view';

import type { CandidateDisclosureBlock } from './tryout-candidates.types';

/**
 * A candidate as the list renders them.
 *
 * The type carries no contact and no readiness field at all. That is the
 * point: a list is the one place personal detail leaks in bulk, so there is
 * nowhere for it to go even if a future payload started carrying it.
 */
export interface CandidateRowView {
  readonly candidateId: string;
  readonly displayName: string;
  readonly statusLabel: string;
  readonly statusTone: string;
  /** Null until the candidate turns up; never a placeholder dash. */
  readonly checkedInLabel: string | null;
  readonly isSelected: boolean;
}

/**
 * One block of restricted candidate data.
 *
 * `isDisclosed` is false both when the caller lacks the grant and when the
 * server simply did not send the block. Either way the panel renders the
 * designed restricted state — never an empty field, which would read as "this
 * person told us nothing".
 */
export interface CandidateDisclosureView {
  readonly key: CandidateDisclosureBlock;
  readonly heading: string;
  readonly isDisclosed: boolean;
  readonly withheldTitle: string;
  readonly withheldMessage: string;
  readonly notice: string;
  /** Empty whenever the block is withheld: prepared copy, never raw data. */
  readonly facts: readonly FactListItem[];
}

export interface CandidateDetailPanelView {
  readonly candidateId: string;
  readonly displayName: string;
  readonly statusLabel: string;
  readonly statusTone: string;
  readonly notice: string;
  readonly facts: readonly FactListItem[];
  readonly blocks: readonly CandidateDisclosureView[];
  /** False once the candidate has left the funnel, or was anonymized. */
  readonly canWithdraw: boolean;
  readonly withdrawLabel: string;
  readonly onWithdraw: () => void;
}

/**
 * The withdrawal step. It exists as its own panel so the consequence is stated
 * and a reason is typed before anything is sent — a withdrawal is a decision
 * about a person, not a toggle.
 */
export interface CandidateWithdrawalView {
  readonly heading: string;
  readonly subjectName: string;
  readonly consequence: string;
  readonly notice: string;
  readonly reasonLabel: string;
  readonly reasonPlaceholder: string;
  readonly reason: string;
  readonly validationMessage: string | null;
  readonly submitLabel: string;
  readonly cancelLabel: string;
  readonly canSubmit: boolean;
  readonly isSubmitting: boolean;
  readonly onReasonChange: (value: string) => void;
  readonly onSubmit: () => void;
  readonly onCancel: () => void;
}

export interface TryoutCandidatesScreenView extends ScreenCopy {
  readonly path: string;
  readonly pageTitle: string;
  readonly status: AsyncViewStatus;
  readonly listHeading: string;
  readonly listIntro: string;
  readonly listPrivacyNotice: string;
  readonly countLabel: string;
  readonly notice: string | null;
  readonly rows: readonly CandidateRowView[];
  readonly selectPrompt: string;
  readonly detail: CandidateDetailPanelView | null;
  readonly withdrawal: CandidateWithdrawalView | null;
  readonly onSelect: (candidateId: string) => void;
}
