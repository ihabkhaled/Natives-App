import { describe, expect, it } from 'vitest';

import { APP_PATHS } from '@/shared/config';

import { teamDirectoryPath } from './team-directory.paths';

describe('teamDirectoryPath', () => {
  it('resolves the canonical public team route', () => {
    expect(teamDirectoryPath()).toBe(APP_PATHS.team);
    expect(teamDirectoryPath()).toBe('/team');
  });
});
