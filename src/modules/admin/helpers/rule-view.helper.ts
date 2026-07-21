import { I18N_KEYS } from '@/shared/i18n';

import {
  CONFIDENCE_LABEL_KEYS,
  RULE_STATUS_LABEL_KEYS,
  RULE_STATUS_TONES,
  RULE_TRANSITION_LABEL_KEYS,
} from '../constants/admin-labels.constants';
import {
  RULE_TRANSITIONS,
  SIMULATION_REQUIRED_TRANSITIONS,
  type RuleStatus,
  type RuleTransition,
} from '../constants/admin.constants';
import type { GovernedRule, PointEntry, SimulationResult } from '../types/admin.types';
import type { AdminFactRowView, RuleRowView, RuleSimulationView } from '../types/admin-view.types';

type Translate = (key: string, params?: Record<string, string | number>) => string;

/** Which transitions the lifecycle allows from a given state. */
const ALLOWED_TRANSITIONS: Record<RuleStatus, readonly RuleTransition[]> = {
  draft: ['approve'],
  approved: ['publish', 'revert'],
  published: ['retire'],
  retired: [],
};

const TRANSITION_TONES: Record<RuleTransition, string> = {
  approve: 'secondary',
  publish: 'primary',
  retire: 'danger',
  revert: 'ghost',
};

function describeEffectiveWindow(t: Translate, rule: GovernedRule): string {
  if (rule.effectiveFrom === null) {
    return t(I18N_KEYS.adminRules.effectiveUnset);
  }
  return rule.effectiveTo === null
    ? t(I18N_KEYS.adminRules.effectiveOpenEnded, { from: rule.effectiveFrom })
    : t(I18N_KEYS.adminRules.effectiveWindow, { from: rule.effectiveFrom, to: rule.effectiveTo });
}

export function buildRuleRows(
  t: Translate,
  rules: readonly GovernedRule[],
  selectedId: string,
): readonly RuleRowView[] {
  return rules.map((rule) => ({
    ruleId: rule.ruleId,
    name: rule.name,
    versionLabel: t(I18N_KEYS.adminRules.versionLabel, { version: rule.version }),
    statusLabel: t(RULE_STATUS_LABEL_KEYS[rule.status]),
    statusTone: RULE_STATUS_TONES[rule.status],
    effectiveLabel: describeEffectiveWindow(t, rule),
    openLabel: t(I18N_KEYS.adminConsole.open),
    isSelected: rule.ruleId === selectedId,
  }));
}

/** A null point value means "not scored" and is rendered as such, never as 0. */
export function buildEntryRows(
  t: Translate,
  entries: readonly PointEntry[],
): readonly AdminFactRowView[] {
  return entries.map((entry) => ({
    key: entry.activityCategory,
    label: entry.activityCategory,
    value:
      entry.points === null
        ? t(I18N_KEYS.adminRules.entryUnscored)
        : t(I18N_KEYS.adminRules.entryPoints, { points: entry.points }),
    detail: [
      entry.dailyCap === null
        ? t(I18N_KEYS.adminRules.entryNoCap)
        : t(I18N_KEYS.adminRules.entryDailyCap, { cap: entry.dailyCap }),
      entry.cooldownDays === null
        ? t(I18N_KEYS.adminRules.entryNoCooldown)
        : t(I18N_KEYS.adminRules.entryCooldown, { days: entry.cooldownDays }),
    ].join(' · '),
    tone: null,
  }));
}

export interface TransitionInput {
  readonly status: RuleStatus;
  readonly hasSimulated: boolean;
  readonly canManage: boolean;
  readonly isRunning: boolean;
}

/** Whether a transition is offered but blocked, rather than silently absent. */
function isTransitionBlocked(transition: RuleTransition, input: TransitionInput): boolean {
  if (!input.canManage || input.isRunning) {
    return true;
  }
  return SIMULATION_REQUIRED_TRANSITIONS.includes(transition) && !input.hasSimulated;
}

export function buildTransitionActions(
  t: Translate,
  input: TransitionInput,
  onSelect: (transition: RuleTransition) => void,
): readonly {
  key: string;
  label: string;
  tone: string;
  disabled: boolean;
  onSelect: () => void;
}[] {
  const allowed = ALLOWED_TRANSITIONS[input.status];
  return RULE_TRANSITIONS.filter((transition) => allowed.includes(transition)).map(
    (transition) => ({
      key: transition,
      label: t(RULE_TRANSITION_LABEL_KEYS[transition]),
      tone: TRANSITION_TONES[transition],
      disabled: isTransitionBlocked(transition, input),
      onSelect: () => {
        onSelect(transition);
      },
    }),
  );
}

/** The dry-run comparison. No baseline yields an explicit "no baseline". */
export function buildSimulationRows(
  t: Translate,
  result: SimulationResult | null,
): readonly AdminFactRowView[] {
  if (result === null) {
    return [
      {
        key: 'not-run',
        label: t(I18N_KEYS.adminRules.simulateDraftLabel),
        value: t(I18N_KEYS.adminRules.simulateNotRun),
        detail: null,
        tone: null,
      },
    ];
  }
  return [
    {
      key: 'draft',
      label: t(I18N_KEYS.adminRules.simulateDraftLabel),
      value: t(I18N_KEYS.adminRules.simulateConfidence, {
        level: t(CONFIDENCE_LABEL_KEYS[result.draft.confidence]),
      }),
      detail: t(I18N_KEYS.adminRules.simulateCompleteness, {
        percent: Math.round(result.draft.completeness * 100),
      }),
      tone: null,
    },
    {
      key: 'published',
      label: t(I18N_KEYS.adminRules.simulatePublishedLabel),
      value:
        result.published === null
          ? t(I18N_KEYS.adminRules.simulateNoBaseline)
          : t(I18N_KEYS.adminRules.simulateConfidence, {
              level: t(CONFIDENCE_LABEL_KEYS[result.published.confidence]),
            }),
      detail: null,
      tone: null,
    },
    {
      key: 'delta',
      label: t(I18N_KEYS.adminRules.simulateDeltaLabel),
      value: result.delta === null ? t(I18N_KEYS.adminRules.simulateNoBaseline) : `${result.delta}`,
      detail: null,
      tone: null,
    },
  ];
}

export interface SimulationPanelInput {
  readonly memberValue: string;
  readonly memberOptions: readonly { value: string; label: string }[];
  readonly isRunning: boolean;
  readonly rows: readonly AdminFactRowView[];
  readonly onMemberChange: (value: string) => void;
  readonly onRun: () => void;
}

/** The dry-run panel's copy bound to its already-prepared state. */
export function buildSimulationActions(
  t: Translate,
  input: SimulationPanelInput,
): RuleSimulationView {
  return {
    heading: t(I18N_KEYS.adminRules.simulateHeading),
    intro: t(I18N_KEYS.adminRules.simulateIntro),
    memberLabel: t(I18N_KEYS.adminRules.simulateMemberLabel),
    memberValue: input.memberValue,
    memberOptions: input.memberOptions,
    runLabel: t(I18N_KEYS.adminRules.simulateRun),
    isRunning: input.isRunning,
    validationMessage:
      input.memberValue === '' ? t(I18N_KEYS.adminRules.simulateMemberRequired) : null,
    rows: input.rows,
    onMemberChange: input.onMemberChange,
    onRun: input.onRun,
  };
}
