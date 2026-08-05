import { describe, expect, it, vi } from 'vitest';

import { buildRsvpParticipant, buildRsvpSummary } from '../../../../tests/factories/practice-rsvp-detail.factory';
import { buildRsvpDetailView, type RsvpDetailViewInput } from './practice-rsvp-detail-view.helper';

const t = (key: string, params?: Readonly<Record<string, unknown>>): string =>
  params === undefined ? key : `${key}:${JSON.stringify(params)}`;

function input(overrides: Partial<RsvpDetailViewInput> = {}): RsvpDetailViewInput {
  return {
    locale: 'en',
    isLoading: false,
    isForbidden: false,
    hasError: false,
    summary: buildRsvpSummary(),
    participants: [buildRsvpParticipant()],
    total: 1,
    statusFilter: '',
    onStatusFilterChange: vi.fn(),
    hasMore: false,
    isLoadingMore: false,
    onLoadMore: vi.fn(),
    rosterActions: { onOverride: vi.fn(), onViewHistory: vi.fn() },
    panel: { kind: 'none' },
    ...overrides,
  };
}

describe('buildRsvpDetailView', () => {
  it('carries the state flags straight through', () => {
    const view = buildRsvpDetailView(t, input({ isLoading: true, isForbidden: true, hasError: true }));

    expect(view.isLoading).toBe(true);
    expect(view.isForbidden).toBe(true);
    expect(view.hasError).toBe(true);
  });

  it('builds the summary when it has loaded, and null before it has', () => {
    expect(buildRsvpDetailView(t, input()).summary).not.toBeNull();
    expect(buildRsvpDetailView(t, input({ summary: undefined })).summary).toBeNull();
  });

  it('puts "all" first in the status filter options', () => {
    const view = buildRsvpDetailView(t, input());

    expect(view.statusFilterOptions[0]).toEqual({
      value: '',
      label: 'practiceRsvpDetail.statusFilterAll',
    });
  });

  it('reports the roster count with its number', () => {
    const view = buildRsvpDetailView(t, input({ total: 7 }));

    expect(view.countLabel).toContain('"count":7');
  });

  it('translates one row per participant', () => {
    const view = buildRsvpDetailView(
      t,
      input({ participants: [buildRsvpParticipant({ membershipId: 'a' }), buildRsvpParticipant({ membershipId: 'b' })] }),
    );

    expect(view.rows.map((row) => row.membershipId)).toEqual(['a', 'b']);
  });

  it('resolves the panel to "none" when nothing is open', () => {
    expect(buildRsvpDetailView(t, input()).panel).toEqual({ kind: 'none' });
  });

  it('resolves an open override panel', () => {
    const view = buildRsvpDetailView(
      t,
      input({
        panel: {
          kind: 'override',
          draft: {
            membershipId: 'a',
            status: 'going',
            reason: 'Told us in person.',
            reasonCategory: '',
            note: '',
            noteVisibility: '',
            isSubmitting: false,
          },
          actions: {
            onStatusChange: vi.fn(),
            onReasonChange: vi.fn(),
            onReasonCategoryChange: vi.fn(),
            onNoteChange: vi.fn(),
            onNoteVisibilityChange: vi.fn(),
            onSubmit: vi.fn(),
            onCancel: vi.fn(),
          },
        },
      }),
    );

    expect(view.panel.kind).toBe('override');
  });

  it('resolves an open history panel', () => {
    const view = buildRsvpDetailView(
      t,
      input({
        panel: {
          kind: 'history',
          history: { membershipId: 'a', isLoading: false, items: [], onClose: vi.fn() },
        },
      }),
    );

    expect(view.panel.kind).toBe('history');
  });

  it('passes hasMore, isLoadingMore, and onLoadMore straight through', () => {
    const onLoadMore = vi.fn();
    const view = buildRsvpDetailView(t, input({ hasMore: true, isLoadingMore: true, onLoadMore }));

    expect(view.hasMore).toBe(true);
    expect(view.isLoadingMore).toBe(true);
    expect(view.onLoadMore).toBe(onLoadMore);
  });
});
