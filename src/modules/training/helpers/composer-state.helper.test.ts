import { describe, expect, it } from 'vitest';

import { EMPTY_COMPOSER_STATE, EMPTY_EVIDENCE_FORM } from '../constants/training-form.constants';
import { appendBuddy, appendEvidence } from './composer-state.helper';

describe('appendEvidence', () => {
  it('leaves the form untouched when the reference is missing', () => {
    expect(appendEvidence(EMPTY_COMPOSER_STATE, EMPTY_EVIDENCE_FORM)).toBe(EMPTY_COMPOSER_STATE);
  });

  it('appends the metadata row with a trimmed reference', () => {
    const next = appendEvidence(EMPTY_COMPOSER_STATE, {
      ...EMPTY_EVIDENCE_FORM,
      reference: '  https://example.test  ',
      description: '  proof  ',
    });

    expect(next.evidence).toEqual([
      { kind: 'link', storageReference: 'https://example.test', description: 'proof' },
    ]);
  });

  it('records an absent description as null rather than an empty string', () => {
    const next = appendEvidence(EMPTY_COMPOSER_STATE, {
      ...EMPTY_EVIDENCE_FORM,
      reference: 'ref',
      description: '   ',
    });

    expect(next.evidence[0]?.description).toBeNull();
  });
});

describe('appendBuddy', () => {
  it('ignores an empty selection', () => {
    expect(appendBuddy(EMPTY_COMPOSER_STATE, '')).toBe(EMPTY_COMPOSER_STATE);
  });

  it('ignores a buddy who is already named', () => {
    const form = { ...EMPTY_COMPOSER_STATE, buddyMembershipIds: ['m-2'] };

    expect(appendBuddy(form, 'm-2')).toBe(form);
  });

  it('adds a new buddy to the invitation list', () => {
    expect(appendBuddy(EMPTY_COMPOSER_STATE, 'm-2').buddyMembershipIds).toEqual(['m-2']);
  });
});
