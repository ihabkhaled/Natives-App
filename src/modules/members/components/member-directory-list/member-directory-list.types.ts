import type { MemberCardView } from '../../types/members-view.types';

export interface MemberDirectoryListProps {
  readonly items: readonly MemberCardView[];
  readonly heightPx: number;
  readonly rosterLabel: string;
  readonly onSelect: (membershipId: string) => void;
}
