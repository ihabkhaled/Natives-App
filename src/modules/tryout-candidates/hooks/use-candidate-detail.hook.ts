import { useState } from 'react';

import { useAppQuery } from '@/packages/query';

import { tryoutCandidatesQueryKeys } from '../queries/tryout-candidates.keys';
import { getTryoutCandidate } from '../services/get-tryout-candidate.service';
import type { TryoutCandidate } from '../types/tryout-candidates.types';

export interface CandidateDetailApi {
  readonly selectedId: string;
  readonly candidate: TryoutCandidate | null;
  readonly select: (candidateId: string) => void;
}

/**
 * The selected candidate, read from its own endpoint rather than reused from
 * the list row.
 *
 * The list is a redacted projection: even a reviewer who holds every read
 * grant gets no contact detail until they open one person's record. Fetching
 * the detail on demand keeps that true — nothing restricted is ever pulled for
 * a hundred people at once just because it might be looked at.
 */
export function useCandidateDetail(teamId: string): CandidateDetailApi {
  const [selectedId, setSelectedId] = useState('');

  const query = useAppQuery<TryoutCandidate>({
    queryKey: tryoutCandidatesQueryKeys.detail(teamId, selectedId),
    queryFn: (): Promise<TryoutCandidate> => getTryoutCandidate(teamId, selectedId),
    enabled: selectedId !== '',
  });

  return {
    selectedId,
    candidate: selectedId === '' ? null : (query.data ?? null),
    select: setSelectedId,
  };
}
