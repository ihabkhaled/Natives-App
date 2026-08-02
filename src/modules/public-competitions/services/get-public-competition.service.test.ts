import { describe, expect, it } from 'vitest';

import { getPublicCompetition } from './get-public-competition.service';

describe('getPublicCompetition (TODO seam)', () => {
  it('resolves a known slug with empty, not fabricated, result collections', async () => {
    const detail = await getPublicCompetition('eudl-2026');

    expect(detail?.competition.name).toBe('EUDL 2026');
    expect(detail?.matches).toEqual([]);
    expect(detail?.leaderboard).toEqual([]);
  });

  it('resolves null for a slug the showcase does not publish', async () => {
    await expect(getPublicCompetition('worlds-1998')).resolves.toBeNull();
  });

  it('resolves null for an empty slug rather than guessing a competition', async () => {
    await expect(getPublicCompetition('')).resolves.toBeNull();
  });
});
