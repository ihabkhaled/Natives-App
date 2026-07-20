import { requestRegisterCandidate } from '../gateways/tryouts.gateway';
import { runRequest } from '@/shared/errors';
import { mapRegistrationResult } from '../mappers/tryout.mapper';
import type { RegisterCandidateCommand, RegistrationResult } from '../types/tryouts.types';

/** Use case: public registration with explicit, versioned consent. */
export function registerCandidate(command: RegisterCandidateCommand): Promise<RegistrationResult> {
  return runRequest(async () => mapRegistrationResult(await requestRegisterCandidate(command)));
}
