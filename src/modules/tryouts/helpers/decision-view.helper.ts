import type { TranslateParams } from '@/packages/i18n';
import { I18N_KEYS } from '@/shared/i18n';

import {
  CRITERION_LABEL_KEYS,
  DECISION_LABEL_KEYS,
  DECISION_TONES,
} from '../constants/tryouts-labels.constants';
import {
  EVALUATION_CRITERIA,
  TRYOUT_LIMITS,
  type EvaluationCriterion,
} from '../constants/tryouts.constants';
import type { CandidateDetail, EvaluationScore } from '../types/tryouts.types';
import type { EvaluationRowView, TryoutFactView, TryoutsOption } from '../types/tryouts-view.types';

type Translate = (key: string, params?: TranslateParams) => string;

/** The score select values. "" means "not scored" and maps back to null. */
export const NOT_SCORED_VALUE = '';

export function buildScoreOptions(t: Translate): readonly TryoutsOption[] {
  const span = TRYOUT_LIMITS.scoreMax - TRYOUT_LIMITS.scoreMin + 1;
  const scores = Array.from({ length: span }, (_unused, index) => {
    const label = String(TRYOUT_LIMITS.scoreMin + index);
    return { value: label, label };
  });
  return [{ value: NOT_SCORED_VALUE, label: t(I18N_KEYS.tryouts.evaluationNotScored) }, ...scores];
}

/** A blank selection stays null so an unobserved criterion is never a zero. */
export function parseScore(value: string): number | null {
  return value === NOT_SCORED_VALUE ? null : Number.parseInt(value, 10);
}

export function scoreToValue(score: number | null): string {
  return score === null ? NOT_SCORED_VALUE : String(score);
}

/** Current scores keyed by criterion, defaulting every unseen one to null. */
export function buildScoreDraft(
  scores: readonly EvaluationScore[],
): Record<EvaluationCriterion, string> {
  const byCriterion = new Map(scores.map((item) => [item.criterion, item.score]));
  const draft = {} as Record<EvaluationCriterion, string>;
  for (const criterion of EVALUATION_CRITERIA) {
    draft[criterion] = scoreToValue(byCriterion.get(criterion) ?? null);
  }
  return draft;
}

export function buildEvaluationRows(
  t: Translate,
  draft: Record<EvaluationCriterion, string>,
  options: readonly TryoutsOption[],
  onChange: (criterion: EvaluationCriterion, value: string) => void,
): readonly EvaluationRowView[] {
  return EVALUATION_CRITERIA.map((criterion) => ({
    criterion,
    label: t(CRITERION_LABEL_KEYS[criterion]),
    value: draft[criterion],
    options,
    onChange: (value: string) => {
      onChange(criterion, value);
    },
  }));
}

export function draftToScores(draft: Record<EvaluationCriterion, string>): EvaluationScore[] {
  return EVALUATION_CRITERIA.map((criterion) => ({
    criterion,
    score: parseScore(draft[criterion]),
  }));
}

/** Decisions always carry a reason; the minimum mirrors the server rule. */
export function isDecisionReasonValid(reason: string): boolean {
  return reason.trim().length >= TRYOUT_LIMITS.reasonMin;
}

export function decisionLabel(t: Translate, detail: CandidateDetail | null): string | null {
  const decision = detail?.decision ?? null;
  return decision === null ? null : t(DECISION_LABEL_KEYS[decision.outcome]);
}

export function decisionTone(outcome: keyof typeof DECISION_TONES): string {
  return DECISION_TONES[outcome];
}

/**
 * The conversion preview. Only an accepted candidate may be converted, and
 * converting one twice changes nothing.
 */
export function buildConversionFacts(
  t: Translate,
  detail: CandidateDetail | null,
): readonly TryoutFactView[] {
  if (detail === null) {
    return [];
  }
  return [
    {
      key: 'name',
      label: t(I18N_KEYS.tryouts.registrationNameLabel),
      value: detail.summary.displayName,
    },
    {
      key: 'reference',
      label: t(I18N_KEYS.tryouts.referenceLabel),
      value: detail.summary.reference,
    },
    {
      key: 'consent',
      label: t(I18N_KEYS.tryouts.consentHeading),
      value: t(I18N_KEYS.tryouts.consentVersionLabel, { version: detail.consentVersion }),
    },
  ];
}

export function isConvertible(detail: CandidateDetail | null): boolean {
  return (
    detail !== null && detail.summary.status === 'accepted' && detail.convertedMembershipId === null
  );
}
