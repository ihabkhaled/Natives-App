import type { TranslateParams } from '@/packages/i18n';
import { I18N_KEYS } from '@/shared/i18n';
import type { FactListItem } from '@/shared/ui';

import {
  CANDIDATE_STATUS_LABEL_KEYS,
  CANDIDATE_STATUS_TONES,
} from '../constants/tryout-candidates-copy.constants';
import { WITHDRAWABLE_CANDIDATE_STATUSES } from '../constants/tryout-candidates.constants';
import type { TryoutCandidate, TryoutCandidatesPage } from '../types/tryout-candidates.types';
import type {
  CandidateDetailPanelView,
  CandidateRowView,
} from '../types/tryout-candidates-view.types';
import { buildCandidateDisclosures, type CandidateReadGrants } from './candidate-disclosure.helper';

type Translate = (key: string, params?: TranslateParams) => string;
type FormatInstant = (iso: string) => string;

/** Everything the detail panel needs, as one argument. */
export interface CandidatePanelInput {
  readonly t: Translate;
  readonly formatInstant: FormatInstant;
  readonly candidate: TryoutCandidate;
  readonly grants: CandidateReadGrants;
  readonly onWithdraw: () => void;
}

const KEYS = I18N_KEYS.tryouts;
const WITHDRAWABLE: readonly string[] = WITHDRAWABLE_CANDIDATE_STATUSES;

/**
 * An anonymized record outranks its own status: retention has already erased
 * the person behind it, so the row says that rather than "Registered" about
 * data which no longer describes anyone.
 */
export function buildCandidateStatusLabel(t: Translate, candidate: TryoutCandidate): string {
  return candidate.anonymizedAt === null
    ? t(CANDIDATE_STATUS_LABEL_KEYS[candidate.status])
    : t(I18N_KEYS.members.statusAnonymized);
}

export function buildCandidateStatusTone(candidate: TryoutCandidate): string {
  return candidate.anonymizedAt === null ? CANDIDATE_STATUS_TONES[candidate.status] : 'medium';
}

/**
 * Whether a withdrawal still means anything for this candidate. Someone who
 * already withdrew, was rejected, never turned up, or became a member has left
 * the funnel; so has an anonymized record. The affordance is absent in those
 * cases rather than disabled — a greyed-out button implies "later", and there
 * is no later.
 */
export function canWithdrawCandidate(candidate: TryoutCandidate): boolean {
  return candidate.anonymizedAt === null && WITHDRAWABLE.includes(candidate.status);
}

/** One list row. Contact and readiness detail have nowhere to go here by design. */
export function buildCandidateRow(
  t: Translate,
  formatInstant: FormatInstant,
  candidate: TryoutCandidate,
  selectedId: string,
): CandidateRowView {
  return {
    candidateId: candidate.candidateId,
    displayName: candidate.displayName,
    statusLabel: buildCandidateStatusLabel(t, candidate),
    statusTone: buildCandidateStatusTone(candidate),
    checkedInLabel:
      candidate.checkedInAt === null
        ? null
        : t(KEYS.checkedInAt, { time: formatInstant(candidate.checkedInAt) }),
    isSelected: candidate.candidateId === selectedId,
  };
}

export function buildCandidateRows(
  t: Translate,
  formatInstant: FormatInstant,
  candidates: readonly TryoutCandidate[],
  selectedId: string,
): readonly CandidateRowView[] {
  return candidates.map((candidate) => buildCandidateRow(t, formatInstant, candidate, selectedId));
}

/**
 * The facts a reviewer needs that are not restricted: which event, what the
 * person consented to, and when the record erases itself. The retention date
 * is deliberately always present — a candidate's data has a stated end, and
 * staff should be able to see it without asking.
 */
export function buildCandidateFacts(
  t: Translate,
  formatInstant: FormatInstant,
  candidate: TryoutCandidate,
): readonly FactListItem[] {
  const milestones = [
    milestone('checked-in', t(KEYS.statusCheckedIn), candidate.checkedInAt, formatInstant),
    milestone('withdrawn', t(KEYS.statusWithdrawn), candidate.withdrawnAt, formatInstant),
    milestone('converted', t(KEYS.statusConverted), candidate.convertedAt, formatInstant),
  ];
  return [
    { key: 'event', label: t(KEYS.registrationEventLabel), value: candidate.eventId },
    {
      key: 'consent',
      label: t(KEYS.consentHeading),
      value: t(KEYS.consentVersionLabel, { version: candidate.consentVersion }),
    },
    {
      key: 'retention',
      label: t(I18N_KEYS.members.inviteExpiresLabel),
      value: formatInstant(candidate.retentionExpiresAt),
    },
    ...milestones.filter((fact): fact is FactListItem => fact !== null),
  ];
}

/** A dated milestone, or nothing at all — never a placeholder dash. */
function milestone(
  key: string,
  label: string,
  instant: string | null,
  formatInstant: FormatInstant,
): FactListItem | null {
  return instant === null ? null : { key, label, value: formatInstant(instant) };
}

/**
 * The selected candidate's panel: the unrestricted facts, then one block per
 * read grant. The blocks are always present in the view — a caller who may not
 * read contacts still sees that a contacts block exists and is restricted,
 * because a silently absent section reads as "this candidate gave us nothing".
 */
export function buildCandidateDetailPanel(input: CandidatePanelInput): CandidateDetailPanelView {
  const { t, candidate } = input;
  return {
    candidateId: candidate.candidateId,
    displayName: candidate.displayName,
    statusLabel: buildCandidateStatusLabel(t, candidate),
    statusTone: buildCandidateStatusTone(candidate),
    notice: t(KEYS.privacyNotice),
    facts: buildCandidateFacts(t, input.formatInstant, candidate),
    blocks: buildCandidateDisclosures(t, candidate, input.grants),
    canWithdraw: canWithdrawCandidate(candidate),
    withdrawLabel: t(I18N_KEYS.training.actionWithdraw),
    onWithdraw: input.onWithdraw,
  };
}

/** The page's items and total, defaulted once so the screen reads neither twice. */
export function resolveCandidatesPage(page: TryoutCandidatesPage | undefined): {
  readonly items: readonly TryoutCandidate[];
  readonly total: number;
  readonly hasData: boolean;
} {
  return {
    items: page?.items ?? [],
    total: page?.total ?? 0,
    hasData: page !== undefined,
  };
}
