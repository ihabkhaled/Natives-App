import { IonSelect, IonSelectOption } from '@/packages/ionic';
import { TEST_IDS } from '@/shared/config';
import { AppInput } from '@/shared/ui';

import { type MembershipStatus } from '../../constants/members.constants';
import { MEMBERS_FILTER_ALL_VALUE as ALL } from './members-filter-bar.constants';
import type { MembersFilterBarProps } from './members-filter-bar.types';

/** Directory filter bar: search box plus status and position selects. */
export function MembersFilterBar(props: MembersFilterBarProps): React.JSX.Element {
  const { filter } = props;
  return (
    <div className="app-members-filter-bar flex flex-col gap-2">
      <AppInput
        testId={TEST_IDS.membersSearch}
        label={filter.searchLabel}
        name="members-search"
        value={filter.search}
        placeholder={filter.searchPlaceholder}
        onValueChange={filter.onSearchChange}
      />
      <IonSelect
        data-testid={TEST_IDS.membersStatusFilter}
        label={filter.statusLabel}
        value={filter.status ?? ALL}
        onIonChange={(event) => {
          const value = event.detail.value as string;
          filter.onStatusChange(value === ALL ? null : (value as MembershipStatus));
        }}
      >
        <IonSelectOption value={ALL}>{filter.allLabel}</IonSelectOption>
        {filter.statusOptions.map((option) => (
          <IonSelectOption key={option.value} value={option.value}>
            {option.label}
          </IonSelectOption>
        ))}
      </IonSelect>
      <IonSelect
        data-testid={TEST_IDS.membersPositionFilter}
        label={filter.positionLabel}
        value={filter.position ?? ALL}
        onIonChange={(event) => {
          const value = event.detail.value as string;
          filter.onPositionChange(value === ALL ? null : value);
        }}
      >
        <IonSelectOption value={ALL}>{filter.allLabel}</IonSelectOption>
        {filter.positionOptions.map((position) => (
          <IonSelectOption key={position} value={position}>
            {position}
          </IonSelectOption>
        ))}
      </IonSelect>
    </div>
  );
}
