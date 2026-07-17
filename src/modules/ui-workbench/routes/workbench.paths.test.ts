import { describe, expect, it } from 'vitest';

import { APP_PATHS } from '@/shared/config';

import { workbenchPath } from './workbench.paths';

describe('workbenchPath', () => {
  it('derives the workbench route from the canonical route table', () => {
    expect(workbenchPath()).toBe(APP_PATHS.workbench);
    expect(workbenchPath()).toBe('/workbench');
  });
});
