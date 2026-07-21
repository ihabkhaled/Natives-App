import { describe, expect, it } from 'vitest';

import { buildAuthMembership } from '../factories/auth.factory';
import { buildTeamOptions, canSwitchTeams } from './team-switcher.helper';

const membership = (overrides: Parameters<typeof buildAuthMembership>[0] = {}) =>
  buildAuthMembership({
    teamId: 'team-1',
    teamName: 'Team One',
    seasonName: 'Season One',
    ...overrides,
  });

describe('buildTeamOptions', () => {
  it('lists one option per membership and marks the active scope', () => {
    const options = buildTeamOptions(
      [membership(), membership({ teamId: 'team-2', teamName: 'Team Two' })],
      'team-2',
    );

    expect(options).toEqual([
      { teamId: 'team-1', name: 'Team One', detail: 'Season One', isActive: false },
      { teamId: 'team-2', name: 'Team Two', detail: 'Season One', isActive: true },
    ]);
  });

  it('leaves a seasonless team without an invented detail line', () => {
    const [option] = buildTeamOptions([membership({ seasonName: null })], 'team-1');

    expect(option?.detail).toBeNull();
  });

  it('marks nothing active when the scope has not resolved yet', () => {
    const options = buildTeamOptions([membership()], '');

    expect(options.every((option) => !option.isActive)).toBe(true);
  });

  it('produces no options for a principal with no membership', () => {
    expect(buildTeamOptions([], '')).toEqual([]);
  });
});

describe('canSwitchTeams', () => {
  it('is false with no team and with exactly one team: neither is a choice', () => {
    expect(canSwitchTeams([])).toBe(false);
    expect(canSwitchTeams([membership()])).toBe(false);
  });

  it('is true once the principal holds more than one team', () => {
    expect(canSwitchTeams([membership(), membership({ teamId: 'team-2' })])).toBe(true);
  });
});
