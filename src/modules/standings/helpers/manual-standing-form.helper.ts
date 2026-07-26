import { STANDINGS_LIMITS } from '../constants/standings.constants';
import type { RecordManualStandingCommand } from '../types/standings.types';

/** The raw text state of the manual external-row form. */
export interface ManualStandingDraft {
  readonly entrantKind: string;
  readonly played: string;
  readonly wins: string;
  readonly losses: string;
  readonly ties: string;
  readonly pointsFor: string;
  readonly pointsAgainst: string;
  readonly spiritScore: string;
  readonly sourceReference: string;
  readonly reconciliationNote: string;
  readonly ruleKey: string;
}

/** A blank draft: our team, zero counts, spirit intentionally unscored. */
export function buildManualStandingDraft(): ManualStandingDraft {
  return {
    entrantKind: 'team',
    played: '0',
    wins: '0',
    losses: '0',
    ties: '0',
    pointsFor: '0',
    pointsAgainst: '0',
    spiritScore: '',
    sourceReference: '',
    reconciliationNote: '',
    ruleKey: '',
  };
}

function toCount(value: string): number {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= 0 ? parsed : Number.NaN;
}

/** The reasons a draft cannot be submitted yet, in display priority order. */
export type ManualStandingIssue = 'counts' | 'note' | 'rule' | null;

/**
 * Cross-field validation the backend will re-check: wins + losses + ties must
 * equal played, the reconciliation note is mandatory (min length mirrors the
 * DTO bound), and a rule family must be chosen.
 */
export function validateManualStandingDraft(draft: ManualStandingDraft): ManualStandingIssue {
  const played = toCount(draft.played);
  const wins = toCount(draft.wins);
  const losses = toCount(draft.losses);
  const ties = toCount(draft.ties);
  if ([played, wins, losses, ties].some(Number.isNaN) || wins + losses + ties !== played) {
    return 'counts';
  }
  if (draft.reconciliationNote.trim().length < STANDINGS_LIMITS.noteMinLength) {
    return 'note';
  }
  if (draft.ruleKey === '') {
    return 'rule';
  }
  return null;
}

/**
 * The wire command for a valid draft. Blank spirit stays null — "not scored"
 * is a real state and never becomes zero.
 */
export function toManualStandingCommand(
  draft: ManualStandingDraft,
  competitionId: string,
): RecordManualStandingCommand {
  return {
    competitionId,
    entrantKind: draft.entrantKind === 'opponent' ? 'opponent' : 'team',
    opponentId: null,
    played: toCount(draft.played),
    wins: toCount(draft.wins),
    losses: toCount(draft.losses),
    ties: toCount(draft.ties),
    pointsFor: toCount(draft.pointsFor),
    pointsAgainst: toCount(draft.pointsAgainst),
    spiritScore: draft.spiritScore.trim() === '' ? null : Number(draft.spiritScore),
    finalPlace: null,
    qualification: null,
    sourceReference: draft.sourceReference.trim() === '' ? null : draft.sourceReference.trim(),
    reconciliationNote: draft.reconciliationNote.trim(),
    ruleKey: draft.ruleKey,
  };
}
