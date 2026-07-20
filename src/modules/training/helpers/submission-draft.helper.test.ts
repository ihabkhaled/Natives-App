import { describe, expect, it } from 'vitest';

import { I18N_KEYS } from '@/shared/i18n';

import { buildActivityType as activityType } from '../../../../tests/factories/training.factory';
import { EMPTY_COMPOSER_STATE, type ComposerFormState } from '../constants/training-form.constants';
import {
  toSubmissionDraft,
  validateComposer,
  validateEvidenceDraft,
} from './submission-draft.helper';

const TODAY = '2026-07-13';

function form(overrides: Partial<ComposerFormState> = {}): ComposerFormState {
  return {
    ...EMPTY_COMPOSER_STATE,
    activityTypeId: 'type-gym',
    performedOn: '2026-07-12',
    ...overrides,
  };
}

describe('validateComposer', () => {
  it('requires an activity type before anything else', () => {
    expect(validateComposer(EMPTY_COMPOSER_STATE, null, TODAY)).toBe(
      I18N_KEYS.training.validationTypeRequired,
    );
    expect(validateComposer(form(), null, TODAY)).toBe(I18N_KEYS.training.validationTypeRequired);
  });

  it('requires a performed date', () => {
    expect(validateComposer(form({ performedOn: '  ' }), activityType(), TODAY)).toBe(
      I18N_KEYS.training.validationDateRequired,
    );
  });

  it('rejects a date in the future rather than silently accepting it', () => {
    expect(validateComposer(form({ performedOn: '2026-07-14' }), activityType(), TODAY)).toBe(
      I18N_KEYS.training.validationDateFuture,
    );
  });

  it('accepts a blank duration but rejects one outside the backend bounds', () => {
    expect(validateComposer(form({ duration: '' }), activityType(), TODAY)).toBeNull();
    expect(validateComposer(form({ duration: '0' }), activityType(), TODAY)).toBe(
      I18N_KEYS.training.validationDurationRange,
    );
    expect(validateComposer(form({ duration: '1441' }), activityType(), TODAY)).toBe(
      I18N_KEYS.training.validationDurationRange,
    );
    expect(validateComposer(form({ duration: 'ninety' }), activityType(), TODAY)).toBe(
      I18N_KEYS.training.validationDurationRange,
    );
  });

  it('accepts a blank amount but rejects one outside the backend bounds', () => {
    expect(validateComposer(form({ quantity: '' }), activityType(), TODAY)).toBeNull();
    expect(validateComposer(form({ quantity: '-1' }), activityType(), TODAY)).toBe(
      I18N_KEYS.training.validationQuantityRange,
    );
    expect(validateComposer(form({ quantity: '1000001' }), activityType(), TODAY)).toBe(
      I18N_KEYS.training.validationQuantityRange,
    );
  });

  it('caps the notes at the length the backend accepts', () => {
    expect(validateComposer(form({ notes: 'x'.repeat(4001) }), activityType(), TODAY)).toBe(
      I18N_KEYS.training.validationNotesLength,
    );
  });

  it('demands evidence only for a type that requires it', () => {
    const strict = activityType({ requiresEvidence: true });

    expect(validateComposer(form(), strict, TODAY)).toBe(
      I18N_KEYS.training.validationEvidenceRequired,
    );
    expect(
      validateComposer(
        form({
          evidence: [{ kind: 'link', storageReference: 'https://x.test', description: null }],
        }),
        strict,
        TODAY,
      ),
    ).toBeNull();
  });

  it('accepts a fully valid claim', () => {
    expect(
      validateComposer(form({ duration: '60', quantity: '20' }), activityType(), TODAY),
    ).toBeNull();
  });
});

describe('toSubmissionDraft', () => {
  it('keeps an unstated measure as null instead of collapsing it to zero', () => {
    const draft = toSubmissionDraft(form());

    expect(draft.durationMinutes).toBeNull();
    expect(draft.quantity).toBeNull();
    expect(draft.notes).toBeNull();
  });

  it('carries the stated measures, trimmed notes, buddies, and evidence through', () => {
    const draft = toSubmissionDraft(
      form({
        duration: ' 45 ',
        quantity: '12',
        notes: '  Tempo run.  ',
        buddyMembershipIds: ['m-2'],
        evidence: [{ kind: 'note', storageReference: 'ref', description: 'why' }],
      }),
    );

    expect(draft).toMatchObject({
      durationMinutes: 45,
      quantity: 12,
      notes: 'Tempo run.',
      buddyMembershipIds: ['m-2'],
    });
    expect(draft.evidence).toHaveLength(1);
  });

  it('treats a non-numeric measure as unstated rather than as zero', () => {
    expect(toSubmissionDraft(form({ duration: 'abc' })).durationMinutes).toBeNull();
  });
});

describe('validateEvidenceDraft', () => {
  it('rejects a blank or over-long reference', () => {
    expect(validateEvidenceDraft('   ')).toBe(I18N_KEYS.training.validationReferenceRequired);
    expect(validateEvidenceDraft('x'.repeat(1025))).toBe(
      I18N_KEYS.training.validationReferenceRequired,
    );
  });

  it('accepts a real reference', () => {
    expect(validateEvidenceDraft('https://example.test/a')).toBeNull();
  });
});
