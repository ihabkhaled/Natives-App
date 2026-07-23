import { describe, expect, it } from 'vitest';

import {
  AUDIT_NONSENSE_PAYLOAD,
  VALID_SETTING_DOCUMENTS,
} from '@/tests/msw/setting-values.fixture';

import { SETTING_KEYS, type SettingKey } from '../constants/admin.constants';
import { parseTypedSettingValue, settingValueSchemas } from './setting-values.schema';

/** The constraint codes a document is refused with ([] means accepted). */
function constraintsOf(key: SettingKey, value: unknown): readonly string[] {
  const parsed = parseTypedSettingValue(key, value);
  return parsed.success ? [] : parsed.issues.map((issue) => issue.message);
}

function withStatuses(overrides: readonly Record<string, unknown>[]): Record<string, unknown> {
  return { statuses: overrides };
}

const STATUS = {
  code: 'present_on_time',
  labelEn: 'On time',
  labelAr: 'في الموعد',
  color: 'success',
  countsTowardMetrics: true,
  allowSelfCheckIn: true,
  active: true,
} as const;

const ABSENT = { ...STATUS, code: 'absent', labelEn: 'Absent', labelAr: 'غائب' } as const;

describe('every setting key', () => {
  it.each(SETTING_KEYS)('accepts the canonical %s document', (key) => {
    expect(constraintsOf(key, VALID_SETTING_DOCUMENTS[key])).toEqual([]);
  });

  it.each(SETTING_KEYS)('refuses an empty object for %s', (key) => {
    expect(constraintsOf(key, {})).not.toEqual([]);
  });

  it.each(SETTING_KEYS)('refuses the audited nonsense payload for %s', (key) => {
    expect(constraintsOf(key, AUDIT_NONSENSE_PAYLOAD)).not.toEqual([]);
  });

  it('exposes one schema per key', () => {
    expect(Object.keys(settingValueSchemas).sort()).toEqual([...SETTING_KEYS].sort());
  });
});

describe('attendance_statuses', () => {
  it('refuses an unexpected extra property (the audit hole, closed)', () => {
    expect(
      constraintsOf('attendance_statuses', { statuses: [STATUS, ABSENT], extra: true }),
    ).not.toEqual([]);
  });

  it('refuses a non-canonical code', () => {
    expect(
      constraintsOf(
        'attendance_statuses',
        withStatuses([STATUS, ABSENT, { ...STATUS, code: 'vibes' }]),
      ),
    ).not.toEqual([]);
  });

  it('refuses duplicate codes', () => {
    expect(constraintsOf('attendance_statuses', withStatuses([STATUS, ABSENT, STATUS]))).toContain(
      'duplicate_code',
    );
  });

  it('requires both poles, active', () => {
    expect(constraintsOf('attendance_statuses', withStatuses([STATUS]))).toContain('missing_pole');
    expect(
      constraintsOf('attendance_statuses', withStatuses([STATUS, { ...ABSENT, active: false }])),
    ).toContain('missing_pole');
  });

  it('requires at least one active counting status', () => {
    expect(
      constraintsOf(
        'attendance_statuses',
        withStatuses([
          { ...STATUS, countsTowardMetrics: false },
          { ...ABSENT, countsTowardMetrics: false },
        ]),
      ),
    ).toContain('no_metric_status');
  });

  it('refuses an empty list and a blank label', () => {
    expect(constraintsOf('attendance_statuses', withStatuses([]))).toContain('too_few_entries');
    expect(
      constraintsOf('attendance_statuses', withStatuses([{ ...STATUS, labelAr: '' }, ABSENT])),
    ).toContain('invalid_label');
  });
});

describe('session_types', () => {
  const TYPE = {
    code: 'practice',
    labelEn: 'Practice',
    labelAr: 'تدريب',
    color: 'primary',
    active: true,
  } as const;

  it('refuses duplicate codes and an all-archived list', () => {
    expect(constraintsOf('session_types', { types: [TYPE, TYPE] })).toContain('duplicate_code');
    expect(constraintsOf('session_types', { types: [{ ...TYPE, active: false }] })).toContain(
      'no_active_entry',
    );
  });

  it('bounds the default duration to a practice slot', () => {
    expect(
      constraintsOf('session_types', { types: [{ ...TYPE, defaultDurationMinutes: 5 }] }),
    ).toContain('out_of_range');
    expect(
      constraintsOf('session_types', { types: [{ ...TYPE, defaultDurationMinutes: 481 }] }),
    ).toContain('out_of_range');
  });

  it('refuses an uppercase or malformed code', () => {
    expect(constraintsOf('session_types', { types: [{ ...TYPE, code: 'Practice' }] })).toContain(
      'invalid_code',
    );
  });
});

describe('attendance_weights', () => {
  it('bounds each weight to [0, 1]', () => {
    expect(constraintsOf('attendance_weights', { weights: { present_on_time: 1.2 } })).toContain(
      'out_of_range',
    );
    expect(constraintsOf('attendance_weights', { weights: { present_on_time: -0.1 } })).toContain(
      'out_of_range',
    );
  });

  it('refuses more than three decimal places', () => {
    expect(
      constraintsOf('attendance_weights', { weights: { present_on_time: 0.12345 } }),
    ).toContain('too_many_decimals');
    expect(constraintsOf('attendance_weights', { weights: { present_on_time: 0.125 } })).toEqual(
      [],
    );
  });

  it('refuses malformed status keys', () => {
    expect(constraintsOf('attendance_weights', { weights: { 'Not A Code': 1 } })).not.toEqual([]);
  });
});

describe('assessment_scale', () => {
  const SCALE = { min: 1, max: 5, step: 1 } as const;
  const BAND = { key: 'solid', labelEn: 'Solid', labelAr: 'ثابت', from: 2, to: 3 } as const;

  it('requires min below max and a dividing step', () => {
    expect(constraintsOf('assessment_scale', { ...SCALE, min: 5 })).toContain('min_not_below_max');
    expect(constraintsOf('assessment_scale', { ...SCALE, step: 3 })).toContain('step_not_divisor');
  });

  it('keeps bands inside the scale, ordered and non-overlapping', () => {
    expect(constraintsOf('assessment_scale', { ...SCALE, bands: [{ ...BAND, to: 9 }] })).toContain(
      'band_outside_scale',
    );
    expect(
      constraintsOf('assessment_scale', { ...SCALE, bands: [{ ...BAND, from: 3, to: 2 }] }),
    ).toContain('band_outside_scale');
    expect(
      constraintsOf('assessment_scale', {
        ...SCALE,
        bands: [BAND, { ...BAND, key: 'elite', from: 3, to: 4 }],
      }),
    ).toContain('band_overlap');
    expect(constraintsOf('assessment_scale', { ...SCALE, bands: [BAND, BAND] })).toContain(
      'duplicate_code',
    );
  });

  it('allows gaps between bands', () => {
    expect(
      constraintsOf('assessment_scale', {
        ...SCALE,
        bands: [BAND, { ...BAND, key: 'elite', from: 5, to: 5 }],
      }),
    ).toEqual([]);
  });

  it('refuses non-integer scale values', () => {
    expect(constraintsOf('assessment_scale', { ...SCALE, step: 0.5 })).toContain('invalid_type');
  });
});

describe('badge_tiers', () => {
  const TIER = {
    key: 'bronze',
    labelEn: 'Bronze',
    labelAr: 'برونزي',
    threshold: 100,
    color: 'accent2',
  } as const;

  it('requires strictly ascending thresholds in array order', () => {
    expect(
      constraintsOf('badge_tiers', { tiers: [TIER, { ...TIER, key: 'silver', threshold: 100 }] }),
    ).toContain('threshold_not_ascending');
    expect(
      constraintsOf('badge_tiers', { tiers: [TIER, { ...TIER, key: 'silver', threshold: 50 }] }),
    ).toContain('threshold_not_ascending');
  });

  it('refuses duplicate keys and out-of-bound thresholds', () => {
    expect(constraintsOf('badge_tiers', { tiers: [TIER, TIER] })).toContain('duplicate_code');
    expect(constraintsOf('badge_tiers', { tiers: [{ ...TIER, threshold: 100_001 }] })).toContain(
      'out_of_range',
    );
  });
});

describe('roster_limits', () => {
  it('keeps min at or below max in each bound', () => {
    expect(constraintsOf('roster_limits', { roster: { min: 30, max: 27 } })).toContain(
      'out_of_range',
    );
  });

  it('keeps the match squad within the roster and above a full line', () => {
    expect(
      constraintsOf('roster_limits', { roster: { max: 27 }, matchSquad: { max: 6 } }),
    ).toContain('squad_below_line');
    expect(
      constraintsOf('roster_limits', { roster: { max: 10 }, matchSquad: { max: 12 } }),
    ).toContain('squad_exceeds_roster');
  });

  it('requires position caps to cover the squad minimum', () => {
    expect(
      constraintsOf('roster_limits', {
        roster: { max: 27 },
        matchSquad: { min: 10, max: 15 },
        perPosition: [{ positionKey: 'handler', max: 3 }],
      }),
    ).toContain('position_cap_below_squad_min');
  });

  it('refuses duplicate position keys and a roster above 100', () => {
    expect(
      constraintsOf('roster_limits', {
        roster: { max: 27 },
        perPosition: [
          { positionKey: 'handler', max: 3 },
          { positionKey: 'handler', max: 4 },
        ],
      }),
    ).toContain('duplicate_code');
    expect(constraintsOf('roster_limits', { roster: { max: 101 } })).toContain('out_of_range');
  });
});

describe('notification_rules', () => {
  const RULE = {
    event: 'practice_change',
    enabled: true,
    channels: ['push'],
    recipients: 'members',
  } as const;
  const REMINDER = { ...RULE, event: 'practice_reminder', leadHours: 24 } as const;

  it('refuses unknown events and duplicate events', () => {
    expect(
      constraintsOf('notification_rules', { rules: [{ ...RULE, event: 'full_moon' }] }),
    ).not.toEqual([]);
    expect(constraintsOf('notification_rules', { rules: [RULE, RULE] })).toContain(
      'duplicate_event',
    );
  });

  it('requires a channel on an enabled rule and no duplicate channels', () => {
    expect(constraintsOf('notification_rules', { rules: [{ ...RULE, channels: [] }] })).toContain(
      'no_channel',
    );
    expect(
      constraintsOf('notification_rules', { rules: [{ ...RULE, channels: ['push', 'push'] }] }),
    ).toContain('duplicate_channel');
  });

  it('requires the lead time exactly where a reminder can lead', () => {
    expect(
      constraintsOf('notification_rules', { rules: [{ ...REMINDER, leadHours: undefined }] }),
    ).toContain('lead_hours_required');
    expect(constraintsOf('notification_rules', { rules: [{ ...RULE, leadHours: 2 }] })).toContain(
      'lead_hours_forbidden',
    );
    expect(
      constraintsOf('notification_rules', { rules: [{ ...REMINDER, leadHours: 0 }] }),
    ).toContain('out_of_range');
    expect(
      constraintsOf('notification_rules', { rules: [{ ...REMINDER, leadHours: 169 }] }),
    ).toContain('out_of_range');
  });

  it('validates quiet hours as distinct HH:mm wall times, overnight allowed', () => {
    expect(
      constraintsOf('notification_rules', {
        rules: [RULE],
        quietHours: { start: '25:00', end: '07:00' },
      }),
    ).toContain('invalid_time');
    expect(
      constraintsOf('notification_rules', {
        rules: [RULE],
        quietHours: { start: '22:00', end: '22:00' },
      }),
    ).toContain('quiet_hours_equal');
    expect(
      constraintsOf('notification_rules', {
        rules: [RULE],
        quietHours: { start: '22:00', end: '07:00' },
      }),
    ).toEqual([]);
  });
});

describe('report_branding', () => {
  it('refuses a blank name, a bad accent, and a bad email', () => {
    expect(constraintsOf('report_branding', { displayName: '   ' })).toContain('blank_text');
    expect(
      constraintsOf('report_branding', { displayName: 'Natives', accentColor: 'green' }),
    ).toContain('invalid_accent_color');
    expect(
      constraintsOf('report_branding', { displayName: 'Natives', contactEmail: 'not-an-email' }),
    ).toContain('invalid_email');
  });

  it('bounds the footer and accepts a minimal document', () => {
    expect(
      constraintsOf('report_branding', { displayName: 'Natives', footerText: 'x'.repeat(201) }),
    ).toContain('out_of_range');
    expect(constraintsOf('report_branding', { displayName: 'Natives' })).toEqual([]);
  });
});
