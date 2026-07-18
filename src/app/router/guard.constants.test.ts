import { describe, expect, it } from 'vitest';

import { GUARD_STATUS } from './guard.constants';

describe('GUARD_STATUS', () => {
  it('enumerates a unique, kebab-case outcome for every guard decision', () => {
    const values = Object.values(GUARD_STATUS);

    expect(new Set(values).size).toBe(values.length);
    const malformed = values.filter((value) =>
      value.split('-').some((segment) => !/^[a-z]+$/u.test(segment)),
    );
    expect(malformed).toEqual([]);
  });

  it('keeps the allow outcome distinct from every blocking outcome', () => {
    const blocking = Object.values(GUARD_STATUS).filter((value) => value !== GUARD_STATUS.Allow);

    expect(blocking).not.toContain(GUARD_STATUS.Allow);
    expect(blocking).toHaveLength(Object.values(GUARD_STATUS).length - 1);
  });
});
