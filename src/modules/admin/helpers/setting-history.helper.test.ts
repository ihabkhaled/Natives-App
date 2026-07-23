import { describe, expect, it, vi } from 'vitest';

import { VALID_BADGE_TIERS } from '@/tests/msw/setting-values.fixture';

import type { SettingVersion } from '../types/admin.types';
import type { BadgeTiersValue } from '../types/setting-values.types';
import {
  buildSettingHistory,
  resolveHeadVersionId,
  type SettingHistoryContext,
} from './setting-history.helper';

const t = (key: string, params?: Record<string, string | number>): string =>
  params === undefined ? key : `${key}:${Object.values(params).join(',')}`;

const TIERS = VALID_BADGE_TIERS as unknown as BadgeTiersValue;
const NOW = '2026-07-23T12:00:00.000Z';

function version(overrides: Partial<SettingVersion>): SettingVersion {
  return {
    id: 'sv-1',
    settingKey: 'badge_tiers',
    effectiveFrom: '2026-01-01T00:00:00.000Z',
    value: { state: 'valid', value: TIERS },
    note: null,
    createdBy: null,
    createdAt: '2025-12-20T00:00:00.000Z',
    ...overrides,
  };
}

function context(overrides: Partial<SettingHistoryContext> = {}): SettingHistoryContext {
  return {
    t,
    formatInstant: (iso) => `at:${iso}`,
    nowIso: NOW,
    canManage: true,
    cancellingId: null,
    onCancel: vi.fn(),
    onReplace: vi.fn(),
    ...overrides,
  };
}

const SCHEDULED = version({ id: 'sv-3', effectiveFrom: '2026-09-01T00:00:00.000Z' });
const CURRENT = version({
  id: 'sv-2',
  effectiveFrom: '2026-06-01T00:00:00.000Z',
  value: { state: 'valid', value: { tiers: TIERS.tiers.slice(0, 2) } },
  createdBy: 'user-admin-1',
  note: 'Trimmed gold',
});
const PAST = version({ id: 'sv-1' });

describe('buildSettingHistory', () => {
  const history = buildSettingHistory(context(), [PAST, SCHEDULED, CURRENT]);

  it('orders newest first and labels Scheduled / Current / Past', () => {
    expect(history.entries.map((entry) => entry.id)).toEqual(['sv-3', 'sv-2', 'sv-1']);
    expect(history.entries.map((entry) => entry.stateLabel)).toEqual([
      'settingHistory.stateScheduled',
      'settingHistory.stateCurrent',
      'settingHistory.statePast',
    ]);
  });

  it('offers cancel only on the scheduled entry, for a manager', () => {
    expect(history.entries[0]?.cancelLabel).toBe('settingHistory.cancel');
    expect(history.entries[1]?.cancelLabel).toBeNull();
    history.entries[0]?.onCancel?.();
  });

  it('shows actor and reason honestly', () => {
    expect(history.entries[1]?.actorLabel).toBe('settingHistory.actor:user-admin-1');
    expect(history.entries[1]?.noteLabel).toBe('adminSettings.versionNoteLabel: Trimmed gold');
    expect(history.entries[2]?.actorLabel).toBe('settingHistory.actorUnknown');
    expect(history.entries[2]?.noteLabel).toBe('adminSettings.versionNoNote');
  });

  it('diffs each entry against its chronological predecessor by stable key', () => {
    const scheduledDiff = history.entries[0]?.diffRows ?? [];
    expect(scheduledDiff.some((row) => row.label === 'gold')).toBe(true);
    expect(history.entries[2]?.diffRows).toEqual([]);
  });

  it('summarizes valid entries as human copy', () => {
    expect(history.entries[0]?.summary).toBe('settingSummary.tiers:3,500');
  });

  it('says "no effective change" for an identical successor', () => {
    const twin = version({ id: 'sv-4', effectiveFrom: '2026-06-02T00:00:00.000Z' });
    const twinBase = version({ id: 'sv-5', effectiveFrom: '2026-06-01T00:00:00.000Z' });
    const entries = buildSettingHistory(context(), [twin, twinBase]).entries;
    expect(entries[0]?.diffEmptyLabel).toBe('settingHistory.diffNone');
  });

  it('hides cancel without the manage grant', () => {
    const readOnly = buildSettingHistory(context({ canManage: false }), [SCHEDULED]);
    expect(readOnly.entries[0]?.cancelLabel).toBeNull();
    expect(readOnly.entries[0]?.onCancel).toBeNull();
  });

  it('marks the entry being cancelled', () => {
    const busy = buildSettingHistory(context({ cancellingId: 'sv-3' }), [SCHEDULED]);
    expect(busy.entries[0]?.isCancelling).toBe(true);
  });

  it('names the empty history honestly', () => {
    expect(buildSettingHistory(context(), []).emptyLabel).toBe('settingHistory.empty');
  });
});

describe('legacy entries', () => {
  const legacy = version({
    id: 'sv-legacy',
    effectiveFrom: '2026-05-01T00:00:00.000Z',
    value: { state: 'legacy', raw: { logo: 'default' } },
  });

  it('chips Legacy, discloses the raw document, and offers replace', () => {
    const onReplace = vi.fn();
    const entry = buildSettingHistory(context({ onReplace }), [legacy, PAST]).entries[0]!;
    expect(entry.stateLabel).toBe('settingHistory.stateLegacy');
    expect(entry.summary).toBeNull();
    expect(entry.legacy!.rawJson).toContain('"logo"');
    expect(entry.legacy!.replaceLabel).toBe('settingHistory.legacyReplace');
    entry.legacy!.onReplace!();
    expect(onReplace).toHaveBeenCalledTimes(1);
  });

  it('keeps the raw document visible but not the replace CTA for read-only', () => {
    const entries = buildSettingHistory(context({ canManage: false }), [legacy]).entries;
    expect(entries[0]?.legacy?.replaceLabel).toBeNull();
    expect(entries[0]?.legacy?.onReplace).toBeNull();
  });

  it('declares a diff against a legacy predecessor not comparable', () => {
    const successor = version({ id: 'sv-after', effectiveFrom: '2026-06-01T00:00:00.000Z' });
    const entries = buildSettingHistory(context(), [successor, legacy]).entries;
    expect(entries[0]?.notComparableLabel).toBe('settingHistory.diffNotComparable');
    expect(entries[0]?.diffRows).toEqual([]);
  });
});

describe('resolveHeadVersionId', () => {
  it('returns the newest version id, or null for none', () => {
    expect(resolveHeadVersionId([PAST, SCHEDULED, CURRENT])).toBe('sv-3');
    expect(resolveHeadVersionId([])).toBeNull();
  });
});
