import { AppVirtualList } from '@/packages/virtual-list';
import { TEST_IDS } from '@/shared/config';

import { MemberCard } from '../member-card';
import type { MemberDirectoryListProps } from './member-directory-list.types';
import type { MemberCardView } from '../../types/members-view.types';

/**
 * Virtualized member directory; the members module owns the virtual list. The
 * initial item count paints the whole bounded page up front so the roster is
 * server-render and assistive-tech friendly; placeholder rows (no bound item
 * yet) render nothing until their data is available.
 */
export function MemberDirectoryList(props: MemberDirectoryListProps): React.JSX.Element {
  return (
    <div aria-label={props.rosterLabel}>
      <AppVirtualList
        items={props.items}
        heightPx={props.heightPx}
        testId={TEST_IDS.membersList}
        initialItemCount={props.items.length}
        renderItem={(card: MemberCardView | undefined) =>
          card === undefined ? null : <MemberCard card={card} onSelect={props.onSelect} />
        }
      />
    </div>
  );
}
