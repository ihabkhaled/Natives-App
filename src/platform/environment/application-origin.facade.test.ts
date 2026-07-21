import { describe, expect, it } from 'vitest';

import { getApplicationOrigin } from './application-origin.facade';

describe('getApplicationOrigin', () => {
  it('reports the origin the app is served from', () => {
    expect(getApplicationOrigin()).toBe(globalThis.location.origin);
  });
});
