import { describe, expect, it } from 'vitest';

import { APP_PATHS } from '@/shared/config';

import {
  tryoutDetailPath,
  tryoutDetailPattern,
  tryoutRegistrationPath,
  tryoutsPath,
} from './tryouts.paths';

describe('tryout paths', () => {
  it('derives every target from the canonical route table', () => {
    expect(tryoutRegistrationPath()).toBe(APP_PATHS.tryoutRegistration);
    expect(tryoutsPath()).toBe(APP_PATHS.tryouts);
    expect(tryoutDetailPattern()).toBe(APP_PATHS.tryoutDetail);
  });

  it('substitutes and encodes the id in the detail pattern', () => {
    expect(tryoutDetailPath('try-1')).toBe('/tryouts/try-1');
    expect(tryoutDetailPath('a/b')).toBe('/tryouts/a%2Fb');
  });
});
