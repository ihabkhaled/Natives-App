import { describe, expect, it } from 'vitest';

import {
  PRACTICE_SCOPE_OPTIONS,
  PRACTICE_TYPE_OPTIONS,
  RSVP_FILTER_OPTIONS,
} from '../constants/practice.constants';
import { buildPracticeFilterOptions } from './practice-filter-options.helper';

const t = (key: string): string => key;

describe('buildPracticeFilterOptions', () => {
  it('builds one labelled option per scope, type, and RSVP status', () => {
    const options = buildPracticeFilterOptions(t);

    expect(options.scope).toHaveLength(PRACTICE_SCOPE_OPTIONS.length);
    expect(options.type).toHaveLength(PRACTICE_TYPE_OPTIONS.length);
    expect(options.rsvp).toHaveLength(RSVP_FILTER_OPTIONS.length);
    expect(options.type[0]?.label).toBe('practice.typePractice');
    expect(options.scope[0]?.value).toBe(PRACTICE_SCOPE_OPTIONS[0]);
  });
});
