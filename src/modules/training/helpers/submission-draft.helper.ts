import { I18N_KEYS } from '@/shared/i18n';

import type { ComposerFormState } from '../constants/training-form.constants';
import { SUBMISSION_LIMITS } from '../constants/training.constants';
import type { ActivityType, SubmissionDraft } from '../types/training.types';

/**
 * Parse an optional numeric field. An empty field is `null` ("not stated"),
 * never `0` — a session with no recorded duration is not a zero-minute one.
 */
function parseOptionalNumber(raw: string): number | null {
  const trimmed = raw.trim();
  if (trimmed === '') {
    return null;
  }
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
}

function isBlank(value: string): boolean {
  return value.trim() === '';
}

function outOfRange(raw: string, minimum: number, maximum: number): boolean {
  if (isBlank(raw)) {
    return false;
  }
  const parsed = parseOptionalNumber(raw);
  return parsed === null || parsed < minimum || parsed > maximum;
}

function validateWhen(raw: string, todayIso: string): string | null {
  if (isBlank(raw)) {
    return I18N_KEYS.training.validationDateRequired;
  }
  return raw > todayIso ? I18N_KEYS.training.validationDateFuture : null;
}

function validateMeasures(form: ComposerFormState): string | null {
  const { minDurationMinutes, maxDurationMinutes, minQuantity, maxQuantity, maxNotesLength } =
    SUBMISSION_LIMITS;
  if (outOfRange(form.duration, minDurationMinutes, maxDurationMinutes)) {
    return I18N_KEYS.training.validationDurationRange;
  }
  if (outOfRange(form.quantity, minQuantity, maxQuantity)) {
    return I18N_KEYS.training.validationQuantityRange;
  }
  return form.notes.length > maxNotesLength ? I18N_KEYS.training.validationNotesLength : null;
}

/**
 * Validate the composer against the same bounds the backend enforces, and
 * return the first violated rule's i18n key. `todayIso` is injected so tests
 * freeze time rather than depending on the wall clock.
 */
export function validateComposer(
  form: ComposerFormState,
  activityType: ActivityType | null,
  todayIso: string,
): string | null {
  if (isBlank(form.activityTypeId) || activityType === null) {
    return I18N_KEYS.training.validationTypeRequired;
  }
  const when = validateWhen(form.performedOn, todayIso);
  if (when !== null) {
    return when;
  }
  const measures = validateMeasures(form);
  if (measures !== null) {
    return measures;
  }
  return activityType.requiresEvidence && form.evidence.length === 0
    ? I18N_KEYS.training.validationEvidenceRequired
    : null;
}

/** Project validated composer state onto the wire draft the services take. */
export function toSubmissionDraft(form: ComposerFormState): SubmissionDraft {
  return {
    activityTypeId: form.activityTypeId,
    performedOn: form.performedOn,
    durationMinutes: parseOptionalNumber(form.duration),
    quantity: parseOptionalNumber(form.quantity),
    notes: isBlank(form.notes) ? null : form.notes.trim(),
    buddyMembershipIds: form.buddyMembershipIds,
    evidence: form.evidence,
  };
}

/** Reject an evidence row with no reference; description stays optional. */
export function validateEvidenceDraft(reference: string): string | null {
  return isBlank(reference) || reference.length > SUBMISSION_LIMITS.maxReferenceLength
    ? I18N_KEYS.training.validationReferenceRequired
    : null;
}
