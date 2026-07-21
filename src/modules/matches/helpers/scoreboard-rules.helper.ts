import { I18N_KEYS } from '@/shared/i18n';
import type { FactListItem } from '@/shared/ui';

import { MATCH_CAP_LABEL_KEYS } from '../constants/matches-labels.constants';
import type { MatchRuleset, MatchScoreboard } from '../types/matches.types';

type Translate = (key: string, params?: Record<string, string | number>) => string;

/**
 * A cap the rule set does not define reads "not set by this rule set" — never
 * 0, which would claim a cap of zero points exists.
 */
function capValue(t: Translate, value: number | null): string {
  return value === null ? t(I18N_KEYS.scoreboard.ruleUnknown) : String(value);
}

function minutesValue(t: Translate, value: number | null): string {
  return value === null
    ? t(I18N_KEYS.scoreboard.ruleUnknown)
    : t(I18N_KEYS.scoreboard.ruleMinutes, { count: value });
}

/** Point-valued caps: game to, win by, hard cap, halftime at, periods. */
const COUNT_RULES = [
  { key: 'winBy', labelKey: I18N_KEYS.scoreboard.ruleWinBy, field: 'winBy' },
  { key: 'hardCap', labelKey: I18N_KEYS.scoreboard.ruleHardCap, field: 'hardCap' },
  { key: 'halftime', labelKey: I18N_KEYS.scoreboard.ruleHalftime, field: 'halftimeAt' },
  { key: 'periods', labelKey: I18N_KEYS.scoreboard.rulePeriods, field: 'periods' },
] as const;

/** Minute-valued caps. */
const MINUTE_RULES = [
  { key: 'softCap', labelKey: I18N_KEYS.scoreboard.ruleSoftCap, field: 'softCapMinutes' },
  { key: 'timeCap', labelKey: I18N_KEYS.scoreboard.ruleTimeCap, field: 'timeCapMinutes' },
] as const;

/**
 * Every cap and allowance on the scoreboard comes from the published rule set
 * the server resolved for this match. Nothing here is a client default: an app
 * that hard-codes "game to 15" would print the wrong target for a rule set that
 * says otherwise.
 */
export function buildRuleFacts(
  t: Translate,
  scoreboard: MatchScoreboard,
  ruleset: MatchRuleset | null,
): readonly FactListItem[] {
  return [
    {
      key: 'target',
      label: t(I18N_KEYS.scoreboard.ruleTarget),
      value: String(scoreboard.target),
    },
    ...COUNT_RULES.map((rule) => ({
      key: rule.key,
      label: t(rule.labelKey),
      value: capValue(t, ruleset === null ? null : ruleset[rule.field]),
    })),
    ...MINUTE_RULES.map((rule) => ({
      key: rule.key,
      label: t(rule.labelKey),
      value: minutesValue(t, ruleset === null ? null : ruleset[rule.field]),
    })),
    {
      key: 'timeouts',
      label: t(I18N_KEYS.scoreboard.ruleTimeouts),
      value: String(scoreboard.timeouts.allowance),
    },
    {
      key: 'capApplied',
      label: t(I18N_KEYS.scoreboard.capApplied),
      value: t(MATCH_CAP_LABEL_KEYS[scoreboard.capApplied]),
    },
  ];
}

/** The rule set the server bound to this match, or null when it is not loaded. */
export function selectMatchRuleset(
  rulesets: readonly MatchRuleset[],
  scoreboard: MatchScoreboard,
): MatchRuleset | null {
  return (
    rulesets.find(
      (ruleset) =>
        ruleset.rulesetKey === scoreboard.rulesetKey &&
        ruleset.rulesetVersion === scoreboard.rulesetVersion,
    ) ?? null
  );
}
