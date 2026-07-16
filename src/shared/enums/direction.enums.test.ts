import { describe, expect, it } from 'vitest';

import { TEXT_DIRECTION } from './direction.enums';

describe('TEXT_DIRECTION', () => {
  it('pins the values written to the document dir attribute', () => {
    expect(TEXT_DIRECTION).toEqual({ LeftToRight: 'ltr', RightToLeft: 'rtl' });
  });
});
