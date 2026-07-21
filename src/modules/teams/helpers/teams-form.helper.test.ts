import { describe, expect, it } from 'vitest';

import { I18N_KEYS } from '@/shared/i18n';

import { toSeasonFormValues, toTeamFormValues } from './editor-seed.helper';
import {
  isSeasonFormValid,
  isTeamFormValid,
  normalizeOptional,
  validateSeasonForm,
  validateTeamForm,
} from './teams-form.helper';

describe('normalizeOptional', () => {
  it('collapses a blank field to null rather than an empty string', () => {
    expect(normalizeOptional('   ')).toBeNull();
    expect(normalizeOptional('')).toBeNull();
  });

  it('trims a real value', () => {
    expect(normalizeOptional('  Africa/Cairo ')).toBe('Africa/Cairo');
  });
});

describe('validateTeamForm', () => {
  it('requires the slug only while creating: it is immutable afterwards', () => {
    expect(validateTeamForm('', 'Name', true).slug).toBe(I18N_KEYS.teamsAdmin.slugRequired);
    expect(validateTeamForm('', 'Name', false).slug).toBeNull();
  });

  it('always requires a name', () => {
    expect(validateTeamForm('slug', '   ', true).name).toBe(I18N_KEYS.teamsAdmin.nameRequired);
  });

  it('accepts a complete create form', () => {
    const errors = validateTeamForm('un', 'Ultimate Natives', true);
    expect(isTeamFormValid(errors)).toBe(true);
  });

  it('rejects an incomplete form', () => {
    expect(isTeamFormValid(validateTeamForm('', '', true))).toBe(false);
  });
});

describe('validateSeasonForm', () => {
  it('requires a slug, a name, and both dates', () => {
    const errors = validateSeasonForm('', '', '', '');
    expect(errors.slug).toBe(I18N_KEYS.seasonsAdmin.slugRequired);
    expect(errors.name).toBe(I18N_KEYS.seasonsAdmin.nameRequired);
    expect(errors.startsOn).toBe(I18N_KEYS.seasonsAdmin.datesRequired);
    expect(errors.endsOn).toBe(I18N_KEYS.seasonsAdmin.datesRequired);
    expect(isSeasonFormValid(errors)).toBe(false);
  });

  it('refuses an end date that does not fall after the start', () => {
    expect(validateSeasonForm('s', 'n', '2026-06-30', '2026-01-01').endsOn).toBe(
      I18N_KEYS.seasonsAdmin.datesOutOfOrder,
    );
    expect(validateSeasonForm('s', 'n', '2026-01-01', '2026-01-01').endsOn).toBe(
      I18N_KEYS.seasonsAdmin.datesOutOfOrder,
    );
  });

  it('accepts a well-ordered window', () => {
    const errors = validateSeasonForm('2026', 'Season 2026', '2026-01-01', '2026-12-31');
    expect(isSeasonFormValid(errors)).toBe(true);
  });

  it('reports "dates required" rather than "out of order" when one is missing', () => {
    expect(validateSeasonForm('s', 'n', '2026-01-01', '').endsOn).toBe(
      I18N_KEYS.seasonsAdmin.datesRequired,
    );
  });
});

describe('toTeamFormValues', () => {
  it('starts blank for a new team', () => {
    expect(toTeamFormValues(null)).toEqual({
      slug: '',
      name: '',
      timezone: '',
      locale: '',
      color: '',
    });
  });

  it('seeds from the team being edited, with no colour becoming blank', () => {
    expect(
      toTeamFormValues({
        id: 't',
        slug: 'un',
        name: 'Ultimate Natives',
        locale: 'en',
        timezone: 'Africa/Cairo',
        primaryColor: null,
        status: 'active',
        updatedAtIso: '2026-01-01T00:00:00.000Z',
        version: 1,
      }),
    ).toEqual({
      slug: 'un',
      name: 'Ultimate Natives',
      timezone: 'Africa/Cairo',
      locale: 'en',
      color: '',
    });
  });
});

describe('toSeasonFormValues', () => {
  it('starts a new season as a draft so it is not live the moment it is saved', () => {
    expect(toSeasonFormValues(null)).toEqual({
      slug: '',
      name: '',
      startsOn: '',
      endsOn: '',
      status: 'draft',
    });
  });

  it('seeds from the season being edited', () => {
    expect(
      toSeasonFormValues({
        id: 's',
        teamId: 't',
        slug: '2026',
        name: 'Season 2026',
        startsOn: '2026-01-01',
        endsOn: '2026-12-31',
        status: 'closed',
        version: 2,
      }),
    ).toEqual({
      slug: '2026',
      name: 'Season 2026',
      startsOn: '2026-01-01',
      endsOn: '2026-12-31',
      status: 'closed',
    });
  });
});
