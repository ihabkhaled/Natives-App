import type { RosterDetailView } from '../../types/rosters-view.types';

export interface RosterEntryTableProps {
  readonly view: Pick<
    RosterDetailView,
    'entriesHeading' | 'entriesIntro' | 'entriesEmptyLabel' | 'entriesColumns' | 'entries'
  >;
  readonly onRemove: (membershipId: string) => void;
}
