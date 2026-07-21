import { describe, expect, it } from 'vitest';

import { I18N_KEYS } from '@/shared/i18n';
import { buildMatchRuleset, buildScoreboard } from '@/tests/msw/matches-domain.fixture';

import { buildRuleFacts, selectMatchRuleset } from './scoreboard-rules.helper';

const t = (key: string, params?: Record<string, string | number>): string =>
  params === undefined ? key : `${key}:${JSON.stringify(params)}`;

function factValue(facts: readonly { key: string; value: string }[], key: string): string {
  return facts.find((fact) => fact.key === key)?.value ?? '';
}

describe('buildRuleFacts', () => {
  it('takes the target from the server projection, never a client default', () => {
    const facts = buildRuleFacts(t, buildScoreboard({ target: 13 }), buildMatchRuleset());

    expect(factValue(facts, 'target')).toBe('13');
  });

  it('prints every published cap from the rule set', () => {
    const facts = buildRuleFacts(t, buildScoreboard(), buildMatchRuleset());

    expect(factValue(facts, 'winBy')).toBe('2');
    expect(factValue(facts, 'hardCap')).toBe('17');
    expect(factValue(facts, 'halftime')).toBe('8');
    expect(factValue(facts, 'periods')).toBe('1');
    expect(factValue(facts, 'softCap')).toBe(`${I18N_KEYS.scoreboard.ruleMinutes}:{"count":75}`);
    expect(factValue(facts, 'timeCap')).toBe(`${I18N_KEYS.scoreboard.ruleMinutes}:{"count":90}`);
  });

  it('says a cap the rule set does not define is not set, never 0', () => {
    const facts = buildRuleFacts(
      t,
      buildScoreboard(),
      buildMatchRuleset({ hardCap: null, timeCapMinutes: null }),
    );

    expect(factValue(facts, 'hardCap')).toBe(I18N_KEYS.scoreboard.ruleUnknown);
    expect(factValue(facts, 'timeCap')).toBe(I18N_KEYS.scoreboard.ruleUnknown);
  });

  it('says every cap is unknown while no rule set is loaded', () => {
    const facts = buildRuleFacts(t, buildScoreboard(), null);

    expect(factValue(facts, 'winBy')).toBe(I18N_KEYS.scoreboard.ruleUnknown);
    expect(factValue(facts, 'softCap')).toBe(I18N_KEYS.scoreboard.ruleUnknown);
  });

  it('takes the timeout allowance from the scoreboard and names the applied cap', () => {
    const facts = buildRuleFacts(t, buildScoreboard({ capApplied: 'soft' }), buildMatchRuleset());

    expect(factValue(facts, 'timeouts')).toBe('2');
    expect(factValue(facts, 'capApplied')).toBe(I18N_KEYS.scoreboard.capSoft);
  });
});

describe('selectMatchRuleset', () => {
  it('matches the rule set the server bound to this match', () => {
    const ruleset = buildMatchRuleset();

    expect(selectMatchRuleset([ruleset], buildScoreboard())).toStrictEqual(ruleset);
  });

  it('returns null when no published version matches', () => {
    expect(
      selectMatchRuleset([buildMatchRuleset({ rulesetVersion: 1 })], buildScoreboard()),
    ).toBeNull();
  });

  it('returns null for a different rule-set key', () => {
    expect(
      selectMatchRuleset([buildMatchRuleset({ rulesetKey: 'other' })], buildScoreboard()),
    ).toBeNull();
  });
});
