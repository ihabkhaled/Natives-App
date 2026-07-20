import type { ComposerFormState, EvidenceFormState } from '../constants/training-form.constants';
import { validateEvidenceDraft } from './submission-draft.helper';

/**
 * Append the evidence sub-form as a metadata row, or return the form
 * unchanged when the reference is missing. Pure so the hook stays a thin
 * state container.
 */
export function appendEvidence(
  form: ComposerFormState,
  evidenceForm: EvidenceFormState,
): ComposerFormState {
  if (validateEvidenceDraft(evidenceForm.reference) !== null) {
    return form;
  }
  const description = evidenceForm.description.trim();
  return {
    ...form,
    evidence: [
      ...form.evidence,
      {
        kind: evidenceForm.kind,
        storageReference: evidenceForm.reference.trim(),
        description: description === '' ? null : description,
      },
    ],
  };
}

/** Add a buddy once; naming the same member twice is a no-op. */
export function appendBuddy(form: ComposerFormState, membershipId: string): ComposerFormState {
  if (membershipId === '' || form.buddyMembershipIds.includes(membershipId)) {
    return form;
  }
  return { ...form, buddyMembershipIds: [...form.buddyMembershipIds, membershipId] };
}
