import type { CandidateRowView } from '../../types/tryout-candidates-view.types';

export interface CandidateRowProps {
  readonly view: CandidateRowView;
  readonly onSelect: (candidateId: string) => void;
}
