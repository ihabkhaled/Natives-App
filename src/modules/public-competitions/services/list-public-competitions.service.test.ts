import { describe, expect, it } from 'vitest';

import { listPublicCompetitions } from './list-public-competitions.service';

describe('listPublicCompetitions (TODO seam)', () => {
  it('resolves the two competitions the team actually entered', async () => {
    const competitions = await listPublicCompetitions();

    expect(competitions.map((entry) => entry.slug)).toEqual(['eunc-2026', 'eudl-2026']);
    expect(competitions.map((entry) => entry.name)).toEqual(['EUNC 2026', 'EUDL 2026']);
  });

  it('invents no result for a competition whose standing is unpublished', async () => {
    const competitions = await listPublicCompetitions();

    for (const competition of competitions) {
      expect(competition.rank).toBeNull();
      expect(competition.entrantCount).toBeNull();
      expect(competition.location).toBeNull();
      expect(competition.format).toBeNull();
    }
  });

  it('makes no network request while the showcase endpoint is unbuilt', async () => {
    // A gateway call would need a stubbed http client to resolve; this one
    // resolves against nothing at all, which is the whole point of the seam.
    await expect(listPublicCompetitions()).resolves.toHaveLength(2);
  });
});
