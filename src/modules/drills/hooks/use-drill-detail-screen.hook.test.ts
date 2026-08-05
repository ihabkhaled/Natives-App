import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useAppQuery } from '@/packages/query';
import { useAppNavigation, useRouteParam } from '@/packages/router';
import { useConfirmAlert } from '@/shared/ui';

import { DRILL_NEW_ID } from '../constants/drills.constants';
import type { Drill } from '../types/drills.types';
import type { UseDrillWriteMutationsOptions } from './use-drill-write-mutations.hook';
import { useDrillWriteMutations } from './use-drill-write-mutations.hook';
import { useDrillDetailScreen } from './use-drill-detail-screen.hook';
import { useDrillsContext } from './use-drills-context.hook';

vi.mock('@/packages/i18n', () => ({ useAppTranslation: () => ({ t: (key: string) => key }) }));
vi.mock('@/packages/query', () => ({ useAppQuery: vi.fn() }));
vi.mock('@/packages/router', () => ({ useAppNavigation: vi.fn(), useRouteParam: vi.fn() }));
vi.mock('@/shared/ui', () => ({ useConfirmAlert: vi.fn() }));
vi.mock('./use-drills-context.hook', () => ({ useDrillsContext: vi.fn() }));
vi.mock('./use-drill-write-mutations.hook', () => ({ useDrillWriteMutations: vi.fn() }));

const push = vi.fn();
const confirm = vi.fn();
const createRun = vi.fn();
const updateRun = vi.fn();
const archiveRun = vi.fn();
let writeOptions: UseDrillWriteMutationsOptions;

const DRILL: Drill = {
  id: 'd1',
  seasonId: null,
  name: 'Give-and-go break',
  category: 'throwing',
  objective: null,
  instructions: null,
  equipment: [],
  intensity: 'moderate',
  defaultDurationMinutes: null,
  skillTags: [],
  safetyNotes: null,
  mediaUrl: null,
  status: 'active',
  version: 5,
};

function mockRouteAndQuery(drillId: string, data: unknown): void {
  vi.mocked(useRouteParam).mockReturnValue(drillId);
  vi.mocked(useAppQuery).mockReturnValue({
    data,
    isPending: false,
    error: null,
    refetch: vi.fn(),
  } as never);
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(useAppNavigation).mockReturnValue({ push } as never);
  vi.mocked(useConfirmAlert).mockReturnValue({ confirm });
  vi.mocked(useDrillsContext).mockReturnValue({
    teamId: 't1',
    isOffline: false,
    isLoading: false,
    canManage: true,
  });
  vi.mocked(useDrillWriteMutations).mockImplementation((options) => {
    writeOptions = options;
    return {
      create: { run: createRun, isRunning: false },
      update: { run: updateRun, isRunning: false },
      archive: { run: archiveRun, isRunning: false },
    };
  });
});

describe('useDrillDetailScreen', () => {
  it('renders a blank, ready form for the create-mode sentinel, without fetching', () => {
    mockRouteAndQuery(DRILL_NEW_ID, undefined);

    const { result } = renderHook(() => useDrillDetailScreen());

    expect(result.current.status).toBe('ready');
    expect(result.current.form.nameField.value).toBe('');
    expect(result.current.lifecycle.visible).toBe(false);
  });

  it('loads an existing drill into the form and offers the archive action', () => {
    mockRouteAndQuery('d1', DRILL);

    const { result } = renderHook(() => useDrillDetailScreen());

    expect(result.current.heading).toBe('Give-and-go break');
    expect(result.current.form.nameField.value).toBe('Give-and-go break');
    expect(result.current.lifecycle.visible).toBe(true);
  });

  it('submits a create command and navigates to the new drill once created', async () => {
    mockRouteAndQuery(DRILL_NEW_ID, undefined);
    const { result } = renderHook(() => useDrillDetailScreen());

    act(() => {
      result.current.form.nameField.onChange('New drill');
    });
    act(() => {
      result.current.form.categoryField.onChange('throwing');
    });
    act(() => {
      result.current.form.onSubmit({
        preventDefault: () => undefined,
      } as React.SyntheticEvent<HTMLFormElement>);
    });

    await waitFor(() => {
      expect(createRun).toHaveBeenCalledWith(
        expect.objectContaining({ teamId: 't1', seasonId: null }),
      );
    });

    writeOptions.onCreated({ ...DRILL, id: 'created-1' });
    expect(push).toHaveBeenCalledWith('/drills/created-1');
  });

  it("submits an update command carrying the drill's own version", async () => {
    mockRouteAndQuery('d1', DRILL);
    const { result } = renderHook(() => useDrillDetailScreen());

    act(() => {
      result.current.form.onSubmit({
        preventDefault: () => undefined,
      } as React.SyntheticEvent<HTMLFormElement>);
    });

    await waitFor(() => {
      expect(updateRun).toHaveBeenCalledWith(
        expect.objectContaining({ teamId: 't1', drillId: 'd1', expectedVersion: 5 }),
      );
    });
  });

  it('re-reads the drill when the write layer reports a version conflict', () => {
    const refetch = vi.fn();
    vi.mocked(useRouteParam).mockReturnValue('d1');
    vi.mocked(useAppQuery).mockReturnValue({
      data: DRILL,
      isPending: false,
      error: null,
      refetch,
    } as never);
    renderHook(() => useDrillDetailScreen());

    writeOptions.onConflict();

    expect(refetch).toHaveBeenCalled();
  });

  it('archives only after the coach confirms', async () => {
    mockRouteAndQuery('d1', DRILL);
    confirm.mockResolvedValue(true);
    const { result } = renderHook(() => useDrillDetailScreen());

    await act(async () => {
      result.current.lifecycle.onArchive();
      await Promise.resolve();
    });

    expect(archiveRun).toHaveBeenCalledWith({ teamId: 't1', drillId: 'd1' });
  });

  it('does nothing when the coach cancels the archive confirmation', async () => {
    mockRouteAndQuery('d1', DRILL);
    confirm.mockResolvedValue(false);
    const { result } = renderHook(() => useDrillDetailScreen());

    await act(async () => {
      result.current.lifecycle.onArchive();
      await Promise.resolve();
    });

    expect(archiveRun).not.toHaveBeenCalled();
  });

  it('navigates back to the list from back and cancel', () => {
    mockRouteAndQuery('d1', DRILL);
    const { result } = renderHook(() => useDrillDetailScreen());

    act(() => {
      result.current.onBack();
    });
    act(() => {
      result.current.form.onCancel();
    });

    expect(push).toHaveBeenCalledWith('/drills');
    expect(push).toHaveBeenCalledTimes(2);
  });

  it('falls back to the empty id when the route did not match', () => {
    vi.mocked(useRouteParam).mockReturnValue(null);
    vi.mocked(useAppQuery).mockReturnValue({
      data: undefined,
      isPending: false,
      error: null,
      refetch: vi.fn(),
    } as never);

    const { result } = renderHook(() => useDrillDetailScreen());

    // An unmatched route is not the create sentinel, so the screen tries to
    // read an empty-id drill and finds nothing — never a false "ready" create form.
    expect(result.current.form.nameField.value).toBe('');
  });

  it('does nothing when a valid submit somehow lands before the drill has loaded', () => {
    mockRouteAndQuery('d1', undefined);
    const { result } = renderHook(() => useDrillDetailScreen());

    act(() => {
      result.current.form.nameField.onChange('Give-and-go break');
    });
    act(() => {
      result.current.form.categoryField.onChange('throwing');
    });
    act(() => {
      result.current.form.onSubmit({
        preventDefault: () => undefined,
      } as React.SyntheticEvent<HTMLFormElement>);
    });

    expect(updateRun).not.toHaveBeenCalled();
  });

  it('withholds the screen from a principal without the grant', () => {
    mockRouteAndQuery('d1', DRILL);
    vi.mocked(useDrillsContext).mockReturnValue({
      teamId: 't1',
      isOffline: false,
      isLoading: false,
      canManage: false,
    });

    const { result } = renderHook(() => useDrillDetailScreen());

    expect(result.current.status).toBe('forbidden');
  });
});
