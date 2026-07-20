import type { CandidateRowView } from '../../types/tryouts-view.types';

export interface TryoutCandidateListProps {
  readonly items: readonly CandidateRowView[];
  readonly emptyLabel: string;
  readonly onSelect: (candidateId: string) => void;
  readonly onCheckIn: (candidateId: string) => void;
}
