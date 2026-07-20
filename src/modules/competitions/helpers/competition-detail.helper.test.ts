import { describe, expect, it } from 'vitest';

import {
  buildCompetition,
  buildFixture,
  buildOpponent,
} from '../../../../tests/factories/competitions.factory';
import type { CompetitionStructure } from '../types/competitions.types';
import {
  buildCompetitionFacts,
  buildCompetitionHeadline,
  buildFixtureRows,
  buildOpponentNameMap,
  buildOpponentRows,
  buildStageRows,
} from './competition-detail.helper';

const t = (key: string): string => key;
const day = (isoDate: string): string => `day:${isoDate}`;
const instant = (iso: string): string => `cairo:${iso}`;

const STRUCTURE: CompetitionStructure = {
  stages: [
    { stageId: 's1', name: 'Group stage', stageFormat: 'group', ordinal: 1 },
    { stageId: 's2', name: 'Knockout', stageFormat: 'knockout', ordinal: 2 },
  ],
  rounds: [
    { roundId: 'r1', stageId: 's1', name: 'Round 1', ordinal: 1 },
    { roundId: 'r2', stageId: 's1', name: 'Round 2', ordinal: 2 },
  ],
};

describe('buildCompetitionFacts', () => {
  it('lists the window, organizer, division, and external reference', () => {
    const facts = buildCompetitionFacts(t, day, buildCompetition());

    expect(facts.map((fact) => fact.key)).toEqual([
      'window',
      'organizer',
      'division',
      'externalRef',
    ]);
    expect(facts[3]?.value).toBe('competitions.notRecorded');
  });
});

describe('buildStageRows', () => {
  it('attaches each stage its own rounds', () => {
    const rows = buildStageRows(t, STRUCTURE);

    expect(rows[0]?.rounds).toEqual(['Round 1', 'Round 2']);
    expect(rows[1]?.rounds).toEqual([]);
    expect(rows[1]?.formatLabel).toBe('competitions.stageFormatKnockout');
  });

  it('returns nothing for a competition with no published structure', () => {
    expect(buildStageRows(t, { stages: [], rounds: [] })).toEqual([]);
  });
});

describe('buildFixtureRows', () => {
  const names = buildOpponentNameMap([buildOpponent()]);

  it('resolves the opponent name and formats the instant in Cairo time', () => {
    const rows = buildFixtureRows(t, instant, [buildFixture()], names);

    expect(rows[0]).toMatchObject({
      opponentName: 'Nile Nomads',
      timeLabel: 'cairo:2026-09-04T15:00:00.000Z',
      homeAwayLabel: 'competitions.fixtureHome',
      venueLabel: 'Maadi pitch 2',
      rescheduleNote: null,
    });
  });

  it('states an unknown opponent rather than leaving the row blank', () => {
    const rows = buildFixtureRows(t, instant, [buildFixture({ opponentId: 'missing' })], names);

    expect(rows[0]?.opponentName).toBe('competitions.opponentUnknown');
  });

  it('states an unassigned venue rather than inventing one', () => {
    const rows = buildFixtureRows(t, instant, [buildFixture({ venueId: null })], names);

    expect(rows[0]?.venueLabel).toBe('competitions.venueUnknown');
  });

  it('keeps reschedule provenance visible, even without a recorded reason', () => {
    const rows = buildFixtureRows(
      t,
      instant,
      [
        buildFixture({
          rescheduleCount: 2,
          rescheduleReason: 'Travel delay',
          status: 'rescheduled',
        }),
        buildFixture({ fixtureId: 'fx-2', rescheduleCount: 1, rescheduleReason: null }),
      ],
      names,
    );

    expect(rows[0]?.rescheduleNote).toBe('competitions.rescheduleNote');
    expect(rows[0]?.statusTone).toBe('warning');
    expect(rows[1]?.rescheduleNote).toBe('competitions.rescheduleNote');
  });
});

describe('buildOpponentRows', () => {
  it('labels active and archived opponents distinctly', () => {
    const rows = buildOpponentRows(t, [
      buildOpponent(),
      buildOpponent({ opponentId: 'opp-2', status: 'archived', shortName: null }),
    ]);

    expect(rows[0]?.statusLabel).toBe('competitions.opponentActive');
    expect(rows[1]?.statusLabel).toBe('competitions.opponentArchived');
    expect(rows[1]?.shortName).toBeNull();
  });
});

describe('buildCompetitionHeadline', () => {
  it('degrades to a titled, tone-neutral header while the record is absent', () => {
    const headline = buildCompetitionHeadline(t, day, null);

    expect(headline).toEqual({
      heading: 'competitions.detailTitle',
      statusLabel: '',
      statusTone: 'medium',
      typeLabel: '',
      cancellationNotice: null,
      description: null,
      facts: [],
    });
  });

  it('surfaces the cancellation reason when there is one', () => {
    const headline = buildCompetitionHeadline(
      t,
      day,
      buildCompetition({ status: 'cancelled', cancellationReason: 'Venue withdrew' }),
    );

    expect(headline.cancellationNotice).toBe('competitions.cancellationNotice');
    expect(headline.statusTone).toBe('danger');
  });

  it('leaves the notice empty for a competition that was never cancelled', () => {
    expect(buildCompetitionHeadline(t, day, buildCompetition()).cancellationNotice).toBeNull();
  });
});
