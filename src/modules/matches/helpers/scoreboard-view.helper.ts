import { I18N_KEYS } from '@/shared/i18n';
import type { AsyncViewStatus, SelectFieldOption } from '@/shared/ui';

import { SCOREBOARD_COPY_NAMESPACE } from '../constants/matches-labels.constants';
import { buildFinalizePanel } from './finalize-panel.helper';
import { buildMatchesScreenCopy } from './matches-copy.helper';
import { buildQueuePanel, type QueuePanelInput } from './scorekeeper-panel.helper';
import { buildScoreboardHead } from './scoreboard-head.helper';
import { buildScoringPanel, buildStatePanel, buildTimeoutPanel } from './scoreboard-panels.helper';
import { buildRuleFacts } from './scoreboard-rules.helper';
import { buildTimelinePanel, type TimelinePanelInput } from './timeline-panel.helper';
import type { AppError } from '@/shared/errors/app.errors';
import type { MatchEvent, MatchRuleset, MatchScoreboard } from '../types/matches.types';
import type { MatchTransition, ScoringSide } from '../constants/matches.constants';
import type { ScoreboardScreenView } from '../types/matches-view.types';

type Translate = (key: string, params?: Record<string, string | number>) => string;

export interface ScoreboardViewInput {
  readonly scoreboard: MatchScoreboard;
  readonly ruleset: MatchRuleset | null;
  readonly events: readonly MatchEvent[];
  readonly memberOptions: readonly SelectFieldOption[];
  readonly status: AsyncViewStatus;
  readonly error: AppError | null;
  readonly isOffline: boolean;
  readonly canScore: boolean;
  readonly canFinalize: boolean;
  readonly onRetry: () => void;
  readonly onBack: () => void;
  readonly queue: QueuePanelInput;
  readonly timeline: TimelinePanelInput;
  readonly scorerValue: string;
  readonly assistValue: string;
  readonly isSubmitting: boolean;
  readonly isTransitioning: boolean;
  readonly isFinalizing: boolean;
  readonly lastKnownStreamVersion: number;
  readonly onScorerChange: (value: string) => void;
  readonly onAssistChange: (value: string) => void;
  readonly onPoint: (side: ScoringSide) => void;
  readonly onTimeout: (side: ScoringSide) => void;
  readonly onTransition: (transition: MatchTransition) => void;
  readonly onFinalize: () => void;
}

function blockedNotice(t: Translate, input: ScoreboardViewInput): string | null {
  if (input.queue.isAtLimit) {
    return t(I18N_KEYS.scorekeeperQueue.limitBlocked);
  }
  return input.scoreboard.scoringOpen ? null : t(I18N_KEYS.scoreboard.scoringClosed);
}

function buildControlPanels(t: Translate, input: ScoreboardViewInput) {
  return {
    scoring: buildScoringPanel(t, {
      scoreboard: input.scoreboard,
      canScore: input.canScore,
      isBlocked: input.queue.isAtLimit,
      isSubmitting: input.isSubmitting,
      blockedNotice: blockedNotice(t, input),
      scorerValue: input.scorerValue,
      assistValue: input.assistValue,
      memberOptions: input.memberOptions,
      onScorerChange: input.onScorerChange,
      onAssistChange: input.onAssistChange,
      onPoint: input.onPoint,
    }),
    timeouts: buildTimeoutPanel(t, {
      scoreboard: input.scoreboard,
      canScore: input.canScore,
      isBlocked: input.queue.isAtLimit,
      isSubmitting: input.isSubmitting,
      onTimeout: input.onTimeout,
    }),
    state: buildStatePanel(t, {
      scoreboard: input.scoreboard,
      canScore: input.canScore,
      isRunning: input.isTransitioning,
      onTransition: input.onTransition,
    }),
    finalize: buildFinalizePanel(t, {
      scoreboard: input.scoreboard,
      queuedCount: input.queue.pendingCount,
      lastKnownStreamVersion: input.lastKnownStreamVersion,
      canFinalize: input.canFinalize,
      isRunning: input.isFinalizing,
      onFinalize: input.onFinalize,
    }),
  };
}

/**
 * Assemble the whole scoreboard view model from already-resolved pieces.
 *
 * Every number rendered here is the server's. Queued work is surfaced as
 * pending in the sync panel rather than added to the displayed score, so the
 * scoreboard never shows a point the stream has not accepted.
 */
export function buildScoreboardView(
  t: Translate,
  input: ScoreboardViewInput,
): ScoreboardScreenView {
  return {
    ...buildMatchesScreenCopy(t, {
      namespace: SCOREBOARD_COPY_NAMESPACE,
      error: input.error,
      isOffline: input.isOffline,
      onRetry: input.onRetry,
      emptyTitleKey: I18N_KEYS.scoreboard.emptyTitle,
      emptyMessageKey: I18N_KEYS.scoreboard.emptyMessage,
    }),
    ...buildControlPanels(t, input),
    title: t(I18N_KEYS.scoreboard.title),
    heading: t(I18N_KEYS.scoreboard.heading),
    subtitle: t(I18N_KEYS.scoreboard.subtitle),
    backLabel: t(I18N_KEYS.matches.back),
    status: input.status,
    permissionNotice: input.canScore ? null : t(I18N_KEYS.scoreboard.permissionNotice),
    head: buildScoreboardHead(t, input.scoreboard, input.ruleset),
    rulesHeading: t(I18N_KEYS.scoreboard.rulesPanel),
    rulesIntro: t(I18N_KEYS.scoreboard.rulesIntro),
    rules: buildRuleFacts(t, input.scoreboard, input.ruleset),
    timeline: buildTimelinePanel(t, input.timeline),
    queue: buildQueuePanel(t, input.queue),
    onBack: input.onBack,
  };
}
