import { useAppTranslation } from '@/packages/i18n';
import { useAppNavigation, useRouteParam } from '@/packages/router';

import { EMPTY_SCOREBOARD } from '../constants/matches-view.constants';
import { buildMemberOptions } from '../helpers/member-options.helper';
import { resolveMatchesScreenStatus } from '../helpers/matches-copy.helper';
import { selectUndoableEvent } from '../helpers/match-timeline.helper';
import { buildScoreboardView } from '../helpers/scoreboard-view.helper';
import { selectMatchRuleset } from '../helpers/scoreboard-rules.helper';
import { useFinalizeMatchMutation } from '../mutations/use-finalize-match-mutation.hook';
import { useMatchTransitionMutation } from '../mutations/use-match-transition-mutation.hook';
import { MATCH_ID_PARAM, matchesPath } from '../routes/matches.paths';
import { useMatchEventsQuery } from './use-match-events-query.hook';
import { useMatchRosterQuery } from './use-match-roster-query.hook';
import { useMatchRulesetsQuery } from './use-match-rulesets-query.hook';
import { useMatchScoreboardQuery } from './use-match-scoreboard-query.hook';
import { useMatchesContext } from './use-matches-context.hook';
import { useScoreboardUndo } from './use-scoreboard-undo.hook';
import { useScorekeeperControls } from './use-scorekeeper-controls.hook';
import { useScorekeeperQueue } from './use-scorekeeper-queue.hook';
import type { ScoreboardScreenView } from '../types/matches-view.types';

const NOOP = (): void => undefined;

/**
 * Prepared, translated view model for the live scoreboard and the offline
 * scorekeeper. The queue, the controls, and the undo dialog are separate
 * hooks; this one wires them together and hands the result to a pure builder.
 */
export function useScoreboardScreen(): ScoreboardScreenView {
  const { t, locale } = useAppTranslation();
  const context = useMatchesContext();
  const navigation = useAppNavigation();
  const matchId = useRouteParam(MATCH_ID_PARAM) ?? '';

  const scoreboardQuery = useMatchScoreboardQuery(context.teamId, matchId);
  const eventsQuery = useMatchEventsQuery(context.teamId, matchId);
  const rulesetsQuery = useMatchRulesetsQuery(context.teamId);
  const rosterQuery = useMatchRosterQuery(context.teamId);
  const queue = useScorekeeperQueue(context.userId, context.teamId, matchId, !context.isOffline);

  const scoreboard = scoreboardQuery.data ?? EMPTY_SCOREBOARD;
  const events = eventsQuery.data ?? [];
  const controls = useScorekeeperControls({
    ownerUserId: context.userId,
    teamId: context.teamId,
    matchId,
    isOnline: !context.isOffline,
    baseStreamVersion: scoreboard.streamVersion,
  });
  const transition = useMatchTransitionMutation(context.teamId, matchId, {
    onSuccess: NOOP,
    onError: NOOP,
  });
  const finalize = useFinalizeMatchMutation(context.teamId, matchId, {
    onSuccess: NOOP,
    onError: NOOP,
  });
  const timeline = useScoreboardUndo({
    locale,
    events,
    undoableEvent: selectUndoableEvent(events),
    canScore: context.canScoreMatch,
    hasQueuedWork: queue.pendingCount > 0 || queue.conflicts.length > 0,
    isRunning: controls.isSubmitting,
    onCorrect: controls.recordCorrection,
  });

  return buildScoreboardView(t, {
    scoreboard,
    timeline,
    ruleset: selectMatchRuleset(rulesetsQuery.data ?? [], scoreboard),
    events,
    memberOptions: buildMemberOptions(t, rosterQuery.data?.items ?? []),
    status: resolveMatchesScreenStatus(
      context,
      scoreboardQuery,
      context.canReadMatches,
      scoreboardQuery.data !== undefined,
    ),
    error: scoreboardQuery.error,
    isOffline: context.isOffline,
    canScore: context.canScoreMatch,
    canFinalize: context.canFinalizeMatch,
    onRetry: scoreboardQuery.refetch,
    onBack: () => {
      navigation.push(matchesPath());
    },
    queue: {
      operations: queue.operations,
      conflicts: queue.conflicts,
      pendingCount: queue.pendingCount,
      isOffline: context.isOffline,
      isReplaying: queue.isReplaying,
      isAtLimit: queue.isAtLimit,
      hasForeignQueue: queue.hasForeignQueue,
      hasFailed: queue.hasFailed,
      onRetryFailed: queue.retryFailed,
      onDiscardConflict: queue.discardConflict,
      onReloadAuthoritative: queue.reloadAuthoritative,
    },
    scorerValue: controls.scorerValue,
    assistValue: controls.assistValue,
    isSubmitting: controls.isSubmitting,
    isTransitioning: transition.isRunning,
    isFinalizing: finalize.isRunning,
    lastKnownStreamVersion: scoreboard.streamVersion,
    onScorerChange: controls.setScorer,
    onAssistChange: controls.setAssist,
    onPoint: controls.recordPoint,
    onTimeout: controls.recordTimeout,
    onTransition: (value) => {
      transition.run({ transition: value, expectedRecordVersion: scoreboard.recordVersion });
    },
    onFinalize: () => {
      finalize.run({ expectedRecordVersion: scoreboard.recordVersion });
    },
  });
}
