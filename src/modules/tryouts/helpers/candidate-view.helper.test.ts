import { describe, expect, it } from 'vitest';

import {
  buildCandidateDetail,
  buildCandidateSummary,
  buildTryoutEvent,
} from '../../../../tests/factories/tryouts.factory';
import {
  buildCandidateRow,
  buildCandidateStatusOptions,
  buildContactsBlock,
  buildReadinessBlock,
  buildTryoutCard,
  buildTryoutFacts,
  buildTryoutHeadline,
  canCheckIn,
} from './candidate-view.helper';

const t = (key: string): string => key;
const instant = (iso: string): string => `cairo:${iso}`;

const event = buildTryoutEvent;

const summary = buildCandidateSummary;

const detail = buildCandidateDetail;

describe('buildTryoutCard and buildTryoutFacts', () => {
  it('summarises capacity and waitlist without inventing numbers', () => {
    const card = buildTryoutCard(t, instant, event());

    expect(card.capacityLabel).toBe('tryouts.capacitySummary');
    expect(card.waitlistLabel).toBe('tryouts.waitlistSummary');
    expect(card.statusTone).toBe('success');
  });

  it('returns no facts while the event is still loading', () => {
    expect(buildTryoutFacts(t, instant, null)).toEqual([]);
  });

  it('lists the held-at, capacity, and waitlist facts', () => {
    expect(buildTryoutFacts(t, instant, event()).map((fact) => fact.key)).toEqual([
      'held',
      'capacity',
      'waitlist',
    ]);
  });
});

describe('buildTryoutHeadline', () => {
  it('degrades to a titled, tone-neutral header while the record is absent', () => {
    expect(buildTryoutHeadline(t, null)).toEqual({
      heading: 'tryouts.detailTitle',
      statusLabel: '',
      statusTone: 'medium',
    });
  });

  it('uses the event name once the record arrives', () => {
    expect(buildTryoutHeadline(t, event({ status: 'closed' }))).toEqual({
      heading: 'Autumn intake',
      statusLabel: 'tryouts.eventStatusClosed',
      statusTone: 'warning',
    });
  });
});

describe('candidate rows', () => {
  it('offers check-in only while the candidate is registered or waitlisted', () => {
    expect(canCheckIn(summary())).toBe(true);
    expect(canCheckIn(summary({ status: 'waitlisted' }))).toBe(true);
    expect(canCheckIn(summary({ status: 'checked_in' }))).toBe(false);
    expect(canCheckIn(summary({ status: 'converted' }))).toBe(false);
  });

  it('never exposes a contact field on a list row', () => {
    const row = buildCandidateRow(t, instant, summary(), '');

    expect(Object.keys(row)).not.toContain('email');
    expect(Object.keys(row)).not.toContain('phone');
    expect(Object.keys(row)).not.toContain('readiness');
  });

  it('marks the selected row and formats the check-in instant', () => {
    const row = buildCandidateRow(
      t,
      instant,
      summary({ status: 'checked_in', checkedInAt: '2026-08-15T14:40:00.000Z' }),
      'cand-1',
    );

    expect(row.isSelected).toBe(true);
    expect(row.checkedInLabel).toBe('tryouts.checkedInAt');
    expect(row.canCheckIn).toBe(false);
  });

  it('leaves the check-in label empty for someone who never arrived', () => {
    expect(buildCandidateRow(t, instant, summary(), '').checkedInLabel).toBeNull();
  });

  it('puts "all" first in the status filter', () => {
    expect(buildCandidateStatusOptions(t)[0]?.value).toBe('all');
  });
});

describe('restricted blocks', () => {
  it('hides contacts without the grant, even when the payload carried them', () => {
    const block = buildContactsBlock(t, detail(), false);

    expect(block.isPermitted).toBe(false);
    expect(block.facts).toEqual([]);
    expect(block.restrictedTitle).toBe('tryouts.contactsRestrictedTitle');
  });

  it('hides contacts when the server omitted them, even with the grant', () => {
    const block = buildContactsBlock(t, detail({ contacts: null }), true);

    expect(block.isPermitted).toBe(false);
    expect(block.facts).toEqual([]);
  });

  it('shows contacts only when both the grant and the payload are present', () => {
    const block = buildContactsBlock(t, detail(), true);

    expect(block.isPermitted).toBe(true);
    expect(block.facts.map((fact) => fact.value)).toEqual(['one@example.test', '+20 100 000 0001']);
  });

  it('states a missing phone rather than leaving the row blank', () => {
    const block = buildContactsBlock(
      t,
      detail({ contacts: { email: 'one@example.test', phone: null } }),
      true,
    );

    expect(block.facts[1]?.value).toBe('tryouts.readinessNone');
  });

  it('applies the same two-condition rule to readiness notes', () => {
    expect(buildReadinessBlock(t, detail(), false).isPermitted).toBe(false);
    expect(buildReadinessBlock(t, detail({ readiness: null }), true).isPermitted).toBe(false);

    const allowed = buildReadinessBlock(t, detail(), true);
    expect(allowed.isPermitted).toBe(true);
    expect(allowed.facts[0]?.value).toBe('Cleared to run.');
    expect(allowed.notice).toBe('tryouts.readinessExportNotice');
  });

  it('states an empty readiness note instead of rendering nothing', () => {
    const block = buildReadinessBlock(
      t,
      detail({ readiness: { note: null, recordedAt: null } }),
      true,
    );

    expect(block.facts[0]?.value).toBe('tryouts.readinessNone');
  });
});
