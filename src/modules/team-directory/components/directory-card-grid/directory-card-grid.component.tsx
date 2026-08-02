import { DirectoryCard } from '../directory-card';
import type { DirectoryCardGridProps } from './directory-card-grid.types';

/**
 * The one responsive card grid the directory uses: a single column on phones,
 * two on tablets, three or four on desktop, so cards never stretch into
 * letterboxes on a wide screen.
 */
export function DirectoryCardGrid(props: DirectoryCardGridProps): React.JSX.Element {
  return (
    <ul className="app-team-grid" aria-label={props.ariaLabel} data-testid={props.testId}>
      {props.cards.map((card) => (
        <DirectoryCard key={card.id} card={card} />
      ))}
    </ul>
  );
}
