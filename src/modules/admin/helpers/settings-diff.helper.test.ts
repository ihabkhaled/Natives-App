import { describe, expect, it } from 'vitest';

import {
  VALID_ATTENDANCE_STATUSES,
  VALID_NOTIFICATION_RULES,
  VALID_REPORT_BRANDING,
  VALID_ROSTER_LIMITS,
  VALID_SESSION_TYPES,
} from '@/tests/msw/setting-values.fixture';

import type {
  AttendanceStatusesValue,
  BadgeTiersValue,
  TypedSettingValue,
} from '../types/setting-values.types';
import { diffSettingValues } from './settings-diff.helper';

const STATUSES = VALID_ATTENDANCE_STATUSES as unknown as AttendanceStatusesValue;

const TIERS: BadgeTiersValue = {
  tiers: [
    { key: 'bronze', labelEn: 'Bronze', labelAr: 'برونزي', threshold: 100, color: 'accent2' },
    { key: 'silver', labelEn: 'Silver', labelAr: 'فضي', threshold: 250, color: 'neutral' },
  ],
};

describe('diffSettingValues', () => {
  it('reports no entries when nothing effectively changed', () => {
    expect(diffSettingValues('attendance_statuses', STATUSES, { ...STATUSES })).toEqual([]);
  });

  it('reports a pure reorder as reordered, never remove + add', () => {
    const reordered: AttendanceStatusesValue = {
      statuses: [...STATUSES.statuses].reverse(),
    };
    const entries = diffSettingValues('attendance_statuses', STATUSES, reordered);
    expect(entries).toHaveLength(1);
    expect(entries[0]?.kind).toBe('reordered');
  });

  it('compares list entries by stable code, field by field', () => {
    const relabelled: AttendanceStatusesValue = {
      statuses: STATUSES.statuses.map((entry) =>
        entry.code === 'absent' ? { ...entry, labelEn: 'Away' } : entry,
      ),
    };
    const entries = diffSettingValues('attendance_statuses', STATUSES, relabelled);
    expect(entries).toEqual([
      { kind: 'changed', label: 'absent · labelEn', before: 'Absent', after: 'Away' },
    ]);
  });

  it('reports added and removed entries by identity', () => {
    const entries = diffSettingValues('badge_tiers', TIERS, {
      tiers: [
        TIERS.tiers[0]!,
        { key: 'gold', labelEn: 'Gold', labelAr: 'ذهبي', threshold: 500, color: 'warning' },
      ],
    });
    expect(entries).toContainEqual({
      kind: 'removed',
      label: 'silver',
      before: 'silver',
      after: null,
    });
    expect(entries).toContainEqual({ kind: 'added', label: 'gold', before: null, after: 'gold' });
  });

  it('diffs weight scalars by status code', () => {
    const entries = diffSettingValues(
      'attendance_weights',
      { weights: { present_on_time: 1, absent: 0 } },
      { weights: { present_on_time: 0.9, present_late: 0.5 } },
    );
    expect(entries).toContainEqual({
      kind: 'changed',
      label: 'present_on_time',
      before: '1',
      after: '0.9',
    });
    expect(entries).toContainEqual({ kind: 'removed', label: 'absent', before: '0', after: null });
    expect(entries).toContainEqual({
      kind: 'added',
      label: 'present_late',
      before: null,
      after: '0.5',
    });
  });

  it('diffs scale scalars and bands', () => {
    const entries = diffSettingValues(
      'assessment_scale',
      { min: 1, max: 5, step: 1 },
      {
        min: 1,
        max: 10,
        step: 1,
        bands: [{ key: 'solid', labelEn: 'Solid', labelAr: 'ثابت', from: 1, to: 5 }],
      },
    );
    expect(entries).toContainEqual({ kind: 'changed', label: 'max', before: '5', after: '10' });
    expect(entries).toContainEqual({ kind: 'added', label: 'solid', before: null, after: 'solid' });
  });

  it('diffs roster bounds and position caps by path and key', () => {
    const next = {
      ...(VALID_ROSTER_LIMITS as unknown as TypedSettingValue),
      roster: { min: 10, max: 30 },
      perPosition: [{ positionKey: 'handler', max: 9 }],
    };
    const entries = diffSettingValues(
      'roster_limits',
      VALID_ROSTER_LIMITS as unknown as TypedSettingValue,
      next,
    );
    expect(entries).toContainEqual({
      kind: 'changed',
      label: 'roster.max',
      before: '27',
      after: '30',
    });
    expect(entries).toContainEqual({
      kind: 'changed',
      label: 'handler · max',
      before: '8',
      after: '9',
    });
    expect(entries).toContainEqual({
      kind: 'removed',
      label: 'cutter',
      before: 'cutter',
      after: null,
    });
  });

  it('diffs bare roster bounds without any position caps', () => {
    const entries = diffSettingValues(
      'roster_limits',
      { roster: { max: 20 } },
      { roster: { max: 25 } },
    );
    expect(entries).toEqual([{ kind: 'changed', label: 'roster.max', before: '20', after: '25' }]);
  });

  it('diffs notification rules by event and quiet hours by path', () => {
    const base = VALID_NOTIFICATION_RULES as unknown as TypedSettingValue;
    const entries = diffSettingValues('notification_rules', base, {
      rules: [
        {
          event: 'practice_reminder',
          enabled: true,
          channels: ['push', 'email'],
          leadHours: 12,
          recipients: 'members',
        },
        { event: 'attendance_finalized', enabled: false, channels: [], recipients: 'staff' },
      ],
    });
    expect(entries).toContainEqual({
      kind: 'changed',
      label: 'practice_reminder · channels',
      before: 'push',
      after: 'push+email',
    });
    expect(entries).toContainEqual({
      kind: 'changed',
      label: 'practice_reminder · leadHours',
      before: '24',
      after: '12',
    });
    expect(entries).toContainEqual({
      kind: 'removed',
      label: 'quietHours.start',
      before: '22:00',
      after: null,
    });
  });

  it('diffs branding and session-type fields', () => {
    const brandingEntries = diffSettingValues(
      'report_branding',
      VALID_REPORT_BRANDING as unknown as TypedSettingValue,
      { displayName: 'Ultimate Natives', accentColor: '#000000' },
    );
    expect(brandingEntries).toContainEqual({
      kind: 'changed',
      label: 'accentColor',
      before: '#1B7F4D',
      after: '#000000',
    });
    const typeEntries = diffSettingValues(
      'session_types',
      VALID_SESSION_TYPES as unknown as TypedSettingValue,
      {
        types: [
          {
            code: 'practice',
            labelEn: 'Practice',
            labelAr: 'تدريب',
            color: 'primary',
            defaultDurationMinutes: 90,
            active: true,
          },
          {
            code: 'scrimmage',
            labelEn: 'Scrimmage',
            labelAr: 'مباراة ودية',
            color: 'accent1',
            active: true,
          },
        ],
      },
    );
    expect(typeEntries).toEqual([
      { kind: 'changed', label: 'practice · defaultDurationMinutes', before: '120', after: '90' },
    ]);
  });
});
