import { describe, expect, it } from 'vitest';

import { APP_PATHS } from '@/shared/config';

import {
  ASSESSMENT_ID_PARAM,
  assessmentEntryPath,
  assessmentEntryPattern,
  assessmentsPath,
  assessmentsPattern,
  performancePath,
} from './assessments.paths';

describe('assessments paths', () => {
  it('derives every builder from the canonical route table', () => {
    expect(assessmentsPattern()).toBe(APP_PATHS.assessments);
    expect(assessmentsPath()).toBe(APP_PATHS.assessments);
    expect(assessmentEntryPattern()).toBe(APP_PATHS.assessmentEntry);
    expect(performancePath()).toBe(APP_PATHS.performance);
  });

  it('substitutes the assessment id into the entry pattern', () => {
    expect(assessmentEntryPath('asmt-1')).toBe('/assessments/asmt-1');
  });

  it('encodes an id that would otherwise break the path', () => {
    expect(assessmentEntryPath('a/b?c')).toBe('/assessments/a%2Fb%3Fc');
  });

  it('names the route parameter the guard reads', () => {
    expect(ASSESSMENT_ID_PARAM).toBe('assessmentId');
    expect(APP_PATHS.assessmentEntry).toContain(`:${ASSESSMENT_ID_PARAM}`);
  });
});
