import { formatDate } from '@/packages/date';
import type { TranslateParams } from '@/packages/i18n';
import { I18N_KEYS } from '@/shared/i18n';

import type { StandingTieBreak } from '../constants/standings.constants';
import type { StandingsRule } from '../types/standings.types';
import type { RuleFamilyView, RuleVersionView } from '../types/standings-view.types';

type Translate = (key: string, params?: TranslateParams) => string;

const TIE_BREAK_KEYS: Readonly<Record<StandingTieBreak, string>> = {
  standing_points: I18N_KEYS.standings.tieBreakStandingPoints,
  wins: I18N_KEYS.standings.tieBreakWins,
  point_difference: I18N_KEYS.standings.tieBreakPointDifference,
  points_for: I18N_KEYS.standings.tieBreakPointsFor,
  points_against: I18N_KEYS.standings.tieBreakPointsAgainst,
  spirit: I18N_KEYS.standings.tieBreakSpirit,
  alphabetical: I18N_KEYS.standings.tieBreakAlphabetical,
};

/** The translated label of one tie-break criterion. */
export function resolveTieBreakLabel(t: Translate, tieBreak: StandingTieBreak): string {
  return t(TIE_BREAK_KEYS[tieBreak]);
}

/** One version rendered: name vN, points, ordered tie-break chips. */
function buildRuleVersionView(t: Translate, locale: string, rule: StandingsRule): RuleVersionView {
  return {
    key: rule.ruleVersionId,
    heading: t(I18N_KEYS.standings.ruleVersionLabel, {
      name: rule.name,
      version: String(rule.version),
    }),
    statusChip:
      rule.status === 'active'
        ? { label: t(I18N_KEYS.standings.ruleStatusActive), tone: 'success' }
        : { label: t(I18N_KEYS.standings.ruleStatusArchived), tone: 'medium' },
    points: [
      t(I18N_KEYS.standings.ruleWinPoints, { points: String(rule.winPoints) }),
      t(I18N_KEYS.standings.ruleLossPoints, { points: String(rule.lossPoints) }),
      t(I18N_KEYS.standings.ruleTiePoints, { points: String(rule.tiePoints) }),
    ],
    tieBreakChips: rule.tieBreakOrder.map((tieBreak) => resolveTieBreakLabel(t, tieBreak)),
    effectiveFrom: t(I18N_KEYS.standings.ruleEffectiveFrom, {
      date: formatDate(rule.effectiveFromIso, locale),
    }),
  };
}

/**
 * Group versions by `ruleKey`, newest prominent, older collapsed beneath.
 * Publishing never edits: a family only ever grows a version N+1.
 */
export function buildRuleFamilies(
  t: Translate,
  locale: string,
  rules: readonly StandingsRule[],
): readonly RuleFamilyView[] {
  const byKey = new Map<string, { newest: StandingsRule; older: StandingsRule[] }>();
  for (const rule of rules) {
    const family = byKey.get(rule.ruleKey);
    if (family === undefined) {
      byKey.set(rule.ruleKey, { newest: rule, older: [] });
    } else if (rule.version > family.newest.version) {
      byKey.set(rule.ruleKey, { newest: rule, older: [...family.older, family.newest] });
    } else {
      family.older.push(rule);
    }
  }
  return [...byKey.entries()].map(([key, family]) => {
    const older = [...family.older].sort((first, second) => second.version - first.version);
    return {
      key,
      newest: buildRuleVersionView(t, locale, family.newest),
      older: older.map((rule) => buildRuleVersionView(t, locale, rule)),
      olderLabel:
        older.length === 0
          ? null
          : t(I18N_KEYS.standings.ruleOlderVersions, { count: String(older.length) }),
    };
  });
}
