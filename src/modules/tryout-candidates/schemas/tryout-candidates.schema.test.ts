import { describe, expect, it } from 'vitest';

import {
  MOCK_TRYOUT_CANDIDATES,
  redactTryoutCandidate,
} from '@/tests/msw/tryout-candidates.fixture';

import {
  listTryoutCandidatesResponseSchema,
  tryoutCandidateResponseSchema,
  tryoutRetentionResponseSchema,
} from './tryout-candidates.schema';

/** The unredacted record every case starts from. */
const FULL = MOCK_TRYOUT_CANDIDATES[0]!;

describe('tryoutCandidateResponseSchema', () => {
  it('accepts the complete record a fully-granted caller receives', () => {
    expect(tryoutCandidateResponseSchema.safeParse(FULL).success).toBe(true);
  });

  it('accepts the payload a caller with neither read grant receives', () => {
    // This is the least-privileged caller. A schema that required those fields
    // would reject exactly the reader the redaction exists to protect against.
    const parsed = tryoutCandidateResponseSchema.safeParse(redactTryoutCandidate(FULL));

    expect(parsed.success).toBe(true);
    expect(parsed.data?.contactChannel).toBeUndefined();
    expect(parsed.data?.restrictedNotes).toBeUndefined();
  });

  it('accepts a payload with only the readiness half withheld', () => {
    const { readiness: _readiness, restrictedNotes: _notes, ...rest } = FULL;
    const parsed = tryoutCandidateResponseSchema.safeParse(rest);

    expect(parsed.success).toBe(true);
    expect(parsed.data?.contactChannel).toBe('email');
    expect(parsed.data?.readiness).toBeUndefined();
  });

  it('keeps a null contact reference distinct from an omitted one', () => {
    // Null means the candidate gave no reference; undefined means the server
    // refused to send it. Collapsing the two would lie about a person's data.
    const parsed = tryoutCandidateResponseSchema.safeParse({ ...FULL, contactReference: null });

    expect(parsed.success).toBe(true);
    expect(parsed.data?.contactReference).toBeNull();
  });

  it('rejects a record missing an unrestricted field, which is a contract break', () => {
    const { displayName: _displayName, ...rest } = FULL;

    expect(tryoutCandidateResponseSchema.safeParse(rest).success).toBe(false);
  });

  it('rejects a status outside the contract enum', () => {
    // `evaluated` belongs to the older per-event tryouts contract. Reusing that
    // union here would let a status this API never sends through the door.
    expect(tryoutCandidateResponseSchema.safeParse({ ...FULL, status: 'evaluated' }).success).toBe(
      false,
    );
  });

  it('requires a retention expiry on every record', () => {
    const { retentionExpiresAt: _retentionExpiresAt, ...rest } = FULL;

    expect(tryoutCandidateResponseSchema.safeParse(rest).success).toBe(false);
  });
});

describe('listTryoutCandidatesResponseSchema', () => {
  it('parses the bounded page envelope', () => {
    const parsed = listTryoutCandidatesResponseSchema.safeParse({
      items: MOCK_TRYOUT_CANDIDATES,
      total: 4,
      limit: 25,
      offset: 0,
    });

    expect(parsed.success).toBe(true);
    expect(parsed.data?.items).toHaveLength(4);
  });
});

describe('tryoutRetentionResponseSchema', () => {
  it('parses the sweep report, naming what it anonymized', () => {
    const parsed = tryoutRetentionResponseSchema.safeParse({
      examined: 4,
      anonymized: 1,
      candidateIds: ['candidate-4'],
    });

    expect(parsed.data?.candidateIds).toEqual(['candidate-4']);
  });
});
