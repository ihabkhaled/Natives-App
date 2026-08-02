import type { DirectoryCardView } from '../../types/team-directory-view.types';

export interface DirectoryCardGridProps {
  readonly cards: readonly DirectoryCardView[];
  /** Already-translated accessible name for the list. */
  readonly ariaLabel: string;
  readonly testId?: string | undefined;
}
