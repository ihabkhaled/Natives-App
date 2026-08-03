import type * as TeamDirectoryModule from '@/modules/team-directory';
import { resetTeamDirectoryDouble } from '../../../../tests/setup/team-directory-double.helper';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getPublicCompetition } from './get-public-competition.service';

// jscpd:ignore-start
// vitest hoists a vi.mock factory to the top of the file that declares it, so
// this cannot move into a shared helper — only the reset it pairs with can.
vi.mock('@/modules/team-directory', async (importOriginal) => {
  const actual = await importOriginal<typeof TeamDirectoryModule>();
  return { ...actual, requestPublicTeamDirectory: vi.fn() };
});
// jscpd:ignore-end

beforeEach(resetTeamDirectoryDouble);

describe('getPublicCompetition', () => {
  it('resolves a known slug with empty, not fabricated, result collections', async () => {
    const detail = await getPublicCompetition('eudl-2026');

    expect(detail?.competition.name).toBe('EUDL 2026');
    expect(detail?.matches).toEqual([]);
    expect(detail?.leaderboard).toEqual([]);
  });

  it('resolves null for a slug the team has not entered', async () => {
    await expect(getPublicCompetition('worlds-1998')).resolves.toBeNull();
  });

  it('resolves null for an empty slug rather than guessing a competition', async () => {
    await expect(getPublicCompetition('')).resolves.toBeNull();
  });
});
