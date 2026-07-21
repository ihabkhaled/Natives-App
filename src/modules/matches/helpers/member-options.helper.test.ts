import { describe, expect, it } from 'vitest';

import { I18N_KEYS } from '@/shared/i18n';

import { UNATTRIBUTED_VALUE } from '../constants/matches-view.constants';
import { buildMemberOptions, buildNameResolver } from './member-options.helper';

const t = (key: string): string => key;
const MEMBERS = [
  { membershipId: 'mem-omar', displayName: 'Omar Hassan' },
  { membershipId: 'mem-nadia', displayName: 'Nadia Fouad' },
] as const;

describe('buildMemberOptions', () => {
  it('always offers "not attributed" first', () => {
    const options = buildMemberOptions(t, []);

    expect(options).toStrictEqual([
      { value: UNATTRIBUTED_VALUE, label: I18N_KEYS.scoreboard.unattributed },
    ]);
  });

  it('lists every directory member after it', () => {
    const options = buildMemberOptions(t, MEMBERS as never);

    expect(options.map((option) => option.value)).toStrictEqual([
      UNATTRIBUTED_VALUE,
      'mem-omar',
      'mem-nadia',
    ]);
  });
});

describe('buildNameResolver', () => {
  it('resolves a known membership to its display name', () => {
    expect(buildNameResolver(MEMBERS as never)('mem-omar')).toBe('Omar Hassan');
  });

  it('keeps an unresolved membership visible under its id', () => {
    expect(buildNameResolver(MEMBERS as never)('mem-unknown')).toBe('mem-unknown');
  });
});
