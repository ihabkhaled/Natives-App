import { describe, expect, it } from 'vitest';

import { APP_ERROR_CODE } from '@/shared/errors';
import { AppError } from '@/shared/errors/app.errors';

import { invariant } from './invariant.helper';

describe('invariant', () => {
  it('returns silently and narrows the value when the condition holds', () => {
    const value: string | null = 'ready';

    invariant(value, 'value must exist');

    expect(value.length).toBe(5);
  });

  it('accepts any truthy value', () => {
    expect(() => {
      invariant(1, 'number must be truthy');
    }).not.toThrow();
  });

  it('throws an unexpected-coded AppError carrying the message on a falsy condition', () => {
    let thrown: unknown;
    try {
      invariant(false, 'settings store must be initialized');
    } catch (error: unknown) {
      thrown = error;
    }

    expect(thrown).toBeInstanceOf(AppError);
    expect(thrown).toMatchObject({
      code: APP_ERROR_CODE.Unexpected,
      message: 'settings store must be initialized',
    });
  });

  it('rejects every falsy value', () => {
    for (const value of [null, undefined, 0, '', Number.NaN]) {
      expect(() => {
        invariant(value, 'must be present');
      }).toThrow(AppError);
    }
  });
});
