import { describe, expect, it } from 'vitest';

import {
  MOCK_TRYOUT_CANDIDATES,
  redactTryoutCandidate,
} from '@/tests/msw/tryout-candidates.fixture';

import type { TryoutCandidate } from '../types/tryout-candidates.types';
import {
  buildCandidateDisclosures,
  buildContactsDisclosure,
  buildReadinessDisclosure,
} from './candidate-disclosure.helper';

const t = (key: string): string => `t:${key}`;

function candidate(overrides: Partial<TryoutCandidate> = {}): TryoutCandidate {
  return { ...MOCK_TRYOUT_CANDIDATES[0]!, ...overrides };
}

/** The payload the backend actually sends a caller without the grants. */
function redacted(): TryoutCandidate {
  return redactTryoutCandidate(MOCK_TRYOUT_CANDIDATES[0]!);
}

describe('buildContactsDisclosure', () => {
  it('discloses the reference under the channel the candidate chose', () => {
    const view = buildContactsDisclosure(t, candidate(), true);

    expect(view.isDisclosed).toBe(true);
    expect(view.facts).toEqual([
      {
        key: 'contact-reference',
        label: 't:tryouts.contactEmailLabel',
        value: 'nour@example.test',
      },
    ]);
  });

  it('withholds the block when the caller does not hold the contacts grant', () => {
    const view = buildContactsDisclosure(t, candidate(), false);

    expect(view.isDisclosed).toBe(false);
    expect(view.withheldTitle).toBe('t:tryouts.contactsRestrictedTitle');
  });

  it('carries no facts at all when the block is withheld', () => {
    // Not merely hidden downstream: the value never enters the view model, so
    // no later refactor can render something the caller was not given.
    expect(buildContactsDisclosure(t, candidate(), false).facts).toEqual([]);
  });

  it('withholds the block when the server omitted it, even with the grant', () => {
    // Both must agree. A permissive client cannot invent data the server
    // refused to send.
    expect(buildContactsDisclosure(t, redacted(), true).isDisclosed).toBe(false);
  });

  it('says the candidate provided nothing rather than implying a restriction', () => {
    const view = buildContactsDisclosure(
      t,
      candidate({ contactChannel: 'none', contactReference: null }),
      true,
    );

    expect(view.isDisclosed).toBe(true);
    expect(view.facts[0]?.value).toBe('t:members.fieldNotProvided');
  });

  it('treats a blank reference as not provided', () => {
    const view = buildContactsDisclosure(t, candidate({ contactReference: '   ' }), true);

    expect(view.facts[0]?.value).toBe('t:members.fieldNotProvided');
  });

  it('reads a WhatsApp reference as the phone number it is', () => {
    const view = buildContactsDisclosure(
      t,
      candidate({ contactChannel: 'whatsapp', contactReference: '+20 100 000 0000' }),
      true,
    );

    expect(view.facts[0]?.label).toBe('t:tryouts.contactPhoneLabel');
  });
});

describe('buildReadinessDisclosure', () => {
  it('discloses the written note when the caller holds the readiness grant', () => {
    const view = buildReadinessDisclosure(t, candidate(), true);

    expect(view.isDisclosed).toBe(true);
    expect(view.facts[0]?.value).toBe('Recovered from an ankle sprain last season.');
  });

  it('withholds the block without the grant', () => {
    const view = buildReadinessDisclosure(t, candidate(), false);

    expect(view.isDisclosed).toBe(false);
    expect(view.facts).toEqual([]);
  });

  it('withholds the block when the server omitted it', () => {
    expect(buildReadinessDisclosure(t, redacted(), true).isDisclosed).toBe(false);
  });

  it('distinguishes a candidate who wrote nothing from a withheld block', () => {
    // `null` is a disclosed blank; `undefined` is a refusal. The first says
    // "nothing recorded", the second says "you may not read this".
    const view = buildReadinessDisclosure(t, candidate({ restrictedNotes: null }), true);

    expect(view.isDisclosed).toBe(true);
    expect(view.facts[0]?.value).toBe('t:tryouts.readinessNone');
  });
});

describe('buildCandidateDisclosures', () => {
  it('always returns both blocks so a restriction is visible, not silent', () => {
    const blocks = buildCandidateDisclosures(t, candidate(), {
      canReadContacts: false,
      canReadReadiness: false,
    });

    expect(blocks.map((block) => block.key)).toEqual(['contacts', 'readiness']);
    expect(blocks.every((block) => !block.isDisclosed)).toBe(true);
  });

  it('grants the two blocks independently', () => {
    const blocks = buildCandidateDisclosures(t, candidate(), {
      canReadContacts: true,
      canReadReadiness: false,
    });

    expect(blocks[0]?.isDisclosed).toBe(true);
    expect(blocks[1]?.isDisclosed).toBe(false);
  });
});
