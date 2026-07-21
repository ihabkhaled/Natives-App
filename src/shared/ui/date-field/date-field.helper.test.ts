import { describe, expect, it } from 'vitest';

import {
  buildDateFieldIds,
  buildDatetimeBindings,
  buildTriggerDescribedBy,
  extractDateValue,
} from './date-field.helper';
import type { AppDateFieldProps } from './date-field.types';

const BASE: AppDateFieldProps = {
  label: 'Date performed',
  datetimeId: 'performed-on',
  value: '',
  displayValue: '',
  placeholder: 'Select a date',
  openLabel: 'Open the date picker',
  dialogTitle: 'Choose a date',
  closeLabel: 'Done',
  isOpen: false,
  onOpen: () => undefined,
  onDismiss: () => undefined,
  onValueChange: () => undefined,
};

describe('extractDateValue', () => {
  it('passes a date-only string through unchanged', () => {
    expect(extractDateValue('2026-07-11')).toBe('2026-07-11');
  });

  it('drops a time part so the wire value stays date-only', () => {
    expect(extractDateValue('2026-07-11T00:00:00')).toBe('2026-07-11');
    expect(extractDateValue('2026-07-11T23:59:59.999+02:00')).toBe('2026-07-11');
  });

  it('takes the first entry when the control reports an array', () => {
    expect(extractDateValue(['2026-07-11', '2026-07-12'])).toBe('2026-07-11');
  });

  it('maps a cleared value to an empty string', () => {
    expect(extractDateValue(null)).toBe('');
    expect(extractDateValue(undefined)).toBe('');
    expect(extractDateValue('')).toBe('');
    expect(extractDateValue([])).toBe('');
  });
});

describe('buildDateFieldIds', () => {
  it('derives every related id from the one stable field id', () => {
    expect(buildDateFieldIds('performed-on')).toEqual({
      label: 'performed-on-label',
      value: 'performed-on-value',
      panel: 'performed-on-panel',
      hint: 'performed-on-hint',
      error: 'performed-on-error',
    });
  });
});

describe('buildDatetimeBindings', () => {
  it('emits nothing optional so Ionic keeps its own defaults', () => {
    expect(buildDatetimeBindings(BASE)).toEqual({});
  });

  it('binds only the attributes the caller actually provided', () => {
    expect(
      buildDatetimeBindings({
        ...BASE,
        value: '2026-07-11',
        min: '2020-01-01',
        max: '2026-07-21',
        locale: 'ar',
      }),
    ).toEqual({ value: '2026-07-11', min: '2020-01-01', max: '2026-07-21', locale: 'ar' });
  });
});

describe('buildTriggerDescribedBy', () => {
  const ids = buildDateFieldIds('performed-on');

  it('describes nothing when there is neither hint nor error', () => {
    expect(buildTriggerDescribedBy(BASE, ids)).toBeUndefined();
  });

  it('describes the hint alone', () => {
    expect(buildTriggerDescribedBy({ ...BASE, hint: 'Any day up to today' }, ids)).toBe(
      'performed-on-hint',
    );
  });

  it('describes the error alone', () => {
    expect(buildTriggerDescribedBy({ ...BASE, errorMessage: 'Too far back' }, ids)).toBe(
      'performed-on-error',
    );
  });

  it('announces the guidance before the failure when both are present', () => {
    expect(
      buildTriggerDescribedBy({ ...BASE, hint: 'Any day up to today', errorMessage: 'Nope' }, ids),
    ).toBe('performed-on-hint performed-on-error');
  });
});
