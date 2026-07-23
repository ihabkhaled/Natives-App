import { describe, expect, it } from 'vitest';

import {
  buildPickerBindings,
  buildPickerDescribedBy,
  buildPickerFieldIds,
} from './picker-field.helper';

describe('buildPickerFieldIds', () => {
  it('derives every related id from the one stable field id', () => {
    expect(buildPickerFieldIds('performed-on')).toEqual({
      label: 'performed-on-label',
      value: 'performed-on-value',
      panel: 'performed-on-panel',
      hint: 'performed-on-hint',
      error: 'performed-on-error',
    });
  });
});

describe('buildPickerBindings', () => {
  it('emits nothing optional so Ionic keeps its own defaults', () => {
    expect(buildPickerBindings({ value: '' })).toEqual({});
  });

  it('binds only the attributes the caller actually provided', () => {
    expect(
      buildPickerBindings({
        value: '2026-07-11',
        min: '2020-01-01',
        max: '2026-07-21',
        locale: 'ar',
      }),
    ).toEqual({ value: '2026-07-11', min: '2020-01-01', max: '2026-07-21', locale: 'ar' });
  });
});

describe('buildPickerDescribedBy', () => {
  const ids = buildPickerFieldIds('performed-on');

  it('describes nothing when there is neither hint nor error', () => {
    expect(buildPickerDescribedBy({}, ids)).toBeUndefined();
  });

  it('describes the hint alone', () => {
    expect(buildPickerDescribedBy({ hint: 'Any day up to today' }, ids)).toBe('performed-on-hint');
  });

  it('describes the error alone', () => {
    expect(buildPickerDescribedBy({ errorMessage: 'Too far back' }, ids)).toBe(
      'performed-on-error',
    );
  });

  it('announces the guidance before the failure when both are present', () => {
    expect(buildPickerDescribedBy({ hint: 'Any day up to today', errorMessage: 'Nope' }, ids)).toBe(
      'performed-on-hint performed-on-error',
    );
  });
});
