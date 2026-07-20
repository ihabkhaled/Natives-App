import { describe, expect, it } from 'vitest';

import { METRIC_VALUE_KIND } from '../constants/assessments.constants';
import type { AssessmentValue } from '../types/assessments.types';
import {
  applyDraftEdit,
  clearDraftValue,
  countEvaluated,
  emptyDraftValue,
  isEvaluated,
  isLegacyScoreScale,
  isTextScale,
  parseNumericInput,
  parseTextInput,
  readDraftValue,
  toDraftValues,
  toSaveableValues,
} from './assessment-value.helper';

function serverValue(overrides: Partial<AssessmentValue> = {}): AssessmentValue {
  return {
    metricDefinitionId: 'metric-speed',
    numericValue: null,
    textValue: null,
    note: null,
    confidence: null,
    observationCount: null,
    ...overrides,
  };
}

describe('isEvaluated', () => {
  it('treats a zero score as evaluated', () => {
    expect(
      isEvaluated({ metricDefinitionId: 'm', numericValue: 0, textValue: null, note: null }),
    ).toBe(true);
  });

  it('treats a null score as not evaluated', () => {
    expect(
      isEvaluated({ metricDefinitionId: 'm', numericValue: null, textValue: null, note: null }),
    ).toBe(false);
  });

  it('treats free text as evaluated', () => {
    expect(
      isEvaluated({ metricDefinitionId: 'm', numericValue: null, textValue: 'good', note: null }),
    ).toBe(true);
  });

  it('treats a missing entry as not evaluated', () => {
    expect(isEvaluated(undefined)).toBe(false);
  });
});

describe('parseNumericInput', () => {
  it('keeps an explicit zero', () => {
    expect(parseNumericInput('0')).toBe(0);
  });

  it('maps an empty field to null rather than zero', () => {
    expect(parseNumericInput('')).toBeNull();
    expect(parseNumericInput('   ')).toBeNull();
  });

  it('maps unparseable text to null', () => {
    expect(parseNumericInput('abc')).toBeNull();
  });

  it('parses decimals', () => {
    expect(parseNumericInput(' 4.5 ')).toBe(4.5);
  });
});

describe('parseTextInput', () => {
  it('trims and keeps real text', () => {
    expect(parseTextInput('  strong mark ')).toBe('strong mark');
  });

  it('maps blank text to null', () => {
    expect(parseTextInput('   ')).toBeNull();
  });
});

describe('toDraftValues', () => {
  it('keys by metric and preserves every null', () => {
    const draft = toDraftValues([
      serverValue({ numericValue: 0 }),
      serverValue({ metricDefinitionId: 'metric-stamina' }),
    ]);

    expect(draft['metric-speed']?.numericValue).toBe(0);
    expect(draft['metric-stamina']?.numericValue).toBeNull();
  });
});

describe('readDraftValue', () => {
  it('returns an explicitly unevaluated entry for an unknown metric', () => {
    expect(readDraftValue({}, 'metric-new')).toEqual(emptyDraftValue('metric-new'));
  });

  it('returns the stored entry when present', () => {
    const draft = toDraftValues([serverValue({ numericValue: 3 })]);

    expect(readDraftValue(draft, 'metric-speed').numericValue).toBe(3);
  });
});

describe('applyDraftEdit', () => {
  it('replaces one metric without touching the rest', () => {
    const draft = toDraftValues([
      serverValue({ numericValue: 3 }),
      serverValue({ metricDefinitionId: 'metric-power', numericValue: 2 }),
    ]);

    const next = applyDraftEdit(draft, {
      metricDefinitionId: 'metric-speed',
      numericValue: 5,
      textValue: null,
      note: null,
    });

    expect(next['metric-speed']?.numericValue).toBe(5);
    expect(next['metric-power']?.numericValue).toBe(2);
  });
});

describe('clearDraftValue', () => {
  it('clears to null, never to zero, and keeps the evidence note', () => {
    const draft = toDraftValues([serverValue({ numericValue: 4, note: 'observed twice' })]);

    const next = clearDraftValue(draft, 'metric-speed');

    expect(next['metric-speed']?.numericValue).toBeNull();
    expect(next['metric-speed']?.note).toBe('observed twice');
  });

  it('clears an unknown metric into an explicit not-evaluated entry', () => {
    expect(clearDraftValue({}, 'metric-x')['metric-x']?.numericValue).toBeNull();
  });
});

describe('toSaveableValues', () => {
  it('sends scored zeros and notes but drops untouched metrics', () => {
    const draft = toDraftValues([
      serverValue({ numericValue: 0 }),
      serverValue({ metricDefinitionId: 'metric-stamina' }),
      serverValue({ metricDefinitionId: 'metric-power', note: 'only a note' }),
    ]);

    const saved = toSaveableValues(draft);

    expect(saved.map((value) => value.metricDefinitionId)).toEqual([
      'metric-power',
      'metric-speed',
    ]);
  });
});

describe('countEvaluated', () => {
  it('counts a zero and ignores an unevaluated metric', () => {
    const draft = toDraftValues([
      serverValue({ numericValue: 0 }),
      serverValue({ metricDefinitionId: 'metric-stamina' }),
    ]);

    expect(countEvaluated(draft, ['metric-speed', 'metric-stamina', 'metric-power'])).toBe(1);
  });
});

describe('scale predicates', () => {
  it('classifies text and categorical scales as text input', () => {
    expect(isTextScale(METRIC_VALUE_KIND.Text)).toBe(true);
    expect(isTextScale(METRIC_VALUE_KIND.Categorical)).toBe(true);
    expect(isTextScale(METRIC_VALUE_KIND.Count)).toBe(false);
  });

  it('classifies the legacy evaluator scale', () => {
    expect(isLegacyScoreScale(METRIC_VALUE_KIND.Legacy05)).toBe(true);
    expect(isLegacyScoreScale(METRIC_VALUE_KIND.Timed)).toBe(false);
  });
});
