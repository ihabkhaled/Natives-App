import { describe, expect, it } from 'vitest';

import { parseSettingValue } from './setting-value.helper';

describe('parseSettingValue', () => {
  it('parses an object', () => {
    expect(parseSettingValue('{"max":27}')).toEqual({ ok: true, value: { max: 27 } });
  });

  it('parses an array', () => {
    expect(parseSettingValue('["present","late"]')).toEqual({
      ok: true,
      value: ['present', 'late'],
    });
  });

  it('parses a scalar the server may legitimately store', () => {
    expect(parseSettingValue('null')).toEqual({ ok: true, value: null });
  });

  it('reports malformed input instead of throwing', () => {
    expect(parseSettingValue('{not json')).toEqual({ ok: false, value: null });
  });

  it('reports empty input as malformed', () => {
    expect(parseSettingValue('').ok).toBe(false);
  });
});
