import { describe, expect, it, vi } from 'vitest';

import { buildRsvpRevision } from '../../../../tests/factories/practice-rsvp-detail.factory';
import { buildHistoryPanelView } from './rsvp-history-panel.helper';

const t = (key: string, params?: Readonly<Record<string, unknown>>): string =>
  params === undefined ? key : `${key}:${JSON.stringify(params)}`;

describe('buildHistoryPanelView', () => {
  it('carries the membership id and loading state through', () => {
    const view = buildHistoryPanelView(t, 'en', {
      membershipId: 'member-1',
      isLoading: true,
      items: [],
      onClose: vi.fn(),
    });

    expect(view.membershipId).toBe('member-1');
    expect(view.isLoading).toBe(true);
  });

  it('states "set to Y" for the first response on record', () => {
    const view = buildHistoryPanelView(t, 'en', {
      membershipId: 'member-1',
      isLoading: false,
      items: [buildRsvpRevision({ fromStatus: null, toStatus: 'going' })],
      onClose: vi.fn(),
    });

    expect(view.items[0]?.transitionLabel).toContain('historyTransitionFromNone');
  });

  it('states "from X to Y" once a prior status is on record', () => {
    const view = buildHistoryPanelView(t, 'en', {
      membershipId: 'member-1',
      isLoading: false,
      items: [buildRsvpRevision({ fromStatus: 'no_response', toStatus: 'not_going' })],
      onClose: vi.fn(),
    });

    expect(view.items[0]?.transitionLabel).toContain('historyTransition:');
  });

  it('distinguishes a coach override from a normally recorded response', () => {
    const overridden = buildHistoryPanelView(t, 'en', {
      membershipId: 'member-1',
      isLoading: false,
      items: [buildRsvpRevision({ isOverride: true })],
      onClose: vi.fn(),
    });
    const recorded = buildHistoryPanelView(t, 'en', {
      membershipId: 'member-1',
      isLoading: false,
      items: [buildRsvpRevision({ isOverride: false })],
      onClose: vi.fn(),
    });

    expect(overridden.items[0]?.attributionLabel).toContain('historyAttributionOverride');
    expect(recorded.items[0]?.attributionLabel).toContain('historyAttributionRecorded');
  });

  it('prefers the override reason over the reason category when both are present', () => {
    const view = buildHistoryPanelView(t, 'en', {
      membershipId: 'member-1',
      isLoading: false,
      items: [
        buildRsvpRevision({ overrideReason: 'Told us in person.', reasonCategory: 'work' }),
      ],
      onClose: vi.fn(),
    });

    expect(view.items[0]?.reasonLabel).toBe('Told us in person.');
  });

  it('falls back to the reason category label when there is no override reason', () => {
    const view = buildHistoryPanelView(t, 'en', {
      membershipId: 'member-1',
      isLoading: false,
      items: [buildRsvpRevision({ overrideReason: null, reasonCategory: 'work' })],
      onClose: vi.fn(),
    });

    expect(view.items[0]?.reasonLabel).toBe('practice.reasonWork');
  });

  it('reports no reason when neither is present', () => {
    const view = buildHistoryPanelView(t, 'en', {
      membershipId: 'member-1',
      isLoading: false,
      items: [buildRsvpRevision({ overrideReason: null, reasonCategory: null })],
      onClose: vi.fn(),
    });

    expect(view.items[0]?.reasonLabel).toBeNull();
  });

  it('passes the note through untranslated', () => {
    const view = buildHistoryPanelView(t, 'en', {
      membershipId: 'member-1',
      isLoading: false,
      items: [buildRsvpRevision({ note: 'Called ahead.' })],
      onClose: vi.fn(),
    });

    expect(view.items[0]?.noteLabel).toBe('Called ahead.');
  });
});
