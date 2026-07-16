import { describe, expect, it } from 'vitest';

import { ARIA_LIVE, MIN_TOUCH_TARGET_PX } from './accessibility.constants';

describe('MIN_TOUCH_TARGET_PX', () => {
  it('pins the WCAG 2.2 AA practical minimum touch target', () => {
    expect(MIN_TOUCH_TARGET_PX).toBe(44);
  });
});

describe('ARIA_LIVE', () => {
  it('pins the politeness values passed to aria-live regions', () => {
    expect(ARIA_LIVE).toEqual({ Polite: 'polite', Assertive: 'assertive' });
  });
});
