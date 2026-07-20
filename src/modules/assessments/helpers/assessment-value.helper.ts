import { METRIC_VALUE_KIND } from '../constants/assessments.constants';
import type { MetricValueKind } from '../constants/assessments.constants';
import type { AssessmentValue, AssessmentValueDraft } from '../types/assessments.types';

/**
 * Null-not-zero. Every function here treats "not evaluated" as its own fact:
 * an empty string, whitespace, or a missing entry becomes `null`, and `0` is
 * only ever produced when the evaluator actually typed a zero.
 */
export function isEvaluated(value: AssessmentValueDraft | AssessmentValue | undefined): boolean {
  if (value === undefined) {
    return false;
  }
  return value.numericValue !== null || value.textValue !== null;
}

/**
 * Parse raw input text into a number or `null`. An empty field is unknown,
 * never zero; a non-numeric field is unknown too.
 */
export function parseNumericInput(raw: string): number | null {
  const trimmed = raw.trim();
  if (trimmed === '') {
    return null;
  }
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
}

/** Normalize free text: blank stays unknown rather than an empty string. */
export function parseTextInput(raw: string): string | null {
  const trimmed = raw.trim();
  return trimmed === '' ? null : trimmed;
}

/** Seed the draft map from the server's values, keeping every null intact. */
export function toDraftValues(
  values: readonly AssessmentValue[],
): Readonly<Record<string, AssessmentValueDraft>> {
  const draft: Record<string, AssessmentValueDraft> = {};
  for (const value of values) {
    draft[value.metricDefinitionId] = {
      metricDefinitionId: value.metricDefinitionId,
      numericValue: value.numericValue,
      textValue: value.textValue,
      note: value.note,
    };
  }
  return draft;
}

/** A blank draft entry: explicitly not evaluated. */
export function emptyDraftValue(metricDefinitionId: string): AssessmentValueDraft {
  return { metricDefinitionId, numericValue: null, textValue: null, note: null };
}

/** Read one metric draft, defaulting to "not evaluated" rather than zero. */
export function readDraftValue(
  draft: Readonly<Record<string, AssessmentValueDraft>>,
  metricDefinitionId: string,
): AssessmentValueDraft {
  return draft[metricDefinitionId] ?? emptyDraftValue(metricDefinitionId);
}

/**
 * Overlay local edits on the server values. The overlay wins so a background
 * refetch never discards what the evaluator is in the middle of typing.
 */
export function mergeDraftEdits(
  serverValues: Readonly<Record<string, AssessmentValueDraft>>,
  edits: Readonly<Record<string, AssessmentValueDraft>>,
): Readonly<Record<string, AssessmentValueDraft>> {
  return { ...serverValues, ...edits };
}

/** Apply one edit, returning a new draft map. */
export function applyDraftEdit(
  draft: Readonly<Record<string, AssessmentValueDraft>>,
  edit: AssessmentValueDraft,
): Readonly<Record<string, AssessmentValueDraft>> {
  return { ...draft, [edit.metricDefinitionId]: edit };
}

/** Clear one metric back to "not evaluated" — never to zero. */
export function clearDraftValue(
  draft: Readonly<Record<string, AssessmentValueDraft>>,
  metricDefinitionId: string,
): Readonly<Record<string, AssessmentValueDraft>> {
  const existing = readDraftValue(draft, metricDefinitionId);
  return applyDraftEdit(draft, {
    metricDefinitionId,
    numericValue: null,
    textValue: null,
    note: existing.note,
  });
}

/** Only metrics carrying a value or a note are worth sending to the server. */
export function toSaveableValues(
  draft: Readonly<Record<string, AssessmentValueDraft>>,
): readonly AssessmentValueDraft[] {
  return Object.values(draft)
    .filter((value) => isEvaluated(value) || value.note !== null)
    .sort((left, right) => left.metricDefinitionId.localeCompare(right.metricDefinitionId));
}

/** How many of the template metrics carry a real evaluation. */
export function countEvaluated(
  draft: Readonly<Record<string, AssessmentValueDraft>>,
  metricIds: readonly string[],
): number {
  return metricIds.filter((id) => isEvaluated(draft[id])).length;
}

/** Whether a scale takes free text rather than a number. */
export function isTextScale(valueKind: MetricValueKind): boolean {
  return valueKind === METRIC_VALUE_KIND.Text || valueKind === METRIC_VALUE_KIND.Categorical;
}

/** Whether a scale is the discrete legacy 0–5 evaluator scale. */
export function isLegacyScoreScale(valueKind: MetricValueKind): boolean {
  return valueKind === METRIC_VALUE_KIND.Legacy05;
}
