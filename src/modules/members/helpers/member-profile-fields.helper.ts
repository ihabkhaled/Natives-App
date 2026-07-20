import type { TranslateParams } from '@/packages/i18n';
import { I18N_KEYS } from '@/shared/i18n';

import {
  formatAgeClassification,
  formatGender,
  formatHeight,
  formatWeight,
} from './member-format.helper';
import type { ProfileFieldView } from '../types/members-view.types';
import type { MemberProfile } from '../types/members.types';

type Translate = (key: string, params?: TranslateParams) => string;

/** A field that renders only when the value is present (restricted/optional). */
function optionalField(
  key: string,
  label: string,
  value: string | null,
): readonly ProfileFieldView[] {
  return value === null ? [] : [{ key, label, value }];
}

/** Identity fields visible at every audience; empty shows a truthful fallback. */
function buildCoreFields(t: Translate, profile: MemberProfile): readonly ProfileFieldView[] {
  const notProvided = t(I18N_KEYS.members.fieldNotProvided);
  const positions = profile.positions.length === 0 ? notProvided : profile.positions.join(', ');
  return [
    {
      key: 'fullName',
      label: t(I18N_KEYS.members.fieldFullName),
      value: profile.fullName ?? profile.displayName,
    },
    {
      key: 'nickname',
      label: t(I18N_KEYS.members.fieldNickname),
      value: profile.nickname ?? notProvided,
    },
    {
      key: 'jersey',
      label: t(I18N_KEYS.members.fieldJersey),
      value: profile.jerseyNumber === null ? notProvided : String(profile.jerseyNumber),
    },
    { key: 'positions', label: t(I18N_KEYS.members.fieldPositions), value: positions },
  ];
}

/** Extended profile/contact fields, rendered only when the viewer may see them. */
function buildDetailFields(t: Translate, profile: MemberProfile): readonly ProfileFieldView[] {
  return [
    ...optionalField(
      'preferredName',
      t(I18N_KEYS.members.fieldPreferredName),
      profile.preferredName,
    ),
    ...optionalField('jerseySize', t(I18N_KEYS.members.fieldJerseySize), profile.jerseySize),
    ...optionalField('division', t(I18N_KEYS.members.fieldDivision), profile.division),
    ...optionalField('gender', t(I18N_KEYS.members.fieldGender), formatGender(t, profile.gender)),
    ...optionalField(
      'ageClassification',
      t(I18N_KEYS.members.fieldAgeClassification),
      formatAgeClassification(t, profile.ageClassification),
    ),
    ...optionalField('dateOfBirth', t(I18N_KEYS.members.fieldDateOfBirth), profile.dateOfBirth),
    ...optionalField('height', t(I18N_KEYS.members.fieldHeight), formatHeight(t, profile.heightCm)),
    ...optionalField('weight', t(I18N_KEYS.members.fieldWeight), formatWeight(t, profile.weightKg)),
    ...optionalField('email', t(I18N_KEYS.members.fieldEmail), profile.email),
    ...optionalField('phone', t(I18N_KEYS.members.fieldPhone), profile.phone),
  ];
}

/** The full ordered, audience-shaped field list for a member profile. */
export function buildProfileFields(
  t: Translate,
  profile: MemberProfile,
): readonly ProfileFieldView[] {
  return [...buildCoreFields(t, profile), ...buildDetailFields(t, profile)];
}
