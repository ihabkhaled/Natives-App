import type { TranslateParams } from '@/packages/i18n';
import { I18N_KEYS } from '@/shared/i18n';

import { CONTACT_CHANNEL_LABEL_KEYS } from '../constants/tryout-candidates-copy.constants';
import type { TryoutCandidate } from '../types/tryout-candidates.types';
import type { CandidateDisclosureView } from '../types/tryout-candidates-view.types';

type Translate = (key: string, params?: TranslateParams) => string;

/** The grants that decide which blocks this caller may even look at. */
export interface CandidateReadGrants {
  readonly canReadContacts: boolean;
  readonly canReadReadiness: boolean;
}

const KEYS = I18N_KEYS.tryouts;

/**
 * The whole privacy model of this module lives in these two functions.
 *
 * A candidate is a member of the public who handed the club their details.
 * The backend omits the contact and readiness fields for a caller without the
 * matching grant, so this client must tell three states apart:
 *
 *   the field is absent   -> withheld. Say so; never render a blank.
 *   the field is `null`   -> the person left it blank. Say that instead.
 *   the field has a value -> disclosed; render it.
 *
 * Both builders start by discarding the raw field when the grant is missing.
 * That is deliberate: the value is not merely hidden downstream, it is never
 * carried into a view model at all, so no later refactor can leak it. The
 * server's decision and the client's grant must BOTH say yes.
 */
function withGrant<T>(isPermitted: boolean, value: T | undefined): T | undefined {
  return isPermitted ? value : undefined;
}

/** A disclosed value the candidate simply did not supply reads as "not provided". */
function orNotProvided(t: Translate, value: string | null | undefined): string {
  return value === null || value === undefined || value.trim() === ''
    ? t(I18N_KEYS.members.fieldNotProvided)
    : value;
}

/**
 * Contact details, gated on `tryout.contacts.read`.
 *
 * `contactChannel` is the presence sentinel because the contract never sends
 * it as null: absent means withheld, full stop. `contactReference` is the
 * nullable half — a candidate who chose the `none` channel legitimately has no
 * reference, and that reads as "not provided", not as a restriction.
 */
export function buildContactsDisclosure(
  t: Translate,
  candidate: TryoutCandidate,
  isPermitted: boolean,
): CandidateDisclosureView {
  const channel = withGrant(isPermitted, candidate.contactChannel);
  return {
    key: 'contacts',
    heading: t(KEYS.contactsHeading),
    isDisclosed: channel !== undefined,
    withheldTitle: t(KEYS.contactsRestrictedTitle),
    withheldMessage: t(KEYS.contactsRestrictedMessage),
    notice: t(KEYS.contactsAuditNotice),
    facts:
      channel === undefined
        ? []
        : [
            {
              key: 'contact-reference',
              label: t(CONTACT_CHANNEL_LABEL_KEYS[channel]),
              value: orNotProvided(t, candidate.contactReference),
            },
          ],
  };
}

/**
 * Readiness and health notes, gated on `tryout.readiness.read`.
 *
 * `restrictedNotes` is both the sentinel and the rendered field, which makes
 * the distinction exact: `undefined` is withheld, `null` is a candidate who
 * wrote nothing. The four readiness levels themselves are not rendered — the
 * catalog has honest words for only two of them, and labelling half an
 * enumeration is worse than labelling none. See the README.
 */
export function buildReadinessDisclosure(
  t: Translate,
  candidate: TryoutCandidate,
  isPermitted: boolean,
): CandidateDisclosureView {
  const notes = withGrant(isPermitted, candidate.restrictedNotes);
  return {
    key: 'readiness',
    heading: t(KEYS.readinessHeading),
    isDisclosed: notes !== undefined,
    withheldTitle: t(KEYS.readinessRestrictedTitle),
    withheldMessage: t(KEYS.readinessRestrictedMessage),
    notice: t(KEYS.readinessExportNotice),
    facts:
      notes === undefined
        ? []
        : [
            {
              key: 'readiness-notes',
              label: t(KEYS.readinessNotesLabel),
              value: notes ?? t(KEYS.readinessNone),
            },
          ],
  };
}

/** Both restricted blocks, in the order the detail panel renders them. */
export function buildCandidateDisclosures(
  t: Translate,
  candidate: TryoutCandidate,
  grants: CandidateReadGrants,
): readonly CandidateDisclosureView[] {
  return [
    buildContactsDisclosure(t, candidate, grants.canReadContacts),
    buildReadinessDisclosure(t, candidate, grants.canReadReadiness),
  ];
}
