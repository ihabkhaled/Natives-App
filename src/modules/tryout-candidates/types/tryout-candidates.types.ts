import type { SchemaOutput } from '@/packages/schema';

import type {
  CANDIDATE_DISCLOSURE_BLOCKS,
  TRYOUT_CANDIDATE_CONTACT_CHANNELS,
  TRYOUT_CANDIDATE_READINESS_LEVELS,
  TRYOUT_CANDIDATE_STATUSES,
} from '../constants/tryout-candidates.constants';
import type {
  listTryoutCandidatesResponseSchema,
  tryoutCandidateResponseSchema,
  tryoutRetentionResponseSchema,
} from '../schemas/tryout-candidates.schema';

export type CandidateStatus = (typeof TRYOUT_CANDIDATE_STATUSES)[number];
export type CandidateReadiness = (typeof TRYOUT_CANDIDATE_READINESS_LEVELS)[number];
export type CandidateContactChannel = (typeof TRYOUT_CANDIDATE_CONTACT_CHANNELS)[number];
export type CandidateDisclosureBlock = (typeof CANDIDATE_DISCLOSURE_BLOCKS)[number];

export type TryoutCandidate = SchemaOutput<typeof tryoutCandidateResponseSchema>;
export type TryoutCandidatesPage = SchemaOutput<typeof listTryoutCandidatesResponseSchema>;
export type TryoutRetentionReport = SchemaOutput<typeof tryoutRetentionResponseSchema>;

/** One page request against the team's candidate list. */
export interface TryoutCandidatesQuery {
  readonly teamId: string;
  readonly limit: number;
  readonly offset: number;
}

/**
 * Withdrawing one candidate. The reason is mandatory — a withdrawal is
 * recorded against a member of the public, so the record says who decided and
 * why. `expectedRecordVersion` is the optimistic guard: the server refuses the
 * write when someone else moved the same candidate first.
 */
export interface WithdrawCandidateCommand {
  readonly teamId: string;
  readonly candidateId: string;
  readonly reason: string;
  readonly expectedRecordVersion: number;
}
