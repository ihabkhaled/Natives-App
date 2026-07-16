import { describe, expect, it } from 'vitest';

import { APP_PATHS } from '@/shared/config';

import { settingsPath } from './settings.paths';

describe('settingsPath', () => {
  it('derives the settings route from the canonical route table', () => {
    expect(settingsPath()).toBe(APP_PATHS.settings);
    expect(settingsPath()).toBe('/settings');
  });
});
