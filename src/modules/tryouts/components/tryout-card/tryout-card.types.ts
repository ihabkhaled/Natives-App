import type { TryoutCardView } from '../../types/tryouts-view.types';

export interface TryoutCardProps {
  readonly item: TryoutCardView;
  readonly onOpen: (tryoutId: string) => void;
}
