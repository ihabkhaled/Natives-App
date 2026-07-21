import { I18N_KEYS, type I18nKey } from '@/shared/i18n';

/** Trim and collapse a field to null when the user left it blank. */
export function normalizeOptional(value: string): string | null {
  const trimmed = value.trim();
  return trimmed === '' ? null : trimmed;
}

export interface TeamFormErrors {
  readonly slug: I18nKey | null;
  readonly name: I18nKey | null;
}

/** Slug and name are the only fields the create endpoint actually requires. */
export function validateTeamForm(slug: string, name: string, isCreate: boolean): TeamFormErrors {
  return {
    slug: isCreate && slug.trim() === '' ? I18N_KEYS.teamsAdmin.slugRequired : null,
    name: name.trim() === '' ? I18N_KEYS.teamsAdmin.nameRequired : null,
  };
}

export function isTeamFormValid(errors: TeamFormErrors): boolean {
  return errors.slug === null && errors.name === null;
}

export interface SeasonFormErrors {
  readonly slug: I18nKey | null;
  readonly name: I18nKey | null;
  readonly startsOn: I18nKey | null;
  readonly endsOn: I18nKey | null;
}

/**
 * Season validation. The ordering rule is checked here as well as server-side:
 * an end date before its start is the mistake people actually make, and
 * catching it at the edge explains it in place instead of as a 400.
 */
export function validateSeasonForm(
  slug: string,
  name: string,
  startsOn: string,
  endsOn: string,
): SeasonFormErrors {
  const missingDates = startsOn === '' || endsOn === '';
  const outOfOrder = !missingDates && endsOn <= startsOn;
  return {
    slug: slug.trim() === '' ? I18N_KEYS.seasonsAdmin.slugRequired : null,
    name: name.trim() === '' ? I18N_KEYS.seasonsAdmin.nameRequired : null,
    startsOn: startsOn === '' ? I18N_KEYS.seasonsAdmin.datesRequired : null,
    endsOn:
      endsOn === ''
        ? I18N_KEYS.seasonsAdmin.datesRequired
        : outOfOrder
          ? I18N_KEYS.seasonsAdmin.datesOutOfOrder
          : null,
  };
}

export function isSeasonFormValid(errors: SeasonFormErrors): boolean {
  return (
    errors.slug === null &&
    errors.name === null &&
    errors.startsOn === null &&
    errors.endsOn === null
  );
}
