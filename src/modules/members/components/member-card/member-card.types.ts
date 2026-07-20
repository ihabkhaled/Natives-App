import type { MemberCardView } from '../../types/members-view.types';

export interface MemberCardProps {
  readonly card: MemberCardView;
  readonly onSelect: (membershipId: string) => void;
}
