import { TEST_IDS } from '@/shared/config';
import { I18N_KEYS } from '@/shared/i18n';

import { MATCH_TRANSITIONS } from '../constants/matches.constants';
import type { MatchStatus, MatchTransition } from '../constants/matches.constants';
import type { MatchScoreboard } from '../types/matches.types';
import type {
  ScoringPanelView,
  StatePanelView,
  TimeoutPanelView,
  TransitionButtonView,
} from '../types/matches-view.types';
import type { SelectFieldOption } from '@/shared/ui';

type Translate = (key: string, params?: Record<string, string | number>) => string;

export interface ScoringPanelInput {
  readonly scoreboard: MatchScoreboard;
  readonly canScore: boolean;
  readonly isBlocked: boolean;
  readonly isSubmitting: boolean;
  readonly blockedNotice: string | null;
  readonly scorerValue: string;
  readonly assistValue: string;
  readonly memberOptions: readonly SelectFieldOption[];
  readonly onScorerChange: (value: string) => void;
  readonly onAssistChange: (value: string) => void;
  readonly onPoint: (side: 'us' | 'them') => void;
}

/**
 * The two large scoring targets. They are disabled — never merely styled as
 * unavailable — whenever scoring is closed, the grant is missing, or the queue
 * is at its limit, so a tap can never produce a point that has nowhere to go.
 */
export function buildScoringPanel(t: Translate, input: ScoringPanelInput): ScoringPanelView {
  const disabled = !input.canScore || !input.scoreboard.scoringOpen || input.isBlocked;
  return {
    heading: t(I18N_KEYS.scoreboard.scoringPanel),
    intro: t(I18N_KEYS.scoreboard.scoringIntro),
    scorerLabel: t(I18N_KEYS.scoreboard.scorerLabel),
    scorerValue: input.scorerValue,
    scorerOptions: input.memberOptions,
    assistLabel: t(I18N_KEYS.scoreboard.assistLabel),
    assistValue: input.assistValue,
    assistOptions: input.memberOptions,
    usControl: {
      testId: TEST_IDS.scoreboardPointUs,
      label: t(I18N_KEYS.scoreboard.pointForUs),
      disabled,
      loading: input.isSubmitting,
      onPress: () => {
        input.onPoint('us');
      },
    },
    themControl: {
      testId: TEST_IDS.scoreboardPointThem,
      label: t(I18N_KEYS.scoreboard.pointForThem),
      disabled,
      loading: input.isSubmitting,
      onPress: () => {
        input.onPoint('them');
      },
    },
    blockedNotice: input.blockedNotice,
    onScorerChange: input.onScorerChange,
    onAssistChange: input.onAssistChange,
  };
}

export interface TimeoutPanelInput {
  readonly scoreboard: MatchScoreboard;
  readonly canScore: boolean;
  readonly isBlocked: boolean;
  readonly isSubmitting: boolean;
  readonly onTimeout: (side: 'us' | 'them') => void;
}

/** Allowance and remaining counts come from the rule set, never a constant. */
export function buildTimeoutPanel(t: Translate, input: TimeoutPanelInput): TimeoutPanelView {
  const timeouts = input.scoreboard.timeouts;
  const base = !input.canScore || !input.scoreboard.scoringOpen || input.isBlocked;
  const remainingLabel = (remaining: number): string =>
    remaining === 0
      ? t(I18N_KEYS.scoreboard.timeoutExhausted)
      : t(I18N_KEYS.scoreboard.timeoutRemaining, {
          remaining,
          allowance: timeouts.allowance,
        });
  return {
    heading: t(I18N_KEYS.scoreboard.timeoutPanel),
    usControl: {
      testId: TEST_IDS.scoreboardTimeoutUs,
      label: t(I18N_KEYS.scoreboard.timeoutForUs),
      disabled: base || timeouts.remainingForUs === 0,
      loading: input.isSubmitting,
      onPress: () => {
        input.onTimeout('us');
      },
    },
    themControl: {
      testId: TEST_IDS.scoreboardTimeoutThem,
      label: t(I18N_KEYS.scoreboard.timeoutForThem),
      disabled: base || timeouts.remainingForThem === 0,
      loading: input.isSubmitting,
      onPress: () => {
        input.onTimeout('them');
      },
    },
    usRemainingLabel: remainingLabel(timeouts.remainingForUs),
    themRemainingLabel: remainingLabel(timeouts.remainingForThem),
  };
}

const TRANSITION_LABEL_KEYS: Record<MatchTransition, string> = {
  ready: I18N_KEYS.scoreboard.transitionReady,
  start: I18N_KEYS.scoreboard.transitionStart,
  pause: I18N_KEYS.scoreboard.transitionPause,
  resume: I18N_KEYS.scoreboard.transitionResume,
  halftime: I18N_KEYS.scoreboard.transitionHalftime,
  complete: I18N_KEYS.scoreboard.transitionComplete,
};

/**
 * The transition each status can legally take next, per the backend machine.
 * Keyed by the full status union so every state is answered without a fallback.
 */
const ALLOWED_TRANSITIONS: Record<MatchStatus, readonly MatchTransition[]> = {
  scheduled: ['ready'],
  ready: ['start'],
  live: ['pause', 'halftime', 'complete'],
  paused: ['resume', 'complete'],
  halftime: ['resume', 'complete'],
  completed: [],
  finalized: [],
  abandoned: [],
};

export interface StatePanelInput {
  readonly scoreboard: MatchScoreboard;
  readonly canScore: boolean;
  readonly isRunning: boolean;
  readonly onTransition: (transition: MatchTransition) => void;
}

export function buildStatePanel(t: Translate, input: StatePanelInput): StatePanelView {
  const allowed = ALLOWED_TRANSITIONS[input.scoreboard.status];
  const buttons: readonly TransitionButtonView[] = MATCH_TRANSITIONS.map((transition) => ({
    transition,
    label: t(TRANSITION_LABEL_KEYS[transition]),
    disabled: !input.canScore || !allowed.includes(transition),
  }));
  return {
    heading: t(I18N_KEYS.scoreboard.statePanel),
    intro: t(I18N_KEYS.scoreboard.stateIntro),
    buttons,
    isRunning: input.isRunning,
    onTransition: input.onTransition,
  };
}
