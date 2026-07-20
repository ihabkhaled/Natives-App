import type { SchemaOutput } from '@/packages/schema';

import type {
  candidateDetailResponseSchema,
  candidateListResponseSchema,
  conversionResponseSchema,
  registrationResponseSchema,
  tryoutEventListResponseSchema,
  tryoutEventResponseSchema,
} from '../schemas/tryout.schema';
import type {
  CandidateDetail,
  CandidatePage,
  ConversionResult,
  RegistrationResult,
  TryoutEvent,
  TryoutEventPage,
} from '../types/tryouts.types';

type EventDto = SchemaOutput<typeof tryoutEventResponseSchema>;
type EventListDto = SchemaOutput<typeof tryoutEventListResponseSchema>;
type CandidateListDto = SchemaOutput<typeof candidateListResponseSchema>;
type CandidateDetailDto = SchemaOutput<typeof candidateDetailResponseSchema>;
type RegistrationDto = SchemaOutput<typeof registrationResponseSchema>;
type ConversionDto = SchemaOutput<typeof conversionResponseSchema>;

export function mapTryoutEvent(dto: EventDto): TryoutEvent {
  return {
    tryoutId: dto.tryoutId,
    name: dto.name,
    status: dto.status,
    heldAt: dto.heldAt,
    venueName: dto.venueName,
    capacity: dto.capacity,
    registeredCount: dto.registeredCount,
    waitlistedCount: dto.waitlistedCount,
    consentVersion: dto.consentVersion,
  };
}

export function mapTryoutEventPage(dto: EventListDto): TryoutEventPage {
  return { total: dto.total, items: dto.items.map((item) => mapTryoutEvent(item)) };
}

export function mapCandidatePage(dto: CandidateListDto): CandidatePage {
  return {
    total: dto.total,
    items: dto.items.map((item) => ({
      candidateId: item.candidateId,
      reference: item.reference,
      displayName: item.displayName,
      status: item.status,
      checkedInAt: item.checkedInAt,
      evaluationCount: item.evaluationCount,
    })),
  };
}

/**
 * Detail mapping preserves the server's restriction decision: `contacts` and
 * `readiness` stay null when the caller may not read them, and the UI renders
 * an explicit restricted state rather than an empty field.
 */
export function mapCandidateDetail(dto: CandidateDetailDto): CandidateDetail {
  return {
    summary: {
      candidateId: dto.candidate.candidateId,
      reference: dto.candidate.reference,
      displayName: dto.candidate.displayName,
      status: dto.candidate.status,
      checkedInAt: dto.candidate.checkedInAt,
      evaluationCount: dto.candidate.evaluationCount,
    },
    consentVersion: dto.consentVersion,
    consentedAt: dto.consentedAt,
    birthYear: dto.birthYear,
    contacts: dto.contacts === null ? null : { ...dto.contacts },
    readiness: dto.readiness === null ? null : { ...dto.readiness },
    scores: dto.scores.map((score) => ({ criterion: score.criterion, score: score.score })),
    evaluationNote: dto.evaluationNote,
    decision: dto.decision === null ? null : { ...dto.decision },
    convertedMembershipId: dto.convertedMembershipId,
    existingAccount: dto.existingAccount,
  };
}

export function mapRegistrationResult(dto: RegistrationDto): RegistrationResult {
  return {
    outcome: dto.outcome,
    reference: dto.reference,
    consentVersion: dto.consentVersion,
  };
}

export function mapConversionResult(dto: ConversionDto): ConversionResult {
  return { membershipId: dto.membershipId, alreadyConverted: dto.alreadyConverted };
}
