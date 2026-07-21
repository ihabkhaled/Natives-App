import { waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { buildMatch } from '@/tests/msw/matches-domain.fixture';

import { actOnHook } from '../../../../tests/setup/render-with-providers.helper';
import { finalizeMatch } from '../services/finalize-match.service';
import { useFinalizeMatchMutation } from './use-finalize-match-mutation.hook';

vi.mock('../services/finalize-match.service', () => ({ finalizeMatch: vi.fn() }));

const COMMAND = { expectedRecordVersion: 3 } as const;

beforeEach(() => {
  vi.clearAllMocks();
});

describe('useFinalizeMatchMutation', () => {
  it('publishes the final score with the expected record version', async () => {
    vi.mocked(finalizeMatch).mockResolvedValue(buildMatch({ status: 'finalized' }));
    const onSuccess = vi.fn();

    actOnHook(
      () => useFinalizeMatchMutation('team-natives', 'match-1', { onSuccess, onError: vi.fn() }),
      (api) => {
        api.run(COMMAND);
      },
    );

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledTimes(1);
    });
    expect(finalizeMatch).toHaveBeenCalledWith('team-natives', 'match-1', COMMAND);
  });

  it('reports a rejected finalization instead of pretending the score published', async () => {
    vi.mocked(finalizeMatch).mockRejectedValue(new Error('conflict'));
    const onError = vi.fn();
    const view = actOnHook(
      () => useFinalizeMatchMutation('team-natives', 'match-1', { onSuccess: vi.fn(), onError }),
      (api) => {
        api.run(COMMAND);
      },
    );

    await waitFor(() => {
      expect(onError).toHaveBeenCalledTimes(1);
    });
    expect(view.result.current.isRunning).toBe(false);
  });
});
