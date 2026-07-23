import { describe, expect, it } from 'vitest';

import { describeSnapshotIssue, describeValidationIssues } from './setting-validation.helper';

const t = (key: string, params?: Record<string, string | number>): string =>
  params === undefined ? key : `${key}:${Object.values(params).join(',')}`;

describe('describeValidationIssues', () => {
  it('translates known constraint codes and deduplicates repeats', () => {
    const described = describeValidationIssues(t, [
      { path: 'tiers.1', message: 'threshold_not_ascending' },
      { path: 'tiers.2', message: 'threshold_not_ascending' },
      { path: 'statuses', message: 'missing_pole' },
    ]);

    expect(described).toEqual([
      'settingConstraints.thresholdNotAscending',
      'settingConstraints.missingPole',
    ]);
  });

  it('falls back to the generic contract line for zod type errors', () => {
    expect(describeValidationIssues(t, [{ path: 'value', message: 'Invalid input' }])).toEqual([
      'settingConstraints.invalidValue',
    ]);
  });
});

describe('describeSnapshotIssue', () => {
  it('translates a subject-carrying issue with its code', () => {
    expect(describeSnapshotIssue(t, 'weights_missing_status:injured')).toBe(
      'settingConstraints.weightsMissingStatus:injured',
    );
  });

  it('translates a plain issue code', () => {
    expect(describeSnapshotIssue(t, 'statuses_not_configured')).toBe(
      'settingConstraints.statusesNotConfigured',
    );
  });

  it('falls back for an unknown code from a newer backend', () => {
    expect(describeSnapshotIssue(t, 'brand_new_rule:thing')).toBe(
      'settingConstraints.invalidValue',
    );
  });
});
