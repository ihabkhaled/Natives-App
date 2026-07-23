import { describe, expect, it } from 'vitest';

import {
  VALID_ASSESSMENT_SCALE,
  VALID_ATTENDANCE_STATUSES,
  VALID_ATTENDANCE_WEIGHTS,
  VALID_BADGE_TIERS,
  VALID_NOTIFICATION_RULES,
  VALID_REPORT_BRANDING,
  VALID_ROSTER_LIMITS,
  VALID_SESSION_TYPES,
  VALID_SETTING_DOCUMENTS,
} from '@/tests/msw/setting-values.fixture';

import { SETTING_KEYS } from '../constants/admin.constants';
import type { TypedSettingValue } from '../types/setting-values.types';
import { describeEffectiveSetting, summarizeSettingValue } from './setting-summary.helper';

const t = (key: string, params?: Record<string, string | number>): string =>
  params === undefined ? key : `${key}[${Object.values(params).join('|')}]`;

function summarize(key: (typeof SETTING_KEYS)[number], value: unknown): string {
  return summarizeSettingValue(t, key, value as TypedSettingValue);
}

describe('summarizeSettingValue', () => {
  it('counts statuses and their active subset', () => {
    expect(summarize('attendance_statuses', VALID_ATTENDANCE_STATUSES)).toBe(
      'settingSummary.statuses[5|5]',
    );
  });

  it('counts session types', () => {
    expect(summarize('session_types', VALID_SESSION_TYPES)).toBe('settingSummary.types[2|2]');
  });

  it('spells the weights out per code', () => {
    expect(summarize('attendance_weights', VALID_ATTENDANCE_WEIGHTS)).toBe(
      'present_on_time 1 · present_late 0.5 · absent 0',
    );
  });

  it('describes the scale with its bands, or without when none exist', () => {
    expect(summarize('assessment_scale', VALID_ASSESSMENT_SCALE)).toBe(
      'settingSummary.scaleBands[1|5|1|3]',
    );
    expect(summarize('assessment_scale', { min: 0, max: 10, step: 2 })).toBe(
      'settingSummary.scale[0|10|2|0]',
    );
  });

  it('describes tiers by count and top threshold', () => {
    expect(summarize('badge_tiers', VALID_BADGE_TIERS)).toBe('settingSummary.tiers[3|500]');
    expect(summarize('badge_tiers', { tiers: [] })).toBe('settingSummary.tiers[0|0]');
  });

  it('describes roster and squad bounds, squad only when configured', () => {
    expect(summarize('roster_limits', VALID_ROSTER_LIMITS)).toBe(
      'settingSummary.rosterMax[27] · settingSummary.rosterSquad[7|15]',
    );
    expect(summarize('roster_limits', { roster: { max: 20 } })).toBe(
      'settingSummary.rosterMax[20]',
    );
    expect(summarize('roster_limits', { roster: { max: 20 }, matchSquad: { max: 12 } })).toBe(
      'settingSummary.rosterMax[20] · settingSummary.rosterSquad[1|12]',
    );
  });

  it('counts enabled notifications', () => {
    expect(summarize('notification_rules', VALID_NOTIFICATION_RULES)).toBe(
      'settingSummary.notifications[1|2]',
    );
  });

  it('names the report with its accent, or alone without one', () => {
    expect(summarize('report_branding', VALID_REPORT_BRANDING)).toBe(
      'settingSummary.branding[Ultimate Natives|#1B7F4D]',
    );
    expect(summarize('report_branding', { displayName: 'Natives' })).toBe('Natives');
  });

  it.each(SETTING_KEYS)('never leaks serialized JSON for %s', (key) => {
    const summary = summarize(key, VALID_SETTING_DOCUMENTS[key]);
    expect(summary).not.toContain('{');
    expect(summary).not.toContain('}');
  });
});

describe('describeEffectiveSetting', () => {
  it('summarizes a healthy valid row with a quiet tone', () => {
    const presentation = describeEffectiveSetting(t, {
      settingKey: 'badge_tiers',
      effectiveFrom: '2026-01-01T00:00:00.000Z',
      value: VALID_BADGE_TIERS as unknown as TypedSettingValue,
      valueState: 'valid',
      issues: [],
    });
    expect(presentation.summary).toBe('settingSummary.tiers[3|500]');
    expect(presentation.tone).toBeNull();
  });

  it('renders legacy honestly with a warning tone', () => {
    const presentation = describeEffectiveSetting(t, {
      settingKey: 'report_branding',
      effectiveFrom: '2026-01-01T00:00:00.000Z',
      value: null,
      valueState: 'legacy',
      issues: [],
    });
    expect(presentation.summary).toBe('settingSummary.legacyValue');
    expect(presentation.tone).toBe('warning');
  });

  it('says not-set for an unconfigured key', () => {
    const presentation = describeEffectiveSetting(t, {
      settingKey: 'badge_tiers',
      effectiveFrom: null,
      value: null,
      valueState: null,
      issues: [],
    });
    expect(presentation.summary).toBe('adminSettings.notSet');
    expect(presentation.tone).toBeNull();
  });

  it('translates snapshot issues and warns about them', () => {
    const presentation = describeEffectiveSetting(t, {
      settingKey: 'attendance_weights',
      effectiveFrom: '2026-02-01T00:00:00.000Z',
      value: VALID_ATTENDANCE_WEIGHTS as unknown as TypedSettingValue,
      valueState: 'valid',
      issues: ['weights_missing_status:injured'],
    });
    expect(presentation.issues).toEqual(['settingConstraints.weightsMissingStatus[injured]']);
    expect(presentation.tone).toBe('warning');
  });
});
