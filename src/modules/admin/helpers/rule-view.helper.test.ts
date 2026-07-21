import { describe, expect, it, vi } from 'vitest';

import { buildGovernedRule } from '../../../../tests/factories/admin.factory';
import type { SimulationResult } from '../types/admin.types';

import {
  buildEntryRows,
  buildRuleRows,
  buildSimulationActions,
  buildSimulationRows,
  buildTransitionActions,
} from './rule-view.helper';

const t = (key: string): string => key;

const BASE_TRANSITION = { hasSimulated: false, canManage: true, isRunning: false };

describe('buildRuleRows', () => {
  it('marks the selected rule and labels its status and window', () => {
    const rows = buildRuleRows(
      t,
      [
        buildGovernedRule({
          ruleId: 'a',
          status: 'published',
          effectiveFrom: '2026-01-01',
          effectiveTo: '2026-12-31',
        }),
      ],
      'a',
    );

    expect(rows[0]?.isSelected).toBe(true);
    expect(rows[0]?.statusLabel).toBe('adminRules.statusPublished');
    expect(rows[0]?.statusTone).toBe('success');
    expect(rows[0]?.effectiveLabel).toBe('adminRules.effectiveWindow');
  });

  it('describes an open-ended window and an unset one distinctly', () => {
    expect(
      buildRuleRows(t, [buildGovernedRule({ effectiveFrom: '2026-01-01' })], '')[0]?.effectiveLabel,
    ).toBe('adminRules.effectiveOpenEnded');
    expect(buildRuleRows(t, [buildGovernedRule()], '')[0]?.effectiveLabel).toBe(
      'adminRules.effectiveUnset',
    );
  });
});

describe('buildEntryRows', () => {
  it('renders an unscored category as "not scored", never as zero', () => {
    const rows = buildEntryRows(t, [
      { activityCategory: 'gym', points: null, dailyCap: null, cooldownDays: null },
    ]);

    expect(rows[0]?.value).toBe('adminRules.entryUnscored');
    expect(rows[0]?.value).not.toContain('0');
  });

  it('renders a scored category with its cap and cooldown', () => {
    const rows = buildEntryRows(t, [
      { activityCategory: 'practice', points: 10, dailyCap: 1, cooldownDays: 2 },
    ]);

    expect(rows[0]?.value).toBe('adminRules.entryPoints');
    expect(rows[0]?.detail).toBe('adminRules.entryDailyCap · adminRules.entryCooldown');
  });

  it('states plainly when there is no cap and no cooldown', () => {
    const rows = buildEntryRows(t, [
      { activityCategory: 'practice', points: 5, dailyCap: null, cooldownDays: null },
    ]);

    expect(rows[0]?.detail).toBe('adminRules.entryNoCap · adminRules.entryNoCooldown');
  });
});

describe('buildTransitionActions', () => {
  it('offers only approve from a draft', () => {
    const actions = buildTransitionActions(t, { ...BASE_TRANSITION, status: 'draft' }, vi.fn());

    expect(actions.map((action) => action.key)).toEqual(['approve']);
  });

  it('offers publish and revert from an approved version', () => {
    const actions = buildTransitionActions(t, { ...BASE_TRANSITION, status: 'approved' }, vi.fn());

    expect(actions.map((action) => action.key)).toEqual(['publish', 'revert']);
  });

  it('offers only retire from a published version, and nothing from a retired one', () => {
    expect(
      buildTransitionActions(t, { ...BASE_TRANSITION, status: 'published' }, vi.fn()).map(
        (action) => action.key,
      ),
    ).toEqual(['retire']);
    expect(buildTransitionActions(t, { ...BASE_TRANSITION, status: 'retired' }, vi.fn())).toEqual(
      [],
    );
  });

  it('blocks publish until a dry run has been seen', () => {
    const blocked = buildTransitionActions(
      t,
      { ...BASE_TRANSITION, status: 'approved', hasSimulated: false },
      vi.fn(),
    );
    const allowed = buildTransitionActions(
      t,
      { ...BASE_TRANSITION, status: 'approved', hasSimulated: true },
      vi.fn(),
    );

    expect(blocked.find((action) => action.key === 'publish')?.disabled).toBe(true);
    expect(allowed.find((action) => action.key === 'publish')?.disabled).toBe(false);
  });

  it('leaves revert available without a dry run', () => {
    const actions = buildTransitionActions(t, { ...BASE_TRANSITION, status: 'approved' }, vi.fn());

    expect(actions.find((action) => action.key === 'revert')?.disabled).toBe(false);
  });

  it('blocks every transition for a read-only principal or an in-flight command', () => {
    expect(
      buildTransitionActions(
        t,
        { ...BASE_TRANSITION, status: 'draft', canManage: false },
        vi.fn(),
      )[0]?.disabled,
    ).toBe(true);
    expect(
      buildTransitionActions(
        t,
        { ...BASE_TRANSITION, status: 'draft', isRunning: true },
        vi.fn(),
      )[0]?.disabled,
    ).toBe(true);
  });

  it('emits the chosen transition', () => {
    const select = vi.fn();
    buildTransitionActions(t, { ...BASE_TRANSITION, status: 'draft' }, select)[0]?.onSelect();

    expect(select).toHaveBeenCalledWith('approve');
  });
});

describe('buildSimulationRows', () => {
  const result: SimulationResult = {
    membershipId: 'm-1',
    draft: { completeness: 0.82, confidence: 'medium', formulaVersion: 3 },
    published: { completeness: 0.7, confidence: 'low', formulaVersion: 1 },
    delta: 6,
  };

  it('says the rule has not been simulated before a dry run', () => {
    const rows = buildSimulationRows(t, null);

    expect(rows).toHaveLength(1);
    expect(rows[0]?.value).toBe('adminRules.simulateNotRun');
  });

  it('compares the draft against the published baseline', () => {
    const rows = buildSimulationRows(t, result);

    expect(rows.map((row) => row.key)).toEqual(['draft', 'published', 'delta']);
    expect(rows[2]?.value).toBe('6');
  });

  it('states there is no baseline instead of showing a zero delta', () => {
    const rows = buildSimulationRows(t, { ...result, published: null, delta: null });

    expect(rows[1]?.value).toBe('adminRules.simulateNoBaseline');
    expect(rows[2]?.value).toBe('adminRules.simulateNoBaseline');
  });
});

describe('buildSimulationActions', () => {
  it('requires a member before the dry run may be started', () => {
    expect(
      buildSimulationActions(t, {
        memberValue: '',
        memberOptions: [],
        isRunning: false,
        rows: [],
        onMemberChange: vi.fn(),
        onRun: vi.fn(),
      }).validationMessage,
    ).toBe('adminRules.simulateMemberRequired');
  });

  it('clears the validation message once a member is chosen', () => {
    expect(
      buildSimulationActions(t, {
        memberValue: 'm-1',
        memberOptions: [],
        isRunning: false,
        rows: [],
        onMemberChange: vi.fn(),
        onRun: vi.fn(),
      }).validationMessage,
    ).toBeNull();
  });
});
