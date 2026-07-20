import { requestConvertCandidate } from '../gateways/tryouts.gateway';
import { runRequest } from '@/shared/errors';
import { mapConversionResult } from '../mappers/tryout.mapper';
import type { ConversionResult } from '../types/tryouts.types';

/** Use case: convert an accepted candidate into a member. Idempotent. */
export function convertCandidate(
  teamId: string,
  tryoutId: string,
  candidateId: string,
): Promise<ConversionResult> {
  return runRequest(async () =>
    mapConversionResult(await requestConvertCandidate(teamId, tryoutId, candidateId)),
  );
}
