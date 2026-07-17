import { describe, expect, it } from 'vitest';

import { API_MODE } from './api-mode.enums';

describe('API_MODE', () => {
  it('pins the values accepted by the environment schema', () => {
    expect(API_MODE).toEqual({ Mock: 'mock', Remote: 'remote' });
  });
});
