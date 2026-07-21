import { act } from '@testing-library/react';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import type * as RouterModule from '@/packages/router';
import { buildEmptyRemoteQuery, MATCH_CONTEXT_STUB } from '@/tests/msw/matches-view.fixture';

import { initTestI18n } from '../../../../tests/setup/i18n-test.helper';
import { renderHookWithProviders } from '../../../../tests/setup/render-with-providers.helper';
import { useFinalizeMatchMutation } from '../mutations/use-finalize-match-mutation.hook';
import { useMatchTransitionMutation } from '../mutations/use-match-transition-mutation.hook';
import { useMatchEventsQuery } from './use-match-events-query.hook';
import { useMatchRosterQuery } from './use-match-roster-query.hook';
import { useMatchRulesetsQuery } from './use-match-rulesets-query.hook';
import { useMatchScoreboardQuery } from './use-match-scoreboard-query.hook';
import { useMatchesContext } from './use-matches-context.hook';
import { useScoreboardScreen } from './use-scoreboard-screen.hook';
import { useScorekeeperControls } from './use-scorekeeper-controls.hook';
import { useScorekeeperQueue } from './use-scorekeeper-queue.hook';

const { push, transitionRun, finalizeRun } = vi.hoisted(() => ({
  push: vi.fn(),
  transitionRun: vi.fn(),
  finalizeRun: vi.fn(),
}));

vi.mock('@/packages/router', async (importOriginal) => ({
  ...(await importOriginal<typeof RouterModule>()),
  useAppNavigation: () => ({ push, replace: vi.fn(), goBack: vi.fn() }),
  useRouteParam: () => undefined,
}));
vi.mock('./use-matches-context.hook', () => ({ useMatchesContext: vi.fn() }));
vi.mock('./use-match-scoreboard-query.hook', () => ({ useMatchScoreboardQuery: vi.fn() }));
vi.mock('./use-match-events-query.hook', () => ({ useMatchEventsQuery: vi.fn() }));
vi.mock('./use-match-rulesets-query.hook', () => ({ useMatchRulesetsQuery: vi.fn() }));
vi.mock('./use-match-roster-query.hook', () => ({ useMatchRosterQuery: vi.fn() }));
vi.mock('./use-scorekeeper-queue.hook', () => ({ useScorekeeperQueue: vi.fn() }));
vi.mock('./use-scorekeeper-controls.hook', () => ({ useScorekeeperControls: vi.fn() }));
vi.mock('../mutations/use-match-transition-mutation.hook', () => ({
  useMatchTransitionMutation: vi.fn(),
}));
vi.mock('../mutations/use-finalize-match-mutation.hook', () => ({
  useFinalizeMatchMutation: vi.fn(),
}));

const EMPTY_QUERY = buildEmptyRemoteQuery(vi.fn());

beforeAll(async () => {
  await initTestI18n();
});

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(useMatchesContext).mockReturnValue({ ...MATCH_CONTEXT_STUB });
  vi.mocked(useMatchScoreboardQuery).mockReturnValue(EMPTY_QUERY);
  vi.mocked(useMatchEventsQuery).mockReturnValue(EMPTY_QUERY);
  vi.mocked(useMatchRulesetsQuery).mockReturnValue(EMPTY_QUERY);
  vi.mocked(useMatchRosterQuery).mockReturnValue(EMPTY_QUERY);
  vi.mocked(useScorekeeperQueue).mockReturnValue({
    operations: [],
    conflicts: [],
    pendingCount: 0,
    isReplaying: false,
    isAtLimit: false,
    hasForeignQueue: false,
    hasFailed: false,
    retryFailed: vi.fn(),
    discardConflict: vi.fn(),
    reloadAuthoritative: vi.fn(),
  });
  vi.mocked(useScorekeeperControls).mockReturnValue({
    scorerValue: 'unattributed',
    assistValue: 'unattributed',
    isSubmitting: false,
    setScorer: vi.fn(),
    setAssist: vi.fn(),
    recordPoint: vi.fn(),
    recordTimeout: vi.fn(),
    recordCorrection: vi.fn(),
  });
  vi.mocked(useMatchTransitionMutation).mockReturnValue({
    run: transitionRun,
    isRunning: false,
  });
  vi.mocked(useFinalizeMatchMutation).mockReturnValue({ run: finalizeRun, isRunning: false });
});

describe('useScoreboardScreen', () => {
  it('renders the placeholder board with scoring closed while nothing has loaded', () => {
    const { result } = renderHookWithProviders(() => useScoreboardScreen());

    expect(result.current.head.ourScore).toBe('0');
    expect(result.current.scoring.usControl.disabled).toBe(true);
    expect(result.current.timeline.rows).toStrictEqual([]);
    // Every cap is unknown rather than an invented zero.
    expect(result.current.rules[1]?.value).toBe('Not set by this rule set');
  });

  it('sends the record version the client last saw with a transition', () => {
    const { result } = renderHookWithProviders(() => useScoreboardScreen());

    act(() => {
      result.current.state.onTransition('pause');
    });

    expect(transitionRun).toHaveBeenCalledWith({
      transition: 'pause',
      expectedRecordVersion: 0,
    });
  });

  it('sends the record version with a finalization', () => {
    const { result } = renderHookWithProviders(() => useScoreboardScreen());

    act(() => {
      result.current.finalize.onFinalize();
    });

    expect(finalizeRun).toHaveBeenCalledWith({ expectedRecordVersion: 0 });
  });

  it('navigates back to the match list', () => {
    const { result } = renderHookWithProviders(() => useScoreboardScreen());

    act(() => {
      result.current.onBack();
    });

    expect(push).toHaveBeenCalledWith('/matches');
  });
});
