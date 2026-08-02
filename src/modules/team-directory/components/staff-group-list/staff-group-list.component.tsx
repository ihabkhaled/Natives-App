import { IonText } from '@/packages/ionic';
import { TEST_IDS } from '@/shared/config';

import { DirectoryCardGrid } from '../directory-card-grid';
import type { StaffGroupListProps } from './staff-group-list.types';

/** The season board, one titled band per responsibility. */
export function StaffGroupList(props: StaffGroupListProps): React.JSX.Element {
  return (
    <div className="app-team-groups">
      {props.groups.map((group) => (
        <section
          key={group.key}
          className="app-team-group"
          aria-label={group.heading}
          data-testid={TEST_IDS.teamDirectoryStaffGroup}
        >
          <IonText>
            <h3 className="app-team-group__title m-0">{group.heading}</h3>
          </IonText>
          <DirectoryCardGrid cards={group.cards} ariaLabel={group.heading} />
        </section>
      ))}
    </div>
  );
}
