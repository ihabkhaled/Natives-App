import { waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { buildMatch } from '@/tests/msw/matches-domain.fixture';

import { actOnHook } from '../../../../tests/setup/render-with-providers.helper';
import { transitionMatch } from '../services/transition-match.service';
import { useMatchTransitionMutation } from './use-match-transition-mutation.hook';

vi.mock('../services/transition-match.service', () => ({ transitionMatch: vi.fn() }));

const COMMAND = { transition: 'pause', expectedRecordVersion: 3 } as const;

beforeEach(() => {
  vi.clearAllMocks();
});

describe('useMatchTransitionMutation', () => {
  it('sends the record version the client last saw', async () => {
    vi.mocked(transitionMatch).mockResolvedValue(buildMatch({ status: 'paused' }));
    const onSuccess = vi.fn();

    actOnHook(
      () => useMatchTransitionMutation('team-natives', 'match-1', { onSuccess, onError: vi.fn() }),
      (api) => {
        api.run(COMMAND);
      },
    );

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledTimes(1);
    });
    expect(transitionMatch).toHaveBeenCalledWith('team-natives', 'match-1', COMMAND);
  });

  it('reports a rejected transition rather than pretending it applied', async () => {
    vi.mocked(transitionMatch).mockRejectedValue(new Error('conflict'));
    const onError = vi.fn();

    actOnHook(
      () => useMatchTransitionMutation('team-natives', 'match-1', { onSuccess: vi.fn(), onError }),
      (api) => {
        api.run(COMMAND);
      },
    );

    await waitFor(() => {
      expect(onError).toHaveBeenCalledTimes(1);
    });
  });
});
