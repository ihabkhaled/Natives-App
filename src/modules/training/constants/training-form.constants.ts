import { EVIDENCE_KIND, type EvidenceKind } from './training.constants';

/** Filter sentinel meaning "no status narrowing" on the claim lists. */
export const ALL_STATUS_FILTER = 'all';

/** Raw composer state, kept as strings so a half-typed number stays honest. */
export interface ComposerFormState {
  readonly activityTypeId: string;
  readonly performedOn: string;
  readonly duration: string;
  readonly quantity: string;
  readonly notes: string;
  readonly buddyMembershipIds: readonly string[];
  readonly evidence: readonly EvidenceFormEntry[];
}

/** One evidence row the composer has collected but not yet sent. */
interface EvidenceFormEntry {
  readonly kind: EvidenceKind;
  readonly storageReference: string;
  readonly description: string | null;
}

/** The evidence sub-form's own state, reset after each successful add. */
export interface EvidenceFormState {
  readonly kind: EvidenceKind;
  readonly reference: string;
  readonly description: string;
}

export const EMPTY_COMPOSER_STATE: ComposerFormState = {
  activityTypeId: '',
  performedOn: '',
  duration: '',
  quantity: '',
  notes: '',
  buddyMembershipIds: [],
  evidence: [],
};

export const EMPTY_EVIDENCE_FORM: EvidenceFormState = {
  kind: EVIDENCE_KIND.link,
  reference: '',
  description: '',
};
