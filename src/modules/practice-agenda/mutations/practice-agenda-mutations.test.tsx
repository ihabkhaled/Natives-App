import { act, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { renderHookWithProviders } from '../../../../tests/setup/render-with-providers.helper';
import { removeAgendaStation } from '../services/remove-agenda-station.service';
import { reorderAgendaBlocks } from '../services/reorder-agenda-blocks.service';
import { useRemoveStationMutation } from './use-remove-station-mutation.hook';
import { useReorderBlocksMutation } from './use-reorder-blocks-mutation.hook';

vi.mock('../services/reorder-agenda-blocks.service', () => ({ reorderAgendaBlocks: vi.fn() }));
vi.mock('../services/remove-agenda-station.service', () => ({ removeAgendaStation: vi.fn() }));

const SCOPE = { teamId: 't1', sessionId: 's1' };

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(reorderAgendaBlocks).mockResolvedValue({} as never);
  vi.mocked(removeAgendaStation).mockResolvedValue(undefined);
});

describe('useReorderBlocksMutation', () => {
  it('sends the whole order with the version it was drawn against', async () => {
    const onSuccess = vi.fn();
    const { result } = renderHookWithProviders(() =>
      useReorderBlocksMutation(SCOPE, { onSuccess, onError: vi.fn() }),
    );

    act(() => {
      result.current.run({ blockIds: ['b2', 'b1'], expectedVersion: 4 });
    });

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled();
    });
    // The version travels so the server can refuse a move made against a plan
    // that has already changed, instead of overwriting it.
    expect(reorderAgendaBlocks).toHaveBeenCalledWith({
      teamId: 't1',
      sessionId: 's1',
      blockIds: ['b2', 'b1'],
      expectedVersion: 4,
    });
  });

  it('reports a refused move instead of leaving the plan silently wrong', async () => {
    vi.mocked(reorderAgendaBlocks).mockRejectedValue(new Error('conflict'));
    const onError = vi.fn();
    const { result } = renderHookWithProviders(() =>
      useReorderBlocksMutation(SCOPE, { onSuccess: vi.fn(), onError }),
    );

    act(() => {
      result.current.run({ blockIds: ['b1'], expectedVersion: 4 });
    });

    await waitFor(() => {
      expect(onError).toHaveBeenCalled();
    });
  });
});

describe('useRemoveStationMutation', () => {
  it('removes the station from the block that holds it', async () => {
    const onSuccess = vi.fn();
    const { result } = renderHookWithProviders(() =>
      useRemoveStationMutation(SCOPE, { onSuccess, onError: vi.fn() }),
    );

    act(() => {
      result.current.run({ blockId: 'b1', stationId: 'st1' });
    });

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled();
    });
    expect(removeAgendaStation).toHaveBeenCalledWith({
      teamId: 't1',
      sessionId: 's1',
      blockId: 'b1',
      stationId: 'st1',
    });
  });

  it('reports a refused removal', async () => {
    vi.mocked(removeAgendaStation).mockRejectedValue(new Error('boom'));
    const onError = vi.fn();
    const { result } = renderHookWithProviders(() =>
      useRemoveStationMutation(SCOPE, { onSuccess: vi.fn(), onError }),
    );

    act(() => {
      result.current.run({ blockId: 'b1', stationId: 'st1' });
    });

    await waitFor(() => {
      expect(onError).toHaveBeenCalled();
    });
  });
});
