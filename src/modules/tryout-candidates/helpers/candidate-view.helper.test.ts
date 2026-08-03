import { describe, expect, it, vi } from 'vitest';

import { MOCK_TRYOUT_CANDIDATES } from '@/tests/msw/tryout-candidates.fixture';

import type { CandidateStatus, TryoutCandidate } from '../types/tryout-candidates.types';
import {
  buildCandidateDetailPanel,
  buildCandidateFacts,
  buildCandidateRow,
  buildCandidateRows,
  buildCandidateStatusLabel,
  buildCandidateStatusTone,
  canWithdrawCandidate,
  resolveCandidatesPage,
} from './candidate-view.helper';

const t = (key: string, params?: Record<string, unknown>): string =>
  params === undefined ? `t:${key}` : `t:${key}:${JSON.stringify(params)}`;
const formatInstant = (iso: string): string => `at:${iso}`;

function candidate(overrides: Partial<TryoutCandidate> = {}): TryoutCandidate {
  return { ...MOCK_TRYOUT_CANDIDATES[0]!, ...overrides };
}

describe('buildCandidateStatusLabel', () => {
  it.each([
    ['registered', 't:tryouts.statusRegistered'],
    ['no_show', 't:attendance.statusAbsent'],
    ['rejected', 't:training.statusRejected'],
    ['converted', 't:tryouts.statusConverted'],
  ] as const)('labels %s through the catalog', (status, expected) => {
    expect(buildCandidateStatusLabel(t, candidate({ status: status as CandidateStatus }))).toBe(
      expected,
    );
  });

  it('says anonymized instead of a status that no longer describes anyone', () => {
    const record = candidate({ status: 'registered', anonymizedAt: '2026-05-02T00:00:00.000Z' });

    expect(buildCandidateStatusLabel(t, record)).toBe('t:members.statusAnonymized');
    expect(buildCandidateStatusTone(record)).toBe('medium');
  });

  it('tones a live status by its own meaning', () => {
    expect(buildCandidateStatusTone(candidate({ status: 'rejected' }))).toBe('danger');
  });
});

describe('canWithdrawCandidate', () => {
  it.each(['registered', 'waitlisted', 'checked_in', 'accepted'] as const)(
    'offers withdrawal while the candidate is %s',
    (status) => {
      expect(canWithdrawCandidate(candidate({ status }))).toBe(true);
    },
  );

  it.each(['no_show', 'withdrawn', 'rejected', 'converted'] as const)(
    'withholds it once the candidate is %s',
    (status) => {
      expect(canWithdrawCandidate(candidate({ status }))).toBe(false);
    },
  );

  it('never offers it on an anonymized record', () => {
    expect(
      canWithdrawCandidate(
        candidate({ status: 'registered', anonymizedAt: '2026-05-02T00:00:00.000Z' }),
      ),
    ).toBe(false);
  });
});

describe('buildCandidateRow', () => {
  it('carries no contact or readiness field, whatever the record holds', () => {
    const row = buildCandidateRow(t, formatInstant, candidate(), '');

    expect(Object.keys(row).sort()).toEqual([
      'candidateId',
      'checkedInLabel',
      'displayName',
      'isSelected',
      'statusLabel',
      'statusTone',
    ]);
  });

  it('leaves the check-in line null rather than showing a placeholder', () => {
    expect(
      buildCandidateRow(t, formatInstant, candidate({ checkedInAt: null }), '').checkedInLabel,
    ).toBeNull();
  });

  it('says when a candidate turned up', () => {
    const row = buildCandidateRow(
      t,
      formatInstant,
      candidate({ checkedInAt: '2026-07-18T15:00:00.000Z' }),
      '',
    );

    expect(row.checkedInLabel).toContain('t:tryouts.checkedInAt');
  });

  it('marks the row a reviewer has open', () => {
    expect(buildCandidateRow(t, formatInstant, candidate(), 'candidate-1').isSelected).toBe(true);
  });
});

describe('buildCandidateRows', () => {
  it('keeps the order the server sent, inventing no ranking of people', () => {
    const rows = buildCandidateRows(t, formatInstant, MOCK_TRYOUT_CANDIDATES, '');

    expect(rows.map((row) => row.candidateId)).toEqual(
      MOCK_TRYOUT_CANDIDATES.map((entry) => entry.candidateId),
    );
  });
});

describe('buildCandidateFacts', () => {
  it('always states which event, what was consented to, and when it expires', () => {
    const facts = buildCandidateFacts(t, formatInstant, candidate());

    expect(facts.map((fact) => fact.key)).toEqual(['event', 'consent', 'retention']);
    expect(facts[2]?.value).toBe('at:2027-07-01T09:00:00.000Z');
  });

  it('adds only the milestones that actually happened', () => {
    const facts = buildCandidateFacts(
      t,
      formatInstant,
      candidate({
        checkedInAt: '2026-07-18T15:00:00.000Z',
        withdrawnAt: '2026-07-19T15:00:00.000Z',
        convertedAt: '2026-07-20T15:00:00.000Z',
      }),
    );

    expect(facts.map((fact) => fact.key)).toEqual([
      'event',
      'consent',
      'retention',
      'checked-in',
      'withdrawn',
      'converted',
    ]);
  });
});

describe('buildCandidateDetailPanel', () => {
  it('renders both restricted blocks even when neither is disclosed', () => {
    const panel = buildCandidateDetailPanel({
      t,
      formatInstant,
      candidate: candidate(),
      grants: { canReadContacts: false, canReadReadiness: false },
      onWithdraw: vi.fn(),
    });

    expect(panel.blocks.map((block) => block.key)).toEqual(['contacts', 'readiness']);
    expect(panel.blocks.every((block) => !block.isDisclosed)).toBe(true);
  });

  it('names the candidate and repeats the privacy promise on the record', () => {
    const panel = buildCandidateDetailPanel({
      t,
      formatInstant,
      candidate: candidate(),
      grants: { canReadContacts: true, canReadReadiness: true },
      onWithdraw: vi.fn(),
    });

    expect(panel.displayName).toBe('Nour El-Sayed');
    expect(panel.notice).toBe('t:tryouts.privacyNotice');
    expect(panel.canWithdraw).toBe(true);
  });

  it('hands the withdrawal trigger straight back to its caller', () => {
    const onWithdraw = vi.fn();
    const panel = buildCandidateDetailPanel({
      t,
      formatInstant,
      candidate: candidate(),
      grants: { canReadContacts: false, canReadReadiness: false },
      onWithdraw,
    });
    panel.onWithdraw();

    expect(onWithdraw).toHaveBeenCalledOnce();
  });
});

describe('resolveCandidatesPage', () => {
  it('reports no data before the query resolves, rather than an empty queue', () => {
    expect(resolveCandidatesPage(undefined)).toEqual({ items: [], total: 0, hasData: false });
  });

  it('carries the items and the server total once it resolves', () => {
    const page = resolveCandidatesPage({
      items: [...MOCK_TRYOUT_CANDIDATES],
      total: 12,
      limit: 25,
      offset: 0,
    });

    expect(page).toMatchObject({ total: 12, hasData: true });
    expect(page.items).toHaveLength(MOCK_TRYOUT_CANDIDATES.length);
  });
});
