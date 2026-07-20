import { describe, expect, it } from 'vitest';

import { buildCompetition } from '../../../../tests/factories/competitions.factory';
import {
  COMPETITION_STATUS_LABEL_KEYS,
  COMPETITION_TYPE_LABEL_KEYS,
} from '../constants/competitions-labels.constants';
import { ALL_FILTER, COMPETITION_STATUSES } from '../constants/competitions.constants';
import {
  buildCompetitionCard,
  buildFilterOptions,
  buildWindowLabel,
  matchesFilter,
  orNotRecorded,
} from './competition-view.helper';

const t = (key: string): string => key;
const day = (isoDate: string): string => `day:${isoDate}`;

describe('buildFilterOptions', () => {
  it('puts "all" first and translates every vocabulary value', () => {
    const options = buildFilterOptions(
      t,
      COMPETITION_STATUSES,
      COMPETITION_STATUS_LABEL_KEYS,
      'competitions.filterAll',
    );

    expect(options[0]).toEqual({ value: ALL_FILTER, label: 'competitions.filterAll' });
    expect(options).toHaveLength(COMPETITION_STATUSES.length + 1);
  });

  it('falls back to the raw value when no label key is mapped', () => {
    const options = buildFilterOptions(t, ['mystery'], {}, 'competitions.filterAll');

    expect(options[1]).toEqual({ value: 'mystery', label: 'mystery' });
  });
});

describe('matchesFilter', () => {
  it('matches everything under the all sentinel', () => {
    expect(matchesFilter('draft', ALL_FILTER)).toBe(true);
  });

  it('narrows to an exact value otherwise', () => {
    expect(matchesFilter('draft', 'draft')).toBe(true);
    expect(matchesFilter('active', 'draft')).toBe(false);
  });
});

describe('buildWindowLabel', () => {
  it('says the dates are unpublished rather than rendering an empty range', () => {
    const label = buildWindowLabel(t, day, buildCompetition({ startsOn: null, endsOn: null }));

    expect(label).toBe('competitions.windowOpenEnded');
  });

  it('renders an open-ended window with a dash on the missing side', () => {
    expect(buildWindowLabel(t, day, buildCompetition({ endsOn: null }))).toBe('day:2026-09-04 – —');
    expect(buildWindowLabel(t, day, buildCompetition({ startsOn: null }))).toBe(
      '— – day:2026-12-18',
    );
  });

  it('renders both dates when both are published', () => {
    expect(buildWindowLabel(t, day, buildCompetition())).toBe('day:2026-09-04 – day:2026-12-18');
  });
});

describe('orNotRecorded', () => {
  it('reports a missing or blank value as not recorded', () => {
    expect(orNotRecorded(t, null)).toBe('competitions.notRecorded');
    expect(orNotRecorded(t, '   ')).toBe('competitions.notRecorded');
  });

  it('passes a real value through untouched', () => {
    expect(orNotRecorded(t, 'EFDF')).toBe('EFDF');
  });
});

describe('buildCompetitionCard', () => {
  it('resolves every label from the competition record', () => {
    const card = buildCompetitionCard(t, day, buildCompetition());

    expect(card).toMatchObject({
      id: 'comp-1',
      name: 'Cairo Ultimate League',
      typeLabel: COMPETITION_TYPE_LABEL_KEYS.league,
      statusLabel: COMPETITION_STATUS_LABEL_KEYS.active,
      statusTone: 'success',
      organizerLabel: 'EFDF',
      divisionLabel: 'mixed',
    });
  });

  it('never invents an organizer or a division', () => {
    const card = buildCompetitionCard(
      t,
      day,
      buildCompetition({ organizerName: null, genderDivision: null }),
    );

    expect(card.organizerLabel).toBe('competitions.notRecorded');
    expect(card.divisionLabel).toBe('competitions.notRecorded');
  });
});
