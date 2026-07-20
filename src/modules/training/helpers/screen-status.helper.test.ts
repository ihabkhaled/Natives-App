import { describe, expect, it, vi } from 'vitest';

import type { RemoteQueryView } from '@/shared/view';

import type { TrainingContextView } from '../types/training-view.types';
import { resolveTrainingScreenStatus } from './screen-status.helper';

function context(overrides: Partial<TrainingContextView> = {}): TrainingContextView {
  return {
    teamId: 'team-1',
    membershipId: 'm-1',
    isOffline: false,
    canRead: true,
    canSubmit: true,
    canReview: false,
    isLoading: false,
    ...overrides,
  };
}

function query(overrides: Partial<RemoteQueryView<unknown>> = {}): RemoteQueryView<unknown> {
  return { data: {}, isLoading: false, error: null, refetch: vi.fn(), ...overrides };
}

describe('resolveTrainingScreenStatus', () => {
  it('blocks a principal without the grant before anything loads', () => {
    expect(resolveTrainingScreenStatus(context(), query(), false, true)).toBe('forbidden');
  });

  it('never blocks while the context itself is still resolving', () => {
    expect(resolveTrainingScreenStatus(context({ isLoading: true }), query(), false, true)).toBe(
      'loading',
    );
  });

  it('presents ready or empty once the query resolved', () => {
    expect(resolveTrainingScreenStatus(context(), query(), true, true)).toBe('ready');
    expect(resolveTrainingScreenStatus(context(), query(), true, false)).toBe('empty');
  });

  it('presents offline and error only when nothing is cached', () => {
    expect(
      resolveTrainingScreenStatus(
        context({ isOffline: true }),
        query({ data: undefined }),
        true,
        false,
      ),
    ).toBe('offline');
    expect(
      resolveTrainingScreenStatus(
        context(),
        query({ data: undefined, error: new Error('x') as never }),
        true,
        false,
      ),
    ).toBe('error');
  });
});
