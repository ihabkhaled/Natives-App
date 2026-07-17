import { describe, expect, it } from 'vitest';

import { WORKBENCH_LIST_SIZE } from './workbench.constants';

describe('WORKBENCH_LIST_SIZE', () => {
  it('is large enough that the list must virtualize to stay responsive', () => {
    expect(WORKBENCH_LIST_SIZE).toBe(500);
  });
});
