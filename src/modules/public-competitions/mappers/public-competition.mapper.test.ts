import { describe, expect, it, vi } from 'vitest';

import type { PublicCompetitionSummaryDto } from '../types/public-showcase.types';
import { toPublicCompetitionCardView } from './public-competition.mapper';

const translate = vi.fn((key: string, params?: Record<string, string | number>) =>
  params === undefined ? key : `${key}:${String(params['entrants'])}`,
);

function summary(
  overrides: Partial<PublicCompetitionSummaryDto> = {},
): PublicCompetitionSummaryDto {
  return {
    slug: 'eunc-2026',
    name: 'EUNC 2026',
    year: 2026,
    format: null,
    location: null,
    startDate: null,
    endDate: null,
    rank: null,
    entrantCount: null,
    ...overrides,
  };
}

describe('toPublicCompetitionCardView', () => {
  it('reports an unpublished standing as pending instead of inventing a place', () => {
    const card = toPublicCompetitionCardView(summary(), 'en', translate);

    expect(card.isResultPending).toBe(true);
    expect(card.rankText).toBeNull();
    expect(card.entrantsText).toBeNull();
  });

  it('formats a published finish with its field size', () => {
    const card = toPublicCompetitionCardView(
      summary({ rank: 3, entrantCount: 12 }),
      'en',
      translate,
    );

    expect(card.isResultPending).toBe(false);
    expect(card.rankText).toBe('3');
    expect(card.entrantsText).toBe('publicCompetitions.finishOfEntrants:12');
  });

  it('keeps the year a label rather than a grouped quantity', () => {
    expect(toPublicCompetitionCardView(summary(), 'en', translate).yearText).toBe('2026');
  });

  it('resolves the public detail path from the slug', () => {
    expect(toPublicCompetitionCardView(summary(), 'en', translate).detailPath).toBe(
      '/results/eunc-2026',
    );
  });

  it('leaves unpublished facts null so the screen can say so', () => {
    const card = toPublicCompetitionCardView(summary(), 'en', translate);

    expect(card.formatText).toBeNull();
    expect(card.locationText).toBeNull();
    expect(card.datesText).toBeNull();
  });

  it('renders a two-ended date range', () => {
    const card = toPublicCompetitionCardView(
      summary({ startDate: '2026-06-12T09:00:00.000Z', endDate: '2026-06-14T09:00:00.000Z' }),
      'en',
      translate,
    );

    expect(card.datesText).toContain('–');
  });

  it('renders a one-day event as a single date, not a range to itself', () => {
    const card = toPublicCompetitionCardView(
      summary({ startDate: '2026-06-12T09:00:00.000Z', endDate: '2026-06-12T20:00:00.000Z' }),
      'en',
      translate,
    );

    expect(card.datesText).not.toContain('–');
  });

  it('renders a start with no published end as that start alone', () => {
    const card = toPublicCompetitionCardView(
      summary({ startDate: '2026-06-12T09:00:00.000Z' }),
      'en',
      translate,
    );

    expect(card.datesText).not.toBeNull();
    expect(card.datesText).not.toContain('–');
  });

  it('renders an end with no published start as that end alone', () => {
    const card = toPublicCompetitionCardView(
      summary({ endDate: '2026-06-14T09:00:00.000Z' }),
      'en',
      translate,
    );

    expect(card.datesText).not.toBeNull();
    expect(card.datesText).not.toContain('–');
  });
});
