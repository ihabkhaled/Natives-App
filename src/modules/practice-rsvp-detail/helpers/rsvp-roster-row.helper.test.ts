import { describe, expect, it, vi } from 'vitest';

import { buildRsvpParticipant } from '../../../../tests/factories/practice-rsvp-detail.factory';
import { buildRosterRow, buildRosterRows } from './rsvp-roster-row.helper';

const t = (key: string): string => key;

describe('buildRosterRow', () => {
  it('renders the membership id itself, since the contract carries no display name', () => {
    const row = buildRosterRow(t, 'en', buildRsvpParticipant({ membershipId: 'member-9' }), {
      onOverride: vi.fn(),
      onViewHistory: vi.fn(),
    });

    expect(row.membershipId).toBe('member-9');
    expect(row.idLabel).toBe('member-9');
  });

  it('folds the responded-at time and no waitlist marker into the detail line', () => {
    const row = buildRosterRow(t, 'en', buildRsvpParticipant({ waitlisted: false }), {
      onOverride: vi.fn(),
      onViewHistory: vi.fn(),
    });

    expect(row.waitlistedLabel).toBeNull();
    expect(row.detailLabel).not.toContain('practiceRsvpDetail.rowWaitlisted');
  });

  it('appends the waitlist marker to the detail line for a waitlisted member', () => {
    const row = buildRosterRow(t, 'en', buildRsvpParticipant({ waitlisted: true }), {
      onOverride: vi.fn(),
      onViewHistory: vi.fn(),
    });

    expect(row.waitlistedLabel).toBe('practiceRsvpDetail.rowWaitlisted');
    expect(row.detailLabel).toContain('practiceRsvpDetail.rowWaitlisted');
  });

  it('addresses each action by the row\'s own membership id', () => {
    const onOverride = vi.fn();
    const onViewHistory = vi.fn();
    const row = buildRosterRow(t, 'en', buildRsvpParticipant({ membershipId: 'member-2' }), {
      onOverride,
      onViewHistory,
    });

    row.onOverride();
    row.onViewHistory();

    expect(onOverride).toHaveBeenCalledWith('member-2');
    expect(onViewHistory).toHaveBeenCalledWith('member-2');
  });
});

describe('buildRosterRows', () => {
  it('maps one row per participant, in order', () => {
    const rows = buildRosterRows(
      t,
      'en',
      [buildRsvpParticipant({ membershipId: 'a' }), buildRsvpParticipant({ membershipId: 'b' })],
      { onOverride: vi.fn(), onViewHistory: vi.fn() },
    );

    expect(rows.map((row) => row.membershipId)).toEqual(['a', 'b']);
  });

  it('returns an empty list for an empty roster', () => {
    expect(buildRosterRows(t, 'en', [], { onOverride: vi.fn(), onViewHistory: vi.fn() })).toEqual(
      [],
    );
  });
});
