import { describe, expect, it } from 'vitest';

import { AppError } from '@/shared/errors/app.errors';
import { VALID_ATTENDANCE_STATUSES } from '@/tests/msw/setting-values.fixture';

import type { TypedSettingValue } from '../types/setting-values.types';
import {
  alignDraftWithRows,
  collectDraftIssues,
  describeScalePreview,
  describeSubmitError,
  parseRawSettingJson,
  resolveEffectiveFrom,
  weightRowsFromStatuses,
} from './setting-form.helper';

const t = (key: string, params?: Record<string, string | number>): string =>
  params === undefined ? key : `${key}:${Object.values(params).join(',')}`;

const NOW = '2026-07-23T12:00:00.000Z';

describe('resolveEffectiveFrom', () => {
  it('blocks an unset instant with the pick-a-future-moment message', () => {
    const resolved = resolveEffectiveFrom(t, 'en', '', NOW);
    expect(resolved.utcIso).toBeNull();
    expect(resolved.errorMessage).toBe('settingForm.pastError');
    expect(resolved.hint).toContain('—');
  });

  it('converts a future Cairo wall time to strict UTC and shows it', () => {
    const resolved = resolveEffectiveFrom(t, 'en', '2026-08-01T18:00', NOW);
    expect(resolved.utcIso).toBe('2026-08-01T15:00:00.000Z');
    expect(resolved.errorMessage).toBeNull();
    expect(resolved.hint).toBe('settingForm.cairoHint:2026-08-01T15:00:00.000Z');
    expect(resolved.displayValue).not.toBe('');
  });

  it('refuses an instant at or before now', () => {
    expect(resolveEffectiveFrom(t, 'en', '2026-07-23T10:00', NOW).errorMessage).toBe(
      'settingForm.pastError',
    );
  });
});

describe('weightRowsFromStatuses', () => {
  const statuses = VALID_ATTENDANCE_STATUSES as unknown as TypedSettingValue;

  it('derives one row per active counting status, locale-labelled', () => {
    const rows = weightRowsFromStatuses(statuses, 'en');
    expect(rows.map((row) => row.code)).toEqual([
      'present_on_time',
      'present_late',
      'injured',
      'absent',
    ]);
    expect(rows[0]?.label).toBe('On time');
    expect(weightRowsFromStatuses(statuses, 'ar')[0]?.label).toBe('في الموعد');
  });

  it('derives nothing when statuses are not configured', () => {
    expect(weightRowsFromStatuses(null, 'en')).toEqual([]);
  });
});

describe('collectDraftIssues', () => {
  const rows = [
    { code: 'present_on_time', label: 'On time' },
    { code: 'absent', label: 'Absent' },
  ];

  it('translates schema violations', () => {
    const issues = collectDraftIssues(t, 'badge_tiers', { tiers: [] }, null);
    expect(issues).toContain('settingConstraints.tooFewEntries');
  });

  it('flags counting statuses without a weight', () => {
    const issues = collectDraftIssues(
      t,
      'attendance_weights',
      { weights: { present_on_time: 1 } },
      rows,
    );
    expect(issues).toEqual(['settingConstraints.weightsMissingStatus:absent']);
  });

  it('flags an absent weight above a present-family weight', () => {
    const issues = collectDraftIssues(
      t,
      'attendance_weights',
      { weights: { present_on_time: 0.2, absent: 1 } },
      rows,
    );
    expect(issues).toContain('settingConstraints.absentWeightExceedsPresent');
  });

  it('passes a fully covered, sane weighting', () => {
    expect(
      collectDraftIssues(
        t,
        'attendance_weights',
        { weights: { present_on_time: 1, absent: 0 } },
        rows,
      ),
    ).toEqual([]);
  });
});

describe('parseRawSettingJson', () => {
  it('refuses invalid JSON and schema-invalid documents', () => {
    expect(parseRawSettingJson('badge_tiers', '{not json').ok).toBe(false);
    expect(parseRawSettingJson('badge_tiers', '{"tiers":[]}').ok).toBe(false);
  });

  it('accepts a schema-valid document', () => {
    const parsed = parseRawSettingJson(
      'assessment_scale',
      JSON.stringify({ min: 1, max: 5, step: 1 }),
    );
    expect(parsed.ok).toBe(true);
  });
});

describe('describeScalePreview', () => {
  it('previews the point list for the assessment scale only', () => {
    expect(describeScalePreview(t, 'assessment_scale', { min: 1, max: 5, step: 2 })).toBe(
      'settingEditors.scalePreview:3,1 · 3 · 5',
    );
    expect(describeScalePreview(t, 'badge_tiers', { tiers: [] })).toBeNull();
  });

  it('stays quiet while the scale is inverted or stepless', () => {
    expect(describeScalePreview(t, 'assessment_scale', { min: 5, max: 5, step: 1 })).toBeNull();
    expect(describeScalePreview(t, 'assessment_scale', { min: 1, max: 5, step: 0 })).toBeNull();
  });

  it('caps a very long preview at 25 points', () => {
    const preview = describeScalePreview(t, 'assessment_scale', { min: 0, max: 100, step: 1 });
    expect(preview).toContain('scalePreview:25');
  });
});

describe('alignDraftWithRows', () => {
  it('drops stale weight keys outside the derived rows', () => {
    const aligned = alignDraftWithRows(
      'attendance_weights',
      { weights: { present_on_time: 1, retired_code: 0.5 } },
      [{ code: 'present_on_time', label: 'On time' }],
    );
    expect(aligned).toEqual({ weights: { present_on_time: 1 } });
  });

  it('returns the draft untouched when already aligned or not weights', () => {
    const weights = { weights: { present_on_time: 1 } };
    expect(
      alignDraftWithRows('attendance_weights', weights, [
        { code: 'present_on_time', label: 'On time' },
      ]),
    ).toBe(weights);
    const tiers = { tiers: [] };
    expect(alignDraftWithRows('badge_tiers', tiers, null)).toBe(tiers);
  });
});

describe('describeSubmitError', () => {
  it('names the stale-head refusal specifically', () => {
    const stale = new AppError({
      code: 'CONFLICT',
      messageKey: 'errors.teams.settingVersionStale',
    });
    expect(describeSubmitError(t, stale)).toBe('settingForm.staleToast');
  });

  it('names a duplicate-instant conflict', () => {
    expect(describeSubmitError(t, new AppError({ code: 'CONFLICT' }))).toBe(
      'settingForm.conflictToast',
    );
  });

  it('falls back to the generic failure line', () => {
    expect(describeSubmitError(t, new Error('boom'))).toBe('adminSettings.addVersionFailedToast');
  });
});
