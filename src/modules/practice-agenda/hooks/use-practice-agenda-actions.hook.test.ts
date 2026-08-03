import { act, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { I18N_KEYS } from '@/shared/i18n';

import { renderHookWithProviders } from '../../../../tests/setup/render-with-providers.helper';
import { removeAgendaStation } from '../services/remove-agenda-station.service';
import { usePracticeAgendaActions } from './use-practice-agenda-actions.hook';

vi.mock('../services/remove-agenda-station.service', () => ({ removeAgendaStation: vi.fn() }));

const t = (key: string): string => `t:${key}`;
const SCOPE = { teamId: 't1', sessionId: 's1' };

function renderActions(): ReturnType<
  typeof renderHookWithProviders<ReturnType<typeof usePracticeAgendaActions>>
> {
  return renderHookWithProviders(() => usePracticeAgendaActions(t, SCOPE));
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(removeAgendaStation).mockResolvedValue(undefined);
});

describe('usePracticeAgendaActions', () => {
  it('says nothing until something actually fails', () => {
    const { result } = renderActions();

    expect(result.current.notice).toBeNull();
  });

  it('removes the station a coach picked', async () => {
    const { result } = renderActions();

    act(() => {
      result.current.onRemoveStation('b1', 'st1');
    });

    await waitFor(() => {
      expect(removeAgendaStation).toHaveBeenCalledWith({
        teamId: 't1',
        sessionId: 's1',
        blockId: 'b1',
        stationId: 'st1',
      });
    });
  });

  it('answers a refusal with one sentence, not the server’s own words', async () => {
    vi.mocked(removeAgendaStation).mockRejectedValue(new Error('boom'));
    const { result } = renderActions();

    act(() => {
      result.current.onRemoveStation('b1', 'st1');
    });

    await waitFor(() => {
      expect(result.current.notice).toBe(`t:${I18N_KEYS.practiceAgenda.actionFailed}`);
    });
  });

  it('lends the same notice line to the reorder, which lives in its own hook', async () => {
    const { result } = renderActions();

    act(() => {
      result.current.reportFailure();
    });
    await waitFor(() => {
      expect(result.current.notice).not.toBeNull();
    });

    act(() => {
      result.current.clearNotice();
    });
    await waitFor(() => {
      expect(result.current.notice).toBeNull();
    });
  });

  it('clears a stale failure once a command succeeds', async () => {
    const { result } = renderActions();

    act(() => {
      result.current.reportFailure();
    });
    act(() => {
      result.current.onRemoveStation('b1', 'st1');
    });

    await waitFor(() => {
      expect(result.current.notice).toBeNull();
    });
  });

  it('reports while a removal is in flight', async () => {
    vi.mocked(removeAgendaStation).mockImplementation(() => new Promise(() => undefined));
    const { result } = renderActions();

    act(() => {
      result.current.onRemoveStation('b1', 'st1');
    });

    await waitFor(() => {
      expect(result.current.isRemoving).toBe(true);
    });
  });
});
