import type { TranslateParams } from '@/packages/i18n';
import { formatNumber, formatPercent } from '@/packages/number';
import { I18N_KEYS } from '@/shared/i18n';

import {
  AVAILABILITY_LABEL_KEYS,
  SIGNAL_CODE_LABEL_KEYS,
  SIGNAL_STATUS_LABEL_KEYS,
  SIGNAL_STATUS_TONES,
} from '../constants/competitions-labels.constants';
import { COMPETITION_LIMITS } from '../constants/competitions.constants';
import type { EligibilityCandidate, GenderRatio } from '../types/competitions.types';
import type {
  CandidateRowView,
  FactRowView,
  SignalChipView,
} from '../types/competitions-view.types';

type Translate = (key: string, params?: TranslateParams) => string;

/** Inputs the row builder needs beyond the candidate itself. */
export interface CandidateRowInput {
  readonly canSelect: boolean;
  readonly canOverride: boolean;
  readonly isLocked: boolean;
}

/**
 * A null percentage is "not enough data", never 0%. This is the single place
 * the rule is applied so no screen can regress it.
 */
export function formatAttendance(
  t: Translate,
  attendancePct: number | null,
  locale: string,
): string {
  return attendancePct === null
    ? t(I18N_KEYS.squads.notEnoughData)
    : formatPercent(attendancePct, locale);
}

export function formatAvailability(
  t: Translate,
  availability: EligibilityCandidate['availability'],
): string {
  return availability === null
    ? t(I18N_KEYS.squads.availabilityUnknown)
    : t(AVAILABILITY_LABEL_KEYS[availability]);
}

export function formatJersey(t: Translate, jerseyNumber: number | null, locale: string): string {
  return jerseyNumber === null
    ? t(I18N_KEYS.squads.jerseyNone)
    : formatNumber(jerseyNumber, locale);
}

export function buildSignalChips(
  t: Translate,
  candidate: EligibilityCandidate,
): readonly SignalChipView[] {
  return candidate.signals.map((signal) => ({
    key: signal.code,
    label: t(SIGNAL_CODE_LABEL_KEYS[signal.code]),
    statusLabel: t(SIGNAL_STATUS_LABEL_KEYS[signal.status]),
    tone: SIGNAL_STATUS_TONES[signal.status],
  }));
}

/**
 * A candidate below the policy still can be selected — with an override and a
 * reason. `unknown` never forces an override: missing data is not a failure.
 */
export function needsOverride(candidate: EligibilityCandidate): boolean {
  return !candidate.selected && candidate.overall === 'failed';
}

function overrideHint(
  t: Translate,
  candidate: EligibilityCandidate,
  input: CandidateRowInput,
): string | null {
  if (!needsOverride(candidate)) {
    return null;
  }
  return input.canOverride
    ? t(I18N_KEYS.squads.overrideNeeded)
    : t(I18N_KEYS.squads.overrideBlocked);
}

function isActionDisabled(candidate: EligibilityCandidate, input: CandidateRowInput): boolean {
  if (input.isLocked || !input.canSelect) {
    return true;
  }
  return needsOverride(candidate) && !input.canOverride;
}

export function buildCandidateRow(
  t: Translate,
  locale: string,
  candidate: EligibilityCandidate,
  input: CandidateRowInput,
): CandidateRowView {
  return {
    membershipId: candidate.membershipId,
    fullName: candidate.fullName,
    attendanceLabel: formatAttendance(t, candidate.attendancePct, locale),
    availabilityLabel: formatAvailability(t, candidate.availability),
    jerseyLabel: formatJersey(t, candidate.jerseyNumber, locale),
    overallLabel: t(SIGNAL_STATUS_LABEL_KEYS[candidate.overall]),
    overallTone: SIGNAL_STATUS_TONES[candidate.overall],
    signals: buildSignalChips(t, candidate),
    isSelected: candidate.selected,
    selectedBadge: t(I18N_KEYS.squads.selectedBadge),
    needsOverride: needsOverride(candidate),
    overrideHint: overrideHint(t, candidate, input),
    actionLabel: candidate.selected
      ? t(I18N_KEYS.squads.removeLabel)
      : t(I18N_KEYS.squads.selectLabel),
    isActionDisabled: isActionDisabled(candidate, input),
  };
}

export function buildRatioFacts(
  t: Translate,
  locale: string,
  ratio: GenderRatio,
): readonly FactRowView[] {
  return [
    { key: 'men', label: t(I18N_KEYS.squads.ratioMen), value: formatNumber(ratio.men, locale) },
    {
      key: 'women',
      label: t(I18N_KEYS.squads.ratioWomen),
      value: formatNumber(ratio.women, locale),
    },
    {
      key: 'mixed',
      label: t(I18N_KEYS.squads.ratioMixed),
      value: formatNumber(ratio.mixed, locale),
    },
    {
      key: 'unknown',
      label: t(I18N_KEYS.squads.ratioUnknown),
      value: formatNumber(ratio.unknown, locale),
    },
  ];
}

/** The coach's reason is mandatory and mirrors the server-side minimum. */
export function isOverrideReasonValid(reason: string): boolean {
  return reason.trim().length >= COMPETITION_LIMITS.overrideReasonMin;
}
