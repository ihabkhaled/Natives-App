import { getAppHttpClient } from '@/packages/http';
import type { SchemaOutput } from '@/packages/schema';

import {
  publicTryoutEventsPath,
  publicTryoutRegistrationsPath,
  tryoutCandidatePath,
  tryoutCandidatesPath,
  tryoutCheckInPath,
  tryoutConversionPath,
  tryoutDecisionPath,
  tryoutEvaluationsPath,
  tryoutPath,
  tryoutsPath,
} from '../constants/tryouts-api.constants';
import { CANDIDATE_PAGE_PARAMS, EVENT_PAGE_PARAMS } from '../constants/tryout-request.constants';
import {
  candidateDetailResponseSchema,
  candidateListResponseSchema,
  conversionResponseSchema,
  registrationResponseSchema,
  tryoutEventListResponseSchema,
  tryoutEventResponseSchema,
} from '../schemas/tryout.schema';
import type {
  DecideCandidateCommand,
  RegisterCandidateCommand,
  SaveEvaluationCommand,
} from '../types/tryouts.types';

type EventListDto = SchemaOutput<typeof tryoutEventListResponseSchema>;
type EventDto = SchemaOutput<typeof tryoutEventResponseSchema>;
type CandidateListDto = SchemaOutput<typeof candidateListResponseSchema>;
type CandidateDetailDto = SchemaOutput<typeof candidateDetailResponseSchema>;
type RegistrationDto = SchemaOutput<typeof registrationResponseSchema>;
type ConversionDto = SchemaOutput<typeof conversionResponseSchema>;

/** Public: the events a candidate may register for. No session required. */
export function requestPublicTryoutEvents(): Promise<EventListDto> {
  return getAppHttpClient().get(publicTryoutEventsPath(), tryoutEventListResponseSchema, {
    params: EVENT_PAGE_PARAMS,
  });
}

/** Public: register, with the consent version the candidate accepted. */
export function requestRegisterCandidate(
  command: RegisterCandidateCommand,
): Promise<RegistrationDto> {
  return getAppHttpClient().post(
    publicTryoutRegistrationsPath(),
    {
      tryoutId: command.tryoutId,
      fullName: command.fullName,
      preferredName: command.preferredName,
      email: command.email,
      phone: command.phone,
      birthYear: command.birthYear,
      consentVersion: command.consentVersion,
      consentGiven: command.consentGiven,
    },
    registrationResponseSchema,
  );
}

export function requestTryouts(teamId: string): Promise<EventListDto> {
  return getAppHttpClient().get(tryoutsPath(teamId), tryoutEventListResponseSchema, {
    params: EVENT_PAGE_PARAMS,
  });
}

export function requestTryout(teamId: string, tryoutId: string): Promise<EventDto> {
  return getAppHttpClient().get(tryoutPath(teamId, tryoutId), tryoutEventResponseSchema);
}

/** The privacy-safe candidate list: no contacts and no readiness fields. */
export function requestTryoutCandidates(
  teamId: string,
  tryoutId: string,
): Promise<CandidateListDto> {
  return getAppHttpClient().get(
    tryoutCandidatesPath(teamId, tryoutId),
    candidateListResponseSchema,
    { params: CANDIDATE_PAGE_PARAMS },
  );
}

export function requestTryoutCandidate(
  teamId: string,
  tryoutId: string,
  candidateId: string,
): Promise<CandidateDetailDto> {
  return getAppHttpClient().get(
    tryoutCandidatePath(teamId, tryoutId, candidateId),
    candidateDetailResponseSchema,
  );
}

export function requestCheckInCandidate(
  teamId: string,
  tryoutId: string,
  candidateId: string,
): Promise<CandidateDetailDto> {
  return getAppHttpClient().post(
    tryoutCheckInPath(teamId, tryoutId, candidateId),
    {},
    candidateDetailResponseSchema,
  );
}

export function requestSaveEvaluation(
  teamId: string,
  tryoutId: string,
  command: SaveEvaluationCommand,
): Promise<CandidateDetailDto> {
  return getAppHttpClient().post(
    tryoutEvaluationsPath(teamId, tryoutId, command.candidateId),
    { scores: command.scores.map((item) => ({ ...item })), note: command.note },
    candidateDetailResponseSchema,
  );
}

export function requestDecideCandidate(
  teamId: string,
  tryoutId: string,
  command: DecideCandidateCommand,
): Promise<CandidateDetailDto> {
  return getAppHttpClient().post(
    tryoutDecisionPath(teamId, tryoutId, command.candidateId),
    { outcome: command.outcome, reason: command.reason },
    candidateDetailResponseSchema,
  );
}

/** Conversion is idempotent: a second call reports `alreadyConverted`. */
export function requestConvertCandidate(
  teamId: string,
  tryoutId: string,
  candidateId: string,
): Promise<ConversionDto> {
  return getAppHttpClient().post(
    tryoutConversionPath(teamId, tryoutId, candidateId),
    {},
    conversionResponseSchema,
  );
}
