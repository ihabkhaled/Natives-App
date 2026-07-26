import { describe, expect, it } from 'vitest';

import { APP_PATHS } from '@/shared/config';

import { reportsPagePath } from './reports.paths';

describe('reports paths', () => {
  it('derives the target from the canonical route table', () => {
    expect(reportsPagePath()).toBe(APP_PATHS.reports);
  });
});
