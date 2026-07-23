import { waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { renderHookWithProviders } from '../../../../tests/setup/render-with-providers.helper';
import { buildMyBuddiesQueryOptions } from '../queries/training.query';
import { listMyBuddies } from '../services/list-my-buddies.service';
import { useMyBuddiesQuery } from './use-my-buddies-query.hook';

vi.mock('../services/list-my-buddies.service', () => ({ listMyBuddies: vi.fn() }));

afterEach(() => {
  vi.clearAllMocks();
});

describe('useMyBuddiesQuery', () => {
  it('exposes the bounded credit page', async () => {
    vi.mocked(listMyBuddies).mockResolvedValue({ items: [], total: 0 });

    const { result } = renderHookWithProviders(() => useMyBuddiesQuery('team-1'));

    await waitFor(() => {
      expect(result.current.data).toEqual({ items: [], total: 0 });
    });
  });

  it('stays idle before the team scope resolves', () => {
    expect(buildMyBuddiesQueryOptions('').enabled).toBe(false);
  });
});
